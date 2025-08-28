from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, Numeric, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from . import Base
import uuid

class ExtractorSchema(Base):
    """JSON schemas for data extraction"""
    __tablename__ = "extractor_schemas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    version = Column(String(20), nullable=False, default='1.0')
    description = Column(Text, nullable=True)
    schema_definition = Column(JSON, nullable=False)
    strict_validation = Column(Boolean, default=True)
    allow_extra_fields = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")  # Removed back_populates to avoid circular dependency
    scraping_jobs = relationship("ScrapingJob", back_populates="extractor_schema")
    
    def __repr__(self):
        return f"<ExtractorSchema(id={self.id}, name='{self.name}', version='{self.version}')>"


class ScrapingJob(Base):
    """Scraping job configurations"""
    __tablename__ = "scraping_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    target_url = Column(Text, nullable=False)
    pagination_type = Column(String(50), nullable=False)
    extractor_schema_id = Column(UUID(as_uuid=True), ForeignKey("extractor_schemas.id"), nullable=False)
    options = Column(JSON, nullable=False, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    schedule_cron = Column(String(100), nullable=True)
    schedule_timezone = Column(String(100), nullable=True)
    
    # Relationships
    user = relationship("User")  # Removed back_populates to avoid circular dependency
    extractor_schema = relationship("ExtractorSchema", back_populates="scraping_jobs")
    runs = relationship("Run", back_populates="job")
    
    def __repr__(self):
        return f"<ScrapingJob(id={self.id}, name='{self.name}', target_url='{self.target_url}')>"


class Run(Base):
    """Individual scraping execution instances"""
    __tablename__ = "runs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("scraping_jobs.id"), nullable=False, index=True)
    status = Column(String(50), nullable=False, default='queued')
    error_message = Column(Text, nullable=True)
    pages_fetched = Column(Integer, default=0)
    items_found = Column(Integer, default=0)
    items_extracted = Column(Integer, default=0)
    credits_charged = Column(Numeric(10,2), default=0)
    idempotency_key = Column(String(255), nullable=False, unique=True, index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    run_metadata = Column(JSON, default={})
    
    # Relationships
    job = relationship("ScrapingJob", back_populates="runs")
    results = relationship("Result", back_populates="run")
    exports = relationship("Export", back_populates="run")
    
    def __repr__(self):
        return f"<Run(id={self.id}, job_id={self.job_id}, status='{self.status}')>"


class Result(Base):
    """Extracted data from scraping runs"""
    __tablename__ = "results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("runs.id"), nullable=False, index=True)
    data = Column(JSON, nullable=False)
    source_url = Column(Text, nullable=True)
    content_hash = Column(String(64), nullable=False, index=True)
    extracted_at = Column(DateTime(timezone=True), server_default=func.now())
    confidence_score = Column(String(10), nullable=True)
    
    # Relationships
    run = relationship("Run", back_populates="results")
    
    def __repr__(self):
        return f"<Result(id={self.id}, run_id={self.run_id}, content_hash='{self.content_hash}')>"


class Export(Base):
    """Data export operations and files"""
    __tablename__ = "exports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("runs.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    format = Column(String(20), nullable=False)
    status = Column(String(50), nullable=False, default='processing')
    file_size_bytes = Column(Integer, nullable=True)
    download_url = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    run = relationship("Run", back_populates="exports")
    user = relationship("User")  # Removed back_populates to avoid circular dependency
    
    def __repr__(self):
        return f"<Export(id={self.id}, run_id={self.run_id}, format='{self.format}', status='{self.status}')>"
