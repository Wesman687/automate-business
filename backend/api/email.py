from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from services.email_service import email_service
from services.admin_service import AdminService
from services.auth_service import auth_service
from sqlalchemy.orm import Session
from database import get_db
import secrets
import time

router = APIRouter(prefix="/email", tags=["email"])

class EmailRequest(BaseModel):
    to_emails: List[EmailStr]
    subject: str
    body: str
    html_body: Optional[str] = None
    from_account: str = "no-reply"  # 'no-reply', 'sales', or 'tech'

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    confirm_password: str

# Store password reset tokens temporarily (in production, use Redis or database)
password_reset_tokens = {}

@router.post("/send")
async def send_email(request: EmailRequest):
    """Send email through the email service"""
    try:
        success = email_service.send_email(
            from_account=request.from_account,
            to_emails=request.to_emails,
            subject=request.subject,
            body=request.body,
            html_body=request.html_body
        )
        
        if success:
            return {"message": "Email sent successfully", "status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email service error: {str(e)}")

@router.post("/send-notification")
async def send_notification(subject: str, body: str, to_emails: Optional[List[EmailStr]] = None):
    """Send notification email from no-reply account"""
    try:
        success = email_service.send_notification(
            subject=subject,
            body=body,
            to_emails=to_emails
        )
        
        if success:
            return {"message": "Notification sent successfully", "status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send notification")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Notification service error: {str(e)}")

@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Send password reset email
    
    IMPORTANT: Email functionality only works on production server!
    In development, emails are logged but not actually sent.
    """
    admin_service = AdminService(db)
    
    # Check if admin exists
    admin = admin_service.get_admin_by_email(request.email)
    if not admin:
        # For security, don't reveal if email exists or not
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    
    # Store token with expiration (1 hour)
    password_reset_tokens[reset_token] = {
        'email': request.email,
        'admin_id': admin.id,
        'expires_at': time.time() + 3600,  # 1 hour
        'used': False
    }
    
    # Create reset link
    reset_link = f"https://stream-lineai.com/reset-password?token={reset_token}"
    
    # Email content
    email_subject = "Password Reset Request"
    email_body = f"""
Hello {admin.full_name or admin.username},

You have requested to reset your password for your StreamlineAI admin account.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Best regards,
StreamlineAI Team
"""
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #00d4ff; text-align: center;">StreamlineAI Password Reset</h2>
            
            <p>Hello <strong>{admin.full_name or admin.username}</strong>,</p>
            
            <p>You have requested to reset your password for your StreamlineAI admin account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background: #00d4ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
            
            <p>If you did not request this password reset, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #666; font-size: 12px; text-align: center;">
                Best regards,<br>
                StreamlineAI Team<br>
                <a href="https://stream-lineai.com">stream-lineai.com</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    try:
        success = email_service.send_email(
            from_account='no-reply',
            to_emails=[request.email],
            subject=email_subject,
            body=email_body,
            html_body=html_body
        )
        
        if success:
            return {"message": "If the email exists, a password reset link has been sent"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send password reset email")
            
    except Exception as e:
        return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/reset-password")
async def reset_password(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Reset password with token"""
    
    # Validate token
    if request.token not in password_reset_tokens:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    token_data = password_reset_tokens[request.token]
    
    # Check if token is expired
    if time.time() > token_data['expires_at']:
        del password_reset_tokens[request.token]
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Check if token is already used
    if token_data['used']:
        raise HTTPException(status_code=400, detail="Reset token has already been used")
    
    # Validate passwords match
    if request.new_password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Validate password strength
    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    admin_service = AdminService(db)
    
    try:
        # Update password
        admin = admin_service.get_admin_by_id(token_data['admin_id'])
        if not admin:
            raise HTTPException(status_code=400, detail="Admin account not found")
        
        # Update password
        admin_service.update_admin_password(admin.id, request.new_password)
        
        # Mark token as used
        password_reset_tokens[request.token]['used'] = True
        
        return {"message": "Password reset successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset password: {str(e)}")

@router.get("/test")
async def test_email():
    """Test email service connection"""
    try:
        success = email_service.send_notification(
            subject="Test Email",
            body="This is a test email from the StreamlineAI admin system.",
            to_emails=["tech@stream-lineai.com"]
        )
        
        if success:
            return {"message": "Test email sent successfully", "status": "success"}
        else:
            return {"message": "Failed to send test email", "status": "error"}
            
    except Exception as e:
        return {"message": f"Email test failed: {str(e)}", "status": "error"}

@router.post("/test-forgot-password")
async def test_forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Test password reset flow - for development testing
    Returns the reset link that would be sent via email
    """
    admin_service = AdminService(db)
    
    # Check if admin exists
    admin = admin_service.get_admin_by_email(request.email)
    if not admin:
        return {"message": "Admin not found", "test_mode": True}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    
    # Store token with expiration (1 hour)
    password_reset_tokens[reset_token] = {
        'email': request.email,
        'admin_id': admin.id,
        'expires_at': time.time() + 3600,  # 1 hour
        'used': False
    }
    
    # Create reset link
    reset_link = f"https://stream-lineai.com/reset-password?token={reset_token}"
    
    return {
        "message": "Test mode - here's the reset link that would be emailed",
        "reset_link": reset_link,
        "token": reset_token,
        "expires_in": "1 hour",
        "test_mode": True,
        "admin_email": admin.email,
        "admin_name": admin.full_name or admin.username
    }
