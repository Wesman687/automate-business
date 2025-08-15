"""
Comprehensive authentication audit and fix script
"""

def test_auth_endpoints():
    """Test authentication endpoints with logging"""
    import requests
    import json
    
    base_url = "http://localhost:8005"
    
    print("🔍 AUTHENTICATION AUDIT")
    print("=" * 50)
    
    # Test 1: Simple endpoint (no auth required)
    try:
        response = requests.get(f"{base_url}/api/debug/auth-simple")
        print(f"✅ Simple endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Simple endpoint failed: {e}")
    
    # Test 2: Health check
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health check: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
    
    # Test 3: Check users in database
    try:
        response = requests.get(f"{base_url}/api/test/users")
        print(f"✅ Users endpoint: {response.status_code}")
        users = response.json()
        print(f"   Found {len(users)} users:")
        for user in users:
            print(f"   - {user['email']}: type={user['user_type']}, admin={user['is_admin']}, active={user['is_active']}")
    except Exception as e:
        print(f"❌ Users endpoint failed: {e}")
    
    # Test 4: Try auth endpoints (should fail without cookies)
    try:
        response = requests.get(f"{base_url}/auth/verify")
        print(f"🔒 Auth verify (no cookies): {response.status_code}")
        if response.status_code != 401:
            print(f"   Unexpected: {response.text}")
    except Exception as e:
        print(f"❌ Auth verify failed: {e}")
    
    try:
        response = requests.get(f"{base_url}/api/sessions") 
        print(f"🔒 Sessions (no cookies): {response.status_code}")
        if response.status_code != 401:
            print(f"   Unexpected: {response.text}")
    except Exception as e:
        print(f"❌ Sessions failed: {e}")
        
    print("\n📝 Next Steps:")
    print("1. Check if admin user has is_admin=True in database")
    print("2. Test login flow and check cookies")
    print("3. Verify frontend sends cookies with requests")

if __name__ == "__main__":
    test_auth_endpoints()
