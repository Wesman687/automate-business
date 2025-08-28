"""
Admin API endpoints for managing cross-app integrations.
Allows admins to create, update, and manage external app integrations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging
import secrets
import hashlib

from database import get_db
from services.cross_app_auth_service import CrossAppAuthService
from schemas.cross_app import (
    AppIntegrationCreate, AppIntegrationUpdate, AppIntegrationResponse,
    AppStatus, AppPermission
)
from models import User
from api.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/cross-app", tags=["admin-cross-app"])


def require_admin(current_user: dict = Depends(get_current_user)):
    """Ensure the current user is an admin"""
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/health")
async def health_check(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Health check for cross-app tables"""
    try:
        # Test if we can query the table
        from models.cross_app_models import AppIntegration
        count = db.query(AppIntegration).count()
        return {"status": "healthy", "table_exists": True, "record_count": count}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "unhealthy", "table_exists": False, "error": str(e)}

@router.post("/integrations", response_model=AppIntegrationResponse)
async def create_app_integration(
    app_data: AppIntegrationCreate,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new cross-app integration"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Generate unique app_id automatically
        app_id = f"app_{secrets.token_urlsafe(8)}"
        
        # Generate API key automatically
        api_key = secrets.token_urlsafe(32)
        api_key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        # Create the app integration with generated values and auto-approve for admins
        app_integration = cross_app_service.create_app_integration(
            app_data=app_data,
            app_id=app_id,
            api_key_hash=api_key_hash,
            created_by=current_user["user_id"],
            auto_approve=True  # Auto-approve integrations created by admins
        )
        
        # Return response with the generated API key (only shown once)
        response_data = {
            **app_integration.__dict__,
            "api_key": api_key  # Include the plain API key for admin to share
        }
        
        logger.info(f"Admin {current_user['email']} created and auto-approved app integration: {app_id}")
        return response_data
        
    except Exception as e:
        logger.error(f"Error creating app integration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create app integration: {str(e)}"
        )


@router.get("/integrations", response_model=List[AppIntegrationResponse])
async def list_app_integrations(
    app_status: Optional[AppStatus] = None,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all cross-app integrations with optional status filter"""
    try:
        cross_app_service = CrossAppAuthService(db)
        integrations = cross_app_service.get_all_app_integrations(status=app_status)
        return integrations
        
    except Exception as e:
        logger.error(f"Error listing app integrations: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error details: {e.__dict__ if hasattr(e, '__dict__') else 'No details'}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list app integrations: {str(e)}"
        )


@router.get("/integrations/{app_id}", response_model=AppIntegrationResponse)
async def get_app_integration(
    app_id: str,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get details of a specific app integration"""
    try:
        cross_app_service = CrossAppAuthService(db)
        integration = cross_app_service.get_app_integration_by_id(app_id)
        
        if not integration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App integration not found"
            )
        
        return integration
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting app integration {app_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get app integration"
        )


@router.put("/integrations/{app_id}", response_model=AppIntegrationResponse)
async def update_app_integration(
    app_id: str,
    app_data: AppIntegrationUpdate,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update an existing app integration"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Check if app exists
        existing_app = cross_app_service.get_app_integration_by_id(app_id)
        if not existing_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App integration not found"
            )
        
        # Update the app integration
        updated_app = cross_app_service.update_app_integration(
            app_id=app_id,
            app_data=app_data,
            updated_by=current_user["user_id"]
        )
        
        logger.info(f"Admin {current_user['email']} updated app integration: {app_id}")
        return updated_app
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating app integration {app_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update app integration"
        )


@router.post("/integrations/{app_id}/approve")
async def approve_app_integration(
    app_id: str,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Approve a pending app integration"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Check if app exists
        existing_app = cross_app_service.get_app_integration_by_id(app_id)
        if not existing_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App integration not found"
            )
        
        if existing_app.status != AppStatus.PENDING_APPROVAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="App integration is not pending approval"
            )
        
        # Approve the app integration
        approved_app = cross_app_service.approve_app_integration(
            app_id=app_id,
            approved_by=current_user["user_id"]
        )
        
        logger.info(f"Admin {current_user['email']} approved app integration: {app_id}")
        return {"message": "App integration approved successfully", "app": approved_app}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving app integration {app_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve app integration"
        )


