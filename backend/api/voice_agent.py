# app/routers/voice_agent.py  (extended)

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List, Literal, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import re, logging, asyncio

from services.change_request_notifications import send_change_request_notification
from database import get_db
from services.customer_service import CustomerService
from services.appointment_service import AppointmentService
from services.job_service import ChangeRequestService, JobService                    # <-- make sure this import path matches your project
from utils.appointment_helpers import create_appointment_with_notifications

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice", tags=["voice-agent"])

# ---------- helpers (same as before) ----------
def digits_only(s: Optional[str]) -> Optional[str]:
    return re.sub(r"\D+", "", s or "") or None

def lower(s: Optional[str]) -> Optional[str]:
    return (s or "").strip().lower() or None

def parse_date(s: Optional[str]) -> Optional[str]:
    if not s: return None
    s = s.strip().lower()
    now = datetime.now()
    if s == "today": return now.strftime("%Y-%m-%d")
    if s == "tomorrow": return (now + timedelta(days=1)).strftime("%Y-%m-%d")
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s): return s
    m = re.fullmatch(r"(\d{1,2})/(\d{1,2})/(\d{4})", s)
    if m:
        mm, dd, yy = m.groups()
        return f"{yy}-{int(mm):02d}-{int(dd):02d}"
    return None

def parse_time(s: Optional[str]) -> Optional[str]:
    if not s: return None
    t = s.strip().lower()
    m = re.fullmatch(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)", t)
    if m:
        h = int(m.group(1)); mn = int(m.group(2) or 0); ap = m.group(3)
        if ap == "pm" and h != 12: h += 12
        if ap == "am" and h == 12: h = 0
        return f"{h:02d}:{mn:02d}:00"
    m = re.fullmatch(r"(\d{1,2})(?::(\d{2}))?", t)
    if m:
        h = int(m.group(1)); mn = int(m.group(2) or 0)
        if 0 <= h <= 23 and 0 <= mn <= 59:
            return f"{h:02d}:{mn:02d}:00"
    return None

def pretty(dt_date: str, dt_time: Optional[str]) -> str:
    y, m, d = [int(x) for x in dt_date.split("-")]
    hh, mm = (int(dt_time[:2]), int(dt_time[3:5])) if dt_time else (9, 0)
    dt = datetime(y, m, d, hh, mm)
    return dt.strftime("%A, %B %d, %Y at %I:%M %p ET")

def slot_allowed(dt: datetime) -> bool:
    dow = dt.weekday()  # 0=Mon .. 6=Sun
    if dow == 6:  # Sunday disallowed
        return False
    return 10 <= dt.hour < 22  # 10:00–22:00

# ---------- models ----------
Intent = Literal[
    "find_or_create_customer",
    "schedule_appointment",
    "get_customer_appointments",
    "reschedule_appointment",
            "delete_appointment",
    "available_slots",
    "jobs_lookup",
    "create_change_request",
    "list_change_requests",
]

class AgentRequest(BaseModel):
    intent: Intent
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None

    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    duration_minutes: Optional[int] = 30
    appointment_type: Optional[str] = "consultation"
    from_date: Optional[str] = None

    appointment_id: Optional[int] = None
    new_date: Optional[str] = None
    new_time: Optional[str] = None

    # jobs / change requests
    job_title: Optional[str] = None
    change_title: Optional[str] = None
    change_description: Optional[str] = None
    priority: Optional[Literal["low","normal","high","urgent"]] = "normal"
    session_id: Optional[str] = None
    status_filter: Optional[str] = None

class AgentResponse(BaseModel):
    speak: str
    customer: Optional[Dict[str, Any]] = None
    appointment: Optional[Dict[str, Any]] = None
    appointments: Optional[List[Dict[str, Any]]] = None
    alternatives: Optional[List[str]] = None
    jobs: Optional[List[Dict[str, Any]]] = None
    requests: Optional[List[Dict[str, Any]]] = None
    options: Optional[List[str]] = None       # for disambiguation (job titles)
    error: Optional[str] = None

