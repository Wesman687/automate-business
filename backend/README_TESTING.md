# File Server Integration Testing

This directory contains test scripts to verify the integration between the new centralized `FileService` and the API endpoints.

## 🧪 Test Scripts

### 1. `test_file_service.py`
Tests the `FileService` class in isolation:
- ✅ Import validation
- ✅ Service initialization
- ✅ Basic functionality (folder listing, search)

**Run with:**
```bash
cd backend
python test_file_service.py
```

### 2. `test_api_integration.py`
Tests the complete API integration:
- ✅ Backend server connectivity
- ✅ API module imports
- ✅ FileService availability
- ✅ Endpoint registration

**Run with:**
```bash
cd backend
python test_api_integration.py
```

## 🔧 Prerequisites

Before running tests, ensure:

1. **SDK Installation**
   ```bash
   pip install git+https://github.com/Wesman687/streamline-file-uploader.git#subdirectory=python-package
   ```

2. **Environment Variables**
   ```bash
   export UPLOAD_BASE_URL="https://file-server.stream-lineai.com"
   export AUTH_SERVICE_TOKEN="your-service-token-here"
   ```

3. **Backend Server** (optional, for full integration tests)
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

## 📊 Expected Results

### FileService Test
```
🚀 FileService Integration Test
==================================================
🔍 Testing imports...
✅ Config imported successfully
   UPLOAD_BASE_URL: https://file-server.stream-lineai.com
   AUTH_SERVICE_TOKEN: ***
✅ StreamlineFileUploader SDK imported successfully
✅ FileService imported successfully

🔍 Testing FileService initialization...
✅ FileService initialized successfully

🔍 Testing basic functionality...
   Testing folder listing...
   ✅ Folder listing successful: 2 folders
   Testing search functionality...
   ✅ Search successful: 0 results

✅ All tests passed! FileService is working correctly.
```

### API Integration Test
```
🚀 API Integration Test
==================================================
🔍 Testing backend connection...
✅ Backend server accessible: 200

🔍 Testing API imports...
✅ File upload API imported successfully
✅ FileService instance available in API

🔍 Testing service availability...
✅ FileService can be created successfully
   Base URL: https://file-server.stream-lineai.com
   Service Token: ***

🔍 Testing endpoint registration...
   Available routes:
     ✅ /upload
     ✅ /files
     ✅ /files/{file_id}
     ✅ /customer/upload
     ✅ /customer/job/{job_id}/files
     ✅ /search
     ✅ /folders

✅ All API integration tests passed!

📋 Summary:
   - Backend server: Accessible
   - FileService: Available and working
   - API endpoints: Properly registered
   - Integration: Ready for testing
```

## 🚨 Troubleshooting

### Common Issues

1. **Import Errors**
   - Ensure you're in the `backend` directory
   - Check that the SDK is properly installed
   - Verify Python path includes current directory

2. **FileService Initialization Fails**
   - Check environment variables are set
   - Verify SDK package name matches import
   - Check for syntax errors in service file

3. **API Import Fails**
   - Ensure all dependencies are installed
   - Check for circular import issues
   - Verify file paths are correct

### Debug Mode

For detailed debugging, you can modify the test scripts to add more verbose logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🔄 Next Steps

After successful testing:

1. **Start the backend server** and test actual API endpoints
2. **Test file upload/download** through the frontend
3. **Verify folder navigation** in the enhanced FileManagementModal
4. **Test error handling** with invalid inputs

## 📝 Notes

- Tests are designed to be non-destructive (read-only operations)
- Some tests may fail if the file server is not accessible
- The FileService includes fallback mechanisms for missing SDK features
- All tests include proper error handling and user feedback
