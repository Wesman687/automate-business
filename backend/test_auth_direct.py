#!/usr/bin/env python3
"""
Test the authentication service directly
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db
from services.auth_service import AuthService

def test_auth_directly():
    """Test authentication service directly"""
    db = next(get_db())
    auth_service = AuthService(db)
    
    print("🔐 Testing authentication service directly...")
    
    # Test with the known admin email
    email = "Wesman687@gmail.com"
    passwords_to_try = [
        "admin123",
        "password", 
        "admin",
        "123456",
        "Password123",
        "streamlineai",
        "paul123"
    ]
    
    for password in passwords_to_try:
        print(f"\n🔑 Trying password: '{password}'")
        
        try:
            user_data = auth_service.authenticate_user(email, password)
            if user_data:
                print(f"✅ SUCCESS! Password '{password}' works!")
                print(f"User data: {user_data}")
                
                # Test token creation
                token = auth_service.create_access_token(user_data)
                print(f"🔑 Token created: {token[:20]}...")
                
                # Test token verification
                verified_data = auth_service.verify_token(token)
                print(f"✅ Token verified: {verified_data['email'] if verified_data else 'Failed'}")
                
                db.close()
                return user_data, password
            else:
                print(f"❌ Password '{password}' failed")
        except Exception as e:
            print(f"❌ Error with password '{password}': {e}")
    
    print("\n❌ No working password found!")
    db.close()
    return None, None

if __name__ == "__main__":
    test_auth_directly()
