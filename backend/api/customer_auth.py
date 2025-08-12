from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.customer_auth_service import CustomerAuthService
from services.appointment_service import AppointmentService
from services.customer_service import CustomerService
from schemas.auth import CustomerLoginRequest, PasswordResetRequest, PasswordResetConfirm
from typing import List, Dict, Any
import json

router = APIRouter(prefix="/api", tags=["customer-auth"])

@router.post("/check-customer")
async def check_customer_exists(request: dict, db: Session = Depends(get_db)):
    """Check if customer exists and has password set"""
    auth_service = CustomerAuthService(db)
    email = request.get('email')
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    exists = auth_service.customer_exists(email)
    has_password = auth_service.customer_has_password(email) if exists else False
    
    return {
        "exists": exists,
        "has_password": has_password
    }

@router.post("/customer-login")
async def customer_login(request: CustomerLoginRequest, db: Session = Depends(get_db)):
    """Authenticate customer login"""
    auth_service = CustomerAuthService(db)
    
    customer = auth_service.authenticate_customer(request.email, request.password)
    if not customer:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    token = auth_service.create_access_token({"sub": customer.email, "customer_id": customer.id})
    
    return {
        "access_token": token,
        "customer_id": customer.id,
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "company": customer.company,
            "phone": customer.phone
        }
    }

@router.post("/customer-set-password")
async def set_customer_password(request: dict, db: Session = Depends(get_db)):
    """Set password for existing customer"""
    auth_service = CustomerAuthService(db)
    customer_service = CustomerService(db)
    
    email = request.get('email')
    password = request.get('password')
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    customer = customer_service.get_customer_by_email(email)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    success = auth_service.set_customer_password(customer.id, password)
    if not success:
        raise HTTPException(status_code=500, detail="Error setting password")
    
    return {"success": True, "message": "Password set successfully"}

@router.post("/request-password-reset")
async def request_password_reset(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset code"""
    auth_service = CustomerAuthService(db)
    
    reset_code = auth_service.request_password_reset(request.email)
    if not reset_code:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Here you would send the reset code via email
    # For now, we'll return it in the response (remove in production)
    return {"success": True, "message": "Reset code sent to email", "reset_code": reset_code}

@router.post("/reset-password")
async def reset_password(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Reset password using reset code"""
    auth_service = CustomerAuthService(db)
    
    success = auth_service.reset_password(request.email, request.reset_code, request.new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid reset code or expired")
    
    return {"success": True, "message": "Password reset successfully"}

@router.post("/get-customer-by-email")
async def get_customer_by_email(request: dict, db: Session = Depends(get_db)):
    """Get customer data by email"""
    customer_service = CustomerService(db)
    email = request.get('email')
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    customer = customer_service.get_customer_by_email(email)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "company": customer.company,
        "phone": customer.phone,
        "business_type": customer.business_type,
        "status": customer.status
    }

@router.post("/schedule-appointment")
async def schedule_appointment(request: dict, db: Session = Depends(get_db)):
    """Automatically schedule next available appointment"""
    appointment_service = AppointmentService(db)
    
    customer_id = request.get('customer_id')
    session_id = request.get('session_id')
    customer_notes = request.get('customer_notes', 'Scheduled via chatbot')
    
    if not customer_id:
        raise HTTPException(status_code=400, detail="Customer ID is required")
    
    appointment = appointment_service.schedule_appointment_auto(customer_id, customer_notes)
    if not appointment:
        raise HTTPException(status_code=400, detail="No available appointment slots")
    
    return {
        "success": True,
        "appointment_id": appointment.id,
        "scheduled_date": appointment.scheduled_date.isoformat(),
        "duration_minutes": appointment.duration_minutes,
        "message": "Appointment scheduled successfully"
    }

@router.get("/customer-history/{customer_id}")
async def get_customer_history(customer_id: int, db: Session = Depends(get_db)):
    """Get customer project history and data"""
    customer_service = CustomerService(db)
    appointment_service = AppointmentService(db)
    
    customer = customer_service.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get customer's appointment history
    appointments = appointment_service.get_customer_appointments(customer_id)
    
    # Get chat sessions
    chat_sessions = customer.chat_sessions
    
    # Mock project data - in the future, you'd have a Projects table
    projects = []
    if len(chat_sessions) > 0:
        # Create mock projects based on chat history and customer notes
        if customer.notes:
            projects.append({
                "name": f"Automation Project for {customer.company or customer.name}",
                "status": "In Progress" if customer.status == "customer" else "Proposed",
                "type": "Process Automation",
                "description": customer.notes[:100] + "..." if len(customer.notes) > 100 else customer.notes
            })
    
    return {
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "company": customer.company,
            "business_type": customer.business_type,
            "status": customer.status
        },
        "projects": projects,
        "appointments": [
            {
                "id": apt.id,
                "scheduled_date": apt.scheduled_date.isoformat(),
                "status": apt.status,
                "type": apt.appointment_type,
                "notes": apt.customer_notes
            } for apt in appointments
        ],
        "total_chat_sessions": len(chat_sessions),
        "last_interaction": chat_sessions[-1].created_at.isoformat() if chat_sessions else None
    }
