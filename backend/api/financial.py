"""
Financial API endpoints for credit management and financial operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import logging

from database import get_db
from models import User
from services.financial_service import FinancialService
from api.auth import get_current_user
from typing import List, Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/financial", tags=["financial"])


@router.get("/overview")
async def get_financial_overview(
    period: Optional[str] = Query('30', description="Period in days: 30, 90, or 365"),
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="admin")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get financial overview and statistics for admins"""
    try:
        # Validate admin permissions
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        financial_service = FinancialService(db)
        result = await financial_service.get_financial_dashboard(current_user, period)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting financial overview: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/reports")
async def generate_financial_reports(
    report_type: Optional[str] = Query('summary', description="Report type: summary, detailed, or custom"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="admin")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Generate financial reports for admins"""
    try:
        # Validate admin permissions
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        financial_service = FinancialService(db)
        result = await financial_service.generate_financial_report(
            report_type=report_type,
            start_date=start_date,
            end_date=end_date
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating financial report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/transactions")
async def get_financial_transactions(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    transaction_type: Optional[str] = Query(None, description="Filter by transaction type"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: Optional[int] = Query(100, description="Number of transactions to return"),
    offset: Optional[int] = Query(0, description="Number of transactions to skip"),
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="admin")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get financial transactions with filtering for admins"""
    try:
        # Validate admin permissions
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        financial_service = FinancialService(db)
        result = await financial_service.get_financial_transactions(
            user_id=user_id,
            transaction_type=transaction_type,
            start_date=start_date,
            end_date=end_date,
            limit=limit,
            offset=offset
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting financial transactions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# Admin Credit Management Endpoints
@router.get("/admin/credits/users/{user_id}")
async def get_user_credit_details(
    user_id: int,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="admin")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get detailed credit information for a specific user (admin only)"""
    try:
        # Validate admin permissions
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        financial_service = FinancialService(db)
        result = await financial_service.get_user_credit_details(user_id)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user credit details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/admin/credits/users/{user_id}/transactions")
async def get_user_credit_transactions(
    user_id: int,
    limit: Optional[int] = Query(100, description="Number of transactions to return"),
    offset: Optional[int] = Query(0, description="Number of transactions to skip"),
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="admin")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get credit transactions for a specific user (admin only)"""
    try:
        # Validate admin permissions
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        financial_service = FinancialService(db)
        result = await financial_service.get_financial_transactions(
            user_id=user_id,
            limit=limit,
            offset=offset
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user credit transactions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# Credits endpoints
@router.get("/credits/balance")
async def get_credits_balance(
    user_id: Optional[int] = Query(None, description="User ID (admin only)"),
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get credit balance for a user"""
    try:
        # If user_id is provided, admin access is required
        if user_id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required to view other users' credits"
            )
        
        # Use provided user_id or current user's id
        target_user_id = user_id if user_id else current_user.id
        
        financial_service = FinancialService(db)
        result = await financial_service.get_user_credits(target_user_id)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting credits balance: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# Customer billing endpoint
@router.get("/customer/billing")
async def get_customer_billing(
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get customer billing information including invoices, subscriptions, and disputes"""
    try:
        financial_service = FinancialService(db)
        result = await financial_service.get_customer_billing(current_user.id)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting customer billing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# Disputes endpoints
@router.post("/disputes")
async def create_dispute(
    dispute_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Create a new credit dispute"""
    try:
        financial_service = FinancialService(db)
        result = await financial_service.create_dispute(
            user_id=current_user.id,
            transaction_id=dispute_data.get('transaction_id'),
            reason=dispute_data.get('reason'),
            description=dispute_data.get('description'),
            requested_refund=dispute_data.get('requested_refund', 0)
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating dispute: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/disputes")
async def get_user_disputes(
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get user's disputes"""
    try:
        financial_service = FinancialService(db)
        result = await financial_service.get_user_disputes(current_user.id)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user disputes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/credits/{user_id}")
async def get_user_credits(
    user_id: int,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get credit balance and transaction history for a user"""
    try:
        # Validate user permissions
        if user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own credits"
            )
        
        financial_service = FinancialService(db)
        result = await financial_service.get_user_credits(user_id)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user credits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/credits/{user_id}/add")
async def add_credits(
    user_id: int,
    amount: int,
    description: str,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="admin")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Add credits to a user's account (admin only)"""
    try:
        # Validate admin permissions
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        financial_service = FinancialService(db)
        result = await financial_service.add_credits(
            user_id=user_id,
            amount=amount,
            description=description
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding credits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/credits/{user_id}/spend")
async def spend_credits(
    user_id: int,
    amount: int,
    description: str,
    job_id: str = None,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Spend credits from a user's account"""
    try:
        # Validate user permissions
        if user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only spend your own credits"
            )
        
        financial_service = FinancialService(db)
        result = await financial_service.spend_credits(
            user_id=user_id,
            amount=amount,
            description=description,
            job_id=job_id
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error spending credits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/subscriptions/{user_id}/summary")
async def get_subscription_summary(
    user_id: int,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get subscription summary for a user"""
    try:
        # Validate user permissions
        if user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own subscriptions"
            )
        
        financial_service = FinancialService(db)
        result = await financial_service.get_subscription_summary(user_id)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting subscription summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/admin/dashboard")
async def get_financial_dashboard(
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="admin")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get financial dashboard data for admins (legacy endpoint)"""
    try:
        financial_service = FinancialService(db)
        result = await financial_service.get_financial_dashboard(current_user)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting financial dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/subscriptions/{subscription_id}/renewal")
async def process_subscription_renewal(
    subscription_id: str,
    user_id: int,
    credits_to_add: int,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="admin")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Process subscription renewal and add credits (admin only)"""
    try:
        # Validate admin permissions
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        financial_service = FinancialService(db)
        result = await financial_service.process_subscription_renewal(
            subscription_id=subscription_id,
            user_id=user_id,
            credits_to_add=credits_to_add
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing subscription renewal: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
