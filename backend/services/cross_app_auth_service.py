from models import User
from services.base_service import BaseService
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from models.cross_app_models import AppIntegration, CrossAppSession, AppCreditUsage, AppStatus, CrossAppSessionStatus
from schemas.cross_app import AppPermission, CrossAppSessionCreate
from services.auth_service import AuthService
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import secrets
import logging
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class CrossAppAuthService:
    """Service for managing cross-app authentication and permissions"""
    
    def __init__(self, db: Session):
        self.db = db
        self.auth_service = AuthService(db)
        self.session_expiry_hours = 24  # Sessions expire after 24 hours
    
    def generate_session_token(self) -> str:
        """Generate a secure random session token"""
        return secrets.token_urlsafe(32)
    
    def validate_app_integration(self, app_id: str) -> Optional[AppIntegration]:
        """Validate that an app integration exists and is active"""
        app = self.db.query(AppIntegration).filter(
            and_(
                AppIntegration.app_id == app_id,
                AppIntegration.status == AppStatus.ACTIVE
            )
        ).first()
        
        if not app:
            logger.warning(f"App integration not found or inactive: {app_id}")
            return None
        
        return app
    
    def authenticate_cross_app_user(self, app_id: str, email: str, password: str, 
                                  app_user_id: Optional[str] = None, 
                                  app_metadata: Optional[Dict[str, Any]] = None,
                                  ip_address: Optional[str] = None,
                                  user_agent: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Authenticate a user for cross-app access"""
        
        # Validate app integration
        app = self.validate_app_integration(app_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or inactive app integration"
            )
        
        # Authenticate user
        user_data = self.auth_service.authenticate_user(email, password)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user can access this app
        if not self._can_user_access_app(user_data, app):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have permission to access this app"
            )
        
        # Create or update app credit usage record
        self._update_app_credit_usage(user_data["user_id"], app.id, app_user_id, app_metadata)
        
        # Create cross-app session
        session = self._create_cross_app_session(
            user_data["user_id"], 
            app.id, 
            app.permissions,
            ip_address,
            user_agent
        )
        
        return {
            "session_token": session.session_token,
            "user": user_data,
            "app_info": {
                "app_id": app.app_id,
                "app_name": app.app_name,
                "app_domain": app.app_domain
            },
            "permissions": app.permissions,
            "expires_at": session.expires_at
        }
    
    def _can_user_access_app(self, user_data: Dict[str, Any], app: AppIntegration) -> bool:
        """Check if user can access the specified app"""
        
        # Check user count limits
        if app.max_users:
            current_users = self.db.query(AppCreditUsage).filter(
                AppCreditUsage.app_id == app.id
            ).count()
            
            if current_users >= app.max_users:
                logger.warning(f"App {app.app_id} has reached user limit: {current_users}/{app.max_users}")
                return False
        
        # For now, allow all authenticated users to access public apps
        # In the future, we can add more granular permission checks
        return True
    
    def _update_app_credit_usage(self, user_id: int, app_id: int, 
                                app_user_id: Optional[str] = None,
                                app_metadata: Optional[Dict[str, Any]] = None):
        """Create or update app credit usage record"""
        
        usage = self.db.query(AppCreditUsage).filter(
            and_(
                AppCreditUsage.user_id == user_id,
                AppCreditUsage.app_id == app_id
            )
        ).first()
        
        if usage:
            # Update existing record
            usage.last_consumption = datetime.utcnow()
            if app_user_id:
                usage.app_user_id = app_user_id
            if app_metadata:
                usage.app_metadata = app_metadata
        else:
            # Create new record
            usage = AppCreditUsage(
                user_id=user_id,
                app_id=app_id,
                app_user_id=app_user_id,
                app_metadata=app_metadata,
                credits_consumed=0,
                credits_purchased=0
            )
            self.db.add(usage)
        
        self.db.commit()
    
    def _create_cross_app_session(self, user_id: int, app_id: int, 
                                 permissions: List[AppPermission],
                                 ip_address: Optional[str] = None,
                                 user_agent: Optional[str] = None) -> CrossAppSession:
        """Create a new cross-app session"""
        
        # Revoke any existing active sessions for this user/app combination
        self._revoke_existing_sessions(user_id, app_id)
        
        # Create new session
        session = CrossAppSession(
            session_token=self.generate_session_token(),
            user_id=user_id,
            app_id=app_id,
            permissions_granted=permissions,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=datetime.utcnow() + timedelta(hours=self.session_expiry_hours)
        )
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        logger.info(f"Created cross-app session for user {user_id} in app {app_id}")
        return session
    
    def _revoke_existing_sessions(self, user_id: int, app_id: int):
        """Revoke existing active sessions for user/app combination"""
        existing_sessions = self.db.query(CrossAppSession).filter(
            and_(
                CrossAppSession.user_id == user_id,
                CrossAppSession.app_id == app_id,
                CrossAppSession.status == CrossAppSessionStatus.ACTIVE
            )
        ).all()
        
        for session in existing_sessions:
            session.status = CrossAppSessionStatus.REVOKED
            session.revoked_at = datetime.utcnow()
            session.revoked_reason = "New session created"
        
        if existing_sessions:
            self.db.commit()
            logger.info(f"Revoked {len(existing_sessions)} existing sessions for user {user_id} in app {app_id}")
    
    def validate_cross_app_token(self, session_token: str, app_id: str) -> Optional[Dict[str, Any]]:
        """Validate a cross-app session token"""
        
        # Validate app integration
        app = self.validate_app_integration(app_id)
        if not app:
            return None
        
        # Find active session
        session = self.db.query(CrossAppSession).filter(
            and_(
                CrossAppSession.session_token == session_token,
                CrossAppSession.app_id == app.id,
                CrossAppSession.status == CrossAppSessionStatus.ACTIVE,
                CrossAppSession.expires_at > datetime.utcnow()
            )
        ).first()
        
        if not session:
            return None
        
        # Update last activity
        session.last_activity = datetime.utcnow()
        self.db.commit()
        
        # Get user data
        user = self.db.query(User).filter(User.id == session.user_id).first()
        if not user or not user.is_active:
            # Revoke session if user is no longer active
            session.status = CrossAppSessionStatus.REVOKED
            session.revoked_at = datetime.utcnow()
            session.revoked_reason = "User inactive"
            self.db.commit()
            return None
        
        return {
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
            "user_type": user.user_type,
            "is_admin": user.is_admin,
            "is_customer": user.is_customer,
            "permissions": session.permissions_granted,
            "expires_at": session.expires_at
        }
    
    def refresh_cross_app_token(self, session_token: str, app_id: str) -> Optional[Dict[str, Any]]:
        """Refresh a cross-app session token"""
        
        # Validate current session
        current_data = self.validate_cross_app_token(session_token, app_id)
        if not current_data:
            return None
        
        # Get app integration
        app = self.validate_app_integration(app_id)
        if not app:
            return None
        
        # Create new session
        session = self._create_cross_app_session(
            current_data["user_id"],
            app.id,
            app.permissions
        )
        
        return {
            "new_session_token": session.session_token,
            "expires_at": session.expires_at,
            "permissions": session.permissions_granted
        }
    
    def revoke_cross_app_session(self, session_token: str, app_id: str) -> bool:
        """Revoke a cross-app session"""
        
        app = self.validate_app_integration(app_id)
        if not app:
            return False
        
        session = self.db.query(CrossAppSession).filter(
            and_(
                CrossAppSession.session_token == session_token,
                CrossAppSession.app_id == app.id,
                CrossAppSession.status == CrossAppSessionStatus.ACTIVE
            )
        ).first()
        
        if not session:
            return False
        
        session.status = CrossAppSessionStatus.REVOKED
        session.revoked_at = datetime.utcnow()
        session.revoked_reason = "Manually revoked"
        
        self.db.commit()
        logger.info(f"Revoked cross-app session {session_token} for app {app_id}")
        return True
    
    def get_user_cross_app_info(self, session_token: str, app_id: str) -> Optional[Dict[str, Any]]:
        """Get user information for cross-app use"""
        
        user_data = self.validate_cross_app_token(session_token, app_id)
        if not user_data:
            return None
        
        # Get app integration
        app = self.validate_app_integration(app_id)
        if not app:
            return None
        
        # Get app credit usage
        usage = self.db.query(AppCreditUsage).filter(
            and_(
                AppCreditUsage.user_id == user_data["user_id"],
                AppCreditUsage.app_id == app.id
            )
        ).first()
        
        return {
            "user_id": user_data["user_id"],
            "email": user_data["email"],
            "name": user_data["name"],
            "user_type": user_data["user_type"],
            "credits": user_data.get("credits", 0),
            "app_metadata": usage.app_metadata if usage else None,
            "permissions": user_data["permissions"]
        }
    
    def check_user_permission(self, session_token: str, app_id: str, permission: AppPermission) -> bool:
        """Check if user has a specific permission in the app"""
        
        user_data = self.validate_cross_app_token(session_token, app_id)
        if not user_data:
            return False
        
        return permission in user_data.get("permissions", [])
    
    def cleanup_expired_sessions(self):
        """Clean up expired cross-app sessions"""
        expired_sessions = self.db.query(CrossAppSession).filter(
            and_(
                CrossAppSession.status == CrossAppSessionStatus.ACTIVE,
                CrossAppSession.expires_at <= datetime.utcnow()
            )
        ).all()
        
        for session in expired_sessions:
            session.status = CrossAppSessionStatus.EXPIRED
        
        if expired_sessions:
            self.db.commit()
            logger.info(f"Cleaned up {len(expired_sessions)} expired cross-app sessions")

    # Admin methods for managing app integrations
    def create_app_integration(self, app_data, app_id: str, api_key_hash: str, created_by: int, auto_approve: bool = False):
        """Create a new app integration"""
        from schemas.cross_app import AppIntegrationCreate
        
        # Set status based on auto_approve flag - use string values that match the explicit enum
        status = "active" if auto_approve else "pending_approval"
        
        # Create new app integration
        app_integration = AppIntegration(
            app_id=app_id,
            app_name=app_data.app_name,
            app_domain=app_data.app_domain,
            app_url=app_data.app_url,
            description=app_data.description,
            logo_url=app_data.logo_url,
            primary_color=app_data.primary_color,
            permissions=app_data.permissions,
            max_users=app_data.max_users,
            is_public=app_data.is_public,
            api_key_hash=api_key_hash,
            webhook_url=app_data.webhook_url,
            allowed_origins=app_data.allowed_origins,
            status=status,
            created_by=created_by,
            approved_by=created_by if auto_approve else None,
            approved_at=datetime.utcnow() if auto_approve else None
        )
        
        self.db.add(app_integration)
        self.db.commit()
        self.db.refresh(app_integration)
        
        return app_integration

    def get_all_app_integrations(self, status=None):
        """Get all app integrations with optional status filter"""
        query = self.db.query(AppIntegration)
        if status:
            query = query.filter(AppIntegration.status == status)
        return query.all()

    def get_app_integration_by_id(self, app_id: str):
        """Get app integration by app_id"""
        return self.db.query(AppIntegration).filter(AppIntegration.app_id == app_id).first()

    def update_app_integration(self, app_id: str, app_data, updated_by: int):
        """Update an existing app integration"""
        app = self.get_app_integration_by_id(app_id)
        if not app:
            return None
        
        # Update fields
        for field, value in app_data.dict(exclude_unset=True).items():
            if hasattr(app, field):
                setattr(app, field, value)
        
        app.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(app)
        
        return app

    def approve_app_integration(self, app_id: str, approved_by: int):
        """Approve a pending app integration"""
        app = self.get_app_integration_by_id(app_id)
        if not app:
            return None
        
        app.status = AppStatus.ACTIVE
        app.approved_by = approved_by
        app.approved_at = datetime.utcnow()
        app.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(app)
        
        return app

    def suspend_app_integration(self, app_id: str, reason: str, suspended_by: int):
        """Suspend an active app integration"""
        app = self.get_app_integration_by_id(app_id)
        if not app:
            return None
        
        app.status = AppStatus.SUSPENDED
        app.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(app)
        
        return app

    def activate_app_integration(self, app_id: str, activated_by: int):
        """Activate a suspended app integration"""
        app = self.get_app_integration_by_id(app_id)
        if not app:
            return None
        
        app.status = AppStatus.ACTIVE
        app.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(app)
        
        return app

    def update_api_key(self, app_id: str, new_api_key_hash: str, updated_by: int):
        """Update API key for an app integration"""
        app = self.get_app_integration_by_id(app_id)
        if not app:
            return None
        
        app.api_key_hash = new_api_key_hash
        app.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(app)
        
        return app

    def get_app_usage_statistics(self, app_id: str):
        """Get usage statistics for an app integration"""
        from models.cross_app_models import AppCreditUsage
        
        # Get app integration
        app = self.get_app_integration_by_id(app_id)
        if not app:
            return None
        
        # Get usage stats
        usage_stats = self.db.query(AppCreditUsage).filter(
            AppCreditUsage.app_id == app.id
        ).all()
        
        total_consumed = sum(u.credits_consumed for u in usage_stats)
        total_purchased = sum(u.credits_purchased for u in usage_stats)
        unique_users = len(set(u.user_id for u in usage_stats))
        
        return {
            "app_id": app_id,
            "app_name": app.app_name,
            "total_credits_consumed": total_consumed,
            "total_credits_purchased": total_purchased,
            "unique_users": unique_users,
            "usage_records": len(usage_stats)
        }

    def delete_app_integration(self, app_id: str, deleted_by: int):
        """Soft delete an app integration"""
        app = self.get_app_integration_by_id(app_id)
        if not app:
            return None
        
        app.status = AppStatus.INACTIVE
        app.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(app)
        
        return app
