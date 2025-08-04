"""
Database initialization and migration script for Streamline AI Backend
"""

from database.database import create_tables, engine
from database.models import Base
import os

def init_database():
    """Initialize the database with all tables"""
    print("🗄️  Initializing Streamline AI Database...")
    
    # Create all tables
    create_tables()
    
    # Check if database file was created (for SQLite)
    if "sqlite" in str(engine.url):
        db_file = str(engine.url).replace("sqlite:///", "")
        if os.path.exists(db_file):
            print(f"✅ SQLite database created: {db_file}")
        else:
            print("❌ Database creation failed")
            return False
    
    print("✅ All database tables created successfully!")
    print("📊 Database structure:")
    print("   - customers: Store customer information and contact details")
    print("   - chat_sessions: Track chat conversations")
    print("   - chat_messages: Store individual chat messages")
    
    return True

if __name__ == "__main__":
    init_database()
