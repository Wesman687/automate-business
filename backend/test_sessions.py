#!/usr/bin/env python3
"""
Simple script to test the sessions API endpoint
"""

import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_get_sessions():
    """Test getting all sessions"""
    try:
        response = requests.get(f"{BASE_URL}/api/sessions", 
                               timeout=10)
        print(f"GET /api/sessions - Status: {response.status_code}")
        
        if response.status_code == 200:
            sessions = response.json()
            print(f"Found {len(sessions)} sessions:")
            for session in sessions[:3]:  # Show first 3
                print(f"  - Session ID: {session.get('session_id')}")
                print(f"    Is Seen: {session.get('is_seen')}")
                print(f"    Created: {session.get('created_at')}")
                print(f"    Customer: {session.get('customer', {}).get('email', 'No customer')}")
                print()
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

def test_update_session_seen(session_id: str, is_seen: bool):
    """Test updating session seen status"""
    try:
        data = {"is_seen": is_seen}
        response = requests.patch(f"{BASE_URL}/api/sessions/{session_id}/seen",
                                 json=data,
                                 timeout=10)
        
        print(f"PATCH /api/sessions/{session_id}/seen - Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result}")
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    print("🔍 Testing Sessions API")
    print("=" * 50)
    
    # First get all sessions to see what exists
    test_get_sessions()
    
    # Test updating a session (if any exist)
    print("\n" + "=" * 50)
    print("🔧 Testing session update (you'll need to manually enter a valid session_id)")
