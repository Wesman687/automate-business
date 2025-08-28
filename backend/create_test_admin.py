#!/usr/bin/env python3
"""
Script to create a test admin user for development/testing
"""

from database import get_db
from services.admin_service import AdminService

def create_test_admin():
    """Create a test admin user"""
    try:
        db = next(get_db())
        admin_service = AdminService(db)
        
        # Create test admin
        admin = admin_service.create_admin(
            email="admin@test.com",
            username="testadmin",
            password="test123",
            full_name="Test Admin",
            phone="555-1234",
            address="123 Test St, Test City, TS 12345",
            is_super_admin=True
        )
        
        print(f"✅ Test admin created successfully!")
        print(f"   ID: {admin.id}")
        print(f"   Email: {admin.email}")
        print(f"   Username: {admin.username}")
        print(f"   Full Name: {admin.full_name}")
        print(f"   Is Super Admin: {admin.is_super_admin}")
        print(f"   Is Active: {admin.is_active}")
        
        return admin
        
    except Exception as e:
        print(f"❌ Error creating test admin: {str(e)}")
        return None

if __name__ == "__main__":
    create_test_admin()
