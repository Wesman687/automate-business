#!/usr/bin/env python3
"""
Test script to verify all authentication endpoints are working correctly
"""
import requests
import json

BASE_URL = "http://localhost:8005"

# Create a session to maintain cookies across requests
session = requests.Session()

def test_login():
    """Test admin login"""
    print("🔐 Testing admin login...")
    
    login_data = {
        "email": "Wesman687@gmail.com",
        "password": "admin123"
    }
    
    response = session.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Login response: {response.status_code}")
    print(f"Response cookies: {dict(response.cookies)}")
    print(f"Session cookies after login: {dict(session.cookies)}")
    
    if response.status_code == 200:
        print("✅ Login successful")
        print(f"Login response data: {response.json()}")
        return True
    else:
        print(f"❌ Login failed: {response.text}")
        return False

def test_verify_auth():
    """Test auth verification"""
    print("🔍 Testing auth verification...")
    
    response = session.get(f"{BASE_URL}/auth/verify")
    print(f"Verify response: {response.status_code}")
    print(f"Session cookies: {dict(session.cookies)}")
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Auth verified: {user_data}")
        return user_data
    else:
        print(f"❌ Auth verification failed: {response.text}")
        return None

def test_sessions_endpoint():
    """Test the admin-only sessions endpoint"""
    print("🗨️ Testing sessions endpoint...")
    
    response = session.get(f"{BASE_URL}/api/sessions")
    print(f"Sessions response: {response.status_code}")
    print(f"Session cookies: {dict(session.cookies)}")
    
    if response.status_code == 200:
        sessions = response.json()
        print(f"✅ Sessions retrieved: {len(sessions)} sessions")
        return sessions
    else:
        print(f"❌ Sessions endpoint failed: {response.text}")
        return None

def test_customers_endpoint():
    """Test the customers endpoint"""
    print("👥 Testing customers endpoint...")
    
    response = session.get(f"{BASE_URL}/api/customers")
    print(f"Customers response: {response.status_code}")
    
    if response.status_code == 200:
        customers = response.json()
        print(f"✅ Customers retrieved: {len(customers)} customers")
        return customers
    else:
        print(f"❌ Customers endpoint failed: {response.text}")
        return None

def test_appointments_endpoint():
    """Test the appointments endpoint"""
    print("📅 Testing appointments endpoint...")
    
    response = session.get(f"{BASE_URL}/api/appointments")
    print(f"Appointments response: {response.status_code}")
    
    if response.status_code == 200:
        appointments = response.json()
        print(f"✅ Appointments retrieved: {len(appointments)} appointments")
        return appointments
    else:
        print(f"❌ Appointments endpoint failed: {response.text}")
        return None

def test_customer_appointments_endpoint():
    """Test the customer appointments endpoint"""
    print("📅 Testing customer appointments endpoint...")
    
    response = session.get(f"{BASE_URL}/api/appointments/customer")
    print(f"Customer appointments response: {response.status_code}")
    
    if response.status_code == 200:
        appointments = response.json()
        print(f"✅ Customer appointments retrieved: {len(appointments)} appointments")
        return appointments
    else:
        print(f"❌ Customer appointments endpoint failed: {response.text}")
        return None

def test_with_authorization_header():
    """Test using Authorization header instead of cookies"""
    print("\n� Testing with Authorization header...")
    
    # First login to get the token
    login_data = {
        "email": "Wesman687@gmail.com", 
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code != 200:
        print("❌ Failed to get token for header test")
        return
    
    token = response.json().get("token")
    print(f"Got token: {token[:20]}...")
    
    # Test sessions endpoint with header
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/sessions", headers=headers)
    print(f"Sessions with header: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Authorization header works!")
    else:
        print(f"❌ Header auth failed: {response.text}")

def main():
    print("🚀 Starting authentication endpoint tests...\n")
    
    # Test login
    if not test_login():
        print("❌ Cannot proceed without valid authentication")
        return
    
    print()
    
    # Test auth verification
    user_data = test_verify_auth()
    if not user_data:
        print("❌ Cannot proceed without valid auth verification")
        return
    
    print()
    
    # Test all endpoints with session cookies
    print("=" * 50)
    print("TESTING ALL ENDPOINTS WITH SESSION COOKIES")
    print("=" * 50)
    
    test_sessions_endpoint()
    print()
    
    test_customers_endpoint()
    print()
    
    test_appointments_endpoint()
    print()
    
    test_customer_appointments_endpoint()
    print()
    
    # Test with authorization header
    test_with_authorization_header()
    
    print("\n🎉 All tests completed!")

if __name__ == "__main__":
    main()
