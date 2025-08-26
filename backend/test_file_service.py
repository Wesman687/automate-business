#!/usr/bin/env python3
"""
Test script for FileService initialization and basic functionality
Run this to verify the FileService can be imported and initialized properly
"""

import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if we can import the required modules"""
    print("🔍 Testing imports...")
    
    try:
        from config import config
        print("✅ Config imported successfully")
        print(f"   UPLOAD_BASE_URL: {config.UPLOAD_BASE_URL}")
        print(f"   AUTH_SERVICE_TOKEN: {'***' if config.AUTH_SERVICE_TOKEN else 'NOT SET'}")
    except ImportError as e:
        print(f"❌ Failed to import config: {e}")
        return False
    
    try:
        from streamline_file_uploader import StreamlineFileUploader
        print("✅ StreamlineFileUploader SDK imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import StreamlineFileUploader: {e}")
        return False
    
    try:
        from services.file_service import FileService, FileServiceError
        print("✅ FileService imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import FileService: {e}")
        return False
    
    return True

def test_file_service_initialization():
    """Test if FileService can be initialized"""
    print("\n🔍 Testing FileService initialization...")
    
    try:
        from services.file_service import FileService
        file_service = FileService()
        print("✅ FileService initialized successfully")
        return file_service
    except Exception as e:
        print(f"❌ Failed to initialize FileService: {e}")
        return None

async def test_basic_functionality(file_service):
    """Test basic FileService functionality"""
    print("\n🔍 Testing basic functionality...")
    
    try:
        # Test folder listing
        print("   Testing folder listing...")
        folders = await file_service.list_folders("test@example.com")
        print(f"   ✅ Folder listing successful: {len(folders)} folders")
        
        # Test search functionality
        print("   Testing search functionality...")
        results = await file_service.search_files("test@example.com", "test")
        print(f"   ✅ Search successful: {len(results)} results")
        
        return True
    except Exception as e:
        print(f"   ❌ Basic functionality test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 FileService Integration Test")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed. Cannot proceed.")
        return False
    
    # Test initialization
    file_service = test_file_service_initialization()
    if not file_service:
        print("\n❌ FileService initialization failed. Cannot proceed.")
        return False
    
    # Test basic functionality
    if await test_basic_functionality(file_service):
        print("\n✅ All tests passed! FileService is working correctly.")
        return True
    else:
        print("\n⚠️ Basic functionality tests failed, but FileService initialized.")
        print("   This might be due to missing file server connection or authentication.")
        return False

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
