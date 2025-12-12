"""
Models for Streamline File Uploader
"""
from typing import Optional
from dataclasses import dataclass


@dataclass
class FileInfo:
    """Information about an uploaded file"""
    file_key: str
    public_url: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    folder: Optional[str] = None
    uploaded_at: Optional[str] = None


@dataclass
class UploadResult:
    """Result of a file upload operation"""
    success: bool
    file_key: str
    public_url: str
    error: Optional[str] = None
    file_info: Optional[FileInfo] = None

