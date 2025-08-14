"""
Configuration management for the backend application.
Centralizes environment variable handling.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration class"""
    
    # Server Configuration
    BACKEND_HOST = os.getenv("BACKEND_HOST", "localhost")
    BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8005"))
    BACKEND_URL = os.getenv("BACKEND_URL", f"http://{BACKEND_HOST}:{BACKEND_PORT}")
    
    # Environment
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    
    # OpenAI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "5432"))
    DB_NAME = os.getenv("DB_NAME", "streamlineai")
    DB_USER = os.getenv("DB_USER", "streamlineai")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    
    # Security
    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
    
    # Email Configuration
    SMTP_SERVER = os.getenv("SMTP_SERVER", "mail.stream-lineai.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    
    # Email Accounts
    NO_REPLY_EMAIL = os.getenv("NO_REPLY_EMAIL")
    NO_REPLY_PASSWORD = os.getenv("NO_REPLY_PASSWORD")
    SALES_EMAIL = os.getenv("SALES_EMAIL")
    SALES_PASSWORD = os.getenv("SALES_PASSWORD")
    TECH_EMAIL = os.getenv("TECH_EMAIL")
    TECH_PASSWORD = os.getenv("TECH_PASSWORD")
    
    # CORS
    CORS_ALLOW_ALL = os.getenv("CORS_ALLOW_ALL", "true").lower() == "true"
    
    @classmethod
    def validate_required_env_vars(cls):
        """Validate that required environment variables are set"""
        required_vars = [
            ("OPENAI_API_KEY", cls.OPENAI_API_KEY),
            ("DATABASE_URL", cls.DATABASE_URL),
            ("ENCRYPTION_KEY", cls.ENCRYPTION_KEY),
        ]
        
        missing_vars = []
        for var_name, var_value in required_vars:
            if not var_value:
                missing_vars.append(var_name)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        return True

# Create a config instance
config = Config()
