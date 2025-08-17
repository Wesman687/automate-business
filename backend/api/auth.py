from fastapi import Depends, HTTPException, Header, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from database import get_db
from services.auth_service import AuthService
from typing import Optional

from utils.cookies import AUTH_COOKIE_NAME


security = HTTPBearer(auto_error=False)

def _extract_token(request: Request, creds: HTTPAuthorizationCredentials | None) -> str | None:
    """
    Priority:
      1) Authorization: Bearer <token>
      2) Cookie: auth_token (fallback admin_token/customer_token)
      3) Optional: ?token= in query (only if you want it; handy for debugging)
    """
    # 1) Authorization header
    if creds and creds.scheme.lower() == "bearer" and creds.credentials:
        return creds.credentials

    # 2) Cookies
    for name in ("auth_token", "admin_token", "customer_token"):
        val = request.cookies.get(name)
        if val:
            return val

    # 3) Optional query param (comment out if you don’t want it)
    token_q = request.query_params.get("token")
    if token_q:
        return token_q

    return None

async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    creds: HTTPAuthorizationCredentials | None = Depends(security),
):
    token = _extract_token(request, creds)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated (no token)")

    auth = AuthService(db)
    user_data = auth.verify_token(token)  # or auth.decode_access_token(token) now that you added the wrapper
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

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
