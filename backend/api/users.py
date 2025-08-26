from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from database.models import User
from api.auth import get_current_user, get_current_admin
from services.user_service import UserService
from schemas.user import (
    UserCreate, UserUpdate, UserResponse, CustomerResponse, AdminResponse,
    UserListResponse, UserFilter, UserStats, BulkUserUpdate, BulkUserStatusUpdate,
    PasswordUpdate
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific user - Users can only see themselves, admins can see any"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(user_id, current_user)
        return user
        
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update user - Users can only update themselves, admins can update any"""
    try:
        user_service = UserService(db)
        user = user_service.update_user(user_id, user_data, current_user)
        return user
        
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/users/{user_id}/password")
async def update_user_password(
    user_id: int,
    password_data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update user password - Users can only update their own password"""
    try:
        user_service = UserService(db)
        success = user_service.update_password(
            user_id, 
            password_data.current_password, 
            password_data.new_password, 
            current_user
        )
        
        if success:
            return {"message": "Password updated successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to update password")
        
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating password for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users", response_model=List[UserListResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_type: Optional[str] = Query(None, description="Filter by user type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in name, email, business_name"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all users with filtering - Admin only"""
    try:
        user_service = UserService(db)
        
        # Build filters
        filters = None
        if any([user_type, status, search]):
            filters = UserFilter(
                user_type=user_type,
                status=status,
                search=search
            )
        
        users = user_service.get_users(current_user, filters, skip, limit)
        return users
        
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users/stats", response_model=UserStats)
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get user statistics - Admin only"""
    try:
        user_service = UserService(db)
        stats = user_service.get_user_stats(current_user)
        return stats
        
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/users/bulk-update")
async def bulk_update_users(
    bulk_update: BulkUserUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Bulk update users - Admin only"""
    try:
        user_service = UserService(db)
        updated_count = user_service.bulk_update_users(bulk_update, current_user)
        return {"message": f"Successfully updated {updated_count} users"}
        
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Error bulk updating users: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/users/bulk-status-update")
async def bulk_update_user_status(
    bulk_status_update: BulkUserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Bulk update user status - Admin only"""
    try:
        user_service = UserService(db)
        updated_count = user_service.bulk_update_user_status(bulk_status_update, current_user)
        return {"message": f"Successfully updated status for {updated_count} users"}
        
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Error bulk updating user status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Delete user (soft delete) - Admin only"""
    try:
        user_service = UserService(db)
        success = user_service.delete_user(user_id, current_user)
        
        if success:
            return {"message": "User deleted successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to delete user")
        
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/users/{user_id}/credits")
async def update_user_credits(
    user_id: int,
    credit_change: int,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Update user credits - Admin only"""
    try:
        user_service = UserService(db)
        success = user_service.update_user_credits(user_id, credit_change, reason or "Manual adjustment")
        
        if success:
            return {"message": f"Credits updated successfully. Change: {credit_change}"}
        else:
            raise HTTPException(status_code=400, detail="Failed to update credits")
        
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating credits for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
