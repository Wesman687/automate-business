
from fastapi import FastAPI, Request, HTTPException
import subprocess
import logging
import yaml
import os
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
    handlers=[
        logging.FileHandler('/home/ubuntu/streamlineai/backend/logs/webhook.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('webhook')

app = FastAPI(
    title="StreamlineAI Webhook",
    description="Webhook for auto-updating StreamlineAI backend from GitHub",
    version="1.0.0"
)

@app.post("/webhook")
async def github_webhook(request: Request):
    """Handle GitHub webhook for auto-updates"""
    try:
        payload = await request.body()
        headers = dict(request.headers)
        
        logger.info(f"Webhook received from {request.client.host}")
        logger.info(f"Headers: {headers}")
        
        # Change to the streamlineai directory
        repo_path = "/home/ubuntu/streamlineai"
        backend_path = "/home/ubuntu/streamlineai/backend"
        
        # Pull latest changes
        logger.info("Pulling latest changes from GitHub...")
        pull_result = subprocess.run(
            ["git", "pull", "origin", "master"], 
            cwd=repo_path, 
            capture_output=True, 
            text=True
        )
        
        if pull_result.returncode != 0:
            logger.error(f"Git pull failed: {pull_result.stderr}")
            raise HTTPException(status_code=500, detail="Git pull failed")
        
        logger.info(f"Git pull output: {pull_result.stdout}")
        
        # Fix script permissions after git pull
        logger.info("Fixing script permissions...")
        chmod_result = subprocess.run([
            "chmod", "+x", f"{backend_path}/start_main.sh"
        ], capture_output=True, text=True)
        
        if chmod_result.returncode != 0:
            logger.warning(f"Failed to fix permissions: {chmod_result.stderr}")
        
        # Activate virtual environment and install/update requirements
        logger.info("Installing/updating requirements...")
        install_result = subprocess.run([
            "bash", "-c", 
            f"cd {backend_path} && source .venv/bin/activate && pip install -r requirements.txt"
        ], capture_output=True, text=True)
        
        if install_result.returncode != 0:
            logger.warning(f"Requirements installation had issues: {install_result.stderr}")
            # Don't fail the webhook if requirements installation has warnings
        
        logger.info(f"Requirements installation output: {install_result.stdout}")
        
        # Restart the main service
        logger.info("Restarting streamlineai-main service...")
        restart_result = subprocess.run([
            "sudo", "systemctl", "restart", "streamlineai-main"
        ], capture_output=True, text=True)
        
        if restart_result.returncode != 0:
            logger.error(f"Service restart failed: {restart_result.stderr}")
            raise HTTPException(status_code=500, detail="Service restart failed")
        
        logger.info("StreamlineAI backend updated and restarted successfully")
        
        return {
            "status": "success", 
            "message": "StreamlineAI backend updated and restarted",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Webhook processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "StreamlineAI Webhook Service", 
        "version": "1.0.0",
        "webhook_endpoint": "/webhook"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "StreamlineAI Webhook",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
