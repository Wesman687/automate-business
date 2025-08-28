'use client';

import React, { useState, useCallback } from 'react';
import { FileText, FolderOpen, Upload, Download, Trash2, Eye } from 'lucide-react';
import FileManagementModal from '../FileManagementModal';

import { Job, JobFile } from '@/types';

interface JobFilesAssetsProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  setEditData: (data: Job) => void;
  jobId: number;
  jobFiles: JobFile[];
}

export default function JobFilesAssets({ data, isEditing, editData, setEditData, jobId, jobFiles }: JobFilesAssetsProps) {
  const [showFileManagementModal, setShowFileManagementModal] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState<string>('');

  const openFileManagement = useCallback((fileType: string) => {
    setSelectedFileType(fileType);
    setShowFileManagementModal(true);
  }, []);

  const getFileCount = (type: string) => {
    return jobFiles.filter(file => file.folder === type).length;
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'logo':
        return 'Logo Files';
      case 'project':
        return 'Project Files';
      case 'reference':
        return 'Reference Files';
      default:
        return 'Files';
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'logo':
        return '🎨';
      case 'project':
        return '📁';
      case 'reference':
        return '📚';
      default:
        return '📄';
    }
  };

  const fileTypes = ['logo', 'project', 'reference'];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Files & Assets</h3>
      </div>

      {/* File Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fileTypes.map((type) => (
          <div key={type} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getFileTypeIcon(type)}</span>
                <h4 className="font-medium text-gray-900">{getFileTypeLabel(type)}</h4>
              </div>
              <span className="text-sm text-gray-500">{getFileCount(type)} files</span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => openFileManagement(type)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Manage Files</span>
              </button>
              
              {isEditing && (
                <button
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Files</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* File Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3">File Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {fileTypes.map((type) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-gray-600">{getFileTypeLabel(type)}:</span>
              <span className="font-medium text-gray-900">{getFileCount(type)} files</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Total Files:</span>
            <span className="font-bold text-indigo-600">{jobFiles.length} files</span>
          </div>
        </div>
      </div>

      {/* File Management Modal */}
      <FileManagementModal
        isOpen={showFileManagementModal}
        onClose={() => setShowFileManagementModal(false)}
        jobId={jobId}
        title={`Manage ${getFileTypeLabel(selectedFileType)}`}
        defaultFolder={selectedFileType}
      />
    </div>
  );
}
