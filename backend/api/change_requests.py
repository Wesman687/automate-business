from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from database.models import CustomerChangeRequest, Job, User
from services.job_service import JobService, ChangeRequestService
from services.appointment_service import AppointmentService
from api.auth import get_current_user  # Legacy import
from api.auth import get_current_admin
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/change-request")


class ChangeRequestUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None
    estimated_hours: Optional[float] = None
    estimated_cost: Optional[float] = None
    rejection_reason: Optional[str] = None
    
@router.get("/")
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
            try:
                job = cr.job
                customer = cr.user  # Changed from cr.customer to cr.user
                formatted_requests.append({
                    "id": cr.id,
                    "title": cr.title,
                    "description": cr.description,
                    "priority": cr.priority,
                    "status": cr.status,
                    "requested_via": cr.requested_via,
                    "created_at": cr.created_at,
                    "job": {
                        "id": job.id if job else 0,
                        "title": job.title if job else "Unknown"
                    },
                    "customer": {
                        "id": customer.id if customer else 0,
                        "name": customer.name if customer else "Unknown",
                        "email": customer.email if customer else "Unknown"
                    },
                    "estimated_hours": cr.estimated_hours,
                    "estimated_cost": cr.estimated_cost
                })
            except Exception as e:
                print(f"⚠️ Error formatting change request {cr.id}: {str(e)}")
                continue
        
        return formatted_requests
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching change requests: {str(e)}")

@router.put("/{request_id}")
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