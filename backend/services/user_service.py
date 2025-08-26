from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from database.models import User
from schemas.user import (
    UserCreate, UserUpdate, UserResponse, CustomerResponse, AdminResponse,
    UserListResponse, UserFilter, UserStats, BulkUserUpdate, BulkUserStatusUpdate,
    UserType, UserStatus, LeadStatus
)
from services.auth_service import AuthService
from typing import Optional, List, Dict, Any, Union
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class UserService:
    """Unified service for handling all user operations (customers and admins)"""
    
    def __init__(self, db: Session):
        self.db = db
        self.auth_service = AuthService(db)
    
    def create_user(self, user_data: UserCreate) -> Union[CustomerResponse, AdminResponse]:
        """Create a new user (customer or admin)"""
        try:
            # Check if user already exists
            existing_user = self.db.query(User).filter(User.email == user_data.email).first()
            if existing_user:
                raise ValueError(f"User with email {user_data.email} already exists")
            
            # Hash password
            password_hash = self.auth_service.hash_password(user_data.password)
            
            # Prepare user data
            user_dict = {
                "email": user_data.email,
                "password_hash": password_hash,
                "user_type": user_data.user_type.value,
                "status": user_data.status.value,
                "name": user_data.name,
                "username": user_data.username,
                "phone": user_data.phone,
                "is_authenticated": True,
                "email_verified": False,  # Will be verified through email verification
                "credits": 0
            }
            
            # Add customer-specific fields
            if user_data.user_type == UserType.CUSTOMER and user_data.customer_fields:
                customer_data = user_data.customer_fields.dict()
                user_dict.update(customer_data)
            
            # Add admin-specific fields
            if user_data.user_type == UserType.ADMIN and user_data.admin_fields:
                admin_data = user_data.admin_fields.dict()
                user_dict.update(admin_data)
            
            # Create user
            db_user = User(**user_dict)
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            
            logger.info(f"Created {user_data.user_type.value} user: {user_data.email}")
            return self._format_user_response(db_user)
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating user {user_data.email}: {str(e)}")
            raise
    
    def get_user_by_id(self, user_id: int, current_user: dict) -> Union[CustomerResponse, AdminResponse]:
        """Get user by ID with proper authorization"""
        # Check authorization
        is_admin = current_user.get('is_admin', False)
        current_user_id = current_user.get('user_id')
        
        if not is_admin and current_user_id != user_id:
            raise PermissionError("Access denied - can only view your own data")
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        return self._format_user_response(user)
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email (internal use)"""
        return self.db.query(User).filter(User.email == email).first()
    
    def update_user(self, user_id: int, user_data: UserUpdate, current_user: dict) -> Union[CustomerResponse, AdminResponse]:
        """Update user with proper authorization"""
        # Check authorization
        is_admin = current_user.get('is_admin', False)
        current_user_id = current_user.get('user_id')
        
        if not is_admin and current_user_id != user_id:
            raise PermissionError("Access denied - can only update your own data")
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        try:
            # Update common fields
            if user_data.name is not None:
                user.name = user_data.name
            if user_data.username is not None:
                user.username = user_data.username
            if user_data.phone is not None:
                user.phone = user_data.phone
            if user_data.status is not None:
                user.status = user_data.status.value
            
            # Update customer-specific fields
            if user.user_type == UserType.CUSTOMER and user_data.customer_fields:
                customer_data = user_data.customer_fields.dict(exclude_unset=True)
                for field, value in customer_data.items():
                    setattr(user, field, value)
            
            # Update admin-specific fields
            if user.user_type == UserType.ADMIN and user_data.admin_fields:
                admin_data = user_data.admin_fields.dict(exclude_unset=True)
                for field, value in admin_data.items():
                    setattr(user, field, value)
            
            user.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(user)
            
            logger.info(f"Updated user {user_id}")
            return self._format_user_response(user)
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating user {user_id}: {str(e)}")
            raise
    
    def update_password(self, user_id: int, current_password: str, new_password: str, current_user: dict) -> bool:
        """Update user password with proper authorization"""
        # Check authorization
        is_admin = current_user.get('is_admin', False)
        current_user_id = current_user.get('user_id')
        
        if not is_admin and current_user_id != user_id:
            raise PermissionError("Access denied - can only update your own password")
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Verify current password
        if not self.auth_service.verify_password(current_password, user.password_hash):
            raise ValueError("Current password is incorrect")
        
        # Hash and update new password
        new_password_hash = self.auth_service.hash_password(new_password)
        user.password_hash = new_password_hash
        user.updated_at = datetime.utcnow()
        
        self.db.commit()
        logger.info(f"Updated password for user {user_id}")
        return True
    
    def get_users(self, current_user: dict, filters: Optional[UserFilter] = None, 
                  skip: int = 0, limit: int = 100) -> List[UserListResponse]:
        """Get users with filtering (admin only)"""
        if not current_user.get('is_admin', False):
            raise PermissionError("Access denied - admin only")
        
        query = self.db.query(User)
        
        # Apply filters
        if filters:
            if filters.user_type:
                query = query.filter(User.user_type == filters.user_type.value)
            if filters.status:
                query = query.filter(User.status == filters.status.value)
            if filters.lead_status:
                query = query.filter(User.lead_status == filters.lead_status.value)
            if filters.business_type:
                query = query.filter(User.business_type.ilike(f"%{filters.business_type}%"))
            if filters.created_after:
                query = query.filter(User.created_at >= filters.created_after)
            if filters.created_before:
                query = query.filter(User.created_at <= filters.created_before)
            if filters.has_credits is not None:
                if filters.has_credits:
                    query = query.filter(User.credits > 0)
                else:
                    query = query.filter(User.credits == 0)
            if filters.search:
                search_term = f"%{filters.search}%"
                query = query.filter(
                    or_(
                        User.name.ilike(search_term),
                        User.email.ilike(search_term),
                        User.business_type.ilike(search_term)
                    )
                )
        
        # Apply pagination and ordering
        users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
        
        return [UserListResponse.from_orm(user) for user in users]
    
    def get_user_stats(self, current_user: dict) -> UserStats:
        """Get user statistics (admin only)"""
        if not current_user.get('is_admin', False):
            raise PermissionError("Access denied - admin only")
        
        try:
            # Total counts
            total_users = self.db.query(func.count(User.id)).scalar()
            total_customers = self.db.query(func.count(User.id)).filter(User.user_type == UserType.CUSTOMER.value).scalar()
            total_admins = self.db.query(func.count(User.id)).filter(User.user_type == UserType.ADMIN.value).scalar()
            
            # Status counts
            active_users = self.db.query(func.count(User.id)).filter(User.status == UserStatus.ACTIVE.value).scalar()
            pending_users = self.db.query(func.count(User.id)).filter(User.status == UserStatus.PENDING.value).scalar()
            suspended_users = self.db.query(func.count(User.id)).filter(User.status == UserStatus.SUSPENDED.value).scalar()
            
            # Credits
            users_with_credits = self.db.query(func.count(User.id)).filter(User.credits > 0).scalar()
            total_credits = self.db.query(func.sum(User.credits)).scalar() or 0
            
            # Time-based counts
            now = datetime.utcnow()
            month_ago = now - timedelta(days=30)
            week_ago = now - timedelta(days=7)
            
            new_users_this_month = self.db.query(func.count(User.id)).filter(
                User.created_at >= month_ago
            ).scalar()
            new_users_this_week = self.db.query(func.count(User.id)).filter(
                User.created_at >= week_ago
            ).scalar()
            
            return UserStats(
                total_users=total_users,
                total_customers=total_customers,
                total_admins=total_admins,
                active_users=active_users,
                pending_users=pending_users,
                suspended_users=suspended_users,
                users_with_credits=users_with_credits,
                total_credits=total_credits,
                new_users_this_month=new_users_this_month,
                new_users_this_week=new_users_this_week
            )
            
        except Exception as e:
            logger.error(f"Error getting user stats: {str(e)}")
            raise
    
    def bulk_update_users(self, bulk_update: BulkUserUpdate, current_user: dict) -> int:
        """Bulk update users (admin only)"""
        if not current_user.get('is_admin', False):
            raise PermissionError("Access denied - admin only")
        
        try:
            updates = bulk_update.updates.dict(exclude_unset=True)
            if not updates:
                return 0
            
            # Update users
            result = self.db.query(User).filter(User.id.in_(bulk_update.user_ids)).update(
                updates, synchronize_session=False
            )
            
            self.db.commit()
            logger.info(f"Bulk updated {result} users")
            return result
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error bulk updating users: {str(e)}")
            raise
    
    def bulk_update_user_status(self, bulk_status_update: BulkUserStatusUpdate, current_user: dict) -> int:
        """Bulk update user status (admin only)"""
        if not current_user.get('is_admin', False):
            raise PermissionError("Access denied - admin only")
        
        try:
            result = self.db.query(User).filter(User.id.in_(bulk_status_update.user_ids)).update(
                {"status": bulk_status_update.status.value}, synchronize_session=False
            )
            
            self.db.commit()
            logger.info(f"Bulk updated status for {result} users to {bulk_status_update.status.value}")
            return result
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error bulk updating user status: {str(e)}")
            raise
    
    def delete_user(self, user_id: int, current_user: dict) -> bool:
        """Delete user (admin only, soft delete)"""
        if not current_user.get('is_admin', False):
            raise PermissionError("Access denied - admin only")
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        try:
            # Soft delete - mark as inactive
            user.status = UserStatus.INACTIVE.value
            user.updated_at = datetime.utcnow()
            
            self.db.commit()
            logger.info(f"Soft deleted user {user_id}")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting user {user_id}: {str(e)}")
            raise
    
    def update_user_credits(self, user_id: int, credit_change: int, reason: str = "Manual adjustment") -> bool:
        """Update user credits (admin only)"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        try:
            new_credits = user.credits + credit_change
            if new_credits < 0:
                raise ValueError("Credits cannot go below 0")
            
            user.credits = new_credits
            user.updated_at = datetime.utcnow()
            
            # TODO: Add credit transaction logging here
            
            self.db.commit()
            logger.info(f"Updated credits for user {user_id}: {credit_change} (new total: {new_credits})")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating credits for user {user_id}: {str(e)}")
            raise
    
    def _format_user_response(self, user: User) -> Union[CustomerResponse, AdminResponse]:
        """Format user for response based on user type"""
        base_data = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "username": user.username,
            "phone": user.phone,
            "status": UserStatus(user.status),
            "user_type": UserType(user.user_type),
            "credits": user.credits,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "last_login": user.last_login
        }
        
        if user.user_type == UserType.CUSTOMER.value:
            customer_fields = {
                "address": user.address,
                "city": user.city,
                "state": user.state,
                "zip_code": user.zip_code,
                "country": user.country,
                "business_site": user.business_site,
                "additional_websites": user.additional_websites,
                "business_type": user.business_type,
                "lead_status": LeadStatus(user.lead_status) if user.lead_status else None,
                "notes": user.notes
            }
            return CustomerResponse(**base_data, customer_fields=customer_fields)
        
        elif user.user_type == UserType.ADMIN.value:
            admin_fields = {
                "is_super_admin": user.is_super_admin
            }
            return AdminResponse(**base_data, admin_fields=admin_fields)
        
        else:
            raise ValueError(f"Unknown user type: {user.user_type}")
