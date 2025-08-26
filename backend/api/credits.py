from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from database import get_db
from services.credit_service import CreditService
from schemas.credits import (
    CreditBalance, CreditTransactionHistory, CreditTransaction,
    AddCreditsRequest, RemoveCreditsRequest
)
from api.auth import get_current_user
from core.exceptions import (
    InsufficientCreditsError, CreditServiceError, UserNotFoundError,
    InvalidAmountError, TransactionError
)

router = APIRouter(prefix="/credits", tags=["credits"])

@router.get("/balance", response_model=CreditBalance)
async def get_credit_balance(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current credit balance for the authenticated user"""
    try:
        credit_service = CreditService(db)
        return credit_service.get_user_balance(current_user.id)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get credit balance")

@router.get("/summary")
async def get_credit_summary(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive credit summary for the authenticated user"""
    try:
        credit_service = CreditService(db)
        return credit_service.get_credit_summary(current_user.id)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get credit summary")

@router.get("/transactions", response_model=CreditTransactionHistory)
async def get_transaction_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Page size"),
    transaction_type: Optional[str] = Query(None, description="Filter by transaction type"),
    start_date: Optional[datetime] = Query(None, description="Filter transactions from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter transactions until this date"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get paginated transaction history for the authenticated user"""
    try:
        credit_service = CreditService(db)
        return credit_service.get_transaction_history(
            user_id=current_user.id,
            page=page,
            page_size=page_size,
            transaction_type=transaction_type,
            start_date=start_date,
            end_date=end_date
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get transaction history")

@router.post("/purchase/validate")
async def validate_credit_purchase(
    amount: int = Query(..., gt=0, description="Credits to purchase"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Validate if user can purchase credits and get estimated cost"""
    try:
        credit_service = CreditService(db)
        return credit_service.validate_credit_purchase(current_user.id, amount)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to validate credit purchase")

@router.post("/purchase", response_model=CreditTransaction)
async def purchase_credits(
    amount: int = Query(..., gt=0, description="Credits to purchase"),
    description: str = Query(..., description="Purchase description"),
    stripe_payment_intent_id: Optional[str] = Query(None, description="Stripe payment intent ID"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase credits (requires successful Stripe payment)"""
    try:
        credit_service = CreditService(db)
        return credit_service.add_credits(
            user_id=current_user.id,
            amount=amount,
            description=description,
            transaction_type="purchase",
            stripe_payment_intent_id=stripe_payment_intent_id,
            metadata={"purchase_type": "one_time"}
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except CreditServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to purchase credits")

@router.get("/rate")
async def get_credit_rate():
    """Get current credit rate (price per credit)"""
    return {
        "credit_rate": 0.10,
        "currency": "USD",
        "description": "Each credit costs $0.10"
    }

@router.get("/packages")
async def get_credit_packages(
    db: Session = Depends(get_db)
):
    """Get available credit subscription packages"""
    # This will be implemented when CreditPackage model is available
    return {
        "message": "Credit packages endpoint - to be implemented",
        "packages": []
    }
