"""
Database Logger - Middleware to log all database operations
"""
import logging
import time
from sqlalchemy import event
from sqlalchemy.engine import Engine
from datetime import datetime
import json

# Create database logger
db_logger = logging.getLogger('database')
db_logger.setLevel(logging.INFO)

# Create file handler for database logs
import os
log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
os.makedirs(log_dir, exist_ok=True)
db_handler = logging.FileHandler(os.path.join(log_dir, 'database.log'), encoding='utf-8')
db_handler.setLevel(logging.INFO)

# Create formatter
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(name)s | %(message)s')
db_handler.setFormatter(formatter)

# Add handler to logger
if not db_logger.handlers:
    db_logger.addHandler(db_handler)

class DatabaseLogger:
    def __init__(self):
        self.start_time = None
        
    def log_query(self, query, params=None, execution_time=None, error=None):
        """Log database query with details"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'query': str(query),
            'parameters': str(params) if params else None,
            'execution_time_ms': execution_time,
            'status': 'ERROR' if error else 'SUCCESS',
            'error': str(error) if error else None
        }
        
        if error:
            db_logger.error(f"DATABASE ERROR: {json.dumps(log_data, indent=2)}")
        else:
            db_logger.info(f"DATABASE QUERY: {json.dumps(log_data, indent=2)}")

# Global database logger instance
database_logger = DatabaseLogger()

# SQLAlchemy event listeners for automatic logging
@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Log before query execution"""
    database_logger.start_time = time.time()
    
    # Log the query start
    db_logger.info(f"EXECUTING QUERY: {statement[:200]}{'...' if len(statement) > 200 else ''}")
    if parameters:
        db_logger.info(f"PARAMETERS: {parameters}")

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Log after query execution"""
    if database_logger.start_time:
        execution_time = (time.time() - database_logger.start_time) * 1000  # Convert to milliseconds
        database_logger.log_query(statement, parameters, execution_time)
        
        # Log execution time
        if execution_time > 1000:  # Log slow queries (> 1 second)
            db_logger.warning(f"SLOW QUERY ({execution_time:.2f}ms): {statement[:100]}{'...' if len(statement) > 100 else ''}")
        else:
            db_logger.info(f"QUERY COMPLETED ({execution_time:.2f}ms)")

@event.listens_for(Engine, "handle_error")
def handle_error(exception_context):
    """Log database errors"""
    database_logger.log_query(
        exception_context.statement,
        exception_context.parameters,
        error=exception_context.original_exception
    )
    
    db_logger.error(f"DATABASE ERROR: {exception_context.original_exception}")

# Connection pool logging
@event.listens_for(Engine, "connect")
def connect(dbapi_conn, connection_record):
    """Log database connections"""
    db_logger.info(f"NEW DATABASE CONNECTION: {id(dbapi_conn)}")

@event.listens_for(Engine, "checkout")
def checkout(dbapi_conn, connection_record, connection_proxy):
    """Log connection checkout from pool"""
    db_logger.info(f"CONNECTION CHECKOUT: {id(dbapi_conn)}")

@event.listens_for(Engine, "checkin")
def checkin(dbapi_conn, connection_record):
    """Log connection checkin to pool"""
    db_logger.info(f"CONNECTION CHECKIN: {id(dbapi_conn)}")
