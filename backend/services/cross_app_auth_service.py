"""
Cross-App Authentication Service
"""
import logging
import secrets
import hashlib
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from database.models import User
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

# Simple in-memory storage for app integrations and sessions
# In production, these should be in the database
_app_integrations: Dict[str, Dict[str, Any]] = {}
_cross_app_sessions: Dict[str, Dict[str, Any]] = {}

class CrossAppAuthService:
    """Service for managing cross-app authentication and permissions"""
    
    def __init__(self, db: Session):
        self.db = db
        self.auth_service = AuthService(db)
    
    def validate_app_integration(self, app_id: str) -> Optional[Dict[str, Any]]:
        """Validate that an app integration exists and is active"""
        # For now, we'll allow any app_id that starts with 'app_'
        # In production, this should check the database
        if not app_id.startswith('app_'):
            logger.warning(f"Invalid app_id format: {app_id}")
            return None
        
        # Check if app exists in memory (or allow all for now)
        if app_id not in _app_integrations:
            # Auto-create a basic integration for now
            _app_integrations[app_id] = {
                'app_id': app_id,
                'app_name': app_id.replace('app_', '').replace('_', ' ').title(),
                'app_domain': 'unknown',
                'status': 'active',
                'permissions': [
                    'read_user_info',
                    'read_credits',
                    'purchase_credits',
                    'consume_credits',
                    'manage_subscriptions',
                    'read_analytics'
                ]
            }
        
        app = _app_integrations[app_id]
        if app.get('status') != 'active':
            logger.warning(f"App integration not active: {app_id}")
            return None
        
        return app
    
    def authenticate_cross_app_user(
        self, 
        app_id: str, 
        email: str, 
        password: str,
        app_user_id: Optional[str] = None,
        app_metadata: Optional[Dict[str, Any]] = None
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
        
        # Create session token
        session_token = self._create_session_token(
            user_id=user_data["user_id"],
            app_id=app_id,
            permissions=app['permissions']
        )
        
        # Store session
        expires_at = datetime.utcnow() + timedelta(hours=SESSION_TOKEN_EXPIRE_HOURS)
        _cross_app_sessions[session_token] = {
            'user_id': user_data["user_id"],
            'app_id': app_id,
            'permissions': app['permissions'],
            'expires_at': expires_at,
            'created_at': datetime.utcnow()
        }
        
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
                "app_id": app["app_id"],
                "app_name": app["app_name"],
                "app_domain": app["app_domain"]
            },
            "permissions": app["permissions"],
            "expires_at": expires_at
        }
    
    def validate_session_token(self, session_token: str, app_id: str) -> Dict[str, Any]:
        """Validate a session token"""
        if session_token not in _cross_app_sessions:
            return {"valid": False, "error": "Invalid session token"}
        
        session = _cross_app_sessions[session_token]
        
        # Check expiration
        if datetime.utcnow() > session['expires_at']:
            del _cross_app_sessions[session_token]
            return {"valid": False, "error": "Session token expired"}
        
        # Check app_id matches
        if session['app_id'] != app_id:
            return {"valid": False, "error": "App ID mismatch"}
        
        # Get user info
        user = self.db.query(User).filter(User.id == session['user_id']).first()
        if not user:
            return {"valid": False, "error": "User not found"}
        
        credits = 0
        if user and hasattr(user, 'credits'):
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
            "permissions": session['permissions'],
            "expires_at": session['expires_at']
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
        
        # Get current credits (if available)
        current_credits = 0
        if hasattr(user, 'credits'):
            current_credits = user.credits or 0
        
        if current_credits < credits:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient credits. Required: {credits}, Available: {current_credits}"
            )
        
        # For now, just update the credits attribute if it exists
        # In production, this should use the credit transaction system
        try:
            if hasattr(user, 'credits'):
                user.credits = current_credits - credits
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

