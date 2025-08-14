#!/usr/bin/env python3
"""
Database migration script to add new address columns to customers table
"""

from sqlalchemy import text, MetaData, Table
from database import engine
import sys

def migrate_customer_address_columns():
    """Add new address columns to the customers table"""
    
    try:
        with engine.connect() as conn:
            # Start a transaction
            trans = conn.begin()
            
            try:
                # Check existing columns
                result = conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'customers' AND table_schema = 'public'
                """))
                existing_columns = [row[0] for row in result.fetchall()]
                print(f"✅ Found existing columns: {existing_columns}")
                
                # Define columns to add
                columns_to_add = [
                    ('state', 'VARCHAR(100)'),
                    ('city', 'VARCHAR(100)'), 
                    ('zip_code', 'VARCHAR(20)'),
                    ('country', 'VARCHAR(100)')
                ]
                
                # Add missing columns
                for col_name, col_type in columns_to_add:
                    if col_name not in existing_columns:
                        try:
                            sql = f"ALTER TABLE customers ADD COLUMN {col_name} {col_type}"
                            conn.execute(text(sql))
                            print(f"✅ Added column: {col_name} {col_type}")
                        except Exception as e:
                            print(f"❌ Error adding {col_name}: {e}")
                            # Continue with other columns
                    else:
                        print(f"⏭️  Column {col_name} already exists")
                
                # Commit the transaction
                trans.commit()
                print("✅ Migration completed successfully!")
                
            except Exception as e:
                # Rollback on error
                trans.rollback()
                print(f"❌ Migration failed: {e}")
                raise e
                
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🔄 Starting customer address columns migration...")
    migrate_customer_address_columns()
