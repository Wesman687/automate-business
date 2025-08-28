"""
User-related database models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

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
    is_active = Column(Boolean, default=True, nullable=False)  # Whether user account is active and can log in
    
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
    chat_sessions = relationship("ChatSession", foreign_keys="[ChatSession.customer_id]", back_populates="user")
    appointments = relationship("Appointment", back_populates="customer")
    portal_invites = relationship("PortalInvite", back_populates="user")
    file_uploads = relationship("FileUpload", foreign_keys="[FileUpload.user_id]", back_populates="user")
    credit_transactions = relationship("CreditTransaction", back_populates="user")
    videos = relationship("Video", back_populates="user")
    subscriptions = relationship("UserSubscription", back_populates="user")
    credit_disputes = relationship("CreditDispute", back_populates="user")
    stripe_customer = relationship("StripeCustomer", back_populates="user", uselist=False)
    
    # Automation relationships
    jobs = relationship("Job", back_populates="customer")
    
    # Note: Scraper relationships removed to avoid import circular dependency
    # These can be added later when scraper models are properly integrated
    
    # Computed properties for user type
    @property
    def is_admin(self) -> bool:
        """Check if user is an admin"""
        return self.user_type == "admin"
    
    @property
    def is_customer(self) -> bool:
        """Check if user is a customer"""
        return self.user_type == "customer"
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', user_type='{self.user_type}')>"

class PortalInvite(Base):
    __tablename__ = "portal_invites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    invite_code = Column(String(50), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="portal_invites")
    
    def __repr__(self):
        return f"<PortalInvite(id={self.id}, user_id={self.user_id}, invite_code='{self.invite_code}')>"

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    status = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_seen = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[customer_id])
    messages = relationship("ChatMessage", back_populates="session")
    
    def __repr__(self):
        return f"<ChatSession(id={self.id}, session_id='{self.session_id}', customer_id={self.customer_id})>"

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String, nullable=False, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    is_bot = Column(Boolean, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")
    
    def __repr__(self):
        return f"<ChatMessage(id={self.id}, message_id='{self.message_id}', session_id={self.session_id}, text='{self.text[:50]}...')>"

class Admin(Base):
    __tablename__ = "admin"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    admin_level = Column(String(50), default="admin")  # admin, super_admin
    permissions = Column(JSON, nullable=True)  # Array of permission strings
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<Admin(id={self.id}, user_id={self.user_id}, admin_level='{self.admin_level}')>"
