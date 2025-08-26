from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from sqlalchemy import or_

from database import get_db
from database.models import Job, TimeEntry
from schemas.jobs import Job as JobSchema, JobCreate, JobUpdate
from api.auth import get_current_admin, get_current_user
from api.common import (
    success_response, 
    error_response, 
    paginated_response,
    APIError, 
    ERROR_MESSAGES, 
    ERROR_CODES,
    SUCCESS_MESSAGES,
    validate_pagination,
    get_standard_headers,
    serialize_job,
    serialize_time_entry
)

router = APIRouter()

# Test endpoint for debugging
@router.get("/jobs/test")
def test_jobs_endpoint():
    """Simple test endpoint to verify jobs API is working"""
    return {"message": "Jobs API is working", "status": "success"}

# Job Endpoints


@router.get("/jobs")
def get_jobs(
    response: Response,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    status: Optional[str] = Query(None, description="Filter by job status"),
    priority: Optional[str] = Query(None, description="Filter by job priority"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc/desc)"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all jobs with advanced filtering, pagination, and sorting (Admin only)"""
    try:
        # Validate pagination parameters
        page, page_size = validate_pagination(page, page_size)
        
        # Validate sort parameters
        if sort_by not in ["id", "title", "status", "priority", "created_at", "start_date", "deadline"]:
            sort_by = "created_at"
        if sort_order.lower() not in ["asc", "desc"]:
            sort_order = "desc"
        
        # Build base query
        query = db.query(Job)
        
        # Apply filters directly
        if customer_id:
            query = query.filter(Job.customer_id == customer_id)
        if status:
            query = query.filter(Job.status == status)
        if priority:
            query = query.filter(Job.priority == priority)
        
        # Apply date filters
        if start_date:
            query = query.filter(Job.start_date >= start_date)
        if end_date:
            query = query.filter(Job.deadline <= end_date)
        
        # Apply search filter
        if search:
            search_filter = or_(
                Job.title.ilike(f"%{search}%"),
                Job.description.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Get total count for pagination
        total = query.count()
        
        # Apply sorting directly
        if sort_by == "id":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.id.desc())
            else:
                query = query.order_by(Job.id.asc())
        elif sort_by == "title":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.title.desc())
            else:
                query = query.order_by(Job.title.asc())
        elif sort_by == "status":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.status.desc())
            else:
                query = query.order_by(Job.status.asc())
        elif sort_by == "priority":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.priority.desc())
            else:
                query = query.order_by(Job.priority.asc())
        elif sort_by == "start_date":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.start_date.desc())
            else:
                query = query.order_by(Job.start_date.asc())
        elif sort_by == "deadline":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.deadline.desc())
            else:
                query = query.order_by(Job.deadline.asc())
        else:  # default to created_at
            if sort_order.lower() == "desc":
                query = query.order_by(Job.created_at.desc())
            else:
                query = query.order_by(Job.created_at.asc())
        
        # Apply pagination directly
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        # Execute query
        jobs = query.all()
        print(f"Found {len(jobs)} jobs")
        
        # Convert SQLAlchemy models to dictionaries
        try:
            jobs_data = [serialize_job(job) for job in jobs]
            print(f"Successfully serialized {len(jobs_data)} jobs")
        except Exception as serialize_error:
            print(f"Error serializing jobs: {str(serialize_error)}")
            import traceback
            traceback.print_exc()
            raise serialize_error
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        # Return paginated response
        return paginated_response(
            data=jobs_data,
            page=page,
            page_size=page_size,
            total=total,
            message=SUCCESS_MESSAGES["jobs_retrieved"]
        )
        
    except Exception as e:
        print(f"Error in get_jobs: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise APIError(
            status_code=500,
            error=f"Internal error: {str(e)}",
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )

