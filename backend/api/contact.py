from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.email_service import email_service
import os
from datetime import datetime

router = APIRouter(prefix="/api", tags=["contact"])

class ContactFormRequest(BaseModel):
    name: str
    email: str
    message: str

@router.post("/contact")
async def submit_contact_form(request: ContactFormRequest):
    """Submit contact form and send email notification to sales team"""
    try:
        # Check if we're in production environment
        is_production = os.getenv('ENVIRONMENT', 'development').lower() in ['production', 'prod']
        
        if not is_production:
            print("=" * 60)
            print("📧 [DEVELOPMENT MODE] Contact Form Email")
            print("=" * 60)
            print(f"Name: {request.name}")
            print(f"Email: {request.email}")
            print(f"Message: {request.message}")
            print("=" * 60)
            print("✅ In production, this would send an email to sales@stream-lineai.com")
            print("=" * 60)
            return {
                "status": "success",
                "message": "Contact form submitted successfully (development mode)"
            }
        
        # Create professional email content for sales team
        subject = f"🌟 New Contact Form Submission from {request.name}"
        
        # Plain text version
        body = f"""
New Contact Form Submission from StreamlineAI Website!

Contact Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name: {request.name}
✉️ Email: {request.email}
📅 Submitted: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC

💬 Message:
{request.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Next Steps:
- Reply to {request.email} within 24 hours
- Review their automation needs
- Schedule a consultation call if appropriate

This inquiry came through the StreamlineAI contact form and is ready for follow-up!

Best regards,
StreamlineAI Automation System
        """
        
        # HTML version for better formatting
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #00d4ff; border-bottom: 2px solid #00d4ff; padding-bottom: 10px;">
                        🌟 New Contact Form Submission
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; width: 100px;">👤 Name:</td>
                                <td style="padding: 8px 0;">{request.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">✉️ Email:</td>
                                <td style="padding: 8px 0;"><a href="mailto:{request.email}" style="color: #00d4ff;">{request.email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">📅 Submitted:</td>
                                <td style="padding: 8px 0;">{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="color: #333; margin-top: 0;">💬 Message</h4>
                        <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #00d4ff;">
                            {request.message}
                        </p>
                    </div>
                    
                    <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="color: #333; margin-top: 0;">📋 Next Steps</h4>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>Reply to <a href="mailto:{request.email}" style="color: #00d4ff;">{request.email}</a> within 24 hours</li>
                            <li>Review their automation needs</li>
                            <li>Schedule a consultation call if appropriate</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 14px;">
                            This inquiry came through the StreamlineAI contact form and is ready for follow-up!
                        </p>
                        <p style="color: #999; font-size: 12px;">
                            Automated by StreamlineAI • stream-lineai.com
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Send to sales team
        success = email_service.send_sales_email(
            to_emails=['sales@stream-lineai.com'],
            subject=subject,
            body=body,
            html_body=html_body
        )
        
        if success:
            print(f"✅ Contact form email sent for: {request.email}")
            return {
                "status": "success",
                "message": "Contact form submitted successfully and sales team notified"
            }
        else:
            print(f"❌ Failed to send contact form email for: {request.email}")
            raise HTTPException(status_code=500, detail="Failed to send email notification")
            
    except Exception as e:
        print(f"❌ Error processing contact form: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing contact form: {str(e)}")
