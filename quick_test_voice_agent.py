#!/usr/bin/env python3
"""
Quick test script for Voice Agent API
Tests if the voice agent endpoint responds correctly
"""

import requests
import json
import time

# Wait a moment for server to start
time.sleep(2)

BASE_URL = "http://localhost:8005"

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is healthy")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running on port 8005")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_voice_agent_basic():
    """Test basic voice agent functionality"""
    print("🎙️ Testing Voice Agent Basic Functionality")
    
    # Test customer creation
    try:
        response = requests.post(f"{BASE_URL}/api/voice/agent", json={
            "intent": "find_or_create_customer",
            "name": "Test User",
            "email": "test@example.com",
            "phone": "555-123-4567"
        }, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Customer creation: {data.get('speak', 'No speak response')}")
            return True
        else:
            print(f"❌ Voice agent returned status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Voice agent test failed: {e}")
        return False

def main():
    print("🚀 Quick Voice Agent Test")
    print("=" * 30)
    
    # Test backend health
    if not test_backend_health():
        print("\n💡 To start the backend:")
        print("cd backend")
        print("python main.py")
        return
    
    # Test voice agent
    if test_voice_agent_basic():
        print("\n🎉 Voice Agent is working correctly!")
        print("Ready for Twilio integration!")
    else:
        print("\n❌ Voice Agent has issues. Check logs above.")

if __name__ == "__main__":
    main()
