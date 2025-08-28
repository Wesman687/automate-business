#!/usr/bin/env python3
"""
Credit client service for managing credit operations
"""
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta
import hashlib
import secrets

from models import User, CreditTransaction
from services.base_service import BaseService
from services.stripe_service import StripeService
from services.email_service import EmailService
from core.exceptions import InsufficientCreditsError, UserNotFoundError, CreditServiceError
from database import get_db

logger = logging.getLogger(__name__)


class CreditClient:
    """
    Main client for integrating with the credit system.
    
    Usage:
        # Initialize client
        credit_client = CreditClient()
        
        # Check if user can afford a service
        if credit_client.can_afford(user_id, 10):
            # Execute service
            result = execute_service()
            # Deduct credits
            credit_client.consume_credits(user_id, 10, "AI Service", {"service": "chat", "tokens": 100})
        else:
            raise InsufficientCreditsError("Not enough credits")
    """
    
    def __init__(self, db_session: Optional[Session] = None):
        """
        Initialize the credit client.
        
        Args:
            db_session: Optional database session. If not provided, will create one.
        """
        self.db_session = db_session or next(get_db())
    
    def get_user_balance(self, user_id: int) -> int:
        """
        Get the current credit balance for a user.
        
        Args:
            user_id: The user's ID
            
        Returns:
            Current credit balance
            
        Raises:
            UserNotFoundError: If user doesn't exist
        """
        try:
            user = self.db_session.query(User).filter(User.id == user_id).first()
            if not user:
                raise UserNotFoundError(f"User {user_id} not found")
            
            # Calculate balance from transactions
            transactions = self.db_session.query(CreditTransaction).filter(
                CreditTransaction.user_id == user_id
            ).all()
            
            balance = sum(
                t.amount if t.amount else 0 
                for t in transactions 
                if t.amount is not None
            )
            
            logger.info(f"User {user_id} has {balance} credits")
            return balance
            
        except Exception as e:
            logger.error(f"Error getting balance for user {user_id}: {e}")
            raise CreditServiceError(f"Failed to get balance: {e}")
    
    def can_afford(self, user_id: int, credits_needed: int) -> bool:
        """
        Check if a user can afford a service.
        
        Args:
            user_id: The user's ID
            credits_needed: Number of credits required
            
        Returns:
            True if user can afford, False otherwise
        """
        try:
            balance = self.get_user_balance(user_id)
            return balance >= credits_needed
        except Exception as e:
            logger.error(f"Error checking affordability for user {user_id}: {e}")
            return False
    
    def consume_credits(
        self, 
        user_id: int, 
        credits: int, 
        description: str, 
        metadata: Optional[Dict[str, Any]] = None,
        job_id: Optional[str] = None
    ) -> CreditTransaction:
        """
        Consume credits for a service.
        
        Args:
            user_id: The user's ID
            credits: Number of credits to consume (positive number)
            description: Description of what the credits were used for
            metadata: Optional metadata about the service
            job_id: Optional job ID if this is related to a specific job
            
        Returns:
            The created credit transaction
            
        Raises:
            InsufficientCreditsError: If user doesn't have enough credits
            UserNotFoundError: If user doesn't exist
        """
        try:
            # Check if user can afford
            if not self.can_afford(user_id, credits):
                raise InsufficientCreditsError(
                    f"User {user_id} doesn't have enough credits. "
                    f"Required: {credits}, Available: {self.get_user_balance(user_id)}"
                )
            
            # Create negative transaction (consuming credits)
            transaction = CreditTransaction(
                user_id=user_id,
                amount=-credits,  # Negative for consumption
                description=description,
                job_id=job_id,
                transaction_type='service',
                transaction_metadata=metadata or {},
                created_at=datetime.utcnow()
            )
            
            self.db_session.add(transaction)
            self.db_session.commit()
            
            logger.info(f"Consumed {credits} credits from user {user_id} for: {description}")
            return transaction
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"Error consuming credits for user {user_id}: {e}")
            raise CreditServiceError(f"Failed to consume credits: {e}")
    
    def add_credits(
        self, 
        user_id: int, 
        credits: int, 
        description: str, 
        metadata: Optional[Dict[str, Any]] = None,
        admin_id: Optional[int] = None
    ) -> CreditTransaction:
        """
        Add credits to a user's account.
        
        Args:
            user_id: The user's ID
            credits: Number of credits to add (positive number)
            description: Description of why credits were added
            metadata: Optional metadata about the credit addition
            admin_id: Optional admin ID if added by admin
            
        Returns:
            The created credit transaction
            
        Raises:
            UserNotFoundError: If user doesn't exist
        """
        try:
            # Create positive transaction (adding credits)
            transaction = CreditTransaction(
                user_id=user_id,
                amount=credits,  # Positive for addition
                description=description,
                transaction_type='credit_addition',
                transaction_metadata={
                    **(metadata or {}),
                    'admin_id': admin_id,
                    'method': 'admin_addition' if admin_id else 'system_addition'
                },
                created_at=datetime.utcnow()
            )
            
            self.db_session.add(transaction)
            self.db_session.commit()
            
            logger.info(f"Added {credits} credits to user {user_id} for: {description}")
            return transaction
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"Error adding credits for user {user_id}: {e}")
            raise CreditServiceError(f"Failed to add credits: {e}")
    
    def get_credit_rate(self) -> float:
        """
        Get the current credit rate (dollars per credit).
        
        Returns:
            Credit rate as a float (e.g., 0.10 for $0.10 per credit)
        """
        return 0.10  # $0.10 per credit
    
    def get_credit_cost(self, credits: int) -> float:
        """
        Calculate the cost in dollars for a given number of credits.
        
        Args:
            credits: Number of credits
            
        Returns:
            Cost in dollars
        """
        return credits * self.get_credit_rate()
    
    def get_credits_for_dollars(self, dollars: float) -> int:
        """
        Calculate how many credits a user gets for a given dollar amount.
        
        Args:
            dollars: Dollar amount
            
        Returns:
            Number of credits
        """
        return int(dollars / self.get_credit_rate())
    
    def get_transaction_history(
        self, 
        user_id: int, 
        limit: int = 50, 
        offset: int = 0
    ) -> List[CreditTransaction]:
        """
        Get credit transaction history for a user.
        
        Args:
            user_id: The user's ID
            limit: Maximum number of transactions to return
            offset: Number of transactions to skip
            
        Returns:
            List of credit transactions
        """
        try:
            transactions = self.db_session.query(CreditTransaction).filter(
                CreditTransaction.user_id == user_id
            ).order_by(
                CreditTransaction.created_at.desc()
            ).offset(offset).limit(limit).all()
            
            return transactions
            
        except Exception as e:
            logger.error(f"Error getting transaction history for user {user_id}: {e}")
            return []
    
    def get_credit_summary(self, user_id: int) -> Dict[str, Any]:
        """
        Get a summary of credit usage for a user.
        
        Args:
            user_id: The user's ID
            
        Returns:
            Dictionary with credit summary information
        """
        try:
            balance = self.get_user_balance(user_id)
            transactions = self.get_transaction_history(user_id, limit=1000)
            
            # Calculate usage statistics
            total_earned = sum(t.amount for t in transactions if t.amount and t.amount > 0)
            total_spent = abs(sum(t.amount for t in transactions if t.amount and t.amount < 0))
            
            # Monthly usage (last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            monthly_transactions = [t for t in transactions if t.created_at >= thirty_days_ago]
            monthly_spent = abs(sum(t.amount for t in monthly_transactions if t.amount and t.amount < 0))
            
            return {
                'current_balance': balance,
                'total_earned': total_earned,
                'total_spent': total_spent,
                'monthly_spent': monthly_spent,
                'credit_rate': self.get_credit_rate(),
                'monthly_cost': self.get_credit_cost(monthly_spent),
                'total_cost': self.get_credit_cost(total_spent)
            }
            
        except Exception as e:
            logger.error(f"Error getting credit summary for user {user_id}: {e}")
            return {}
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        if not self.db_session:
            return
        try:
            if exc_type is None:
                self.db_session.commit()
            else:
                self.db_session.rollback()
        finally:
            self.db_session.close()


# Convenience functions for quick operations
def quick_credit_check(user_id: int, credits_needed: int) -> bool:
    """Quick check if user can afford credits."""
    with CreditClient() as client:
        return client.can_afford(user_id, credits_needed)


def quick_credit_consumption(
    user_id: int, 
    credits: int, 
    description: str, 
    metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """Quick credit consumption with automatic error handling."""
    try:
        with CreditClient() as client:
            client.consume_credits(user_id, credits, description, metadata)
            return True
    except InsufficientCreditsError:
        logger.warning(f"User {user_id} doesn't have enough credits for {description}")
        return False
    except Exception as e:
        logger.error(f"Error consuming credits for user {user_id}: {e}")
        return False


def get_user_credit_status(user_id: int) -> Dict[str, Any]:
    """Get comprehensive credit status for a user."""
    with CreditClient() as client:
        return {
            'balance': client.get_user_balance(user_id),
            'can_afford_1_credit': client.can_afford(user_id, 1),
            'can_afford_10_credits': client.can_afford(user_id, 10),
            'can_afford_100_credits': client.can_afford(user_id, 100),
            'summary': client.get_credit_summary(user_id)
        }
