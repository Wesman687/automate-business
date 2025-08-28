from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

# Import Base from database to avoid circular imports
from database import Base

class SubscriptionStatus(enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    TRIAL = "trial"

class DisputeStatus(enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"
    APPEALED = "appealed"

class DisputeResolution(enum.Enum):
    FULL_REFUND = "full_refund"
    PARTIAL_REFUND = "partial_refund"
    EXPLANATION = "explanation"
    REJECTED = "rejected"

class CreditPackage(Base):
    """Subscription package definitions with pricing and credit amounts"""
    __tablename__ = "credit_packages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)  # e.g., "Starter", "Professional", "Enterprise"
    description = Column(Text, nullable=True)
    
    # Pricing
    monthly_price = Column(Numeric(10, 2), nullable=False)  # e.g., 19.99, 49.99, 99.99
    credit_amount = Column(Integer, nullable=False)  # Credits included per month
    credit_rate = Column(Numeric(10, 4), nullable=False, default=0.1000)  # Price per credit (default $0.10)
    
    # Features and limits
    features = Column(JSON, nullable=True)  # Array of feature descriptions
    max_credits_per_month = Column(Integer, nullable=True)  # Monthly credit cap
    rollover_enabled = Column(Boolean, default=False)  # Can credits roll over to next month
    
    # Status and availability
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)  # Highlighted on pricing page
    sort_order = Column(Integer, default=0)  # Display order
    
    # Stripe integration
    stripe_price_id = Column(String(255), nullable=True, unique=True)
    stripe_product_id = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    subscriptions = relationship("UserSubscription", back_populates="package")
    
    def __repr__(self):
        return f"<CreditPackage(id={self.id}, name='{self.name}', price=${self.monthly_price}, credits={self.credit_amount})>"

class UserSubscription(Base):
    """Active user subscriptions and billing status"""
    __tablename__ = "user_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    package_id = Column(Integer, ForeignKey("credit_packages.id"), nullable=False, index=True)
    
    # Subscription details
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    next_billing_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)  # For cancelled subscriptions
    
    # Billing and credits
    current_month_credits = Column(Integer, nullable=False, default=0)  # Credits used this month
    monthly_credit_limit = Column(Integer, nullable=False)  # Credits included in package
    rollover_credits = Column(Integer, nullable=False, default=0)  # Credits from previous months
    
    # Stripe integration
    stripe_subscription_id = Column(String(255), nullable=True, unique=True)
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_invoice_id = Column(String(255), nullable=True)
    
    # Admin controls
    is_paused = Column(Boolean, default=False)
    pause_reason = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")
    package = relationship("CreditPackage", back_populates="subscriptions")
    # Removed credit_transactions relationship - database doesn't have proper foreign key structure
    
    def __repr__(self):
        return f"<UserSubscription(id={self.id}, user_id={self.user_id}, package_id={self.package_id}, status={self.status})>"

class CreditDispute(Base):
    """Credit dispute records with status tracking and resolution"""
    __tablename__ = "credit_disputes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    transaction_id = Column(String(255), ForeignKey("credits_transactions.id"), nullable=True, index=True)
    
    # Dispute details
    reason = Column(String(255), nullable=False)  # e.g., "Service not delivered", "Incorrect billing"
    description = Column(Text, nullable=False)  # Detailed explanation from user
    requested_refund = Column(Integer, nullable=True)  # Credits requested for refund
    
    # Status and resolution
    status = Column(Enum(DisputeStatus), default=DisputeStatus.PENDING, nullable=False)
    resolution = Column(Enum(DisputeResolution), nullable=True)
    resolved_amount = Column(Integer, nullable=True)  # Credits actually refunded
    
    # Admin handling
    admin_id = Column(Integer, ForeignKey("admin.id"), nullable=True)  # Admin handling the dispute
    admin_notes = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    # Timestamps
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="credit_disputes")
    transaction = relationship("CreditTransaction", back_populates="disputes")
    admin = relationship("Admin")
    
    def __repr__(self):
        return f"<CreditDispute(id={self.id}, user_id={self.user_id}, status={self.status}, reason='{self.reason}')>"

class CreditPromotion(Base):
    """Promotional offers and discounts for credit packages"""
    __tablename__ = "credit_promotions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)  # e.g., "Summer Sale", "New User Discount"
    description = Column(Text, nullable=True)
    
    # Promotion details
    discount_type = Column(String(50), nullable=False)  # "percentage", "fixed_amount", "free_credits"
    discount_value = Column(Numeric(10, 4), nullable=False)  # 0.25 for 25%, 10.00 for $10 off
    max_discount = Column(Numeric(10, 2), nullable=True)  # Maximum discount amount
    
    # Applicability
    package_ids = Column(JSON, nullable=True)  # Array of package IDs this applies to
    user_groups = Column(JSON, nullable=True)  # Array of user groups (e.g., "new_users", "enterprise")
    min_purchase = Column(Numeric(10, 2), nullable=True)  # Minimum purchase amount
    
    # Timing
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Usage limits
    max_uses = Column(Integer, nullable=True)  # Total number of times this can be used
    current_uses = Column(Integer, default=0)
    max_uses_per_user = Column(Integer, default=1)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<CreditPromotion(id={self.id}, name='{self.name}', discount={self.discount_value})>"
