from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class PortalInviteBase(BaseModel):
    customer_id: int
    email: EmailStr
    expires_at: datetime

class PortalInviteCreate(PortalInviteBase):
    pass

class PortalInviteUpdate(BaseModel):
    status: Optional[str] = None
    accepted_at: Optional[datetime] = None

class PortalInvite(PortalInviteBase):
    id: int
    invite_token: str
    status: str
    created_at: datetime
    accepted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
