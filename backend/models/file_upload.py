from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class FileUpload(Base):
    __tablename__ = "file_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # Size in bytes
    mime_type = Column(String(100), nullable=False)
    upload_type = Column(String(50), nullable=False)  # 'project', 'branding', 'job_setup', etc.
    
    # File server info
    file_server_url = Column(String(500), nullable=False)
    file_key = Column(String(100), nullable=False)  # File server's unique key
    folder = Column(String(255), nullable=True)  # Folder path on file server
    
    # Metadata
    description = Column(Text, nullable=True)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    
    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    
    # Timestamps
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Status
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    customer = relationship("User", foreign_keys=[customer_id])
    job = relationship("Job", foreign_keys=[job_id])
    
    def __repr__(self):
        return f"<FileUpload(id={self.id}, filename='{self.filename}', type='{self.upload_type}')>"
