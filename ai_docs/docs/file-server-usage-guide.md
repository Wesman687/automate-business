# Stream-Line File Server Usage Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [File Service Architecture](#file-service-architecture)
4. [Job-Specific File Management](#job-specific-file-management)
5. [Customer Dashboard File Management](#customer-dashboard-file-management)
6. [Windows Explorer-Style Operations](#windows-explorer-style-operations)
7. [API Endpoints](#api-endpoints)
8. [Frontend Components](#frontend-components)
9. [Error Handling](#error-handling)
10. [Performance & Best Practices](#performance--best-practices)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Stream-Line File Server provides a centralized, organized way to manage files across the application. It features:

- **Job-specific organization**: Files organized by job ID and type
- **Customer dashboard support**: General customer file management
- **Windows Explorer-style interface**: Familiar file management experience
- **Comprehensive error handling**: Structured error responses and logging
- **Performance optimization**: Async operations and efficient folder traversal

---

## 🚀 Installation & Setup

### 1. Install the SDK
```bash
pip install git+https://github.com/Wesman687/streamline-file-uploader.git#subdirectory=python-package
```

### 2. Environment Variables
```bash
# Required
export UPLOAD_BASE_URL="https://file-server.stream-lineai.com"
export AUTH_SERVICE_TOKEN="your-service-token-here"

# Optional (for development)
export DEFAULT_USER_ID="admin@example.com"
```

### 3. Verify Installation
```python
from streamline_file_uploader import StreamlineFileUploader
print("✅ SDK installed successfully")
```

---

## 🏗️ File Service Architecture

### Core Components

1. **FileService Class** (`backend/services/file_service.py`)
   - Centralized file operations
   - Error handling and logging
   - Folder organization logic

2. **API Endpoints** (`backend/api/file_upload.py`)
   - RESTful file operations
   - Authentication and validation
   - Response formatting

3. **Frontend Components**
   - File display and management
   - Windows Explorer-style interface
   - File upload handling

### Folder Structure

```
File Server Root
├── documents/
│   ├── {job_id}/
│   │   ├── logos/          # Job logo files
│   │   ├── project/        # Job project files
│   │   ├── reference/      # Job reference files
│   │   └── general/        # General job files
│   └── {job_id_2}/
│       └── ...
└── customers/
    ├── {email}/
    │   ├── general/        # General customer files
    │   ├── documents/      # Customer documents
    │   └── uploads/        # Customer uploads
    └── {email_2}/
        └── ...
```

---

## 💼 Job-Specific File Management

### Use Cases
- **Logo files**: Company logos, brand assets
- **Project files**: Project documentation, specifications
- **Reference files**: Design references, inspiration materials
- **General files**: Miscellaneous job-related files

### Code Examples

#### Upload Job File
```python
from backend.services.file_service import FileService

file_service = FileService()

# Upload logo file
result = await file_service.upload_job_file(
    file_content=logo_bytes,
    filename="company_logo.png",
    job_id=123,
    file_type="logo",
    user_email="user@example.com",
    description="Company logo for website redesign"
)

print(f"File uploaded: {result.public_url}")
```

#### Get Job Files
```python
# Get all files for a job
job_files = await file_service.get_job_files(
    job_id=123,
    user_email="user@example.com"
)

# Get specific file type
logo_files = await file_service.get_job_files(
    job_id=123,
    user_email="user@example.com",
    file_type="logo"
)

# Process files
for file in job_files:
    print(f"{file['upload_type']}: {file['original_filename']}")
    print(f"Size: {file['file_size']} bytes")
    print(f"URL: {file['file_url']}")
```

### Frontend Integration

```typescript
// In JobDetailModal.tsx
const handleFileUpload = async (files: FileList, type: 'logo' | 'project' | 'reference') => {
  const formData = new FormData();
  formData.append('file', files[0]);
  formData.append('upload_type', type);
  formData.append('job_id', jobId.toString());
  
  const response = await api.post('/file-upload/customer/upload', formData);
  await fetchJobFiles(); // Refresh file list
};
```

---

## 👤 Customer Dashboard File Management

### Use Cases
- **General files**: Personal documents, contracts
- **Documents**: Business documents, invoices
- **Uploads**: Temporary files, drafts

### Code Examples

#### Upload Customer File
```python
# Upload to customer's general folder
result = await file_service.upload_customer_file(
    file_content=document_bytes,
    filename="contract.pdf",
    user_email="customer@example.com",
    folder="documents",
    description="Service agreement contract"
)
```

#### Get Customer Files
```python
# Get all customer files
customer_files = await file_service.get_customer_files(
    user_email="customer@example.com"
)

# Get files from specific folder
document_files = await file_service.get_customer_files(
    user_email="customer@example.com",
    folder="documents"
)
```

---

## 🪟 Windows Explorer-Style Operations

### Features
- **Folder tree navigation**: Browse folder hierarchy
- **File grid/list view**: Multiple view options
- **Context menus**: Right-click operations
- **Drag & drop**: Intuitive file management
- **Search & filter**: Find files quickly

### Code Examples

#### List Folders
```python
# List folders for navigation
folders = await file_service.list_folders(
    user_email="user@example.com",
    base_path="documents/123"
)

for folder in folders:
    print(f"📁 {folder['name']} ({folder['file_count']} files)")
```

#### Search Files
```python
# Search for files
search_results = await file_service.search_files(
    user_email="user@example.com",
    query="logo",
    folder="documents/123/logos"
)

print(f"Found {len(search_results)} files matching 'logo'")
```

#### File Operations
```python
# Delete file
await file_service.delete_file(
    file_key="file_key_here",
    user_email="user@example.com"
)

# Get file information
file_info = await file_service.get_file_info(
    file_key="file_key_here",
    user_email="user@example.com"
)
```

---

## 🔌 API Endpoints

### File Upload Endpoints

#### 1. Job File Upload
```http
POST /api/file-upload/customer/upload
Content-Type: multipart/form-data

Parameters:
- file: File to upload
- upload_type: logo | project | reference | general
- job_id: Job ID (optional)
- folder: Target folder (optional)
- description: File description (optional)
```

#### 2. Customer File Upload
```http
POST /api/file-upload/customer/upload
Content-Type: multipart/form-data

Parameters:
- file: File to upload
- upload_type: general | documents | uploads
- description: File description (optional)
```

### File Retrieval Endpoints

#### 1. Get Job Files
```http
GET /api/file-upload/customer/job/{job_id}/files

Response:
{
  "files": [
    {
      "id": "file_key",
      "original_filename": "logo.png",
      "upload_type": "logo",
      "folder": "documents/123/logos",
      "file_url": "https://...",
      "file_size": 1024,
      "uploaded_at": "2025-01-24T..."
    }
  ],
  "file_server_status": "success",
  "job_id": 123
}
```

#### 2. Get Customer Files
```http
GET /api/file-upload/customer/files?folder=documents

Response:
{
  "files": [...],
  "total_count": 5,
  "folder": "customers/user@example.com/documents"
}
```

### File Management Endpoints

#### 1. Delete File
```http
DELETE /api/file-upload/files/{file_id}

Response:
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### 2. Search Files
```http
GET /api/file-upload/search?q=logo&folder=documents/123/logos

Response:
{
  "results": [...],
  "query": "logo",
  "folder": "documents/123/logos"
}
```

---

## 🎨 Frontend Components

### 1. FileUpload Component
```typescript
interface FileUploadProps {
  onUpload: (file: File, type: string) => Promise<void>;
  uploadType: 'logo' | 'project' | 'reference' | 'general';
  jobId?: number;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, uploadType, jobId, disabled }) => {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onUpload(file, uploadType);
    }
  };

  return (
    <input
      type="file"
      onChange={handleFileChange}
      disabled={disabled}
      accept="image/*,application/pdf,.doc,.docx"
    />
  );
};
```

### 2. FileList Component
```typescript
interface FileListProps {
  files: FileInfo[];
  onDelete?: (fileId: string) => Promise<void>;
  onDownload?: (fileUrl: string) => void;
  showActions?: boolean;
}

const FileList: React.FC<FileListProps> = ({ files, onDelete, onDownload, showActions = true }) => {
  return (
    <div className="file-list">
      {files.map((file) => (
        <div key={file.id} className="file-item">
          <div className="file-info">
            <span className="filename">{file.original_filename}</span>
            <span className="size">{formatFileSize(file.file_size)}</span>
            <span className="type">{file.upload_type}</span>
          </div>
          
          {showActions && (
            <div className="file-actions">
              {onDownload && (
                <button onClick={() => onDownload(file.file_url)}>
                  Download
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(file.id)}>
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

### 3. FileExplorer Component (Windows Explorer Style)
```typescript
interface FileExplorerProps {
  currentPath: string;
  onPathChange: (path: string) => void;
  onFileSelect: (file: FileInfo) => void;
  onFolderSelect: (folder: FolderInfo) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  currentPath,
  onPathChange,
  onFileSelect,
  onFolderSelect
}) => {
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  return (
    <div className="file-explorer">
      {/* Breadcrumb Navigation */}
      <Breadcrumb path={currentPath} onPathChange={onPathChange} />
      
      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={() => setViewMode('grid')}>Grid</button>
        <button onClick={() => setViewMode('list')}>List</button>
        <button onClick={() => onPathChange('..')}>Up</button>
      </div>
      
      {/* Folder Tree */}
      <div className="folder-tree">
        {folders.map((folder) => (
          <div
            key={folder.path}
            className="folder-item"
            onClick={() => onFolderSelect(folder)}
          >
            📁 {folder.name} ({folder.file_count})
          </div>
        ))}
      </div>
      
      {/* File Grid/List */}
      <div className={`file-view ${viewMode}`}>
        {files.map((file) => (
          <div
            key={file.id}
            className="file-item"
            onClick={() => onFileSelect(file)}
          >
            {getFileIcon(file.mime_type)}
            <span className="filename">{file.original_filename}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## ⚠️ Error Handling

### Error Types

1. **FileServiceError**: Custom service errors
2. **UploadError**: File upload failures
3. **AuthenticationError**: Authentication issues
4. **FileServerError**: Server-side errors
5. **ValidationError**: Input validation failures

### Error Response Format
```json
{
  "error": {
    "message": "File upload failed",
    "error_code": "UPLOAD_FAILED",
    "details": {
      "job_id": 123,
      "file_type": "logo"
    }
  }
}
```

### Frontend Error Handling
```typescript
const handleFileUpload = async (file: File) => {
  try {
    const response = await api.post('/file-upload/upload', formData);
    showSuccessMessage('File uploaded successfully');
  } catch (error) {
    if (error.response?.data?.error) {
      const { message, error_code, details } = error.response.data.error;
      
      switch (error_code) {
        case 'UPLOAD_FAILED':
          showErrorMessage(`Upload failed: ${message}`);
          break;
        case 'AUTHENTICATION_ERROR':
          showErrorMessage('Please log in again');
          break;
        default:
          showErrorMessage(`Error: ${message}`);
      }
    } else {
      showErrorMessage('An unexpected error occurred');
    }
  }
};
```

---

## 🚀 Performance & Best Practices

### 1. File Size Limits
- **Maximum file size**: 50MB
- **Recommended**: Keep files under 10MB for better performance
- **Image optimization**: Compress images before upload

### 2. Batch Operations
```python
# Upload multiple files efficiently
async def upload_multiple_files(files: List[File], job_id: int, user_email: str):
    tasks = []
    for file in files:
        task = file_service.upload_job_file(
            file_content=file.content,
            filename=file.name,
            job_id=job_id,
            file_type=file.type,
            user_email=user_email
        )
        tasks.append(task)
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results
```

### 3. Caching Strategy
```python
# Cache folder contents for better performance
from functools import lru_cache

@lru_cache(maxsize=100)
async def get_cached_folder_contents(folder_path: str, user_email: str):
    return await file_service._list_folder_files(user_email, folder_path)
```

### 4. Connection Pooling
```python
# Reuse uploader instances when possible
class FileService:
    def __init__(self):
        self._uploader_pool = []
    
    async def _get_uploader(self):
        if self._uploader_pool:
            return self._uploader_pool.pop()
        return StreamlineFileUploader(...)
    
    async def _return_uploader(self, uploader):
        self._uploader_pool.append(uploader)
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. SDK Not Available
```python
# Check if SDK is installed
try:
    from streamline_file_uploader import StreamlineFileUploader
    print("✅ SDK available")
except ImportError as e:
    print(f"❌ SDK not available: {e}")
    print("Install with: pip install git+https://github.com/Wesman687/streamline-file-uploader.git#subdirectory=python-package")
```

#### 2. Authentication Errors
```bash
# Check environment variables
echo $UPLOAD_BASE_URL
echo $AUTH_SERVICE_TOKEN

# Verify token is valid
curl -H "Authorization: Bearer $AUTH_SERVICE_TOKEN" \
     https://file-server.stream-lineai.com/health
```

#### 3. File Upload Failures
```python
# Check file size and type
file_size = len(file_content)
if file_size > 50 * 1024 * 1024:  # 50MB
    raise ValueError("File too large")

# Verify MIME type
mime_type, _ = mimetypes.guess_type(filename)
if not mime_type:
    mime_type = "application/octet-stream"
```

#### 4. Folder Access Issues
```python
# Check folder permissions
try:
    files = await file_service._list_folder_files(user_email, folder_path)
    print(f"✅ Access granted to {folder_path}")
except Exception as e:
    print(f"❌ Access denied to {folder_path}: {e}")
```

### Debug Logging
```python
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

# Check service logs
logger = logging.getLogger(__name__)
logger.debug(f"Attempting to upload to folder: {folder}")
logger.info(f"File upload successful: {result.file_key}")
logger.error(f"Upload failed: {error}")
```

---

## 📚 Additional Resources

### Documentation
- [Stream-Line File Server](https://file-server.stream-lineai.com)
- [SDK GitHub Repository](https://github.com/Wesman687/streamline-file-uploader)
- [API Reference](https://file-server.stream-lineai.com/docs)

### Support
- **Email**: support@stream-lineai.com
- **GitHub Issues**: [File Uploader Issues](https://github.com/Wesman687/streamline-file-uploader/issues)
- **Documentation**: [README](https://github.com/Wesman687/streamline-file-uploader#readme)

### Examples Repository
- [Complete Examples](https://github.com/Wesman687/streamline-file-uploader/tree/main/examples)
- [Integration Guides](https://github.com/Wesman687/streamline-file-uploader/tree/main/docs)

---

## 🔄 Version History

- **v1.0.0**: Initial release with basic file operations
- **v1.1.0**: Added Windows Explorer-style interface
- **v1.2.0**: Enhanced error handling and logging
- **v1.3.0**: Performance optimizations and caching
- **v1.4.0**: Advanced file management operations

---

*Last updated: January 24, 2025*
*Version: 1.4.0*
