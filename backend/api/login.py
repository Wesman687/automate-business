from fastapi import APIRouter, HTTPException, Depends, Response, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from services.auth_service import AuthService
from api.auth import get_current_user
from typing import Optional

router = APIRouter(prefix="/auth", tags=["unified-authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

@router.post("/login")
async def unified_login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Unified login endpoint for both admin and customer users"""
    auth_service = AuthService(db)
    
    # Authenticate user (admin or customer)
    user_data = auth_service.authenticate_user(request.email, request.password)
    
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    token = auth_service.create_access_token(user_data)
    
    # Set cookie for browser sessions
    response.set_cookie(
        key="auth_token",
        value=token,
        max_age=60 * 60 * 24,  # 24 hours
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        path="/"  # Make sure cookie is available for all paths
    )
    
    # Also set legacy cookie names for backward compatibility during migration
    if user_data["user_type"] == "admin":
        response.set_cookie(
            key="admin_token",
            value=token,
            max_age=60 * 60 * 24,
            httponly=True,
            secure=False,
            samesite="lax",
            path="/"
        )
    else:
        response.set_cookie(
            key="customer_token", 
            value=token,
            max_age=60 * 60 * 24,
            httponly=True,
            secure=False,
            samesite="lax",
            path="/"
        )
    
    return {
        "token": token,
        "access_token": token,  # For backward compatibility
        "user": {
            "id": user_data["user_id"],
            "email": user_data["email"],
            "name": user_data["name"],
            "user_type": user_data["user_type"],
            "is_admin": user_data["is_admin"],
            "is_customer": user_data["is_customer"],
            "is_super_admin": user_data["is_super_admin"],
            "permissions": user_data["permissions"]
        }
    }

@router.post("/logout")
async def logout(response: Response):
    """Logout endpoint - clears authentication cookies"""
    response.delete_cookie("auth_token")
    response.delete_cookie("admin_token")  # Legacy
    response.delete_cookie("customer_token")  # Legacy
    
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "user": {
            "id": current_user["user_id"],
            "email": current_user["email"],
            "name": current_user["name"],
            "user_type": current_user["user_type"],
            "is_admin": current_user["is_admin"],
            "is_customer": current_user["is_customer"],
            "is_super_admin": current_user["is_super_admin"],
            "permissions": current_user["permissions"]
        }
    }

@router.get("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify if the current token is valid and return user info"""
    try:
        print(f"🔍 Auth verification for user: {current_user}")
        return {
            "valid": True,
            "user": {
                "user_id": current_user["user_id"],
                "email": current_user["email"],
                "name": current_user.get("name"),
                "user_type": current_user["user_type"],
                "is_admin": current_user.get("is_admin", False),
                "is_customer": current_user.get("is_customer", False),
                "is_super_admin": current_user.get("is_super_admin", False)
            }
        }
    except Exception as e:
        print(f"❌ Error in verify_token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Auth verification failed: {str(e)}")

# Legacy endpoints for backward compatibility
@router.post("/admin-login")
async def admin_login_legacy(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Legacy admin login endpoint - redirects to unified login"""
    result = await unified_login(request, response, db)
    
    # Ensure this is actually an admin user
    if not result["user"]["is_admin"]:
        raise HTTPException(status_code=401, detail="Admin credentials required")
    
    return result

@router.post("/customer-login")
async def customer_login_legacy(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Legacy customer login endpoint - redirects to unified login"""
    result = await unified_login(request, response, db)
    
    # Ensure this is actually a customer user
    if result["user"]["user_type"] != "customer":
        raise HTTPException(status_code=401, detail="Customer credentials required")
    
    # Reformat response to match legacy format
    return {
        "token": result["token"],
        "access_token": result["access_token"],
        "customer_id": result["user"]["id"],
        "customer": {
            "id": result["user"]["id"],
            "name": result["user"]["name"],
            "email": result["user"]["email"]
        }
    }
