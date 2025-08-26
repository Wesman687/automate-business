from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from . import Base
import enum

# Import models from other files
# Note: Credit models are imported separately to avoid circular imports
# These are string references that will be resolved after all models are loaded
from models.cross_app_models import AppIntegration, CrossAppSession, AppCreditUsage

# Re-export credit models for other services to import
from models.credit_models import UserSubscription, CreditDispute

class UserType(enum.Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class UserStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"

class User(Base):
    __tablename__ = "users"
    
    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    user_type = Column(String(20), nullable=False, index=True)
    status = Column(String(20), default='active', index=True)
    
    # Identity fields
    name = Column(String(255), nullable=True)  # Full name for customers, display name for admins
    username = Column(String(100), nullable=True, unique=True, index=True)  # Optional username (mainly for admins)
    phone = Column(String(50), nullable=True, index=True)
    
    # Address fields (mainly for customers)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    
    # Business fields (for customers)
    business_name = Column(String(255), nullable=True)
    business_site = Column(String(500), nullable=True)
    additional_websites = Column(Text, nullable=True)  # JSON array
    business_type = Column(String(255), nullable=True)
    industry = Column(String(255), nullable=True)
    industry_other = Column(String(255), nullable=True)
    pain_points = Column(Text, nullable=True)
    current_tools = Column(Text, nullable=True)
    budget = Column(String(100), nullable=True)
    
    # Branding and Design fields (for customers)
    brand_colors = Column(JSON, nullable=True)  # Array of hex color codes
    brand_color_tags = Column(JSON, nullable=True)  # Object mapping color index to tag
    brand_color_tag_others = Column(JSON, nullable=True)  # Object mapping color index to custom tag
    brand_style = Column(String(255), nullable=True)
    brand_style_other = Column(String(255), nullable=True)
    brand_guidelines = Column(Text, nullable=True)
    
    # Online presence fields (for customers)
    website_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    social_media = Column(JSON, nullable=True)  # Object with platform keys and URLs
    
    # Admin-specific fields
    is_super_admin = Column(Boolean, default=False)
    
    # Customer-specific fields
    lead_status = Column(String(50), default="lead")  # lead, qualified, customer, closed
    notes = Column(Text, nullable=True)
    
    # Email verification fields
    is_authenticated = Column(Boolean, default=False)  # Has set password
    email_verified = Column(Boolean, default=False)  # Email verified with code
    verification_code = Column(String(10), nullable=True)  # 6-digit verification code
    verification_expires = Column(DateTime(timezone=True), nullable=True)  # When verification code expires
    
    # Credits system
    credits = Column(Integer, nullable=False, default=0)
    credit_status = Column(String(50), default="active")  # active, paused, suspended
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships - these will be set up after all models are defined
    chat_sessions = relationship("ChatSession", back_populates="user")
    appointments = relationship("Appointment", back_populates="customer")
    portal_invites = relationship("PortalInvite", back_populates="user")
    file_uploads = relationship("FileUpload", foreign_keys="[FileUpload.user_id]", back_populates="user")
    credit_transactions = relationship("CreditTransaction", back_populates="user")
    videos = relationship("Video", back_populates="user")
    subscriptions = relationship("UserSubscription", back_populates="user")
    credit_disputes = relationship("CreditDispute", back_populates="user")
    stripe_customer = relationship("StripeCustomer", back_populates="user", uselist=False)
    
    # Scraper relationships
    # Note: Scraper models are imported separately if they exist
    
    # Cross-app relationships
    app_integrations_created = relationship("AppIntegration", foreign_keys="[AppIntegration.created_by]", back_populates="created_by_user")
    app_integrations_approved = relationship("AppIntegration", foreign_keys="[AppIntegration.approved_by]", back_populates="approved_by_user")
    cross_app_sessions = relationship("CrossAppSession", back_populates="user")
    app_credit_usage = relationship("AppCreditUsage", back_populates="user")
    
    @property
    def is_admin(self) -> bool:
        return self.user_type == 'admin'
    
    @property
    def is_customer(self) -> bool:
        return self.user_type == 'customer'
    
    @property
    def is_active(self) -> bool:
        return self.status == 'active'
    
    @property
    def company(self):
        """Return business_type as company for compatibility"""
        return self.business_type


class PortalInvite(Base):
    __tablename__ = "portal_invites"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    invite_token = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), nullable=False, index=True)
    status = Column(String(50), default="pending")  # pending, accepted, expired
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="portal_invites")


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="active")  # active, completed, proposal_sent
    is_seen = Column(Boolean, default=False)  # Whether admin has viewed this chat session
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    customer = relationship("User", foreign_keys=[customer_id], overlaps="chat_sessions,user")
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String(255), unique=True, index=True, nullable=False)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    text = Column(Text, nullable=False)
    is_bot = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    is_super_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheduled_date = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=30)  # Default 30 minutes
    status = Column(String(50), default="scheduled")  # scheduled, completed, rescheduled
    appointment_type = Column(String(100), default="consultation")  # consultation, follow_up, demo
    notes = Column(Text, nullable=True)  # Admin notes about the appointment
    customer_notes = Column(Text, nullable=True)  # What customer wants to discuss
    meeting_link = Column(String(500), nullable=True)  # Zoom/Teams link
    phone_number = Column(String(50), nullable=True)  # If phone call
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("User", back_populates="appointments")

