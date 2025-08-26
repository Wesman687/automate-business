from fastapi import HTTPException
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel
from datetime import datetime
import traceback

# Standard API Response Models
class APIResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    errors: Optional[List[str]] = None
    warnings: Optional[List[str]] = None
    meta: Optional[Dict[str, Any]] = None
    timestamp: datetime = datetime.now()

class PaginatedResponse(BaseModel):
    """Standard paginated response wrapper"""
    success: bool
    data: List[Any]
    pagination: Dict[str, Any]
    message: Optional[str] = None
    timestamp: datetime = datetime.now()

class ErrorResponse(BaseModel):
    """Standard error response wrapper"""
    success: bool = False
    error: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = datetime.now()

# Standard Response Functions
def success_response(
    data: Any = None,
    message: str = "Operation completed successfully",
    meta: Optional[Dict[str, Any]] = None
) -> APIResponse:
    """Create a standardized success response"""
    return APIResponse(
        success=True,
        data=data,
        message=message,
        meta=meta
    )

def error_response(
    error: str,
    error_code: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    status_code: int = 400
) -> ErrorResponse:
    """Create a standardized error response"""
    return ErrorResponse(
        error=error,
        error_code=error_code,
        details=details
    )

def paginated_response(
    data: List[Any],
    page: int,
    page_size: int,
    total: int,
    message: Optional[str] = None
) -> PaginatedResponse:
    """Create a standardized paginated response"""
    total_pages = (total + page_size - 1) // page_size
    
    pagination = {
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1
    }
    
    return PaginatedResponse(
        success=True,
        data=data,
        pagination=pagination,
        message=message
    )

# Standard Error Handling
class APIError(HTTPException):
    """Custom API error with standardized format"""
    def __init__(
        self,
        status_code: int,
        error: str,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=error)
        self.error_code = error_code
        self.details = details

def handle_api_error(
    error: Exception,
    default_message: str = "An unexpected error occurred",
    log_error: bool = True
) -> ErrorResponse:
    """Handle and standardize API errors"""
    if isinstance(error, APIError):
        return error_response(
            error=str(error.detail),
            error_code=error.error_code,
            details=error.details
        )
    
    if isinstance(error, HTTPException):
        return error_response(
            error=str(error.detail),
            error_code=f"HTTP_{error.status_code}"
        )
    
    # Log unexpected errors
    if log_error:
        print(f"Unexpected error: {str(error)}")
        print(f"Traceback: {traceback.format_exc()}")
    
    return error_response(
        error=default_message,
        error_code="INTERNAL_ERROR"
    )

# Standard Query Parameters
class PaginationParams(BaseModel):
    """Standard pagination parameters"""
    page: int = 1
    page_size: int = 20
    max_page_size: int = 100

class FilterParams(BaseModel):
    """Standard filter parameters"""
    search: Optional[str] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"  # asc or desc

class JobFilterParams(FilterParams):
    """Job-specific filter parameters"""
    customer_id: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None

# Standard Validation Functions
def validate_pagination(page: int, page_size: int, max_page_size: int = 100) -> tuple[int, int]:
    """Validate and normalize pagination parameters"""
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 20
    if page_size > max_page_size:
        page_size = max_page_size
    
    return page, page_size

def validate_sort_params(sort_by: Optional[str], allowed_fields: List[str]) -> tuple[str, str]:
    """Validate and normalize sorting parameters"""
    if sort_by not in allowed_fields:
        sort_by = "created_at"
    
    return sort_by, "desc"

# Standard Database Query Helpers
def apply_pagination(query, page: int, page_size: int):
    """Apply pagination to a database query"""
    offset = (page - 1) * page_size
    return query.offset(offset).limit(page_size)

def apply_sorting(query, sort_by: str, sort_order: str, allowed_fields: List[str]):
    """Apply sorting to a database query"""
    if sort_by in allowed_fields:
        sort_column = getattr(query.column_descriptions[0]['type'], sort_by)
        if sort_order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    return query

def apply_filters(query, filters: Dict[str, Any]):
    """Apply filters to a database query"""
    for field, value in filters.items():
        if value is not None:
            if hasattr(query.column_descriptions[0]['type'], field):
                query = query.filter(getattr(query.column_descriptions[0]['type'], field) == value)
    return query

# Standard Response Headers
def get_standard_headers() -> Dict[str, str]:
    """Get standard response headers"""
    return {
        "X-API-Version": "1.0",
        "X-Response-Time": str(datetime.now().timestamp()),
        "Cache-Control": "no-cache, no-store, must-revalidate"
    }

# Standard Success Messages
SUCCESS_MESSAGES = {
    "job_created": "Job created successfully",
    "job_updated": "Job updated successfully",
    "job_deleted": "Job deleted successfully",
    "job_retrieved": "Job retrieved successfully",
    "jobs_retrieved": "Jobs retrieved successfully",
    "milestone_created": "Milestone created successfully",
    "milestone_updated": "Milestone updated successfully",
    "deliverable_created": "Deliverable created successfully",
    "deliverable_updated": "Deliverable updated successfully"
}

# Standard Error Messages
ERROR_MESSAGES = {
    "job_not_found": "Job not found",
    "job_already_exists": "Job with this title already exists",
    "invalid_job_data": "Invalid job data provided",
    "unauthorized": "Unauthorized access",
    "forbidden": "Access forbidden",
    "validation_error": "Validation error",
    "internal_error": "Internal server error",
    "database_error": "Database operation failed"
}

# Standard Error Codes
ERROR_CODES = {
    "VALIDATION_ERROR": "VALIDATION_ERROR",
    "NOT_FOUND": "NOT_FOUND",
    "UNAUTHORIZED": "UNAUTHORIZED",
    "FORBIDDEN": "FORBIDDEN",
    "CONFLICT": "CONFLICT",
    "INTERNAL_ERROR": "INTERNAL_ERROR",
    "DATABASE_ERROR": "DATABASE_ERROR"
}
