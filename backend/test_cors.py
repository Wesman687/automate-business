#!/usr/bin/env python3
"""
Test CORS preflight requests to verify the fix
"""

import requests

def test_cors_preflight():
    """Test CORS preflight request"""
    url = "http://localhost:8005/api/sessions/test123/seen"
    
    # Simulate browser preflight request
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "PATCH",
        "Access-Control-Request-Headers": "content-type"
    }
    
    try:
        print("🔧 Testing CORS preflight request...")
        print(f"URL: {url}")
        print(f"Headers: {headers}")
        
        response = requests.options(url, headers=headers, timeout=5)
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers:")
        for key, value in response.headers.items():
            if "access-control" in key.lower() or "cors" in key.lower():
                print(f"  {key}: {value}")
        
        if response.status_code == 200:
            print("✅ CORS preflight request successful!")
        else:
            print(f"❌ CORS preflight failed with status {response.status_code}")
            print(f"Response text: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - is the backend server running on port 8005?")
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_actual_patch():
    """Test the actual PATCH request"""
    url = "http://localhost:8005/api/sessions/test123/seen"
    
    headers = {
        "Origin": "http://localhost:3000",
        "Content-Type": "application/json"
    }
    
    data = {"is_seen": True}
    
    try:
        print("\n🔧 Testing actual PATCH request...")
        response = requests.patch(url, json=data, headers=headers, timeout=5)
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📊 Response: {response.text}")
        
        if response.status_code in [200, 404]:  # 404 is expected for test123
            print("✅ PATCH request processed (CORS working)")
        else:
            print(f"❌ PATCH request failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - is the backend server running on port 8005?")
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    print("🚀 Testing CORS Configuration")
    print("=" * 50)
    
    test_cors_preflight()
    test_actual_patch()
    
    print("\n💡 If tests fail, make sure:")
    print("   1. Backend server is running: python main.py")
    print("   2. Server is on port 8005")
    print("   3. CORS middleware is properly configured")
