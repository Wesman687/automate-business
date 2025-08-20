#!/usr/bin/env python3
"""
Selective Database Cleanup Script
This script will clean up only specific problematic tables to fix user_id mismatches.
"""

import sys
from sqlalchemy import create_engine, text
from config import config

def selective_cleanup():
    """Clean up only specific problematic tables"""
    
    print("🧹 Starting selective database cleanup...")
    
    # Create engine
    engine = create_engine(config.DATABASE_URL)
    
    # Tables to clean up (in order of dependencies)
    tables_to_clean = [
        "time_entries",      # Depends on jobs
        "jobs",              # Depends on users
        "appointments",      # Depends on users
        "portal_invites",    # Depends on users
        "chat_messages",     # Depends on chat_sessions
        "chat_sessions",     # Depends on users
        "customer_change_requests", # Depends on users
        "invoices",          # Depends on users
        "recurring_payments", # Depends on users
        "users"              # Base table
    ]
    
    try:
        with engine.connect() as conn:
            # Disable foreign key checks temporarily
            conn.execute(text("SET session_replication_role = replica;"))
            
            for table in tables_to_clean:
                try:
                    print(f"🗑️  Cleaning table: {table}")
                    conn.execute(text(f"TRUNCATE TABLE {table} CASCADE;"))
                    print(f"✅ Table {table} cleaned successfully")
                except Exception as e:
                    print(f"⚠️  Could not clean table {table}: {e}")
                    # Try to drop and recreate
                    try:
                        conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE;"))
                        print(f"✅ Table {table} dropped successfully")
                    except Exception as drop_error:
                        print(f"❌ Could not drop table {table}: {drop_error}")
            
            # Re-enable foreign key checks
            conn.execute(text("SET session_replication_role = DEFAULT;"))
            conn.commit()
            
        print("🎉 Selective cleanup completed successfully!")
        print("📝 You can now recreate users and data from scratch")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        sys.exit(1)

def confirm_cleanup():
    """Ask for confirmation before proceeding"""
    
    print("⚠️  WARNING: This will DELETE DATA from specific tables!")
    print("   - Users, appointments, jobs, etc. will be lost")
    print("   - This action cannot be undone")
    print("   - You will need to recreate users and data from scratch")
    print("")
    
    response = input("Are you sure you want to continue? Type 'YES' to confirm: ")
    
    if response != "YES":
        print("❌ Cleanup cancelled")
        sys.exit(0)
    
    print("✅ Confirmation received, proceeding with cleanup...")

if __name__ == "__main__":
    print("=" * 60)
    print("🗄️  SELECTIVE DATABASE CLEANUP SCRIPT")
    print("=" * 60)
    print("")
    
    # Ask for confirmation
    confirm_cleanup()
    
    # Proceed with cleanup
    selective_cleanup()
