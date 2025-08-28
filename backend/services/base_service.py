"""
Base service class providing common functionality for all services
"""
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class BaseService:
    """Base class for all services providing common functionality"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def commit(self):
        """Commit the current transaction"""
        try:
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error committing transaction: {e}")
            raise
    
    def rollback(self):
        """Rollback the current transaction"""
        self.db.rollback()
    
    def refresh(self, obj):
        """Refresh an object from the database"""
        self.db.refresh(obj)
        return obj
    
    def close(self):
        """Close the database session"""
        self.db.close()
    
    class IdempotencyManager:
        """Simple idempotency manager for preventing duplicate operations"""
        
        def __init__(self):
            self.processed_operations = set()
        
        def is_processed(self, operation_id: str) -> bool:
            """Check if an operation has already been processed"""
            return operation_id in self.processed_operations
        
        def mark_processed(self, operation_id: str):
            """Mark an operation as processed"""
            self.processed_operations.add(operation_id)
