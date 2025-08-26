#!/usr/bin/env python3
"""Check if any tables are using the enum types we're trying to create"""

import os
import sys
from sqlalchemy import create_engine, text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import config

def check_enum_usage():
    """Check if any tables are using the enum types we're trying to create"""
    try:
        # Get database URL
        database_url = config.DATABASE_URL
        print(f"Database URL: {database_url}")
        
        # Create engine
        engine = create_engine(database_url)
        
        # Check if any columns are using enum types
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT 
                    t.table_name,
                    c.column_name,
                    c.data_type,
                    c.udt_name
                FROM information_schema.tables t
                JOIN information_schema.columns c ON t.table_name = c.table_name
                WHERE t.table_schema = 'public'
                AND c.data_type = 'USER-DEFINED'
                ORDER BY t.table_name, c.column_name
            """))
            
            enum_columns = []
            for row in result.fetchall():
                enum_columns.append({
                    'table': row[0],
                    'column': row[1],
                    'data_type': row[2],
                    'udt_name': row[3]
                })
            
            if enum_columns:
                print("Tables using USER-DEFINED types (potential enums):")
                for col in enum_columns:
                    print(f"  {col['table']}.{col['column']}: {col['udt_name']}")
            else:
                print("No tables using USER-DEFINED types found")
                
            # Also check if the enum types exist in pg_type
            result = conn.execute(text("""
                SELECT typname, typtype
                FROM pg_type 
                WHERE typtype = 'e'  -- 'e' means enum
                AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            """))
            
            existing_enums = [row[0] for row in result.fetchall()]
            if existing_enums:
                print(f"\nExisting enum types in pg_type: {existing_enums}")
            else:
                print("\nNo enum types found in pg_type")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_enum_usage()
