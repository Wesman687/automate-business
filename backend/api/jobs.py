from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from database.models import Job, TimeEntry
from schemas.jobs import Job as JobSchema, JobCreate, JobUpdate
from api.auth import get_current_admin

router = APIRouter(prefix="/api", tags=["jobs"])

# Job Endpoints


@router.get("/jobs", response_model=List[JobSchema])
def get_jobs(
    customer_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all jobs with optional filtering"""
    query = db.query(Job)
    
    if customer_id:
        query = query.filter(Job.customer_id == customer_id)
    if status:
        query = query.filter(Job.status == status)
    if priority:
        query = query.filter(Job.priority == priority)
    
    return query.order_by(Job.created_at.desc()).all()


@router.get("/jobs/{job_id}", response_model=JobSchema)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get a specific job"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/jobs", response_model=JobSchema)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Create a new job"""
    job_data = job.dict()
    job_data['created_at'] = datetime.now()
    job_data['progress_percentage'] = 0
    
    db_job = Job(**job_data)
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


@router.put("/jobs/{job_id}", response_model=JobSchema)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Update a job"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = job_update.dict(exclude_unset=True)
    update_data['updated_at'] = datetime.now()
    
    # Auto-calculate actual hours from time entries if not provided
    if 'actual_hours' not in update_data:
        time_entries = db.query(TimeEntry).filter(TimeEntry.job_id == job_id).all()
        total_hours = sum(entry.duration_hours or 0 for entry in time_entries)
        update_data['actual_hours'] = total_hours
    
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    return job


@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Delete a job"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}


@router.get("/jobs/{job_id}/time-entries")
def get_job_time_entries(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all time entries for a specific job"""
    time_entries = db.query(TimeEntry).filter(TimeEntry.job_id == job_id).all()
    return {"time_entries": time_entries}