class CustomerChangeRequest(Base):
    __tablename__ = "customer_change_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)  # "Update navigation menu"
    description = Column(Text, nullable=False)  # Detailed description of the change
    priority = Column(String(50), default="medium")  # low, medium, high, urgent
    status = Column(String(50), default="pending")  # pending, reviewing, approved, rejected, implemented
    estimated_hours = Column(Float, nullable=True)  # Admin estimate
    estimated_cost = Column(Float, nullable=True)  # Admin estimate
    admin_notes = Column(Text, nullable=True)  # Internal notes
    rejection_reason = Column(Text, nullable=True)  # If rejected, why
    implementation_date = Column(DateTime(timezone=True), nullable=True)  # When implemented
    
    # Voice agent context
    requested_via = Column(String(50), default="web")  # web, voice, email, phone
    session_id = Column(String(255), nullable=True)  # If from voice/chat session
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    job = relationship("Job", back_populates="change_requests")
    user = relationship("User")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    invoice_number = Column(String(100), unique=True, nullable=False)  # INV-2025-001
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")  # USD, EUR, etc.
    status = Column(String(50), default="draft")  # draft, sent, paid, overdue, cancelled
    due_date = Column(DateTime(timezone=True), nullable=False)
    issue_date = Column(DateTime(timezone=True), server_default=func.now())
    paid_date = Column(DateTime(timezone=True), nullable=True)
    description = Column(Text, nullable=True)
    line_items = Column(JSON, nullable=True)  # Array of {description, quantity, rate, amount}
    tax_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)  # amount + tax - discount
    payment_terms = Column(String(100), default="Net 30")  # Net 30, Due on Receipt, etc.
    notes = Column(Text, nullable=True)
    stripe_invoice_id = Column(String(255), nullable=True)  # Stripe integration
    payment_link = Column(String(500), nullable=True)  # Payment link for customer
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")


class RecurringPayment(Base):
    __tablename__ = "recurring_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)  # "Monthly Website Maintenance"
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    interval = Column(String(50), nullable=False)  # monthly, quarterly, yearly
    status = Column(String(50), default="active")  # active, paused, cancelled
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)  # Optional end date
    next_billing_date = Column(DateTime(timezone=True), nullable=False)
    last_billing_date = Column(DateTime(timezone=True), nullable=True)
    description = Column(Text, nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)  # Stripe integration
    payment_method = Column(String(100), nullable=True)  # card, bank_transfer, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")


