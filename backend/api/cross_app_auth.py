"""
Cross-App Authentication API endpoints for external application integration.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import logging
from datetime import datetime

from database import get_db
from services.cross_app_auth_service import CrossAppAuthService
from services.cross_app_credit_service import CrossAppCreditService
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
    # Check for forwarded headers first
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    # Fall back to direct connection
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
        
        # Validate token
        user_data = cross_app_service.validate_cross_app_token(
            session_token=request.session_token,
            app_id=request.app_id
        )
        
        if user_data:
            return CrossAppTokenValidationResponse(
                valid=True,
                user=user_data,
                permissions=user_data.get("permissions", []),
                expires_at=user_data.get("expires_at")
            )
        else:
            return CrossAppTokenValidationResponse(
                valid=False,
                error="Invalid or expired session token"
            )
        
    except Exception as e:
        logger.error(f"Error validating cross-app token: {str(e)}")
        return CrossAppTokenValidationResponse(
            valid=False,
            error="Error validating token"
        )

@router.post("/refresh-token", response_model=CrossAppTokenRefreshResponse)
async def refresh_cross_app_token(
    request: CrossAppTokenRefreshRequest,
    db: Session = Depends(get_db)
):
    """Refresh a cross-app session token"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Refresh token
        result = cross_app_service.refresh_cross_app_token(
            session_token=request.session_token,
            app_id=request.app_id
        )
        
        if result:
            logger.info(f"Cross-app token refreshed for app {request.app_id}")
            return CrossAppTokenRefreshResponse(**result)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to refresh token"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing cross-app token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during token refresh"
        )

@router.post("/logout")
async def logout_cross_app_user(
    request: CrossAppTokenValidationRequest,
    db: Session = Depends(get_db)
):
    """Logout a cross-app user by revoking their session"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Revoke session
        success = cross_app_service.revoke_cross_app_session(
            session_token=request.session_token,
            app_id=request.app_id
        )
        
        if success:
            logger.info(f"Cross-app user logged out from app {request.app_id}")
            return {"message": "Successfully logged out"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or already revoked"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging out cross-app user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during logout"
        )

@router.get("/user-info", response_model=CrossAppUserInfoResponse)
async def get_cross_app_user_info(
    session_token: str,
    app_id: str,
    db: Session = Depends(get_db)
):
    """Get user information for cross-app use"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Get user info
        user_info = cross_app_service.get_user_cross_app_info(
            session_token=session_token,
            app_id=app_id
        )
        
        if user_info:
            return CrossAppUserInfoResponse(**user_info)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session token or insufficient permissions"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting cross-app user info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error getting user info"
        )

# Credit Management Endpoints

@router.post("/credits/check", response_model=CrossAppCreditCheckResponse)
async def check_cross_app_credits(
    request: CrossAppCreditCheckRequest,
    db: Session = Depends(get_db)
):
    """Check user's credit balance and available packages"""
    try:
        credit_service = CrossAppCreditService(db)
        
        # Check credits
        result = credit_service.check_credit_balance(
            session_token=request.session_token,
            app_id=request.app_id,
            required_credits=request.required_credits
        )
        
        return CrossAppCreditCheckResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking cross-app credits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error checking credits"
        )

@router.post("/credits/consume", response_model=CrossAppCreditConsumeResponse)
async def consume_cross_app_credits(
    request: CrossAppCreditConsumeRequest,
    db: Session = Depends(get_db)
):
    """Consume credits for a service"""
    try:
        credit_service = CrossAppCreditService(db)
        
        # Consume credits
        result = credit_service.consume_credits(
            session_token=request.session_token,
            app_id=request.app_id,
            credits=request.credits,
            service=request.service,
            description=request.description,
            metadata=request.metadata
        )
        
        return CrossAppCreditConsumeResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error consuming cross-app credits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error consuming credits"
        )

@router.post("/credits/purchase", response_model=CrossAppCreditPurchaseResponse)
async def purchase_cross_app_credits(
    request: CrossAppCreditPurchaseRequest,
    db: Session = Depends(get_db)
):
    """Create a credit purchase flow for cross-app users"""
    try:
        credit_service = CrossAppCreditService(db)
        
        # Create purchase flow
        result = credit_service.purchase_credits(
            session_token=request.session_token,
            app_id=request.app_id,
            package_id=request.package_id,
            credits=request.credits,
            return_url=request.return_url
        )
        
        return CrossAppCreditPurchaseResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating cross-app credit purchase: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error creating credit purchase"
        )

@router.get("/credits/packages")
async def get_cross_app_credit_packages(
    session_token: str,
    app_id: str,
    db: Session = Depends(get_db)
):
    """Get available credit packages for the app"""
    try:
        credit_service = CrossAppCreditService(db)
        
        # Get packages
        packages = credit_service.get_credit_packages(
            session_token=session_token,
            app_id=app_id
        )
        
        return {"packages": packages}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting cross-app credit packages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error getting credit packages"
        )

@router.get("/credits/subscriptions")
async def get_cross_app_user_subscriptions(
    session_token: str,
    app_id: str,
    db: Session = Depends(get_db)
):
    """Get user's active subscriptions"""
    try:
        credit_service = CrossAppCreditService(db)
        
        # Get subscriptions
        subscriptions = credit_service.get_user_subscriptions(
            session_token=session_token,
            app_id=app_id
        )
        
        return {"subscriptions": subscriptions}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting cross-app user subscriptions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error getting user subscriptions"
        )

# Health Check Endpoint

@router.get("/health")
async def cross_app_health_check():
    """Health check endpoint for cross-app services"""
    return {
        "status": "healthy",
        "service": "cross-app-auth",
        "timestamp": datetime.utcnow().isoformat()
    }
