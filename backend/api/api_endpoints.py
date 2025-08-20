from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.session_service import SessionService
from services.customer_service import CustomerService
from api.auth import get_current_user  # Legacy import
from api.auth import get_current_admin
from pydantic import BaseModel
from typing import List
from datetime import datetime
from database.models import ChatSession

class SeenStatusRequest(BaseModel):
    is_seen: bool

router = APIRouter()

@router.get("/sessions")
async def get_all_sessions(db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    """Get all chat sessions with customer info for admin"""
    try:
        print(f"🔍 Sessions endpoint - Current user: {current_user}")
        print(f"🔍 Is admin: {current_user.get('is_admin', False)}")
        
        session_service = SessionService(db)
        sessions_data = session_service.get_all_sessions_with_customers()
        
        result = []
        for session, customer, message_count in sessions_data:
            session_dict = {
                "id": session.session_id,
                "session_id": session.session_id,
                "status": session.status,
                "is_seen": session.is_seen,
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
            "is_seen": session.is_seen,
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
