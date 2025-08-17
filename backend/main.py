from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from database.models import Base
from database import engine
from database.database_logger import database_logger  # Import to activate logging
from api.chat import router as chat_router
from api.customers import router as customers_router
from api.contact import router as contact_router
from api.admin import router as admin_router
from api.login import router as auth_router
from api.email import router as email_router
from api.share import router as share_router
from api.api_endpoints import router as api_router
from api.financial import router as financial_router
from api.schedule import router as schedule_router
from api.google_auth import router as google_auth_router
from api.voice_agent import router as voice_agent_router
from api.admin_jobs import router as admin_jobs_router
from api.auth import get_current_user
import logging
import os
from datetime import datetime
import sys
from contextlib import asynccontextmanager
from config import config

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    logger = logging.getLogger(__name__)
    
    # Log startup banner
    logger.info("=" * 80)
    logger.info("ðŸš€ STREAMLINE AI BACKEND STARTING UP")
    logger.info("=" * 80)
    
    # Log system information
    logger.info(f"ðŸ“… Startup Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    logger.info(f"ðŸ Python Version: {sys.version.split()[0]}")
    logger.info(f"ðŸŒ Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"ðŸ“¡ SMTP Server: {os.getenv('SMTP_SERVER', 'not configured')}")
    logger.info(f"ðŸ”‘ OpenAI API: {'âœ… Configured' if os.getenv('OPENAI_API_KEY') else 'âŒ Missing'}")
    
    # Database initialization
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("âœ… Database tables created/verified successfully")
    except Exception as e:
        logger.error(f"âŒ Database initialization failed: {e}")
        raise
    
    # Log available routes
    logger.info("ðŸ›£ï¸  Available API Routes:")
    logger.info("   â€¢ /health - Health check endpoint")
    logger.info("   â€¢ /api/chat - AI chatbot interactions")
    logger.info("   â€¢ /api/save-customer - Customer data capture")
    logger.info("   â€¢ /api/contact - Contact form submissions")
    logger.info("   â€¢ /admin/* - Administrative endpoints")
    logger.info("   â€¢ /docs - API documentation")
    
    # Final startup message
    logger.info("=" * 80)
    logger.info("ðŸŽ¯ STREAMLINE AI BACKEND v2.0 IS READY!")
    logger.info("=" * 80)
    
    print("âœ… Database tables created/verified")
    print("ðŸš€ Streamline AI Backend v2.0 is running!")
    print(f"ðŸ“… Started at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    
    yield  # This is where the app runs
    
    # Shutdown
    logger.info("=" * 80)
    logger.info("ðŸ›‘ STREAMLINE AI BACKEND SHUTTING DOWN")
    logger.info("=" * 80)
    logger.info(f"ðŸ“… Shutdown Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    logger.info("ðŸ‘‹ Service stopped gracefully")
    logger.info("=" * 80)
    print(f"ðŸ›‘ Streamline AI Backend stopped at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Streamline AI Backend",
    version="2.0.0",
    description="Professional automation consulting platform with AI chatbot and customer management",
    lifespan=lifespan
)

# CORS middleware - Environment-based configuration
cors_origins = [
    "http://localhost:3000", 
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "https://stream-lineai.com", 
    "https://www.stream-lineai.com",
    "https://server.stream-lineai.com",
    # Vercel deployment domains
    "https://automate-business-7w1cnzwpd-wesman687s-projects.vercel.app",
    "https://automate-dev-seven.vercel.app",
    # Add your current IP
    "http://67.190.222.150",
    "https://67.190.222.150",
    "http://67.190.222.150:3000",
    "http://67.190.222.150:3001",
    "http://67.190.222.150:3002",
    "http://67.190.222.150:3003",
]

# Check if development mode should allow all origins
if os.getenv('CORS_ALLOW_ALL', 'false').lower() == 'true':
    cors_origins = ["*"]  # Allow all origins in development

# Custom CORS configuration for IP ranges and Vercel deployments
def is_allowed_ip_range(origin: str) -> bool:
    """Check if origin matches allowed IP patterns or Vercel deployment patterns"""
    import re
    # Pattern for your IP range (67.190.222.*)
    allowed_patterns = [
        r"https?://67\.190\.222\.\d+",  # Matches 67.190.222.* 
        r"https?://67\.190\.222\.\d+:\d+",  # With port numbers
        # Vercel deployment patterns
        r"https://automate-business.*\.vercel\.app",  # Any automate-business deployment
        r"https://automate-dev.*\.vercel\.app",  # Any automate-dev deployment
        r"https://.*-wesman687s-projects\.vercel\.app",  # Any of your Vercel projects
    ]
    
    for pattern in allowed_patterns:
        if re.match(pattern, origin):
            return True
    return False


async def custom_cors_handler(request: Request, call_next):
    """Custom CORS handler that supports IP ranges and handles preflight requests"""
    origin = request.headers.get("origin")
    
    # Check if origin is allowed
    allowed = False
    if origin:
        # Check standard CORS origins
        if origin in cors_origins or "*" in cors_origins:
            allowed = True
        # Check IP range patterns
        elif is_allowed_ip_range(origin):
            allowed = True
    
    # Handle preflight requests (OPTIONS) before they reach the endpoint
    if request.method == "OPTIONS" and allowed:
        from fastapi.responses import Response
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response
    
    response = await call_next(request)
    
    # Add CORS headers to all responses from allowed origins
    if allowed and origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

# Add the custom middleware
app.middleware("http")(custom_cors_handler)

# Also add the standard CORS middleware as backup
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,
)


# Include routers
app.include_router(chat_router)
app.include_router(customers_router)
app.include_router(contact_router)
app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(email_router)
app.include_router(share_router)
app.include_router(api_router)
app.include_router(financial_router, prefix="/api")
app.include_router(schedule_router)
app.include_router(google_auth_router)
app.include_router(voice_agent_router)
app.include_router(admin_jobs_router)

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

@app.get("/api/test/users")
async def get_users_test():
    """Test endpoint to verify migrated users"""
    from database import get_db
    from database.models import User
    from sqlalchemy.orm import Session
    
    db_gen = get_db()
    db = next(db_gen)
    try:
        users = db.query(User).all()
        return [{"id": u.id, "email": u.email, "user_type": u.user_type, "status": u.status, "name": u.name, "is_admin": u.is_admin, "is_customer": u.is_customer, "is_active": u.is_active} for u in users]
    finally:
        db.close()

@app.get("/api/debug/auth")
async def debug_auth(current_user: dict = Depends(get_current_user)):
    """Debug endpoint to check current user authentication"""
    return {
        "authenticated": True,
        "user_data": current_user,
        "is_admin": current_user.get("is_admin", False),
        "user_type": current_user.get("user_type"),
        "user_id": current_user.get("user_id")
    }

@app.get("/api/debug/auth-simple")  
async def debug_auth_simple():
    """Simple auth test endpoint that doesn't require authentication"""
    return {
        "message": "This endpoint works without authentication",
        "timestamp": datetime.utcnow().isoformat()
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
    
    # Validate required environment variables
    try:
        config.validate_required_env_vars()
        print("âœ… Environment variables validated successfully")
    except ValueError as e:
        print(f"âŒ Configuration error: {e}")
        sys.exit(1)
    
    print(f"ðŸš€ Starting backend server on {config.BACKEND_HOST}:{config.BACKEND_PORT}")
    print(f"ðŸŒ Environment: {config.ENVIRONMENT}")
    print(f"ðŸ”— Backend URL: {config.BACKEND_URL}")
    
    uvicorn.run("main:app", host=config.BACKEND_HOST, port=config.BACKEND_PORT, reload=True)





