import requests
import json

# Test the sessions API endpoint
BASE_URL = "http://localhost:8005"

def test_get_sessions():
    """Test getting all sessions first"""
    try:
        print("🔍 Testing GET /api/sessions...")
        response = requests.get(f"{BASE_URL}/api/sessions", 
                               cookies={},  # Add any authentication cookies here
                               headers={"Content-Type": "application/json"})
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            sessions = response.json()
            print(f"✅ Found {len(sessions)} sessions")
            if sessions:
                session = sessions[0]
                print(f"First session ID: {session.get('session_id')}")
                print(f"Is seen: {session.get('is_seen')}")
                return session.get('session_id')
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    return None

def test_update_seen_status(session_id: str):
    """Test updating seen status"""
    try:
        print(f"\n🔧 Testing PATCH /api/sessions/{session_id}/seen...")
        
        data = {"is_seen": True}
        response = requests.patch(f"{BASE_URL}/api/sessions/{session_id}/seen",
                                 json=data,
                                 cookies={},  # Add any authentication cookies here
                                 headers={"Content-Type": "application/json"})
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: {result}")
        else:
            print(f"❌ Error: {response.text}")
            print(f"Response headers: {dict(response.headers)}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_options_request(session_id: str):
    """Test OPTIONS request (CORS preflight)"""
    try:
        print(f"\n🔧 Testing OPTIONS /api/sessions/{session_id}/seen...")
        
        response = requests.options(f"{BASE_URL}/api/sessions/{session_id}/seen",
                                   headers={
                                       "Origin": "http://localhost:3000",
                                       "Access-Control-Request-Method": "PATCH",
                                       "Access-Control-Request-Headers": "content-type"
                                   })
        
        print(f"Status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    print("🚀 Testing Chat Sessions API")
    print("=" * 50)
    
    # First get sessions to find a valid session ID
    session_id = test_get_sessions()
    
    if session_id:
        # Test OPTIONS request
        test_options_request(session_id)
        
        # Test PATCH request
        test_update_seen_status(session_id)
    else:
        print("❌ No sessions found to test with")
        # Test with a dummy ID to see the error
        test_options_request("test123")
        test_update_seen_status("test123")
