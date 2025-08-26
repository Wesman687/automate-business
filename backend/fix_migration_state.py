#!/usr/bin/env python3
"""Fix broken migration state in database"""

import os
import sys
from sqlalchemy import create_engine, text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import config

def fix_migration_state():
    """Fix the broken migration state by updating alembic_version table"""
    try:
        # Get database URL
        database_url = config.DATABASE_URL
        print(f"Database URL: {database_url}")
        
        # Create engine
        engine = create_engine(database_url)
        
        # Check current state
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM alembic_version"))
            row = result.fetchone()
            if row:
                print(f"Current migration version in database: {row[0]}")
            else:
                print("No migration version found in database")
                return
            
            # Update to the last working migration (012)
            print("Updating migration version to '012'...")
            conn.execute(text("UPDATE alembic_version SET version_num = '012'"))
            conn.commit()
            print("✅ Migration version updated to '012'")
            
            # Verify the change
            result = conn.execute(text("SELECT * FROM alembic_version"))
            row = result.fetchone()
            print(f"New migration version in database: {row[0]}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_migration_state()
