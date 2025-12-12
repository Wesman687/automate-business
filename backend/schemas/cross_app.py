"""
Cross-App Authentication Schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class CrossAppAuthRequest(BaseModel):
    app_id: str
    email: str
    password: str
    app_user_id: Optional[str] = None
    app_metadata: Optional[Dict[str, Any]] = None

class UserInfo(BaseModel):
    user_id: int
    email: str
    name: Optional[str] = None
    user_type: str
    is_admin: bool
    is_customer: bool
    credits: Optional[int] = 0

class AppInfo(BaseModel):
    app_id: str
    app_name: str
    app_domain: str

class CrossAppAuthResponse(BaseModel):
    session_token: str
    user: UserInfo
    app_info: AppInfo
    permissions: List[str]
    expires_at: datetime

class CrossAppTokenValidationRequest(BaseModel):
    session_token: str
    app_id: str

class CrossAppTokenValidationResponse(BaseModel):
    valid: bool
    user: Optional[UserInfo] = None
    permissions: Optional[List[str]] = None
    expires_at: Optional[datetime] = None
    error: Optional[str] = None

class CrossAppTokenRefreshRequest(BaseModel):
    session_token: str
    app_id: str

class CrossAppTokenRefreshResponse(BaseModel):
    new_session_token: str
    expires_at: datetime
    permissions: List[str]

class CrossAppCreditCheckRequest(BaseModel):
    session_token: str
    app_id: str
    required_credits: Optional[int] = None

class CrossAppCreditCheckResponse(BaseModel):
    current_balance: int
    has_sufficient_credits: bool
    required_credits: Optional[int] = None

class CrossAppCreditConsumeRequest(BaseModel):
    session_token: str
    app_id: str
    credits: int
    service: str
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class CrossAppCreditConsumeResponse(BaseModel):
    success: bool
    credits_consumed: int
    new_balance: int
    transaction_id: Optional[int] = None

class CrossAppCreditPurchaseRequest(BaseModel):
    session_token: str
    app_id: str
    package_id: Optional[str] = None
    credits: Optional[int] = None
    return_url: str

class CrossAppCreditPurchaseResponse(BaseModel):
    checkout_url: str
    session_id: str

class CrossAppUserInfoRequest(BaseModel):
    session_token: str
    app_id: str

class CrossAppUserInfoResponse(BaseModel):
    user: UserInfo
    app_info: AppInfo
    permissions: List[str]

class CrossAppErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None

