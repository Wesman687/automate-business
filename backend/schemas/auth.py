from pydantic import BaseModel, EmailStr
from typing import Optional

class CustomerLoginRequest(BaseModel):
    email: EmailStr
    password: str

class CustomerLoginResponse(BaseModel):
    access_token: str
    customer_id: int
    customer_name: Optional[str]
    email: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str

class CustomerRegistration(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