class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)  # "Website Automation System"
    description = Column(Text, nullable=True)
    status = Column(String(50), default="planning")  # planning, in_progress, completed, on_hold, cancelled
    priority = Column(String(50), default="medium")  # low, medium, high, urgent
    start_date = Column(DateTime(timezone=True), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    completion_date = Column(DateTime(timezone=True), nullable=True)
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, nullable=True)
    hourly_rate = Column(Float, nullable=True)
    fixed_price = Column(Float, nullable=True)
    
    # Project Resources and Links
    google_drive_links = Column(JSON, nullable=True)  # Array of {name, url, type}
    github_repositories = Column(JSON, nullable=True)  # Array of {name, url, branch}
    workspace_links = Column(JSON, nullable=True)  # Array of {name, url, type} - Slack, Discord, etc.
    server_details = Column(JSON, nullable=True)  # Array of {name, ip, credentials, purpose}
    calendar_links = Column(JSON, nullable=True)  # Array of {name, url, type} - Google Cal, etc.
    meeting_links = Column(JSON, nullable=True)  # Array of {name, url, type} - Zoom, Teams, etc.
    additional_tools = Column(JSON, nullable=True)  # Array of {name, url, credentials, purpose}
    
    # Notes and Progress
    notes = Column(Text, nullable=True)
    additional_resource_info = Column(JSON, nullable=True)  # Array of additional resource information
    progress_percentage = Column(Integer, default=0)  # 0-100
    milestones = Column(JSON, nullable=True)  # Array of {name, description, due_date, completed}
    deliverables = Column(JSON, nullable=True)  # Array of {name, description, delivered, date}
    
    # Project Planning and Goals
    project_goals = Column(Text, nullable=True)
    target_audience = Column(Text, nullable=True)
    timeline = Column(Text, nullable=True)
    budget_range = Column(Text, nullable=True)
    
    # Branding and Design
    brand_colors = Column(JSON, nullable=True)  # Array of hex color codes
    brand_color_tags = Column(JSON, nullable=True)  # Object mapping color index to tag
    brand_color_tag_others = Column(JSON, nullable=True)  # Object mapping color index to custom tag
    brand_style = Column(String(255), nullable=True)
    brand_style_other = Column(String(255), nullable=True)
    logo_files = Column(JSON, nullable=True)  # Array of file IDs
    brand_guidelines = Column(Text, nullable=True)
    
    # Online Presence and Resources
    website_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    social_media = Column(JSON, nullable=True)  # Object with platform keys and URLs
    
    # Unified Resources Array
    resources = Column(JSON, nullable=True)  # Array of {type, name, url, description}
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    time_entries = relationship("TimeEntry", back_populates="job")
    change_requests = relationship("CustomerChangeRequest", back_populates="job")
    file_uploads = relationship("FileUpload", foreign_keys="[FileUpload.job_id]", back_populates="job")

class TimeEntry(Base):
    __tablename__ = "time_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False)  # Who worked on it
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_hours = Column(Float, nullable=True)  # Calculated or manual
    description = Column(Text, nullable=False)  # What was worked on
    billable = Column(Boolean, default=True)
    hourly_rate = Column(Float, nullable=True)  # Rate for this entry
    amount = Column(Float, nullable=True)  # duration_hours * hourly_rate
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    job = relationship("Job", back_populates="time_entries")
    admin = relationship("Admin")


class FileUpload(Base):
    __tablename__ = "file_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # Size in bytes
    mime_type = Column(String(100), nullable=False)
    upload_type = Column(String(50), nullable=False)  # 'project', 'branding', 'job_setup', etc.
    
    # File server info
    file_server_url = Column(String(500), nullable=False)
    file_key = Column(String(100), nullable=False)  # File server's unique key
    folder = Column(String(255), nullable=True)  # Folder path on file server
    
    # File server access tracking
    access_email = Column(String(255), nullable=False)  # Email used for file server access
    
    # Metadata
    description = Column(Text, nullable=True)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    
    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    
    # Timestamps
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Status
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="file_uploads")
    customer = relationship("User", foreign_keys=[customer_id])
    job = relationship("Job", foreign_keys=[job_id], back_populates="file_uploads")
    
    def __repr__(self):
        return f"<FileUpload(id={self.id}, filename='{self.filename}', type='{self.upload_type}')>"


