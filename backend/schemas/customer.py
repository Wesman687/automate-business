from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class ChatSessionItem(BaseModel):
    id: int
    session_id: str
    customer_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    message_count: int
    
    class Config:
        from_attributes = True

class CustomerBase(BaseModel):
    name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    business_name: Optional[str] = None
    business_site: Optional[str] = None
    business_type: Optional[str] = None
    pain_points: Optional[str] = None
    current_tools: Optional[str] = None
    budget: Optional[str] = None
    status: Optional[str] = "lead"
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    password: Optional[str] = None  # Optional password for customer authentication

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    business_name: Optional[str] = None
    business_site: Optional[str] = None
    business_type: Optional[str] = None
    pain_points: Optional[str] = None
    current_tools: Optional[str] = None
    budget: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    chat_sessions: Optional[List[ChatSessionItem]] = []
    chat_count: Optional[int] = 0
    
    class Config:
        from_attributes = True
