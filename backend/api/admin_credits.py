from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from database import get_db
from services.credit_service import CreditService
from schemas.credits import (
    AddCreditsRequest, RemoveCreditsRequest, PauseCreditServiceRequest,
    ResumeCreditServiceRequest, DisputeResolutionRequest
)
from api.auth import get_current_admin
from core.exceptions import (
    InsufficientCreditsError, CreditServiceError, UserNotFoundError,
    InvalidAmountError, TransactionError
)

router = APIRouter(prefix="/admin/credits", tags=["admin-credits"])

@router.post("/add")
async def admin_add_credits(
    request: AddCreditsRequest,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to add credits to a user account"""
    try:
        credit_service = CreditService(db)
        transaction = credit_service.add_credits(
            user_id=request.user_id,
            amount=request.amount,
            description=request.reason,
            transaction_type="admin",
            metadata={"admin_notes": request.admin_notes, "admin_id": current_admin["id"]}
        )
        
        return {
            "success": True,
            "message": f"Successfully added {request.amount} credits to user {request.user_id}",
            "transaction": transaction,
            "new_balance": credit_service.get_user_balance(request.user_id).current_credits
        }
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except CreditServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add credits: {str(e)}")

@router.post("/remove")
async def admin_remove_credits(
    request: RemoveCreditsRequest,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to remove credits from a user account"""
    try:
        credit_service = CreditService(db)
        transaction = credit_service.remove_credits(
            user_id=request.user_id,
            amount=request.amount,
            description=request.reason,
            admin_notes=request.admin_notes
        )
        
        return {
            "success": True,
            "message": f"Successfully removed {request.amount} credits from user {request.user_id}",
            "transaction": transaction,
            "new_balance": credit_service.get_user_balance(request.user_id).current_credits
        }
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InsufficientCreditsError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove credits: {str(e)}")

@router.post("/pause")
async def admin_pause_credit_service(
    request: PauseCreditServiceRequest,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to pause credit service for a user"""
    try:
        credit_service = CreditService(db)
        success = credit_service.pause_credit_service(
            user_id=request.user_id,
            reason=request.reason,
            admin_notes=request.admin_notes
        )
        
        if success:
            return {
                "success": True,
                "message": f"Credit service paused for user {request.user_id}",
                "reason": request.reason
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to pause credit service")
            
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to pause credit service: {str(e)}")

@router.post("/resume")
async def admin_resume_credit_service(
    request: ResumeCreditServiceRequest,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to resume credit service for a user"""
    try:
        credit_service = CreditService(db)
        success = credit_service.resume_credit_service(
            user_id=request.user_id,
            admin_notes=request.admin_notes
        )
        
        if success:
            return {
                "success": True,
                "message": f"Credit service resumed for user {request.user_id}"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to resume credit service")
            
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resume credit service: {str(e)}")

@router.get("/user/{user_id}/balance")
async def admin_get_user_balance(
    user_id: int,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to get credit balance for a specific user"""
    try:
        credit_service = CreditService(db)
        balance = credit_service.get_user_balance(user_id)
        return balance
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user balance: {str(e)}")

@router.get("/user/{user_id}/transactions")
async def admin_get_user_transactions(
    user_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Page size"),
    transaction_type: Optional[str] = Query(None, description="Filter by transaction type"),
    start_date: Optional[datetime] = Query(None, description="Filter transactions from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter transactions until this date"),
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to get transaction history for a specific user"""
    try:
        credit_service = CreditService(db)
        history = credit_service.get_transaction_history(
            user_id=user_id,
            page=page,
            page_size=page_size,
            transaction_type=transaction_type,
            start_date=start_date,
            end_date=end_date
        )
        return history
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get transaction history: {str(e)}")

@router.get("/user/{user_id}/summary")
async def admin_get_user_summary(
    user_id: int,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to get comprehensive credit summary for a specific user"""
    try:
        credit_service = CreditService(db)
        summary = credit_service.get_credit_summary(user_id)
        return summary
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user summary: {str(e)}")

@router.get("/system/summary")
async def admin_get_system_summary(
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to get system-wide credit summary"""
    try:
        credit_service = CreditService(db)
        summary = credit_service.get_system_credit_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system summary: {str(e)}")

@router.get("/users/status")
async def admin_get_users_credit_status(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Page size"),
    status_filter: Optional[str] = Query(None, description="Filter by credit status"),
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to get paginated list of users with their credit status"""
    try:
        # This will be implemented when we have the User model properly set up
        # For now, return a placeholder
        return {
            "message": "User credit status endpoint - to be implemented",
            "users": [],
            "total_count": 0,
            "page": page,
            "page_size": page_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get users credit status: {str(e)}")
