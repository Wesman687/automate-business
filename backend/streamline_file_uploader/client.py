"""
Streamline File Uploader Client
"""

import aiohttp
import base64
import hashlib
import json
import logging
from typing import Optional, Union
from .models import UploadResult, FileInfo

logger = logging.getLogger(__name__)


class StreamlineFileUploader:
    """
    Async client for Streamline AI file server
    """
    
    def __init__(
        self,
        base_url: str = "https://file-server.stream-lineai.com",
        service_token: Optional[str] = None,
        default_user_email: str = "system@stream-lineai.com"
    ):
        self.base_url = base_url.rstrip('/')
        self.service_token = service_token
        self.default_user_email = default_user_email
        self._session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        self._session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self._session:
            await self._session.close()
    
    def _get_headers(self) -> dict:
        """Get headers for API requests"""
        headers = {
            "Content-Type": "application/json"
        }
        if self.service_token:
            headers["X-Service-Token"] = self.service_token
        return headers
    
    async def upload_file(
        self,
        file_content: Union[bytes, str],
        filename: str,
        folder: Optional[str] = None,
        mime_type: str = "application/octet-stream",
        user_id: Optional[str] = None
    ) -> UploadResult:
        """
        Upload a file to the file server
        
        Args:
            file_content: File content as bytes or base64 string
            filename: Name of the file
            folder: Optional folder path
            mime_type: MIME type of the file
            user_id: User ID (email) - defaults to default_user_id
            
        Returns:
            UploadResult with success status and file info
        """
        if not self._session:
            raise RuntimeError("StreamlineFileUploader must be used as async context manager")
        
        try:
            # Convert bytes to base64 if needed
            if isinstance(file_content, bytes):
                file_b64 = base64.b64encode(file_content).decode('utf-8')
                file_size = len(file_content)
            else:
                file_b64 = file_content
                file_size = len(base64.b64decode(file_content))
            
            user_email = user_id or self.default_user_email
            
            # Step 1: Initialize upload
            init_data = {
                "mode": "single",
                "files": [{
                    "name": filename,
                    "size": file_size,
                    "mime": mime_type
                }],
                "meta": {
                    "user_email": user_email,
                    "user_id": user_email
                }
            }
            
            if folder:
                init_data["folder"] = folder
            
            async with self._session.post(
                f"{self.base_url}/v1/files/init",
                headers=self._get_headers(),
                json=init_data
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"File server init failed: {response.status} - {error_text}")
                    return UploadResult(
                        success=False,
                        file_key="",
                        public_url="",
                        error=f"Init failed: {response.status} - {error_text}"
                    )
                
                upload_session = await response.json()
                upload_id = upload_session["uploadId"]
            
            # Step 2: Upload the file data
            # Calculate SHA256 hash of the file content
            if isinstance(file_content, bytes):
                file_hash = hashlib.sha256(file_content).hexdigest()
            else:
                file_bytes = base64.b64decode(file_content)
                file_hash = hashlib.sha256(file_bytes).hexdigest()
            
            complete_data = {
                "uploadId": upload_id,
                "parts": [{"data": file_b64}],
                "meta": {
                    "user_email": user_email,
                    "user_id": user_email
                },
                "folder": folder or "uploads",
                "sha256": file_hash
            }
            
            async with self._session.post(
                f"{self.base_url}/v1/files/complete",
                headers=self._get_headers(),
                json=complete_data
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"File server complete failed: {response.status} - {error_text}")
                    return UploadResult(
                        success=False,
                        file_key="",
                        public_url="",
                        error=f"Complete failed: {response.status} - {error_text}"
                    )
                
                result = await response.json()
                
                return UploadResult(
                    success=True,
                    file_key=result.get("file_key", result.get("fileKey", "")),
                    public_url=result.get("public_url", result.get("publicUrl", "")),
                    file_id=result.get("file_id", result.get("fileId"))
                )
                
        except Exception as e:
            logger.error(f"Upload failed with exception: {str(e)}")
            return UploadResult(
                success=False,
                file_key="",
                public_url="",
                error=str(e)
            )
    
    async def get_user_files(
        self,
        user_id: Optional[str] = None,
        folder: Optional[str] = None
    ) -> dict:
        """
        Get files for a user
        
        Args:
            user_id: User ID (email)
            folder: Optional folder filter
            
        Returns:
            Dictionary with files list
        """
        if not self._session:
            raise RuntimeError("StreamlineFileUploader must be used as async context manager")
        
        try:
            user_email = user_id or self.default_user_id
            
            params = {"user_email": user_email}
            if folder:
                params["folder"] = folder
            
            async with self._session.get(
                f"{self.base_url}/v1/files",
                headers=self._get_headers(),
                params=params
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    logger.error(f"Get files failed: {response.status} - {error_text}")
                    return {"success": False, "error": f"Get files failed: {response.status}"}
                    
        except Exception as e:
            logger.error(f"Get files failed with exception: {str(e)}")
            return {"success": False, "error": str(e)}
