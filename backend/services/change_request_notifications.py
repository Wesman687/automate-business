from services.email_service import email_service
from database.models import CustomerChangeRequest, Job, Customer
import os
import logging

logger = logging.getLogger(__name__)

async def send_change_request_notification(change_request: CustomerChangeRequest, job: Job, customer: Customer):
    """Send email notification to tech team about new change request"""
    try:
        # Check if we're in production environment
        is_production = os.getenv('ENVIRONMENT', 'development').lower() in ['production', 'prod']
        
        if not is_production:
            print("=" * 60)
            print("📧 [DEVELOPMENT MODE] Change Request Notification")
            print("=" * 60)
            print(f"Customer: {customer.name or 'Unknown'}")
            print(f"Email: {customer.email}")
            print(f"Job: {job.title}")
            print(f"Change Request: {change_request.title}")
            print(f"Priority: {change_request.priority}")
            print(f"Description: {change_request.description}")
            print(f"Requested via: {change_request.requested_via}")
            print("=" * 60)
            print("✅ In production, this would send an email to tech@stream-lineai.com")
            print("=" * 60)
            return True  # Return success for development
        
        # Create professional email content
        priority_emoji = {
            'low': '🟢',
            'medium': '🟡', 
            'high': '🟠',
            'urgent': '🔴'
        }
        
        subject = f"{priority_emoji.get(change_request.priority, '🟡')} Change Request: {change_request.title} - {customer.name}"
        
        # Plain text version
        body = f"""
New Customer Change Request - StreamlineAI

Customer Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Customer: {customer.name or 'Unknown'}
✉️ Email: {customer.email}
🏢 Company: {customer.business_type or 'Not provided'}
📞 Phone: {customer.phone or 'Not provided'}

🛠️ Job Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Job Title: {job.title}
📊 Job Status: {job.status.title()}
🎯 Job Priority: {job.priority.title()}

🔄 Change Request Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Title: {change_request.title}
🔥 Priority: {change_request.priority.title()}
📱 Requested via: {change_request.requested_via.title()}
📅 Request Date: {change_request.created_at.strftime('%Y-%m-%d %H:%M:%S')}

📝 Description:
{change_request.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please review this change request and provide estimates for implementation.

Access the admin panel to manage this request:
🔗 Admin Panel: https://server.stream-lineai.com/admin/jobs/{job.id}

Best regards,
StreamlineAI Automation System
        """
        
        # HTML version for better formatting
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #00d4ff; border-bottom: 2px solid #00d4ff; padding-bottom: 10px;">
                        {priority_emoji.get(change_request.priority, '🟡')} New Customer Change Request
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">👤 Customer Information</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
                                <td style="padding: 8px 0;">{customer.name or 'Unknown'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                                <td style="padding: 8px 0;"><a href="mailto:{customer.email}" style="color: #00d4ff;">{customer.email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Company:</td>
                                <td style="padding: 8px 0;">{customer.business_type or 'Not provided'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                                <td style="padding: 8px 0;">{customer.phone or 'Not provided'}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #e8f5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">🛠️ Job Information</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; width: 120px;">Job Title:</td>
                                <td style="padding: 8px 0;">{job.title}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                                <td style="padding: 8px 0;"><span style="background: #d4edda; padding: 2px 6px; border-radius: 3px;">{job.status.title()}</span></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Priority:</td>
                                <td style="padding: 8px 0;"><span style="background: #fff3cd; padding: 2px 6px; border-radius: 3px;">{job.priority.title()}</span></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <h3 style="color: #333; margin-top: 0;">🔄 Change Request Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; width: 120px;">Title:</td>
                                <td style="padding: 8px 0; font-size: 16px; font-weight: bold;">{change_request.title}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Priority:</td>
                                <td style="padding: 8px 0;">
                                    <span style="background: {'#dc3545' if change_request.priority == 'urgent' else '#fd7e14' if change_request.priority == 'high' else '#ffc107' if change_request.priority == 'medium' else '#28a745'}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                                        {priority_emoji.get(change_request.priority, '🟡')} {change_request.priority.title()}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Requested via:</td>
                                <td style="padding: 8px 0;">{change_request.requested_via.title()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                                <td style="padding: 8px 0;">{change_request.created_at.strftime('%A, %B %d, %Y at %I:%M %p')}</td>
                            </tr>
                        </table>
                        
                        <div style="margin-top: 15px;">
                            <h4 style="color: #333; margin-bottom: 10px;">📝 Description:</h4>
                            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                                {change_request.description.replace(chr(10), '<br>')}
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">⚡ Next Steps</h3>
                        <ol style="margin: 0; padding-left: 20px;">
                            <li>Review the change request details</li>
                            <li>Estimate time and cost requirements</li>
                            <li>Contact customer if clarification needed</li>
                            <li>Update status in admin panel</li>
                        </ol>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="https://server.stream-lineai.com/admin/jobs/{job.id}" 
                               style="background: #00d4ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                🔗 Manage in Admin Panel
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 14px;">
                            This change request needs your attention. Please review and respond promptly.
                        </p>
                        <p style="color: #999; font-size: 12px;">
                            Automated by StreamlineAI • stream-lineai.com
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Send to tech team
        success = email_service.send_email(
            to_emails=['tech@stream-lineai.com'],
            subject=subject,
            body=body,
            html_body=html_body
        )
        
        if success:
            logger.info(f"✅ Change request notification sent for: {change_request.title}")
        else:
            logger.error(f"❌ Failed to send change request notification for: {change_request.title}")
            
        return success
        
    except Exception as e:
        logger.error(f"❌ Error sending change request notification: {str(e)}")
        return False
