from fastapi import APIRouter, HTTPException, Depends, Header, Request
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from services.auth_service import auth_service
from services.admin_service import AdminService
from typing import Optional
import os

router = APIRouter(prefix="/auth", tags=["authentication"])

class LoginRequest(BaseModel):
    email: str  # Changed from username to email
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

class CreateAdminRequest(BaseModel):
    email: str
    username: Optional[str] = None  # Made optional, will auto-generate if not provided
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class UpdateAdminRequest(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    password: Optional[str] = None

class UpdateAdminRequest(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    password: Optional[str] = None

def get_current_user(authorization: str = Header(None), request: Request = None, db: Session = Depends(get_db)):
    """Dependency to validate authentication token from header or cookie"""
    token = None
    
    # Try to get token from Authorization header first
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        print(f"🔑 Found token in header: {token[:20]}...")
    
    # If no header token, try to get from cookie
    if not token and request:
        print(f"🍪 Checking cookies: {dict(request.cookies)}")
        token = request.cookies.get('admin_token')
        if token:
            print(f"🍪 Found token in cookie: {token[:20]}...")
        else:
            print("🚫 No token found in cookie")
    
    if not token:
        print("❌ No authentication token found")
        raise HTTPException(status_code=401, detail="Authorization required")
    
    try:
        user_info = auth_service.validate_token(token)
        
        if not user_info:
            print("❌ Invalid token")
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        print(f"✅ Authenticated user: {user_info.get('email', 'unknown')}")
        
        # Verify admin still exists and is active
        admin_service = AdminService(db)
        admin = admin_service.get_admin_by_id(user_info['admin_id'])
        if not admin or not admin.is_active:
            raise HTTPException(status_code=401, detail="Admin account no longer active")
        
        return user_info
    except Exception as e:
        print(f"❌ Token validation error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user_or_redirect(request: Request, db: Session = Depends(get_db)):
    """Dependency for browser routes - redirects to login if not authenticated"""
    from fastapi.responses import RedirectResponse
    from fastapi import HTTPException
    
    token = None
    
    # Try to get token from cookie
    token = request.cookies.get('admin_token')
    
    if not token:
        print("🚫 No authentication cookie found, redirecting to login")
        raise HTTPException(status_code=302, headers={"Location": "/auth/login"})
    
    user_info = auth_service.validate_token(token)
    
    if not user_info:
        print("❌ Invalid token, redirecting to login")
        raise HTTPException(status_code=302, headers={"Location": "/auth/login"})
    
    print(f"✅ Authenticated user: {user_info.get('email', 'unknown')}")
    
    # Verify admin still exists and is active
    admin_service = AdminService(db)
    admin = admin_service.get_admin_by_id(user_info['admin_id'])
    if not admin or not admin.is_active:
        print("❌ Admin account inactive, redirecting to login")
        raise HTTPException(status_code=302, headers={"Location": "/auth/login"})
    
    return user_info

def get_super_admin(current_user: dict = Depends(get_current_user)):
    """Dependency to ensure current user is a super admin"""
    if not current_user.get('is_super_admin', False):
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user

@router.get("/login", response_class=HTMLResponse)
async def login_page():
    """Admin login page"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>StreamlineAI Admin Login</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                color: #ffffff;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .login-container {
                background: #1e1e1e;
                border-radius: 10px;
                padding: 40px;
                box-shadow: 0 10px 30px rgba(0, 212, 255, 0.1);
                border: 1px solid #333;
                max-width: 400px;
                width: 100%;
            }
            .logo {
                text-align: center;
                font-size: 2.5em;
                font-weight: bold;
                color: #00d4ff;
                margin-bottom: 10px;
            }
            .subtitle {
                text-align: center;
                color: #888;
                margin-bottom: 30px;
            }
            .form-group {
                margin-bottom: 20px;
                position: relative;
            }
            label {
                display: block;
                margin-bottom: 5px;
                color: #ccc;
                font-weight: bold;
            }
            input[type="email"], input[type="text"], input[type="password"] {
                width: 100%;
                padding: 12px;
                border: 1px solid #444;
                border-radius: 5px;
                background: #2a2a2a;
                color: #fff;
                font-size: 16px;
                box-sizing: border-box;
                padding-right: 45px;
            }
            input[type="email"]:focus, input[type="text"]:focus, input[type="password"]:focus {
                outline: none;
                border-color: #00d4ff;
                box-shadow: 0 0 5px rgba(0, 212, 255, 0.3);
            }
            .password-toggle {
                position: absolute;
                right: 10px;
                top: 35px;
                background: none;
                border: none;
                color: #888;
                cursor: pointer;
                font-size: 14px;
                padding: 5px;
            }
            .password-toggle:hover {
                color: #00d4ff;
            }
            .login-btn {
                width: 100%;
                padding: 15px;
                background: #00d4ff;
                color: #000;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.3s;
                margin-bottom: 15px;
            }
            .login-btn:hover {
                background: #0099cc;
            }
            .login-btn:disabled {
                background: #555;
                color: #888;
                cursor: not-allowed;
            }
            .forgot-password {
                text-align: center;
                margin-top: 15px;
            }
            .forgot-password a {
                color: #00d4ff;
                text-decoration: none;
                font-size: 14px;
            }
            .forgot-password a:hover {
                text-decoration: underline;
            }
            .error {
                background: #ff4444;
                color: white;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 20px;
                text-align: center;
                display: none;
            }
            .success {
                background: #39ff14;
                color: #000;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 20px;
                text-align: center;
                display: none;
            }
            .loading {
                text-align: center;
                color: #00d4ff;
                margin-top: 10px;
                display: none;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="logo">StreamlineAI</div>
            <div class="subtitle">Admin Portal</div>
            
            <div id="error" class="error"></div>
            <div id="success" class="success"></div>
            
            <form id="loginForm" method="POST" action="/auth/login-browser">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                    <button type="button" class="password-toggle" onclick="togglePassword('password')">
                        👁️ Show
                    </button>
                </div>
                
                <button type="submit" class="login-btn" id="loginBtn">
                    Login to Admin Portal
                </button>
                
                <div class="forgot-password">
                    <a href="/auth/forgot-password">Forgot your password?</a>
                </div>
                
                <div class="loading" id="loading">
                    Authenticating...
                </div>
            </form>
        </div>

        <script>
            function togglePassword(fieldId) {
                const field = document.getElementById(fieldId);
                const button = field.nextElementSibling;
                
                if (field.type === 'password') {
                    field.type = 'text';
                    button.textContent = '🙈 Hide';
                } else {
                    field.type = 'password';
                    button.textContent = '👁️ Show';
                }
            }
        </script>
    </body>
    </html>
    """

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return token"""
    admin_service = AdminService(db)
    admin = admin_service.authenticate_admin(request.email, request.password)
    
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create authentication token
    admin_data = {
        'id': admin.id,
        'username': admin.username,
        'email': admin.email,
        'is_super_admin': admin.is_super_admin
    }
    token = auth_service.generate_token(admin_data)
    
    return LoginResponse(
        token=token,
        user={
            "id": admin.id,
            "email": admin.email,
            "username": admin.username,
            "full_name": admin.full_name,
            "is_super_admin": admin.is_super_admin,
            "is_active": admin.is_active
        }
    )

@router.post("/login-browser")
async def login_browser(request: Request, db: Session = Depends(get_db)):
    """Login endpoint that sets an admin cookie for browser access"""
    # Get form data
    form = await request.form()
    email = form.get("email")
    password = form.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    admin_service = AdminService(db)
    admin = admin_service.authenticate_admin(email, password)
    
    if not admin:
        # Return error page
        error_html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login Failed</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
                    color: #e0e0e0;
                    margin: 0;
                    padding: 20px;
                    text-align: center;
                }
                h1 { color: #ff4444; }
                a { color: #00d4ff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>Login Failed</h1>
            <p>Invalid email or password. Please try again.</p>
            <a href="/auth/login">← Back to Login</a>
        </body>
        </html>
        """
        return HTMLResponse(content=error_html, status_code=401)
    
    # Create authentication token
    admin_data = {
        'id': admin.id,
        'username': admin.username,
        'email': admin.email,
        'is_super_admin': admin.is_super_admin
    }
    token = auth_service.generate_token(admin_data)
    
    # Create response with HTML redirect
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login Success</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
                color: #e0e0e0;
                margin: 0;
                padding: 20px;
                text-align: center;
            }}
            h1 {{ color: #00d4ff; }}
        </style>
        <script>
            // Redirect to admin dashboard after 2 seconds
            setTimeout(function() {{
                window.location.href = '/admin/';
            }}, 2000);
        </script>
    </head>
    <body>
        <h1>Login Successful!</h1>
        <p>Welcome, {admin.full_name}! Redirecting to admin dashboard...</p>
    </body>
    </html>
    """
    
    response = HTMLResponse(content=html_content)
    # Set cookie with token
    print(f"🍪 Setting cookie with token: {token[:20]}...")
    response.set_cookie(
        key="admin_token",
        value=token,
        httponly=False,  # Allow JavaScript access for debugging
        max_age=86400,  # 24 hours
        path="/",
        secure=False,  # Set to True in production with HTTPS
        samesite="lax"  # Allow cookie to be sent on same-site requests
    )
    
    return response

@router.post("/logout")
async def logout():
    """Logout and clear authentication cookie"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Logged Out</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
                color: #e0e0e0;
                margin: 0;
                padding: 20px;
                text-align: center;
            }
            h1 { color: #00d4ff; }
            a { color: #00d4ff; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
        <script>
            // Redirect to login after 3 seconds
            setTimeout(function() {
                window.location.href = '/auth/login';
            }, 3000);
        </script>
    </head>
    <body>
        <h1>Logged Out Successfully</h1>
        <p>You have been logged out. Redirecting to login page...</p>
        <a href="/auth/login">← Back to Login</a>
    </body>
    </html>
    """
    
    response = HTMLResponse(content=html_content)
    # Clear the authentication cookie
    response.delete_cookie(key="admin_token", path="/")
    return response

@router.get("/validate")
async def validate_token(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Validate authentication token and return user info"""
    # Get full admin details for frontend
    admin_service = AdminService(db)
    admin = admin_service.get_admin_by_id(current_user['admin_id'])
    
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    return {
        "valid": True, 
        "user": {
            "id": admin.id,
            "email": admin.email,
            "username": admin.username,
            "full_name": admin.full_name,
            "is_super_admin": admin.is_super_admin,
            "is_active": admin.is_active
        }
    }

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current authenticated user information"""
    # Get full admin details for frontend
    admin_service = AdminService(db)
    admin = admin_service.get_admin_by_id(current_user['admin_id'])
    
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    return {
        "id": admin.id,
        "email": admin.email,
        "username": admin.username,
        "full_name": admin.full_name,
        "is_super_admin": admin.is_super_admin,
        "is_active": admin.is_active
    }

@router.post("/logout")
async def logout():
    """Logout (client should delete token)"""
    return {"message": "Logout successful. Please delete your token."}

@router.get("/setup", response_class=HTMLResponse)
async def setup_page():
    """Setup page for creating initial super admin"""
    setup_html_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "setup_admin.html")
    try:
        with open(setup_html_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return """
        <html><body style="font-family: Arial; padding: 50px; background: #1a1a1a; color: white;">
            <h1>Setup Not Available</h1>
            <p>Setup file not found. Please use the API endpoint directly.</p>
        </body></html>
        """

@router.post("/setup-super-admin")
async def setup_super_admin(request: CreateAdminRequest, db: Session = Depends(get_db)):
    """Setup initial super admin (only works if no super admin exists)"""
    admin_service = AdminService(db)
    
    try:
        # Use your email as default
        super_admin = admin_service.setup_initial_super_admin(
            email=request.email or "wesman687@gmail.com",
            username=request.username,
            password=request.password,
            full_name=request.full_name or "Wesley Wesman"
        )
        
        return {
            "message": "Super admin created successfully",
            "admin": {
                "id": super_admin.id,
                "email": super_admin.email,
                "username": super_admin.username,
                "full_name": super_admin.full_name,
                "is_super_admin": super_admin.is_super_admin
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-admin")
async def create_admin(
    request: CreateAdminRequest, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_super_admin)
):
    """Create new admin (super admin only)"""
    admin_service = AdminService(db)
    
    try:
        # Auto-generate username from email if not provided
        username = request.username
        if not username:
            username = request.email.split('@')[0]
            # Ensure uniqueness by appending numbers if needed
            counter = 1
            original_username = username
            while admin_service.get_admin_by_username(username):
                username = f"{original_username}{counter}"
                counter += 1
        
        new_admin = admin_service.create_admin(
            email=request.email,
            username=username,
            password=request.password,
            full_name=request.full_name,
            phone=request.phone,
            address=request.address,
            is_super_admin=False
        )
        
        return {
            "message": "Admin created successfully",
            "admin": {
                "id": new_admin.id,
                "email": new_admin.email,
                "username": new_admin.username,
                "full_name": new_admin.full_name,
                "phone": new_admin.phone,
                "address": new_admin.address,
                "is_super_admin": new_admin.is_super_admin,
                "is_active": new_admin.is_active
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/admins")
async def list_admins(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_super_admin)
):
    """List all admins (super admin only)"""
    admin_service = AdminService(db)
    admins = admin_service.get_all_admins()
    
    return {
        "admins": [
            {
                "id": admin.id,
                "email": admin.email,
                "username": admin.username,
                "full_name": admin.full_name,
                "phone": admin.phone,
                "address": admin.address,
                "is_super_admin": admin.is_super_admin,
                "is_active": admin.is_active,
                "created_at": admin.created_at.isoformat() if admin.created_at else None,
                "last_login": admin.last_login.isoformat() if admin.last_login else None
            }
            for admin in admins
        ]
    }

@router.delete("/admins/{admin_id}")
async def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_super_admin)
):
    """Delete admin (super admin only)"""
    admin_service = AdminService(db)
    
    try:
        success = admin_service.delete_admin(admin_id)
        if success:
            return {"message": "Admin deactivated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Admin not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/admins/{admin_id}")
async def update_admin(
    admin_id: int,
    request: UpdateAdminRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update admin details (super admin only, or admin updating themselves)"""
    admin_service = AdminService(db)
    
    # Check permissions: super admin or admin updating themselves
    if not current_user.get('is_super_admin') and current_user.get('id') != admin_id:
        raise HTTPException(
            status_code=403, 
            detail="You can only edit your own profile unless you are a super admin"
        )
    
    try:
        updated_admin = admin_service.update_admin(
            admin_id=admin_id,
            email=request.email,
            username=request.username,
            full_name=request.full_name,
            phone=request.phone,
            address=request.address,
            password=request.password
        )
        
        if updated_admin:
            return {
                "message": "Admin updated successfully",
                "admin": {
                    "id": updated_admin.id,
                    "email": updated_admin.email,
                    "username": updated_admin.username,
                    "full_name": updated_admin.full_name,
                    "phone": updated_admin.phone,
                    "address": updated_admin.address,
                    "is_super_admin": updated_admin.is_super_admin,
                    "is_active": updated_admin.is_active
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Admin not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/admins/{admin_id}")
async def update_admin(
    admin_id: int,
    request: UpdateAdminRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update admin details (admin can edit themselves, super admin can edit anyone)"""
    admin_service = AdminService(db)
    
    # Check permissions - admin can only edit themselves unless they're super admin
    if not current_user.get("is_super_admin") and current_user.get("admin_id") != admin_id:
        raise HTTPException(status_code=403, detail="You can only edit your own profile")
    
    try:
        updated_admin = admin_service.update_admin(
            admin_id=admin_id,
            email=request.email,
            full_name=request.full_name,
            phone=request.phone,
            address=request.address,
            password=request.password
        )
        
        if updated_admin:
            return {
                "message": "Admin updated successfully",
                "admin": {
                    "id": updated_admin.id,
                    "email": updated_admin.email,
                    "username": updated_admin.username,
                    "full_name": updated_admin.full_name,
                    "phone": updated_admin.phone,
                    "address": updated_admin.address,
                    "is_super_admin": updated_admin.is_super_admin,
                    "is_active": updated_admin.is_active
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Admin not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/admins/{admin_id}/make-super-admin")
async def make_super_admin(
    admin_id: int,
    current_user: dict = Depends(get_super_admin),
    db: Session = Depends(get_db)
):
    """Make an admin a super admin - only super admins can do this"""
    admin_service = AdminService(db)
    
    success = admin_service.make_super_admin(admin_id, current_user["admin_id"])
    
    if success:
        return {"message": "Admin promoted to super admin successfully"}
    else:
        raise HTTPException(status_code=400, detail="Failed to promote admin")

@router.post("/admins/{admin_id}/remove-super-admin")
async def remove_super_admin(
    admin_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove super admin status - only the owner can do this"""
    # Only allow wesman687@gmail.com to remove super admin status
    if current_user["email"].lower() != "wesman687@gmail.com":
        raise HTTPException(status_code=403, detail="Only the owner can remove super admin status")
    
    admin_service = AdminService(db)
    admin = admin_service.get_admin_by_id(admin_id)
    
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    if not admin.is_super_admin:
        raise HTTPException(status_code=400, detail="Admin is not a super admin")
    
    # Don't allow removing owner's super admin status
    if admin.email.lower() == "wesman687@gmail.com":
        raise HTTPException(status_code=400, detail="Cannot remove owner's super admin status")
    
    success = admin_service.remove_super_admin(admin_id)
    
    if success:
        return {"message": "Super admin status removed successfully"}
    else:
        raise HTTPException(status_code=400, detail="Failed to remove super admin status")

@router.put("/admins/{admin_id}")
async def update_admin_details(
    admin_id: int,
    update_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update admin details - admins can update their own info, super admins can update any"""
    admin_service = AdminService(db)
    
    # Check permissions
    if not current_user.get("is_super_admin", False) and current_user["admin_id"] != admin_id:
        raise HTTPException(status_code=403, detail="Can only update your own information")
    
    try:
        updated_admin = admin_service.update_admin(
            admin_id=admin_id,
            email=update_data.get("email"),
            full_name=update_data.get("full_name")
        )
        
        if updated_admin:
            return {"message": "Admin updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Admin not found")
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
