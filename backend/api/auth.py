from fastapi import APIRouter, HTTPException, Depends, Header
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
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    expires_at: str
    message: str
    admin_info: dict

class CreateAdminRequest(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Dependency to validate authentication token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Extract token from "Bearer <token>" format
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.replace("Bearer ", "")
    user_info = auth_service.validate_token(token)
    
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Verify admin still exists and is active
    admin_service = AdminService(db)
    admin = admin_service.get_admin_by_id(user_info['admin_id'])
    if not admin or not admin.is_active:
        raise HTTPException(status_code=401, detail="Admin account no longer active")
    
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
            input[type="text"], input[type="password"] {
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
            input[type="text"]:focus, input[type="password"]:focus {
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
            
            <form id="loginForm">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
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
            
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const errorDiv = document.getElementById('error');
                const successDiv = document.getElementById('success');
                const loadingDiv = document.getElementById('loading');
                const loginBtn = document.getElementById('loginBtn');
                
                // Reset messages
                errorDiv.style.display = 'none';
                successDiv.style.display = 'none';
                
                // Show loading
                loadingDiv.style.display = 'block';
                loginBtn.disabled = true;
                
                try {
                    const response = await fetch('/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ username, password })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        // Store token and redirect
                        localStorage.setItem('admin_token', data.token);
                        successDiv.textContent = 'Login successful! Redirecting...';
                        successDiv.style.display = 'block';
                        
                        setTimeout(() => {
                            window.location.href = '/admin/chat-logs';
                        }, 1000);
                    } else {
                        errorDiv.textContent = data.detail || 'Login failed';
                        errorDiv.style.display = 'block';
                    }
                } catch (error) {
                    errorDiv.textContent = 'Network error. Please try again.';
                    errorDiv.style.display = 'block';
                } finally {
                    loadingDiv.style.display = 'none';
                    loginBtn.disabled = false;
                }
            });
        </script>
    </body>
    </html>
    """

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return token"""
    admin_service = AdminService(db)
    admin = admin_service.get_admin_by_email(request.email)
    
    if not admin or not admin_service.verify_password(request.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not admin.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    # Generate token
    token = auth_service.create_token(admin.email)
    
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

@router.get("/validate")
async def validate_token(current_user: dict = Depends(get_current_user)):
    """Validate authentication token and return user info"""
    return {"user": current_user}

@router.get("/validate")
async def validate_token(user_info: dict = Depends(get_current_user)):
    """Validate current token"""
    return {
        "valid": True,
        "user": user_info['username'],
        "expires_at": user_info['expires_at']
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
        new_admin = admin_service.create_admin(
            email=request.email,
            username=request.username,
            password=request.password,
            full_name=request.full_name,
            is_super_admin=False
        )
        
        return {
            "message": "Admin created successfully",
            "admin": {
                "id": new_admin.id,
                "email": new_admin.email,
                "username": new_admin.username,
                "full_name": new_admin.full_name,
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
