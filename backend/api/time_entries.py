from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from database.models import TimeEntry
from api.auth import get_current_admin
from typing import List
from datetime import datetime

router = APIRouter(tags=["time-entries"])

@router.get("/time-entries", response_model=List[dict])
async def get_time_entries(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all time entries"""
    try:
        entries = db.query(TimeEntry).order_by(TimeEntry.start_time.desc()).all()
        
        formatted_entries = []
        for entry in entries:
            formatted_entries.append({
                "id": entry.id,
                "job_id": entry.job_id,
                "admin_id": entry.admin_id,
                "start_time": entry.start_time.isoformat() if entry.start_time else None,
                "end_time": entry.end_time.isoformat() if entry.end_time else None,
                "duration_hours": entry.duration_hours,
                "description": entry.description,
                "billable": entry.billable,
                "hourly_rate": entry.hourly_rate,
                "amount": entry.amount,
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
                "updated_at": entry.updated_at.isoformat() if entry.updated_at else None
            })
        
        return formatted_entries
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching time entries: {str(e)}")

@router.post("/time-entries", response_model=dict)
async def create_time_entry(
    entry_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Create a new time entry"""
    try:
        entry = TimeEntry(
            job_id=entry_data["job_id"],
            admin_id=current_user["user_id"],  # Use the current admin's ID
            start_time=datetime.now(),
            duration_hours=entry_data.get("duration_hours"),
            description=entry_data["description"],
            billable=entry_data.get("billable", True),
            hourly_rate=entry_data.get("hourly_rate")
        )
        
        # Calculate amount if both duration and rate are provided
        if entry.duration_hours and entry.hourly_rate:
            entry.amount = entry.duration_hours * entry.hourly_rate
        
        db.add(entry)
        db.commit()
        db.refresh(entry)
        
        return {
            "id": entry.id,
            "job_id": entry.job_id,
            "admin_id": entry.admin_id,
            "start_time": entry.start_time.isoformat() if entry.start_time else None,
            "end_time": entry.end_time.isoformat() if entry.end_time else None,
            "duration_hours": entry.duration_hours,
            "description": entry.description,
            "billable": entry.billable,
            "hourly_rate": entry.hourly_rate,
            "amount": entry.amount,
            "created_at": entry.created_at.isoformat() if entry.created_at else None,
            "updated_at": entry.updated_at.isoformat() if entry.updated_at else None
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating time entry: {str(e)}")

