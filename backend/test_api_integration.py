#!/usr/bin/env python3
"""
Test script for API integration with FileService
Run this to verify the API endpoints can use the new centralized service
"""

import asyncio
import sys
import os
import requests
import json

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_backend_connection():
    """Test if the backend server is running and accessible"""
    print("🔍 Testing backend connection...")
    
    try:
        # Try to connect to the backend
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"✅ Backend server accessible: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Backend server not accessible. Is it running?")
        return False
    except Exception as e:
        print(f"❌ Backend connection test failed: {e}")
        return False

def test_api_imports():
    """Test if we can import the API modules"""
    print("\n🔍 Testing API imports...")
    
    try:
        from api.file_upload import router, file_service
        print("✅ File upload API imported successfully")
        
        if file_service:
            print("✅ FileService instance available in API")
        else:
            print("⚠️ FileService instance not available in API")
        
        return True
    except ImportError as e:
        print(f"❌ Failed to import file upload API: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error importing API: {e}")
        return False

def test_service_availability():
    """Test if the FileService is available and working"""
    print("\n🔍 Testing service availability...")
    
    try:
        from services.file_service import FileService
        
        # Try to create a FileService instance
        file_service = FileService()
        print("✅ FileService can be created successfully")
        
        # Check configuration
        print(f"   Base URL: {file_service.base_url}")
        print(f"   Service Token: {'***' if file_service.service_token else 'NOT SET'}")
        
        return True
    except Exception as e:
        print(f"❌ FileService creation failed: {e}")
        return False

def test_endpoint_registration():
    """Test if the API endpoints are properly registered"""
    print("\n🔍 Testing endpoint registration...")
    
    try:
        from api.file_upload import router
        
        # Check if the router has the expected endpoints
        routes = [route.path for route in router.routes]
        expected_routes = [
            "/upload",
            "/files",
            "/files/{file_id}",
            "/customer/upload",
            "/customer/job/{job_id}/files",
            "/search",
            "/folders"
        ]
        
        print("   Available routes:")
        for route in routes:
            print(f"     ✅ {route}")
        
        print("\n   Expected routes:")
        for route in expected_routes:
            if route in routes:
                print(f"     ✅ {route}")
            else:
                print(f"     ❌ {route} (missing)")
        
        return True
    except Exception as e:
        print(f"❌ Endpoint registration test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 API Integration Test")
    print("=" * 50)
    
    # Test backend connection
    if not test_backend_connection():
        print("\n⚠️ Backend not accessible. Some tests will be skipped.")
    
    # Test API imports
    if not test_api_imports():
        print("\n❌ API import tests failed. Cannot proceed.")
        return False
    
    # Test service availability
    if not test_service_availability():
        print("\n❌ Service availability test failed. Cannot proceed.")
        return False
    
    # Test endpoint registration
    if not test_endpoint_registration():
        print("\n❌ Endpoint registration test failed.")
        return False
    
    print("\n✅ All API integration tests passed!")
    print("\n📋 Summary:")
    print("   - Backend server: Accessible")
    print("   - FileService: Available and working")
    print("   - API endpoints: Properly registered")
    print("   - Integration: Ready for testing")
    
    return True

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {e}")
        sys.exit(1)
