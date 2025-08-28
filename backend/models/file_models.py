"""
File-related database models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class FileUpload(Base):
    __tablename__ = "file_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True, index=True)
    
    # File details
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_url = Column(String(500), nullable=True)
    
    # File metadata
    file_size_bytes = Column(Integer, nullable=False)
    file_type = Column(String(100), nullable=True)  # MIME type
    file_extension = Column(String(20), nullable=True)
    
    # Upload context
    upload_type = Column(String(50), nullable=True)  # logo, project_file, document, etc.
    description = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)  # Array of tag strings
    
    # Status and processing
    is_processed = Column(Boolean, default=False)
    processing_status = Column(String(50), default="pending")  # pending, processing, completed, error
    processing_notes = Column(Text, nullable=True)
    
    # Security and access
    is_public = Column(Boolean, default=False)
    access_token = Column(String(255), nullable=True, unique=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="file_uploads")
    job = relationship("Job")
    
    def __repr__(self):
        return f"<FileUpload(id={self.id}, filename='{self.filename}', file_size_bytes={self.file_size_bytes})>"
