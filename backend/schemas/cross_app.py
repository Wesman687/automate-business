from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums - using str, Enum for proper Pydantic serialization
class AppStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_APPROVAL = "pending_approval"

class AppPermission(str, Enum):
    READ_USER_INFO = "read_user_info"
    READ_CREDITS = "read_credits"
    PURCHASE_CREDITS = "purchase_credits"
    CONSUME_CREDITS = "consume_credits"
    MANAGE_SUBSCRIPTIONS = "manage_subscriptions"
    READ_ANALYTICS = "read_analytics"

class CrossAppSessionStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"

# App Integration Schemas
class AppIntegrationBase(BaseModel):
    app_name: str = Field(..., min_length=1, max_length=255)
    app_domain: str = Field(..., min_length=1, max_length=500)
    app_url: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    logo_url: Optional[str] = Field(None, max_length=500)
    primary_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    permissions: List[AppPermission] = Field(default_factory=list)
    max_users: Optional[int] = Field(None, gt=0)
    is_public: bool = False
    webhook_url: Optional[str] = Field(None, max_length=500)
    allowed_origins: Optional[List[str]] = None

class AppIntegrationCreate(AppIntegrationBase):
    pass

class AppIntegrationUpdate(BaseModel):
    app_name: Optional[str] = Field(None, min_length=1, max_length=255)
    app_domain: Optional[str] = Field(None, min_length=1, max_length=500)
    app_url: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    logo_url: Optional[str] = Field(None, max_length=500)
    primary_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    permissions: Optional[List[AppPermission]] = None
    max_users: Optional[int] = Field(None, gt=0)
    is_public: Optional[bool] = None
    webhook_url: Optional[str] = Field(None, max_length=500)
    allowed_origins: Optional[List[str]] = None
    status: Optional[AppStatus] = None

class AppIntegrationResponse(AppIntegrationBase):
    id: int
    app_id: str
    status: AppStatus
    created_by: Optional[int] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_activity: Optional[datetime] = None

    class Config:
        from_attributes = True
        use_enum_values = True  # This ensures enums are serialized as strings

# Cross-App Session Schemas
class CrossAppSessionBase(BaseModel):
    app_id: int
    permissions_granted: List[AppPermission] = Field(default_factory=list)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_id: Optional[str] = None

class CrossAppSessionCreate(CrossAppSessionBase):
    user_id: int
    expires_at: datetime

class CrossAppSessionResponse(CrossAppSessionBase):
    id: int
    session_token: str
    user_id: int
    status: CrossAppSessionStatus
    created_at: datetime
    expires_at: datetime
    last_activity: datetime
    revoked_at: Optional[datetime] = None
    revoked_reason: Optional[str] = None

    class Config:
        from_attributes = True

# App Credit Usage Schemas
class AppCreditUsageBase(BaseModel):
    app_id: int
    app_user_id: Optional[str] = None
    app_metadata: Optional[Dict[str, Any]] = None

class AppCreditUsageResponse(AppCreditUsageBase):
    id: int
    user_id: int
    credits_consumed: int
    credits_purchased: int
    last_consumption: Optional[datetime] = None
    last_purchase: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Authentication Schemas
class CrossAppAuthRequest(BaseModel):
    app_id: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
    app_user_id: Optional[str] = None
    app_metadata: Optional[Dict[str, Any]] = None

class CrossAppAuthResponse(BaseModel):
    session_token: str
    user: Dict[str, Any]
    app_info: Dict[str, Any]
    permissions: List[AppPermission]
    expires_at: datetime

class CrossAppTokenValidationRequest(BaseModel):
    session_token: str = Field(..., min_length=1)
    app_id: str = Field(..., min_length=1)

class CrossAppTokenValidationResponse(BaseModel):
    valid: bool
    user: Optional[Dict[str, Any]] = None
    permissions: Optional[List[AppPermission]] = None
    expires_at: Optional[datetime] = None
    error: Optional[str] = None

class CrossAppTokenRefreshRequest(BaseModel):
    session_token: str = Field(..., min_length=1)
    app_id: str = Field(..., min_length=1)

class CrossAppTokenRefreshResponse(BaseModel):
    new_session_token: str
    expires_at: datetime
    permissions: List[AppPermission]

# Credit Integration Schemas
class CrossAppCreditCheckRequest(BaseModel):
    session_token: str = Field(..., min_length=1)
    app_id: str = Field(..., min_length=1)

class CrossAppCreditCheckResponse(BaseModel):
    user_id: int
    current_credits: int
    can_consume: bool
    required_credits: Optional[int] = None
    available_packages: List[Dict[str, Any]] = []

class CrossAppCreditConsumeRequest(BaseModel):
    session_token: str = Field(..., min_length=1)
    app_id: str = Field(..., min_length=1)
    credits: int = Field(..., gt=0)
    service: str = Field(..., min_length=1)
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class CrossAppCreditConsumeResponse(BaseModel):
    success: bool
    credits_consumed: int
    remaining_credits: int
    transaction_id: Optional[str] = None
    error: Optional[str] = None

class CrossAppCreditPurchaseRequest(BaseModel):
    session_token: str = Field(..., min_length=1)
    app_id: str = Field(..., min_length=1)
    package_id: Optional[int] = None
    credits: int = Field(..., gt=0)
    return_url: str = Field(..., min_length=1)

class CrossAppCreditPurchaseResponse(BaseModel):
    checkout_url: str
    session_id: str
    expires_at: datetime

# User Info Schemas
class CrossAppUserInfoRequest(BaseModel):
    session_token: str = Field(..., min_length=1)
    app_id: str = Field(..., min_length=1)

class CrossAppUserInfoResponse(BaseModel):
    user_id: int
    email: str
    name: Optional[str] = None
    user_type: str
    credits: int
    app_metadata: Optional[Dict[str, Any]] = None
    permissions: List[AppPermission]

# Error Response Schema
class CrossAppErrorResponse(BaseModel):
    error: str
    code: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
