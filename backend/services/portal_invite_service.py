from sqlalchemy.orm import Session
from database.models import PortalInvite, User
from schemas.portal_invite import PortalInviteCreate, PortalInviteUpdate
from datetime import datetime, timedelta
import secrets
import string
from typing import Optional, List

class PortalInviteService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_invite_token(self) -> str:=
        """Generate a secure random invite token"""
        return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
    
    def create_invite(self, customer_id: int, email: str, expires_in_days: int = 7) -> PortalInvite:
        """Create a new portal invite for a customer"""
        # Check if customer exists
        customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise ValueError("Customer not found")
        
        # Generate unique invite token
        invite_token = self.generate_invite_token()
        while self.db.query(PortalInvite).filter(PortalInvite.invite_token == invite_token).first():
            invite_token = self.generate_invite_token()
        
        # Create invite
        expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        
        invite = PortalInvite(
            customer_id=customer_id,
            invite_token=invite_token,
            email=email,
            status="pending",
            expires_at=expires_at
        )
        
        self.db.add(invite)
        self.db.commit()
        self.db.refresh(invite)
        
        return invite
    
    def get_invite_by_token(self, token: str) -> Optional[PortalInvite]:
        """Get invite by token"""
        return self.db.query(PortalInvite).filter(PortalInvite.invite_token == token).first()
    
    def get_customer_invites(self, customer_id: int) -> List[PortalInvite]:
        """Get all invites for a customer"""
        return self.db.query(PortalInvite).filter(PortalInvite.customer_id == customer_id).all()
    
    def accept_invite(self, token: str) -> bool:
        """Accept a portal invite"""
        invite = self.get_invite_by_token(token)
        if not invite:
            return False
        
        if invite.status != "pending":
            return False
        
        if invite.expires_at < datetime.utcnow():
            invite.status = "expired"
            self.db.commit()
            return False
        
        invite.status = "accepted"
        invite.accepted_at = datetime.utcnow()
        self.db.commit()
        
        return True
    
    def is_invite_valid(self, token: str) -> bool:
        """Check if an invite token is valid and not expired"""
        invite = self.get_invite_by_token(token)
        if not invite:
            return False
        
        return (invite.status == "pending" and 
                invite.expires_at > datetime.utcnow())
    
    def expire_old_invites(self) -> int:
        """Mark expired invites as expired and return count"""
        expired_invites = self.db.query(PortalInvite).filter(
            PortalInvite.status == "pending",
            PortalInvite.expires_at < datetime.utcnow()
        ).all()
        
        for invite in expired_invites:
            invite.status = "expired"
        
        self.db.commit()
        return len(expired_invites)
