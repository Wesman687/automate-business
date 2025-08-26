# 🚀 File Server Quick Reference Card

## 📁 Folder Organization

### Job Files
```
documents/{job_id}/logos/     # Logo files
documents/{job_id}/project/   # Project files  
documents/{job_id}/reference/ # Reference files
documents/{job_id}/           # General job files
```

### Customer Dashboard
```
customers/{email}/general/    # General customer files
customers/{email}/documents/  # Customer documents
customers/{email}/uploads/    # Customer uploads
```

---

## 🔧 Quick Start

### 1. Initialize Service
```python
from backend.services.file_service import FileService
file_service = FileService()
```

### 2. Upload Job File
```python
result = await file_service.upload_job_file(
    file_content=file_bytes,
    filename="logo.png",
    job_id=123,
    file_type="logo",
    user_email="user@example.com"
)
```

### 3. Get Job Files
```python
files = await file_service.get_job_files(
    job_id=123,
    user_email="user@example.com"
)
```

---

## 📤 Upload Operations

### Job File Upload
```python
# Logo file
await file_service.upload_job_file(
    file_content=logo_bytes,
    filename="company_logo.png",
    job_id=123,
    file_type="logo",
    user_email="user@example.com"
)

# Project file
await file_service.upload_job_file(
    file_content=spec_bytes,
    filename="requirements.pdf",
    job_id=123,
    file_type="project",
    user_email="user@example.com"
)
```

### Customer File Upload
```python
await file_service.upload_customer_file(
    file_content=doc_bytes,
    filename="contract.pdf",
    user_email="customer@example.com",
    folder="documents"
)
```

---

## 📥 Download & List Operations

### Get Files by Type
```python
# All job files
all_files = await file_service.get_job_files(job_id=123, user_email="user@example.com")

# Only logo files
logo_files = await file_service.get_job_files(
    job_id=123, 
    user_email="user@example.com",
    file_type="logo"
)
```

### Get Customer Files
```python
# All customer files
customer_files = await file_service.get_customer_files("customer@example.com")

# From specific folder
doc_files = await file_service.get_customer_files(
    "customer@example.com", 
    folder="documents"
)
```

---

## 🗂️ File Management

### Delete File
```python
await file_service.delete_file(
    file_key="file_key_here",
    user_email="user@example.com"
)
```

### Search Files
```python
results = await file_service.search_files(
    user_email="user@example.com",
    query="logo",
    folder="documents/123/logos"
)
```

### Get File Info
```python
info = await file_service.get_file_info(
    file_key="file_key_here",
    user_email="user@example.com"
)
```

---

## 🪟 Windows Explorer Operations

### List Folders
```python
folders = await file_service.list_folders(
    user_email="user@example.com",
    base_path="documents/123"
)
```

### Folder Navigation
```python
# Navigate to subfolder
subfolders = await file_service.list_folders(
    user_email="user@example.com",
    base_path="documents/123/logos"
)

# Go up one level
parent_folders = await file_service.list_folders(
    user_email="user@example.com",
    base_path="documents/123"
)
```

---

## 🔌 API Endpoints

### Upload
```http
POST /api/file-upload/customer/upload
Content-Type: multipart/form-data

file: [file]
upload_type: logo|project|reference|general
job_id: 123 (optional)
folder: documents (optional)
description: File description (optional)
```

### Get Files
```http
GET /api/file-upload/customer/job/{job_id}/files
GET /api/file-upload/customer/files?folder=documents
```

### Delete
```http
DELETE /api/file-upload/files/{file_id}
```

---

## ⚠️ Error Handling

### Check for Errors
```python
try:
    result = await file_service.upload_job_file(...)
except FileServiceError as e:
    print(f"Error: {e.message}")
    print(f"Code: {e.error_code}")
    print(f"Details: {e.details}")
```

### Common Error Codes
- `UPLOAD_FAILED`: File upload failed
- `AUTHENTICATION_ERROR`: Authentication issue
- `FILE_SERVER_ERROR`: Server-side error
- `VALIDATION_ERROR`: Input validation failed
- `FETCH_FAILED`: File retrieval failed

---

## 🚀 Performance Tips

### Batch Operations
```python
# Upload multiple files efficiently
tasks = []
for file in files:
    task = file_service.upload_job_file(...)
    tasks.append(task)

results = await asyncio.gather(*tasks)
```

### File Size Limits
- **Max**: 50MB
- **Recommended**: < 10MB
- **Images**: Compress before upload

---

## 🔍 Debug & Troubleshooting

### Enable Logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check SDK Availability
```python
try:
    from streamline_file_uploader import StreamlineFileUploader
    print("✅ SDK available")
except ImportError:
    print("❌ Install: pip install git+https://github.com/Wesman687/streamline-file-uploader.git#subdirectory=python-package")
```

### Verify Environment
```bash
echo $UPLOAD_BASE_URL
echo $AUTH_SERVICE_TOKEN
```

---

## 📱 Frontend Integration

### File Upload Component
```typescript
const handleUpload = async (file: File, type: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_type', type);
  formData.append('job_id', jobId.toString());
  
  await api.post('/file-upload/customer/upload', formData);
};
```

### File List Component
```typescript
const [files, setFiles] = useState<FileInfo[]>([]);

useEffect(() => {
  const fetchFiles = async () => {
    const response = await api.get(`/file-upload/customer/job/${jobId}/files`);
    setFiles(response.files);
  };
  fetchFiles();
}, [jobId]);
```

---

## 📚 Full Documentation

- **Complete Guide**: [File Server Usage Guide](file-server-usage-guide.md)
- **API Reference**: [File Service API](backend/services/file_service.py)
- **Examples**: See inline documentation in service files

---

*Quick Reference v1.4.0 | Last updated: January 24, 2025*
