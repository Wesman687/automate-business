#!/usr/bin/env python3
"""Check current migration state in database"""

import os
import sys
from sqlalchemy import create_engine, text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import config

def check_migration_state():
    """Check what migration version the database thinks it's on"""
    try:
        # Get database URL
        database_url = config.DATABASE_URL
        print(f"Database URL: {database_url}")
        
        # Create engine
        engine = create_engine(database_url)
        
        # Check alembic_version table
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM alembic_version"))
            row = result.fetchone()
            if row:
                print(f"Current migration version in database: {row[0]}")
            else:
                print("No migration version found in database")
                
            # Check if credit tables exist
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('credit_packages', 'user_subscriptions', 'credit_disputes', 'credit_promotions')
                ORDER BY table_name
            """))
            
            credit_tables = [row[0] for row in result.fetchall()]
            print(f"Credit tables found: {credit_tables}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_migration_state()
