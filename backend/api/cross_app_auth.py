"""
Cross-App Authentication API endpoints for external application integration.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import logging
from datetime import datetime, timedelta

from database import get_db
from services.cross_app_auth_service import CrossAppAuthService
from schemas.cross_app import (
    CrossAppAuthRequest, CrossAppAuthResponse, CrossAppTokenValidationRequest,
    CrossAppTokenValidationResponse, CrossAppTokenRefreshRequest, CrossAppTokenRefreshResponse,
    CrossAppCreditCheckRequest, CrossAppCreditCheckResponse, CrossAppCreditConsumeRequest,
    CrossAppCreditConsumeResponse, CrossAppCreditPurchaseRequest, CrossAppCreditPurchaseResponse,
    CrossAppUserInfoRequest, CrossAppUserInfoResponse, CrossAppErrorResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cross-app", tags=["cross-app"])

def get_client_ip(request: Request) -> Optional[str]:
    """Extract client IP address from request"""
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else None

def get_user_agent(request: Request) -> Optional[str]:
    """Extract user agent from request"""
    return request.headers.get("user-agent")

@router.post("/auth", response_model=CrossAppAuthResponse)
async def authenticate_cross_app_user(
    request: CrossAppAuthRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Authenticate a user for cross-app access"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Extract client information
        ip_address = get_client_ip(req)
        user_agent = get_user_agent(req)
        
        # Extract client information
        ip_address = get_client_ip(req)
        user_agent = get_user_agent(req)
        
        # Authenticate user
        result = cross_app_service.authenticate_cross_app_user(
            app_id=request.app_id,
            email=request.email,
            password=request.password,
            app_user_id=request.app_user_id,
            app_metadata=request.app_metadata,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        logger.info(f"Cross-app authentication successful for user {request.email} in app {request.app_id}")
        return CrossAppAuthResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in cross-app authentication: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication"
        )

@router.post("/validate-token", response_model=CrossAppTokenValidationResponse)
async def validate_cross_app_token(
    request: CrossAppTokenValidationRequest,
    db: Session = Depends(get_db)
):
    """Validate a cross-app session token"""
    try:
        cross_app_service = CrossAppAuthService(db)
        result = cross_app_service.validate_session_token(
            session_token=request.session_token,
            app_id=request.app_id
        )
        
        if result.get("valid"):
            return CrossAppTokenValidationResponse(
                valid=True,
                user=result.get("user"),
                permissions=result.get("permissions", []),
                expires_at=result.get("expires_at")
            )
        else:
            return CrossAppTokenValidationResponse(
                valid=False,
                error=result.get("error", "Invalid token")
            )
            
    except Exception as e:
        logger.error(f"Error validating token: {str(e)}")
        return CrossAppTokenValidationResponse(
            valid=False,
            error="Internal server error"
        )

@router.post("/refresh-token", response_model=CrossAppTokenRefreshResponse)
async def refresh_cross_app_token(
    request: CrossAppTokenRefreshRequest,
    db: Session = Depends(get_db)
):
    """Refresh a cross-app session token"""
    try:
        cross_app_service = CrossAppAuthService(db)
        validation = cross_app_service.validate_session_token(
            session_token=request.session_token,
            app_id=request.app_id
        )
        
        if not validation.get("valid"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation.get("error", "Invalid session token")
            )
        
        # Refresh token (creates new session in database)
        refresh_result = cross_app_service.refresh_session_token(
            session_token=request.session_token,
            app_id=request.app_id
        )
        
        return CrossAppTokenRefreshResponse(
            new_session_token=refresh_result["new_session_token"],
            expires_at=refresh_result["expires_at"],
            permissions=refresh_result["permissions"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/credits/check", response_model=CrossAppCreditCheckResponse)
async def check_credits(
    request: CrossAppCreditCheckRequest,
    db: Session = Depends(get_db)
):
    """Check user's credit balance"""
    try:
        cross_app_service = CrossAppAuthService(db)
        result = cross_app_service.check_credits(
            session_token=request.session_token,
            app_id=request.app_id,
            required_credits=request.required_credits
        )
        return CrossAppCreditCheckResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking credits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/credits/consume", response_model=CrossAppCreditConsumeResponse)
async def consume_credits(
    request: CrossAppCreditConsumeRequest,
    db: Session = Depends(get_db)
):
    """Consume credits for a service"""
    try:
        cross_app_service = CrossAppAuthService(db)
        result = cross_app_service.consume_credits(
            session_token=request.session_token,
            app_id=request.app_id,
            credits=request.credits,
            service=request.service,
            description=request.description
        )
        return CrossAppCreditConsumeResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error consuming credits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/user-info", response_model=CrossAppUserInfoResponse)
async def get_user_info(
    request: CrossAppUserInfoRequest,
    db: Session = Depends(get_db)
):
    """Get user information for cross-app use"""
    try:
        cross_app_service = CrossAppAuthService(db)
        validation = cross_app_service.validate_session_token(
            session_token=request.session_token,
            app_id=request.app_id
        )
        
        if not validation.get("valid"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation.get("error", "Invalid session token")
            )
        
        # Get app info from session
        from database.models import CrossAppSession, AppIntegration
        session = db.query(CrossAppSession).filter(
            CrossAppSession.session_token == request.session_token
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session not found"
            )
        
        app = db.query(AppIntegration).filter(AppIntegration.id == session.app_id).first()
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App integration not found"
            )
        
        return CrossAppUserInfoResponse(
            user=validation["user"],
            app_info={
                "app_id": app.app_id,
                "app_name": app.app_name,
                "app_domain": app.app_domain
            },
            permissions=validation["permissions"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

