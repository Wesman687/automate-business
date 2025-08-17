from fastapi import APIRouter, HTTPException, Depends, Response, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from services.auth_service import AuthService
from services.admin_service import AdminService
from api.auth import get_current_user, get_current_super_admin
from typing import Optional
import logging

logger = logging.getLogger(__name__)

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
    
    # Environment-aware cookie settings
    import os
    is_production = os.getenv('ENVIRONMENT', 'development') == 'production'
    is_https = os.getenv('HTTPS_ENABLED', 'false').lower() == 'true' or is_production
    
    # Debug logging for production
    logger.info(f"🔧 Cookie Config Debug:")
    logger.info(f"   ENVIRONMENT: {os.getenv('ENVIRONMENT', 'not_set')}")
    logger.info(f"   HTTPS_ENABLED: {os.getenv('HTTPS_ENABLED', 'not_set')}")
    logger.info(f"   is_production: {is_production}")
    logger.info(f"   is_https: {is_https}")
    
    # Create JWT token using the encryption key
    auth_service = AuthService(db)
    token = auth_service.create_access_token(user_data)
    
    # For JWT-based auth, return the token for client-side storage
    # Still set cookies as fallback for backward compatibility
    cookie_settings = {
        "max_age": 60 * 60 * 24,  # 24 hours
        "httponly": False,  # Allow JavaScript access for JWT hybrid approach
        "secure": False,  # Temporarily disable for debugging
        "samesite": "lax",  # Use lax for debugging
        "path": "/",
    }
    
    logger.info(f"🔑 Generated JWT token for {user_data['email']}: {token[:20]}...")
    logger.info(f"🍪 Cookie settings: {cookie_settings}")
    
    # Set cookies as fallback
    response.set_cookie(key="auth_token", value=token, **cookie_settings)
    if user_data["user_type"] == "admin":
        response.set_cookie(key="admin_token", value=token, **cookie_settings)
    else:
        response.set_cookie(key="customer_token", value=token, **cookie_settings)
    
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

# Admin Management API Endpoints

