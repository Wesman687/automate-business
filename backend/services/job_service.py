from sqlalchemy.orm import Session
from database.models import Job, CustomerChangeRequest, User
from typing import List, Optional
from datetime import datetime

class JobService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_customer_jobs(self, customer_id: int) -> List[Job]:
        """Get all jobs for a customer"""
        return self.db.query(Job).filter(Job.customer_id == customer_id).all()
    
    def get_active_jobs(self, customer_id: int) -> List[Job]:
        """Get active jobs for a customer"""
        return self.db.query(Job).filter(
            Job.customer_id == customer_id,
            Job.status.in_(["planning", "in_progress"])
        ).all()
    
    def get_job_by_id(self, job_id: int) -> Optional[Job]:
        """Get a specific job by ID"""
        return self.db.query(Job).filter(Job.id == job_id).first()
    
    def get_all_active_jobs(self) -> List[Job]:
        """Get all active jobs across all customers"""
        return self.db.query(Job).filter(
            Job.status.in_(["planning", "in_progress"])
        ).all()

class ChangeRequestService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_change_request(
        self, 
        job_id: int, 
        customer_id: int, 
        title: str, 
        description: str,
        priority: str = "medium",
        requested_via: str = "voice",
        session_id: Optional[str] = None
    ) -> CustomerChangeRequest:
        """Create a new change request"""
        
        change_request = CustomerChangeRequest(
            job_id=job_id,
            customer_id=customer_id,
            title=title,
            description=description,
            priority=priority,
            requested_via=requested_via,
            session_id=session_id,
            status="pending"
        )
        
        self.db.add(change_request)
        self.db.commit()
        self.db.refresh(change_request)
        return change_request
    
    def get_job_change_requests(self, job_id: int) -> List[CustomerChangeRequest]:
        """Get all change requests for a job"""
        return self.db.query(CustomerChangeRequest).filter(
            CustomerChangeRequest.job_id == job_id
        ).order_by(CustomerChangeRequest.created_at.desc()).all()
    
    def get_customer_change_requests(self, customer_id: int) -> List[CustomerChangeRequest]:
        """Get all change requests for a customer"""
        return self.db.query(CustomerChangeRequest).filter(
            CustomerChangeRequest.customer_id == customer_id
        ).order_by(CustomerChangeRequest.created_at.desc()).all()
    
    def get_pending_change_requests(self) -> List[CustomerChangeRequest]:
        """Get all pending change requests across all jobs"""
        return self.db.query(CustomerChangeRequest).filter(
            CustomerChangeRequest.status == "pending"
        ).order_by(CustomerChangeRequest.created_at.desc()).all()
    
    def get_active_change_requests(self) -> List[CustomerChangeRequest]:
        """Get all active change requests (pending + reviewing)"""
        return self.db.query(CustomerChangeRequest).filter(
            CustomerChangeRequest.status.in_(["pending", "reviewing"])
        ).order_by(CustomerChangeRequest.created_at.desc()).all()
    
    def update_change_request_status(
        self, 
        request_id: int, 
        status: str, 
        admin_notes: Optional[str] = None,
        estimated_hours: Optional[float] = None,
        estimated_cost: Optional[float] = None,
        rejection_reason: Optional[str] = None
    ) -> Optional[CustomerChangeRequest]:
        """Update a change request status and details"""
        
        change_request = self.db.query(CustomerChangeRequest).filter(
            CustomerChangeRequest.id == request_id
        ).first()
        
        if not change_request:
            return None
        
        change_request.status = status
        if admin_notes:
            change_request.admin_notes = admin_notes
        if estimated_hours is not None:
            change_request.estimated_hours = estimated_hours
        if estimated_cost is not None:
            change_request.estimated_cost = estimated_cost
        if rejection_reason:
            change_request.rejection_reason = rejection_reason
        
        if status == "implemented":
            change_request.implementation_date = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(change_request)
        return change_request
    
    def get_change_request_by_id(self, request_id: int) -> Optional[CustomerChangeRequest]:
        """Get a specific change request by ID"""
        return self.db.query(CustomerChangeRequest).filter(
            CustomerChangeRequest.id == request_id
        ).first()
