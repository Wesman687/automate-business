from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Invoice Schemas
class InvoiceLineItem(BaseModel):
    description: str
    quantity: float
    rate: float
    amount: float

class InvoiceBase(BaseModel):
    customer_id: int
    amount: float
    currency: Optional[str] = "USD"
    due_date: datetime
    description: Optional[str] = None
    line_items: Optional[List[Dict[str, Any]]] = []
    tax_amount: Optional[float] = 0.0
    discount_amount: Optional[float] = 0.0
    payment_terms: Optional[str] = "Net 30"
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    description: Optional[str] = None
    line_items: Optional[List[Dict[str, Any]]] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    notes: Optional[str] = None

class Invoice(InvoiceBase):
    id: int
    invoice_number: str
    status: str
    issue_date: datetime
    paid_date: Optional[datetime] = None
    total_amount: float
    stripe_invoice_id: Optional[str] = None
    payment_link: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Recurring Payment Schemas
class RecurringPaymentBase(BaseModel):
    customer_id: int
    name: str
    amount: float
    currency: Optional[str] = "USD"
    interval: str  # monthly, quarterly, yearly
    start_date: datetime
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None

class RecurringPaymentCreate(RecurringPaymentBase):
    pass

class RecurringPaymentUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    interval: Optional[str] = None
    status: Optional[str] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None

class RecurringPayment(RecurringPaymentBase):
    id: int
    status: str
    next_billing_date: datetime
    last_billing_date: Optional[datetime] = None
    stripe_subscription_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Job Schemas
class JobResource(BaseModel):
    name: str
    url: str
    type: Optional[str] = None

class JobMilestone(BaseModel):
    name: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: bool = False

class JobDeliverable(BaseModel):
    name: str
    description: Optional[str] = None
    delivered: bool = False
    date: Optional[datetime] = None

class JobBase(BaseModel):
    customer_id: int
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    start_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    hourly_rate: Optional[float] = None
    fixed_price: Optional[float] = None
    google_drive_links: Optional[List[Dict[str, Any]]] = []
    github_repositories: Optional[List[Dict[str, Any]]] = []
    workspace_links: Optional[List[Dict[str, Any]]] = []
    server_details: Optional[List[Dict[str, Any]]] = []
    calendar_links: Optional[List[Dict[str, Any]]] = []
    meeting_links: Optional[List[Dict[str, Any]]] = []
    additional_tools: Optional[List[Dict[str, Any]]] = []
    notes: Optional[str] = None
    milestones: Optional[List[Dict[str, Any]]] = []
    deliverables: Optional[List[Dict[str, Any]]] = []

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    start_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    hourly_rate: Optional[float] = None
    fixed_price: Optional[float] = None
    google_drive_links: Optional[List[Dict[str, Any]]] = None
    github_repositories: Optional[List[Dict[str, Any]]] = None
    workspace_links: Optional[List[Dict[str, Any]]] = None
    server_details: Optional[List[Dict[str, Any]]] = None
    calendar_links: Optional[List[Dict[str, Any]]] = None
    meeting_links: Optional[List[Dict[str, Any]]] = None
    additional_tools: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None
    progress_percentage: Optional[int] = None
    milestones: Optional[List[Dict[str, Any]]] = None
    deliverables: Optional[List[Dict[str, Any]]] = None

class Job(JobBase):
    id: int
    status: str
    completion_date: Optional[datetime] = None
    actual_hours: Optional[float] = None
    progress_percentage: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Time Entry Schemas
class TimeEntryBase(BaseModel):
    job_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_hours: Optional[float] = None
    description: str
    billable: Optional[bool] = True
    hourly_rate: Optional[float] = None

class TimeEntryCreate(TimeEntryBase):
    pass

class TimeEntryUpdate(BaseModel):
    end_time: Optional[datetime] = None
    duration_hours: Optional[float] = None
    description: Optional[str] = None
    billable: Optional[bool] = None
    hourly_rate: Optional[float] = None

class TimeEntry(TimeEntryBase):
    id: int
    admin_id: int
    amount: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
