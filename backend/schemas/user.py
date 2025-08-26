from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserType(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"

class LeadStatus(str, Enum):
    LEAD = "lead"
    QUALIFIED = "qualified"
    CUSTOMER = "customer"
    CLOSED = "closed"

# Base User Schema with common fields
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    status: UserStatus = UserStatus.ACTIVE

# Customer-specific fields - aligned with existing EditCustomerModal
class CustomerFields(BaseModel):
    # Address fields
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    
    # Business fields
    business_site: Optional[str] = None
    additional_websites: Optional[str] = None  # JSON array as string
    business_type: Optional[str] = None
    
    # Customer-specific fields
    lead_status: LeadStatus = LeadStatus.LEAD
    notes: Optional[str] = None

# Admin-specific fields
class AdminFields(BaseModel):
    is_super_admin: bool = False

# Authentication fields
class AuthFields(BaseModel):
    is_authenticated: bool = False
    email_verified: bool = False
    verification_code: Optional[str] = None
    verification_expires: Optional[datetime] = None

# Credits system
class CreditsFields(BaseModel):
    credits: int = Field(default=0, ge=0)

# Timestamps
class TimestampFields(BaseModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

# User Creation Schemas
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    user_type: UserType
    
    # Include customer fields if creating customer
    customer_fields: Optional[CustomerFields] = None
    
    # Include admin fields if creating admin
    admin_fields: Optional[AdminFields] = None
    
    @validator('customer_fields')
    @classmethod
    def validate_customer_fields(cls, v, values):
        if values.get('user_type') == UserType.CUSTOMER and not v:
            raise ValueError('Customer fields are required for customer users')
        return v
    
    @validator('admin_fields')
    @classmethod
    def validate_admin_fields(cls, v, values):
        if values.get('user_type') == UserType.ADMIN and not v:
            raise ValueError('Admin fields are required for admin users')
        return v

# User Update Schemas
class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[UserStatus] = None
    
    # Customer fields (only for customer users)
    customer_fields: Optional[CustomerFields] = None
    
    # Admin fields (only for admin users)
    admin_fields: Optional[AdminFields] = None

class CustomerUpdate(CustomerFields):
    pass

class AdminUpdate(AdminFields):
    pass

# Password Update
class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

# User Response Schemas
class UserResponse(UserBase, TimestampFields):
    id: int
    user_type: UserType
    credits: int
    
    # Include customer fields if customer
    customer_fields: Optional[CustomerFields] = None
    
    # Include admin fields if admin
    admin_fields: Optional[AdminFields] = None
    
    class Config:
        from_attributes = True

class CustomerResponse(UserResponse):
    user_type: UserType = UserType.CUSTOMER
    customer_fields: CustomerFields

class AdminResponse(UserResponse):
    user_type: UserType = UserType.ADMIN
    admin_fields: AdminFields

# User List Response (for admin views)
class UserListResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    user_type: UserType
    status: UserStatus
    credits: int
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# User Search/Filter
class UserFilter(BaseModel):
    user_type: Optional[UserType] = None
    status: Optional[UserStatus] = None
    lead_status: Optional[LeadStatus] = None
    industry: Optional[str] = None
    business_type: Optional[str] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    has_credits: Optional[bool] = None
    search: Optional[str] = None  # Search in name, email, business_name

# User Statistics (for admin dashboard)
class UserStats(BaseModel):
    total_users: int
    total_customers: int
    total_admins: int
    active_users: int
    pending_users: int
    suspended_users: int
    users_with_credits: int
    total_credits: int
    new_users_this_month: int
    new_users_this_week: int

# Bulk Operations
class BulkUserUpdate(BaseModel):
    user_ids: List[int]
    updates: UserUpdate

class BulkUserStatusUpdate(BaseModel):
    user_ids: List[int]
    status: UserStatus
    reason: Optional[str] = None

# User Activity
class UserActivity(BaseModel):
    user_id: int
    action: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
