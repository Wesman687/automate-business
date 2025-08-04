from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class CustomerBase(BaseModel):
    name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    business_site: Optional[str] = None
    business_type: Optional[str] = None
    pain_points: Optional[str] = None
    current_tools: Optional[str] = None
    budget: Optional[str] = None
    status: Optional[str] = "lead"
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
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
    
    class Config:
        from_attributes = True
