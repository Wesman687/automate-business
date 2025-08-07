#!/usr/bin/env python3
"""
Quick script to check if admin users exist and create one if needed
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db
from services.admin_service import AdminService

def check_and_create_admin():
    try:
        # Get database session
        db = next(get_db())
        admin_service = AdminService(db)
        
        # Check for any admins
        admins = admin_service.get_all_admins()
        print(f'📊 Total admins in database: {len(admins)}')
        
        if admins:
            print('\n✅ Existing admins:')
            for admin in admins:
                print(f'  - ID: {admin.id}')
                print(f'    Email: {admin.email}')
                print(f'    Username: {admin.username}')
                print(f'    Active: {admin.is_active}')
                print(f'    Super Admin: {admin.is_super_admin}')
                print(f'    Created: {admin.created_at}')
                print()
        else:
            print('\n❌ No admin users found in database!')
            print('This explains the 401 Unauthorized error.')
            print('Let me create a test admin user for you...\n')
            
            # Create initial super admin
            try:
                super_admin = admin_service.setup_initial_super_admin(
                    email="wesman687@gmail.com",
                    username="admin",
                    password="admin123",  # Simple password for testing
                    full_name="Wesley Wesman"
                )
                
                print('✅ Successfully created super admin:')
                print(f'   Email: {super_admin.email}')
                print(f'   Username: {super_admin.username}')
                print(f'   Password: admin123')
                print(f'   Super Admin: {super_admin.is_super_admin}')
                print('\n🔑 You can now login with:')
                print('   Email: wesman687@gmail.com')
                print('   Password: admin123')
                
            except ValueError as e:
                print(f'❌ Error creating admin: {e}')
        
        db.close()
        
    except Exception as e:
        print(f'❌ Database error: {e}')
        print('Make sure the backend server is running and database is connected.')

if __name__ == "__main__":
    check_and_create_admin()
