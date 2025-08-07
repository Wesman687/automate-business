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

class EmailService:
    def __init__(self):
        # ALWAYS use production email server - emails MUST be sent to server, never locally
        self.smtp_server = os.getenv('SMTP_SERVER', 'mail.stream-lineai.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.use_tls = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
        
        # Email accounts
        self.no_reply_email = os.getenv('NO_REPLY_EMAIL')
        self.no_reply_password = os.getenv('NO_REPLY_PASSWORD')
        
        self.sales_email = os.getenv('SALES_EMAIL')
        self.sales_password = os.getenv('SALES_PASSWORD')
        
        self.tech_email = os.getenv('TECH_EMAIL')
        self.tech_password = os.getenv('TECH_PASSWORD')

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
        
        logger.info(f"📧 Sending email from {from_account} to {to_emails}")
        logger.info(f"   Subject: {subject}")
        
        try:
            # Get account credentials
            if from_account == 'no-reply':
                from_email = self.no_reply_email
                password = self.no_reply_password
            elif from_account == 'sales':
                from_email = self.sales_email
                password = self.sales_password
            elif from_account == 'tech':
                from_email = self.tech_email
                password = self.tech_password
            else:
                raise ValueError(f"Invalid from_account: {from_account}")

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
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls(context=context)
                server.login(from_email, password)
                
                # Combine all recipients
                all_recipients = to_emails.copy()
                if cc_emails:
                    all_recipients.extend(cc_emails)
                if bcc_emails:
                    all_recipients.extend(bcc_emails)
                
                server.send_message(message, to_addrs=all_recipients)
                
            logger.info(f"Email sent successfully from {from_email} to {to_emails}")
            return True
            
        except Exception as e:
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

# Global email service instance
email_service = EmailService()
