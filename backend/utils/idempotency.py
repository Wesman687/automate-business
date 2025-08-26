"""
Idempotency utilities for preventing duplicate operations, especially important for payment processing.
"""
import hashlib
import json
import logging
from typing import Any, Dict, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base

logger = logging.getLogger(__name__)

Base = declarative_base()


class IdempotencyKey(Base):
    """Stores idempotency keys to prevent duplicate operations"""
    __tablename__ = "idempotency_keys"
    
    id = Column(String(255), primary_key=True)
    operation_type = Column(String(100), nullable=False, index=True)
    request_hash = Column(String(255), nullable=False, index=True)
    response_data = Column(Text, nullable=True)  # JSON response data
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    
    def __repr__(self):
        return f"<IdempotencyKey(id='{self.id}', operation_type='{self.operation_type}')>"


class IdempotencyManager:
    """Manages idempotency keys for operations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.default_ttl = timedelta(hours=24)  # 24 hours default TTL
    
    def generate_key(self, operation_type: str, request_data: Dict[str, Any]) -> str:
        """Generate a unique idempotency key for an operation"""
        # Create a hash of the operation type and request data
        request_str = json.dumps(request_data, sort_keys=True)
        hash_input = f"{operation_type}:{request_str}"
        request_hash = hashlib.sha256(hash_input.encode()).hexdigest()
        
        # Generate the idempotency key
        timestamp = datetime.now(timezone.utc).isoformat()
        key = f"{operation_type}_{request_hash[:16]}_{timestamp}"
        
        return key
    
    def check_and_store(
        self,
        idempotency_key: str,
        operation_type: str,
        request_data: Dict[str, Any],
        ttl: Optional[timedelta] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Check if an idempotency key exists and return cached response if it does.
        If not, store the key for future use.
        
        Returns:
            Cached response data if key exists, None if this is a new request
        """
        try:
            # Check if key already exists
            existing_key = self.db.query(IdempotencyKey).filter(
                IdempotencyKey.id == idempotency_key
            ).first()
            
            if existing_key:
                # Check if key has expired
                if existing_key.expires_at < datetime.now(timezone.utc):
                    # Remove expired key
                    self.db.delete(existing_key)
                    self.db.commit()
                else:
                    # Return cached response
                    if existing_key.response_data:
                        try:
                            return json.loads(existing_key.response_data)
                        except json.JSONDecodeError:
                            logger.warning(f"Invalid JSON in idempotency key {idempotency_key}")
                            return None
            
            # Store new key
            expires_at = datetime.now(timezone.utc) + (ttl or self.default_ttl)
            request_hash = hashlib.sha256(
                json.dumps(request_data, sort_keys=True).encode()
            ).hexdigest()
            
            new_key = IdempotencyKey(
                id=idempotency_key,
                operation_type=operation_type,
                request_hash=request_hash,
                expires_at=expires_at,
                created_at=datetime.now(timezone.utc)
            )
            
            self.db.add(new_key)
            self.db.commit()
            
            return None  # New request
            
        except Exception as e:
            logger.error(f"Error in idempotency check: {str(e)}")
            # In case of error, allow the operation to proceed
            return None
    
    def store_response(
        self,
        idempotency_key: str,
        response_data: Dict[str, Any]
    ) -> bool:
        """Store response data for an idempotency key"""
        try:
            key = self.db.query(IdempotencyKey).filter(
                IdempotencyKey.id == idempotency_key
            ).first()
            
            if key:
                key.response_data = json.dumps(response_data)
                self.db.commit()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error storing response for idempotency key {idempotency_key}: {str(e)}")
            return False
    
    def cleanup_expired_keys(self) -> int:
        """Remove expired idempotency keys and return count of removed keys"""
        try:
            expired_keys = self.db.query(IdempotencyKey).filter(
                IdempotencyKey.expires_at < datetime.now(timezone.utc)
            ).all()
            
            count = len(expired_keys)
            for key in expired_keys:
                self.db.delete(key)
            
            self.db.commit()
            
            if count > 0:
                logger.info(f"Cleaned up {count} expired idempotency keys")
            
            return count
            
        except Exception as e:
            logger.error(f"Error cleaning up expired idempotency keys: {str(e)}")
            return 0


def with_idempotency(
    operation_type: str,
    ttl: Optional[timedelta] = None
):
    """
    Decorator to add idempotency to functions
    
    Usage:
        @with_idempotency("create_payment", timedelta(hours=1))
        def create_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
            # Function implementation
            pass
    """
    def decorator(func):
        async def wrapper(self, *args, **kwargs):
            # Extract idempotency key from kwargs or generate one
            idempotency_key = kwargs.pop('idempotency_key', None)
            
            if not idempotency_key:
                # Generate key from function arguments
                request_data = {
                    'args': args,
                    'kwargs': kwargs
                }
                idempotency_key = IdempotencyManager(self.db).generate_key(
                    operation_type, request_data
                )
            
            # Check idempotency
            manager = IdempotencyManager(self.db)
            cached_response = manager.check_and_store(
                idempotency_key, operation_type, {'args': args, 'kwargs': kwargs}, ttl
            )
            
            if cached_response:
                logger.info(f"Returning cached response for idempotency key {idempotency_key}")
                return cached_response
            
            # Execute function
            try:
                result = await func(self, *args, **kwargs)
                
                # Store response
                manager.store_response(idempotency_key, result)
                
                return result
                
            except Exception as e:
                logger.error(f"Error in idempotent function {func.__name__}: {str(e)}")
                raise
        
        return wrapper
    return decorator
