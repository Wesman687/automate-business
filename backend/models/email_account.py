from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class EmailAccount(Base):
    __tablename__ = "email_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # Display name like "Customer Support"
    email = Column(String(255), nullable=False, unique=True)  # Email address
    password = Column(Text, nullable=False)  # App password (should be encrypted in production)
    
    # IMAP settings
    imap_server = Column(String(255), nullable=False, default="imap.gmail.com")
    imap_port = Column(Integer, nullable=False, default=993)
    
    # SMTP settings  
    smtp_server = Column(String(255), nullable=False, default="smtp.gmail.com")
    smtp_port = Column(Integer, nullable=False, default=587)
    
    # Status and metadata
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String(100))  # Admin user who added this account
    
    def __repr__(self):
        return f"<EmailAccount(name='{self.name}', email='{self.email}')>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "imap_server": self.imap_server,
            "imap_port": self.imap_port,
            "smtp_server": self.smtp_server,
            "smtp_port": self.smtp_port,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "created_by": self.created_by
        }
