import imaplib
import email
import json
import os
from datetime import datetime, timedelta
from email.header import decode_header
from typing import List, Dict, Optional
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class EmailAccount:
    email: str
    password: str
    imap_server: str
    imap_port: int = 993
    account_name: str = "Default"

@dataclass
class UnreadEmail:
    id: str
    account: str
    from_address: str
    subject: str
    received_date: datetime
    preview: str
    is_important: bool = False
    body: str = ""

class EmailReaderService:
    def __init__(self):
        # Only initialize on server - check if we're in production environment
        self.is_server = self._is_production_server()
        if self.is_server:
            self.accounts = self._load_email_accounts()
        else:
            self.accounts = []
            logger.info("Email reader service running in local mode - will use server endpoints")
    
    def _is_production_server(self) -> bool:
        """Check if we're running on the production server"""
        # Check for server-specific environment variables or hostnames
        server_indicators = [
            os.getenv('ENVIRONMENT') == 'production',
            os.getenv('SERVER_MODE') == 'true',
            'stream-lineai.com' in os.getenv('BACKEND_URL', ''),
            os.path.exists('/etc/hostname')  # Linux server indicator
        ]
        return any(server_indicators)
    
    def _load_email_accounts(self) -> List[EmailAccount]:
        """Load email account configurations from environment variables"""
        accounts = []
        
        # Tech account
        tech_email = os.getenv('TECH_EMAIL')
        tech_password = os.getenv('TECH_PASSWORD')  # Use same as EmailService
        tech_server = os.getenv('TECH_IMAP_SERVER', 'imap.gmail.com')
        
        if tech_email and tech_password:
            accounts.append(EmailAccount(
                email=tech_email,
                password=tech_password,
                imap_server=tech_server,
                account_name="Tech"
            ))
        
        # Sales account
        sales_email = os.getenv('SALES_EMAIL')
        sales_password = os.getenv('SALES_PASSWORD')  # Use same as EmailService
        sales_server = os.getenv('SALES_IMAP_SERVER', 'imap.gmail.com')
        
        if sales_email and sales_password:
            accounts.append(EmailAccount(
                email=sales_email,
                password=sales_password,
                imap_server=sales_server,
                account_name="Sales"
            ))
        
        return accounts
    
    def _decode_header_value(self, value: str) -> str:
        """Decode email header value"""
        if not value:
            return ""
        
        decoded_parts = decode_header(value)
        decoded_string = ""
        
        for part, encoding in decoded_parts:
            if isinstance(part, bytes):
                if encoding:
                    try:
                        decoded_string += part.decode(encoding)
                    except (UnicodeDecodeError, LookupError):
                        decoded_string += part.decode('utf-8', errors='ignore')
                else:
                    decoded_string += part.decode('utf-8', errors='ignore')
            else:
                decoded_string += str(part)
        
        return decoded_string
    
    def _get_email_preview(self, msg) -> str:
        """Extract email preview text"""
        preview = ""
        
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                if content_type == "text/plain":
                    try:
                        body = part.get_payload(decode=True)
                        if body:
                            preview = body.decode('utf-8', errors='ignore')
                            break
                    except:
                        continue
        else:
            try:
                body = msg.get_payload(decode=True)
                if body:
                    preview = body.decode('utf-8', errors='ignore')
            except:
                preview = ""
        
        # Clean and truncate preview
        preview = preview.replace('\n', ' ').replace('\r', ' ').strip()
        return preview[:200] + "..." if len(preview) > 200 else preview
    
    def _is_important_email(self, msg, from_address: str, subject: str) -> bool:
        """Determine if email is important based on keywords and sender"""
        important_keywords = [
            'urgent', 'asap', 'important', 'critical', 'emergency',
            'invoice', 'payment', 'due', 'overdue', 'contract',
            'proposal', 'quote', 'meeting', 'call', 'deadline'
        ]
        
        # Check if from known important domains
        important_domains = ['client.com', 'customer.com']  # Add your important domains
        
        subject_lower = subject.lower()
        from_lower = from_address.lower()
        
        # Check for important keywords
        for keyword in important_keywords:
            if keyword in subject_lower:
                return True
        
        # Check for important domains
        for domain in important_domains:
            if domain in from_lower:
                return True
        
        # Check for high priority header
        priority = msg.get('X-Priority', '').strip()
        if priority and priority in ['1', 'High']:
            return True
        
        return False
    
    def get_unread_emails(self, days_back: int = 7, limit: int = 50) -> List[UnreadEmail]:
        """Get unread emails from all configured accounts"""
        if not self.is_server:
            logger.warning("Email reading attempted on local environment - returning empty list")
            return []
        
        all_emails = []
        
        for account in self.accounts:
            try:
                emails = self._get_unread_emails_from_account(account, days_back, limit)
                all_emails.extend(emails)
            except Exception as e:
                logger.error(f"Error fetching emails from {account.email}: {str(e)}")
                continue
        
        # Sort by received date (newest first)
        all_emails.sort(key=lambda x: x.received_date, reverse=True)
        
        return all_emails[:limit]
    
    def _get_unread_emails_from_account(self, account: EmailAccount, days_back: int, limit: int) -> List[UnreadEmail]:
        """Get unread emails from a specific account"""
        emails = []
        mail = None
        
        try:
            # Connect to IMAP server
            mail = imaplib.IMAP4_SSL(account.imap_server, account.imap_port)
            mail.login(account.email, account.password)
            mail.select('INBOX')
            
            # Search for unread emails from the last N days
            since_date = (datetime.now() - timedelta(days=days_back)).strftime("%d-%b-%Y")
            search_criteria = f'(UNSEEN SINCE {since_date})'
            
            status, messages = mail.search(None, search_criteria)
            
            if status != 'OK':
                logger.warning(f"No unread messages found in {account.email}")
                return emails
            
            # Get message IDs
            message_ids = messages[0].split()
            
            # Limit the number of emails to process
            message_ids = message_ids[-limit:] if len(message_ids) > limit else message_ids
            
            for msg_id in reversed(message_ids):  # Process newest first
                try:
                    # Fetch the email
                    status, msg_data = mail.fetch(msg_id, '(RFC822)')
                    
                    if status != 'OK':
                        continue
                    
                    # Parse the email
                    raw_email = msg_data[0][1]
                    msg = email.message_from_bytes(raw_email)
                    
                    # Extract email details
                    from_address = self._decode_header_value(msg.get('From', ''))
                    subject = self._decode_header_value(msg.get('Subject', ''))
                    date_str = msg.get('Date', '')
                    
                    # Parse date
                    try:
                        received_date = email.utils.parsedate_to_datetime(date_str)
                    except:
                        received_date = datetime.now()
                    
                    # Get email preview
                    preview = self._get_email_preview(msg)
                    
                    # Check if important
                    is_important = self._is_important_email(msg, from_address, subject)
                    
                    # Create email object
                    unread_email = UnreadEmail(
                        id=f"{account.account_name}_{msg_id.decode()}",
                        account=account.account_name,
                        from_address=from_address,
                        subject=subject,
                        received_date=received_date,
                        preview=preview,
                        is_important=is_important
                    )
                    
                    emails.append(unread_email)
                    
                except Exception as e:
                    logger.error(f"Error processing email {msg_id} from {account.email}: {str(e)}")
                    continue
        
        except Exception as e:
            logger.error(f"Error connecting to {account.email}: {str(e)}")
            raise
        
        finally:
            if mail:
                try:
                    mail.close()
                    mail.logout()
                except:
                    pass
        
        return emails
    
    def mark_email_as_read(self, email_id: str) -> bool:
        """Mark an email as read"""
        if not self.is_server:
            logger.warning("Email marking attempted on local environment - returning false")
            return False
            
        try:
            # Parse email_id to get account and message ID
            account_name, msg_id = email_id.split('_', 1)
            
            # Find the account
            account = None
            for acc in self.accounts:
                if acc.account_name == account_name:
                    account = acc
                    break
            
            if not account:
                logger.error(f"Account {account_name} not found")
                return False
            
            # Connect and mark as read
            mail = imaplib.IMAP4_SSL(account.imap_server, account.imap_port)
            mail.login(account.email, account.password)
            mail.select('INBOX')
            
            mail.store(msg_id, '+FLAGS', '\\Seen')
            
            mail.close()
            mail.logout()
            
            return True
            
        except Exception as e:
            logger.error(f"Error marking email {email_id} as read: {str(e)}")
            return False
    
    def get_email_stats(self) -> Dict[str, int]:
        """Get email statistics"""
        stats = {
            'total_unread': 0,
            'important_unread': 0,
            'accounts_configured': len(self.accounts)
        }
        
        if not self.is_server:
            logger.warning("Email stats requested on local environment - returning zero stats")
            return stats
        
        try:
            emails = self.get_unread_emails(days_back=30, limit=1000)
            stats['total_unread'] = len(emails)
            stats['important_unread'] = len([e for e in emails if e.is_important])
        except Exception as e:
            logger.error(f"Error getting email stats: {str(e)}")
        
        return stats
