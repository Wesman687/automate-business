#!/usr/bin/env python3
"""
Migration script to add is_seen column to chat_sessions table
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def add_is_seen_column():
    """Add is_seen column to chat_sessions table"""
    
    # Get database URL
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL environment variable not found")
        return False
    
    try:
        # Create engine
        engine = create_engine(database_url)
        
        # Check if column already exists
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'chat_sessions' 
                AND column_name = 'is_seen'
            """))
            
            if result.fetchone():
                print("✅ Column 'is_seen' already exists in chat_sessions table")
                return True
            
            # Add the column
            print("🔧 Adding 'is_seen' column to chat_sessions table...")
            conn.execute(text("""
                ALTER TABLE chat_sessions 
                ADD COLUMN is_seen BOOLEAN DEFAULT FALSE
            """))
            conn.commit()
            
            print("✅ Successfully added 'is_seen' column to chat_sessions table")
            
            # Update existing records to be unseen by default
            result = conn.execute(text("""
                UPDATE chat_sessions 
                SET is_seen = FALSE 
                WHERE is_seen IS NULL
            """))
            conn.commit()
            
            print(f"✅ Updated {result.rowcount} existing chat sessions to unseen")
            
        return True
        
    except Exception as e:
        print(f"❌ Error adding is_seen column: {str(e)}")
        return False

if __name__ == "__main__":
    success = add_is_seen_column()
    sys.exit(0 if success else 1)
