from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

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
