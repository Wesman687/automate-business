#!/usr/bin/env python3
"""Check existing enum types in database"""

import os
import sys
from sqlalchemy import create_engine, text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import config

def check_existing_enums():
    """Check what enum types already exist in the database"""
    try:
        # Get database URL
        database_url = config.DATABASE_URL
        print(f"Database URL: {database_url}")
        
        # Create engine
        engine = create_engine(database_url)
        
        # Check existing enum types
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT t.typname, e.enumlabel
                FROM pg_type t 
                JOIN pg_enum e ON t.oid = e.enumtypid  
                JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                WHERE n.nspname = 'public'
                ORDER BY t.typname, e.enumsortorder
            """))
            
            enums = {}
            for row in result.fetchall():
                enum_name = row[0]
                enum_value = row[1]
                if enum_name not in enums:
                    enums[enum_name] = []
                enums[enum_name].append(enum_value)
            
            print("Existing enum types in database:")
            for enum_name, values in enums.items():
                print(f"  {enum_name}: {values}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_existing_enums()
