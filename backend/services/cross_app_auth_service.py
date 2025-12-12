"""
Cross-App Authentication Service
"""
import logging
import secrets
import hashlib
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status

from database.models import User, AppIntegration, CrossAppSession, AppCreditUsage
from services.auth_service import AuthService
from jose import jwt
import os
import base64

logger = logging.getLogger(__name__)

# JWT settings
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "a24waVZKMmhKNWcybU1fUEV3NU02VjZEUXNNaHZjQnZpOUFNUFhxN2ZhRT0=")
SECRET_KEY = base64.b64decode(ENCRYPTION_KEY).decode('utf-8')
ALGORITHM = "HS256"
SESSION_TOKEN_EXPIRE_HOURS = 24

class CrossAppAuthService:
    """Service for managing cross-app authentication and permissions"""
    
    def __init__(self, db: Session):
        self.db = db
        self.auth_service = AuthService(db)
    
    def validate_app_integration(self, app_id: str) -> Optional[AppIntegration]:
        """Validate that an app integration exists and is active"""
        app = self.db.query(AppIntegration).filter(
            and_(
                AppIntegration.app_id == app_id,
                AppIntegration.status == 'active'
            )
        ).first()
        
        if not app:
            logger.warning(f"App integration not found or inactive: {app_id}")
            return None
        
        # Update last activity
        app.last_activity = datetime.utcnow()
        self.db.commit()
        
        return app
    
    def authenticate_cross_app_user(
        self, 
        app_id: str, 
        email: str, 
        password: str,
        app_user_id: Optional[str] = None,
        app_metadata: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
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
        
        # Get user credits (if available)
        # Note: Credits may be stored in a separate table in production
        user = self.db.query(User).filter(User.id == user_data["user_id"]).first()
        credits = 0
        # Try to get credits from user if the field exists
        if user and hasattr(user, 'credits'):
            credits = user.credits or 0
        
        # Check user count limits
        if app.max_users:
            current_users = self.db.query(AppCreditUsage).filter(
                AppCreditUsage.app_id == app.id
            ).distinct(AppCreditUsage.user_id).count()
            
            if current_users >= app.max_users:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"App has reached user limit: {current_users}/{app.max_users}"
                )
        
        # Create session token
        session_token = self._create_session_token(
            user_id=user_data["user_id"],
            app_id=app_id,
            permissions=app.permissions or []
        )
        
        # Create session in database
        expires_at = datetime.utcnow() + timedelta(hours=SESSION_TOKEN_EXPIRE_HOURS)
        session = CrossAppSession(
            user_id=user_data["user_id"],
            app_id=app.id,
            session_token=session_token,
            status='active',
            permissions=app.permissions or [],
            ip_address=ip_address,
            user_agent=user_agent,
            app_user_id=app_user_id,
            app_metadata=app_metadata,
            expires_at=expires_at
        )
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        # Create or update app credit usage record
        usage = self.db.query(AppCreditUsage).filter(
            and_(
                AppCreditUsage.user_id == user_data["user_id"],
                AppCreditUsage.app_id == app.id
            )
        ).first()
        
        if not usage:
            usage = AppCreditUsage(
                user_id=user_data["user_id"],
                app_id=app.id,
                credits_used=0,
                app_user_id=app_user_id,
                app_metadata=app_metadata
            )
            self.db.add(usage)
            self.db.commit()
        
        return {
            "session_token": session_token,
            "user": {
                "user_id": user_data["user_id"],
                "email": user_data["email"],
                "name": user_data.get("name"),
                "user_type": user_data["user_type"],
                "is_admin": user_data.get("is_admin", False),
                "is_customer": user_data.get("is_customer", False),
                "credits": credits
            },
            "app_info": {
                "app_id": app.app_id,
                "app_name": app.app_name,
                "app_domain": app.app_domain
            },
            "permissions": app.permissions or [],
            "expires_at": expires_at
        }
    
    def validate_session_token(self, session_token: str, app_id: str) -> Dict[str, Any]:
        """Validate a session token"""
        # Get session from database
        session = self.db.query(CrossAppSession).filter(
            CrossAppSession.session_token == session_token
        ).first()
        
        if not session:
            return {"valid": False, "error": "Invalid session token"}
        
        # Check expiration
        if datetime.utcnow() > session.expires_at:
            session.status = 'expired'
            self.db.commit()
            return {"valid": False, "error": "Session token expired"}
        
        # Check status
        if session.status != 'active':
            return {"valid": False, "error": f"Session is {session.status}"}
        
        # Check app_id matches
        app = self.db.query(AppIntegration).filter(AppIntegration.id == session.app_id).first()
        if not app or app.app_id != app_id:
            return {"valid": False, "error": "App ID mismatch"}
        
        # Update last used timestamp
        session.last_used_at = datetime.utcnow()
        self.db.commit()
        
        # Get user info
        user = self.db.query(User).filter(User.id == session.user_id).first()
        if not user:
            return {"valid": False, "error": "User not found"}
        
        credits = 0
        if hasattr(user, 'credits'):
            credits = user.credits or 0
        
        return {
            "valid": True,
            "user": {
                "user_id": user.id,
                "email": user.email,
                "name": user.name,
                "user_type": user.user_type,
                "is_admin": user.is_admin,
                "is_customer": user.is_customer,
                "credits": credits
            },
            "permissions": session.permissions or [],
            "expires_at": session.expires_at
        }
    
    def _create_session_token(self, user_id: int, app_id: str, permissions: List[str]) -> str:
        """Create a JWT session token"""
        expires_at = datetime.utcnow() + timedelta(hours=SESSION_TOKEN_EXPIRE_HOURS)
        
        payload = {
            "user_id": user_id,
            "app_id": app_id,
            "permissions": permissions,
            "exp": expires_at,
            "iat": datetime.utcnow(),
            "type": "cross_app_session"
        }
        
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return token
    
    def refresh_session_token(self, session_token: str, app_id: str) -> Dict[str, Any]:
        """Refresh a session token by creating a new one"""
        validation = self.validate_session_token(session_token, app_id)
        if not validation.get("valid"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation.get("error", "Invalid session token")
            )
        
        # Get existing session
        old_session = self.db.query(CrossAppSession).filter(
            CrossAppSession.session_token == session_token
        ).first()
        
        if not old_session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session not found"
            )
        
        # Create new token
        new_token = self._create_session_token(
            user_id=validation["user"]["user_id"],
            app_id=app_id,
            permissions=validation["permissions"]
        )
        
        expires_at = datetime.utcnow() + timedelta(hours=SESSION_TOKEN_EXPIRE_HOURS)
        
        # Create new session record
        new_session = CrossAppSession(
            user_id=validation["user"]["user_id"],
            app_id=old_session.app_id,
            session_token=new_token,
            status='active',
            permissions=validation["permissions"],
            expires_at=expires_at
        )
        
        # Mark old session as expired
        old_session.status = 'expired'
        
        self.db.add(new_session)
        self.db.commit()
        
        return {
            "new_session_token": new_token,
            "expires_at": expires_at,
            "permissions": validation["permissions"]
        }
    
    def check_credits(self, session_token: str, app_id: str, required_credits: Optional[int] = None) -> Dict[str, Any]:
        """Check user's credit balance"""
        validation = self.validate_session_token(session_token, app_id)
        if not validation.get("valid"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation.get("error", "Invalid session")
            )
        
        user_info = validation["user"]
        current_balance = user_info.get("credits", 0)
        has_sufficient = True
        
        if required_credits is not None:
            has_sufficient = current_balance >= required_credits
        
        return {
            "current_balance": current_balance,
            "has_sufficient_credits": has_sufficient,
            "required_credits": required_credits
        }
    
    def consume_credits(
        self, 
        session_token: str, 
        app_id: str, 
        credits: int, 
        service: str,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Consume credits for a service"""
        validation = self.validate_session_token(session_token, app_id)
        if not validation.get("valid"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation.get("error", "Invalid session")
            )
        
        user_id = validation["user"]["user_id"]
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get session to find app_id
        session = self.db.query(CrossAppSession).filter(
            CrossAppSession.session_token == session_token
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session not found"
            )
        
        # Get current credits (if available)
        current_credits = 0
        if hasattr(user, 'credits'):
            current_credits = user.credits or 0
        
        if current_credits < credits:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient credits. Required: {credits}, Available: {current_credits}"
            )
        
        # Update credits (if user model has credits field)
        # In production, this should use the credit transaction system
        try:
            if hasattr(user, 'credits'):
                user.credits = current_credits - credits
                self.db.commit()
            
            # Update app credit usage record
            usage = self.db.query(AppCreditUsage).filter(
                and_(
                    AppCreditUsage.user_id == user_id,
                    AppCreditUsage.app_id == session.app_id
                )
            ).first()
            
            if usage:
                usage.credits_used = (usage.credits_used or 0) + credits
                usage.updated_at = datetime.utcnow()
            else:
                # Get app from session
                app = self.db.query(AppIntegration).filter(AppIntegration.id == session.app_id).first()
                if app:
                    usage = AppCreditUsage(
                        user_id=user_id,
                        app_id=app.id,
                        credits_used=credits,
                        description=description or f"{service} usage"
                    )
                    self.db.add(usage)
            
            self.db.commit()
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error consuming credits: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to consume credits"
            )
        
        return {
            "success": True,
            "credits_consumed": credits,
            "new_balance": current_credits - credits,
            "transaction_id": None  # Would be set in production
        }

