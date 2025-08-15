#!/usr/bin/env python3
"""
Quick script to check what admin users exist in the database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db
from database.models import User
from sqlalchemy.orm import Session

def check_admin_users():
    """Check what admin users exist"""
    db = next(get_db())
    
    print("🔍 Checking admin users in database...")
    
    # Get all users
    users = db.query(User).all()
    print(f"Total users found: {len(users)}")
    
    for user in users:
        print(f"\n👤 User ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.name}")
        print(f"   User Type: {user.user_type}")
        print(f"   Is Admin: {user.is_admin}")
        print(f"   Is Customer: {user.is_customer}")
        print(f"   Is Super Admin: {user.is_super_admin}")
        print(f"   Password Hash: {user.password_hash[:20] if user.password_hash else 'None'}...")
    
    db.close()

if __name__ == "__main__":
    check_admin_users()
