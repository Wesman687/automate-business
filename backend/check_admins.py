#!/usr/bin/env python3
"""
Quick script to check if any admin users exist in the database
"""
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db
from services.admin_service import AdminService

def check_admins():
    """Check if any admin users exist"""
    try:
        # Get database session
        db = next(get_db())
        admin_service = AdminService(db)
        
        # Get all admins
        admins = admin_service.get_all_admins()
        
        print(f"🔍 Checking admin users in database...")
        print(f"📊 Total admin users found: {len(admins)}")
        
        if not admins:
            print("❌ No admin users found in database!")
            print("💡 You need to create an admin user first.")
            print("📧 Example: wesman687@gmail.com with a password")
            return False
        
        print("\n👥 Admin users:")
        for admin in admins:
            status = "✅ Active" if admin.is_active else "❌ Inactive"
            super_admin = "🔑 Super Admin" if admin.is_super_admin else "👤 Regular Admin"
            print(f"  • {admin.email} ({admin.username}) - {status} - {super_admin}")
            print(f"    Created: {admin.created_at}")
            if admin.last_login:
                print(f"    Last login: {admin.last_login}")
            print()
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking admins: {e}")
        return False
    finally:
        if 'db' in locals():
            db.close()

def create_test_admin():
    """Create a test admin user"""
    try:
        db = next(get_db())
        admin_service = AdminService(db)
        
        email = "wesman687@gmail.com"
        username = "wesman687"
        password = "Pothead420!"  # Simple password for testing
        full_name = "Paul Miracle"
        
        print(f"🔨 Creating test admin user...")
        print(f"📧 Email: {email}")
        print(f"👤 Username: {username}")
        print(f"🔐 Password: {password}")
        
        admin = admin_service.setup_initial_super_admin(
            email=email,
            username=username,
            password=password,
            full_name=full_name
        )
        
        print(f"✅ Admin user created successfully!")
        print(f"🆔 Admin ID: {admin.id}")
        return True
        
    except ValueError as e:
        if "already exists" in str(e):
            print(f"ℹ️  Admin user already exists: {e}")
            return True
        else:
            print(f"❌ Error creating admin: {e}")
            return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    print("🚀 StreamlineAI Admin Check Tool")
    print("=" * 50)
    
    # Check existing admins
    has_admins = check_admins()
    
    if not has_admins:
        print("\n" + "=" * 50)
        response = input("Would you like to create a test admin user? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            create_test_admin()
            print("\n" + "=" * 50)
            print("🔄 Checking admins again...")
            check_admins()
    
    print("=" * 50)
    print("✨ Done!")
