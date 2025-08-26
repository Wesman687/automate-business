#!/usr/bin/env python3
"""
Minimal Credit System SDK - All-in-one file for easy integration

Just copy this file to your project and you're ready to go!
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)


class CreditSDK:
    """
    Minimal Credit System SDK - Everything you need in one file.
    
    Usage:
        # Initialize
        credit_sdk = CreditSDK("postgresql://user:pass@localhost/db")
        
        # Check if user can afford
        if credit_sdk.can_afford(user_id, 5):
            # Execute service
            result = execute_service()
            # Consume credits
            credit_sdk.consume_credits(user_id, 5, "AI Service")
    """
    
    def __init__(self, database_url: str):
        """Initialize with your database URL."""
        self.engine = create_engine(database_url)
        self.Session = sessionmaker(bind=self.engine)
    
    def get_balance(self, user_id: int) -> int:
        """Get user's current credit balance."""
        with self.Session() as session:
            result = session.execute(
                text("SELECT COALESCE(SUM(amount), 0) FROM credits_transactions WHERE user_id = :user_id"),
                {"user_id": user_id}
            )
            return int(result.scalar() or 0)
    
    def can_afford(self, user_id: int, credits_needed: int) -> bool:
        """Check if user can afford credits."""
        return self.get_balance(user_id) >= credits_needed
    
    def consume_credits(self, user_id: int, credits: int, description: str, metadata: Dict = None) -> bool:
        """Consume credits for a service. Returns True if successful."""
        try:
            with self.Session() as session:
                # Check if user can afford
                if not self.can_afford(user_id, credits):
                    logger.warning(f"User {user_id} doesn't have enough credits for {description}")
                    return False
                
                # Create negative transaction (consuming credits)
                session.execute(
                    text("""
                        INSERT INTO credits_transactions 
                        (user_id, amount, description, transaction_type, transaction_metadata, created_at)
                        VALUES (:user_id, :amount, :description, 'service', :metadata, :created_at)
                    """),
                    {
                        "user_id": user_id,
                        "amount": -credits,
                        "description": description,
                        "metadata": str(metadata or {}),
                        "created_at": datetime.utcnow()
                    }
                )
                session.commit()
                logger.info(f"Consumed {credits} credits from user {user_id} for: {description}")
                return True
                
        except Exception as e:
            logger.error(f"Error consuming credits: {e}")
            return False
    
    def add_credits(self, user_id: int, credits: int, description: str, admin_id: int = None) -> bool:
        """Add credits to user account. Returns True if successful."""
        try:
            with self.Session() as session:
                session.execute(
                    text("""
                        INSERT INTO credits_transactions 
                        (user_id, amount, description, transaction_type, transaction_metadata, created_at)
                        VALUES (:user_id, :amount, :description, 'credit_addition', :metadata, :created_at)
                    """),
                    {
                        "user_id": user_id,
                        "amount": credits,
                        "description": description,
                        "metadata": str({"admin_id": admin_id, "method": "admin_addition" if admin_id else "system_addition"}),
                        "created_at": datetime.utcnow()
                    }
                )
                session.commit()
                logger.info(f"Added {credits} credits to user {user_id} for: {description}")
                return True
                
        except Exception as e:
            logger.error(f"Error adding credits: {e}")
            return False


# ============================================================================
# EASY DECORATORS - Just add these to your functions!
# ============================================================================

def consume_credits(credits: int, description: str):
    """
    Decorator to automatically consume credits before executing a service.
    
    Usage:
        @consume_credits(5, "AI Chat Service")
        def chat_with_ai(user_id: int, message: str):
            return ai_service.chat(message)
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Find user_id in function arguments
            user_id = None
            if 'user_id' in kwargs:
                user_id = kwargs['user_id']
            elif args and hasattr(args[0], '__class__'):  # Method call
                user_id = args[1] if len(args) > 1 else None
            else:  # Function call
                user_id = args[0] if args else None
            
            if not user_id:
                raise ValueError("user_id parameter not found")
            
            # Initialize SDK (you'll need to set your database URL)
            credit_sdk = CreditSDK("YOUR_DATABASE_URL_HERE")
            
            # Consume credits
            if not credit_sdk.consume_credits(user_id, credits, description):
                raise Exception(f"Not enough credits for {description}")
            
            # Execute the function
            return func(*args, **kwargs)
        return wrapper
    return decorator


def require_credits(credits: int, description: str):
    """
    Decorator to check if user has enough credits without consuming them.
    
    Usage:
        @require_credits(10, "Premium Service")
        def premium_service(user_id: int, data: dict):
            return process_data(data)
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Find user_id in function arguments
            user_id = None
            if 'user_id' in kwargs:
                user_id = kwargs['user_id']
            elif args and hasattr(args[0], '__class__'):  # Method call
                user_id = args[1] if len(args) > 1 else None
            else:  # Function call
                user_id = args[0] if args else None
            
            if not user_id:
                raise ValueError("user_id parameter not found")
            
            # Initialize SDK
            credit_sdk = CreditSDK("YOUR_DATABASE_URL_HERE")
            
            # Check if user can afford
            if not credit_sdk.can_afford(user_id, credits):
                raise Exception(f"Not enough credits for {description}")
            
            # Execute the function
            return func(*args, **kwargs)
        return wrapper
    return decorator


# ============================================================================
# QUICK FUNCTIONS - For simple operations
# ============================================================================

def quick_credit_check(database_url: str, user_id: int, credits_needed: int) -> bool:
    """Quick check if user can afford credits."""
    credit_sdk = CreditSDK(database_url)
    return credit_sdk.can_afford(user_id, credits_needed)


def quick_credit_consumption(database_url: str, user_id: int, credits: int, description: str) -> bool:
    """Quick credit consumption with automatic error handling."""
    credit_sdk = CreditSDK(database_url)
    return credit_sdk.consume_credits(user_id, credits, description)


# ============================================================================
# USAGE EXAMPLES - Copy these patterns for your services!
# ============================================================================

"""
# EXAMPLE 1: Simple AI Chat Service
@consume_credits(5, "AI Chat Service")
def chat_with_ai(user_id: int, message: str):
    return ai_service.chat(message)

# EXAMPLE 2: File Processing Service
@consume_credits(10, "File Processing")
def process_file(user_id: int, file_path: str):
    return file_processor.process(file_path)

# EXAMPLE 3: Manual Credit Management
def complex_service(user_id: int, data: dict):
    credit_sdk = CreditSDK("YOUR_DATABASE_URL")
    
    if credit_sdk.can_afford(user_id, 20):
        result = execute_service(data)
        credit_sdk.consume_credits(user_id, 20, "Complex Service")
        return result
    else:
        raise Exception("Not enough credits")

# EXAMPLE 4: Quick Operations
if quick_credit_check("YOUR_DATABASE_URL", user_id, 5):
    result = execute_service()
    quick_credit_consumption("YOUR_DATABASE_URL", user_id, 5, "Service")
    return result
"""


if __name__ == "__main__":
    # Test the SDK
    print("Credit SDK loaded successfully!")
    print("Copy this file to your project and start using the decorators!")
