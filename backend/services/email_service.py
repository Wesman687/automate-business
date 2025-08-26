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

class EmailService:
    def __init__(self, db_session=None):
        # ALWAYS use production email server - emails MUST be sent to server, never locally
        self.smtp_server = os.getenv('SMTP_SERVER', 'mail.stream-lineai.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.use_tls = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
        self.db_session = db_session
        
        # Email accounts (fallback to env vars if database not available)
        self.no_reply_email = os.getenv('NO_REPLY_EMAIL')
        self.no_reply_password = os.getenv('NO_REPLY_PASSWORD')
        
        self.sales_email = os.getenv('SALES_EMAIL')
        self.sales_password = os.getenv('SALES_PASSWORD')
        
        self.tech_email = os.getenv('TECH_EMAIL')
        self.tech_password = os.getenv('TECH_PASSWORD')

    def _get_account_credentials(self, from_account: str):
        """Get email credentials from database first, then fallback to environment"""
        if self.db_session:
            try:
                from database.models.email_account import EmailAccount
                
                # Try to find account in database by name or email
                db_account = self.db_session.query(EmailAccount).filter(
                    (EmailAccount.name.ilike(f"%{from_account}%")) |
                    (EmailAccount.email.contains(from_account))
                ).filter(EmailAccount.is_active == True).first()
                
                if db_account:
                    return db_account.email, db_account.password, db_account.smtp_server, db_account.smtp_port
            except Exception as e:
                logger.warning(f"Could not load account from database: {str(e)}")
        
        # Fallback to environment variables
        if from_account == 'tech':
            return self.tech_email, self.tech_password, 'smtp.gmail.com', 587
        elif from_account == 'sales':
            return self.sales_email, self.sales_password, 'smtp.gmail.com', 587
        elif from_account == 'no-reply':
            return self.no_reply_email, self.no_reply_password, 'smtp.gmail.com', 587
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
                raise ValueError(f"Email credentials not found for account: {from_account}")
            
            logger.info(f"📧 Sending email from {from_email} to {to_emails}")
            logger.info(f"   Using SMTP: {smtp_server}:{smtp_port}")

            # Create message
            message = MIMEMultipart('alternative')
            message['From'] = from_email
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
            # Failure logging
            email_logger.error(f"📧 EMAIL_SEND_FAILED | From: {from_account} | To: {', '.join(to_emails)} | Subject: {subject} | Error: {str(e)}")
            logger.error(f"Failed to send email from {from_account}: {str(e)}")
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

    async def send_verification_email(self, to_email: str, customer_name: str, verification_code: str):
        """Send email verification code to customer"""
        subject = "Verify Your StreamlineAI Account"
        
        # Plain text version
        body = f"""
Hello {customer_name},

Thank you for creating your StreamlineAI account! To complete your registration, please use the following verification code:

{verification_code}

This code will expire in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
The StreamlineAI Team
        """
        
        # HTML version
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your StreamlineAI Account</title>
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
            <h1>⚡ StreamlineAI</h1>
            <p>Account Verification</p>
        </div>
        <div class="content">
            <h2>Hello {customer_name},</h2>
            <p>Thank you for creating your StreamlineAI account! To complete your registration, please use the following verification code:</p>
            
            <div class="verification-code">
                {verification_code}
            </div>
            
            <p><strong>This code will expire in 24 hours.</strong></p>
            
            <p>If you didn't create this account, please ignore this email.</p>
            
            <p>Best regards,<br>The StreamlineAI Team</p>
        </div>
        <div class="footer">
            <p>© 2025 StreamlineAI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """
        
        return self.send_email(
            from_account='no-reply',
            to_emails=[to_email],
            subject=subject,
            body=body,
            html_body=html_body
        )

# Global email service instance
email_service = EmailService()
