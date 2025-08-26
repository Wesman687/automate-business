import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from sqlalchemy.exc import IntegrityError

from database.models import User, CreditTransaction
from schemas.credits import (
    CreditTransactionCreate, CreditTransaction as CreditTransactionSchema,
    TransactionType, CreditBalance, CreditTransactionHistory
)
from core.exceptions import (
    InsufficientCreditsError, CreditServiceError, UserNotFoundError,
    InvalidAmountError, TransactionError
)

class CreditService:
    """Core service for managing user credits and transactions"""
    
    def __init__(self, db: Session):
        self.db = db
        self.credit_rate = Decimal('0.10')  # $0.10 per credit
    
    def get_user_balance(self, user_id: int) -> CreditBalance:
        """Get current credit balance and status for a user"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        
        # Get active subscription (placeholder until UserSubscription model is available)
        subscription = None
        
        return CreditBalance(
            user_id=user.id,
            current_credits=user.credits,
            credit_status=user.credit_status,
            subscription=subscription,
            next_billing_date=None
        )
    
    def add_credits(
        self, 
        user_id: int, 
        amount: int, 
        description: str, 
        transaction_type: TransactionType = TransactionType.ADMIN,
        subscription_id: Optional[int] = None,
        job_id: Optional[str] = None,
        dollar_amount: Optional[Decimal] = None,
        stripe_payment_intent_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> CreditTransactionSchema:
        """Add credits to user account"""
        if amount <= 0:
            raise InvalidAmountError("Amount must be positive")
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        
        # Check if credit service is paused
        if user.credit_status == 'paused':
            raise CreditServiceError("Credit service is paused for this user")
        
        try:
            # Create transaction record
            transaction = CreditTransaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                amount=amount,
                description=description,
                transaction_type=transaction_type,
                subscription_id=subscription_id,
                job_id=job_id,
                dollar_amount=dollar_amount or (Decimal(amount) * self.credit_rate),
                stripe_payment_intent_id=stripe_payment_intent_id,
                metadata=metadata or {}
            )
            
            # Update user balance
            user.credits += amount
            user.updated_at = datetime.utcnow()
            
            # Save to database
            self.db.add(transaction)
            self.db.commit()
            self.db.refresh(transaction)
            
            return CreditTransactionSchema.from_orm(transaction)
            
        except IntegrityError as e:
            self.db.rollback()
            raise TransactionError(f"Failed to add credits: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise CreditServiceError(f"Unexpected error adding credits: {str(e)}")
    
    def spend_credits(
        self, 
        user_id: int, 
        amount: int, 
        description: str, 
        job_id: Optional[str] = None,
        subscription_id: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> CreditTransactionSchema:
        """Spend credits from user account"""
        if amount <= 0:
            raise InvalidAmountError("Amount must be positive")
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        
        # Check if credit service is paused
        if user.credit_status == 'paused':
            raise CreditServiceError("Credit service is paused for this user")
        
        # Check if user has sufficient credits
        if user.credits < amount:
            raise InsufficientCreditsError(
                f"Insufficient credits. Required: {amount}, Available: {user.credits}"
            )
        
        try:
            # Create transaction record (negative amount for spending)
            transaction = CreditTransaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                amount=-amount,  # Negative for spending
                description=description,
                transaction_type=TransactionType.SERVICE,
                subscription_id=subscription_id,
                job_id=job_id,
                dollar_amount=Decimal(amount) * self.credit_rate,
                metadata=metadata or {}
            )
            
            # Update user balance
            user.credits -= amount
            user.updated_at = datetime.utcnow()
            
            # Save to database
            self.db.add(transaction)
            self.db.commit()
            self.db.refresh(transaction)
            
            return CreditTransactionSchema.from_orm(transaction)
            
        except IntegrityError as e:
            self.db.rollback()
            raise TransactionError(f"Failed to spend credits: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise CreditServiceError(f"Unexpected error spending credits: {str(e)}")
    
    def remove_credits(
        self, 
        user_id: int, 
        amount: int, 
        description: str, 
        admin_notes: Optional[str] = None
    ) -> CreditTransactionSchema:
        """Remove credits from user account (admin operation)"""
        if amount <= 0:
            raise InvalidAmountError("Amount must be positive")
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        
        # Check if user has sufficient credits
        if user.credits < amount:
            raise InsufficientCreditsError(
                f"Cannot remove {amount} credits. User only has {user.credits} credits"
            )
        
        try:
            # Create transaction record (negative amount for removal)
            transaction = CreditTransaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                amount=-amount,  # Negative for removal
                description=description,
                transaction_type=TransactionType.ADMIN,
                dollar_amount=Decimal(amount) * self.credit_rate,
                metadata={"admin_notes": admin_notes} if admin_notes else {}
            )
            
            # Update user balance
            user.credits -= amount
            user.updated_at = datetime.utcnow()
            
            # Save to database
            self.db.add(transaction)
            self.db.commit()
            self.db.refresh(transaction)
            
            return CreditTransactionSchema.from_orm(transaction)
            
        except IntegrityError as e:
            self.db.rollback()
            raise TransactionError(f"Failed to remove credits: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise CreditServiceError(f"Unexpected error removing credits: {str(e)}")
    
    def get_transaction_history(
        self, 
        user_id: int, 
        page: int = 1, 
        page_size: int = 50,
        transaction_type: Optional[TransactionType] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> CreditTransactionHistory:
        """Get paginated transaction history for a user"""
        query = self.db.query(CreditTransaction).filter(
            CreditTransaction.user_id == user_id
        )
        
        # Apply filters
        if transaction_type:
            query = query.filter(CreditTransaction.transaction_type == transaction_type)
        
        if start_date:
            query = query.filter(CreditTransaction.created_at >= start_date)
        
        if end_date:
            query = query.filter(CreditTransaction.created_at <= end_date)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination and ordering
        transactions = query.order_by(desc(CreditTransaction.created_at)).offset(
            (page - 1) * page_size
        ).limit(page_size).all()
        
        return CreditTransactionHistory(
            transactions=[CreditTransactionSchema.from_orm(t) for t in transactions],
            total_count=total_count,
            page=page,
            page_size=page_size
        )
    
    def get_credit_summary(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive credit summary for a user"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        
        # Get current month transactions
        current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        current_month_transactions = self.db.query(CreditTransaction).filter(
            and_(
                CreditTransaction.user_id == user_id,
                CreditTransaction.created_at >= current_month_start
            )
        ).all()
        
        # Calculate monthly stats
        monthly_credits_added = sum(t.amount for t in current_month_transactions if t.amount > 0)
        monthly_credits_spent = abs(sum(t.amount for t in current_month_transactions if t.amount < 0))
        
        # Get active subscription (placeholder until UserSubscription model is available)
        subscription = None
        
        return {
            "current_balance": user.credits,
            "credit_status": user.credit_status,
            "monthly_credits_added": monthly_credits_added,
            "monthly_credits_spent": monthly_credits_spent,
            "monthly_net_change": monthly_credits_added - monthly_credits_spent,
            "subscription": subscription,
            "total_transactions": len(current_month_transactions),
            "credit_rate": float(self.credit_rate),
            "estimated_monthly_cost": float(monthly_credits_spent * self.credit_rate)
        }
    
    def validate_credit_purchase(self, user_id: int, amount: int) -> Dict[str, Any]:
        """Validate if a user can purchase credits"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        
        # Check if credit service is paused
        if user.credit_status == 'paused':
            return {
                "can_purchase": False,
                "reason": "Credit service is paused for this account",
                "estimated_cost": 0.0
            }
        
        # Calculate cost
        cost = amount * self.credit_rate
        
        return {
            "can_purchase": True,
            "estimated_cost": float(cost),
            "credit_rate": float(self.credit_rate),
            "credits_to_add": amount
        }
    
    def pause_credit_service(self, user_id: int, reason: str, admin_notes: Optional[str] = None) -> bool:
        """Pause credit service for a user"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        
        try:
            user.credit_status = 'paused'
            user.updated_at = datetime.utcnow()
            
            # Log the pause action
            self.add_credits(
                user_id=user_id,
                amount=0,  # No credits added, just logging
                description=f"Credit service paused: {reason}",
                transaction_type=TransactionType.ADMIN,
                metadata={"action": "pause", "reason": reason, "admin_notes": admin_notes}
            )
            
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            raise CreditServiceError(f"Failed to pause credit service: {str(e)}")
    
    def resume_credit_service(self, user_id: int, admin_notes: Optional[str] = None) -> bool:
        """Resume credit service for a user"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        
        try:
            user.credit_status = 'active'
            user.updated_at = datetime.utcnow()
            
            # Log the resume action
            self.add_credits(
                user_id=user_id,
                amount=0,  # No credits added, just logging
                description="Credit service resumed",
                transaction_type=TransactionType.ADMIN,
                metadata={"action": "resume", "admin_notes": admin_notes}
            )
            
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            raise CreditServiceError(f"Failed to resume credit service: {str(e)}")
    
    def get_system_credit_summary(self) -> Dict[str, Any]:
        """Get system-wide credit summary for admin dashboard"""
        # Total users with credits
        total_users = self.db.query(User).count()
        users_with_credits = self.db.query(User).filter(User.credits > 0).count()
        
        # Total credits in system
        total_credits = self.db.query(func.sum(User.credits)).scalar() or 0
        
        # Total credit value
        total_value = float(total_credits * self.credit_rate)
        
        # Recent transactions (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_transactions = self.db.query(CreditTransaction).filter(
            CreditTransaction.created_at >= yesterday
        ).count()
        
        # Credit status distribution
        status_counts = self.db.query(
            User.credit_status, 
            func.count(User.id)
        ).group_by(User.credit_status).all()
        
        # Convert to dictionary format
        status_distribution = {}
        for status, count in status_counts:
            status_distribution[status] = count
        
        return {
            "total_users": total_users,
            "users_with_credits": users_with_credits,
            "total_credits": total_credits,
            "total_value_usd": total_value,
            "recent_transactions_24h": recent_transactions,
            "credit_status_distribution": status_distribution,
            "credit_rate": float(self.credit_rate)
        }
