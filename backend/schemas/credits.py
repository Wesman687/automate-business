from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum

# Enums
class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    TRIAL = "trial"

class DisputeStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"
    APPEALED = "appealed"

class DisputeResolution(str, Enum):
    FULL_REFUND = "full_refund"
    PARTIAL_REFUND = "partial_refund"
    EXPLANATION = "explanation"
    REJECTED = "rejected"

class TransactionType(str, Enum):
    SERVICE = "service"
    SUBSCRIPTION = "subscription"
    ADMIN = "admin"
    DISPUTE = "dispute"
    PURCHASE = "purchase"

# Base Models
class CreditPackageBase(BaseModel):
    name: str = Field(..., description="Package name (e.g., Starter, Professional, Enterprise)")
    description: Optional[str] = Field(None, description="Package description")
    monthly_price: Decimal = Field(..., ge=0, description="Monthly price in USD")
    credit_amount: int = Field(..., gt=0, description="Credits included per month")
    credit_rate: Decimal = Field(0.1000, ge=0, description="Price per credit (default $0.10)")
    features: Optional[List[str]] = Field(None, description="Array of feature descriptions")
    max_credits_per_month: Optional[int] = Field(None, gt=0, description="Monthly credit cap")
    rollover_enabled: bool = Field(False, description="Can credits roll over to next month")
    is_active: bool = Field(True, description="Package availability")
    is_featured: bool = Field(False, description="Highlighted on pricing page")
    sort_order: int = Field(0, description="Display order")

class CreditPackageCreate(CreditPackageBase):
    stripe_price_id: Optional[str] = Field(None, description="Stripe price ID")
    stripe_product_id: Optional[str] = Field(None, description="Stripe product ID")

class CreditPackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    monthly_price: Optional[Decimal] = Field(None, ge=0)
    credit_amount: Optional[int] = Field(None, gt=0)
    credit_rate: Optional[Decimal] = Field(None, ge=0)
    features: Optional[List[str]] = None
    max_credits_per_month: Optional[int] = Field(None, gt=0)
    rollover_enabled: Optional[bool] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    sort_order: Optional[int] = None
    stripe_price_id: Optional[str] = None
    stripe_product_id: Optional[str] = None

class CreditPackage(CreditPackageBase):
    id: int
    stripe_price_id: Optional[str] = None
    stripe_product_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Subscription Models
class UserSubscriptionBase(BaseModel):
    user_id: int = Field(..., description="User ID")
    package_id: int = Field(..., description="Credit package ID")
    status: SubscriptionStatus = Field(SubscriptionStatus.ACTIVE, description="Subscription status")
    start_date: datetime = Field(..., description="Subscription start date")
    next_billing_date: datetime = Field(..., description="Next billing date")
    end_date: Optional[datetime] = Field(None, description="Subscription end date")
    monthly_credit_limit: int = Field(..., gt=0, description="Monthly credit limit")
    current_month_credits: int = Field(0, ge=0, description="Credits used this month")
    rollover_credits: int = Field(0, ge=0, description="Rollover credits from previous months")
    is_paused: bool = Field(False, description="Admin pause status")
    pause_reason: Optional[str] = Field(None, description="Reason for pause")
    admin_notes: Optional[str] = Field(None, description="Admin notes")

class UserSubscriptionCreate(UserSubscriptionBase):
    stripe_subscription_id: Optional[str] = Field(None, description="Stripe subscription ID")
    stripe_customer_id: Optional[str] = Field(None, description="Stripe customer ID")

class UserSubscriptionUpdate(BaseModel):
    status: Optional[SubscriptionStatus] = None
    next_billing_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    current_month_credits: Optional[int] = Field(None, ge=0)
    rollover_credits: Optional[int] = Field(None, ge=0)
    is_paused: Optional[bool] = None
    pause_reason: Optional[str] = None
    admin_notes: Optional[str] = None
    stripe_invoice_id: Optional[str] = None

class UserSubscription(UserSubscriptionBase):
    id: int
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    stripe_invoice_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    package: CreditPackage
    
    class Config:
        from_attributes = True

# Dispute Models
class CreditDisputeBase(BaseModel):
    user_id: int = Field(..., description="User ID")
    transaction_id: Optional[str] = Field(None, description="Related credit transaction ID")
    reason: str = Field(..., min_length=1, max_length=255, description="Dispute reason")
    description: str = Field(..., min_length=10, description="Detailed explanation")
    requested_refund: Optional[int] = Field(None, ge=0, description="Credits requested for refund")

class CreditDisputeCreate(CreditDisputeBase):
    pass

class CreditDisputeUpdate(BaseModel):
    status: Optional[DisputeStatus] = None
    resolution: Optional[DisputeResolution] = None
    resolved_amount: Optional[int] = Field(None, ge=0)
    admin_notes: Optional[str] = None
    resolution_notes: Optional[str] = None

