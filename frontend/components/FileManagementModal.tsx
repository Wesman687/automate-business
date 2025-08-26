'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, Trash2, Eye, FileText, Folder, Calendar, HardDrive, 
  Grid3X3, List, Search, ArrowLeft, ArrowRight, MoreHorizontal,
  Upload, Copy, Cut, Paste, Edit3, Share2, Info
} from 'lucide-react';
import { api } from '@/lib/https';
import DeleteModal from './DeleteModal';

interface FileInfo {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  upload_type: string;
  description?: string;
  tags?: string;
  uploaded_at: string;
  file_url: string;
  folder?: string;
  is_folder?: boolean;
}

interface FolderInfo {
  name: string;
  path: string;
  file_count: number;
  total_size: number;
  type: 'folder';
}

interface FileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
  jobId?: number;
  title?: string;
  defaultFolder?: string;
}

export default function FileManagementModal({ 
  isOpen, 
  onClose, 
  userId, 
  jobId, 
  title = "File Management",
  defaultFolder
}: FileManagementModalProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingFile, setDeletingFile] = useState<FileInfo | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuTarget, setContextMenuTarget] = useState<FileInfo | null>(null);
  const [clipboard, setClipboard] = useState<{ action: 'copy' | 'cut', files: FileInfo[] } | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultFolder) {
        // Construct proper folder path for job-specific folders
        const folderPath = jobId ? `documents/${jobId}/${defaultFolder}` : defaultFolder;
        setCurrentFolder(folderPath);
        setFolderHistory([]);
      } else {
        setCurrentFolder('');
        setFolderHistory([]);
      }
      fetchFiles();
      fetchFolders();
    }
  }, [isOpen, userId, jobId, defaultFolder]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let endpoint = '/file-upload/files';
      if (jobId) {
        endpoint = `/file-upload/customer/job/${jobId}/files`;
        // Add folder filter if we have a current folder
        if (currentFolder) {
          endpoint += `?folder=${encodeURIComponent(currentFolder)}`;
        }
      }
      
      const response = await api.get(endpoint);
      setFiles(response.files || []);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
              const response = await api.get('/file-upload/folders', {
        params: { base_path: currentFolder }
      });
      setFolders(response.folders || []);
    } catch (error) {
      console.error('❌ Error fetching folders:', error);
      setFolders([]);
    }
  };

  const handleDeleteFile = async (file: FileInfo) => {
    setDeletingFile(file);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingFile) return;
    
    try {
      await api.del(`/file-upload/files/${deletingFile.id}`);
      await fetchFiles(); // Refresh the list
      setShowDeleteConfirm(false);
      setDeletingFile(null);
      setSelectedFiles(new Set()); // Clear selection
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const downloadFile = async (file: FileInfo) => {
    try {
      const downloadUrl = file.public_url || file.file_url;
      
      if (!downloadUrl) {
        console.error('No download URL available for file:', file);
        return;
      }
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.original_filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateToFolder = (folderPath: string) => {
    setFolderHistory([...folderHistory, currentFolder]);
    setCurrentFolder(folderPath);
    setSelectedFiles(new Set()); // Clear selection when navigating
    fetchFolders(); // Refresh folders for new location
  };

  const navigateBack = () => {
    if (folderHistory.length > 0) {
      const previousFolder = folderHistory[folderHistory.length - 1];
      setCurrentFolder(previousFolder);
      setFolderHistory(folderHistory.slice(0, -1));
      setSelectedFiles(new Set());
      fetchFolders();
    }
  };

  const navigateToRoot = () => {
    setCurrentFolder('');
    setFolderHistory([]);
    setSelectedFiles(new Set());
    fetchFolders();
  };

  const getFolderIcon = (folderName: string) => {
    // Enhanced folder icons
    const folderIcons: Record<string, string> = {
      'projects': '📁',
      'uploads': '📂',
      'documents': '📋',
      'images': '🖼️',
      'videos': '🎥',
      'logos': '🎨',
      'reference': '📚',
      'general': '📁',
      'root': '🏠'
    };
    return folderIcons[folderName] || '📁';
  };

  const getFileIcon = (mimeType: string, filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    // Enhanced file icons
    const fileIcons: Record<string, string> = {
      'md': '📝',
      'json': '⚙️',
      'txt': '📄',
      'pdf': '📕',
      'doc': '📘',
      'docx': '📘',
      'xls': '📊',
      'xlsx': '📊',
      'zip': '📦',
      'rar': '📦',
      '7z': '📦',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'svg': '🎨',
      'mp4': '🎥',
      'avi': '🎥',
      'mov': '🎥',
      'mp3': '🎵',
      'wav': '🎵'
    };
    
    if (extension && fileIcons[extension]) {
      return fileIcons[extension];
    }
    
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    
    return '📄';
  };

  const handleFileSelect = (file: FileInfo, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      const newSelection = new Set(selectedFiles);
      if (newSelection.has(file.id)) {
        newSelection.delete(file.id);
      } else {
        newSelection.add(file.id);
      }
      setSelectedFiles(newSelection);
    } else if (event.shiftKey && selectedFiles.size > 0) {
      // Range select with Shift
      const fileIds = files.map(f => f.id);
      const lastSelected = Math.max(...Array.from(selectedFiles));
      const currentIndex = fileIds.indexOf(file.id);
      const lastIndex = fileIds.indexOf(lastSelected);
      const start = Math.min(currentIndex, lastIndex);
      const end = Math.max(currentIndex, lastIndex);
      const rangeSelection = new Set(fileIds.slice(start, end + 1));
      setSelectedFiles(rangeSelection);
    } else {
      // Single select
      setSelectedFiles(new Set([file.id]));
    }
    setSelectedFile(file);
  };

  const handleContextMenu = (event: React.MouseEvent, file: FileInfo) => {
    event.preventDefault();
    setContextMenuTarget(file);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  };

  const handleCopy = () => {
    if (contextMenuTarget) {
      setClipboard({ action: 'copy', files: [contextMenuTarget] });
      setShowContextMenu(false);
    }
  };

  const handleCut = () => {
    if (contextMenuTarget) {
      setClipboard({ action: 'cut', files: [contextMenuTarget] });
      setShowContextMenu(false);
    }
  };

  const handlePaste = async () => {
    if (clipboard && currentFolder) {
      // TODO: Implement file move/copy when SDK supports it

      setClipboard(null);
    }
  };

  const handleRename = () => {
    // TODO: Implement file rename when SDK supports it
    
    setShowContextMenu(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      setUploadingFiles(Array.from(selectedFiles));
      setShowUploadDialog(true);
    }
  };

  const confirmUpload = async () => {
    if (uploadingFiles.length === 0) return;
    
    try {
      for (const file of uploadingFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_type', 'general');
        formData.append('description', `Uploaded file: ${file.name}`);
        
        if (jobId) {
          formData.append('job_id', jobId.toString());
        }
        
        await api.post('/file-upload/customer/upload', formData);
      }
      
      await fetchFiles();
      setShowUploadDialog(false);
      setUploadingFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesType = filterType === 'all' || file.upload_type === filterType;
    const matchesSearch = file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = !currentFolder || file.folder === currentFolder;
    return matchesType && matchesSearch && matchesFolder;
  });

  const displayFiles = defaultFolder 
    ? files.filter(file => file.folder === `documents/${defaultFolder}`)
    : filteredFiles;

  const uploadTypes = ['all', ...Array.from(new Set(files.map(f => f.upload_type)))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 shadow-xl transition-all">
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Folder className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <span className="text-sm text-gray-400">({files.length} files)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowUploadDialog(true)}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  title="Upload files"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Enhanced Breadcrumb Navigation */}
            <div className="mt-3 flex items-center space-x-2 text-sm">
              <button
                onClick={navigateToRoot}
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
              >
                <span>🏠</span>
                <span>Root</span>
              </button>
              
              {currentFolder && (
                <>
                  <span className="text-gray-500">/</span>
                  <button
                    onClick={navigateBack}
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                    disabled={folderHistory.length === 0}
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back</span>
                  </button>
                  <span className="text-gray-500">/</span>
                  <span className="text-white font-medium">{currentFolder}</span>
                  <button
                    onClick={navigateToRoot}
                    className="ml-2 text-red-400 hover:text-red-300 transition-colors text-xs"
                    title="Close folder"
                  >
                    ✕ Close
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Enhanced Toolbar */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files and folders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {uploadTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                
                <div className="flex border border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  onClick={fetchFiles}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="Refresh"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading files...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-8">
                <HardDrive className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No files found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show folders first */}
                {folders.map((folder) => (
                  <div
                    key={folder.path}
                    className={`bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors group cursor-pointer ${
                      viewMode === 'grid' ? 'max-w-xs' : ''
                    }`}
                    onClick={() => navigateToFolder(folder.path)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-2xl">{getFolderIcon(folder.name)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors truncate">
                            {folder.name}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                            <span>📁 Folder</span>
                            <span>{folder.file_count} files</span>
                            <span className="text-blue-400">Click to open →</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToFolder(folder.path);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        title="Open folder"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Show files in current folder */}
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer ${
                          selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 bg-gray-750' : ''
                        }`}
                        onClick={(e) => handleFileSelect(file, e)}
                        onContextMenu={(e) => handleContextMenu(e, file)}
                      >
                        <div className="text-center">
                          <span className="text-4xl block mb-2">{getFileIcon(file.mime_type, file.original_filename)}</span>
                          <h4 className="text-white font-medium text-sm truncate mb-2">{file.original_filename}</h4>
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>{formatFileSize(file.file_size)}</div>
                            <div>{file.upload_type}</div>
                            <div>{formatDate(file.uploaded_at)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // List View
                  <div className="space-y-2">
                    {displayFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer ${
                          selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 bg-gray-750' : ''
                        }`}
                        onClick={(e) => handleFileSelect(file, e)}
                        onContextMenu={(e) => handleContextMenu(e, file)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <span className="text-2xl">{getFileIcon(file.mime_type, file.original_filename)}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{file.original_filename}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                                <span>{formatFileSize(file.file_size)}</span>
                                <span>{file.upload_type.replace('_', ' ')}</span>
                                <span>{formatDate(file.uploaded_at)}</span>
                                {file.folder && (
                                  <span className="flex items-center">
                                    <Folder className="h-3 w-3 mr-1" />
                                    {file.folder}
                                  </span>
                                )}
                              </div>
                              {file.description && (
                                <p className="text-gray-300 text-sm mt-1">{file.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const viewUrl = file.public_url || file.file_url;
                                if (viewUrl) {
                                  window.open(viewUrl, '_blank');
                                }
                              }}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-colors"
                              title="View file"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadFile(file);
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Download file"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file);
                              }}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Delete file"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Footer */}
          <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {selectedFiles.size > 0 ? (
                  <span className="text-blue-400">
                    {selectedFiles.size} of {filteredFiles.length} files selected
                  </span>
                ) : (
                  <span>Total: {filteredFiles.length} of {files.length} files</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {clipboard && (
                  <button
                    onClick={handlePaste}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    disabled={!currentFolder}
                  >
                    Paste {clipboard.action === 'copy' ? 'Copy' : 'Cut'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-60 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-2 min-w-48"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y
          }}
        >
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </button>
          <button
            onClick={handleCut}
            className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center space-x-2"
          >
            <Cut className="h-4 w-4" />
            <span>Cut</span>
          </button>
          <button
            onClick={handlePaste}
            className={`w-full px-4 py-2 text-left flex items-center space-x-2 ${
              clipboard ? 'text-white hover:bg-gray-700' : 'text-gray-500 cursor-not-allowed'
            }`}
            disabled={!clipboard}
          >
            <Paste className="h-4 w-4" />
            <span>Paste</span>
          </button>
          <hr className="border-gray-600 my-1" />
          <button
            onClick={handleRename}
            className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center space-x-2"
          >
                            <Edit3 className="h-4 w-4" />
            <span>Rename</span>
          </button>
          <button
            onClick={() => {
              if (contextMenuTarget) {
                downloadFile(contextMenuTarget);
              }
              setShowContextMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
          <hr className="border-gray-600 my-1" />
          <button
            onClick={() => {
              if (contextMenuTarget) {
                handleDeleteFile(contextMenuTarget);
              }
              setShowContextMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Files</h3>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="w-full mb-4"
            />
            
            {uploadingFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-2">Selected files:</p>
                <ul className="text-gray-400 text-sm space-y-1">
                  {uploadingFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowUploadDialog(false);
                  setUploadingFiles([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                disabled={uploadingFiles.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete File"
        message="Are you sure you want to delete this file?"
        itemName={deletingFile?.original_filename}
        variant="danger"
      />
    </div>
  );
}