@router.post("/integrations/{app_id}/suspend")
async def suspend_app_integration(
    app_id: str,
    reason: str = "Admin suspension",
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Suspend an active app integration"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Check if app exists
        existing_app = cross_app_service.get_app_integration_by_id(app_id)
        if not existing_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App integration not found"
            )
        
        if existing_app.status == AppStatus.SUSPENDED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="App integration is already suspended"
            )
        
        # Suspend the app integration
        suspended_app = cross_app_service.suspend_app_integration(
            app_id=app_id,
            reason=reason,
            suspended_by=current_user["user_id"]
        )
        
        logger.info(f"Admin {current_user['email']} suspended app integration: {app_id}")
        return {"message": "App integration suspended successfully", "app": suspended_app}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error suspending app integration {app_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to suspend app integration"
        )


@router.post("/integrations/{app_id}/activate")
async def activate_app_integration(
    app_id: str,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Activate a suspended app integration"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Check if app exists
        existing_app = cross_app_service.get_app_integration_by_id(app_id)
        if not existing_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App integration not found"
            )
        
        if existing_app.status != AppStatus.SUSPENDED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="App integration is not suspended"
            )
        
        # Activate the app integration
        activated_app = cross_app_service.activate_app_integration(
            app_id=app_id,
            activated_by=current_user["user_id"]
        )
        
        logger.info(f"Admin {current_user['email']} activated app integration: {app_id}")
        return {"message": "App integration activated successfully", "app": activated_app}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error activating app integration {app_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate app integration"
        )


@router.post("/integrations/{app_id}/regenerate-api-key")
async def regenerate_api_key(
    app_id: str,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Regenerate API key for an app integration"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Check if app exists
        existing_app = cross_app_service.get_app_integration_by_id(app_id)
        if not existing_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App integration not found"
            )
        
        # Generate new API key
        new_api_key = secrets.token_urlsafe(32)
        new_api_key_hash = hashlib.sha256(new_api_key.encode()).hexdigest()
        
        # Update the app integration
        updated_app = cross_app_service.update_api_key(
            app_id=app_id,
            new_api_key_hash=new_api_key_hash,
            updated_by=current_user["user_id"]
        )
        
        logger.info(f"Admin {current_user['email']} regenerated API key for app: {app_id}")
        return {
            "message": "API key regenerated successfully",
            "app_id": app_id,
            "new_api_key": new_api_key  # Only shown once
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error regenerating API key for app {app_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to regenerate API key"
        )


@router.get("/integrations/{app_id}/usage")
async def get_app_usage_stats(
    app_id: str,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get usage statistics for an app integration"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Check if app exists
        existing_app = cross_app_service.get_app_integration_by_id(app_id)
        if not existing_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App integration not found"
            )
        
        # Get usage statistics
        usage_stats = cross_app_service.get_app_usage_statistics(app_id)
        
        return usage_stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting usage stats for app {app_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get app usage statistics"
        )


@router.delete("/integrations/{app_id}")
async def delete_app_integration(
    app_id: str,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete an app integration (soft delete - sets status to inactive)"""
    try:
        cross_app_service = CrossAppAuthService(db)
        
        # Check if app exists
        existing_app = cross_app_service.get_app_integration_by_id(app_id)
        if not existing_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App integration not found"
            )
        
        # Soft delete the app integration
        deleted_app = cross_app_service.delete_app_integration(
            app_id=app_id,
            deleted_by=current_user["user_id"]
        )
        
        logger.info(f"Admin {current_user['email']} deleted app integration: {app_id}")
        return {"message": "App integration deleted successfully", "app": deleted_app}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting app integration {app_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete app integration"
        )
