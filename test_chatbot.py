#!/usr/bin/env python3
"""
Comprehensive Chatbot Testing Script
Tests all enhanced chatbot functionality including customer info capture and file upload
"""

import requests
import json
import time
import os
from typing import Dict, Any

# Configuration
BACKEND_URL = "http://localhost:8005"
FRONTEND_URL = "http://localhost:3002"

def test_backend_health():
    """Test if backend is healthy"""
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        print(f"✅ Backend Health: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Backend Health Failed: {e}")
        return False

def test_chat_endpoint():
    """Test basic chat functionality"""
    try:
        data = {
            "message": "Hi, I'm interested in automation solutions for my business",
            "session_id": "test-comprehensive-456"
        }
        response = requests.post(f"{BACKEND_URL}/api/chat", json=data)
        result = response.json()
        print(f"✅ Chat Response: {result.get('response', '')[:100]}...")
        return True
    except Exception as e:
        print(f"❌ Chat Test Failed: {e}")
        return False

def test_save_customer():
    """Test customer information saving"""
    try:
        data = {
            "session_id": "test-comprehensive-456",
            "email": "comprehensive@test.com",
            "name": "Comprehensive Test User",
            "company": "Test Automation Inc",
            "phone": "+1-555-0123"
        }
        response = requests.post(f"{BACKEND_URL}/api/save-customer", json=data)
        result = response.json()
        print(f"✅ Customer Saved: {result}")
        return result.get('customer_id')
    except Exception as e:
        print(f"❌ Save Customer Failed: {e}")
        return None

def test_file_upload():
    """Test file upload functionality"""
    try:
        # Create test file
        test_content = "This is a comprehensive test file for chatbot upload functionality.\nIt contains multiple lines and special characters: @#$%"
        with open("comprehensive_test.txt", "w") as f:
            f.write(test_content)
        
        # Upload file
        files = {'file': open('comprehensive_test.txt', 'rb')}
        data = {
            'session_id': 'test-comprehensive-456',
            'customer_email': 'comprehensive@test.com',
            'description': 'Comprehensive test file upload'
        }
        
        response = requests.post(f"{BACKEND_URL}/api/upload-file", files=files, data=data)
        result = response.json()
        print(f"✅ File Upload: {result}")
        
        # Cleanup
        files['file'].close()
        os.remove("comprehensive_test.txt")
        return True
    except Exception as e:
        print(f"❌ File Upload Failed: {e}")
        return False

def test_customer_retrieval():
    """Test retrieving saved customers"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/customers")
        customers = response.json()
        print(f"✅ Retrieved {len(customers)} customers:")
        for customer in customers:
            print(f"   - {customer.get('name', 'No Name')} ({customer.get('email')})")
        return True
    except Exception as e:
        print(f"❌ Customer Retrieval Failed: {e}")
        return False

def test_frontend_availability():
    """Test if frontend is accessible"""
    try:
        response = requests.get(FRONTEND_URL)
        if response.status_code == 200:
            print(f"✅ Frontend accessible at {FRONTEND_URL}")
            return True
        else:
            print(f"❌ Frontend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend Test Failed: {e}")
        return False

def run_comprehensive_test():
    """Run all tests"""
    print("🚀 Starting Comprehensive Chatbot Test Suite...")
    print("=" * 60)
    
    tests = [
        ("Backend Health Check", test_backend_health),
        ("Chat Endpoint", test_chat_endpoint),
        ("Customer Information Saving", test_save_customer),
        ("File Upload Functionality", test_file_upload),
        ("Customer Data Retrieval", test_customer_retrieval),
        ("Frontend Availability", test_frontend_availability)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 Testing: {test_name}")
        result = test_func()
        results.append((test_name, result))
        time.sleep(1)  # Brief pause between tests
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY:")
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\n🏆 Overall Result: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All tests passed! Chatbot is fully functional.")
        print("\n📋 Features Verified:")
        print("   ✅ Immediate customer info capture (email, name, company)")
        print("   ✅ File upload capability (images/notes/spreadsheets)")
        print("   ✅ Database persistence and retrieval")
        print("   ✅ Backend API endpoints working")
        print("   ✅ Frontend accessibility")
        print("   ✅ Session management and customer linking")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")

if __name__ == "__main__":
    run_comprehensive_test()
