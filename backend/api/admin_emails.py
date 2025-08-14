from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import logging
from datetime import datetime

from database import get_db
from services.email_reader_service import EmailReaderService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin/emails", tags=["admin-emails"])

@router.get("/unread")
async def get_unread_emails(
    days_back: int = 7,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get unread emails from all configured accounts"""
    try:
        email_service = EmailReaderService()
        unread_emails = email_service.get_unread_emails(days_back=days_back, limit=limit)
        
        # Convert to API response format
        emails_data = []
        for email in unread_emails:
            emails_data.append({
                "id": email.id,
                "account": email.account,
                "from": email.from_address,
                "subject": email.subject,
                "received_date": email.received_date.isoformat(),
                "preview": email.preview,
                "is_important": email.is_important
            })
        
        return {
            "emails": emails_data,
            "total": len(emails_data),
            "accounts_configured": len(email_service.accounts)
        }
        
    except Exception as e:
        logger.error(f"Error fetching unread emails: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch emails")

@router.post("/mark-read/{email_id}")
async def mark_email_read(
    email_id: str,
    db: Session = Depends(get_db)
):
    """Mark an email as read"""
    try:
        email_service = EmailReaderService()
        success = email_service.mark_email_as_read(email_id)
        
        if success:
            return {"message": "Email marked as read", "success": True}
        else:
            raise HTTPException(status_code=400, detail="Failed to mark email as read")
            
    except Exception as e:
        logger.error(f"Error marking email as read: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to mark email as read")

@router.get("/stats")
async def get_email_stats(
    db: Session = Depends(get_db)
):
    """Get email statistics"""
    try:
        email_service = EmailReaderService()
        stats = email_service.get_email_stats()
        
        return {
            "stats": stats,
            "message": "Email statistics retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error fetching email stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch email statistics")
