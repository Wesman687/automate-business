from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from database import get_db
from schemas.credits import (
    CreditDisputeCreate, CreditDispute, CreditDisputeUpdate,
    DisputeResolutionRequest, DisputeQueue
)
from api.auth import get_current_user, get_current_admin
from core.exceptions import (
    UserNotFoundError, DisputeError, ValidationError
)

router = APIRouter(prefix="/disputes", tags=["disputes"])

@router.post("/submit", response_model=CreditDispute)
async def submit_dispute(
    dispute: CreditDisputeCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a new credit dispute"""
    try:
        # Validate that the user is submitting a dispute for themselves
        if dispute.user_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Can only submit disputes for your own account")
        
        # This will be implemented when CreditDispute model is available
        # For now, return a placeholder response
        return {
            "id": 1,
            "user_id": dispute.user_id,
            "transaction_id": dispute.transaction_id,
            "reason": dispute.reason,
            "description": dispute.description,
            "requested_refund": dispute.requested_refund,
            "status": "pending",
            "resolution": None,
            "resolved_amount": None,
            "admin_id": None,
            "admin_notes": None,
            "resolution_notes": None,
            "submitted_at": datetime.utcnow(),
            "reviewed_at": None,
            "resolved_at": None
        }
        
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit dispute: {str(e)}")

@router.get("/my-disputes", response_model=list[CreditDispute])
async def get_my_disputes(
    status: Optional[str] = Query(None, description="Filter by dispute status"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get disputes submitted by the current user"""
    try:
        # This will be implemented when CreditDispute model is available
        # For now, return empty list
        return []
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get disputes: {str(e)}")

@router.get("/{dispute_id}", response_model=CreditDispute)
async def get_dispute(
    dispute_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific dispute"""
    try:
        # This will be implemented when CreditDispute model is available
        # For now, return a placeholder
        return {
            "id": dispute_id,
            "user_id": current_user["id"],
            "transaction_id": None,
            "reason": "Sample dispute",
            "description": "This is a placeholder dispute",
            "requested_refund": None,
            "status": "pending",
            "resolution": None,
            "resolved_amount": None,
            "admin_id": None,
            "admin_notes": None,
            "resolution_notes": None,
            "submitted_at": datetime.utcnow(),
            "reviewed_at": None,
            "resolved_at": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dispute: {str(e)}")

# Admin endpoints
@router.get("/admin/queue", response_model=DisputeQueue)
async def admin_get_dispute_queue(
    status: Optional[str] = Query(None, description="Filter by dispute status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Page size"),
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to get dispute queue"""
    try:
        # This will be implemented when CreditDispute model is available
        # For now, return placeholder data
        return {
            "disputes": [],
            "total_count": 0,
            "pending_count": 0,
            "under_review_count": 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dispute queue: {str(e)}")

@router.put("/admin/{dispute_id}/review")
async def admin_review_dispute(
    dispute_id: int,
    update: CreditDisputeUpdate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to review and update dispute status"""
    try:
        # This will be implemented when CreditDispute model is available
        # For now, return success message
        return {
            "success": True,
            "message": f"Dispute {dispute_id} updated successfully",
            "dispute_id": dispute_id,
            "updated_fields": update.dict(exclude_unset=True)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update dispute: {str(e)}")

@router.post("/admin/{dispute_id}/resolve")
async def admin_resolve_dispute(
    dispute_id: int,
    resolution: DisputeResolutionRequest,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to resolve a dispute"""
    try:
        # This will be implemented when CreditDispute model is available
        # For now, return success message
        return {
            "success": True,
            "message": f"Dispute {dispute_id} resolved successfully",
            "dispute_id": dispute_id,
            "resolution": resolution.resolution,
            "resolved_amount": resolution.resolved_amount,
            "resolution_notes": resolution.resolution_notes
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resolve dispute: {str(e)}")

@router.get("/admin/statistics")
async def admin_get_dispute_statistics(
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to get dispute statistics"""
    try:
        # This will be implemented when CreditDispute model is available
        # For now, return placeholder statistics
        return {
            "total_disputes": 0,
            "pending_disputes": 0,
            "under_review_disputes": 0,
            "resolved_disputes": 0,
            "rejected_disputes": 0,
            "average_resolution_time_hours": 0,
            "disputes_this_month": 0,
            "disputes_last_month": 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dispute statistics: {str(e)}")
