"""
Pydantic schemas for Stripe API requests and responses.
"""
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any
from datetime import datetime


class CheckoutSessionCreate(BaseModel):
    """Request schema for creating a checkout session"""
    user_id: int
    price_id: str
    success_url: HttpUrl
    cancel_url: HttpUrl
    mode: str = "subscription"  # "payment" or "subscription"
    metadata: Optional[Dict[str, Any]] = None


class CheckoutSessionResponse(BaseModel):
    """Response schema for checkout session creation"""
    session_id: str
    url: HttpUrl


class SubscriptionCreate(BaseModel):
    """Request schema for creating a subscription"""
    user_id: int
    price_id: str
    payment_method_id: Optional[str] = None
    trial_period_days: Optional[int] = None


class SubscriptionResponse(BaseModel):
    """Response schema for subscription creation"""
    id: int
    stripe_subscription_id: str
    status: str
    current_period_start: datetime
    current_period_end: datetime
    amount: float
    currency: str
    product_name: str


class CustomerPortalResponse(BaseModel):
    """Response schema for customer portal URL"""
    url: HttpUrl


class StripeProduct(BaseModel):
    """Schema for Stripe product information"""
    id: str
    name: str
    description: Optional[str] = None
    active: bool = True


class StripePrice(BaseModel):
    """Schema for Stripe price information"""
    id: str
    unit_amount: int
    currency: str
    recurring: Optional[Dict[str, Any]] = None


class StripeProductWithPrices(BaseModel):
    """Schema for product with associated prices"""
    id: str
    name: str
    description: Optional[str] = None
    prices: list[StripePrice]


class StripeSubscription(BaseModel):
    """Schema for subscription information"""
    id: int
    stripe_subscription_id: str
    status: str
    current_period_start: datetime
    current_period_end: datetime
    amount: float
    currency: str
    product_name: str
    interval: str
    interval_count: int


class StripeCustomer(BaseModel):
    """Schema for customer information"""
    id: int
    stripe_customer_id: str
    email: str
    name: Optional[str] = None
    created_at: datetime


class StripePaymentMethod(BaseModel):
    """Schema for payment method information"""
    id: int
    stripe_payment_method_id: str
    type: str
    card_brand: Optional[str] = None
    card_last4: Optional[str] = None
    card_exp_month: Optional[int] = None
    card_exp_year: Optional[int] = None
    is_default: bool = False
    is_active: bool = True


class StripeWebhookEvent(BaseModel):
    """Schema for webhook event information"""
    id: int
    stripe_event_id: str
    event_type: str
    processed: bool
    created_at: datetime
    processed_at: Optional[datetime] = None
    error_message: Optional[str] = None
