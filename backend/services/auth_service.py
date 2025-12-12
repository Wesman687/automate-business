from models import User, UserType  # Unified model only!
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, Dict, Any
from jose import jwt, JWTError
import bcrypt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
import base64
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from database import get_db

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings - Use environment ENCRYPTION_KEY
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "a24waVZKMmhKNWcybU1fUEV3NU02VjZEUXNNaHZjQnZpOUFNUFhxN2ZhRT0=")
# Decode the base64 key for JWT
SECRET_KEY = base64.b64decode(ENCRYPTION_KEY).decode('utf-8')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def hash_password(self, password: str) -> str:
        """Hash a password for storing in database"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        """Authenticate user using unified User model"""
        
        # Use unified model - no fallback!
        user = self.db.query(User).filter(User.email.ilike(email)).first()
        
        if not user:
            print(f"❌ Authentication failed: User not found for email '{email}'")
            return None
            
        if not user.password_hash:
            print(f"❌ Authentication failed: User '{email}' has no password hash")
            return None
            
        if not self.verify_password(password, user.password_hash):
            print(f"❌ Authentication failed: Invalid password for user '{email}'")
            return None
            
        if not user.is_active:
            print(f"❌ Authentication failed: User '{email}' is not active (status: {user.status})")
            return None
        
        # Check if email is verified (if the field exists)
        if hasattr(user, 'email_verified') and not user.email_verified:
            print(f"❌ Authentication failed: User '{email}' email not verified")
            return None
        
        print(f"✅ Authentication successful for user '{email}' (type: {user.user_type})")
        
        return {
            "user_id": user.id,
            "email": user.email,
            "name": user.name or user.username,
            "user_type": user.user_type,
            "is_admin": user.is_admin,  # This uses the @property
            "is_customer": user.is_customer,  # This uses the @property
            "is_super_admin": user.is_super_admin if user.is_admin else False,
            "permissions": self._get_permissions(user)
        }
    
    def _get_permissions(self, user) -> list:
        """Get permissions based on user type"""
        if user.is_admin:
            base_permissions = [
                "view_appointments",
                "create_appointments", 
                "edit_appointments",
                "delete_appointments",
                "view_customers",
                "create_customers",
                "edit_customers"
            ]
            
            if user.is_super_admin:
                base_permissions.extend([
                    "manage_admins",
                    "view_system_logs",
                    "system_settings",
                    "delete_customers"
                ])
            
            return base_permissions
        else:
            return [
                "view_own_appointments",
                "create_own_appointments",
                "edit_own_appointments"
            ]
    def decode_access_token(self, token: str):
        """Deprecated wrapper: use verify_token(token)"""
        return self.verify_token(token)
    
    def create_access_token(self, user_data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token with user data"""
        to_encode = user_data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access_token"
        })
        
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[dict]:
        """Verify JWT token and return user data"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Check token type
            if payload.get("type") != "access_token":
                return None
            
            # Extract user data
            user_data = {
                "user_id": payload.get("user_id"),
                "email": payload.get("email"),
                "name": payload.get("name"),
                "user_type": payload.get("user_type"),
                "is_admin": payload.get("is_admin", False),
                "is_customer": payload.get("is_customer", False),
                "is_super_admin": payload.get("is_super_admin", False),
                "permissions": payload.get("permissions", [])
            }
            
            # Ensure admin flags are properly set based on user_type
            if user_data["user_type"] == "admin":
                user_data["is_admin"] = True
                user_data["is_customer"] = False
            elif user_data["user_type"] == "customer":
                user_data["is_admin"] = False
                user_data["is_customer"] = True
            
            
            # Verify user still exists and is active - unified approach only
            user = self.db.query(User).filter(User.id == user_data["user_id"]).first()
            if not user or not user.is_active:
                return None
            
            return user_data
            
        except JWTError:
            return None
    
    def get_user_from_token(self, token: str) -> Optional[dict]:
        """Get user data from JWT token"""
        return self.verify_token(token)
    
    def has_permission(self, user_data: dict, permission: str) -> bool:
        """Check if user has specific permission"""
        return permission in user_data.get("permissions", [])
    
    def require_admin(self, user_data: dict) -> bool:
        """Check if user is admin"""
        return user_data.get("is_admin", False)
    
    def require_super_admin(self, user_data: dict) -> bool:
        """Check if user is super admin"""
        return user_data.get("is_super_admin", False)
    
    def can_access_customer_data(self, user_data: dict, customer_id: int) -> bool:
        """Check if user can access specific customer data"""
        # Admins can access all customer data
        if user_data.get("is_admin", False):
            return True
        
        # Customers can only access their own data
        if user_data.get("user_type") == "customer":
            return user_data.get("user_id") == customer_id
        
        return False

def get_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), db: Session = Depends(get_db)) -> Optional[dict]:
    """Get current user from JWT token - dependency for FastAPI endpoints"""
    try:
        auth_service = AuthService(db)
        user_data = auth_service.verify_token(token)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Get current admin user - dependency for admin-only endpoints"""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
