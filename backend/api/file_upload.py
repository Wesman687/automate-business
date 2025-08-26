from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from api.auth import get_current_user, get_current_admin
from database.models import FileUpload, Job, User
from config import config
import requests
import base64
import logging
import os
import hashlib
from dotenv import load_dotenv

# Import the new centralized FileService
try:
    from services.file_service import FileService, FileServiceError
    FILE_SERVICE_AVAILABLE = True
    print("✅ FileService loaded successfully")
except ImportError as e:
    print(f"❌ FileService not available: {e}, falling back to legacy implementation")
    FILE_SERVICE_AVAILABLE = False

# Import the old SDK for backward compatibility
try:
    from streamline_file_uploader import StreamlineFileUploader
    SDK_AVAILABLE = True
    print("✅ StreamlineFileUploader SDK loaded successfully")
except ImportError as e:
    print(f"❌ streamline-file-uploader SDK not available: {e}")
    SDK_AVAILABLE = False

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/file-upload")

# File server configuration (using config module for consistency)
FILE_SERVER_BASE_URL = config.UPLOAD_BASE_URL
SERVICE_TOKEN = config.AUTH_SERVICE_TOKEN

# Initialize the centralized file service
file_service = None
if FILE_SERVICE_AVAILABLE:
    try:
        file_service = FileService()
        print("✅ FileService initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize FileService: {e}")
        file_service = None

