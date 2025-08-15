"""
Google OAuth and Calendar integration API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import get_db
from api.auth import get_current_user  # Legacy import
from api.auth import get_current_admin
from services.google_calendar_service import google_calendar_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/api/auth/google/calendar")
async def initiate_google_calendar_auth(current_user: dict = Depends(get_current_admin)):
    """
    Initiate Google Calendar OAuth flow
    """
    try:
        auth_url = google_calendar_service.get_authorization_url()
        if not auth_url:
            raise HTTPException(status_code=500, detail="Failed to generate authorization URL")
        
        logger.info(f"Generated Google Calendar auth URL for user {current_user.get('id', 'unknown')}")
        return {"authorization_url": auth_url}
        
    except Exception as e:
        logger.error(f"Error initiating Google Calendar auth: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initiate Google Calendar authentication")

@router.get("/api/auth/google/callback")
async def google_calendar_callback(
    request: Request,
    code: str = None,
    error: str = None,
    db: Session = Depends(get_db)
):
    """
    Handle Google Calendar OAuth callback
    """
    try:
        if error:
            logger.error(f"Google OAuth error: {error}")
            raise HTTPException(status_code=400, detail=f"OAuth error: {error}")
        
        if not code:
            raise HTTPException(status_code=400, detail="No authorization code received")
        
        # Exchange code for tokens
        tokens = google_calendar_service.exchange_code_for_tokens(code)
        if not tokens:
            raise HTTPException(status_code=500, detail="Failed to exchange authorization code for tokens")
        
        logger.info("Successfully obtained Google Calendar tokens")
        
        # TODO: Store tokens in database associated with user
        # For now, just redirect to a success page
        return RedirectResponse(url="/admin/settings?google_calendar=connected")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in Google Calendar callback: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to complete Google Calendar authentication")

@router.get("/api/google/calendar/status")
async def get_google_calendar_status(current_user: dict = Depends(get_current_admin)):
    """
    Check Google Calendar integration status
    """
    try:
        # TODO: Check if user has valid tokens in database
        # For now, just return the service status
        return {
            "enabled": google_calendar_service.enabled,
            "connected": False,  # TODO: Check if user has valid tokens
            "message": "Google Calendar integration is available but not yet connected"
        }
        
    except Exception as e:
        logger.error(f"Error getting Google Calendar status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Google Calendar status")
