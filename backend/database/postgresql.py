"""
PostgreSQL-specific database utilities
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from models import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from dotenv import load_dotenv
load_dotenv()

# Database configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "streamlineai")
DB_USER = os.getenv("DB_USER", "streamlineai")
DB_PASSWORD = os.getenv("DB_PASSWORD", "StreamAI2025!")

# Database URLs
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
ASYNC_DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create engines
engine = create_engine(DATABASE_URL, echo=False)
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=False)

# Session makers
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session

def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all tables in the database"""
    Base.metadata.drop_all(bind=engine)

async def create_tables_async():
    """Create all tables asynchronously"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