class FileServerService:
    """Legacy service for backward compatibility - will be deprecated"""
    
    @staticmethod
    async def upload_file_to_stream_line(user_email: str, file_data: bytes, filename: str, mime_type: str, folder: str = None):
        """Legacy upload method - use FileService.upload_job_file or upload_customer_file instead"""
        try:
            if not file_service:
                raise Exception("FileService not available")
            
            # Determine if this is a job file or customer file based on folder structure
            if folder and folder.startswith("documents/"):
                # Extract job_id and file_type from folder path
                parts = folder.split("/")
                if len(parts) >= 3:
                    job_id = int(parts[1])
                    file_type = parts[2] if len(parts) > 2 else "general"
                    
                    # Use the new centralized service
                    result = await file_service.upload_job_file(
                        file_content=file_data,
                        filename=filename,
                        job_id=job_id,
                        file_type=file_type,
                        user_email=user_email,
                        description=f"{file_type} file: {filename}"
                    )
                    
                    return {
                        "success": True,
                        "file_key": result.file_key,
                        "public_url": result.public_url,
                        "file_id": result.file_key
                    }
                else:
                    # General job folder
                    job_id = int(parts[1])
                    result = await file_service.upload_job_file(
                        file_content=file_data,
                        filename=filename,
                        job_id=job_id,
                        file_type="general",
                        user_email=user_email,
                        description=f"General file: {filename}"
                    )
                    
                    return {
                        "success": True,
                        "file_key": result.file_key,
                        "public_url": result.public_url,
                        "file_id": result.file_key
                    }
            else:
                # Customer dashboard file
                customer_folder = folder or "general"
                result = await file_service.upload_customer_file(
                    file_content=file_data,
                    filename=filename,
                    user_email=user_email,
                    folder=customer_folder,
                    description=f"Customer file: {filename}"
                )
                
                return {
                    "success": True,
                    "file_key": result.file_key,
                    "public_url": result.public_url,
                    "file_id": result.file_key
                }
                
        except FileServiceError as e:
            logger.error(f"FileService error: {str(e)} (Code: {e.error_code})")
            return {"success": False, "error": str(e)}
        except Exception as e:
            logger.error(f"Upload to Stream-Line failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    async def get_user_files(user_email: str, folder: str = None):
        """Legacy method - use FileService.get_customer_files instead"""
        try:
            if not file_service:
                raise Exception("FileService not available")
            
            if folder and folder.startswith("documents/"):
                # This is a job folder - extract job_id
                parts = folder.split("/")
                if len(parts) >= 2:
                    job_id = int(parts[1])
                    files = await file_service.get_job_files(job_id, user_email)
                    return {"success": True, "data": files}
            
            # Customer files
            files = await file_service.get_customer_files(user_email, folder)
            return {"success": True, "data": files}
            
        except Exception as e:
            logger.error(f"Error getting user files: {str(e)}")
            return {"success": False, "error": str(e)}

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    upload_type: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    job_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload a file to the Stream-Line file server using centralized FileService"""
    try:
        logger.info(f"📁 File upload request: {file.filename}, type: {upload_type}, size: {file.size}, user: {current_user.get('email')}")
        
        # Validate file size (max 50MB)
        if file.size and file.size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size too large. Maximum size is 50MB.")
        
        # Read file data
        file_data = await file.read()
        customer_email = current_user.get('email')
        
        if not file_service:
            raise HTTPException(status_code=500, detail="File service not available")
        
        try:
            if job_id:
                # Job-specific file upload
                result = await file_service.upload_job_file(
                    file_content=file_data,
                    filename=file.filename,
                    job_id=job_id,
                    file_type=upload_type,
                    user_email=customer_email,
                    description=description
                )
                
                # Determine folder for database storage
                if upload_type in ["logo", "project", "reference"]:
                    folder = f"documents/{job_id}/{upload_type}s" if upload_type == "logo" else f"documents/{job_id}/{upload_type}"
                else:
                    folder = f"documents/{job_id}"
                    
            else:
                # Customer dashboard file upload
                result = await file_service.upload_customer_file(
                    file_content=file_data,
                    filename=file.filename,
                    user_email=customer_email,
                    folder=upload_type,
                    description=description
                )
                
                folder = f"customers/{customer_email}/{upload_type}"
            
            # Store file metadata in our database
            file_upload = FileUpload(
                user_id=current_user.get('user_id'),
                customer_id=current_user.get('user_id') if current_user.get('user_type') == 'customer' else None,
                job_id=job_id,
                file_key=result["file_key"],
                filename=result["file_key"].split('_', 1)[1] if '_' in result["file_key"] else result["file_key"],
                original_filename=file.filename,
                file_size=len(file_data),
                mime_type=file.content_type or "application/octet-stream",
                upload_type=upload_type,
                description=description,
                tags=tags,
                file_server_url=result["public_url"],
                folder=folder,
                access_email=customer_email
            )
            
            db.add(file_upload)
            db.commit()
            db.refresh(file_upload)
            
            return {
                "message": "File uploaded successfully",
                "file_id": file_upload.id,
                "filename": file_upload.filename,
                "file_url": file_upload.file_server_url,
                "upload_type": file_upload.upload_type,
                "public_url": result["public_url"]
            }
            
        except FileServiceError as e:
            logger.error(f"FileService error: {e.message} (Code: {e.error_code})")
            raise HTTPException(status_code=500, detail=f"File service error: {e.message}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/files")
async def get_user_files(
    upload_type: Optional[str] = None,
    folder: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get files for the current user using centralized FileService"""
    try:
        user_id = str(current_user.get('user_id'))
        
        # Get files from our database first
        query = db.query(FileUpload).filter(
            FileUpload.is_active == True,
            FileUpload.is_deleted == False
        )
        
        if current_user.get('user_type') == 'admin':
            query = query.filter(FileUpload.user_id == current_user.get('user_id'))
        else:
            query = query.filter(FileUpload.customer_id == current_user.get('user_id'))
        
        if upload_type:
            query = query.filter(FileUpload.upload_type == upload_type)
        
        if folder:
            query = query.filter(FileUpload.folder == folder)
        
        db_files = query.order_by(FileUpload.uploaded_at.desc()).all()
        
        # Also get files from file server using centralized service
        file_server_status = "success"
        file_server_error = None
        
        if file_service:
            try:
                customer_email = current_user.get('email')
                if folder and folder.startswith("documents/"):
                    # Job folder - extract job_id
                    parts = folder.split("/")
                    if len(parts) >= 2:
                        job_id = int(parts[1])
                        file_type = parts[2] if len(parts) > 2 else None
                        server_files = await file_service.get_job_files(job_id, customer_email, file_type)
                else:
                    # Customer folder
                    server_files = await file_service.get_customer_files(customer_email, folder)
                
                logger.info(f"✅ Retrieved {len(server_files)} files from file server")
                
            except FileServiceError as e:
                file_server_status = "error"
                file_server_error = e.message
                logger.warning(f"File service error: {e.message}")
            except Exception as e:
                file_server_status = "error"
                file_server_error = str(e)
                logger.error(f"Unexpected error getting server files: {e}")
        else:
            file_server_status = "error"
            file_server_error = "File service not available"
        
        return {
            "files": [
                {
                    "id": f.id,
                    "filename": f.filename,
                    "original_filename": f.original_filename,
                    "file_size": f.file_size,
                    "mime_type": f.mime_type,
                    "upload_type": f.upload_type,
                    "description": f.description,
                    "tags": f.tags,
                    "uploaded_at": f.uploaded_at.isoformat(),
                    "file_url": f.file_server_url,
                    "folder": f.folder
                }
                for f in db_files
            ],
            "file_server_status": file_server_status,
            "file_server_error": file_server_error
        }
        
    except Exception as e:
        logger.error(f"Error getting user files: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/files/{file_id}")
async def get_file_info(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get information about a specific file"""
    try:
        file_upload = db.query(FileUpload).filter(
            FileUpload.id == file_id,
            FileUpload.is_active == True,
            FileUpload.is_deleted == False
        ).first()
        
        if not file_upload:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Check if user has access to this file
        if (file_upload.user_id != current_user.get('user_id') and 
            file_upload.customer_id != current_user.get('user_id') and
            current_user.get('user_type') != 'admin'):
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "id": file_upload.id,
            "filename": file_upload.filename,
            "original_filename": file_upload.original_filename,
            "file_size": file_upload.file_size,
            "mime_type": file_upload.mime_type,
            "upload_type": file_upload.upload_type,
            "description": file_upload.description,
            "tags": file_upload.tags,
            "uploaded_at": file_upload.uploaded_at.isoformat(),
            "file_url": file_upload.file_server_url,
            "folder": file_upload.folder,
            "public_url": file_upload.file_server_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting file info: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/files/{file_id}")
async def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a file using centralized FileService"""
    try:
        file_upload = db.query(FileUpload).filter(
            FileUpload.id == file_id,
            FileUpload.is_active == True,
            FileUpload.is_deleted == False
        ).first()
        
        if not file_upload:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Check if user has access to this file
        if (file_upload.user_id != current_user.get('user_id') and 
            file_upload.customer_id != current_user.get('user_id') and
            current_user.get('user_type') != 'admin'):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Delete from file server using centralized service
        if file_service and file_upload.file_key:
            try:
                await file_service.delete_file(
                    file_key=file_upload.file_key,
                    user_email=current_user.get('email')
                )
                logger.info(f"✅ File deleted from server: {file_upload.file_key}")
            except FileServiceError as e:
                logger.warning(f"⚠️ Could not delete from file server: {e.message}")
            except Exception as e:
                logger.warning(f"⚠️ Unexpected error deleting from file server: {e}")
        
        # Mark as deleted (soft delete)
        file_upload.is_deleted = True
        db.commit()
        
        return {"message": "File deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/customer/upload")
async def customer_upload_file(
    file: UploadFile = File(...),
    upload_type: str = Form(...),
    description: Optional[str] = Form(None),
    job_id: Optional[int] = Form(None),
    folder: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Customer-specific file upload using centralized FileService"""
    try:
        # Validate file size (max 50MB)
        if file.size and file.size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size too large. Maximum size is 50MB.")
        
        # Read file data
        file_data = await file.read()
        customer_email = current_user.get('email')
        
        if not file_service:
            raise HTTPException(status_code=500, detail="File service not available")
        
        try:
            if job_id:
                # Job-specific file upload
                result = await file_service.upload_job_file(
                    file_content=file_data,
                    filename=file.filename,
                    job_id=job_id,
                    file_type=upload_type,
                    user_email=customer_email,
                    description=description or f"{upload_type} file for job: {job_id}"
                )
                
                # Determine folder for database storage
                if upload_type in ["logo", "project", "reference"]:
                    folder = f"documents/{job_id}/{upload_type}s" if upload_type == "logo" else f"documents/{job_id}/{upload_type}"
                else:
                    folder = f"documents/{job_id}"
            else:
                # Customer dashboard file upload
                result = await file_service.upload_customer_file(
                    file_content=file_data,
                    filename=file.filename,
                    user_email=customer_email,
                    folder=upload_type or "general",
                    description=description or f"Customer file: {file.filename}"
                )
                
                folder = f"customers/{customer_email}/{upload_type or 'general'}"
            
            logger.info(f"📁 File uploaded successfully to: {folder}")
            
            # Store file metadata in our database
            file_upload = FileUpload(
                user_id=current_user.get('user_id'),
                customer_id=current_user.get('user_id'),
                job_id=job_id,
                file_key=result["file_key"],
                filename=result["file_key"].split('_', 1)[1] if '_' in result["file_key"] else result["file_key"],
                original_filename=file.filename,
                file_size=len(file_data),
                mime_type=file.content_type or "application/octet-stream",
                upload_type=upload_type,
                description=description,
                tags=f"customer,{upload_type}",
                file_server_url=result["public_url"],
                folder=folder,
                access_email=customer_email
            )
            
            db.add(file_upload)
            db.commit()
            db.refresh(file_upload)
            
            return {
                "message": "File uploaded successfully",
                "file_id": file_upload.id,
                "filename": file_upload.filename,
                "file_url": file_upload.file_server_url,
                "upload_type": file_upload.upload_type,
                "public_url": result["public_url"],
                "folder": folder
            }
            
        except FileServiceError as e:
            logger.error(f"FileService error: {e.message} (Code: {e.error_code})")
            raise HTTPException(status_code=500, detail=f"File service error: {e.message}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading customer file: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/customer/job/{job_id}/files")
async def get_customer_job_files(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all files for a specific job using centralized FileService"""
    try:
        if not file_service:
            raise HTTPException(status_code=500, detail="File service not available")
        
        customer_email = current_user.get('email')
        
        try:
            # Use centralized service to get job files
            all_files = await file_service.get_job_files(job_id, customer_email)
            
            logger.info(f"✅ Retrieved {len(all_files)} files for job {job_id}")
            
            return {
                "files": all_files,
                "file_server_status": "success",
                "file_server_error": None,
                "job_id": job_id,
                "folder": f"documents/{job_id}"
            }
            
        except FileServiceError as e:
            logger.error(f"FileService error: {e.message} (Code: {e.error_code})")
            return {
                "files": [],
                "file_server_status": "error",
                "file_server_error": e.message,
                "job_id": job_id,
                "folder": f"documents/{job_id}"
            }
            
    except Exception as e:
        logger.error(f"Error getting customer job files: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/customer/job/{job_id}")
async def update_customer_job(
    job_id: int,
    job_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update job information for the current customer"""
    try:
        # Verify the job belongs to the current customer
        job = db.query(Job).filter(
            Job.id == job_id,
            Job.customer_id == current_user.get('user_id')
        ).first()
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found or access denied")
        
        # Separate business/branding fields (go to User model) from job fields
        business_fields = [
            'business_name', 'business_type', 'industry', 'industry_other',
            'brand_colors', 'brand_color_tags', 'brand_color_tag_others', 'brand_style', 'brand_style_other', 'brand_guidelines',
            'website_url', 'github_url', 'portfolio_url', 'social_media'
        ]
        
        job_fields = [
            'title', 'description', 'notes', 'additional_resource_info',
            'google_drive_links', 'github_repositories', 'workspace_links', 'additional_tools', 'server_details'
        ]
        
        # Update business/branding fields in User model (customer profile)
        customer = db.query(User).filter(User.id == current_user.get('user_id')).first()
        if customer:
            for field, value in job_data.items():
                if field in business_fields and hasattr(customer, field):
                    setattr(customer, field, value)
        
        # Update job fields in Job model
        for field, value in job_data.items():
            if field in job_fields and hasattr(job, field):
                setattr(job, field, value)
        
        db.commit()
        db.refresh(job)
        
        # Commit all changes
        db.commit()
        db.refresh(job)
        if customer:
            db.refresh(customer)
        
        return {
            "message": "Job and customer profile updated successfully",
            "job": {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "notes": job.notes,
                "additional_resource_info": job.additional_resource_info,
                "google_drive_links": job.google_drive_links,
                "github_repositories": job.github_repositories,
                "workspace_links": job.workspace_links,
                "additional_tools": job.additional_tools,
                "server_details": job.server_details
            },
            "customer_profile": {
                "business_name": customer.business_name if customer else None,
                "business_type": customer.business_type if customer else None,
                "industry": customer.industry if customer else None,
                "industry_other": customer.industry_other if customer else None,
                "brand_colors": customer.brand_colors if customer else None,
                "brand_color_tags": customer.brand_color_tags if customer else None,
                "brand_color_tag_others": customer.brand_color_tag_others if customer else None,
                "brand_style": customer.brand_style if customer else None,
                "brand_style_other": customer.brand_style_other if customer else None,
                "brand_guidelines": customer.brand_guidelines if customer else None,
                "website_url": customer.website_url if customer else None,
                "github_url": customer.github_url if customer else None,
                "portfolio_url": customer.portfolio_url if customer else None,
                "social_media": customer.social_media if customer else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating customer job: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Admin endpoints
@router.get("/admin/files")
async def get_all_files(
    upload_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all files (admin only)"""
    try:
        # Get all active files from our database
        query = db.query(FileUpload).filter(
            FileUpload.is_active == True,
            FileUpload.is_deleted == False
        )
        
        if upload_type:
            query = query.filter(FileUpload.upload_type == upload_type)
        
        files = query.order_by(FileUpload.uploaded_at.desc()).all()
        
        return {
            "files": [
                {
                    "id": f.id,
                    "filename": f.filename,
                    "original_filename": f.original_filename,
                    "file_size": f.file_size,
                    "mime_type": f.mime_type,
                    "upload_type": f.upload_type,
                    "description": f.description,
                    "tags": f.tags,
                    "uploaded_at": f.uploaded_at.isoformat(),
                    "file_url": f.file_server_url,
                    "folder": f.folder,
                    "user_id": f.user_id,
                    "customer_id": f.customer_id,
                    "job_id": f.job_id
                }
                for f in files
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting all files: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# New endpoints using centralized FileService
@router.get("/search")
async def search_files(
    q: str,
    folder: Optional[str] = None,
    file_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Search for files using centralized FileService"""
    try:
        if not file_service:
            raise HTTPException(status_code=500, detail="File service not available")
        
        customer_email = current_user.get('email')
        
        results = await file_service.search_files(
            user_email=customer_email,
            query=q,
            folder=folder,
            file_type=file_type
        )
        
        return {
            "results": results,
            "query": q,
            "folder": folder,
            "total_count": len(results)
        }
        
    except FileServiceError as e:
        logger.error(f"FileService search error: {e.message}")
        raise HTTPException(status_code=500, detail=f"Search failed: {e.message}")
    except Exception as e:
        logger.error(f"Error searching files: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/folders")
async def list_folders(
    base_path: Optional[str] = "",
    current_user: dict = Depends(get_current_user)
):
    """List folders for Windows Explorer-style navigation"""
    try:
        if not file_service:
            raise HTTPException(status_code=500, detail="File service not available")
        
        customer_email = current_user.get('email')
        
        folders = await file_service.list_folders(
            user_email=customer_email,
            base_path=base_path
        )
        
        return {
            "folders": folders,
            "base_path": base_path,
            "total_count": len(folders)
        }
        
    except FileServiceError as e:
        logger.error(f"FileService folder list error: {e.message}")
        raise HTTPException(status_code=500, detail=f"Folder listing failed: {e.message}")
    except Exception as e:
        logger.error(f"Error listing folders: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
