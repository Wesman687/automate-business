"""
Credit service for managing user credits and transactions
"""
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta

from models import User, CreditTransaction
from services.base_service import BaseService
from services.stripe_service import StripeService
from services.email_service import EmailService

logger = logging.getLogger(__name__)

class CreditService(BaseService):
    """Service for managing user credits and transactions"""
    
    def __init__(self, db: Session):
        super().__init__(db)
        self.stripe_service = StripeService(db)
        self.email_service = EmailService()
    
    def get_user_credits(self, user_id: int) -> int:
        """Get current credit balance for a user"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return 0
            return user.credits or 0
        except Exception as e:
            logger.error(f"Error getting credits for user {user_id}: {str(e)}")
            return 0
    
    def add_credits(self, user_id: int, amount: int, description: str, transaction_type: str = "admin") -> bool:
        """Add credits to user account"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return False
            
            # Update user credits
            user.credits = (user.credits or 0) + amount
            user.updated_at = datetime.utcnow()
            
            # Create transaction record
            transaction = CreditTransaction(
                user_id=user_id,
                amount=amount,
                description=description,
                transaction_type=transaction_type,
                created_at=datetime.utcnow()
            )
            
            self.db.add(transaction)
            self.db.commit()
            
            logger.info(f"Added {amount} credits to user {user_id}: {description}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding credits for user {user_id}: {str(e)}")
            self.db.rollback()
            return False
    
    def deduct_credits(self, user_id: int, amount: int, description: str, transaction_type: str = "service") -> bool:
        """Deduct credits from user account"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return False
            
            current_credits = user.credits or 0
            if current_credits < amount:
                logger.warning(f"Insufficient credits for user {user_id}: {current_credits} < {amount}")
                return False
            
            # Update user credits
            user.credits = current_credits - amount
            user.updated_at = datetime.utcnow()
            
            # Create transaction record
            transaction = CreditTransaction(
                user_id=user_id,
                amount=-amount,  # Negative for deduction
                description=description,
                transaction_type=transaction_type,
                created_at=datetime.utcnow()
            )
            
            self.db.add(transaction)
            self.db.commit()
            
            logger.info(f"Deducted {amount} credits from user {user_id}: {description}")
            return True
            
        except Exception as e:
            logger.error(f"Error deducting credits for user {user_id}: {str(e)}")
            self.db.rollback()
            return False
    
    def get_transaction_history(self, user_id: int, limit: int = 50) -> List[CreditTransaction]:
        """Get transaction history for a user"""
        try:
            return self.db.query(CreditTransaction).filter(
                CreditTransaction.user_id == user_id
            ).order_by(CreditTransaction.created_at.desc()).limit(limit).all()
        except Exception as e:
            logger.error(f"Error getting transaction history for user {user_id}: {str(e)}")
            return []
