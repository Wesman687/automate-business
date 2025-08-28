"""
Database configuration and initialization
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL - PostgreSQL ONLY (no SQLite fallback)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required. No SQLite fallback allowed.")

if DATABASE_URL.startswith("sqlite"):
    raise ValueError("SQLite is not allowed. Please use PostgreSQL DATABASE_URL.")

# Create PostgreSQL engine
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base - SINGLE declaration for all models
Base = declarative_base()

# Import all models at module level to ensure they are registered with SQLAlchemy
# Note: Import order matters to avoid circular dependencies
try:
    # Import from root models directory only
    from models import *
except ImportError as e:
    print(f"Warning: Could not import all models: {e}")
    print("This is normal during initial setup or if some model files don't exist yet.")

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all tables in the database"""
    # All models are already imported at module level
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all tables in the database"""
    Base.metadata.drop_all(bind=engine)

def register_models():
    """Register all models with SQLAlchemy - call this after all models are defined"""
    # All models are already imported at module level
    # This function is kept for backward compatibility
    pass
