from fastapi import Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from database import get_db
from services.auth_service import AuthService
from typing import Optional

def get_current_user(authorization: str = Header(None), request: Request = None, db: Session = Depends(get_db)) -> dict:
    """Universal authentication dependency for all endpoints"""
    token = None
    
    # Try to get token from Authorization header first
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        print(f"🔑 Found token in header: {token[:20]}...")
    
    # If no header token, try to get from cookie (for browser requests)
    if not token and request:
        all_cookies = dict(request.cookies)
        print(f"🍪 All cookies received: {all_cookies}")
        
        # Try both token names for backward compatibility during migration
        token = (request.cookies.get('auth_token') or 
                request.cookies.get('admin_token') or 
                request.cookies.get('customer_token') or
                request.cookies.get('backup_auth_token') or 
                request.cookies.get('backup_admin_token'))
        
        if token:
            print(f"🍪 Found token in cookie: {token[:20]}...")
        else:
            print("🚫 No token found in any cookie")
    
    if not token:
        print("❌ No authentication token found")
        raise HTTPException(status_code=401, detail="Authorization required")
    
    # Validate token with unified auth service
    auth_service = AuthService(db)
    user_data = auth_service.verify_token(token)
    
    if not user_data:
        print("❌ Invalid or expired token")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    print(f"✅ Authenticated {user_data['user_type']}: {user_data['email']}")
    return user_data

def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency that requires admin privileges"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

def get_current_super_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency that requires super admin privileges"""
    if not current_user.get("is_super_admin", False):
        raise HTTPException(status_code=403, detail="Super admin privileges required")
    return current_user

def require_permission(permission: str):
    """Dependency factory that requires specific permission"""
    def permission_checker(current_user: dict = Depends(get_current_user)) -> dict:
        auth_service = AuthService(None)  # Don't need db for permission check
        if not auth_service.has_permission(current_user, permission):
            raise HTTPException(status_code=403, detail=f"Permission '{permission}' required")
        return current_user
    return permission_checker

def get_customer_or_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency for endpoints that allow both customers and admins"""
    return current_user

def get_current_user_or_redirect(request: Request, db: Session = Depends(get_db)):
    """Dependency for browser routes - redirects to login if not authenticated"""
    from fastapi.responses import RedirectResponse
    
    # Try to get token from cookie
    token = request.cookies.get('admin_token') or request.cookies.get('customer_token') or request.cookies.get('auth_token')
    
    if not token:
        print("🚫 No authentication cookie found, redirecting to login")
        raise HTTPException(status_code=302, headers={"Location": "/portal"})
    
    # Validate token
    auth_service = AuthService(db)
    user_data = auth_service.verify_token(token)
    
    if not user_data:
        print("❌ Invalid token in cookie, redirecting to login")
        raise HTTPException(status_code=302, headers={"Location": "/portal"})
    
    print(f"✅ Authenticated {user_data['user_type']} from cookie: {user_data['email']}")
    return user_data
