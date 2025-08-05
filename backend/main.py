from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database.models import Base
from database import engine
from api.chat import router as chat_router
from api.customers import router as customers_router

# Create FastAPI app
app = FastAPI(
    title="Streamline AI Backend",
    version="2.0.0",
    description="Professional automation consulting platform with AI chatbot and customer management"
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

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")
    print("🚀 Streamline AI Backend v2.0 is running!")

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
    uvicorn.run(app, host="0.0.0.0", port=8001)
