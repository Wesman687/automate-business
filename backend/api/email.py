from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from api.auth import get_current_admin
from services.email_reader_service import EmailReaderService
from services.email_service import email_service
from services.admin_service import AdminService
from sqlalchemy.orm import Session
from database import get_db
import secrets
import time
import logging

email_logger = logging.getLogger('email')  # Dedicated email logger

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
async def send_email(
    request: EmailRequest,
    current_user: dict = Depends(get_current_admin)
):
    """Send email through the email service"""
    try:
        # Log the email API request
        email_logger.info(f"📧 EMAIL_API_SEND_REQUEST | From: {request.from_account} | To: {', '.join(request.to_emails)} | Subject: {request.subject}")
        
        success = email_service.send_email(
            from_account=request.from_account,
            to_emails=request.to_emails,
            subject=request.subject,
            body=request.body,
            html_body=request.html_body
        )
        
        if success:
            email_logger.info(f"📧 EMAIL_API_SEND_SUCCESS | From: {request.from_account} | To: {', '.join(request.to_emails)} | Subject: {request.subject}")
            return {"message": "Email sent successfully", "status": "success"}
        else:
            email_logger.error(f"📧 EMAIL_API_SEND_FAILED | From: {request.from_account} | To: {', '.join(request.to_emails)} | Subject: {request.subject}")
            raise HTTPException(status_code=500, detail="Failed to send email")
            
    except Exception as e:
        email_logger.error(f"📧 EMAIL_API_SEND_ERROR | From: {request.from_account} | To: {', '.join(request.to_emails)} | Subject: {request.subject} | Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Email service error: {str(e)}")

@router.post("/send-notification")
async def send_notification(
    subject: str, 
    body: str, 
    to_emails: Optional[List[EmailStr]] = None,
    current_user: dict = Depends(get_current_admin)
):
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

