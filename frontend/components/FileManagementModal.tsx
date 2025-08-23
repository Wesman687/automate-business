'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Eye, FileText, Folder, Calendar, HardDrive } from 'lucide-react';
import { api } from '@/lib/https';

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
}

interface FileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
  jobId?: number;
  title?: string;
}

export default function FileManagementModal({ 
  isOpen, 
  onClose, 
  userId, 
  jobId, 
  title = "File Management" 
}: FileManagementModalProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingFile, setDeletingFile] = useState<FileInfo | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen, userId, jobId]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let endpoint = '/file-upload/files';
      if (jobId) {
        endpoint = `/file-upload/customer/job/${jobId}/files`;
      }
      
      const response = await api.get(endpoint);
      setFiles(response.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const downloadFile = async (file: FileInfo) => {
    try {
      const response = await fetch(file.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    return '📁';
  };

  const filteredFiles = files.filter(file => {
    const matchesType = filterType === 'all' || file.upload_type === filterType;
    const matchesSearch = file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const uploadTypes = ['all', ...Array.from(new Set(files.map(f => f.upload_type)))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 shadow-xl transition-all">
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Folder className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <span className="text-sm text-gray-400">({files.length} files)</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                <button
                  onClick={fetchFiles}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
              <div className="grid gap-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
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
                          onClick={() => downloadFile(file)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file)}
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

          {/* Footer */}
          <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Total: {filteredFiles.length} of {files.length} files
              </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingFile && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 shadow-xl">
              <div className="px-6 py-6">
                <div className="text-center">
                  <Trash2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Delete File</h3>
                  <p className="text-gray-300 mb-6">
                    Are you sure you want to delete "{deletingFile.original_filename}"? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