@router.get("/jobs/customer")
def get_customer_jobs(
    response: Response,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by job status"),
    priority: Optional[str] = Query(None, description="Filter by job priority"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc/desc)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get jobs for the current customer with filtering, pagination, and sorting"""
    try:
        if not current_user:
            raise APIError(
                status_code=401,
                error=ERROR_MESSAGES["unauthorized"],
                error_code=ERROR_CODES["UNAUTHORIZED"]
            )
        
        # Validate pagination parameters
        page, page_size = validate_pagination(page, page_size)
        
        # Validate sort parameters
        if sort_by not in ["id", "title", "status", "priority", "created_at", "start_date", "deadline"]:
            sort_by = "created_at"
        if sort_order.lower() not in ["asc", "desc"]:
            sort_order = "desc"
        
        # Build base query for current customer
        query = db.query(Job).filter(Job.customer_id == current_user.get('user_id'))
        
        # Apply filters directly
        if status:
            query = query.filter(Job.status == status)
        if priority:
            query = query.filter(Job.priority == priority)
        
        # Apply search filter
        if search:
            search_filter = or_(
                Job.title.ilike(f"%{search}%"),
                Job.description.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Get total count for pagination
        total = query.count()
        
        # Apply sorting directly
        if sort_by == "id":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.id.desc())
            else:
                query = query.order_by(Job.id.asc())
        elif sort_by == "title":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.title.desc())
            else:
                query = query.order_by(Job.title.asc())
        elif sort_by == "status":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.status.desc())
            else:
                query = query.order_by(Job.status.asc())
        elif sort_by == "priority":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.priority.desc())
            else:
                query = query.order_by(Job.priority.asc())
        elif sort_by == "start_date":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.start_date.desc())
            else:
                query = query.order_by(Job.start_date.asc())
        elif sort_by == "deadline":
            if sort_order.lower() == "desc":
                query = query.order_by(Job.deadline.desc())
            else:
                query = query.order_by(Job.deadline.asc())
        else:  # default to created_at
            if sort_order.lower() == "desc":
                query = query.order_by(Job.created_at.desc())
            else:
                query = query.order_by(Job.created_at.asc())
        
        # Apply pagination directly
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        # Execute query
        jobs = query.all()
        
        # Convert SQLAlchemy models to dictionaries
        jobs_data = [serialize_job(job) for job in jobs]
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        # Return paginated response
        return paginated_response(
            data=jobs_data,
            page=page,
            page_size=page_size,
            total=total,
            message="Customer jobs retrieved successfully"
        )
        
    except APIError:
        raise
    except Exception as e:
        raise APIError(
            status_code=500,
            error=ERROR_MESSAGES["internal_error"],
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )


@router.get("/jobs/{job_id}")
def get_job(
    job_id: int,
    response: Response,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get a specific job by ID"""
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise APIError(
                status_code=404,
                error=ERROR_MESSAGES["job_not_found"],
                error_code=ERROR_CODES["NOT_FOUND"]
            )
        
        # Convert SQLAlchemy model to dictionary
        job_dict = serialize_job(job)
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        return success_response(
            data=job_dict,
            message=SUCCESS_MESSAGES["job_retrieved"]
        )
        
    except APIError:
        raise
    except Exception as e:
        raise APIError(
            status_code=500,
            error=ERROR_MESSAGES["internal_error"],
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )


@router.post("/jobs")
def create_job(
    job: JobCreate,
    response: Response,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Create a new job"""
    try:
        # Check if job with same title already exists for the customer
        existing_job = db.query(Job).filter(
            Job.title == job.title,
            Job.customer_id == job.customer_id
        ).first()
        
        if existing_job:
            raise APIError(
                status_code=409,
                error=ERROR_MESSAGES["job_already_exists"],
                error_code=ERROR_CODES["CONFLICT"]
            )
        
        # Prepare job data
        job_data = job.dict()
        job_data['created_at'] = datetime.now()
        job_data['progress_percentage'] = 0
        job_data['status'] = job_data.get('status', 'pending')
        
        # Create and save job
        db_job = Job(**job_data)
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        
        # Convert SQLAlchemy model to dictionary
        job_dict = serialize_job(db_job)
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        return success_response(
            data=job_dict,
            message=SUCCESS_MESSAGES["job_created"]
        )
        
    except APIError:
        raise
    except Exception as e:
        db.rollback()
        raise APIError(
            status_code=500,
            error=ERROR_MESSAGES["internal_error"],
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )


@router.put("/jobs/{job_id}")
def update_job(
    job_id: int,
    job_update: JobUpdate,
    response: Response,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Update a job by ID"""
    try:
        # Find the job
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise APIError(
                status_code=404,
                error=ERROR_MESSAGES["job_not_found"],
                error_code=ERROR_CODES["NOT_FOUND"]
            )
        
        # Prepare update data
        update_data = job_update.dict(exclude_unset=True)
        update_data['updated_at'] = datetime.now()
        
        # Auto-calculate actual hours from time entries if not provided
        if 'actual_hours' not in update_data:
            time_entries = db.query(TimeEntry).filter(TimeEntry.job_id == job_id).all()
            total_hours = sum(entry.duration_hours or 0 for entry in time_entries)
            update_data['actual_hours'] = total_hours
        
        # Update job fields
        for field, value in update_data.items():
            setattr(job, field, value)
        
        # Save changes
        db.commit()
        db.refresh(job)
        
        # Convert SQLAlchemy model to dictionary
        job_dict = serialize_job(job)
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        return success_response(
            data=job_dict,
            message=SUCCESS_MESSAGES["job_updated"]
        )
        
    except APIError:
        raise
    except Exception as e:
        db.rollback()
        raise APIError(
            status_code=500,
            error=ERROR_MESSAGES["internal_error"],
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )


@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    response: Response,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Delete a job by ID"""
    try:
        # Find the job
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise APIError(
                status_code=404,
                error=ERROR_MESSAGES["job_not_found"],
                error_code=ERROR_CODES["NOT_FOUND"]
            )
        
        # Delete the job
        db.delete(job)
        db.commit()
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        return success_response(
            message=SUCCESS_MESSAGES["job_deleted"]
        )
        
    except APIError:
        raise
    except Exception as e:
        db.rollback()
        raise APIError(
            status_code=500,
            error=ERROR_MESSAGES["internal_error"],
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )


@router.get("/jobs/{job_id}/time-entries")
def get_job_time_entries(
    job_id: int,
    response: Response,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all time entries for a specific job with pagination"""
    try:
        # Verify job exists
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise APIError(
                status_code=404,
                error=ERROR_MESSAGES["job_not_found"],
                error_code=ERROR_CODES["NOT_FOUND"]
            )
        
        # Validate pagination parameters
        page, page_size = validate_pagination(page, page_size)
        
        # Build query for time entries
        query = db.query(TimeEntry).filter(TimeEntry.job_id == job_id)
        
        # Get total count for pagination
        total = query.count()
        
        # Apply pagination directly
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        # Execute query
        time_entries = query.all()
        
        # Convert SQLAlchemy models to dictionaries
        time_entries_data = [serialize_time_entry(entry) for entry in time_entries]
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        return paginated_response(
            data=time_entries_data,
            page=page,
            page_size=page_size,
            total=total,
            message=f"Time entries retrieved for job {job_id}"
        )
        
    except APIError:
        raise
    except Exception as e:
        raise APIError(
            status_code=500,
            error=ERROR_MESSAGES["internal_error"],
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )

# Job Milestones Endpoints
@router.post("/jobs/{job_id}/milestones")
def create_job_milestone(
    job_id: int,
    milestone: dict,
    response: Response,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Create a new milestone for a job"""
    try:
        # Verify job exists
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise APIError(
                status_code=404,
                error=ERROR_MESSAGES["job_not_found"],
                error_code=ERROR_CODES["NOT_FOUND"]
            )
        
        # Add milestone to job
        if not job.milestones:
            job.milestones = []
        
        milestone_data = {
            "id": len(job.milestones) + 1,
            "name": milestone.get("name"),
            "description": milestone.get("description"),
            "due_date": milestone.get("due_date"),
            "completed": milestone.get("completed", False),
            "created_at": datetime.now()
        }
        
        job.milestones.append(milestone_data)
        db.commit()
        db.refresh(job)
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        return success_response(
            data=milestone_data,
            message=SUCCESS_MESSAGES["milestone_created"]
        )
        
    except APIError:
        raise
    except Exception as e:
        db.rollback()
        raise APIError(
            status_code=500,
            error=ERROR_MESSAGES["internal_error"],
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )

@router.put("/jobs/{job_id}/milestones/{milestone_id}")
def update_job_milestone(
    job_id: int,
    milestone_id: int,
    milestone_update: dict,
    response: Response,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Update a milestone for a job"""
    try:
        # Verify job exists
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise APIError(
                status_code=404,
                error=ERROR_MESSAGES["job_not_found"],
                error_code=ERROR_CODES["NOT_FOUND"]
            )
        
        # Find milestone
        if not job.milestones or milestone_id > len(job.milestones):
            raise APIError(
                status_code=404,
                error="Milestone not found",
                error_code=ERROR_CODES["NOT_FOUND"]
            )
        
        milestone = job.milestones[milestone_id - 1]
        milestone.update(milestone_update)
        milestone["updated_at"] = datetime.now()
        
        db.commit()
        db.refresh(job)
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        return success_response(
            data=milestone,
            message=SUCCESS_MESSAGES["milestone_updated"]
        )
        
    except APIError:
        raise
    except Exception as e:
        db.rollback()
        raise APIError(
            status_code=500,
            error=ERROR_MESSAGES["internal_error"],
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )

# Job Deliverables Endpoints
@router.post("/jobs/{job_id}/deliverables")
def create_job_deliverable(
    job_id: int,
    deliverable: dict,
    response: Response,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Create a new deliverable for a job"""
    try:
        # Verify job exists
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise APIError(
                status_code=404,
                error=ERROR_MESSAGES["job_not_found"],
                error_code=ERROR_CODES["NOT_FOUND"]
            )
        
        # Add deliverable to job
        if not job.deliverables:
            job.deliverables = []
        
        deliverable_data = {
            "id": len(job.deliverables) + 1,
            "name": deliverable.get("name"),
            "description": deliverable.get("description"),
            "date": deliverable.get("date"),
            "delivered": deliverable.get("delivered", False),
            "created_at": datetime.now()
        }
        
        job.deliverables.append(deliverable_data)
        db.commit()
        db.refresh(job)
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        return success_response(
            data=deliverable_data,
            message=SUCCESS_MESSAGES["deliverable_created"]
        )
        
    except APIError:
        raise
    except Exception as e:
        db.rollback()
        raise APIError(
            status_code=500,
            error=ERROR_MESSAGES["internal_error"],
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )

@router.put("/jobs/{job_id}/deliverables/{deliverable_id}")
def update_job_deliverable(
    job_id: int,
    deliverable_id: int,
    deliverable_update: dict,
    response: Response,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Update a deliverable for a job"""
    try:
        # Verify job exists
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise APIError(
                status_code=404,
                error=ERROR_MESSAGES["job_not_found"],
                error_code=ERROR_CODES["NOT_FOUND"]
            )
        
        # Find deliverable
        if not job.deliverables or deliverable_id > len(job.deliverables):
            raise APIError(
                status_code=404,
                error="Deliverable not found",
                error_code=ERROR_CODES["NOT_FOUND"]
            )
        
        deliverable = job.deliverables[deliverable_id - 1]
        deliverable.update(deliverable_update)
        deliverable["updated_at"] = datetime.now()
        
        db.commit()
        db.refresh(job)
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        return success_response(
            data=deliverable,
            message=SUCCESS_MESSAGES["deliverable_updated"]
        )
        
    except APIError:
        raise
    except Exception as e:
        db.rollback()
        raise APIError(
            status_code=500,
            error=ERROR_MESSAGES["internal_error"],
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )

# Job Statistics Endpoint
@router.get("/jobs/statistics")
def get_job_statistics(
    response: Response,
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    period: Optional[str] = Query("30", description="Period in days (7, 30, 90, 365)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get job statistics and analytics"""
    try:
        from datetime import timedelta
        
        # Calculate date range
        end_date = datetime.now()
        days = int(period)
        start_date = end_date - timedelta(days=days)
        
        # Build base query
        query = db.query(Job).filter(Job.created_at >= start_date)
        
        if customer_id:
            query = query.filter(Job.customer_id == customer_id)
        
        # Get all jobs in period
        jobs = query.all()
        
        # Calculate statistics
        total_jobs = len(jobs)
        completed_jobs = len([j for j in jobs if j.status == "completed"])
        in_progress_jobs = len([j for j in jobs if j.status == "in_progress"])
        pending_jobs = len([j for j in jobs if j.status == "pending"])
        
        # Calculate financial statistics
        total_estimated_hours = sum(j.estimated_hours or 0 for j in jobs)
        total_actual_hours = sum(j.actual_hours or 0 for j in jobs)
        total_fixed_price = sum(j.fixed_price or 0 for j in jobs)
        
        # Calculate priority distribution
        priority_stats = {}
        for job in jobs:
            priority = job.priority or "medium"
            priority_stats[priority] = priority_stats.get(priority, 0) + 1
        
        # Calculate industry distribution
        industry_stats = {}
        for job in jobs:
            industry = job.industry or "Unknown"
            industry_stats[industry] = industry_stats.get(industry, 0) + 1
        
        statistics = {
            "period_days": days,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "job_counts": {
                "total": total_jobs,
                "completed": completed_jobs,
                "in_progress": in_progress_jobs,
                "pending": pending_jobs
            },
            "completion_rate": (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0,
            "financial": {
                "total_estimated_hours": total_estimated_hours,
                "total_actual_hours": total_actual_hours,
                "total_fixed_price": total_fixed_price,
                "hours_variance": total_actual_hours - total_estimated_hours
            },
            "priority_distribution": priority_stats,
            "industry_distribution": industry_stats
        }
        
        # Add standard headers
        response.headers.update(get_standard_headers())
        
        return success_response(
            data=statistics,
            message="Job statistics retrieved successfully"
        )
        
    except APIError:
        raise
    except Exception as e:
        raise APIError(
            status_code=500,
            error=ERROR_MESSAGES["internal_error"],
            error_code=ERROR_CODES["INTERNAL_ERROR"]
        )
