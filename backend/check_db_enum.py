#!/usr/bin/env python3
"""
Script to check database enum values and existing data for app_integrations table
"""
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_database():
    """Check database enum values and existing data"""
    
    # Use the same DATABASE_URL as the backend
    database_url = os.getenv('DATABASE_URL', 'postgresql://streamlineai:StreamAI2025@server.stream-lineai.com/streamlineai')
    
    try:
        # Connect to database using the same URL as backend
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🔍 Checking database enum values and data...")
        print("=" * 50)
        
        # Check enum type definition
        print("\n1. Checking enum type definition:")
        cur.execute("""
            SELECT t.typname, e.enumlabel, e.enumsortorder
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            WHERE t.typname = 'appstatus'
            ORDER BY e.enumsortorder;
        """)
        
        enum_values = cur.fetchall()
        if enum_values:
            print("   Enum 'appstatus' values:")
            for row in enum_values:
                print(f"   - {row['enumlabel']} (order: {row['enumsortorder']})")
        else:
            print("   No enum type 'appstatus' found")
        
        # Check existing data in app_integrations table
        print("\n2. Checking existing data in app_integrations table:")
        cur.execute("""
            SELECT id, app_id, app_name, status, created_at
            FROM app_integrations
            ORDER BY created_at DESC;
        """)
        
        existing_data = cur.fetchall()
        if existing_data:
            print("   Existing app integrations:")
            for row in existing_data:
                print(f"   - ID: {row['id']}, App: {row['app_name']}, Status: '{row['status']}', Created: {row['created_at']}")
                
            # Check for any uppercase status values
            uppercase_statuses = [row for row in existing_data if row['status'].isupper()]
            if uppercase_statuses:
                print(f"\n   ⚠️  Found {len(uppercase_statuses)} integrations with UPPERCASE status values:")
                for row in uppercase_statuses:
                    print(f"      - ID: {row['id']}, Status: '{row['status']}'")
            else:
                print(f"\n   ✅ All {len(existing_data)} integrations have lowercase status values")
        else:
            print("   No existing app integrations found")
        
        # Check table structure
        print("\n3. Checking table structure:")
        cur.execute("""
            SELECT column_name, data_type, udt_name, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'app_integrations'
            AND column_name = 'status'
            ORDER BY ordinal_position;
        """)
        
        columns = cur.fetchall()
        if columns:
            print("   Status column definition:")
            for col in columns:
                print(f"   - Column: {col['column_name']}")
                print(f"     Type: {col['data_type']}")
                print(f"     UDT: {col['udt_name']}")
                print(f"     Nullable: {col['is_nullable']}")
                print(f"     Default: {col['column_default']}")
        
        cur.close()
        conn.close()
        
        print("\n" + "=" * 50)
        print("✅ Database check completed")
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")

if __name__ == "__main__":
    check_database()
