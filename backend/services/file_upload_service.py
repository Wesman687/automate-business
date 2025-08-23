import os
import requests
import mimetypes
from typing import Optional, Dict, Any
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from database.models import FileUpload

logger = logging.getLogger(__name__)

class FileUploadService:
    def __init__(self, db_session: Session):
        self.db_session = db_session
        self.file_server_base_url = "https://file-server.stream-lineai.com"
        self.api_key = os.getenv("FILE_SERVER_API_KEY")
        
    def upload_file(
        self,
        file_data: bytes,
        original_filename: str,
        upload_type: str,
        user_id: Optional[int] = None,
        customer_id: Optional[int] = None,
        job_id: Optional[int] = None,
        description: Optional[str] = None,
        tags: Optional[str] = None,
        access_email: Optional[str] = None
    ) -> Optional[FileUpload]:
        """
        Upload a file to the file server and save metadata to database
        """
        try:
            # Determine MIME type
            mime_type, _ = mimetypes.guess_type(original_filename)
            if not mime_type:
                mime_type = "application/octet-stream"
            
            # Prepare upload data
            files = {
                'file': (original_filename, file_data, mime_type)
            }
            
            data = {
                'type': upload_type,
                'description': description or '',
                'tags': tags or '',
                'api_key': self.api_key
            }
            
            # Upload to file server
            response = requests.post(
                f"{self.file_server_base_url}/upload",
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code != 200:
                logger.error(f"File server upload failed: {response.status_code} - {response.text}")
                return None
            
            upload_result = response.json()
            
            # Create database record
            file_upload = FileUpload(
                filename=upload_result.get('filename'),
                original_filename=original_filename,
                file_path=upload_result.get('file_path'),
                file_size=len(file_data),
                mime_type=mime_type,
                upload_type=upload_type,
                file_server_url=upload_result.get('file_url'),
                file_id=upload_result.get('file_id'),
                description=description,
                tags=tags,
                user_id=user_id,
                customer_id=customer_id,
                job_id=job_id,
                access_email=access_email or "system@stream-lineai.com"  # Default fallback
            )
            
            self.db_session.add(file_upload)
            self.db_session.commit()
            self.db_session.refresh(file_upload)
            
            logger.info(f"File uploaded successfully: {original_filename} -> {file_upload.file_server_url}")
            return file_upload
            
        except Exception as e:
            logger.error(f"Error uploading file {original_filename}: {str(e)}")
            self.db_session.rollback()
            return None
    
    def get_file_by_id(self, file_id: int) -> Optional[FileUpload]:
        """Get file upload by ID"""
        return self.db_session.query(FileUpload).filter(
            FileUpload.id == file_id,
            FileUpload.is_active == True,
            FileUpload.is_deleted == False
        ).first()
    
    def get_files_by_user(self, user_id: int, upload_type: Optional[str] = None) -> list[FileUpload]:
        """Get files uploaded by a specific user"""
        query = self.db_session.query(FileUpload).filter(
            FileUpload.user_id == user_id,
            FileUpload.is_active == True,
            FileUpload.is_deleted == False
        )
        
        if upload_type:
            query = query.filter(FileUpload.upload_type == upload_type)
            
        return query.order_by(FileUpload.uploaded_at.desc()).all()
    
    def get_files_by_customer(self, customer_id: int, upload_type: Optional[str] = None) -> list[FileUpload]:
        """Get files uploaded by a specific customer"""
        query = self.db_session.query(FileUpload).filter(
            FileUpload.customer_id == customer_id,
            FileUpload.is_active == True,
            FileUpload.is_deleted == False
        )
        
        if upload_type:
            query = query.filter(FileUpload.upload_type == upload_type)
            
        return query.order_by(FileUpload.uploaded_at.desc()).all()
    
    def get_files_by_job(self, job_id: int) -> list[FileUpload]:
        """Get files associated with a specific job"""
        return self.db_session.query(FileUpload).filter(
            FileUpload.job_id == job_id,
            FileUpload.is_active == True,
            FileUpload.is_deleted == False
        ).order_by(FileUpload.uploaded_at.desc()).all()
    
    def delete_file(self, file_id: int) -> bool:
        """Mark a file as deleted (soft delete)"""
        try:
            file_upload = self.get_file_by_id(file_id)
            if not file_upload:
                return False
            
            # Soft delete
            file_upload.is_deleted = True
            file_upload.is_active = False
            
            # Also delete from file server
            try:
                response = requests.delete(
                    f"{self.file_server_base_url}/delete/{file_upload.file_id}",
                    headers={'Authorization': f'Bearer {self.api_key}'},
                    timeout=10
                )
                if response.status_code != 200:
                    logger.warning(f"Failed to delete file from server: {response.status_code}")
            except Exception as e:
                logger.warning(f"Error deleting file from server: {str(e)}")
            
            self.db_session.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error deleting file {file_id}: {str(e)}")
            self.db_session.rollback()
            return False
    
    def get_file_download_url(self, file_id: int) -> Optional[str]:
        """Get a temporary download URL for a file"""
        try:
            file_upload = self.get_file_by_id(file_id)
            if not file_upload:
                return None
            
            # Request temporary download URL from file server
            response = requests.post(
                f"{self.file_server_base_url}/download/{file_upload.file_id}",
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('download_url')
            else:
                logger.error(f"Failed to get download URL: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting download URL for file {file_id}: {str(e)}")
            return None
