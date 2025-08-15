from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.session_service import SessionService
from services.customer_service import CustomerService
from api.auth import get_current_user  # Legacy import
from api.auth import get_current_admin
from typing import List

router = APIRouter(prefix="/api", tags=["api"])

@router.get("/sessions")
async def get_all_sessions(db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Get all chat sessions with customer info for admin"""
    try:
        session_service = SessionService(db)
        sessions_data = session_service.get_all_sessions_with_customers()
        
        result = []
        for session, customer, message_count in sessions_data:
            session_dict = {
                "id": session.session_id,
                "session_id": session.session_id,
                "status": session.status,
                "created_at": session.created_at.isoformat() if session.created_at else None,
                "updated_at": session.updated_at.isoformat() if session.updated_at else None,
                "message_count": message_count or 0,
                "customer": None
            }
            
            if customer:
                session_dict["customer"] = {
                    "id": customer.id,
                    "name": customer.name,
                    "email": customer.email,
                    "business_type": customer.business_type,
                    "status": customer.status
                }
            
            result.append(session_dict)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
async def get_session_details(session_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Get session details with messages"""
    try:
        session_service = SessionService(db)
        customer_service = CustomerService(db)
        
        session = session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get customer info
        customer = None
        if session.customer_id:
            customer = customer_service.get_customer_by_id(session.customer_id)
        
        # Get messages
        messages = session_service.get_session_messages(session_id)
        
        result = {
            "id": session.session_id,
            "session_id": session.session_id,
            "status": session.status,
            "created_at": session.created_at.isoformat() if session.created_at else None,
            "updated_at": session.updated_at.isoformat() if session.updated_at else None,
            "customer_id": session.customer_id,
            "customer": None,
            "messages": []
        }
        
        if customer:
            result["customer"] = {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "business_type": customer.business_type,
                "status": customer.status,
                "created_at": customer.created_at.isoformat() if customer.created_at else None
            }
        
        if messages:
            result["messages"] = [
                {
                    "id": msg.id,
                    "text": msg.text,
                    "is_bot": msg.is_bot,
                    "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
                }
                for msg in messages
            ]
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/messages")
async def get_session_messages(session_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Get messages for a specific session"""
    try:
        session_service = SessionService(db)
        messages = session_service.get_session_messages(session_id)
        
        if not messages:
            return []
        
        return [
            {
                "id": msg.id,
                "text": msg.text,
                "is_bot": msg.is_bot,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
            }
            for msg in messages
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Delete a chat session"""
    try:
        session_service = SessionService(db)
        
        # Check if session exists
        session = session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Delete the session (this should cascade to messages)
        session_service.delete_session(session_id)
        
        return {"message": "Session deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customers")
async def get_all_customers(db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Get all customers for admin"""
    try:
        customer_service = CustomerService(db)
        customers = customer_service.get_all_customers()
        
        result = []
        for customer in customers:
            # Get chat session count
            chat_count = len(customer.chat_sessions) if customer.chat_sessions else 0
            
            customer_dict = {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "address": customer.address,
                "business_type": customer.business_type,
                "business_site": customer.business_site,
                "additional_websites": customer.additional_websites,
                "status": customer.status,
                "notes": customer.notes,
                "created_at": customer.created_at.isoformat() if customer.created_at else None,
                "updated_at": customer.updated_at.isoformat() if customer.updated_at else None,
                "chat_count": chat_count,
                "chat_sessions": []  # Initialize empty, will be populated below
            }
            
            # Add chat sessions data if available
            if customer.chat_sessions:
                session_service = SessionService(db)
                for session in customer.chat_sessions:
                    # Get message count for each session
                    messages = session_service.get_session_messages(session.session_id)
                    message_count = len(messages) if messages else 0
                    
                    customer_dict["chat_sessions"].append({
                        "session_id": session.session_id,
                        "status": session.status,
                        "created_at": session.created_at.isoformat() if session.created_at else None,
                        "message_count": message_count
                    })
            result.append(customer_dict)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customers/{customer_id}")
async def get_customer_details(customer_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Get customer details"""
    try:
        customer_service = CustomerService(db)
        customer = customer_service.get_customer_by_id(customer_id)
        
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get chat sessions
        chat_sessions = []
        if customer.chat_sessions:
            for session in customer.chat_sessions:
                # Get message count
                session_service = SessionService(db)
                messages = session_service.get_session_messages(session.session_id)
                message_count = len(messages) if messages else 0
                
                chat_sessions.append({
                    "id": session.session_id,
                    "session_id": session.session_id,
                    "status": session.status,
                    "created_at": session.created_at.isoformat() if session.created_at else None,
                    "message_count": message_count
                })
        
        return {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "address": customer.address,
            "business_type": customer.business_type,
            "business_site": customer.business_site,
            "additional_websites": customer.additional_websites,
            "status": customer.status,
            "notes": customer.notes,
            "file_path": customer.file_path,
            "created_at": customer.created_at.isoformat() if customer.created_at else None,
            "updated_at": customer.updated_at.isoformat() if customer.updated_at else None,
            "chat_sessions": chat_sessions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/customers/{customer_id}")
async def update_customer(customer_id: int, customer_data: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Update customer information"""
    try:
        customer_service = CustomerService(db)
        customer = customer_service.get_customer_by_id(customer_id)
        
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Update customer fields
        if 'name' in customer_data:
            customer.name = customer_data['name']
        if 'email' in customer_data:
            customer.email = customer_data['email']
        if 'phone' in customer_data:
            customer.phone = customer_data['phone']
        if 'address' in customer_data:
            customer.address = customer_data['address']
        if 'business_type' in customer_data:
            customer.business_type = customer_data['business_type']
        if 'business_site' in customer_data:
            customer.business_site = customer_data['business_site']
        if 'additional_websites' in customer_data:
            customer.additional_websites = customer_data['additional_websites']
        if 'status' in customer_data:
            customer.status = customer_data['status']
        if 'notes' in customer_data:
            customer.notes = customer_data['notes']
        
        # Save changes
        customer_service.update_customer(customer)
        
        return {"message": "Customer updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Delete a customer and their chat sessions"""
    try:
        customer_service = CustomerService(db)
        customer = customer_service.get_customer_by_id(customer_id)
        
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Delete customer (this should cascade to sessions and messages)
        customer_service.delete_customer(customer_id)
        
        return {"message": "Customer deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
