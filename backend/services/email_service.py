import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
from typing import List, Optional
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
email_logger = logging.getLogger('email')  # Dedicated email logger

# PRODUCTION EMAIL SERVER - ALWAYS USE REGARDLESS OF ENVIRONMENT
# Can be overridden via SMTP_SERVER environment variable
# Default to Gmail SMTP (most common for custom domain emails)
PRODUCTION_SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
PRODUCTION_SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))

class EmailService:
    def __init__(self, db_session=None):
        # ALWAYS use production email server - emails MUST be sent to server, never locally
        # Force production email server regardless of environment
        self.smtp_server = PRODUCTION_SMTP_SERVER  # Always production
        self.smtp_port = PRODUCTION_SMTP_PORT
        self.use_tls = True  # Always use TLS for production
        self.db_session = db_session
        
        # Email accounts (fallback to env vars if database not available)
        # Support PAUL_EMAIL/PAUL_PASSWORD as primary email account
        paul_email = os.getenv('PAUL_EMAIL')
        paul_password = os.getenv('PAUL_PASSWORD')
        
        # Use PAUL_EMAIL if available, otherwise fall back to NO_REPLY_EMAIL
        self.no_reply_email = paul_email or os.getenv('NO_REPLY_EMAIL')
        self.no_reply_password = paul_password or os.getenv('NO_REPLY_PASSWORD')
        
        self.sales_email = os.getenv('SALES_EMAIL')
        self.sales_password = os.getenv('SALES_PASSWORD')
        
        self.tech_email = os.getenv('TECH_EMAIL')
        self.tech_password = os.getenv('TECH_PASSWORD')

    def _get_account_credentials(self, from_account: str):
        """Get email credentials from database first, then fallback to environment"""
        if self.db_session:
            try:
                from models.email_account import EmailAccount
                
                # Try to find account in database by name or email
                db_account = self.db_session.query(EmailAccount).filter(
                    (EmailAccount.name.ilike(f"%{from_account}%")) |
                    (EmailAccount.email.contains(from_account))
                ).filter(EmailAccount.is_active == True).first()
                
                if db_account:
                    # Always use production SMTP server, but use account's email and password
                    logger.info(f"📧 Found email account in DB: {db_account.email} (name: {db_account.name})")
                    return db_account.email, db_account.password, PRODUCTION_SMTP_SERVER, PRODUCTION_SMTP_PORT
            except Exception as e:
                logger.warning(f"Could not load account from database: {str(e)}", exc_info=True)
        
        # Fallback to environment variables - ALWAYS use production SMTP server
        logger.info(f"📧 Using environment variables for {from_account} account")
        if from_account == 'tech':
            if not self.tech_email or not self.tech_password:
                raise ValueError(f"Tech email credentials not configured in environment variables")
            return self.tech_email, self.tech_password, PRODUCTION_SMTP_SERVER, PRODUCTION_SMTP_PORT
        elif from_account == 'sales':
            if not self.sales_email or not self.sales_password:
                raise ValueError(f"Sales email credentials not configured in environment variables")
            return self.sales_email, self.sales_password, PRODUCTION_SMTP_SERVER, PRODUCTION_SMTP_PORT
        elif from_account == 'no-reply':
            if not self.no_reply_email or not self.no_reply_password:
                raise ValueError(f"No-reply email credentials not configured in environment variables. Please set NO_REPLY_EMAIL and NO_REPLY_PASSWORD, or add an email account to the database.")
            return self.no_reply_email, self.no_reply_password, PRODUCTION_SMTP_SERVER, PRODUCTION_SMTP_PORT
        else:
            raise ValueError(f"Unknown email account: {from_account}")

    def send_email(
        self,
        from_account: str,
        to_emails: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        attachments: Optional[List[str]] = None,
        cc_emails: Optional[List[str]] = None,
        bcc_emails: Optional[List[str]] = None
    ) -> bool:
        """
        Send email from specified account - ALWAYS sends to production server
        
        Args:
            from_account: 'no-reply', 'sales', or 'tech'
            to_emails: List of recipient emails
            subject: Email subject
            body: Plain text body
            html_body: HTML body (optional)
            attachments: List of file paths to attach (optional)
            cc_emails: List of CC emails (optional)
            bcc_emails: List of BCC emails (optional)
        """
        
        # Enhanced email logging
        email_logger.info(f"📧 EMAIL_SEND_START | From: {from_account} | To: {', '.join(to_emails)} | Subject: {subject}")
        if cc_emails:
            email_logger.info(f"📧 EMAIL_SEND_CC | CC: {', '.join(cc_emails)}")
        if bcc_emails:
            email_logger.info(f"📧 EMAIL_SEND_BCC | BCC: {', '.join(bcc_emails)}")
        if attachments:
            email_logger.info(f"📧 EMAIL_SEND_ATTACHMENTS | Files: {', '.join(attachments)}")
        
        logger.info(f"📧 Sending email from {from_account} to {to_emails}")
        logger.info(f"   Subject: {subject}")
        
        try:
            # Get account credentials from database or environment
            from_email, password, smtp_server, smtp_port = self._get_account_credentials(from_account)
            
            if not from_email or not password:
                error_msg = f"Email credentials not found for account: {from_account}. Email: {from_email}, Password: {'***' if password else 'MISSING'}"
                logger.error(f"❌ {error_msg}")
                raise ValueError(error_msg)
            
            logger.info(f"📧 Sending email from {from_email} to {to_emails}")
            logger.info(f"   Using SMTP: {smtp_server}:{smtp_port}")
            email_logger.info(f"📧 EMAIL_CREDENTIALS | From: {from_email} | SMTP: {smtp_server}:{smtp_port}")

            # Create message
            message = MIMEMultipart('alternative')
            # For no-reply account, use no-reply@stream-lineai.com as sender even if authenticating with different email
            if from_account == 'no-reply':
                sender_email = 'no-reply@stream-lineai.com'
            else:
                sender_email = from_email
            message['From'] = sender_email
            message['To'] = ', '.join(to_emails)
            message['Subject'] = subject
            
            if cc_emails:
                message['Cc'] = ', '.join(cc_emails)

            # Add body
            text_part = MIMEText(body, 'plain')
            message.attach(text_part)
            
            if html_body:
                html_part = MIMEText(html_body, 'html')
                message.attach(html_part)

            # Add attachments
            if attachments:
                for file_path in attachments:
                    if os.path.exists(file_path):
                        with open(file_path, 'rb') as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(attachment.read())
                            encoders.encode_base64(part)
                            part.add_header(
                                'Content-Disposition',
                                f'attachment; filename= {os.path.basename(file_path)}'
                            )
                            message.attach(part)

            # Send email
            context = ssl.create_default_context()
            
            # Use account-specific SMTP server settings
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls(context=context)
                server.login(from_email, password)
                
                # Combine all recipients
                all_recipients = to_emails.copy()
                if cc_emails:
                    all_recipients.extend(cc_emails)
                if bcc_emails:
                    all_recipients.extend(bcc_emails)
                
                server.send_message(message, to_addrs=all_recipients)
                
            # Success logging
            email_logger.info(f"📧 EMAIL_SEND_SUCCESS | From: {from_account} | To: {', '.join(to_emails)} | Subject: {subject}")
            logger.info(f"Email sent successfully from {from_email} to {to_emails}")
            return True
            
        except Exception as e:
            # Failure logging with full details
            error_details = f"From: {from_account} | To: {', '.join(to_emails)} | Subject: {subject} | Error: {str(e)}"
            email_logger.error(f"📧 EMAIL_SEND_FAILED | {error_details}")
            logger.error(f"❌ Failed to send email from {from_account}: {str(e)}", exc_info=True)
            return False

    def send_notification(self, subject: str, body: str, to_emails: List[str] = None):
        """Send notification email from no-reply account"""
        if not to_emails:
            to_emails = [self.tech_email]  # Default to tech email
        
        return self.send_email(
            from_account='no-reply',
            to_emails=to_emails,
            subject=f"StreamlineAI: {subject}",
            body=body
        )

    def send_sales_email(self, to_emails: List[str], subject: str, body: str, html_body: str = None):
        """Send email from sales account"""
        return self.send_email(
            from_account='sales',
            to_emails=to_emails,
            subject=subject,
            body=body,
            html_body=html_body
        )

    def send_tech_email(self, to_emails: List[str], subject: str, body: str, attachments: List[str] = None):
        """Send email from tech account"""
        return self.send_email(
            from_account='tech',
            to_emails=to_emails,
            subject=subject,
            body=body,
            attachments=attachments
        )

    async def send_verification_email(self, to_email: str, customer_name: str, verification_code: str, app_name: str = None, verification_url: str = None):
        """Send email verification code to customer
        
        Args:
            to_email: Recipient email address
            customer_name: Customer's name
            verification_code: 6-digit verification code
            app_name: Name of the app (defaults to "StreamlineAI")
            verification_url: URL to verification page (if None, will use code-only method)
        """
        import asyncio
        
        # Get app name from environment or use default
        app_name = app_name or os.getenv('APP_NAME', 'StreamlineAI')
        
        # Build verification URL if provided, otherwise use code entry
        if verification_url:
            # If URL provided, append email and code as query params
            from urllib.parse import urlencode
            params = urlencode({'email': to_email, 'code': verification_code})
            verify_link = f"{verification_url}?{params}"
        else:
            verify_link = None
        
        subject = f"Verify Your {app_name} Account"
        
        # Plain text version
        if verify_link:
            body = f"""
Hello {customer_name},

Thank you for creating your {app_name} account! To complete your registration, please click the link below:

{verify_link}

Or use this verification code: {verification_code}

This code will expire in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
The {app_name} Team
        """
        else:
            body = f"""
Hello {customer_name},

Thank you for creating your {app_name} account! To complete your registration, please use the following verification code:

{verification_code}

This code will expire in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
The {app_name} Team
        """
        
        # HTML version
        if verify_link:
            html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your {app_name} Account</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .verification-code {{ background: #667eea; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px; margin: 20px 0; letter-spacing: 3px; }}
        .verify-button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
        .verify-button:hover {{ background: #5568d3; }}
        .code-section {{ background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #667eea; text-align: center; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ {app_name}</h1>
            <p>Account Verification</p>
        </div>
        <div class="content">
            <h2>Hello {customer_name},</h2>
            <p>Thank you for creating your {app_name} account! To complete your registration, please click the button below:</p>
            
            <div style="text-align: center;">
                <a href="{verify_link}" class="verify-button">Verify Email Address</a>
            </div>
            
            <div class="code-section">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Or enter this code manually:</p>
                <div class="verification-code">
                    {verification_code}
                </div>
            </div>
            
            <p><strong>This code will expire in 24 hours.</strong></p>
            
            <p>If you didn't create this account, please ignore this email.</p>
            
            <p>Best regards,<br>The {app_name} Team</p>
        </div>
        <div class="footer">
            <p>© 2025 {app_name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """
        else:
            html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your {app_name} Account</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .verification-code {{ background: #667eea; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px; margin: 20px 0; letter-spacing: 3px; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ {app_name}</h1>
            <p>Account Verification</p>
        </div>
        <div class="content">
            <h2>Hello {customer_name},</h2>
            <p>Thank you for creating your {app_name} account! To complete your registration, please use the following verification code:</p>
            
            <div class="verification-code">
                {verification_code}
            </div>
            
            <p><strong>This code will expire in 24 hours.</strong></p>
            
            <p>If you didn't create this account, please ignore this email.</p>
            
            <p>Best regards,<br>The {app_name} Team</p>
        </div>
        <div class="footer">
            <p>© 2025 {app_name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """
        
        # Run the sync send_email in a thread pool to not block
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self.send_email(
                from_account='no-reply',
                to_emails=[to_email],
                subject=subject,
                body=body,
                html_body=html_body
            )
        )
        return result

# Global email service instance
email_service = EmailService()
