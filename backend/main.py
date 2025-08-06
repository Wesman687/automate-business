from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database.models import Base
from database.postgresql import engine
from api.chat import router as chat_router
from api.customers import router as customers_router
from api.contact import router as contact_router
from api.admin import router as admin_router
from api.auth import router as auth_router
from api.email import router as email_router
import logging
import os
from datetime import datetime
import sys
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    logger = logging.getLogger(__name__)
    
    # Log startup banner
    logger.info("=" * 80)
    logger.info("🚀 STREAMLINE AI BACKEND STARTING UP")
    logger.info("=" * 80)
    
    # Log system information
    logger.info(f"📅 Startup Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    logger.info(f"🐍 Python Version: {sys.version.split()[0]}")
    logger.info(f"🌍 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"📡 SMTP Server: {os.getenv('SMTP_SERVER', 'not configured')}")
    logger.info(f"🔑 OpenAI API: {'✅ Configured' if os.getenv('OPENAI_API_KEY') else '❌ Missing'}")
    
    # Database initialization
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created/verified successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise
    
    # Log available routes
    logger.info("🛣️  Available API Routes:")
    logger.info("   • /health - Health check endpoint")
    logger.info("   • /api/chat - AI chatbot interactions")
    logger.info("   • /api/save-customer - Customer data capture")
    logger.info("   • /api/contact - Contact form submissions")
    logger.info("   • /admin/* - Administrative endpoints")
    logger.info("   • /docs - API documentation")
    
    # Final startup message
    logger.info("=" * 80)
    logger.info("🎯 STREAMLINE AI BACKEND v2.0 IS READY!")
    logger.info("=" * 80)
    
    print("✅ Database tables created/verified")
    print("🚀 Streamline AI Backend v2.0 is running!")
    print(f"📅 Started at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    
    yield  # This is where the app runs
    
    # Shutdown
    logger.info("=" * 80)
    logger.info("🛑 STREAMLINE AI BACKEND SHUTTING DOWN")
    logger.info("=" * 80)
    logger.info(f"📅 Shutdown Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    logger.info("👋 Service stopped gracefully")
    logger.info("=" * 80)
    print(f"🛑 Streamline AI Backend stopped at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Streamline AI Backend",
    version="2.0.0",
    description="Professional automation consulting platform with AI chatbot and customer management",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
        "https://stream-lineai.com", 
        "https://www.stream-lineai.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router)
app.include_router(customers_router)
app.include_router(contact_router)
app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(email_router)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "Streamline AI Backend",
        "version": "2.0.0",
        "features": [
            "AI Chat with GPT-4",
            "Customer Management",
            "Session Tracking",
            "Proposal Generation",
            "Database Storage"
        ]
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Streamline AI Backend v2.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8005, reload=True)
