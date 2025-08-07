#!/usr/bin/env python3
"""
Initial admin setup script for StreamlineAI backend
Run this script to create the initial super admin user
"""

import os
import sys
from getpass import getpass

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.postgresql import get_db
from services.admin_service import AdminService

def setup_initial_admin():
    """Setup the initial super admin"""
    print("🚀 StreamlineAI Admin Setup")
    print("=" * 40)
    
    # Get database session
    db = next(get_db())
    admin_service = AdminService(db)
    
    # Check if super admin already exists
    try:
        print("✅ Checking for existing super admin...")
        
        # Try to setup the default super admin
        admin = admin_service.setup_initial_super_admin(
            email="wesman687@gmail.com",
            username="wesman687",
            password="admin123",  # Change this after first login!
            full_name="Wes Manion"
        )
        
        print("✅ Super admin created successfully!")
        print(f"📧 Email: {admin.email}")
        print(f"👤 Username: {admin.username}")
        print(f"🔑 Temporary Password: admin123")
        print()
        print("⚠️  IMPORTANT: Please change the password after first login!")
        print("🌐 Login at: http://localhost:3002/admin")
        
    except ValueError as e:
        if "Super admin already exists" in str(e):
            print("ℹ️  Super admin already exists")
            print("🌐 Login at: http://localhost:3002/admin")
        else:
            print(f"❌ Error: {e}")
    except Exception as e:
        print(f"❌ Error setting up admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_initial_admin()
