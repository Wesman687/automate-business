from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from database.models import Customer as CustomerModel, Appointment, Job, CustomerChangeRequest
from services.customer_service import CustomerService
from services.appointment_service import AppointmentService
from services.job_service import JobService, ChangeRequestService
from services.change_request_notifications import send_change_request_notification
from utils.appointment_helpers import AppointmentHelper, create_appointment_with_notifications
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, time, timedelta
import logging

logger = logging.getLogger(__name__)

# Voice Agent specific models for simplified data exchange
class VoiceCustomerLookup(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None

class VoiceCustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None

class VoiceAppointmentRequest(BaseModel):
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_name: Optional[str] = None
    preferred_date: str  # Format: "2025-08-15"
    preferred_time: str  # Format: "14:30" or "2:30 PM"
    duration_minutes: Optional[int] = 30
    appointment_type: Optional[str] = "consultation"
    notes: Optional[str] = None

class VoiceAppointmentResponse(BaseModel):
    success: bool
    message: str
    appointment_id: Optional[int] = None
    scheduled_time: Optional[str] = None
    alternative_times: Optional[List[str]] = None
    customer_id: Optional[int] = None

class VoiceCustomerResponse(BaseModel):
    found: bool
    customer_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    message: str

class VoiceJobResponse(BaseModel):
    success: bool
    message: str
    jobs: Optional[List[dict]] = None
    
class VoiceChangeRequestCreate(BaseModel):
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_name: Optional[str] = None
    job_title: Optional[str] = None  # For identifying the job
    change_title: str
    change_description: str
    priority: Optional[str] = "medium"  # low, medium, high, urgent
    session_id: Optional[str] = None

class VoiceChangeRequestResponse(BaseModel):
    success: bool
    message: str
    request_id: Optional[int] = None
    job_title: Optional[str] = None

router = APIRouter(prefix="/api/voice", tags=["voice-agent"])

def parse_time_string(time_str: str) -> time:
    """Parse various time formats that might come from voice input"""
    time_str = time_str.strip().lower()
    
    # Handle common voice input formats
    time_formats = [
        "%H:%M",           # 14:30
        "%I:%M %p",        # 2:30 PM
        "%I:%M%p",         # 2:30PM
        "%I %p",           # 2 PM
        "%I%p",            # 2PM
        "%H",              # 14 (24-hour)
    ]
    
    for fmt in time_formats:
        try:
            return datetime.strptime(time_str, fmt).time()
        except ValueError:
            continue
    
    raise ValueError(f"Unable to parse time: {time_str}")

@router.post("/customers/lookup", response_model=VoiceCustomerResponse)
async def voice_lookup_customer(
    lookup_data: VoiceCustomerLookup,
    db: Session = Depends(get_db)
):
    """
    Look up customer by email, phone, or name for voice agents
    Returns simplified customer data optimized for voice interaction
    """
    try:
        customer_service = CustomerService(db)
        customer = None
        
        # Try email first (most reliable)
        if lookup_data.email:
            customer = customer_service.get_customer_by_email(lookup_data.email)
        
        # Try phone if email lookup failed
        if not customer and lookup_data.phone:
            # Phone lookup would need to be implemented in CustomerService
            customers = customer_service.get_customers_by_phone(lookup_data.phone)
            if customers:
                customer = customers[0]
        
        # Try name as last resort (less reliable)
        if not customer and lookup_data.name:
            customers = customer_service.search_customers_by_name(lookup_data.name)
            if customers:
                customer = customers[0]
        
        if customer:
            return VoiceCustomerResponse(
                found=True,
                customer_id=customer.id,
                name=customer.name,
                email=customer.email,
                phone=customer.phone,
                message=f"Found customer: {customer.name or 'Unknown'}"
            )
        else:
            return VoiceCustomerResponse(
                found=False,
                message="Customer not found. Would you like me to create a new customer record?"
            )
            
    except Exception as e:
        logger.error(f"Error in voice customer lookup: {str(e)}")
        return VoiceCustomerResponse(
            found=False,
            message="Sorry, I encountered an error looking up the customer. Please try again."
        )

@router.post("/customers/create", response_model=VoiceCustomerResponse)
async def voice_create_customer(
    customer_data: VoiceCustomerCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new customer from voice agent input
    Returns simplified response for voice interaction
    """
    try:
        customer_service = CustomerService(db)
        
        # Check if customer already exists
        existing_customer = None
        if customer_data.email:
            existing_customer = customer_service.get_customer_by_email(customer_data.email)
        
        if existing_customer:
            return VoiceCustomerResponse(
                found=True,
                customer_id=existing_customer.id,
                name=existing_customer.name,
                email=existing_customer.email,
                phone=existing_customer.phone,
                message=f"Customer already exists: {existing_customer.name or 'Unknown'}"
            )
        
        # Create new customer
        from schemas.customer import CustomerCreate
        new_customer_data = CustomerCreate(
            name=customer_data.name,
            email=customer_data.email,
            phone=customer_data.phone,
            business_type=customer_data.company,
            notes=customer_data.notes,
            status="lead"
        )
        
        customer = customer_service.create_customer(new_customer_data)
        
        return VoiceCustomerResponse(
            found=True,
            customer_id=customer.id,
            name=customer.name,
            email=customer.email,
            phone=customer.phone,
            message=f"Successfully created new customer: {customer.name}"
        )
        
    except Exception as e:
        logger.error(f"Error creating customer via voice: {str(e)}")
        return VoiceCustomerResponse(
            found=False,
            message="Sorry, I encountered an error creating the customer record. Please try again."
        )

@router.get("/appointments/available-slots")
async def voice_get_available_slots(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    duration: int = Query(30, description="Duration in minutes"),
    db: Session = Depends(get_db)
):
    """
    Get available appointment slots for voice agents
    Returns simplified slot data optimized for voice readout
    """
    try:
        appointment_service = AppointmentService(db)
        
        # Parse date
        target_date = datetime.strptime(date, "%Y-%m-%d")
        
        # Get available slots
        available_slots = appointment_service.get_available_slots(target_date, duration)
        
        if not available_slots:
            return {
                "available": False,
                "message": f"No available slots for {target_date.strftime('%A, %B %d')}",
                "slots": [],
                "alternative_dates": []
            }
        
        # Format slots for voice readout
        formatted_slots = []
        for slot in available_slots:
            formatted_slots.append({
                "time": slot.strftime("%I:%M %p"),
                "datetime": slot.isoformat(),
                "readable": slot.strftime("%I:%M %p")
            })
        
        return {
            "available": True,
            "message": f"Found {len(formatted_slots)} available slots for {target_date.strftime('%A, %B %d')}",
            "slots": formatted_slots,
            "date": date
        }
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        logger.error(f"Error getting available slots for voice: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving available slots")

@router.post("/appointments/schedule", response_model=VoiceAppointmentResponse)
async def voice_schedule_appointment(
    appointment_request: VoiceAppointmentRequest,
    db: Session = Depends(get_db)
):
    """
    Schedule an appointment through voice agent
    Includes conflict checking and alternative suggestions
    """
    try:
        customer_service = CustomerService(db)
        appointment_helper = AppointmentHelper(db)
        
        # Find or create customer
        customer = None
        if appointment_request.customer_email:
            customer = customer_service.get_customer_by_email(appointment_request.customer_email)
        
        if not customer and appointment_request.customer_phone:
            customers = customer_service.get_customers_by_phone(appointment_request.customer_phone)
            if customers:
                customer = customers[0]
        
        # Create customer if not found
        if not customer:
            if not appointment_request.customer_name:
                return VoiceAppointmentResponse(
                    success=False,
                    message="I need at least a name to create a customer record and schedule the appointment."
                )
            
            from schemas.customer import CustomerCreate
            customer_data = CustomerCreate(
                name=appointment_request.customer_name,
                email=appointment_request.customer_email,
                phone=appointment_request.customer_phone,
                status="lead"
            )
            customer = customer_service.create_customer(customer_data)
        
        # Parse appointment time
        try:
            appointment_date = datetime.strptime(appointment_request.preferred_date, "%Y-%m-%d").date()
            appointment_time = parse_time_string(appointment_request.preferred_time)
            appointment_datetime = datetime.combine(appointment_date, appointment_time)
        except ValueError as e:
            return VoiceAppointmentResponse(
                success=False,
                message=f"I couldn't understand the date or time format. Please provide the date as year-month-day and time in a clear format like '2:30 PM'."
            )
        
        # Try to create appointment using helper
        try:
            appointment = create_appointment_with_notifications(
                db=db,
                customer_id=customer.id,
                scheduled_date=appointment_datetime,
                duration_minutes=appointment_request.duration_minutes,
                appointment_type=appointment_request.appointment_type,
                customer_notes=appointment_request.notes
            )
            
            formatted_time = appointment_datetime.strftime("%A, %B %d at %I:%M %p")
            
            return VoiceAppointmentResponse(
                success=True,
                message=f"Great! I've scheduled your appointment for {formatted_time}. You'll receive a confirmation email shortly.",
                appointment_id=appointment.id,
                scheduled_time=formatted_time,
                customer_id=customer.id
            )
            
        except ValueError as conflict_error:
            # Get recommended alternative times
            appointment_service = AppointmentService(db)
            recommended_times = appointment_service.get_recommended_times(appointment_datetime, appointment_request.duration_minutes, 3)
            
            alternatives = []
            for rec_time in recommended_times:
                alternatives.append(rec_time.strftime("%A, %B %d at %I:%M %p"))
            
            return VoiceAppointmentResponse(
                success=False,
                message=f"That time slot is already booked. Here are some available alternatives: {', '.join(alternatives[:2])}. Would you like to book one of these times instead?",
                alternative_times=alternatives,
                customer_id=customer.id
            )
            
    except Exception as e:
        logger.error(f"Error scheduling appointment via voice: {str(e)}")
        return VoiceAppointmentResponse(
            success=False,
            message="I encountered an error while scheduling your appointment. Please try again or contact support."
        )

@router.get("/appointments/customer/{customer_id}")
async def voice_get_customer_appointments(
    customer_id: int,
    upcoming_only: bool = Query(True, description="Only return upcoming appointments"),
    db: Session = Depends(get_db)
):
    """
    Get appointments for a customer - optimized for voice readout
    """
    try:
        appointment_service = AppointmentService(db)
        
        if upcoming_only:
            appointments = appointment_service.get_upcoming_appointments()
            # Filter by customer
            customer_appointments = [apt for apt in appointments if apt.customer_id == customer_id]
        else:
            customer_appointments = appointment_service.get_customer_appointments(customer_id)
        
        if not customer_appointments:
            return {
                "found": False,
                "message": "No appointments found for this customer",
                "appointments": []
            }
        
        # Format for voice readout
        formatted_appointments = []
        for apt in customer_appointments:
            formatted_time = apt.scheduled_date.strftime("%A, %B %d at %I:%M %p")
            formatted_appointments.append({
                "id": apt.id,
                "datetime": apt.scheduled_date.isoformat(),
                "readable_time": formatted_time,
                "duration": f"{apt.duration_minutes} minutes",
                "type": apt.appointment_type,
                "status": apt.status
            })
        
        return {
            "found": True,
            "message": f"Found {len(formatted_appointments)} appointments",
            "appointments": formatted_appointments
        }
        
    except Exception as e:
        logger.error(f"Error getting customer appointments for voice: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving appointments")

@router.put("/appointments/{appointment_id}/reschedule")
async def voice_reschedule_appointment(
    appointment_id: int,
    new_date: str,
    new_time: str,
    db: Session = Depends(get_db)
):
    """
    Reschedule an appointment via voice agent
    """
    try:
        appointment_service = AppointmentService(db)
        appointment_helper = AppointmentHelper(db)
        
        # Get existing appointment
        appointment = appointment_service.get_appointment(appointment_id)
        if not appointment:
            return {
                "success": False,
                "message": "Appointment not found"
            }
        
        # Parse new datetime
        new_appointment_date = datetime.strptime(new_date, "%Y-%m-%d").date()
        new_appointment_time = parse_time_string(new_time)
        new_datetime = datetime.combine(new_appointment_date, new_appointment_time)
        
        # Check if new time is available
        if not appointment_service._is_time_available(new_datetime, appointment.duration_minutes):
            # Get alternatives
            recommended_times = appointment_service.get_recommended_times(new_datetime, appointment.duration_minutes, 3)
            alternatives = [t.strftime("%A, %B %d at %I:%M %p") for t in recommended_times]
            
            return {
                "success": False,
                "message": f"That time is not available. Here are some alternatives: {', '.join(alternatives[:2])}",
                "alternative_times": alternatives
            }
        
        # Update appointment
        appointment.scheduled_date = new_datetime
        updated_appointment = appointment_service.update_appointment(appointment)
        
        formatted_time = new_datetime.strftime("%A, %B %d at %I:%M %p")
        
        return {
            "success": True,
            "message": f"Appointment rescheduled to {formatted_time}",
            "new_time": formatted_time
        }
        
    except Exception as e:
        logger.error(f"Error rescheduling appointment via voice: {str(e)}")
        return {
            "success": False,
            "message": "Error rescheduling appointment. Please try again."
        }

@router.delete("/appointments/{appointment_id}")
async def voice_cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    """
    Cancel an appointment via voice agent
    """
    try:
        appointment_service = AppointmentService(db)
        
        # Get appointment details for confirmation
        appointment = appointment_service.get_appointment(appointment_id)
        if not appointment:
            return {
                "success": False,
                "message": "Appointment not found"
            }
        
        formatted_time = appointment.scheduled_date.strftime("%A, %B %d at %I:%M %p")
        
        # Cancel the appointment
        success = appointment_service.cancel_appointment(appointment_id)
        
        if success:
            return {
                "success": True,
                "message": f"Your appointment for {formatted_time} has been cancelled"
            }
        else:
            return {
                "success": False,
                "message": "Failed to cancel appointment"
            }
            
    except Exception as e:
        logger.error(f"Error cancelling appointment via voice: {str(e)}")
        return {
            "success": False,
            "message": "Error cancelling appointment. Please try again."
        }

@router.get("/jobs/customer/{customer_id}", response_model=VoiceJobResponse)
async def voice_get_customer_jobs(
    customer_id: int,
    active_only: bool = Query(True, description="Only return active jobs"),
    db: Session = Depends(get_db)
):
    """
    Get jobs for a customer - optimized for voice readout
    """
    try:
        job_service = JobService(db)
        
        if active_only:
            jobs = job_service.get_active_jobs(customer_id)
        else:
            jobs = job_service.get_customer_jobs(customer_id)
        
        if not jobs:
            return VoiceJobResponse(
                success=False,
                message="No jobs found for this customer"
            )
        
        # Format for voice readout
        formatted_jobs = []
        for job in jobs:
            formatted_jobs.append({
                "id": job.id,
                "title": job.title,
                "status": job.status,
                "priority": job.priority,
                "progress": f"{job.progress_percentage}%",
                "description": job.description[:100] + "..." if job.description and len(job.description) > 100 else job.description
            })
        
        job_summary = f"Found {len(formatted_jobs)} {'active' if active_only else ''} jobs"
        
        return VoiceJobResponse(
            success=True,
            message=job_summary,
            jobs=formatted_jobs
        )
        
    except Exception as e:
        logger.error(f"Error getting customer jobs for voice: {str(e)}")
        return VoiceJobResponse(
            success=False,
            message="Error retrieving jobs. Please try again."
        )

@router.post("/jobs/lookup", response_model=VoiceJobResponse)
async def voice_lookup_customer_jobs(
    lookup_data: VoiceCustomerLookup,
    db: Session = Depends(get_db)
):
    """
    Look up customer jobs by customer email, phone, or name
    """
    try:
        customer_service = CustomerService(db)
        job_service = JobService(db)
        
        # Find customer first
        customer = None
        if lookup_data.email:
            customer = customer_service.get_customer_by_email(lookup_data.email)
        
        if not customer and lookup_data.phone:
            customers = customer_service.get_customers_by_phone(lookup_data.phone)
            if customers:
                customer = customers[0]
        
        if not customer and lookup_data.name:
            customers = customer_service.search_customers_by_name(lookup_data.name)
            if customers:
                customer = customers[0]
        
        if not customer:
            return VoiceJobResponse(
                success=False,
                message="Customer not found. Please provide a valid email, phone, or name."
            )
        
        # Get active jobs for customer
        jobs = job_service.get_active_jobs(customer.id)
        
        if not jobs:
            return VoiceJobResponse(
                success=False,
                message=f"No active jobs found for {customer.name or customer.email}"
            )
        
        # Format for voice readout
        formatted_jobs = []
        for job in jobs:
            formatted_jobs.append({
                "id": job.id,
                "title": job.title,
                "status": job.status,
                "priority": job.priority,
                "progress": f"{job.progress_percentage}%"
            })
        
        message = f"Found {len(formatted_jobs)} active jobs for {customer.name or 'this customer'}"
        
        return VoiceJobResponse(
            success=True,
            message=message,
            jobs=formatted_jobs
        )
        
    except Exception as e:
        logger.error(f"Error looking up customer jobs: {str(e)}")
        return VoiceJobResponse(
            success=False,
            message="Error looking up jobs. Please try again."
        )

@router.post("/change-requests/create", response_model=VoiceChangeRequestResponse)
async def voice_create_change_request(
    request_data: VoiceChangeRequestCreate,
    db: Session = Depends(get_db)
):
    """
    Create a change request for a customer's job via voice agent
    """
    try:
        customer_service = CustomerService(db)
        job_service = JobService(db)
        change_service = ChangeRequestService(db)
        
        # Find customer
        customer = None
        if request_data.customer_email:
            customer = customer_service.get_customer_by_email(request_data.customer_email)
        
        if not customer and request_data.customer_phone:
            customers = customer_service.get_customers_by_phone(request_data.customer_phone)
            if customers:
                customer = customers[0]
        
        if not customer and request_data.customer_name:
            customers = customer_service.search_customers_by_name(request_data.customer_name)
            if customers:
                customer = customers[0]
        
        if not customer:
            return VoiceChangeRequestResponse(
                success=False,
                message="I couldn't find your customer record. Please provide your email or phone number."
            )
        
        # Find the job
        customer_jobs = job_service.get_active_jobs(customer.id)
        
        if not customer_jobs:
            return VoiceChangeRequestResponse(
                success=False,
                message="No active jobs found for your account. Change requests can only be made for active projects."
            )
        
        # If job title specified, try to find exact match
        target_job = None
        if request_data.job_title:
            for job in customer_jobs:
                if request_data.job_title.lower() in job.title.lower():
                    target_job = job
                    break
        
        # If no specific job found or specified, use the first active job
        if not target_job:
            target_job = customer_jobs[0]
        
        # Create the change request
        change_request = change_service.create_change_request(
            job_id=target_job.id,
            customer_id=customer.id,
            title=request_data.change_title,
            description=request_data.change_description,
            priority=request_data.priority,
            requested_via="voice",
            session_id=request_data.session_id
        )
        
        # Send notification to tech team
        await send_change_request_notification(change_request, target_job, customer)
        
        return VoiceChangeRequestResponse(
            success=True,
            message=f"Your change request '{request_data.change_title}' has been submitted for the project '{target_job.title}'. Our tech team will review it and get back to you soon.",
            request_id=change_request.id,
            job_title=target_job.title
        )
        
    except Exception as e:
        logger.error(f"Error creating change request via voice: {str(e)}")
        return VoiceChangeRequestResponse(
            success=False,
            message="I encountered an error submitting your change request. Please try again or contact support."
        )

@router.get("/change-requests/customer/{customer_id}")
async def voice_get_customer_change_requests(
    customer_id: int,
    status_filter: Optional[str] = Query(None, description="Filter by status: pending, reviewing, approved, etc."),
    db: Session = Depends(get_db)
):
    """
    Get change requests for a customer - optimized for voice readout
    """
    try:
        change_service = ChangeRequestService(db)
        
        change_requests = change_service.get_customer_change_requests(customer_id)
        
        # Filter by status if specified
        if status_filter:
            change_requests = [cr for cr in change_requests if cr.status == status_filter]
        
        if not change_requests:
            status_msg = f" with status '{status_filter}'" if status_filter else ""
            return {
                "found": False,
                "message": f"No change requests found{status_msg}",
                "requests": []
            }
        
        # Format for voice readout
        formatted_requests = []
        for cr in change_requests:
            formatted_requests.append({
                "id": cr.id,
                "title": cr.title,
                "status": cr.status,
                "priority": cr.priority,
                "job_id": cr.job_id,
                "created_date": cr.created_at.strftime("%B %d, %Y"),
                "description": cr.description[:100] + "..." if len(cr.description) > 100 else cr.description
            })
        
        return {
            "found": True,
            "message": f"Found {len(formatted_requests)} change requests",
            "requests": formatted_requests
        }
        
    except Exception as e:
        logger.error(f"Error getting customer change requests: {str(e)}")
        return {
            "found": False,
            "message": "Error retrieving change requests. Please try again.",
            "requests": []
        }
