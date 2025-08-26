#!/usr/bin/env python3
"""Check the actual schema of credits_transactions table"""

import os
import sys
from sqlalchemy import create_engine, text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import config

def check_credits_transactions_schema():
    """Check the actual schema of credits_transactions table"""
    try:
        # Get database URL
        database_url = config.DATABASE_URL
        print(f"Database URL: {database_url}")
        
        # Create engine
        engine = create_engine(database_url)
        
        # Check credits_transactions table schema
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT 
                    column_name,
                    data_type,
                    udt_name,
                    is_nullable,
                    column_default
                FROM information_schema.columns 
                WHERE table_name = 'credits_transactions'
                ORDER BY ordinal_position
            """))
            
            print("credits_transactions table schema:")
            for row in result.fetchall():
                print(f"  {row[0]}: {row[1]} ({row[2]}) - nullable: {row[3]}, default: {row[4]}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_credits_transactions_schema()