# Email Management Endpoints
@router.get("/unread")
async def get_unread_emails(db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Get unread emails from all configured email accounts"""
    try:
        email_reader = EmailReaderService(db_session=db)
        unread_emails = email_reader.get_unread_emails()
        
        return {
            "emails": [
                {
                    "id": email.id,
                    "account": email.account,
                    "from": email.from_address,
                    "subject": email.subject,
                    "received_date": email.received_date.isoformat(),
                    "preview": email.preview,
                    "is_important": email.is_important,
                    "is_read": email.is_read
                }
                for email in unread_emails
            ],
            "count": len(unread_emails)
        }
    except Exception as e:
        email_logger.error(f"Error getting unread emails: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get unread emails")

@router.get("/{email_id}")
async def get_email_details(email_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Get full email content by ID"""
    try:
        email_reader = EmailReaderService(db_session=db)
        email_details = email_reader.get_email_by_id(email_id)
        
        if not email_details:
            raise HTTPException(status_code=404, detail="Email not found")
        
        return {
            "id": email_details.id,
            "account": email_details.account,
            "from": email_details.from_address,
            "subject": email_details.subject,
            "received_date": email_details.received_date.isoformat(),
            "body": email_details.body,
            "preview": email_details.preview,
            "is_important": email_details.is_important,
            "is_read": email_details.is_read
        }
    except Exception as e:
        email_logger.error(f"Error getting email details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get email details")

@router.post("/send")
async def send_admin_email(
    to_email: str,
    subject: str,
    body: str,
    from_account: str = "tech",
    html_body: str = None,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_admin)
):
    """Send email from admin interface"""
    try:
        from services.email_service import EmailService
        
        # Create EmailService with database session
        email_service = EmailService(db_session=db)
        
        success = email_service.send_email(
            from_account=from_account,
            to_emails=[to_email],
            subject=subject,
            body=body,
            html_body=html_body
        )
        
        if success:
            return {"message": "Email sent successfully", "status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
            
    except Exception as e:
        email_logger.error(f"Error sending email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@router.post("/{email_id}/mark-read")
async def mark_email_read(email_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Mark an email as read"""
    try:
        # Log the API request
        email_logger.info(f"📧 EMAIL_API_MARK_READ_REQUEST | Email: {email_id} | User: {current_user.get('email', 'unknown')}")
        
        email_reader = EmailReaderService(db_session=db)
        success = email_reader.mark_email_read(email_id)
        
        if success:
            email_logger.info(f"📧 EMAIL_API_MARK_READ_SUCCESS | Email: {email_id} | User: {current_user.get('email', 'unknown')}")
            return {"message": "Email marked as read", "status": "success"}
        else:
            email_logger.warning(f"📧 EMAIL_API_MARK_READ_NOT_FOUND | Email: {email_id} | User: {current_user.get('email', 'unknown')}")
            raise HTTPException(status_code=404, detail="Email not found or already read")
            
    except Exception as e:
        email_logger.error(f"📧 EMAIL_API_MARK_READ_ERROR | Email: {email_id} | User: {current_user.get('email', 'unknown')} | Error: {str(e)}")
        email_logger.error(f"Error marking email as read: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to mark email as read")

@router.post("/{email_id}/mark-unread")
async def mark_email_unread(email_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Mark an email as unread"""
    try:
        # Log the API request
        email_logger.info(f"📧 EMAIL_API_MARK_UNREAD_REQUEST | Email: {email_id} | User: {current_user.get('email', 'unknown')}")
        
        email_reader = EmailReaderService(db_session=db)
        success = email_reader.mark_email_unread(email_id)
        
        if success:
            email_logger.info(f"📧 EMAIL_API_MARK_UNREAD_SUCCESS | Email: {email_id} | User: {current_user.get('email', 'unknown')}")
            return {"message": "Email marked as unread", "status": "success"}
        else:
            email_logger.warning(f"📧 EMAIL_API_MARK_UNREAD_NOT_FOUND | Email: {email_id} | User: {current_user.get('email', 'unknown')}")
            raise HTTPException(status_code=404, detail="Email not found")
            
    except Exception as e:
        email_logger.error(f"📧 EMAIL_API_MARK_UNREAD_ERROR | Email: {email_id} | User: {current_user.get('email', 'unknown')} | Error: {str(e)}")
        email_logger.error(f"Error marking email as unread: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to mark email as unread")

@router.post("/{email_id}/reply")
async def reply_to_email(
    email_id: str,
    reply_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Reply to an email"""
    try:
        # Log the reply request
        email_logger.info(f"📧 EMAIL_API_REPLY_REQUEST | Original: {email_id} | User: {current_user.get('email', 'unknown')} | To: {reply_data.get('to_emails', 'unknown')}")
        
        from services.email_service import EmailService
        
        # Get original email details
        email_reader = EmailReaderService(db_session=db)
        original_email = email_reader.get_email_by_id(email_id)
        
        if not original_email:
            email_logger.warning(f"📧 EMAIL_API_REPLY_ORIGINAL_NOT_FOUND | Original: {email_id} | User: {current_user.get('email', 'unknown')}")
            raise HTTPException(status_code=404, detail="Original email not found")
        
        # Create EmailService with database session
        email_service = EmailService(db_session=db)
        
        # Format reply subject
        reply_subject = f"Re: {original_email.subject}" if not original_email.subject.startswith("Re:") else original_email.subject
        
        # Log the actual reply details
        email_logger.info(f"📧 EMAIL_API_REPLY_SENDING | Original: {email_id} | Subject: {reply_subject} | To: {original_email.from_address}")
        
        success = email_service.send_email(
            from_account=reply_data.get('from_account', original_email.account.lower()),
            to_emails=[original_email.from_address],
            subject=reply_subject,
            body=reply_data['body'],
            html_body=reply_data.get('html_body')
        )
        
        if success:
            email_logger.info(f"📧 EMAIL_API_REPLY_SUCCESS | Original: {email_id} | User: {current_user.get('email', 'unknown')}")
            return {"message": "Reply sent successfully", "status": "success"}
        else:
            email_logger.error(f"📧 EMAIL_API_REPLY_FAILED | Original: {email_id} | User: {current_user.get('email', 'unknown')}")
            raise HTTPException(status_code=500, detail="Failed to send reply")
            
    except Exception as e:
        email_logger.error(f"Error sending reply: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send reply: {str(e)}")

@router.post("/{email_id}/forward")
async def forward_email(
    email_id: str,
    forward_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Forward an email"""
    try:
        # Log the forward request
        email_logger.info(f"📧 EMAIL_API_FORWARD_REQUEST | Original: {email_id} | User: {current_user.get('email', 'unknown')} | To: {forward_data.get('to_emails', [])}")
        
        from services.email_service import EmailService
        
        # Get original email details
        email_reader = EmailReaderService(db_session=db)
        original_email = email_reader.get_email_by_id(email_id)
        
        if not original_email:
            email_logger.warning(f"📧 EMAIL_API_FORWARD_ORIGINAL_NOT_FOUND | Original: {email_id} | User: {current_user.get('email', 'unknown')}")
            raise HTTPException(status_code=404, detail="Original email not found")
        
        # Create EmailService with database session
        email_service = EmailService(db_session=db)
        
        # Format forward subject and body
        forward_subject = f"Fwd: {original_email.subject}" if not original_email.subject.startswith("Fwd:") else original_email.subject
        forward_body = f"{forward_data['body']}\n\n--- Forwarded Message ---\nFrom: {original_email.from_address}\nSubject: {original_email.subject}\nDate: {original_email.received_date}\n\n{original_email.body}"
        
        # Log the actual forward details
        email_logger.info(f"📧 EMAIL_API_FORWARD_SENDING | Original: {email_id} | Subject: {forward_subject} | To: {', '.join(forward_data['to_emails'])}")
        
        success = email_service.send_email(
            from_account=forward_data.get('from_account', 'tech'),
            to_emails=forward_data['to_emails'],
            subject=forward_subject,
            body=forward_body,
            html_body=forward_data.get('html_body')
        )
        
        if success:
            email_logger.info(f"📧 EMAIL_API_FORWARD_SUCCESS | Original: {email_id} | User: {current_user.get('email', 'unknown')}")
            return {"message": "Email forwarded successfully", "status": "success"}
        else:
            email_logger.error(f"📧 EMAIL_API_FORWARD_FAILED | Original: {email_id} | User: {current_user.get('email', 'unknown')}")
            raise HTTPException(status_code=500, detail="Failed to forward email")
            
    except Exception as e:
        email_logger.error(f"Error forwarding email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to forward email: {str(e)}")

@router.get("/accounts")
async def get_email_accounts(db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Get list of configured email accounts"""
    try:
        email_reader = EmailReaderService(db_session=db)
        accounts = email_reader.get_accounts()
        
        return {
            "accounts": [
                {
                    "name": account.account_name,
                    "email": account.email,
                    "status": "active"
                }
                for account in accounts
            ]
        }
    except Exception as e:
        email_logger.error(f"Error getting email accounts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get email accounts")

@router.post("/accounts/add")
async def add_email_account(
    account_data: dict,
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_admin)
):
    """Add a new email account to the database"""
    try:
        from models.email_account import EmailAccount
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'imap_server', 'imap_port', 'smtp_server', 'smtp_port']
        for field in required_fields:
            if field not in account_data or not account_data[field]:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Check if email already exists
        existing_account = db.query(EmailAccount).filter(EmailAccount.email == account_data['email']).first()
        if existing_account:
            raise HTTPException(status_code=400, detail="Email account already exists")
        
        # Create new email account
        new_account = EmailAccount(
            name=account_data['name'],
            email=account_data['email'],
            password=account_data['password'],  # In production, encrypt this
            imap_server=account_data['imap_server'],
            imap_port=int(account_data['imap_port']),
            smtp_server=account_data['smtp_server'],
            smtp_port=int(account_data['smtp_port']),
            is_active=True,
            created_by=current_user.get('user_id', 'system')
        )
        
        db.add(new_account)
        db.commit()
        db.refresh(new_account)
        
        email_logger.info(f"Email account added: {account_data['email']} by user {current_user.get('user_id')}")
        
        return {
            "message": "Email account added successfully",
            "account_id": new_account.id,
            "account": {
                "name": new_account.name,
                "email": new_account.email,
                "status": "active"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        email_logger.error(f"Error adding email account: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add email account")