@router.get("/admins")
async def get_all_admins(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all admins - Super admins see all, regular admins see only themselves"""
    try:
        admin_service = AdminService(db)
        
        if current_user.get("is_super_admin", False):
            # Super admin sees all admins
            admins = admin_service.get_all_admins()
            admin_list = []
            for admin in admins:
                admin_list.append({
                    "id": admin.id,
                    "email": admin.email,
                    "full_name": admin.full_name,
                    "phone": admin.phone,
                    "address": admin.address,
                    "is_super_admin": admin.is_super_admin,
                    "is_active": admin.is_active,
                    "last_login": admin.last_login.isoformat() if admin.last_login else None,
                    "created_at": admin.created_at.isoformat() if admin.created_at else None
                })
            return {"admins": admin_list}
        else:
            # Regular admin sees only themselves
            admin = admin_service.get_admin_by_id(current_user["user_id"])
            if admin:
                admin_list = [{
                    "id": admin.id,
                    "email": admin.email,
                    "full_name": admin.full_name,
                    "phone": admin.phone,
                    "address": admin.address,
                    "is_super_admin": admin.is_super_admin,
                    "is_active": admin.is_active,
                    "last_login": admin.last_login.isoformat() if admin.last_login else None,
                    "created_at": admin.created_at.isoformat() if admin.created_at else None
                }]
                return {"admins": admin_list}
            else:
                return {"admins": []}
    except Exception as e:
        print(f"❌ Error fetching admins: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching admins: {str(e)}")

@router.post("/create-admin")
async def create_admin(
    request: dict, 
    current_user: dict = Depends(get_current_super_admin), 
    db: Session = Depends(get_db)
):
    """Create a new admin - Super admin only"""
    try:
        admin_service = AdminService(db)
        
        email = request.get("email")
        password = request.get("password")
        full_name = request.get("full_name")
        phone = request.get("phone")
        address = request.get("address")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        # Use email as username for simplicity
        username = email.split("@")[0]
        
        admin = admin_service.create_admin(
            email=email,
            username=username,
            password=password,
            full_name=full_name,
            phone=phone,
            address=address,
            is_super_admin=False
        )
        
        return {
            "message": "Admin created successfully",
            "admin_id": admin.id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Error creating admin: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating admin: {str(e)}")

@router.put("/admins/{admin_id}")
async def update_admin(
    admin_id: int,
    request: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update admin - Super admins can update anyone, regular admins can only update themselves"""
    try:
        admin_service = AdminService(db)
        
        # Check permissions
        if not current_user.get("is_super_admin", False) and current_user["user_id"] != admin_id:
            raise HTTPException(status_code=403, detail="You can only update your own profile")
        
        admin = admin_service.get_admin_by_id(admin_id)
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        # Update fields
        if "email" in request:
            admin.email = request["email"]
        if "full_name" in request:
            admin.full_name = request["full_name"]
        if "phone" in request:
            admin.phone = request["phone"]
        if "address" in request:
            admin.address = request["address"]
        if "password" in request and request["password"]:
            admin.password_hash = admin_service._hash_password(request["password"])
        
        db.commit()
        
        return {"message": "Admin updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating admin: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating admin: {str(e)}")

@router.delete("/admins/{admin_id}")
async def delete_admin(
    admin_id: int,
    current_user: dict = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """Deactivate admin - Super admin only"""
    try:
        admin_service = AdminService(db)
        
        admin = admin_service.get_admin_by_id(admin_id)
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        # Don't allow deleting super admins
        if admin.is_super_admin:
            raise HTTPException(status_code=400, detail="Cannot deactivate super admin")
        
        admin.is_active = False
        db.commit()
        
        return {"message": "Admin deactivated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deactivating admin: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deactivating admin: {str(e)}")

@router.post("/admins/{admin_id}/make-super-admin")
async def make_super_admin(
    admin_id: int,
    current_user: dict = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """Make admin a super admin - Super admin only"""
    try:
        admin_service = AdminService(db)
        
        admin = admin_service.get_admin_by_id(admin_id)
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        admin.is_super_admin = True
        db.commit()
        
        return {"message": "Admin promoted to super admin successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error promoting admin: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error promoting admin: {str(e)}")

@router.post("/admins/{admin_id}/remove-super-admin")
async def remove_super_admin(
    admin_id: int,
    current_user: dict = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """Remove super admin status - Super admin only (owner protection)"""
    try:
        admin_service = AdminService(db)
        
        admin = admin_service.get_admin_by_id(admin_id)
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        # Protect the owner account (wesman687@gmail.com)
        if admin.email.lower() == "wesman687@gmail.com":
            raise HTTPException(status_code=400, detail="Cannot remove super admin status from owner account")
        
        admin.is_super_admin = False
        db.commit()
        
        return {"message": "Super admin status removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error removing super admin status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error removing super admin status: {str(e)}")

@router.get("/debug/auth-status")
async def debug_auth_status(request: Request, db: Session = Depends(get_db)):
    """Debug endpoint to check authentication status and cookie configuration"""
    import os
    
    # Get environment info
    env_info = {
        "ENVIRONMENT": os.getenv('ENVIRONMENT', 'not_set'),
        "HTTPS_ENABLED": os.getenv('HTTPS_ENABLED', 'not_set'),
        "is_production": os.getenv('ENVIRONMENT', 'development') == 'production',
    }
    
    # Get all cookies
    all_cookies = dict(request.cookies)
    
    # Check for auth tokens
    auth_tokens = {
        "auth_token": request.cookies.get('auth_token'),
        "admin_token": request.cookies.get('admin_token'),
        "customer_token": request.cookies.get('customer_token')
    }
    
    # Try to validate any available token
    auth_status = "No valid authentication"
    user_info = None
    
    for token_name, token_value in auth_tokens.items():
        if token_value:
            try:
                auth_service = AuthService(db)
                user_data = auth_service.verify_token(token_value)
                if user_data:
                    auth_status = f"Valid {token_name}"
                    user_info = {
                        "email": user_data.get('email'),
                        "user_type": user_data.get('user_type'),
                        "is_admin": user_data.get('is_admin')
                    }
                    break
            except:
                continue
    
    return {
        "status": "debug_info",
        "environment": env_info,
        "cookies_received": list(all_cookies.keys()),
        "auth_tokens": {k: f"{v[:10]}..." if v else None for k, v in auth_tokens.items()},
        "authentication_status": auth_status,
        "user_info": user_info,
        "request_headers": {
            "host": request.headers.get("host"),
            "origin": request.headers.get("origin"),
            "user_agent": request.headers.get("user-agent", "")[:100]
        }
    }
