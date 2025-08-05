#!/usr/bin/env python3
"""
Test Email Functionality
Tests the sales notification email system
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.email_service import email_service
from datetime import datetime

def test_sales_notification():
    """Test the sales notification email"""
    
    # Create mock customer data
    class MockCustomer:
        def __init__(self):
            self.name = "John Test"
            self.email = "john.test@example.com"
            self.business_type = "Test Automation Inc"
            self.phone = "+1-555-0123"
            self.notes = "Interested in chatbot automation and process streamlining. Mentioned they have 50+ employees."
            self.created_at = datetime.now()
            self.status = "lead"
    
    customer = MockCustomer()
    session_id = "test-session-12345"
    
    # Create email content
    chat_log_url = f"https://admin.stream-lineai.com/chat-logs/{session_id}"
    
    subject = f"🚀 New Lead: {customer.name} from {customer.business_type}"
    
    body = f"""
New Customer Lead from StreamlineAI Chatbot!

Customer Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name: {customer.name}
✉️ Email: {customer.email}
🏢 Company: {customer.business_type}
📞 Phone: {customer.phone}

💬 Chat Session: {session_id}
🔗 View Chat Log: {chat_log_url}

📝 Customer Notes:
{customer.notes}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Lead captured: {customer.created_at}
🔥 Status: {customer.status}

This lead came through the StreamlineAI chatbot and is ready for follow-up!

Best regards,
StreamlineAI Automation System
    """
    
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #00d4ff; border-bottom: 2px solid #00d4ff; padding-bottom: 10px;">
                    🚀 New Lead from StreamlineAI Chatbot!
                </h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; width: 100px;">👤 Name:</td>
                            <td style="padding: 8px 0;">{customer.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">✉️ Email:</td>
                            <td style="padding: 8px 0;"><a href="mailto:{customer.email}" style="color: #00d4ff;">{customer.email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">🏢 Company:</td>
                            <td style="padding: 8px 0;">{customer.business_type}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">📞 Phone:</td>
                            <td style="padding: 8px 0;">{customer.phone}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="background: #e8f5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #333; margin-top: 0;">💬 Chat Information</h4>
                    <p><strong>Session ID:</strong> {session_id}</p>
                    <p><a href="{chat_log_url}" style="background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">🔗 View Full Chat Log</a></p>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #333; margin-top: 0;">📝 Additional Notes</h4>
                    <p>{customer.notes}</p>
                </div>
                
                <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #333; margin-top: 0;">📊 Lead Details</h4>
                    <p><strong>⏰ Captured:</strong> {customer.created_at}</p>
                    <p><strong>🔥 Status:</strong> {customer.status.title()}</p>
                    <p><strong>💡 Source:</strong> StreamlineAI Chatbot</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 14px;">
                        This lead is ready for follow-up! Reach out within 24 hours for best results.
                    </p>
                    <p style="color: #999; font-size: 12px;">
                        Automated by StreamlineAI • stream-lineai.com
                    </p>
                </div>
            </div>
        </body>
    </html>
    """
    
    print("🧪 Testing sales notification email...")
    print(f"📧 Subject: {subject}")
    print(f"📬 To: sales@stream-lineai.com")
    print(f"🔗 Chat Log URL: {chat_log_url}")
    
    # Test sending (you can uncomment this to actually send)
    # success = email_service.send_sales_email(
    #     to_emails=['sales@stream-lineai.com'],
    #     subject=subject,
    #     body=body,
    #     html_body=html_body
    # )
    
    # For now, just show the email content would be sent
    print("\n✅ Email content prepared successfully!")
    print("\n📄 Email Preview:")
    print("=" * 60)
    print(body)
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    test_sales_notification()
