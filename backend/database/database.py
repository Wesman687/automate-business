from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import os
import subprocess
import sqlite3
from datetime import datetime
from services.email_service import email_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/database", tags=["database"])

@router.get("/backup")
async def create_backup(background_tasks: BackgroundTasks):
    """Create a manual database backup"""
    try:
        # Run backup script in background
        result = subprocess.run(["/home/ubuntu/streamlineai/backend/backup_database.sh"], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            # Send notification
            background_tasks.add_task(
                email_service.send_notification,
                "Manual Database Backup",
                f"Manual database backup initiated successfully.\n\nOutput:\n{result.stdout}"
            )
            
            return {
                "status": "success",
                "message": "Backup created successfully",
                "output": result.stdout
            }
        else:
            raise HTTPException(status_code=500, detail=f"Backup failed: {result.stderr}")
            
    except Exception as e:
        logger.error(f"Backup creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/info")
async def database_info():
    """Get database information"""
    try:
        db_path = "/home/ubuntu/streamlineai/backend/streamline_ai.db"
        
        if not os.path.exists(db_path):
            raise HTTPException(status_code=404, detail="Database not found")
        
        # Get database size
        db_size = os.path.getsize(db_path)
        
        # Get table info
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        # Get row counts for each table
        table_info = {}
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            table_info[table] = count
        
        conn.close()
        
        return {
            "database_path": db_path,
            "size_bytes": db_size,
            "size_mb": round(db_size / 1024 / 1024, 2),
            "tables": table_info,
            "last_modified": datetime.fromtimestamp(os.path.getmtime(db_path)).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get database info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/backups")
async def list_backups():
    """List available database backups"""
    try:
        backup_dir = "/home/ubuntu/streamlineai/backups"
        
        if not os.path.exists(backup_dir):
            return {"backups": []}
        
        backups = []
        for file in os.listdir(backup_dir):
            if file.startswith("streamlineai_backup_") and file.endswith(".db.gz"):
                file_path = os.path.join(backup_dir, file)
                backups.append({
                    "filename": file,
                    "size_bytes": os.path.getsize(file_path),
                    "created": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
                })
        
        # Sort by creation time (newest first)
        backups.sort(key=lambda x: x["created"], reverse=True)
        
        return {"backups": backups}
        
    except Exception as e:
        logger.error(f"Failed to list backups: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download-backup/{filename}")
async def download_backup(filename: str):
    """Download a specific backup file"""
    try:
        backup_dir = "/home/ubuntu/streamlineai/backups"
        file_path = os.path.join(backup_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Backup file not found")
        
        if not filename.startswith("streamlineai_backup_"):
            raise HTTPException(status_code=400, detail="Invalid backup filename")
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='application/gzip'
        )
        
    except Exception as e:
        logger.error(f"Failed to download backup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-email")
async def test_email():
    """Test email service"""
    try:
        # Test all email accounts
        results = {}
        
        # Test no-reply
        results["no_reply"] = email_service.send_notification(
            "Email Test",
            "This is a test email from the no-reply account."
        )
        
        # Test sales
        results["sales"] = email_service.send_sales_email(
            to_emails=[email_service.tech_email],
            subject="Sales Email Test",
            body="This is a test email from the sales account."
        )
        
        # Test tech
        results["tech"] = email_service.send_tech_email(
            to_emails=[email_service.sales_email],
            subject="Tech Email Test",
            body="This is a test email from the tech account."
        )
        
        return {
            "status": "completed",
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Email test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
