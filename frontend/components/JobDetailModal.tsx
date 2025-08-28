'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Palette, Globe, Github, Calendar, Clock, DollarSign, Target, Users, FileText, ExternalLink, CheckCircle, AlertCircle, FolderOpen, Edit3, Save, ArrowLeft, Plus, Upload } from 'lucide-react';
import { api } from '@/lib/https';
import FileManagementModal from './FileManagementModal';
import { ErrorModal } from '@/components/modals';
import { 
  Job, 
  JobUpdate,
  UserUpdateRequest,
  FileUploadExtended as FileUploadType,
  JOB_STATUSES_OBJ,
  JOB_PRIORITIES_OBJ
} from '@/types';

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  isCustomer?: boolean;
  onSave?: (updatedJob: Partial<JobUpdate>) => Promise<void>;
}

export default function JobDetailModal({ isOpen, onClose, jobId, isCustomer = false, onSave }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<JobUpdate>>({});
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [newResource, setNewResource] = useState({ type: '', name: '', url: '' });
  const [newTool, setNewTool] = useState({ name: '', api_key: '', url: '' });
  const [newServer, setNewServer] = useState({ name: '', url: '', type: '' });
  const [newNote, setNewNote] = useState('');
  const [showResourceHelp, setShowResourceHelp] = useState(false);
  const [customResourceTypes, setCustomResourceTypes] = useState<string[]>([]);
  const [showAddResourceType, setShowAddResourceType] = useState(false);
  const [newResourceType, setNewResourceType] = useState('');
  const [showFileManager, setShowFileManager] = useState<'logo' | 'project' | 'reference' | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [newColor, setNewColor] = useState('#000000');
  const [jobFiles, setJobFiles] = useState<FileUploadType[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<number>>(new Set());
  const [showFileManagementModal, setShowFileManagementModal] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState<'logo' | 'project' | 'reference' | null>(null);
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string; type: 'error' | 'warning' | 'success' | 'info' }>({ show: false, message: '', type: 'error' });

  if (!isOpen || !jobId) return null;

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobData();
      fetchJobFiles();
    }
  }, [isOpen, jobId]);

  useEffect(() => {
    if (job) {
      setEditData(job);
    }
  }, [job]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      
      const response = await api.get<Job>(`/jobs/${jobId}`);
      
      // Handle new standardized API response format
      const jobData = response?.data || response;
      setJob(jobData);
      setEditData(jobData);
    } catch (error) {
      console.error('❌ Failed to fetch job data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobFiles = async () => {
    try {
      const response = await api.get<{ files: FileUploadType[] }>(`/file-upload/customer/job/${jobId}/files`);
      
      // The API response has a nested structure: { files: Array, file_server_status: 'success', ... }
      const filesData = response.files || [];
      setJobFiles(filesData);
    } catch (error) {
      console.error('Failed to fetch job files:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (onSave) {
        await onSave(editData);
      } else {
        // Split the data: job-specific fields vs user/customer fields
        const jobFields = [
          'title', 'description', 'status', 'priority', 'start_date', 'deadline',
          'completion_date', 'estimated_hours', 'actual_hours', 'hourly_rate',
          'fixed_price', 'resources', 'additional_tools', 'server_details',
          'notes', 'milestones', 'deliverables', 'google_drive_links',
          'github_repositories', 'workspace_links', 'calendar_links',
          'meeting_links', 'additional_resource_info', 'progress_percentage',
          'project_goals', 'target_audience', 'timeline', 'budget_range',
          'brand_colors', 'brand_color_tags', 'brand_color_tag_others',
          'brand_style', 'brand_style_other', 'logo_files', 'brand_guidelines',
          'website_url', 'github_url', 'portfolio_url', 'social_media'
        ];
        
        const userFields = [
          'business_name', 'business_type', 'industry', 'industry_other'
        ];
        
        // Extract job data
        const jobData: Partial<JobUpdate> = {};
        Object.keys(editData).forEach(key => {
          if (jobFields.includes(key) && editData[key as keyof JobUpdate] !== undefined) {
            (jobData as any)[key] = editData[key as keyof JobUpdate];
          }
        });
        
        // Extract user data
        const userData: Partial<UserUpdateRequest> = {};
        Object.keys(editData).forEach(key => {
          if (userFields.includes(key) && editData[key as keyof JobUpdate] !== undefined) {
            (userData as any)[key] = editData[key as keyof JobUpdate];
          }
        });
        
        // Save job data
        const jobResponse = await api.put(`/jobs/${jobId}`, jobData);
        
        // Save user data if there are user fields to update
        if (Object.keys(userData).length > 0 && job?.customer_id) {
          try {
            await api.put(`/users/${job.customer_id}`, userData);
          } catch (userError) {
            console.warn('Could not update user data:', userError);
          }
        }
        
        if (jobResponse.data) {
          setJob(jobResponse.data);
          setEditData(jobResponse.data);
        }
      }
      
      setIsEditing(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('❌ Error saving job:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (job) {
      setEditData(job);
    }
    setIsEditing(false);
  };

  const addResource = () => {
    if (!newResource.type || !newResource.name) return;
    
    const resource = {
      type: newResource.type as 'website' | 'github' | 'drive' | 'workspace' | 'service',
      name: newResource.name,
      url: newResource.url || '',
      description: newResource.url ? `Resource: ${newResource.name}` : undefined
    };

    const currentResources = editData.resources || [];
    setEditData({
      ...editData,
      resources: [...currentResources, resource]
    });

    setNewResource({ type: '', name: '', url: '' });
  };

  const addTool = () => {
    if (!newTool.name) return;
    
    const tool = {
      name: newTool.name,
      api_key: newTool.api_key || '',
      url: newTool.url || '',
      description: `Tool: ${newTool.name}`
    };

    const currentTools = editData.additional_tools || [];
    setEditData({
      ...editData,
      additional_tools: [...currentTools, tool]
    });

    setNewTool({ name: '', api_key: '', url: '' });
  };

  const addServer = () => {
    if (!newServer.name) return;
    
    const server = {
      name: newServer.name,
      url: newServer.url || '',
      type: newServer.type || '',
      description: `Server: ${newServer.name}`
    };

    const currentServers = editData.server_details || [];
    setEditData({
      ...editData,
      server_details: [...currentServers, server]
    });

    setNewServer({ name: '', url: '', type: '' });
  };

  const removeResource = (field: keyof JobUpdateRequest, index: number) => {
    if (field === 'resources') {
      const currentResources = editData.resources || [];
      const newResources = currentResources.filter((_, i) => i !== index);
      setEditData({
        ...editData,
        resources: newResources
      });
    } else {
      const currentArray = editData[field] as any[];
      if (!currentArray) return;
      
      const newArray = currentArray.filter((_, i) => i !== index);
      setEditData({
        ...editData,
        [field]: newArray
      });
    }
  };

  const handleFileUpload = async (files: FileList | null, type: 'logo' | 'project' | 'reference') => {
    if (!files || files.length === 0 || !job) return;
    
    setUploadingFiles(true);
    try {
      const uploadedFileIds: number[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_type', type);
        formData.append('description', `${type} file for job: ${job.title}`);
        formData.append('job_id', job.id.toString());
        formData.append('folder', `documents/${job.id}/${type}`);
        
        const response = await api.post('/file-upload/customer/upload', formData);
        
        if (response.file_id) {
          uploadedFileIds.push(response.file_id);
        }
      }

      const currentFiles = editData[`${type}_files` as keyof JobUpdateRequest] as number[] || [];
      setEditData({
        ...editData,
        [`${type}_files`]: [...currentFiles, ...uploadedFileIds]
      });

      await fetchJobFiles();

    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleGeneralFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !job) return;
    
    setUploadingFiles(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_type', 'general');
        formData.append('description', `General file for job: ${job.title}`);
        formData.append('job_id', job.id.toString());
        formData.append('folder', `documents/${job.id}`);
        
        await api.post('/file-upload/customer/upload', formData);
      }

      await fetchJobFiles();

    } catch (error) {
      console.error('General file upload failed:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const addBrandColor = () => {
    if (!newColor || newColor === '#000000') return;
    
    const currentColors = editData.brand_colors || [];
    if (!currentColors.includes(newColor)) {
      setEditData({
        ...editData,
        brand_colors: [...currentColors, newColor]
      });
    }
    setNewColor('#000000');
  };

  const removeBrandColor = (index: number) => {
    const currentColors = editData.brand_colors || [];
    const newColors = currentColors.filter((_, i) => i !== index);
    setEditData({
      ...editData,
      brand_colors: newColors
    });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    
    const currentNotes = editData.additional_resource_info || [];
    setEditData({
      ...editData,
      additional_resource_info: [...currentNotes, newNote.trim()]
    });
    setNewNote('');
  };

  const updateNote = (index: number, value: string) => {
    const currentNotes = editData.additional_resource_info || [];
    const updatedNotes = [...currentNotes];
    updatedNotes[index] = value;
    setEditData({
      ...editData,
      additional_resource_info: updatedNotes
    });
  };

  const deleteNote = (index: number) => {
    const currentNotes = editData.additional_resource_info || [];
    const updatedNotes = currentNotes.filter((_, i) => i !== index);
    setEditData({
      ...editData,
      additional_resource_info: updatedNotes
    });
  };

  const deleteFile = async (fileId: number) => {
    try {
              await api.del(`/file-upload/files/${fileId}`);
      await fetchJobFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const openFileManagement = (fileType: 'logo' | 'project' | 'reference') => {
    setSelectedFileType(fileType);
    setShowFileManagementModal(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'on_hold': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  
  
  if (!isOpen || !jobId) return null;
  
  // Tabs ordered with editable content first, read-only content last
  const tabs = [
    { id: 'overview', label: 'Overview & Business', icon: Target, editable: true },
    { id: 'branding', label: 'Branding & Design', icon: Palette, editable: true },
    { id: 'resources', label: 'Resources', icon: ExternalLink, editable: true },
    { id: 'files', label: 'Files & Assets', icon: FolderOpen, editable: true },
    { id: 'planning', label: 'Project Planning', icon: Calendar, editable: !isCustomer },
    { id: 'financial', label: 'Financial', icon: DollarSign, editable: !isCustomer }
  ];
  
  // Show empty modal structure while loading or if job is null
  if (!job) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Job Details</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 text-sm font-semibold rounded-full border bg-gray-500/20 text-gray-400 border-gray-500/30">
                      LOADING
                    </span>
                    <span className="px-3 py-1.5 text-sm font-semibold rounded-full border bg-gray-500/20 text-gray-400 border-gray-500/30">
                      MEDIUM
                    </span>
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '0%' }} />
                      </div>
                      <span className="text-sm font-medium">0%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 bg-gray-800/50">
            <div className="flex space-x-1 px-8 py-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto h-[calc(90vh-200px)]">
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-gray-400">Loading job information...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderEditableField = (label: string, value: any, field: keyof JobUpdateRequest, type: 'text' | 'textarea' | 'select' | 'date' = 'text', options?: string[]) => {
    if (!isEditing) {
      return (
        <div className="flex justify-between items-start py-3 border-b border-gray-700/50">
          <span className="text-gray-400 font-medium min-w-[120px]">{label}</span>
          <span className="text-white text-right flex-1 ml-4">{value || 'Not specified'}</span>
        </div>
      );
    }

    const fieldValue = editData[field];
    if (Array.isArray(fieldValue) || (typeof fieldValue === 'object' && fieldValue !== null)) {
      return null;
    }

    if (type === 'textarea') {
      return (
        <div className="py-3 border-b border-gray-700/50">
          <label className="block text-gray-400 font-medium mb-2">{label}</label>
          <textarea
            value={String(fieldValue || '')}
            onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      );
    }

    if (type === 'select') {
      return (
        <div className="py-3 border-b border-gray-700/50">
          <label className="block text-gray-400 font-medium mb-2">{label}</label>
          <select
            value={String(fieldValue || '')}
            onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }

    if (type === 'date') {
      return (
        <div className="py-3 border-b border-gray-700/50">
          <label className="block text-gray-400 font-medium mb-2">{label}</label>
          <input
            type="date"
            value={fieldValue ? new Date(String(fieldValue)).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const dateValue = e.target.value;
              setEditData({ ...editData, [field]: dateValue ? new Date(dateValue).toISOString() : null });
            }}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );
    }

    return (
      <div className="py-3 border-b border-gray-700/50">
        <label className="block text-gray-400 font-medium mb-2">{label}</label>
        <input
          type="text"
          value={String(fieldValue || '')}
          onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{job?.title || 'Job Details'}</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${getStatusColor(job?.status || 'pending')}`}>
                    {(job?.status || 'pending').replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${getPriorityColor(job?.priority || 'medium')}`}>
                    {(job?.priority || 'medium').toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${job?.progress_percentage || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{job?.progress_percentage || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Job
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mx-8 mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Job updated successfully!</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-700 bg-gray-800/50">
          <div className="flex space-x-1 px-8 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {!tab.editable && (
                    <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">Read Only</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8 overflow-y-auto h-[calc(90vh-200px)]">
          {/* Overview & Business Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Project Overview */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <Target className="h-6 w-6 text-blue-500" />
                  Project Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableField('Project Goals', job?.project_goals, 'project_goals', 'textarea')}
                  {renderEditableField('Target Audience', job?.target_audience, 'target_audience')}
                  {renderEditableField('Timeline', job?.timeline, 'timeline', 'select', [
                    '1-2 weeks',
                    '3-4 weeks', 
                    '1-2 months',
                    '3-6 months',
                    '6+ months'
                  ])}
                  {renderEditableField('Budget Range', job?.budget_range, 'budget_range', 'select', [
                    'Under $1,000',
                    '$1,000 - $5,000',
                    '$5,000 - $10,000',
                    '$10,000 - $25,000',
                    '$25,000 - $50,000',
                    '$50,000+'
                  ])}
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-blue-500" />
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableField('Business Name', job?.business_name, 'business_name')}
                  {renderEditableField('Business Type', job?.business_type, 'business_type', 'select', [
                    'Startup',
                    'Small Business',
                    'Medium Business',
                    'Enterprise',
                    'Non-Profit',
                    'Agency',
                    'Freelancer',
                    'Other'
                  ])}
                  {isEditing ? (
                    <div className="py-3 border-b border-gray-700/50">
                      <label className="block text-gray-400 font-medium mb-2">Industry</label>
                      <select
                        value={editData.industry || ''}
                        onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Retail">Retail</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Design">Design</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Other">Other</option>
                      </select>
                      {editData.industry === 'Other' && (
                        <input
                          type="text"
                          value={editData.industry_other || ''}
                          onChange={(e) => setEditData({ ...editData, industry_other: e.target.value })}
                          placeholder="Please describe your industry"
                          className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between items-start py-3 border-b border-gray-700/50">
                      <span className="text-gray-400 font-medium min-w-[120px]">Industry</span>
                      <span className="text-white text-right flex-1 ml-4">
                        {job?.industry === 'Other' ? (job?.industry_other || 'Other') : (job?.industry || 'Not specified')}
                      </span>
                    </div>
                  )}
                  {renderEditableField('Brand Guidelines', job?.brand_guidelines, 'brand_guidelines', 'textarea')}
                </div>
              </div>

              {/* Online Presence */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <Globe className="h-6 w-6 text-blue-500" />
                  Online Presence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-gray-400 font-medium">Website</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-2 text-sm text-gray-400 bg-gray-700 border border-r-0 border-gray-600 rounded-l-lg">
                        https://
                      </span>
                                              <input
                          type="text"
                          value={editData.website_url?.replace('https://', '') || ''}
                          onChange={(e) => setEditData({ ...editData, website_url: e.target.value ? `https://${e.target.value}` : '' })}
                          className="flex-1 bg-gray-800 border border-gray-600 rounded-r-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="yourcompany.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-gray-400 font-medium">GitHub</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 py-2 text-sm text-gray-400 bg-gray-700 border border-r-0 border-gray-600 rounded-l-lg">
                          https://github.com/
                        </span>
                        <input
                          type="text"
                          value={editData.github_url?.replace('https://github.com/', '') || ''}
                          onChange={(e) => setEditData({ ...editData, github_url: e.target.value ? `https://github.com/${e.target.value}` : '' })}
                          className="flex-1 bg-gray-800 border border-gray-600 rounded-r-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="username"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-gray-400 font-medium">Portfolio</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 py-2 text-sm text-gray-400 bg-gray-700 border border-r-0 border-gray-600 rounded-l-lg">
                          https://
                        </span>
                        <input
                          type="text"
                          value={editData.portfolio_url?.replace('https://', '') || ''}
                          onChange={(e) => setEditData({ ...editData, portfolio_url: e.target.value ? `https://${e.target.value}` : '' })}
                          className="flex-1 bg-gray-800 border border-gray-600 rounded-r-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="yourportfolio.com"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Social Media */}
                  <div className="mt-4">
                    <h4 className="text-lg font-medium text-white mb-3">Social Media</h4>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: 'facebook', label: 'Facebook', prefix: 'https://facebook.com/' },
                          { key: 'twitter', label: 'Twitter/X', prefix: 'https://twitter.com/' },
                          { key: 'instagram', label: 'Instagram', prefix: 'https://instagram.com/' },
                          { key: 'linkedin', label: 'LinkedIn', prefix: 'https://linkedin.com/company/' },
                          { key: 'youtube', label: 'YouTube', prefix: 'https://youtube.com/' },
                          { key: 'tiktok', label: 'TikTok', prefix: 'https://tiktok.com/@' },
                          { key: 'pinterest', label: 'Pinterest', prefix: 'https://pinterest.com/' },
                          { key: 'snapchat', label: 'Snapchat', prefix: 'https://snapchat.com/add/' }
                                                 ].map((platform) => (
                           <div key={platform.key} className="space-y-2">
                             <label className="block text-gray-400 font-medium text-sm">{platform.label}</label>
                             <div className="flex">
                               <span className="inline-flex items-center px-3 py-2 text-sm text-gray-400 bg-gray-700 border border-r-0 border-gray-600 rounded-l-lg">
                                 {platform.prefix}
                               </span>
                               <input
                                 type="text"
                                 value={editData.social_media?.[platform.key as keyof typeof editData.social_media] || ''}
                                 onChange={(e) => {
                                   const newSocial = { ...editData.social_media, [platform.key]: e.target.value };
                                   setEditData({ ...editData, social_media: newSocial });
                                 }}
                                 className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                 placeholder="username"
                               />
                             </div>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(job?.social_media || {}).map(([platform, url]) => (
                          url && (
                            <div key={platform} className="flex items-center gap-2">
                              <span className="capitalize font-medium text-gray-300">{platform}:</span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-400 text-sm"
                              >
                                {url}
                              </a>
                            </div>
                          )
                        ))}
                        {(!job?.social_media || Object.keys(job?.social_media).length === 0) && (
                          <p className="text-gray-400 text-sm col-span-2">No social media links added yet</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              {/* Timeline */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-blue-500" />
                  Project Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableField('Start Date', formatDate(job?.start_date), 'start_date', 'date')}
                  {renderEditableField('Deadline', formatDate(job?.deadline), 'deadline', 'date')}
                  {job?.completion_date && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                      <span className="text-gray-400 font-medium">Completed</span>
                      <span className="text-white">{formatDate(job.completion_date)}</span>
                    </div>
                  )}
                </div>
              </div>

              {job?.notes && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-blue-500" />
                    Additional Notes
                  </h3>
                  {renderEditableField('Notes', job.notes, 'notes', 'textarea')}
                </div>
              )}

              {/* Additional Notes */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-500" />
                  Additional Notes
                </h3>
                
                {/* Add New Note */}
                {isEditing && (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a new note..."
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={addNote}
                        disabled={!newNote.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Display Notes */}
                {(editData.additional_resource_info?.length || job.additional_resource_info?.length) && (
                  <div className="space-y-2">
                    {(editData.additional_resource_info || job.additional_resource_info || []).map((note, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-gray-800 border border-gray-700/50 rounded-lg">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={note}
                              onChange={(e) => updateNote(index, e.target.value)}
                              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => deleteNote(index)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <div className="flex-1 text-white text-sm">{note}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Empty State */}
                {!editData.additional_resource_info?.length && !job.additional_resource_info?.length && (
                  <div className="text-gray-500 text-sm italic">
                    No additional notes yet. {isEditing && 'Add your first note above!'}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* Brand Colors Section */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <Palette className="h-6 w-6 text-blue-400" />
                  Brand Colors
                </h3>
                
                {isEditing ? (
                  <div className="space-y-6">
                    {/* Color Palette Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(editData.brand_colors || []).map((color, index) => (
                        <div key={index} className="relative group">
                          <div className="relative">
                            <div
                              className="w-20 h-20 rounded-xl border-2 border-gray-600 shadow-lg cursor-pointer transition-transform hover:scale-105"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          </div>
                                            <div className="mt-2 text-center">
                    <div className="text-white font-medium text-sm">{color}</div>
                    <div className="text-gray-400 text-xs">Color {index + 1}</div>
                    <div className="mt-1">
                      <select
                        value={editData.brand_color_tags?.[index] || ''}
                        onChange={(e) => {
                          const newTags = { ...editData.brand_color_tags, [index]: e.target.value };
                          setEditData({ ...editData, brand_color_tags: newTags });
                        }}
                        className="w-full text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">No tag</option>
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="accent">Accent</option>
                        <option value="other">Other</option>
                      </select>
                      {editData.brand_color_tags?.[index] === 'other' && (
                        <input
                          type="text"
                          value={editData.brand_color_tag_others?.[index] || ''}
                          onChange={(e) => {
                            const newOthers = { ...editData.brand_color_tag_others, [index]: e.target.value };
                            setEditData({ ...editData, brand_color_tag_others: newOthers });
                          }}
                          placeholder="Custom tag name"
                          className="w-full mt-1 text-xs px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>
                    <button
                      onClick={() => removeBrandColor(index)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2 py-1 text-xs font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 shadow-lg hover:scale-105"
                      style={{ transform: 'translate(50%, -50%)' }}
                    >
                      Remove
                    </button>
                  </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add New Color */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700/50">
                      <h4 className="text-lg font-medium text-white mb-3">Add New Color</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="color"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="w-16 h-16 rounded-lg border-2 border-gray-600 cursor-pointer shadow-lg"
                          />
                          <span className="text-xs text-gray-400">Pick Color</span>
                        </div>
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            placeholder="#000000"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={addBrandColor}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                            >
                              Add to Palette
                            </button>
                            <button
                              onClick={() => setNewColor('#000000')}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-400 text-lg">💡</span>
                          <div className="text-sm text-blue-300">
                            <div className="font-medium mb-1">Color Palette Tips:</div>
                            <ul className="space-y-1 text-xs">
                              <li>• Primary: Your main brand color (use 60% of the time)</li>
                              <li>• Secondary: Supporting color (use 30% of the time)</li>
                              <li>• Accent: Highlight color (use 10% of the time)</li>
                              <li>• Ensure good contrast for accessibility</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {job.brand_colors && job.brand_colors.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {job.brand_colors.map((color, index) => (
                          <div key={index} className="text-center">
                            <div
                              className="w-20 h-20 rounded-xl border-2 border-gray-600 shadow-lg mx-auto"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                            <div className="mt-2">
                              <div className="text-white font-medium text-sm">{color}</div>
                              <div className="text-gray-400 text-xs">Color {index + 1}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">🎨</div>
                        <p className="text-gray-400">No brand colors specified yet</p>
                        <p className="text-xs text-gray-500 mt-1">Add your brand colors to get started</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Brand Style & Guidelines */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <Target className="h-6 w-6 text-blue-400" />
                    Brand Style
                  </h3>
                  {isEditing ? (
                    <div className="py-3 border-b border-gray-700/50">
                      <label className="block text-gray-400 font-medium mb-2">Brand Style</label>
                      <select
                        value={editData.brand_style || ''}
                        onChange={(e) => setEditData({ ...editData, brand_style: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select brand style</option>
                        <option value="Modern & Minimalist">Modern & Minimalist</option>
                        <option value="Classic & Professional">Classic & Professional</option>
                        <option value="Creative & Artistic">Creative & Artistic</option>
                        <option value="Bold & Dynamic">Bold & Dynamic</option>
                        <option value="Elegant & Sophisticated">Elegant & Sophisticated</option>
                        <option value="Playful & Fun">Playful & Fun</option>
                        <option value="Tech & Futuristic">Tech & Futuristic</option>
                        <option value="Organic & Natural">Organic & Natural</option>
                        <option value="other">Other</option>
                      </select>
                      {editData.brand_style === 'other' && (
                        <input
                          type="text"
                          value={editData.brand_style_other || ''}
                          onChange={(e) => setEditData({ ...editData, brand_style_other: e.target.value })}
                          placeholder="Describe your brand style"
                          className="w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between items-start py-3 border-b border-gray-700/50">
                      <span className="text-gray-400 font-medium min-w-[120px]">Brand Style</span>
                      <span className="text-white text-right flex-1 ml-4">
                        {job.brand_style === 'other' ? (job.brand_style_other || 'Other') : (job.brand_style || 'Not specified')}
                      </span>
                    </div>
                  )}
                  <div className="mt-3 text-sm text-gray-400">
                    💡 Choose the style that best represents your brand personality
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-blue-400" />
                    Brand Guidelines
                  </h3>
                  {renderEditableField('Brand Guidelines', job.brand_guidelines, 'brand_guidelines', 'textarea')}
                  <div className="mt-3 text-sm text-gray-400">
                    💡 Describe your brand's voice, tone, and visual preferences
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              {/* Add New Resource Section */}
              {isEditing && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                      <Plus className="h-6 w-6 text-electric-blue" />
                      Add New Resource
                    </h3>
                    <button
                      onClick={() => setShowAddResourceType(true)}
                      className="text-sm text-electric-blue hover:text-electric-blue/80 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Resource Type
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-400 font-medium mb-2">Resource Type</label>
                      <select
                        value={newResource.type || ''}
                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      >
                        <option value="">Select type</option>
                        <option value="website">Website</option>
                        <option value="social">Social Media</option>
                        <option value="drive">Google Drive</option>
                        <option value="github">GitHub</option>
                        <option value="workspace">Workspace</option>
                        <option value="service">Service</option>
                        {customResourceTypes.map((type, index) => (
                          <option key={index} value={type.toLowerCase()}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={newResource.name || ''}
                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                        placeholder="e.g., Company Website, Facebook Page"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-400 font-medium mb-2">URL</label>
                      <input
                        type="url"
                        value={newResource.url || ''}
                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                      <button
                        onClick={addResource}
                        className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg transition-colors font-medium"
                      >
                        Add Resource
                      </button>
                      <button
                        onClick={() => setNewResource({ type: '', name: '', url: '' })}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Added Resources */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <ExternalLink className="h-6 w-6 text-electric-blue" />
                  Resources & Links
                </h3>
                
                {(editData.resources?.length || job.resources?.length) ? (
                  <div className="flex w-full flex-wrap gap-4">
                    {/* All Resources */}
                    {(editData.resources || job.resources || []).map((resource, index) => (
                        <div key={`resource-${index}`} className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${
                              resource.type === 'drive' ? 'bg-blue-500/20' :
                              resource.type === 'github' ? 'bg-gray-500/20' :
                              resource.type === 'workspace' ? 'bg-green-500/20' :
                              'bg-electric-blue/20'
                            }`}>
                              {resource.type === 'drive' ? <FolderOpen className="h-5 w-5 text-blue-400" /> :
                               resource.type === 'github' ? <Github className="h-5 w-5 text-gray-400" /> :
                               resource.type === 'workspace' ? <ExternalLink className="h-5 w-5 text-green-400" /> :
                               <ExternalLink className="h-5 w-5 text-electric-blue" />
                              }
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium capitalize">{resource.type}</div>
                            </div>
                            {isEditing && (
                              <button
                                onClick={() => removeResource('resources', index)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          
                          {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-gray-400 text-sm font-medium mb-1">Name</label>
                                <input
                                  type="text"
                                  value={resource.name}
                                  onChange={(e) => {
                                    const updatedResources = [...(editData.resources || [])];
                                    updatedResources[index] = { ...resource, name: e.target.value };
                                    setEditData({ ...editData, resources: updatedResources });
                                  }}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-400 text-sm font-medium mb-1">URL</label>
                                <input
                                  type="url"
                                  value={resource.url || ''}
                                  onChange={(e) => {
                                    const updatedResources = [...(editData.resources || [])];
                                    updatedResources[index] = { ...resource, url: e.target.value };
                                    setEditData({ ...editData, resources: updatedResources });
                                  }}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                                />
                              </div>

                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-white font-medium">{resource.name}</div>
                              {resource.url && (
                                <div className="flex items-center gap-2">
                                  <div className="text-gray-400 text-sm truncate flex-1">{resource.url}</div>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(resource.url || '')}
                                    className="p-1 text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/20 rounded transition-colors"
                                    title="Copy URL"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                              {/* API keys are now handled in Additional Tools section */}
                            </div>
                          )}
                        </div>
                      ))}

                    </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🔗</div>
                    <p className="text-gray-400">No resources added yet</p>
                    <p className="text-xs text-gray-500 mt-1">Resources and links will appear here when added</p>
                  </div>
                )}
              </div>

              {/* Add New Resource Type Modal */}
              {showAddResourceType && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full mx-4">
                    <h3 className="text-xl font-semibold text-white mb-4">Add New Resource Type</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 font-medium mb-2">Resource Type Name</label>
                        <input
                          type="text"
                          value={newResourceType}
                          onChange={(e) => setNewResourceType(e.target.value)}
                          placeholder="e.g., Calendar, Analytics, CRM"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (newResourceType.trim()) {
                              setCustomResourceTypes([...customResourceTypes, newResourceType.trim()]);
                              setNewResourceType('');
                              setShowAddResourceType(false);
                            }
                          }}
                          disabled={!newResourceType.trim()}
                          className="flex-1 px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Type
                        </button>
                        <button
                          onClick={() => {
                            setNewResourceType('');
                            setShowAddResourceType(false);
                          }}
                          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Tools */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Additional Tools</h3>
                </div>
                
                {isEditing && (
                  <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                    <h4 className="text-lg font-medium text-white mb-3">Add New Tool</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={newTool.name}
                        onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                        placeholder="Tool name"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={newTool.api_key || ''}
                        onChange={(e) => setNewTool({ ...newTool, api_key: e.target.value })}
                        placeholder="API Key (optional)"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                      <input
                        type="url"
                        value={newTool.url || ''}
                        onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
                        placeholder="Tool URL (optional)"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={addTool}
                        disabled={!newTool.name}
                        className="px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                        Add Tool
                      </button>
                      <button
                        onClick={() => setNewTool({ name: '', api_key: '', url: '' })}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}                

                {/* Display Tools */}
                {(editData.additional_tools?.length || job.additional_tools?.length) ? (
                  <div className="space-y-4">
                    {(editData.additional_tools || job.additional_tools || []).map((tool, index) => (
                      <div key={`tool-${index}`} className="p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <ExternalLink className="h-5 w-5 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium capitalize">Tool</div>
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => {
                                const currentTools = editData.additional_tools || [];
                                const newTools = currentTools.filter((_, i) => i !== index);
                                setEditData({ ...editData, additional_tools: newTools });
                              }}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-1">Name</label>
                              <input
                                type="text"
                                value={tool.name}
                                onChange={(e) => {
                                  const currentTools = [...(editData.additional_tools || [])];
                                  currentTools[index] = { ...currentTools[index], name: e.target.value };
                                  setEditData({ ...editData, additional_tools: currentTools });
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                                placeholder="Tool name"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-1">URL</label>
                              <input
                                type="url"
                                value={tool.url || ''}
                                onChange={(e) => {
                                  const currentTools = [...(editData.additional_tools || [])];
                                  currentTools[index] = { ...currentTools[index], url: e.target.value };
                                  setEditData({ ...editData, additional_tools: currentTools });
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                                placeholder="Tool URL (optional)"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-1">API Key</label>
                              <input
                                type="text"
                                value={tool.api_key || ''}
                                onChange={(e) => {
                                  const currentTools = [...(editData.additional_tools || [])];
                                  currentTools[index] = { ...currentTools[index], api_key: e.target.value };
                                  setEditData({ ...editData, additional_tools: currentTools });
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                                placeholder="API Key (optional)"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-white font-medium">{tool.name}</div>
                            {tool.url && <div className="text-gray-400 text-sm">URL: {tool.url}</div>}
                            {tool.api_key && (
                              <div className="text-gray-400 text-sm">
                                API Key: {tool.api_key}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🔧</div>
                    <p className="text-gray-400">No additional tools configured yet</p>
                  </div>
                )}
              </div>

              {/* Server Details */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Server Details</h3>
                </div>
                
                {isEditing && (
                  <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                    <h4 className="text-lg font-medium text-white mb-3">Add New Server</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={newServer.name}
                        onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                        placeholder="Server name"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                      <input
                        type="url"
                        value={newServer.url}
                        onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                        placeholder="Server URL (optional)"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={newServer.type}
                        onChange={(e) => setNewServer({ ...newServer, type: e.target.value })}
                        placeholder="Server type (optional)"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={addServer}
                        disabled={!newServer.name}
                        className="px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                        Add Server
                      </button>
                      <button
                        onClick={() => setNewServer({ name: '', url: '', type: '' })}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Display Servers */}
                {(editData.server_details?.length || job.server_details?.length) ? (
                  <div className="space-y-4">
                    {(editData.server_details || job.server_details || []).map((server, index) => (
                      <div key={`server-${index}`} className="p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-orange-500/20 rounded-lg">
                            <ExternalLink className="h-5 w-5 text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium capitalize">Server</div>
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => {
                                const currentServers = editData.server_details || [];
                                const newServers = currentServers.filter((_, i) => i !== index);
                                setEditData({ ...editData, server_details: newServers });
                              }}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-1">Name</label>
                              <input
                                type="text"
                                value={server.name}
                                onChange={(e) => {
                                  const currentServers = [...(editData.server_details || [])];
                                  currentServers[index] = { ...currentServers[index], name: e.target.value };
                                  setEditData({ ...editData, server_details: currentServers });
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                                placeholder="Server name"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-1">URL</label>
                              <input
                                type="url"
                                value={server.url || ''}
                                onChange={(e) => {
                                  const currentServers = [...(editData.server_details || [])];
                                  currentServers[index] = { ...currentServers[index], url: e.target.value };
                                  setEditData({ ...editData, server_details: currentServers });
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                                placeholder="Server URL (optional)"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-1">Type</label>
                              <input
                                type="text"
                                value={server.type || ''}
                                onChange={(e) => {
                                  const currentServers = [...(editData.server_details || [])];
                                  currentServers[index] = { ...currentServers[index], type: e.target.value };
                                  setEditData({ ...editData, server_details: currentServers });
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                                placeholder="Server type (optional)"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-white font-medium">{server.name}</div>
                            {server.url && <div className="text-gray-400 text-sm">URL: {server.url}</div>}
                            {server.type && <div className="text-gray-400 text-sm">Type: {server.type}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🖥️</div>
                    <p className="text-gray-400">No server details configured yet</p>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <FileText className="h-6 w-6 text-electric-blue" />
                  Additional Notes
                </h3>
                
                {/* Add New Note */}
                {isEditing && (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a new note..."
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                      <button
                        onClick={addNote}
                        disabled={!newNote.trim()}
                        className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Display Notes */}
                {(editData.additional_resource_info?.length || job.additional_resource_info?.length) && (
                  <div className="space-y-2">
                    {(editData.additional_resource_info || job.additional_resource_info || []).map((note, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-gray-800 border border-gray-700/50 rounded-lg">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={note}
                              onChange={(e) => updateNote(index, e.target.value)}
                              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:ring-1 focus:ring-electric-blue focus:border-transparent"
                            />
                            <button
                              onClick={() => deleteNote(index)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <div className="flex-1 text-white text-sm">{note}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Empty State */}
                {!editData.additional_resource_info?.length && !job.additional_resource_info?.length && (
                  <div className="text-gray-500 text-sm italic">
                    No additional notes yet. {isEditing && 'Add your first note above!'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Files & Assets Tab */}
          {activeTab === 'files' && (
            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <FolderOpen className="h-6 w-6 text-blue-500" />
                  Upload New Files
                </h3>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="block text-gray-400 font-medium">🎨 Logo Files</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.ai,.eps,.svg"
                        onChange={(e) => handleFileUpload(e.target.files, 'logo')}
                        disabled={uploadingFiles}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">Logos, brand assets, vector files</p>
                      <div className="text-xs text-gray-400">
                        <strong>Accepted:</strong> PNG, JPG, PDF, AI, EPS, SVG
                      </div>
                      {uploadingFiles && (
                        <div className="flex items-center gap-2 text-blue-500 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                          Uploading...
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-gray-400 font-medium">📁 Project Files</label>
                      <input
                        type="file"
                        multiple
                        accept="*/*"
                        onChange={(e) => handleFileUpload(e.target.files, 'project')}
                        disabled={uploadingFiles}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">Project documents, specifications, contracts</p>
                      <div className="text-xs text-gray-400">
                        <strong>Accepted:</strong> All file types
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-gray-400 font-medium">📚 Reference Files</label>
                      <input
                        type="file"
                        multiple
                        accept="*/*"
                        onChange={(e) => handleFileUpload(e.target.files, 'reference')}
                        disabled={uploadingFiles}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">Inspiration, examples, mood boards</p>
                      <div className="text-xs text-gray-400">
                        <strong>Accepted:</strong> All file types
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-gray-400">File uploads are only available in edit mode</p>
                    <p className="text-gray-500 text-sm mt-1">Click the Edit button to upload files</p>
                  </div>
                )}
              </div>

              {/* File Categories Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <div className="text-3xl mb-2">🎨</div>
                  <div className="text-white font-medium text-lg">Logo Files</div>
                  <div className="text-gray-400 text-sm mb-3">
                    {Array.isArray(jobFiles) ? jobFiles.filter(file => file.upload_type === 'logo').length : 0} uploaded

                  </div>
                  <button
                    onClick={() => openFileManagement('logo')}
                    className="text-sm text-blue-500 hover:text-blue-400"
                  >
                    Manage Files
                  </button>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <div className="text-4xl mb-2">📁</div>
                  <div className="text-white font-medium text-lg">Project Files</div>
                  <div className="text-gray-400 text-sm mb-3">
                    {Array.isArray(jobFiles) ? jobFiles.filter(file => file.upload_type === 'project').length : 0} uploaded
                  </div>
                  <button
                    onClick={() => openFileManagement('project')}
                    className="text-sm text-blue-500 hover:text-blue-400"
                  >
                    Manage Files
                  </button>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <div className="text-4xl mb-2">📚</div>
                  <div className="text-white font-medium text-lg">Reference Files</div>
                  <div className="text-gray-400 text-sm mb-3">
                    {Array.isArray(jobFiles) ? jobFiles.filter(file => file.upload_type === 'reference').length : 0} uploaded
                  </div>
                  <button
                    onClick={() => openFileManagement('reference')}
                    className="text-sm text-blue-500 hover:text-blue-400"
                  >
                    Manage Files
                  </button>
                </div>
              </div>

              {/* Current Files List */}
              {Array.isArray(jobFiles) && jobFiles.length > 0 ? (
                <>
                  {/* General File Upload Section */}
                  {isEditing && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-4">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                        <Upload className="h-6 w-6 text-blue-500" />
                        Upload General Files
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Upload files directly to this job's main folder (documents/{jobId})
                      </p>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => handleGeneralFileUpload(e.target.files)}
                          className="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        {uploadingFiles && (
                          <div className="flex items-center gap-2 text-blue-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            Uploading...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                      <FileText className="h-6 w-6 text-blue-500" />
                      All Files ({Array.isArray(jobFiles) ? jobFiles.length : 0})
                    </h3>
                  
                  <div className="bg-gray-800 rounded-lg border border-gray-700/50 overflow-hidden">
                    {loadingFiles ? (
                      <div className="p-8 text-center text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        Loading files...
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-700/50">
                        {Array.isArray(jobFiles) && jobFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <div className="text-white font-medium">{file.original_filename}</div>
                                <div className="text-gray-400 text-sm">
                                  {file.upload_type} • {Math.round(file.file_size / 1024)}KB
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                  Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <a
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                View File
                              </a>
                              {isEditing && (
                                <button
                                  onClick={() => deleteFile(file.id)}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                </>
              ) : (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <div className="text-4xl mb-3">📁</div>
                  <h3 className="text-lg font-medium text-white mb-2">No Files Uploaded Yet</h3>
                  <p className="text-gray-400 mb-4">Start by uploading your first project files</p>
                  {isEditing && (
                    <button
                      onClick={() => setActiveTab('files')}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Upload Files
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'planning' && (
            <div className="space-y-6">
              {/* Milestones */}
              {job.milestones && job.milestones.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4">Milestones</h3>
                  <div className="space-y-3">
                    {job.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                        {milestone.completed ? (
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-400" />
                          </div>
                        ) : (
                          <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-yellow-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-lg">{milestone.name}</h4>
                          {milestone.description && (
                            <p className="text-gray-400 mt-1">{milestone.description}</p>
                          )}
                          {milestone.due_date && (
                            <p className="text-gray-500 text-sm mt-2">Due: {formatDate(milestone.due_date)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!job.milestones?.length) && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-gray-400">No project planning details available yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <Clock className="h-6 w-6 text-blue-400" />
                    Time Tracking
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                      <span className="text-gray-400 font-medium">Estimated Hours</span>
                      <span className="text-white font-semibold">{job.estimated_hours ? `${job.estimated_hours}h` : 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                      <span className="text-gray-400 font-medium">Actual Hours</span>
                      <span className="text-white font-semibold">{job.actual_hours ? `${job.actual_hours}h` : 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-400 font-medium">Hourly Rate</span>
                      <span className="text-white font-semibold">{job.hourly_rate ? `$${job.hourly_rate}/h` : 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <DollarSign className="h-6 w-6 text-blue-400" />
                    Pricing
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                      <span className="text-gray-400 font-medium">Fixed Price</span>
                      <span className="text-white font-semibold">{job.fixed_price ? `$${job.fixed_price.toLocaleString()}` : 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-400 font-medium">Budget Range</span>
                      <span className="text-white font-semibold">{job.budget_range || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Management Modal */}
      <FileManagementModal
        isOpen={showFileManagementModal}
        onClose={() => {
          setShowFileManagementModal(false);
          setSelectedFileType(null);
        }}
        jobId={jobId}
        title={`${selectedFileType ? selectedFileType.charAt(0).toUpperCase() + selectedFileType.slice(1) : ''} Files`}
        defaultFolder={selectedFileType ? `documents/${jobId}/${selectedFileType === 'logo' ? 'logos' : selectedFileType}` : undefined}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.show}
        onClose={() => setErrorModal({ ...errorModal, show: false })}
        title="Notification"
        message={errorModal.message}
        type={errorModal.type}
      />
    </div>
  );
}
