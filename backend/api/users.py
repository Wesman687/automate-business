from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from database.models import User
from api.auth import get_current_user, get_current_admin
from services.auth_service import AuthService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific user - Users can only see themselves, admins can see any"""
    try:
        print('hitting here')
        # Check authorization
        is_admin = current_user.get('is_admin', False)
        current_user_id = current_user.get('user_id')
        
        if not is_admin and current_user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied - can only view your own data")
        
        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Return user data (excluding sensitive information)
        return {
            "id": user.id,
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "address": user.address,
            "city": user.city,
            "state": user.state,
            "zip_code": user.zip_code,
            "country": user.country,
            "business_name": user.business_name,
            "business_site": user.business_site,
            "additional_websites": user.additional_websites,
            "business_type": user.business_type,
            "pain_points": user.pain_points,
            "current_tools": user.current_tools,
            "budget": user.budget,
            "lead_status": user.lead_status,
            "notes": user.notes,
            "status": user.status,
            "user_type": user.user_type,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a user - Users can only update themselves, admins can update any"""
    try:
        # Check authorization
        is_admin = current_user.get('is_admin', False)
        current_user_id = current_user.get('user_id')
        
        if not is_admin and current_user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied - can only update your own data")
        
        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update allowed fields
        allowed_fields = [
            'name', 'phone', 'address', 'city', 'state', 'zip_code', 'country',
            'business_name', 'business_site', 'additional_websites', 'business_type',
            'pain_points', 'current_tools', 'budget', 'lead_status', 'notes'
        ]
        
        for field in allowed_fields:
            if field in user_data:
                setattr(user, field, user_data[field])
        
        db.commit()
        db.refresh(user)
        
        return {
            "message": "User updated successfully",
            "user_id": user.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/users/{user_id}/password")
async def update_user_password(
    user_id: int,
    password_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a user's password - Users can only update their own password"""
    try:
        # Check authorization
        current_user_id = current_user.get('user_id')
        
        if current_user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied - can only update your own password")
        
        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Validate password
        new_password = password_data.get('password')
        if not new_password or len(new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
        # Hash and update password
        auth_service = AuthService(db)
        password_hash = auth_service.hash_password(new_password)
        user.password_hash = password_hash
        
        db.commit()
        
        return {
            "message": "Password updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating password for user {user_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users")
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all users - Admin only"""
    try:
        users = db.query(User).offset(skip).limit(limit).all()
        
        user_list = []
        for user in users:
            user_list.append({
                "id": user.id,
                "user_id": user.id,
                "email": user.email,
                "name": user.name,
                "phone": user.phone,
                "address": user.address,
                "city": user.city,
                "state": user.state,
                "zip_code": user.zip_code,
                "country": user.country,
                "business_name": user.business_name,
                "business_site": user.business_site,
                "additional_websites": user.additional_websites,
                "business_type": user.business_type,
                "pain_points": user.pain_points,
                "current_tools": user.current_tools,
                "budget": user.budget,
                "lead_status": user.lead_status,
                "notes": user.notes,
                "status": user.status,
                "user_type": user.user_type,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None,
                "last_login": user.last_login.isoformat() if user.last_login else None
            })
        
        return user_list
        
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
