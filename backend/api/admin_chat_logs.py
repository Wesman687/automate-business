from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from database.models import ChatSession, ChatMessage, Customer
from api.auth import get_current_user  # Legacy import
from api.auth import get_current_admin

router = APIRouter(prefix="/api/admin/chat-logs", tags=["admin-chat-logs"])

@router.get("")
async def get_chat_logs(
    seen: Optional[bool] = Query(None, description="Filter by seen status. None = all, True = seen only, False = unseen only"),
    limit: int = Query(50, description="Number of chat sessions to retrieve"),
    skip: int = Query(0, description="Number of records to skip"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get chat logs with optional filtering by seen status"""
    try:
        # Build the query
        query = db.query(ChatSession).options(
            joinedload(ChatSession.customer),
            joinedload(ChatSession.messages)
        )
        
        # Filter by seen status if specified
        if seen is not None:
            query = query.filter(ChatSession.is_seen == seen)
        
        # Order by most recent first
        query = query.order_by(ChatSession.created_at.desc())
        
        # Apply pagination
        chat_sessions = query.offset(skip).limit(limit).all()
        
        # Format the response
        chat_logs = []
        for session in chat_sessions:
            # Get the latest message
            latest_message = None
            if session.messages:
                latest_message = max(session.messages, key=lambda m: m.timestamp)
            
            chat_log = {
                "id": session.id,
                "session_id": session.session_id,
                "customer": {
                    "id": session.customer.id if session.customer else None,
                    "name": session.customer.name if session.customer else "Unknown",
                    "email": session.customer.email if session.customer else "Unknown"
                } if session.customer else {"id": None, "name": "Unknown", "email": "Unknown"},
                "status": session.status,
                "is_seen": session.is_seen,
                "created_at": session.created_at.isoformat(),
                "updated_at": session.updated_at.isoformat() if session.updated_at else None,
                "message_count": len(session.messages),
                "latest_message": {
                    "text": latest_message.text if latest_message else None,
                    "timestamp": latest_message.timestamp.isoformat() if latest_message else None,
                    "is_bot": latest_message.is_bot if latest_message else None
                } if latest_message else None
            }
            chat_logs.append(chat_log)
        
        # Get total count for pagination info
        total_query = db.query(ChatSession)
        if seen is not None:
            total_query = total_query.filter(ChatSession.is_seen == seen)
        total_count = total_query.count()
        
        return {
            "chat_logs": chat_logs,
            "total": total_count,
            "limit": limit,
            "skip": skip,
            "has_more": skip + len(chat_logs) < total_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat logs: {str(e)}")

@router.put("/{session_id}/mark-seen")
async def mark_chat_session_seen(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Mark a chat session as seen"""
    try:
        # Find the chat session
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Mark as seen
        session.is_seen = True
        session.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "Chat session marked as seen", "session_id": session_id}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error marking session as seen: {str(e)}")

@router.put("/{session_id}/mark-unseen")
async def mark_chat_session_unseen(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Mark a chat session as unseen"""
    try:
        # Find the chat session
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Mark as unseen
        session.is_seen = False
        session.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "Chat session marked as unseen", "session_id": session_id}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error marking session as unseen: {str(e)}")

@router.get("/{session_id}")
async def get_chat_log_details(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get detailed chat log for a specific session"""
    try:
        # Find the chat session with all related data
        session = db.query(ChatSession).options(
            joinedload(ChatSession.customer),
            joinedload(ChatSession.messages)
        ).filter(ChatSession.id == session_id).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Build detailed chat log
        messages = []
        for message in sorted(session.messages, key=lambda m: m.timestamp):
            messages.append({
                "id": message.id,
                "text": message.text,
                "is_bot": message.is_bot,
                "timestamp": message.timestamp.isoformat()
            })
        
        chat_log = {
            "id": session.id,
            "session_id": session.session_id,
            "customer": {
                "id": session.customer.id if session.customer else None,
                "name": session.customer.name if session.customer else "Unknown",
                "email": session.customer.email if session.customer else "Unknown",
                "phone": session.customer.phone if session.customer else None,
                "business_type": session.customer.business_type if session.customer else None
            } if session.customer else None,
            "status": session.status,
            "is_seen": session.is_seen,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat() if session.updated_at else None,
            "messages": messages,
            "message_count": len(messages)
        }
        
        return chat_log
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat log details: {str(e)}")

@router.get("/stats/summary")
async def get_chat_log_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get chat log statistics"""
    try:
        # Get counts
        total_sessions = db.query(ChatSession).count()
        unseen_sessions = db.query(ChatSession).filter(ChatSession.is_seen == False).count()
        seen_sessions = db.query(ChatSession).filter(ChatSession.is_seen == True).count()
        
        # Get today's sessions
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_sessions = db.query(ChatSession).filter(ChatSession.created_at >= today).count()
        
        return {
            "total_sessions": total_sessions,
            "unseen_sessions": unseen_sessions,
            "seen_sessions": seen_sessions,
            "today_sessions": today_sessions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat log stats: {str(e)}")
