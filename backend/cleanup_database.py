#!/usr/bin/env python3
"""
Database Cleanup Script
This script will clean up the database by dropping and recreating tables
to fix user_id mismatches after the merge.
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database.database import get_db
from database.models import Base
from config import config

def cleanup_database():
    """Clean up the database by dropping and recreating all tables"""
    
    print("🧹 Starting database cleanup...")
    
    # Create engine
    engine = create_engine(config.DATABASE_URL)
    
    try:
        # Drop all tables
        print("🗑️  Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("✅ All tables dropped successfully")
        
        # Recreate all tables
        print("🏗️  Recreating all tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables recreated successfully")
        
        # Create a fresh admin user
        print("👑 Creating fresh admin user...")
        create_fresh_admin(engine)
        
        print("🎉 Database cleanup completed successfully!")
        print("📝 You can now log in with:")
        print("   Email: admin@stream-lineai.com")
        print("   Password: admin123")
        print("")
        print("⚠️  IMPORTANT: Change the admin password after first login!")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        sys.exit(1)

def create_fresh_admin(engine):
    """Create a fresh admin user"""
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create admin user
        from database.models import User
        from services.auth_service import AuthService
        
        auth_service = AuthService(db)
        
        admin_user = User(
            email="admin@stream-lineai.com",
            password_hash=auth_service.hash_password("admin123"),
            user_type="admin",
            status="active",
            name="System Administrator",
            username="admin",
            is_super_admin=True
        )
        
        db.add(admin_user)
        db.commit()
        
        print("✅ Admin user created successfully")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def confirm_cleanup():
    """Ask for confirmation before proceeding"""
    
    print("⚠️  WARNING: This will DELETE ALL DATA from the database!")
    print("   - All users, customers, appointments, jobs, etc. will be lost")
    print("   - This action cannot be undone")
    print("   - You will need to recreate all data from scratch")
    print("")
    
    response = input("Are you sure you want to continue? Type 'YES' to confirm: ")
    
    if response != "YES":
        print("❌ Cleanup cancelled")
        sys.exit(0)
    
    print("✅ Confirmation received, proceeding with cleanup...")

if __name__ == "__main__":
    print("=" * 60)
    print("🗄️  DATABASE CLEANUP SCRIPT")
    print("=" * 60)
    print("")
    
    # Ask for confirmation
    confirm_cleanup()
    
    # Proceed with cleanup
    cleanup_database()
