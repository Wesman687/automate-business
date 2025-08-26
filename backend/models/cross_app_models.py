from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class AppStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_APPROVAL = "pending_approval"

class AppPermission(enum.Enum):
    READ_USER_INFO = "read_user_info"
    READ_CREDITS = "read_credits"
    PURCHASE_CREDITS = "purchase_credits"
    CONSUME_CREDITS = "consume_credits"
    MANAGE_SUBSCRIPTIONS = "manage_subscriptions"
    READ_ANALYTICS = "read_analytics"

class CrossAppSessionStatus(enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"

class AppIntegration(Base):
    """Track connected applications and their permissions"""
    __tablename__ = "app_integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(String(255), unique=True, nullable=False, index=True)  # Unique app identifier
    app_name = Column(String(255), nullable=False)  # Human-readable app name
    app_domain = Column(String(500), nullable=False)  # Allowed domain(s) for this app
    app_url = Column(String(500), nullable=True)  # App's main URL
    
    # Configuration
    description = Column(Text, nullable=True)  # App description
    logo_url = Column(String(500), nullable=True)  # App logo URL
    primary_color = Column(String(7), nullable=True)  # Hex color for branding
    
    # Permissions and access
    permissions = Column(JSON, nullable=False, default=list)  # Array of AppPermission values
    max_users = Column(Integer, nullable=True)  # Maximum users allowed for this app
    is_public = Column(Boolean, default=False)  # Whether this app is publicly available
    
    # Security
    api_key_hash = Column(String(255), nullable=True)  # Hashed API key for app authentication
    webhook_url = Column(String(500), nullable=True)  # Webhook URL for app notifications
    allowed_origins = Column(JSON, nullable=True)  # Array of allowed CORS origins
    
    # Status and metadata
    status = Column(Enum(AppStatus), default=AppStatus.PENDING_APPROVAL, nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who created this integration
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who approved this integration
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_activity = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    created_by_user = relationship("User", foreign_keys=[created_by])
    approved_by_user = relationship("User", foreign_keys=[approved_by])
    cross_app_sessions = relationship("CrossAppSession", back_populates="app")
    app_credit_usage = relationship("AppCreditUsage", back_populates="app")
    
    def __repr__(self):
        return f"<AppIntegration(id={self.id}, app_id='{self.app_id}', name='{self.app_name}', status={self.status})>"

class CrossAppSession(Base):
    """Manage cross-app authentication sessions"""
    __tablename__ = "cross_app_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_token = Column(String(255), unique=True, nullable=False, index=True)  # Unique session identifier
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    app_id = Column(Integer, ForeignKey("app_integrations.id"), nullable=False, index=True)
    
    # Session details
    status = Column(Enum(CrossAppSessionStatus), default=CrossAppSessionStatus.ACTIVE, nullable=False, index=True)
    permissions_granted = Column(JSON, nullable=False, default=list)  # Permissions granted for this session
    
    # Security and validation
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6 address
    user_agent = Column(Text, nullable=True)  # User agent string
    device_id = Column(String(255), nullable=True)  # Device identifier
    
    # Expiration
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revoked_reason = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User")
    app = relationship("AppIntegration", back_populates="cross_app_sessions")
    
    def __repr__(self):
        return f"<CrossAppSession(id={self.id}, user_id={self.user_id}, app_id={self.app_id}, status={self.status})>"

class AppCreditUsage(Base):
    """Track credit usage per application"""
    __tablename__ = "app_credit_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    app_id = Column(Integer, ForeignKey("app_integrations.id"), nullable=False, index=True)
    
    # Usage tracking
    credits_consumed = Column(Integer, nullable=False, default=0)  # Total credits consumed by this app
    credits_purchased = Column(Integer, nullable=False, default=0)  # Total credits purchased through this app
    last_consumption = Column(DateTime(timezone=True), nullable=True)  # Last time credits were consumed
    last_purchase = Column(DateTime(timezone=True), nullable=True)  # Last time credits were purchased
    
    # App-specific metadata
    app_user_id = Column(String(255), nullable=True)  # User ID in the external app
    app_metadata = Column(JSON, nullable=True)  # Additional app-specific data
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    app = relationship("AppIntegration", back_populates="app_credit_usage")
    
    def __repr__(self):
        return f"<AppCreditUsage(id={self.id}, user_id={self.user_id}, app_id={self.app_id}, consumed={self.credits_consumed})>"

# Create indexes for better query performance
Index('idx_app_integrations_status', AppIntegration.status)
Index('idx_cross_app_sessions_user_app', CrossAppSession.user_id, CrossAppSession.app_id)
Index('idx_cross_app_sessions_token', CrossAppSession.session_token)
Index('idx_app_credit_usage_user_app', AppCreditUsage.user_id, AppCreditUsage.app_id)
