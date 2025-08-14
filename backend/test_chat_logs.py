"""
Test script for the updated chat logs API
"""

import requests
import json

def test_chat_logs_api():
    """Test the chat logs API endpoints"""
    
    base_url = "http://localhost:8000"
    
    # You'll need to replace this with a valid admin token
    token = "your_admin_token_here"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("🧪 Testing Chat Logs API...")
    
    # Test 1: Get all chat logs
    print("\n1. Testing GET /api/admin/chat-logs")
    try:
        response = requests.get(f"{base_url}/api/admin/chat-logs", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Total sessions: {data.get('total', 0)}")
            print(f"   Chat logs returned: {len(data.get('chat_logs', []))}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 2: Get only unseen chat logs
    print("\n2. Testing GET /api/admin/chat-logs?seen=false")
    try:
        response = requests.get(f"{base_url}/api/admin/chat-logs?seen=false", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Unseen sessions: {data.get('total', 0)}")
            unseen_logs = data.get('chat_logs', [])
            print(f"   Unseen logs returned: {len(unseen_logs)}")
            
            # Test 3: Mark first unseen as seen (if any exist)
            if unseen_logs:
                session_id = unseen_logs[0]['id']
                print(f"\n3. Testing PUT /api/admin/chat-logs/{session_id}/mark-seen")
                try:
                    response = requests.put(
                        f"{base_url}/api/admin/chat-logs/{session_id}/mark-seen", 
                        headers=headers
                    )
                    print(f"   Status: {response.status_code}")
                    if response.status_code == 200:
                        print(f"   Message: {response.json().get('message')}")
                    else:
                        print(f"   Error: {response.text}")
                except Exception as e:
                    print(f"   Exception: {e}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 4: Get stats
    print("\n4. Testing GET /api/admin/chat-logs/stats/summary")
    try:
        response = requests.get(f"{base_url}/api/admin/chat-logs/stats/summary", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Total sessions: {data.get('total_sessions', 0)}")
            print(f"   Unseen sessions: {data.get('unseen_sessions', 0)}")
            print(f"   Seen sessions: {data.get('seen_sessions', 0)}")
            print(f"   Today's sessions: {data.get('today_sessions', 0)}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print("\n✅ Chat logs API testing complete!")
    print("\nTo use this test:")
    print("1. Start the backend server: python main.py")
    print("2. Get an admin token by logging in")
    print("3. Replace 'your_admin_token_here' with the actual token")
    print("4. Run: python test_chat_logs.py")

if __name__ == "__main__":
    test_chat_logs_api()
