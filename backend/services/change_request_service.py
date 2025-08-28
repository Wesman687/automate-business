"""
Change request service for managing customer change requests
"""
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta

from models import CustomerChangeRequest, Job, User
from services.base_service import BaseService

logger = logging.getLogger(__name__)

class ChangeRequestService(BaseService):
    """Service for managing customer change requests"""
    
    def __init__(self, db: Session):
        super().__init__(db)
    
    def get_active_change_requests(self) -> List[CustomerChangeRequest]:
        """Get all active change requests"""
        return self.db.query(CustomerChangeRequest).filter(
            CustomerChangeRequest.status.in_(['pending', 'approved', 'in_progress'])
        ).order_by(CustomerChangeRequest.created_at.desc()).all()
    
    def get_pending_change_requests(self) -> List[CustomerChangeRequest]:
        """Get all pending change requests"""
        return self.db.query(CustomerChangeRequest).filter(
            CustomerChangeRequest.status == 'pending'
        ).order_by(CustomerChangeRequest.created_at.desc()).all()
    
    def get_change_request_by_id(self, request_id: int) -> Optional[CustomerChangeRequest]:
        """Get a change request by ID"""
        return self.db.query(CustomerChangeRequest).filter(
            CustomerChangeRequest.id == request_id
        ).first()
    
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
        try:
            change_request = self.get_change_request_by_id(request_id)
            if not change_request:
                return None
            
            # Update status
            change_request.status = status
            change_request.updated_at = datetime.utcnow()
            
            # Update optional fields
            if admin_notes is not None:
                change_request.admin_notes = admin_notes
            if estimated_hours is not None:
                change_request.estimated_hours = estimated_hours
            if estimated_cost is not None:
                change_request.estimated_cost = estimated_cost
            if rejection_reason is not None:
                change_request.rejection_reason = rejection_reason
            
            # Commit changes
            self.db.commit()
            self.db.refresh(change_request)
            
            logger.info(f"Change request {request_id} status updated to {status}")
            return change_request
            
        except Exception as e:
            logger.error(f"Error updating change request {request_id}: {str(e)}")
            self.db.rollback()
            return None
    
    def create_change_request(
        self,
        job_id: int,
        user_id: int,
        title: str,
        description: str,
        priority: str = 'medium',
        requested_via: str = 'portal'
    ) -> Optional[CustomerChangeRequest]:
        """Create a new change request"""
        try:
            change_request = CustomerChangeRequest(
                job_id=job_id,
                user_id=user_id,
                title=title,
                description=description,
                priority=priority,
                requested_via=requested_via,
                status='pending',
                created_at=datetime.utcnow()
            )
            
            self.db.add(change_request)
            self.db.commit()
            self.db.refresh(change_request)
            
            logger.info(f"Change request created: {title}")
            return change_request
            
        except Exception as e:
            logger.error(f"Error creating change request: {str(e)}")
            self.db.rollback()
            return None
    
    def get_change_requests_by_job(self, job_id: int) -> List[CustomerChangeRequest]:
        """Get all change requests for a specific job"""
        return self.db.query(CustomerChangeRequest).filter(
            CustomerChangeRequest.job_id == job_id
        ).order_by(CustomerChangeRequest.created_at.desc()).all()
    
    def get_change_requests_by_user(self, user_id: int) -> List[CustomerChangeRequest]:
        """Get all change requests for a specific user"""
        return self.db.query(CustomerChangeRequest).filter(
            CustomerChangeRequest.user_id == user_id
        ).order_by(CustomerChangeRequest.created_at.desc()).all()
