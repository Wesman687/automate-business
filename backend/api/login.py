from fastapi import APIRouter, HTTPException, Depends, Response, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from services.auth_service import AuthService
from services.admin_service import AdminService
from models import Admin
from api.auth import get_current_user, get_current_super_admin
import logging

from utils.cookies import AUTH_COOKIE_NAME, build_auth_cookie_kwargs

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["unified-authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    user_type: str = "customer"  # Default to customer, can be "customer" or "admin" (admin requires approval)


class LoginResponse(BaseModel):
    token: str
    user: dict


class RegisterResponse(BaseModel):
    message: str
    user: dict


@router.post("/login")
async def unified_login(request: LoginRequest, response: Response, 
                        req: Request, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    logger.info(f"🔑 Login attempt for email: {request.email}")
    user_data = auth_service.authenticate_user(request.email, request.password)
    if not user_data:
        logger.warning(f"❌ Login failed for email: {request.email}")
        logger.info(f"❌ Authentication failed: Invalid email or password for '{request.email}'")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth_service.create_access_token(user_data)

    cookie_kwargs = build_auth_cookie_kwargs(req)
    response.set_cookie(AUTH_COOKIE_NAME, token, **cookie_kwargs)
    logger.info(f"✅ Login successful for email: {request.email}, setting cookie '{AUTH_COOKIE_NAME}' with params: {cookie_kwargs}")

    return {
        "token": token,  # optional now; cookie carries auth
        "user": {
            "id": user_data["user_id"],
            "email": user_data["email"],
            "name": user_data["name"],
            "user_type": user_data["user_type"],
            "is_admin": user_data["is_admin"],
            "is_customer": user_data["is_customer"],
            "is_super_admin": user_data["is_super_admin"],
            "permissions": user_data["permissions"],
        },
    }

@router.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account"""
    try:
        from database.models import User
    except ImportError:
        # Fallback import path
        from models import User
    
    auth_service = AuthService(db)
    logger.info(f"📝 Registration attempt for email: {request.email}")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email.ilike(request.email)).first()
    if existing_user:
        logger.warning(f"❌ Registration failed: Email already exists '{request.email}'")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate user_type
    if request.user_type not in ["customer", "admin"]:
        raise HTTPException(status_code=400, detail="user_type must be 'customer' or 'admin'")
    
    # Hash password
    password_hash = auth_service.hash_password(request.password)
    
    # Create new user
    new_user = User(
        email=request.email,
        password_hash=password_hash,
        name=request.name,
        user_type=request.user_type,
        status="pending" if request.user_type == "admin" else "active"  # Admins need approval
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"✅ Registration successful for email: {request.email} (type: {request.user_type})")
        
        return {
            "message": "Registration successful" + (" (pending admin approval)" if request.user_type == "admin" else ""),
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "name": new_user.name,
                "user_type": new_user.user_type,
                "status": new_user.status
            }
        }
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Registration error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/logout")
async def logout(response: Response, req: Request):
    kwargs = build_auth_cookie_kwargs(req)
    response.delete_cookie(AUTH_COOKIE_NAME, path="/", domain=kwargs.get("domain"))
    logger.info(f"🔑 Logout: Deleting cookie '{AUTH_COOKIE_NAME}' with domain: {kwargs.get('domain')}")
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

# Admin Management API Endpoints

@router.get("/admins")
async def get_all_admins(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all admins - Super admins see all, regular admins see only themselves"""
    try:
        from models import User
        
        if current_user.get("is_super_admin", False):
            # Super admin sees all admin users
            admin_users = db.query(User).filter(User.user_type == "admin").all()
            admin_list = []
            for user in admin_users:
                # Check if user has admin role
                admin_role = db.query(Admin).filter(Admin.user_id == user.id).first()
                admin_list.append({
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,  # Use name from User model
                    "phone": user.phone,
                    "address": getattr(user, 'address', None),  # Address might not exist
                    "is_super_admin": admin_role.admin_level == "super_admin" if admin_role else False,
                    "status": "active" if user.is_active else "inactive",
                    "last_login": user.last_login.isoformat() if user.last_login else None,
                    "created_at": user.created_at.isoformat() if user.created_at else None
                })
            return {"admins": admin_list}
        else:
            # Regular admin sees only themselves
            user = db.query(User).filter(User.id == current_user["user_id"]).first()
            if user and user.user_type == "admin":
                admin_role = db.query(Admin).filter(Admin.user_id == user.id).first()
                admin_list = [{
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "phone": user.phone,
                    "address": getattr(user, 'address', None),
                    "is_super_admin": admin_role.admin_level == "super_admin" if admin_role else False,
                    "status": "active" if user.is_active else "inactive",
                    "last_login": user.last_login.isoformat() if user.last_login else None,
                    "created_at": user.created_at.isoformat() if user.created_at else None
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
