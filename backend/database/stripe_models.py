"""
Stripe-specific database models for payment processing and financial management.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class StripeCustomer(Base):
    """Links users to Stripe customer records"""
    __tablename__ = "stripe_customers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    stripe_customer_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(JSON, nullable=True)  # Stripe address object
    shipping = Column(JSON, nullable=True)  # Stripe shipping object
    tax_exempt = Column(String(50), default="none")  # none, exempt, reverse
    preferred_locales = Column(JSON, nullable=True)  # Array of locale strings
    invoice_prefix = Column(String(10), nullable=True)
    next_invoice_sequence = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="stripe_customer")
    subscriptions = relationship("StripeSubscription", back_populates="customer")
    payment_methods = relationship("StripePaymentMethod", back_populates="customer")
    
    def __repr__(self):
        return f"<StripeCustomer(id={self.id}, stripe_id='{self.stripe_customer_id}', user_id={self.user_id})>"


class StripeSubscription(Base):
    """Tracks subscription details and status"""
    __tablename__ = "stripe_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    stripe_subscription_id = Column(String(255), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("stripe_customers.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Subscription details
    status = Column(String(50), nullable=False, index=True)  # active, past_due, canceled, incomplete, etc.
    current_period_start = Column(DateTime(timezone=True), nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    trial_start = Column(DateTime(timezone=True), nullable=True)
    trial_end = Column(DateTime(timezone=True), nullable=True)
    
    # Billing details
    interval = Column(String(20), nullable=False)  # day, week, month, year
    interval_count = Column(Integer, default=1)
    amount = Column(Float, nullable=False)  # Amount in cents
    currency = Column(String(3), default="USD")
    
    # Product details
    product_id = Column(String(255), nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    product_description = Column(Text, nullable=True)
    
    # Metadata
    stripe_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("StripeCustomer", back_populates="subscriptions")
    user = relationship("User")
    payment_intents = relationship("StripePaymentIntent", back_populates="subscription")
    
    def __repr__(self):
        return f"<StripeSubscription(id={self.id}, stripe_id='{self.stripe_subscription_id}', status='{self.status}')>"


class StripePaymentIntent(Base):
    """Records payment attempts and results"""
    __tablename__ = "stripe_payment_intents"
    
    id = Column(Integer, primary_key=True, index=True)
    stripe_payment_intent_id = Column(String(255), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("stripe_customers.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subscription_id = Column(Integer, ForeignKey("stripe_subscriptions.id"), nullable=True, index=True)
    
    # Payment details
    amount = Column(Integer, nullable=False)  # Amount in cents
    currency = Column(String(3), default="USD")
    status = Column(String(50), nullable=False, index=True)  # requires_payment_method, requires_confirmation, requires_action, processing, requires_capture, canceled, succeeded
    payment_method_types = Column(JSON, nullable=True)  # Array of payment method types
    
    # Metadata
    description = Column(Text, nullable=True)
    receipt_email = Column(String(255), nullable=True)
    stripe_metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("StripeCustomer")
    user = relationship("User")
    subscription = relationship("StripeSubscription", back_populates="payment_intents")
    
    def __repr__(self):
        return f"<StripePaymentIntent(id={self.id}, stripe_id='{self.stripe_payment_intent_id}', status='{self.status}')>"


class StripePaymentMethod(Base):
    """Stores payment method information"""
    __tablename__ = "stripe_payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    stripe_payment_method_id = Column(String(255), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("stripe_customers.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Payment method details
    type = Column(String(50), nullable=False)  # card, bank_account, sepa_debit, etc.
    card_brand = Column(String(20), nullable=True)  # visa, mastercard, amex, etc.
    card_last4 = Column(String(4), nullable=True)
    card_exp_month = Column(Integer, nullable=True)
    card_exp_year = Column(Integer, nullable=True)
    card_fingerprint = Column(String(255), nullable=True)
    
    # Billing details
    billing_details = Column(JSON, nullable=True)  # Stripe billing details object
    
    # Status
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("StripeCustomer", back_populates="payment_methods")
    user = relationship("User")
    
    def __repr__(self):
        return f"<StripePaymentMethod(id={self.id}, type='{self.type}', last4='{self.card_last4}')>"


class StripeWebhookEvent(Base):
    """Logs webhook events for debugging and audit"""
    __tablename__ = "stripe_webhook_events"
    
    id = Column(Integer, primary_key=True, index=True)
    stripe_event_id = Column(String(255), unique=True, nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)  # checkout.session.completed, invoice.payment_succeeded, etc.
    
    # Event data
    api_version = Column(String(20), nullable=True)
    created = Column(DateTime(timezone=True), nullable=True)  # Stripe timestamp
    data = Column(JSON, nullable=False)  # Full event data
    livemode = Column(Boolean, default=False)
    
    # Processing status
    processed = Column(Boolean, default=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    received_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<StripeWebhookEvent(id={self.id}, event_type='{self.event_type}', processed={self.processed})>"


class StripeProduct(Base):
    """Stripe products for subscription plans"""
    __tablename__ = "stripe_products"
    
    id = Column(Integer, primary_key=True, index=True)
    stripe_product_id = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    
    # Pricing
    unit_amount = Column(Integer, nullable=False)  # Price in cents
    currency = Column(String(3), default="USD")
    recurring_interval = Column(String(20), nullable=False)  # day, week, month, year
    recurring_interval_count = Column(Integer, default=1)
    
    # Features
    features = Column(JSON, nullable=True)  # Array of feature objects
    stripe_metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<StripeProduct(id={self.id}, name='{self.name}', amount={self.unit_amount})>"


# Create indexes for better query performance
Index('idx_stripe_customers_user_id', StripeCustomer.user_id)
Index('idx_stripe_subscriptions_user_id', StripeSubscription.user_id)
Index('idx_stripe_payment_intents_user_id', StripePaymentIntent.user_id)
Index('idx_stripe_webhook_events_type_processed', StripeWebhookEvent.event_type, StripeWebhookEvent.processed)
