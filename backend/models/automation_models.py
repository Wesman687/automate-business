"""
Automation-related database models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class JobStatus(enum.Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"

class JobPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class AppointmentStatus(enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Basic job information
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=True)
    priority = Column(String(50), nullable=True)
    
    # Dates and timeline
    start_date = Column(DateTime(timezone=True), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    completion_date = Column(DateTime(timezone=True), nullable=True)
    
    # Estimates and pricing
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, nullable=True)
    hourly_rate = Column(Float, nullable=True)
    fixed_price = Column(Float, nullable=True)
    
    # Project details
    project_goals = Column(Text, nullable=True)
    target_audience = Column(Text, nullable=True)
    timeline = Column(String(100), nullable=True)
    budget_range = Column(String(100), nullable=True)
    
    # Business information
    business_name = Column(String(255), nullable=True)
    business_type = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)
    industry_other = Column(String(100), nullable=True)
    
    # Brand and design
    brand_colors = Column(JSON, nullable=True)
    brand_color_tags = Column(JSON, nullable=True)
    brand_color_tag_others = Column(JSON, nullable=True)
    brand_style = Column(String(100), nullable=True)
    brand_style_other = Column(String(100), nullable=True)
    logo_files = Column(JSON, nullable=True)
    brand_guidelines = Column(Text, nullable=True)
    
    # Links and resources
    website_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    google_drive_links = Column(JSON, nullable=True)
    github_repositories = Column(JSON, nullable=True)
    workspace_links = Column(JSON, nullable=True)
    server_details = Column(JSON, nullable=True)
    calendar_links = Column(JSON, nullable=True)
    meeting_links = Column(JSON, nullable=True)
    
    # Tools and resources
    additional_tools = Column(JSON, nullable=True)
    resources = Column(JSON, nullable=True)
    social_media = Column(JSON, nullable=True)
    
    # Progress and deliverables
    progress_percentage = Column(Integer, nullable=True)
    milestones = Column(JSON, nullable=True)
    deliverables = Column(JSON, nullable=True)
    additional_resource_info = Column(JSON, nullable=True)
    
    # Notes and metadata
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("User", back_populates="jobs")
    time_entries = relationship("TimeEntry", back_populates="job")
    change_requests = relationship("CustomerChangeRequest", back_populates="job")
    videos = relationship("Video", back_populates="job")
    
    def __repr__(self):
        return f"<Job(id={self.id}, title='{self.title}', status='{self.status}')>"

class CustomerChangeRequest(Base):
    __tablename__ = "customer_change_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Change request details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    # Status and priority
    status = Column(String(20), nullable=True)  # pending, approved, rejected, implemented
    priority = Column(String(20), nullable=True)  # low, medium, high, urgent
    
    # Estimates
    estimated_hours = Column(Float, nullable=True)
    estimated_cost = Column(Numeric(10, 2), nullable=True)
    
    # Admin response
    admin_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Implementation and tracking
    implementation_date = Column(DateTime(timezone=True), nullable=True)
    requested_via = Column(String(50), nullable=True)
    session_id = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    job = relationship("Job", back_populates="change_requests")
    customer = relationship("User", foreign_keys=[customer_id])
    
    def __repr__(self):
        return f"<CustomerChangeRequest(id={self.id}, job_id={self.job_id}, status='{self.status}')>"

class Video(Base):
    __tablename__ = "videos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True, index=True)
    
    # Video details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    
    # Video metadata
    duration_seconds = Column(Integer, nullable=True)
    file_size_mb = Column(Float, nullable=True)
    video_format = Column(String(20), nullable=True)
    resolution = Column(String(20), nullable=True)
    
    # Status and visibility
    is_public = Column(Boolean, default=False)
    status = Column(String(20), default="processing")  # processing, ready, error
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="videos")
    job = relationship("Job", back_populates="videos")
    
    def __repr__(self):
        return f"<Video(id={self.id}, title='{self.title}', status='{self.status}')>"

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Appointment details
    scheduled_date = Column(DateTime, nullable=False)
    appointment_type = Column(String(50), nullable=True)  # consultation, review, follow-up
    duration_minutes = Column(Integer, nullable=True)
    
    # Status and notes
    status = Column(String(50), nullable=True)  # scheduled, completed, cancelled, etc.
    customer_notes = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Contact and meeting info
    meeting_link = Column(String(500), nullable=True)
    phone_number = Column(String(20), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    
    # Relationships
    customer = relationship("User", back_populates="appointments")
    
    def __repr__(self):
        return f"<Appointment(id={self.id}, customer_id={self.customer_id}, scheduled_date='{self.scheduled_date}')>"
