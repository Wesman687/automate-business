"""
Legacy file management utilities (deprecated)
"""
import os
import shutil
from typing import Optional, List
from sqlalchemy.orm import Session

from models import User
from services.file_upload_service import FileUploadService
