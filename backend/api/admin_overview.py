from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.job_service import JobService, ChangeRequestService
from services.appointment_service import AppointmentService
from api.auth import get_current_admin
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api", tags=["admin"])

class OverviewResponse(BaseModel):
    upcoming_appointments: List[dict]
    active_change_requests: List[dict]
    active_jobs: List[dict]
    stats: dict

@router.get("/overview", response_model=OverviewResponse)
async def get_admin_overview(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get comprehensive overview for admin dashboard"""
    try:
        print(f"🔍 Admin overview requested by: {current_user.get('email')}")
        
        appointment_service = AppointmentService(db)
        job_service = JobService(db)
        change_service = ChangeRequestService(db)
        
        print("📅 Fetching appointments...")
        # Get upcoming appointments (next 7 days)
        upcoming_appointments = appointment_service.get_upcoming_appointments(days_ahead=7)
        print(f"   Found {len(upcoming_appointments)} appointments")
        
        formatted_appointments = []
        for apt in upcoming_appointments:
            try:
                customer = apt.user  # Changed from apt.customer to apt.user
                formatted_appointments.append({
                    "id": apt.id,
                    "customer_name": customer.name or "Unknown",
                    "customer_email": customer.email,
                    "scheduled_time": apt.scheduled_date.strftime("%A, %B %d at %I:%M %p"),
                    "duration": f"{apt.duration_minutes} minutes",
                    "type": apt.appointment_type,
                    "status": apt.status
                })
            except Exception as e:
                print(f"   ⚠️ Error formatting appointment {apt.id}: {str(e)}")
                continue
        
        print("🔄 Fetching change requests...")
        # Get active change requests
        active_change_requests = change_service.get_active_change_requests()
        print(f"   Found {len(active_change_requests)} change requests")
        
        formatted_change_requests = []
        for cr in active_change_requests:
            try:
                formatted_change_requests.append({
                    "id": cr.id,
                    "title": cr.title,
                    "priority": cr.priority,
                    "status": cr.status,
                    "customer_name": cr.user.name if cr.user else "Unknown",  # Changed from cr.customer.name to cr.user.name
                    "job_title": cr.job.title if cr.job else "Unknown",
                    "created_at": cr.created_at.strftime("%B %d, %Y"),
                    "requested_via": cr.requested_via
                })
            except Exception as e:
                print(f"   ⚠️ Error formatting change request {cr.id}: {str(e)}")
                continue
        
        print("💼 Fetching jobs...")
        # Get active jobs
        active_jobs = job_service.get_all_active_jobs()
        print(f"   Found {len(active_jobs)} jobs")
        
        formatted_jobs = []
        for job in active_jobs:
            try:
                formatted_jobs.append({
                    "id": job.id,
                    "title": job.title,
                    "customer_name": job.user.name if job.user else "Unknown",  # Changed from job.customer.name to job.user.name
                    "status": job.status,
                    "priority": job.priority,
                    "progress": job.progress_percentage
                })
            except Exception as e:
                print(f"   ⚠️ Error formatting job {job.id}: {str(e)}")
                continue
        
        # Calculate stats
        stats = {
            "total_appointments": len(formatted_appointments),
            "total_change_requests": len(formatted_change_requests),
            "total_active_jobs": len(formatted_jobs),
            "urgent_change_requests": len([cr for cr in active_change_requests if cr.priority == "urgent"]),
            "high_priority_jobs": len([job for job in active_jobs if job.priority == "high"])
        }
        
        print(f"📊 Overview stats: {stats}")
        
        return OverviewResponse(
            upcoming_appointments=formatted_appointments,
            active_change_requests=formatted_change_requests,
            active_jobs=formatted_jobs,
            stats=stats
        )
        
    except Exception as e:
        print(f"❌ Error in admin overview: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching overview: {str(e)}")
