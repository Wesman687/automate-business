"""
Centralized File Service for Stream-Line File Server

This service provides a unified interface for all file operations including:
- Job-specific file management (documents/{job_id}/{type})
- Customer dashboard file management (root customer folder)
- Windows Explorer-style file operations
- Comprehensive error handling and logging
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional, Union
from pathlib import Path
import mimetypes
from datetime import datetime

# Import the SDK using the same pattern as the API endpoints
try:
    from streamline_file_uploader import StreamlineFileUploader
    SDK_AVAILABLE = True
    print("✅ FileService: StreamlineFileUploader SDK loaded successfully")
except ImportError as e:
    print(f"❌ FileService: streamline-file-uploader SDK not available: {e}")
    SDK_AVAILABLE = False

# Try to import additional classes if available
try:
    from streamline_file_uploader import UploadOptions, UploadResult
    from streamline_file_uploader import UploadError, AuthenticationError, FileServerError, ValidationError
    EXTENDED_SDK_AVAILABLE = True
    print("✅ FileService: Extended SDK classes loaded successfully")
except ImportError as e:
    print(f"⚠️ FileService: Extended SDK classes not available: {e}")
    EXTENDED_SDK_AVAILABLE = False

from config import config

logger = logging.getLogger(__name__)

class FileServiceError(Exception):
    """Custom exception for file service errors"""
    def __init__(self, message: str, error_code: str = None, details: Dict = None):
        super().__init__(message)
        self.error_code = error_code
        self.details = details or {}

class FileService:
    """
    Centralized file service for managing files on Stream-Line file server
    
    Features:
    - Job-specific folder organization
    - Customer dashboard file management
    - Windows Explorer-style operations
    - Comprehensive error handling
    - Performance optimization
    """
    
    def __init__(self):
        if not SDK_AVAILABLE:
            raise FileServiceError("Stream-Line SDK not available")
        
        self.base_url = config.UPLOAD_BASE_URL
        self.service_token = config.AUTH_SERVICE_TOKEN
        
        # Folder organization patterns
        self.job_folder_pattern = "documents/{job_id}/{type}"
        self.customer_root_pattern = "customers/{customer_email}"
        
        # File type mappings
        self.file_type_folders = {
            'logo': 'logos',
            'project': 'project', 
            'reference': 'reference',
            'general': 'general'
        }
        
        print(f"✅ FileService initialized with base_url: {self.base_url}")
    
    async def _get_uploader(self) -> StreamlineFileUploader:
        """Get configured uploader instance"""
        try:
            uploader = StreamlineFileUploader(
                base_url=self.base_url,
                service_token=self.service_token
            )
            print(f"✅ Uploader instance created successfully")
            return uploader
        except Exception as e:
            logger.error(f"Failed to initialize uploader: {e}")
            raise FileServiceError(f"Uploader initialization failed: {e}")
    
    # ============================================================================
    # JOB-SPECIFIC FILE OPERATIONS
    # ============================================================================
    
    async def upload_job_file(
        self,
        file_content: Union[bytes, str, Path],
        filename: str,
        job_id: int,
        file_type: str,
        user_email: str,
        description: str = None,
        metadata: Dict = None
    ) -> Dict[str, Any]:
        """
        Upload a file to a job-specific folder
        
        Args:
            file_content: File content (bytes, path, or file object)
            filename: Name of the file
            job_id: Job ID for organization
            file_type: Type of file (logo, project, reference, general)
            user_email: User's email address
            description: File description
            metadata: Additional metadata
            
        Returns:
            Dict with file details (compatible with both extended and basic SDK)
            
        Raises:
            FileServiceError: If upload fails
        """
        try:
            # Determine folder structure
            if file_type in self.file_type_folders:
                folder = f"documents/{job_id}/{self.file_type_folders[file_type]}"
            else:
                folder = f"documents/{job_id}"
            
            logger.info(f"📁 Uploading job file to: {folder}")
            
            # Prepare metadata
            file_metadata = {
                "job_id": job_id,
                "file_type": file_type,
                "description": description,
                "uploaded_by": user_email,
                "uploaded_at": datetime.utcnow().isoformat(),
                **(metadata or {})
            }
            
            async with await self._get_uploader() as uploader:
                # Use the basic upload method that we know works
                result = await uploader.upload_file(
                    file_content=file_content,
                    filename=filename,
                    folder=folder,
                    user_email=user_email
                )
                
                logger.info(f"✅ Job file uploaded successfully: {result.file_key}")
                
                # Return result in a format compatible with our API expectations
                return {
                    "file_key": result.file_key,
                    "public_url": result.public_url,
                    "success": True
                }
                
        except Exception as e:
            logger.error(f"❌ Job file upload failed: {e}")
            raise FileServiceError(f"Upload failed: {e}", error_code="UPLOAD_FAILED", details={"job_id": job_id, "file_type": file_type})
    
    async def upload_customer_file(
        self,
        file_content: Union[bytes, str, Path],
        filename: str,
        user_email: str,
        folder: str = "general",
        description: str = None,
        metadata: Dict = None
    ) -> Dict[str, Any]:
        """
        Upload a file to customer's root folder (for customer dashboard)
        
        Args:
            file_content: File content
            filename: Name of the file
            user_email: Customer's email address
            folder: Subfolder within customer root (default: general)
            description: File description
            metadata: Additional metadata
            
        Returns:
            Dict with file details
        """
        try:
            # Customer files go to root customer folder
            target_folder = f"customers/{user_email}/{folder}"
            
            logger.info(f"📁 Uploading customer file to: {target_folder}")
            
            # Prepare metadata
            file_metadata = {
                "customer_email": user_email,
                "folder": folder,
                "description": description,
                "uploaded_at": datetime.utcnow().isoformat(),
                **(metadata or {})
            }
            
            async with await self._get_uploader() as uploader:
                result = await uploader.upload_file(
                    file_content=file_content,
                    filename=filename,
                    folder=target_folder,
                    user_email=user_email
                )
                
                logger.info(f"✅ Customer file uploaded successfully: {result.file_key}")
                
                return {
                    "file_key": result.file_key,
                    "public_url": result.public_url,
                    "success": True
                }
                
        except Exception as e:
            logger.error(f"❌ Customer file upload failed: {e}")
            raise FileServiceError(f"Customer upload failed: {e}", error_code="CUSTOMER_UPLOAD_FAILED")
    
    async def get_job_files(
        self,
        job_id: int,
        user_email: str,
        file_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all files for a specific job
        
        Args:
            job_id: Job ID to fetch files for
            user_email: User's email address
            file_type: Optional file type filter
            
        Returns:
            List of file information dictionaries
        """
        try:
            all_files = []
            
            if file_type and file_type in self.file_type_folders:
                # Get files from specific type folder
                folder = f"documents/{job_id}/{self.file_type_folders[file_type]}"
                files = await self._list_folder_files(user_email, folder)
                for file in files:
                    file["upload_type"] = file_type
                    file["folder"] = folder
                all_files.extend(files)
            else:
                # Get files from all job folders
                folders = [
                    f"documents/{job_id}/logos",
                    f"documents/{job_id}/project", 
                    f"documents/{job_id}/reference",
                    f"documents/{job_id}"
                ]
                
                for folder in folders:
                    try:
                        files = await self._list_folder_files(user_email, folder)
                        folder_type = folder.split('/')[-1] if folder.split('/')[-1] != str(job_id) else "general"
                        
                        for file in files:
                            # Map folder type back to original upload_type
                            if folder_type == "logos":
                                file["upload_type"] = "logo"
                            elif folder_type == "project":
                                file["upload_type"] = "project"
                            elif folder_type == "reference":
                                file["upload_type"] = "reference"
                            else:
                                file["upload_type"] = "general"
                            file["folder"] = folder
                        
                        all_files.extend(files)
                        logger.info(f"✅ Found {len(files)} files in {folder}")
                        
                    except Exception as e:
                        logger.warning(f"⚠️ Could not fetch files from {folder}: {e}")
            
            # Remove duplicates based on file key
            unique_files = {}
            for file in all_files:
                file_key = file.get("key") or file.get("id")
                if file_key and file_key not in unique_files:
                    unique_files[file_key] = file
                elif file_key in unique_files:
                    # If we have a duplicate, prefer the one with the most specific folder type
                    existing = unique_files[file_key]
                    existing_type = existing.get("upload_type", "general")
                    new_type = file.get("upload_type", "general")
                    
                    # Priority: logo > project > reference > general
                    type_priority = {"logo": 4, "project": 3, "reference": 2, "general": 1}
                    if type_priority.get(new_type, 0) > type_priority.get(existing_type, 0):
                        unique_files[file_key] = file
            
            return list(unique_files.values())
            
        except Exception as e:
            logger.error(f"❌ Failed to get job files: {e}")
            raise FileServiceError(f"Failed to get job files: {e}", error_code="FETCH_FAILED")
    
    async def get_customer_files(
        self,
        user_email: str,
        folder: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all files for a customer
        
        Args:
            user_email: Customer's email address
            folder: Optional subfolder filter
            
        Returns:
            List of file information dictionaries
        """
        try:
            if folder:
                target_folder = f"customers/{user_email}/{folder}"
            else:
                target_folder = f"customers/{user_email}"
            
            files = await self._list_folder_files(user_email, target_folder)
            
            # Add customer context to files
            for file in files:
                file["customer_email"] = user_email
                file["folder"] = target_folder
            
            return files
            
        except Exception as e:
            logger.error(f"❌ Failed to get customer files: {e}")
            raise FileServiceError(f"Failed to get customer files: {e}", error_code="CUSTOMER_FETCH_FAILED")
    
    async def delete_file(
        self,
        file_key: str,
        user_email: str
    ) -> Dict[str, Any]:
        """
        Delete a file from the server
        
        Args:
            file_key: File to delete
            user_email: User's email address
            
        Returns:
            Delete operation result
        """
        try:
            async with await self._get_uploader() as uploader:
                file_manager = uploader.file_manager
                result = await file_manager.delete_file(file_key)
                
                logger.info(f"🗑️ File deleted successfully: {file_key}")
                return result
                
        except Exception as e:
            logger.error(f"❌ Failed to delete file: {e}")
            raise FileServiceError(f"Failed to delete file: {e}", error_code="DELETE_FAILED")
    
    async def search_files(
        self,
        user_email: str,
        query: str,
        folder: Optional[str] = None,
        file_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for files by various criteria
        
        Args:
            user_email: User's email address
            query: Search query
            folder: Optional folder filter
            file_type: Optional file type filter
            
        Returns:
            List of matching files
        """
        try:
            async with await self._get_uploader() as uploader:
                file_manager = uploader.file_manager
                
                # Use basic search if available, otherwise fallback to listing and filtering
                try:
                    results = await file_manager.search_files(
                        user_email=user_email,
                        filename_pattern=query,
                        folder=folder
                    )
                    return results
                except Exception as search_error:
                    logger.warning(f"Search not available, falling back to list and filter: {search_error}")
                    # Fallback: get all files and filter locally
                    all_files = await self._list_folder_files(user_email, folder or "")
                    return [f for f in all_files if query.lower() in f.get("original_filename", "").lower()]
                
        except Exception as e:
            logger.error(f"❌ File search failed: {e}")
            raise FileServiceError(f"File search failed: {e}", error_code="SEARCH_FAILED")
    
    async def list_folders(
        self,
        user_email: str,
        base_path: str = ""
    ) -> List[Dict[str, Any]]:
        """
        List all folders for Windows Explorer-style navigation
        
        Args:
            user_email: User's email address
            base_path: Base path to start from
            
        Returns:
            List of folder information
        """
        try:
            async with await self._get_uploader() as uploader:
                file_manager = uploader.file_manager
                
                # Try to get folder stats, fallback to basic listing
                try:
                    stats = await file_manager.get_folder_stats(user_email, base_path)
                    logger.info(f"📁 Folder stats response type: {type(stats)}, content: {stats}")
                    folders = []
                    
                    # Ensure stats is a dictionary
                    if isinstance(stats, dict) and "folders" in stats:
                        for folder_info in stats["folders"]:
                            if isinstance(folder_info, dict):
                                folders.append({
                                    "name": folder_info.get("name", "Unknown"),
                                    "path": f"{base_path}/{folder_info['name']}" if base_path else folder_info['name'],
                                    "file_count": folder_info.get("file_count", 0),
                                    "total_size": folder_info.get("total_size", 0),
                                    "type": "folder"
                                })
                    else:
                        logger.warning(f"⚠️ Unexpected stats format: {type(stats)}, expected dict with 'folders' key")
                    return folders
                except Exception as stats_error:
                    logger.warning(f"Folder stats not available, using basic listing: {stats_error}")
                    # Fallback: return basic folder structure
                    return [
                        {
                            "name": "documents",
                            "path": "documents",
                            "file_count": 0,
                            "total_size": 0,
                            "type": "folder"
                        },
                        {
                            "name": "customers",
                            "path": "customers", 
                            "file_count": 0,
                            "total_size": 0,
                            "type": "folder"
                        }
                    ]
                
        except Exception as e:
            logger.error(f"❌ Failed to list folders: {e}")
            raise FileServiceError(f"Failed to list folders: {e}", error_code="FOLDER_LIST_FAILED")
    
    # ============================================================================
    # PRIVATE HELPER METHODS
    # ============================================================================
    
    async def _list_folder_files(
        self,
        user_email: str,
        folder: str
    ) -> List[Dict[str, Any]]:
        """
        Helper method to list files from a specific folder
        
        Args:
            user_email: User's email address
            folder: Folder path
            
        Returns:
            List of file information dictionaries
        """
        try:
            async with await self._get_uploader() as uploader:
                file_manager = uploader.file_manager
                
                response = await file_manager.list_files(
                    user_email=user_email,
                    folder=folder
                )
                
                # Handle SDK response format
                if isinstance(response, dict) and "files" in response:
                    files = response["files"]
                    # Normalize file data structure
                    for file in files:
                        file["id"] = file.get("key", file.get("file_key", file.get("id", "")))
                        file["original_filename"] = file.get("filename", file.get("name", "Unknown"))
                        file["file_url"] = file.get("public_url", file.get("url", ""))
                        file["uploaded_at"] = file.get("created_at", file.get("uploaded_at", ""))
                    
                    return files
                else:
                    logger.warning(f"Unexpected response format from list_files: {type(response)}")
                    return []
                    
        except Exception as e:
            logger.error(f"❌ Failed to list folder files: {e}")
            return []

# ============================================================================
# USAGE EXAMPLES AND DOCUMENTATION
# ============================================================================

"""
USAGE EXAMPLES:

1. Job File Operations:
   ```python
   file_service = FileService()
   
   # Upload logo file to job
   result = await file_service.upload_job_file(
       file_content=logo_bytes,
       filename="company_logo.png",
       job_id=123,
       file_type="logo",
       user_email="user@example.com"
   )
   
   # Get all job files
   job_files = await file_service.get_job_files(
       job_id=123,
       user_email="user@example.com"
   )
   ```

2. Customer Dashboard Operations:
   ```python
   # Upload general file to customer folder
   result = await file_service.upload_customer_file(
       file_content=document_bytes,
       filename="contract.pdf",
       user_email="customer@example.com",
       folder="documents"
   )
   
   # Get customer files
   customer_files = await file_service.get_customer_files(
       user_email="customer@example.com"
   )
   ```

3. Windows Explorer Operations:
   ```python
   # List folders for navigation
   folders = await file_service.list_folders(
       user_email="user@example.com",
       base_path="documents/123"
   )
   
   # Search for files
   search_results = await file_service.search_files(
       user_email="user@example.com",
       query="logo",
       folder="documents/123/logos"
   )
   ```

4. File Management:
   ```python
   # Delete file
   await file_service.delete_file(
       file_key="file_key_here",
       user_email="user@example.com"
   )
   ```

FOLDER STRUCTURE:

Job Files:
- documents/{job_id}/logos/     # Logo files
- documents/{job_id}/project/   # Project files  
- documents/{job_id}/reference/ # Reference files
- documents/{job_id}/           # General job files

Customer Dashboard:
- customers/{email}/general/    # General customer files
- customers/{email}/documents/  # Customer documents
- customers/{email}/uploads/    # Customer uploads

ERROR HANDLING:

The service provides structured error handling with:
- Custom FileServiceError exceptions
- Error codes for different failure types
- Detailed error messages and context
- Comprehensive logging for debugging

PERFORMANCE FEATURES:

- Async/await for non-blocking operations
- Connection pooling through context managers
- Efficient folder traversal
- Batch operations where possible
- Fallback mechanisms for missing SDK features
"""