class CreditTransaction(Base):
    __tablename__ = "credits_transactions"
    
    id = Column(String(), primary_key=True, index=True)  # UUID as string
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(String(255), nullable=True)  # Redis job ID
    subscription_id = Column(Integer, ForeignKey("user_subscriptions.id"), nullable=True)  # If related to subscription
    
    # Transaction details
    amount = Column(Integer, nullable=False)  # Credits spent/added (negative for spending)
    description = Column(Text, nullable=False)
    transaction_type = Column(String(50), nullable=False, default="service")  # service, subscription, admin, dispute, purchase
    
    # Financial tracking
    dollar_amount = Column(Numeric(10, 4), nullable=True)  # Dollar value of transaction
    stripe_payment_intent_id = Column(String(255), nullable=True)  # Stripe payment reference
    
    # Metadata
    transaction_metadata = Column(JSON, nullable=True)  # Additional transaction data
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="credit_transactions")
    subscription = relationship("UserSubscription", back_populates="credit_transactions")
    disputes = relationship("CreditDispute", back_populates="transaction")
    
    def __repr__(self):
        return f"<CreditTransaction(id={self.id}, user_id={self.user_id}, amount={self.amount}, type={self.transaction_type})>"


class Video(Base):
    __tablename__ = "videos"
    
    id = Column(String(), primary_key=True, index=True)  # UUID as string
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(String(255), nullable=True)  # Redis job ID
    title = Column(String(200), nullable=True)
    prompt = Column(Text, nullable=False)
    negative_prompt = Column(Text, nullable=True)
    aspect_ratio = Column(String(20), nullable=False, default='16:9')
    model_id = Column(String(100), nullable=False)
    seconds = Column(Integer, nullable=False, default=5)
    cost_cents = Column(Integer, nullable=False, default=0)
    file_key = Column(String(500), nullable=True)  # Full path to video file
    thumb_key = Column(String(500), nullable=True)  # Full path to thumbnail
    status = Column(String(50), nullable=False, default='pending')
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="videos")
    
    def __repr__(self):
        return f"<Video(id={self.id}, user_id={self.user_id}, title='{self.title}', status='{self.status}')>"


class StripeCustomer(Base):
    """Stripe customer information linked to users"""
    __tablename__ = "stripe_customers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    stripe_customer_id = Column(String(255), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    
    # Billing information
    default_payment_method = Column(String(255), nullable=True)
    invoice_settings = Column(JSON, nullable=True)
    
    # Metadata
    stripe_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="stripe_customer")
    
    def __repr__(self):
        return f"<StripeCustomer(id={self.id}, user_id={self.user_id}, stripe_id='{self.stripe_customer_id}')>"


class StripeSubscription(Base):
    """Stripe subscription information linked to users"""
    __tablename__ = "stripe_subscriptions"
    
    id = Column(String(), primary_key=True, index=True)  # UUID as string
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    stripe_subscription_id = Column(String(255), nullable=False, unique=True, index=True)
    
    # Subscription details
    product_name = Column(String(255), nullable=False)
    price_id = Column(String(255), nullable=False)
    amount = Column(Integer, nullable=False)  # Amount in cents
    currency = Column(String(3), nullable=False, default="USD")
    interval = Column(String(20), nullable=False)  # month, year, etc.
    interval_count = Column(Integer, nullable=False, default=1)
    quantity = Column(Integer, nullable=False, default=1)
    
    # Status and billing
    status = Column(String(50), nullable=False, default="active")  # active, canceled, past_due, unpaid
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    
    # Metadata
    stripe_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<StripeSubscription(id={self.id}, user_id={self.user_id}, status='{self.status}')>"


class StripePaymentIntent(Base):
    """Stripe payment intent tracking"""
    __tablename__ = "stripe_payment_intents"
    
    id = Column(String(255), primary_key=True, index=True)  # Stripe payment intent ID
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Payment details
    amount = Column(Integer, nullable=False)  # Amount in cents
    currency = Column(String(3), nullable=False, default="USD")
    status = Column(String(50), nullable=False)  # requires_payment_method, requires_confirmation, etc.
    description = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<StripePaymentIntent(id={self.id}, user_id={self.user_id}, status='{self.status}')>"
