#!/usr/bin/env python3

import requests

# Test the backend with proper authentication
def test_backend_auth():
    base_url = "http://localhost:8005"
    
    # Login first
    login_data = {
        "email": "Wesman687@gmail.com",
        "password": "Pothead420!"
    }
    
    print("🔐 Testing backend authentication...")
    
    # Create session
    session = requests.Session()
    
    # Login
    login_response = session.post(f"{base_url}/auth/login", json=login_data)
    print(f"Login status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        data = login_response.json()
        token = data.get('token')
        print(f"Got token: {token[:50]}...")
        
        # Test appointments with proper Authorization header
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        appointments_response = session.get(f"{base_url}/api/appointments", headers=headers)
        print(f"Appointments status: {appointments_response.status_code}")
        
        if appointments_response.status_code == 200:
            appointments = appointments_response.json()
            print(f"✅ Got {len(appointments)} appointments")
        else:
            print(f"❌ Appointments error: {appointments_response.text}")
            
        # Test smart slots
        smart_slots_response = session.get(f"{base_url}/api/appointments/smart-slots?duration_minutes=60&days_ahead=14", headers=headers)
        print(f"Smart slots status: {smart_slots_response.status_code}")
        
        if smart_slots_response.status_code == 200:
            slots = smart_slots_response.json()
            print(f"✅ Got smart slots: {slots.get('total_available_dates', 0)} available dates")
        else:
            print(f"❌ Smart slots error: {smart_slots_response.text}")
        
        # Test with NULL token (simulating the bug)
        print("\n🚫 Testing with null token (simulating the bug)...")
        bad_headers = {
            'Authorization': 'Bearer null',
            'Content-Type': 'application/json'
        }
        
        bad_response = session.get(f"{base_url}/api/appointments", headers=bad_headers)
        print(f"Null token status: {bad_response.status_code}")
        print(f"Null token error: {bad_response.text}")
    else:
        print(f"❌ Login failed: {login_response.text}")

if __name__ == "__main__":
    test_backend_auth()