class CreditDispute(CreditDisputeBase):
    id: int
    status: DisputeStatus = DisputeStatus.PENDING
    resolution: Optional[DisputeResolution] = None
    resolved_amount: Optional[int] = None
    admin_id: Optional[int] = None
    admin_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Transaction Models
class CreditTransactionBase(BaseModel):
    user_id: int = Field(..., description="User ID")
    amount: int = Field(..., description="Credit amount (negative for spending)")
    description: str = Field(..., min_length=1, description="Transaction description")
    transaction_type: TransactionType = Field(TransactionType.SERVICE, description="Transaction type")
    subscription_id: Optional[int] = Field(None, description="Related subscription ID")
    job_id: Optional[str] = Field(None, description="Related job ID")
    dollar_amount: Optional[Decimal] = Field(None, ge=0, description="Dollar value")
    stripe_payment_intent_id: Optional[str] = Field(None, description="Stripe payment intent ID")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class CreditTransactionCreate(CreditTransactionBase):
    pass

class CreditTransaction(CreditTransactionBase):
    id: str
    created_at: datetime
    subscription: Optional[UserSubscription] = None
    
    class Config:
        from_attributes = True

# Promotion Models
class CreditPromotionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Promotion name")
    description: Optional[str] = Field(None, description="Promotion description")
    discount_type: str = Field(..., description="Discount type: percentage, fixed_amount, free_credits")
    discount_value: Decimal = Field(..., description="Discount value (0.25 for 25%, 10.00 for $10 off)")
    max_discount: Optional[Decimal] = Field(None, ge=0, description="Maximum discount amount")
    package_ids: Optional[List[int]] = Field(None, description="Applicable package IDs")
    user_groups: Optional[List[str]] = Field(None, description="Applicable user groups")
    min_purchase: Optional[Decimal] = Field(None, ge=0, description="Minimum purchase amount")
    start_date: datetime = Field(..., description="Promotion start date")
    end_date: datetime = Field(..., description="Promotion end date")
    is_active: bool = Field(True, description="Promotion availability")
    max_uses: Optional[int] = Field(None, gt=0, description="Total usage limit")
    max_uses_per_user: int = Field(1, gt=0, description="Usage limit per user")

class CreditPromotionCreate(CreditPromotionBase):
    pass

class CreditPromotionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    discount_value: Optional[Decimal] = Field(None, ge=0)
    max_discount: Optional[Decimal] = Field(None, ge=0)
    package_ids: Optional[List[int]] = None
    user_groups: Optional[List[str]] = None
    min_purchase: Optional[Decimal] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    max_uses: Optional[int] = Field(None, gt=0)
    max_uses_per_user: Optional[int] = Field(None, gt=0)

class CreditPromotion(CreditPromotionBase):
    id: int
    current_uses: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Response Models
class CreditBalance(BaseModel):
    user_id: int
    current_credits: int
    credit_status: str
    subscription: Optional[UserSubscription] = None
    next_billing_date: Optional[datetime] = None

class CreditTransactionHistory(BaseModel):
    transactions: List[CreditTransaction]
    total_count: int
    page: int
    page_size: int

class DisputeQueue(BaseModel):
    disputes: List[CreditDispute]
    total_count: int
    pending_count: int
    under_review_count: int

class SubscriptionSummary(BaseModel):
    active_subscriptions: int
    total_monthly_revenue: Decimal
    average_credits_per_user: float
    paused_subscriptions: int

# Request Models
class AddCreditsRequest(BaseModel):
    user_id: int
    amount: int = Field(..., gt=0, description="Credits to add")
    reason: str = Field(..., min_length=1, description="Reason for adding credits")
    admin_notes: Optional[str] = Field(None, description="Admin notes")

class RemoveCreditsRequest(BaseModel):
    user_id: int
    amount: int = Field(..., gt=0, description="Credits to remove")
    reason: str = Field(..., min_length=1, description="Reason for removing credits")
    admin_notes: Optional[str] = Field(None, description="Admin notes")

class PauseCreditServiceRequest(BaseModel):
    user_id: int
    reason: str = Field(..., min_length=1, description="Reason for pausing service")
    admin_notes: Optional[str] = Field(None, description="Admin notes")

class ResumeCreditServiceRequest(BaseModel):
    user_id: int
    admin_notes: Optional[str] = Field(None, description="Admin notes")

class DisputeResolutionRequest(BaseModel):
    dispute_id: int
    resolution: DisputeResolution
    resolved_amount: Optional[int] = Field(None, ge=0, description="Credits to refund")
    resolution_notes: str = Field(..., min_length=1, description="Resolution explanation")
    admin_notes: Optional[str] = Field(None, description="Admin notes")

# Validation
@validator('end_date')
def validate_end_date(cls, v, values):
    if v and 'start_date' in values and v <= values['start_date']:
        raise ValueError('End date must be after start date')
    return v

@validator('end_date')
def validate_promotion_dates(cls, v, values):
    if v and 'start_date' in values and v <= values['start_date']:
        raise ValueError('End date must be after start date')
    return v
