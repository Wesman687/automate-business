from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from api.auth import get_current_admin
from services.session_service import SessionService
from datetime import datetime

router = APIRouter()

@router.get("/sessions")
async def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all chat sessions"""
    try:
        session_service = SessionService(db)
        sessions = session_service.get_all_sessions()
        
        return [
            {
                "id": session.id,
                "session_id": session.session_id,
                "customer": {
                    "id": session.user.id if session.user else None,
                    "name": session.user.name if session.user else "Anonymous",
                    "email": session.user.email if session.user else None
                } if session.customer_id else None,
                "status": session.status,
                "is_seen": session.is_seen,
                "created_at": session.created_at.isoformat() if session.created_at else None,
                "updated_at": session.updated_at.isoformat() if session.updated_at else None,
                "message_count": len(session.messages) if session.messages else 0,
                "latest_message": {
                    "text": session.messages[-1].text if session.messages else None,
                    "timestamp": session.messages[-1].timestamp.isoformat() if session.messages else None,
                    "is_bot": session.messages[-1].is_bot if session.messages else None
                } if session.messages else None
            }
            for session in sessions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
async def get_chat_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get a specific chat session with all messages"""
    try:
        session_service = SessionService(db)
        session_data = session_service.get_session_with_messages(session_id)
        
        if not session_data:
            raise HTTPException(status_code=404, detail="Chat session not found")
            
        return session_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Delete a chat session and all its messages"""
    try:
        session_service = SessionService(db)
        session = session_service.get_session(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
            
        # Delete the session and its messages
        session_service.delete_session(session_id)
        
        return {"message": "Chat session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))