# ---------- shared customers ----------
def find_customer_only(db: Session, name: Optional[str], email: Optional[str], phone: Optional[str]):
    cs = CustomerService(db)
    if email:
        c = cs.get_customer_by_email(email)
        if c: return c
    if phone:
        ms = cs.get_customers_by_phone(phone)
        if ms: return ms[0]
    if name:
        ms = cs.search_customers_by_name(name)
        if ms: return ms[0]
    return None

def find_or_create_customer(db: Session, name, email, phone, company, notes):
    c = find_customer_only(db, name, email, phone)
    if c: return c
    from schemas.customer import CustomerCreate
    if not (name or email or phone):
        raise HTTPException(status_code=400, detail="Need a name, email, or phone.")
    cs = CustomerService(db)
    return cs.create_customer(CustomerCreate(
        name=name, email=email, phone=phone,
        business_type=company, notes=notes, status="lead"
    ))

# ---------- main endpoint ----------
@router.post("/agent", response_model=AgentResponse)
async def voice_agent(req: AgentRequest, db: Session = Depends(get_db), authorization: Optional[str] = Header(default=None)):
    # if authorization != "Bearer YOUR_SECRET": raise HTTPException(401, "Unauthorized")
    name = (req.name or "").strip() or None
    email = lower(req.email)
    phone = digits_only(req.phone)

    # --- customers & appointments (existing cases) ---
    if req.intent == "find_or_create_customer":
        c = find_or_create_customer(db, name, email, phone, req.company, req.notes)
        who = c.name or "your profile"
        return AgentResponse(speak=f"Great, I found {who}. Would you like to book a time?",
                             customer={"id": c.id, "name": c.name, "email": c.email, "phone": c.phone})

    if req.intent == "schedule_appointment":
        c = find_or_create_customer(db, name, email, phone, req.company, req.notes)
        appt_date = parse_date(req.preferred_date)
        appt_time = parse_time(req.preferred_time) or "10:00:00"
        if not appt_date:
            return AgentResponse(speak="What day would you like? I can book between 10 AM and 10 PM Eastern, Monday through Saturday.",
                                 customer={"id": c.id, "name": c.name}, error="missing_date")
        y, m, d = [int(x) for x in appt_date.split("-")]
        hh, mm = int(appt_time[:2]), int(appt_time[3:5])
        dt = datetime(y, m, d, hh, mm)
        if not slot_allowed(dt):
            cand = []
            t = dt
            while len(cand) < 2:
                t += timedelta(minutes=30)
                if slot_allowed(t):
                    cand.append(t.strftime("%A, %B %d at %I:%M %p ET"))
            return AgentResponse(speak=f"That time isn’t in our booking window. I can do {cand[0]}" + (f" or {cand[1]}" if len(cand)>1 else "") + ". Which works?",
                                 customer={"id": c.id, "name": c.name}, alternatives=cand, error="outside_hours")
        try:
            appt = create_appointment_with_notifications(
                db=db,
                customer_id=c.id,
                scheduled_date=dt,
                duration_minutes=req.duration_minutes or 30,
                appointment_type=req.appointment_type or "consultation",
                customer_notes=req.notes
            )
            when = pretty(appt_date, appt_time)
            return AgentResponse(speak=f"You're set for {when}.",
                                 customer={"id": c.id, "name": c.name, "email": c.email},
                                 appointment={"id": appt.id, "datetime": dt.isoformat(),
                                              "duration_minutes": req.duration_minutes or 30,
                                              "type": req.appointment_type or "consultation"})
        except ValueError:
            asvc = AppointmentService(db)
            recs = asvc.get_recommended_times(dt, req.duration_minutes or 30, 3)
            alts = [r.strftime("%A, %B %d at %I:%M %p ET") for r in recs]
            return AgentResponse(speak=("That time is already booked. " + (" I can do " + " or ".join(alts[:2]) + "." if alts else "")),
                                 customer={"id": c.id, "name": c.name}, alternatives=alts, error="conflict")

    if req.intent == "get_customer_appointments":
        c = find_or_create_customer(db, name, email, phone, req.company, req.notes)
        asvc = AppointmentService(db)
        appts = [a for a in asvc.get_upcoming_appointments() if a.customer_id == c.id]
        if not appts:
            return AgentResponse(speak="I don't see any upcoming appointments. Want to book one?",
                                 customer={"id": c.id, "name": c.name}, appointments=[])
        tops = appts[:3]
        bullets = " ".join(f"• {a.scheduled_date.strftime('%A, %B %d at %I:%M %p ET')}" for a in tops)
        return AgentResponse(speak=f"You have {len(appts)} upcoming appointment{'s' if len(appts)>1 else ''}. {bullets}",
                             customer={"id": c.id, "name": c.name},
                             appointments=[{"id": a.id, "datetime": a.scheduled_date.isoformat(),
                                            "duration_minutes": a.duration_minutes, "type": a.appointment_type,
                                            "status": a.status} for a in appts])

    if req.intent == "reschedule_appointment":
        if not (req.appointment_id and req.new_date and req.new_time):
            raise HTTPException(status_code=400, detail="appointment_id, new_date, and new_time are required.")
        asvc = AppointmentService(db)
        appt = asvc.get_appointment(req.appointment_id)
        if not appt:
            return AgentResponse(speak="I couldn't find that appointment.", error="not_found")
        new_t = parse_time(req.new_time)
        if not new_t:
            return AgentResponse(speak="I didn't catch the time. Please say something like 2:30 PM.", error="bad_time")
        dt_str = parse_date(req.new_date)
        y, m, d = [int(x) for x in dt_str.split("-")]
        hh, mm = int(new_t[:2]), int(new_t[3:5])
        ndt = datetime(y, m, d, hh, mm)
        if not slot_allowed(ndt):
            return AgentResponse(speak="That time is outside our booking hours, 10 AM to 10 PM Eastern Monday through Saturday. Pick another time?", error="outside_hours")
        if not asvc._is_time_available(ndt, appt.duration_minutes):
            recs = asvc.get_recommended_times(ndt, appt.duration_minutes, 3)
            alts = [r.strftime("%A, %B %d at %I:%M %p ET") for r in recs]
            return AgentResponse(speak=f"That time is not available. I can do {alts[0]}" + (f" or {alts[1]}" if len(alts)>1 else "") + ".",
                                 alternatives=alts, error="conflict")
        appt.scheduled_date = ndt
        asvc.update_appointment(appt)
        return AgentResponse(speak=f"Done. You're now set for {ndt.strftime('%A, %B %d at %I:%M %p ET')}.")

    if req.intent == "delete_appointment":
        if not req.appointment_id:
            raise HTTPException(status_code=400, detail="appointment_id is required.")
        asvc = AppointmentService(db)
        appt = asvc.get_appointment(req.appointment_id)
        if not appt:
            return AgentResponse(speak="I couldn't find that appointment.", error="not_found")
        when = appt.scheduled_date.strftime("%A, %B %d at %I:%M %p ET")
        ok = asvc.delete_appointment(req.appointment_id)
        return AgentResponse(speak=("Deleted your appointment for " + when) if ok else "I couldn't delete that appointment. Please try again.")

    if req.intent == "available_slots":
        if not req.date:
            raise HTTPException(status_code=400, detail="date is required")
        asvc = AppointmentService(db)
        target = datetime.strptime(req.date, "%Y-%m-%d")
        slots = asvc.get_available_slots(target, req.duration_minutes or 30) or []
        human = [s.strftime("%I:%M %p") for s in slots]
        if not human:
            return AgentResponse(speak=f"No available slots for {target.strftime('%A, %B %d')}.")
        first_two = human[:2] if len(human) >= 2 else human
        return AgentResponse(speak=f"I can do {first_two[0]}" + (f" or {first_two[1]}" if len(first_two)>1 else "") + ".")

    # --- NEW: Jobs lookup ---
    if req.intent == "jobs_lookup":
        c = find_customer_only(db, name, email, phone)
        if not c:
            return AgentResponse(
                speak="I couldn't find your record. What's the best email on the project?",
                error="not_found"
            )

        jsvc = JobService(db)
        jobs = jsvc.get_active_jobs(c.id) or []
        if not jobs:
            return AgentResponse(
                speak=f"I don't see any active jobs for {c.name or 'your account'}."
            )

        tops = jobs[:2]
        short = " and ".join([f"{j.title} (status {j.status})" for j in tops])
        speak = f"I found {len(jobs)} active project{'s' if len(jobs) > 1 else ''}: {short}."

        return AgentResponse(
            speak=speak + (" Which one would you like details on?" if len(jobs) > 1 else ""),
            customer={"id": c.id, "name": c.name},
            jobs=[{
                "id": j.id,
                "title": j.title,
                "status": j.status,
                "priority": getattr(j, "priority", None),
                # show "72%" or omit if None
                "progress": (f"{int(getattr(j, 'progress_percentage', 0))}%"
                            if getattr(j, "progress_percentage", None) is not None else None)
            } for j in jobs],
            options=[j.title for j in tops] if len(jobs) > 1 else None
        )

    # --- NEW: Create change request ---
    if req.intent == "create_change_request":
        c = find_customer_only(db, name, email, phone)
        if not c:
            return AgentResponse(speak="I couldn't find your customer record. What's the best email to look up?", error="not_found")

        jsvc = JobService(db)
        jobs = jsvc.get_active_jobs(c.id) or []
        if not jobs:
            return AgentResponse(speak="I don't see any active jobs on your account. Change requests are only for active projects.", error="no_active_jobs")

        # choose job
        target = None
        if req.job_title:
            for j in jobs:
                if req.job_title.lower() in j.title.lower():
                    target = j; break
        if not target:
            if len(jobs) == 1:
                target = jobs[0]
            else:
                titles = [j.title for j in jobs[:2]]
                return AgentResponse(
                    speak=f"I see a few active projects: {titles[0]}" + (f" and {titles[1]}" if len(titles)>1 else "") + ". Which one is this for?",
                    options=titles,
                    error="need_job_selection"
                )

        if not (req.change_title and req.change_description):
            return AgentResponse(speak="Please give me a short title and a brief description of the change you'd like.", error="missing_details")

        crsvc = ChangeRequestService(db)
        cr = crsvc.create_change_request(
            job_id=target.id,
            customer_id=c.id,
            title=req.change_title,
            description=req.change_description,
            priority=req.priority or "normal",
            requested_via="voice",
            session_id=req.session_id
        )
        # fire-and-forget notify
        try:
            asyncio.create_task(send_change_request_notification(cr, target, c))
        except Exception:
            logger.exception("notify change request failed")

        return AgentResponse(
            speak=f"Your change request '{req.change_title}' for '{target.title}' has been submitted. Our team will review and follow up.",
            customer={"id": c.id, "name": c.name},
            requests=[{"id": cr.id, "title": cr.title, "status": getattr(cr, 'status', 'pending')}]
        )

    # --- NEW: List change requests ---
    if req.intent == "list_change_requests":
        c = find_customer_only(db, name, email, phone)
        if not c:
            return AgentResponse(speak="I couldn't find your record. What's the best email to look up?", error="not_found")
        crsvc = ChangeRequestService(db)
        reqs = crsvc.get_customer_change_requests(c.id) or []
        if req.status_filter:
            reqs = [r for r in reqs if getattr(r, 'status', None) == req.status_filter]
        if not reqs:
            msg = f"No change requests found" + (f" with status {req.status_filter}" if req.status_filter else "")
            return AgentResponse(speak=msg + ".")
        tops = reqs[:2]
        list_line = " and ".join([f"{r.title} ({getattr(r,'status','pending')})" for r in tops])
        return AgentResponse(
            speak=f"You have {len(reqs)} change request{'s' if len(reqs)>1 else ''}: {list_line}.",
            requests=[{"id": r.id, "title": r.title, "status": getattr(r,'status','pending'),
                       "priority": getattr(r,'priority', None), "job_id": getattr(r,'job_id', None)} for r in reqs]
        )

    # fallback
    return AgentResponse(speak="All set. What would you like to do next?")
