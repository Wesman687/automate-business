from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from database.postgresql import get_db
from services.customer_service import CustomerService
from services.session_service import SessionService
from services.email_service import email_service
from schemas.customer import Customer, CustomerCreate, CustomerUpdate
from typing import List, Optional
from pydantic import BaseModel
import os
import uuid

class SaveCustomerRequest(BaseModel):
    email: str
    session_id: str
    name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None

# Security configurations for file uploads
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt', '.csv', '.xls', '.xlsx', '.ppt', '.pptx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword'
}

async def validate_upload_file(file: UploadFile):
    """Validate uploaded file for security"""
    # File size check
    content = await file.read()
    await file.seek(0)  # Reset file pointer
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")
    
    # Extension check
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")
        
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Content type check
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid MIME type: {file.content_type}")
    
    return content

async def send_sales_notification(customer: Customer, session_id: str):
    """Send email notification to sales team about new customer"""
    try:
        # Check if we're in production environment
        is_production = os.getenv('ENVIRONMENT', 'development').lower() in ['production', 'prod']
        
        if not is_production:
            print("=" * 60)
            print("📧 [DEVELOPMENT MODE] Sales Email Notification")
            print("=" * 60)
            print(f"Customer: {customer.name or 'Unknown'}")
            print(f"Email: {customer.email}")
            print(f"Company: {customer.business_type or 'Unknown'}")
            print(f"Phone: {customer.phone or 'Not provided'}")
            print(f"Session ID: {session_id}")
            print(f"Status: {customer.status}")
            print("=" * 60)
            print("✅ In production, this would send an email to sales@stream-lineai.com")
            print("=" * 60)
            return True  # Return success for development
        
        # Create chat log link - points to our admin interface
        chat_log_url = f"https://server.stream-lineai.com/admin/chat-logs/{session_id}"
        
        # Create professional email content
        subject = f"🚀 New Lead: {customer.name or 'Customer'} from {customer.business_type or 'Unknown Company'}"
        
        # Plain text version
        body = f"""
New Customer Lead from StreamlineAI Chatbot!

Customer Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name: {customer.name or 'Not provided'}
✉️ Email: {customer.email}
🏢 Company: {customer.business_type or 'Not provided'}
📞 Phone: {customer.phone or 'Not provided'}

💬 Chat Session: {session_id}
🔗 View Chat Log: {chat_log_url}

📝 Customer Notes:
{customer.notes or 'No additional notes'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Lead captured: {customer.created_at}
🔥 Status: {customer.status}

This lead came through the StreamlineAI chatbot and is ready for follow-up!

Best regards,
StreamlineAI Automation System
        """
        
        # HTML version for better formatting
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
                                <td style="padding: 8px 0;">{customer.name or 'Not provided'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">✉️ Email:</td>
                                <td style="padding: 8px 0;"><a href="mailto:{customer.email}" style="color: #00d4ff;">{customer.email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">🏢 Company:</td>
                                <td style="padding: 8px 0;">{customer.business_type or 'Not provided'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">📞 Phone:</td>
                                <td style="padding: 8px 0;">{customer.phone or 'Not provided'}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #e8f5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="color: #333; margin-top: 0;">💬 Chat Information</h4>
                        <p><strong>Session ID:</strong> {session_id}</p>
                        <p><a href="{chat_log_url}" style="background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">🔗 View Full Chat Log</a></p>
                    </div>
                    
                    {f'<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;"><h4 style="color: #333; margin-top: 0;">📝 Additional Notes</h4><p>{customer.notes}</p></div>' if customer.notes else ''}
                    
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
        
        # Send to sales team
        success = email_service.send_sales_email(
            to_emails=['sales@stream-lineai.com'],
            subject=subject,
            body=body,
            html_body=html_body
        )
        
        if success:
            print(f"✅ Sales notification sent for customer: {customer.email}")
        else:
            print(f"❌ Failed to send sales notification for customer: {customer.email}")
            
        return success
        
    except Exception as e:
        print(f"❌ Error sending sales notification: {str(e)}")
        return False

router = APIRouter(prefix="/api", tags=["customers"])

@router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer"""
    customer_service = CustomerService(db)
    return customer_service.create_customer(customer)

@router.get("/customers", response_model=List[Customer])
async def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all customers with pagination"""
    customer_service = CustomerService(db)
    return customer_service.get_customers(skip=skip, limit=limit)

@router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get a specific customer by ID"""
    customer_service = CustomerService(db)
    customer = customer_service.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: int, customer_data: CustomerUpdate, db: Session = Depends(get_db)):
    """Update a customer"""
    customer_service = CustomerService(db)
    customer = customer_service.update_customer(customer_id, customer_data)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/customers/{customer_id}/notes")
async def add_customer_notes(customer_id: int, notes: str, db: Session = Depends(get_db)):
    """Add notes to a customer"""
    customer_service = CustomerService(db)
    customer = customer_service.add_notes(customer_id, notes)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Notes added successfully"}

@router.get("/customers/{customer_id}/sessions")
async def get_customer_sessions(customer_id: int, db: Session = Depends(get_db)):
    """Get all chat sessions for a customer"""
    session_service = SessionService(db)
    sessions = session_service.get_customer_sessions(customer_id)
    
    return [
        {
            "session_id": session.session_id,
            "status": session.status,
            "created_at": session.created_at,
            "message_count": len(session.messages) if session.messages else 0
        }
        for session in sessions
    ]

@router.get("/customers/email/{email}")
async def get_customer_by_email(email: str, db: Session = Depends(get_db)):
    """Get a customer by email address"""
    customer_service = CustomerService(db)
    customer = customer_service.get_customer_by_email(email)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/save-customer")
async def save_customer(
    request: SaveCustomerRequest,
    db: Session = Depends(get_db)
):
    """Save customer information from chatbot"""
    customer_service = CustomerService(db)
    
    try:
        # Check if customer already exists
        existing_customer = customer_service.get_customer_by_email(request.email)
        
        if existing_customer:
            # Update existing customer with new info
            update_data = CustomerUpdate()
            if request.name and not existing_customer.name:
                update_data.name = request.name
            if request.company and not existing_customer.business_type:
                update_data.business_type = request.company
            if request.phone and not existing_customer.phone:
                update_data.phone = request.phone
                
            customer = customer_service.update_customer(existing_customer.id, update_data)
        else:
            # Create new customer
            customer_data = CustomerCreate(
                email=request.email,
                name=request.name,
                business_type=request.company,
                phone=request.phone,
                status="lead"
            )
            customer = customer_service.create_customer(customer_data)
        
        # Link session to customer
        session_service = SessionService(db)
        session_service.update_session_customer(request.session_id, customer.id)
        
        # Send email notification to sales team
        await send_sales_notification(customer, request.session_id)
        
        return {
            "status": "success",
            "customer_id": customer.id,
            "message": "Customer information saved successfully and sales team notified"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving customer: {str(e)}")

@router.get("/chat-logs/{session_id}")
async def get_chat_log(session_id: str, db: Session = Depends(get_db)):
    """Get chat log for a specific session - for sales team review"""
    try:
        session_service = SessionService(db)
        customer_service = CustomerService(db)
        
        # Get session data
        session_data = session_service.get_session_with_messages(session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Get customer data if linked
        customer_data = None
        if session_data.get('customer_id'):
            customer_data = customer_service.get_customer(session_data['customer_id'])
        
        return {
            "session_id": session_id,
            "customer": customer_data,
            "messages": session_data.get('messages', []),
            "created_at": session_data.get('created_at'),
            "message_count": len(session_data.get('messages', []))
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat log: {str(e)}")

@router.post("/upload-file")
async def upload_customer_file(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    customer_email: str = Form(None),
    description: str = Form(None),
    db: Session = Depends(get_db)
):
    """Upload a file for a customer with security validation"""
    try:
        # Validate file security
        content = await validate_upload_file(file)
        
        # Create secure uploads directory if it doesn't exist
        upload_dir = os.path.join("uploads", "customer_files")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename with original extension
        file_extension = os.path.splitext(file.filename)[1].lower()
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file with validated content
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Set secure file permissions (read-only)
        os.chmod(file_path, 0o644)
        
        # If customer email provided, save file reference to customer
        if customer_email:
            customer_service = CustomerService(db)
            customer = customer_service.get_customer_by_email(customer_email)
            if customer:
                # Add file info to customer notes with security info
                file_note = f"File uploaded: {file.filename} ({file.content_type}) - Size: {len(content)} bytes"
                if description:
                    file_note += f" - {description}"
                file_note += f" [Saved as: {unique_filename}]"
                
                customer_service.add_notes(customer.id, file_note)
        
        return {
            "status": "success",
            "filename": unique_filename,
            "original_name": file.filename,
            "file_size": len(content),
            "message": "File uploaded successfully with security validation"
        }
        
    except HTTPException:
        raise  # Re-raise validation errors
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")
