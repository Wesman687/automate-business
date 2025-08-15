from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from database.models import CustomerChangeRequest, Job, Customer
from services.job_service import JobService, ChangeRequestService
from services.appointment_service import AppointmentService
from api.auth import get_current_user  # Legacy import
from api.auth import get_current_admin
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["admin-jobs"])

class ChangeRequestUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None
    estimated_hours: Optional[float] = None
    estimated_cost: Optional[float] = None
    rejection_reason: Optional[str] = None

class OverviewResponse(BaseModel):
    upcoming_appointments: List[dict]
    active_change_requests: List[dict]
    active_jobs: List[dict]
    stats: dict

@router.get("/jobs", response_model=List[dict])
async def get_all_jobs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all jobs for admin overview"""
    try:
        job_service = JobService(db)
        jobs = job_service.get_all_active_jobs()
        
        formatted_jobs = []
        for job in jobs:
            customer = job.customer
            formatted_jobs.append({
                "id": job.id,
                "title": job.title,
                "customer_name": customer.name,
                "customer_email": customer.email,
                "status": job.status,
                "priority": job.priority,
                "progress_percentage": job.progress_percentage,
                "created_at": job.created_at,
                "deadline": job.deadline
            })
        
        return formatted_jobs
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching jobs: {str(e)}")

@router.get("/jobs/{job_id}")
async def get_job_details(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get detailed job information with change requests"""
    try:
        job_service = JobService(db)
        change_service = ChangeRequestService(db)
        
        job = job_service.get_job_by_id(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Get change requests for this job
        change_requests = change_service.get_job_change_requests(job_id)
        
        formatted_change_requests = []
        for cr in change_requests:
            formatted_change_requests.append({
                "id": cr.id,
                "title": cr.title,
                "description": cr.description,
                "priority": cr.priority,
                "status": cr.status,
                "requested_via": cr.requested_via,
                "created_at": cr.created_at,
                "admin_notes": cr.admin_notes,
                "estimated_hours": cr.estimated_hours,
                "estimated_cost": cr.estimated_cost,
                "rejection_reason": cr.rejection_reason
            })
        
        return {
            "job": {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "status": job.status,
                "priority": job.priority,
                "progress_percentage": job.progress_percentage,
                "customer": {
                    "id": job.customer.id,
                    "name": job.customer.name,
                    "email": job.customer.email,
                    "phone": job.customer.phone
                },
                "created_at": job.created_at,
                "deadline": job.deadline
            },
            "change_requests": formatted_change_requests
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching job details: {str(e)}")

@router.get("/change-requests")
async def get_all_change_requests(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all change requests, optionally filtered by status"""
    try:
        change_service = ChangeRequestService(db)
        
        if status:
            if status == "active":
                change_requests = change_service.get_active_change_requests()
            else:
                # Filter by specific status would need a new method
                change_requests = change_service.get_pending_change_requests()
        else:
            change_requests = change_service.get_active_change_requests()
        
        formatted_requests = []
        for cr in change_requests:
            job = cr.job
            customer = cr.customer
            formatted_requests.append({
                "id": cr.id,
                "title": cr.title,
                "description": cr.description,
                "priority": cr.priority,
                "status": cr.status,
                "requested_via": cr.requested_via,
                "created_at": cr.created_at,
                "job": {
                    "id": job.id,
                    "title": job.title
                },
                "customer": {
                    "id": customer.id,
                    "name": customer.name,
                    "email": customer.email
                },
                "estimated_hours": cr.estimated_hours,
                "estimated_cost": cr.estimated_cost
            })
        
        return formatted_requests
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching change requests: {str(e)}")

@router.put("/change-requests/{request_id}")
async def update_change_request(
    request_id: int,
    update_data: ChangeRequestUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Update a change request status and details"""
    try:
        change_service = ChangeRequestService(db)
        
        updated_request = change_service.update_change_request_status(
            request_id=request_id,
            status=update_data.status,
            admin_notes=update_data.admin_notes,
            estimated_hours=update_data.estimated_hours,
            estimated_cost=update_data.estimated_cost,
            rejection_reason=update_data.rejection_reason
        )
        
        if not updated_request:
            raise HTTPException(status_code=404, detail="Change request not found")
        
        return {
            "message": "Change request updated successfully",
            "request": {
                "id": updated_request.id,
                "status": updated_request.status,
                "admin_notes": updated_request.admin_notes,
                "estimated_hours": updated_request.estimated_hours,
                "estimated_cost": updated_request.estimated_cost
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating change request: {str(e)}")

@router.get("/overview", response_model=OverviewResponse)
async def get_admin_overview(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get comprehensive overview for admin dashboard"""
    try:
        appointment_service = AppointmentService(db)
        job_service = JobService(db)
        change_service = ChangeRequestService(db)
        
        # Get upcoming appointments (next 7 days)
        upcoming_appointments = appointment_service.get_upcoming_appointments(days_ahead=7)
        formatted_appointments = []
        for apt in upcoming_appointments:
            customer = apt.customer
            formatted_appointments.append({
                "id": apt.id,
                "customer_name": customer.name,
                "customer_email": customer.email,
                "scheduled_time": apt.scheduled_date.strftime("%A, %B %d at %I:%M %p"),
                "duration": f"{apt.duration_minutes} minutes",
                "type": apt.appointment_type,
                "status": apt.status
            })
        
        # Get active change requests
        active_change_requests = change_service.get_active_change_requests()
        formatted_change_requests = []
        for cr in active_change_requests:
            formatted_change_requests.append({
                "id": cr.id,
                "title": cr.title,
                "priority": cr.priority,
                "status": cr.status,
                "customer_name": cr.customer.name,
                "job_title": cr.job.title,
                "created_at": cr.created_at.strftime("%B %d, %Y"),
                "requested_via": cr.requested_via
            })
        
        # Get active jobs
        active_jobs = job_service.get_all_active_jobs()
        formatted_jobs = []
        for job in active_jobs:
            formatted_jobs.append({
                "id": job.id,
                "title": job.title,
                "customer_name": job.customer.name,
                "status": job.status,
                "priority": job.priority,
                "progress": job.progress_percentage
            })
        
        # Calculate stats
        stats = {
            "total_appointments": len(formatted_appointments),
            "total_change_requests": len(formatted_change_requests),
            "total_active_jobs": len(formatted_jobs),
            "urgent_change_requests": len([cr for cr in active_change_requests if cr.priority == "urgent"]),
            "high_priority_jobs": len([job for job in active_jobs if job.priority == "high"])
        }
        
        return OverviewResponse(
            upcoming_appointments=formatted_appointments,
            active_change_requests=formatted_change_requests,
            active_jobs=formatted_jobs,
            stats=stats
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching overview: {str(e)}")
