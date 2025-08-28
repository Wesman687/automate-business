"""
Payment-related database models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class InvoiceStatus(enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    
    # Status and dates
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT, nullable=False)
    issue_date = Column(DateTime(timezone=True), server_default=func.now())
    due_date = Column(DateTime(timezone=True), nullable=False)
    paid_date = Column(DateTime(timezone=True), nullable=True)
    
    # Description and notes
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Stripe integration
    stripe_invoice_id = Column(String(255), nullable=True, unique=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("User")
    
    def __repr__(self):
        return f"<Invoice(id={self.id}, invoice_number='{self.invoice_number}', amount={self.amount})>"

class RecurringPayment(Base):
    __tablename__ = "recurring_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    
    # Billing cycle
    billing_cycle = Column(String(20), nullable=False)  # monthly, quarterly, yearly
    next_billing_date = Column(DateTime(timezone=True), nullable=False)
    
    # Status
    status = Column(String(20), default="active")  # active, paused, cancelled
    is_active = Column(Boolean, default=True)
    
    # Description
    description = Column(Text, nullable=True)
    
    # Stripe integration
    stripe_subscription_id = Column(String(255), nullable=True, unique=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("User")
    
    def __repr__(self):
        return f"<RecurringPayment(id={self.id}, customer_id={self.customer_id}, amount={self.amount})>"

class TimeEntry(Base):
    __tablename__ = "time_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)
    
    # Time tracking
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_hours = Column(Float, nullable=True)
    
    # Description and billing
    description = Column(Text, nullable=False)
    billable = Column(Boolean, nullable=True)
    hourly_rate = Column(Float, nullable=True)
    amount = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    admin = relationship("User", foreign_keys=[admin_id])
    job = relationship("Job", back_populates="time_entries")
    
    def __repr__(self):
        return f"<TimeEntry(id={self.id}, admin_id={self.admin_id}, duration_hours={self.duration_hours})>"
