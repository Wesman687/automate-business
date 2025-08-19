from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

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
    pain_points = Column(Text, nullable=True)
    current_tools = Column(Text, nullable=True)
    budget = Column(String(100), nullable=True)
    
    # Admin-specific fields
    is_super_admin = Column(Boolean, default=False)
    
    # Customer-specific fields
    lead_status = Column(String(50), default="lead")  # lead, qualified, customer, closed
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    chat_sessions = relationship("ChatSession", back_populates="user")
    appointments = relationship("Appointment", back_populates="customer")
    portal_invites = relationship("PortalInvite", back_populates="user")
    
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
    customer = relationship("User", foreign_keys=[customer_id])
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
    status = Column(String(50), default="scheduled")  # scheduled, completed, cancelled, rescheduled
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
    progress_percentage = Column(Integer, default=0)  # 0-100
    milestones = Column(JSON, nullable=True)  # Array of {name, description, due_date, completed}
    deliverables = Column(JSON, nullable=True)  # Array of {name, description, delivered, date}
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    time_entries = relationship("TimeEntry", back_populates="job")
    change_requests = relationship("CustomerChangeRequest", back_populates="job")

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
