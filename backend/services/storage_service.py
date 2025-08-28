"""
Storage service for managing file storage operations
"""
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
import os
import shutil
from pathlib import Path

logger = logging.getLogger(__name__)

class StorageService:
    """Simple storage service for file operations"""
    
    def __init__(self, base_path: str = "uploads"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(exist_ok=True)
    
    def store_file(self, file_data: bytes, filename: str, subdirectory: str = "") -> Optional[str]:
        """Store a file in the local filesystem"""
        try:
            # Create subdirectory if it doesn't exist
            target_dir = self.base_path / subdirectory
            target_dir.mkdir(parents=True, exist_ok=True)
            
            # Create file path
            file_path = target_dir / filename
            
            # Write file
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            logger.info(f"File stored successfully: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Error storing file {filename}: {str(e)}")
            return None
    
    def get_file_path(self, filename: str, subdirectory: str = "") -> Optional[str]:
        """Get the full path to a stored file"""
        file_path = self.base_path / subdirectory / filename
        if file_path.exists():
            return str(file_path)
        return None
    
    def delete_file(self, filename: str, subdirectory: str = "") -> bool:
        """Delete a stored file"""
        try:
            file_path = self.base_path / subdirectory / filename
            if file_path.exists():
                file_path.unlink()
                logger.info(f"File deleted successfully: {file_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {filename}: {str(e)}")
            return False
    
    def list_files(self, subdirectory: str = "") -> List[str]:
        """List all files in a subdirectory"""
        try:
            target_dir = self.base_path / subdirectory
            if not target_dir.exists():
                return []
            
            return [f.name for f in target_dir.iterdir() if f.is_file()]
        except Exception as e:
            logger.error(f"Error listing files in {subdirectory}: {str(e)}")
            return []
    
    def get_file_size(self, filename: str, subdirectory: str = "") -> Optional[int]:
        """Get the size of a stored file in bytes"""
        try:
            file_path = self.base_path / subdirectory / filename
            if file_path.exists():
                return file_path.stat().st_size
            return None
        except Exception as e:
            logger.error(f"Error getting file size for {filename}: {str(e)}")
            return None
