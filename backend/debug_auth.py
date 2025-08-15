"""
Debug script to test authentication system
"""
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db
from database.models import User
from api.auth import get_current_user
import sys

def debug_users():
    """Check what users exist in the database"""
    from database import engine
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        users = db.query(User).all()
        print("=== USERS IN DATABASE ===")
        for user in users:
            print(f"ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Name: {user.name}")
            print(f"User Type: {user.user_type}")
            print(f"Is Admin: {user.is_admin}")
            print(f"Is Customer: {user.is_customer}")
            print(f"Is Active: {user.is_active}")
            print(f"Status: {user.status}")
            print(f"Has Password: {'Yes' if user.password_hash else 'No'}")
            print("-" * 40)
    finally:
        db.close()

if __name__ == "__main__":
    debug_users()
