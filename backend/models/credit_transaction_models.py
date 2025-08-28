"""
Credit transaction database models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class TransactionType(enum.Enum):
    PURCHASE = "purchase"
    USAGE = "usage"
    REFUND = "refund"
    BONUS = "bonus"
    TRANSFER = "transfer"
    ADJUSTMENT = "adjustment"

class TransactionStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class CreditTransaction(Base):
    __tablename__ = "credits_transactions"
    
    # Updated to match actual database structure
    id = Column(String, primary_key=True, index=True)  # Changed from Integer to String
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Fields that actually exist in the database
    job_id = Column(String(255), nullable=True)
    amount = Column(Integer, nullable=False)  # This is the actual field name
    description = Column(Text, nullable=False)
    
    # Additional fields from database
    subscription_id = Column(Integer, ForeignKey("user_subscriptions.id"), nullable=True)
    transaction_type = Column(String(50), nullable=True, default='service')
    dollar_amount = Column(Numeric(10, 2), nullable=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    transaction_metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="credit_transactions")
    disputes = relationship("CreditDispute", back_populates="transaction")
    
    def __repr__(self):
        return f"<CreditTransaction(id={self.id}, user_id={self.user_id}, amount={self.amount}, description='{self.description}')>"
