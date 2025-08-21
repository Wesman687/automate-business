'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Palette, Globe, Github, Calendar, Clock, DollarSign, Target, Users, FileText, ExternalLink, CheckCircle, AlertCircle, FolderOpen, Edit3, Save, ArrowLeft, Plus } from 'lucide-react';
import { api } from '@/lib/https';

interface JobDetailData {
  // Basic Job Info
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  deadline?: string;
  completion_date?: string;
  progress_percentage: number;
  
  // Business Information
  business_name?: string;
  business_type?: string;
  industry?: string;
  industry_other?: string;
  
  // Project Details
  project_goals?: string;
  target_audience?: string;
  timeline?: string;
  budget_range?: string;
  
  // Branding & Design
  brand_colors?: string[];
  brand_color_tags?: { [key: number]: string };
  brand_color_tag_others?: { [key: number]: string };
  brand_style?: string;
  brand_style_other?: string;
  logo_files?: number[];
  brand_guidelines?: string;
  
  // Resources & Links
  website_url?: string;
  github_url?: string;
  portfolio_url?: string;
  social_media?: {
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    pinterest?: string;
    snapchat?: string;
  };
  
  // Unified Resources Array
  resources?: Array<{
    type: 'website' | 'github' | 'drive' | 'workspace' | 'tool' | 'server';
    name: string;
    url?: string;
    api_key?: string;
    description?: string;
  }>;
  
  // Additional Information
  notes?: string;
  additional_resource_info?: string[];
  
  meeting_links?: Array<{ name: string; url: string; type?: string }>;
  
  // Project Planning
  milestones?: Array<{ name: string; description?: string; due_date?: string; completed: boolean }>;
  deliverables?: Array<{ name: string; description?: string; delivered: boolean; date?: string }>;
  
  // Financial Data (Read-only for customers)
  estimated_hours?: number;
  actual_hours?: number;
  hourly_rate?: number;
  fixed_price?: number;
  
  // Additional Files
  project_files?: number[];
  reference_files?: number[];
  requirements_doc?: string;
  
  // Timestamps
  created_at: string;
  updated_at?: string;
}

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobDetailData | null;
  isCustomer?: boolean;
  onSave?: (updatedJob: Partial<JobDetailData>) => Promise<void>;
}

export default function JobDetailModal({ isOpen, onClose, job, isCustomer = false, onSave }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<JobDetailData>>({});
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
  const [jobFiles, setJobFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<number>>(new Set());

  if (!isOpen || !job) return null;

  useEffect(() => {
    if (job) {
      setEditData(job);
      fetchJobFiles();
    }
  }, [job]);

  const fetchJobFiles = async () => {
    if (!job) return;
    
    setLoadingFiles(true);
    try {
      const response = await api.get(`/file-upload/customer/job/${job.id}/files`);
      setJobFiles(response.files || []);
    } catch (error) {
      console.error('Error fetching job files:', error);
      setJobFiles([]);
    } finally {
      setLoadingFiles(false);
    }
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

  const handleSave = async () => {
    try {
      // Show loading state
      setIsSaving(true);
      
      if (onSave) {
        await onSave(editData);
      } else {
        // For customers, use the customer job update endpoint
        const response = await api.put(`/file-upload/customer/job/${job.id}`, editData);
        console.log('Job updated successfully:', response);
      }
      
      // Refresh the job data
      if (job) {
        // Update the job object with new data
        Object.assign(job, editData);
      }
      
      // Refresh files if we're on the files tab
      if (activeTab === 'files') {
        await fetchJobFiles();
      }
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('Error saving job:', error);
      // Revert to edit mode on error
      setIsEditing(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData(job);
    setIsEditing(false);
    setNewResource({ type: '', name: '', url: '' });
    setNewTool({ name: '', api_key: '', url: '' });
    setNewServer({ name: '', url: '', type: '' });
  };

  const addResource = () => {
    if (!newResource.type || !newResource.name) return;
    
    const resource = {
      type: newResource.type as 'website' | 'github' | 'drive' | 'workspace' | 'tool' | 'server',
      name: newResource.name,
      url: newResource.url || '',
      description: newResource.url ? `Resource: ${newResource.name}` : undefined
    };

    // Add to unified resources array
    const currentResources = editData.resources || [];
    setEditData({
      ...editData,
      resources: [...currentResources, resource]
    });

    setNewResource({ type: '', name: '', url: '' });
  };

  const removeResource = (field: keyof JobDetailData, index: number) => {
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
    if (!files || files.length === 0) return;
    
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
        
        // Use the customer-specific file upload endpoint
        const response = await api.post('/file-upload/customer/upload', formData);
        
        if (response.file_id) {
          uploadedFileIds.push(response.file_id);
        }
      }

      // Update the appropriate file array
      const currentFiles = editData[`${type}_files` as keyof JobDetailData] as number[] || [];
      setEditData({
        ...editData,
        [`${type}_files`]: [...currentFiles, ...uploadedFileIds]
      });

      // Refresh the file list
      await fetchJobFiles();

    } catch (error) {
      console.error('File upload failed:', error);
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
      // Refresh the file list
      await fetchJobFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // Tabs ordered with editable content first, read-only content last
  const tabs = [
    { id: 'overview', label: 'Overview & Business', icon: Target, editable: true },
    { id: 'branding', label: 'Branding & Design', icon: Palette, editable: true },
    { id: 'resources', label: 'Resources & Links', icon: ExternalLink, editable: true },
    { id: 'files', label: 'Files & Assets', icon: FolderOpen, editable: true },
    { id: 'planning', label: 'Project Planning', icon: Calendar, editable: false },
    { id: 'financial', label: 'Financial', icon: DollarSign, editable: false }
  ];

  const renderEditableField = (label: string, value: any, field: keyof JobDetailData, type: 'text' | 'textarea' | 'select' | 'date' = 'text', options?: string[]) => {
    if (!isEditing) {
      return (
        <div className="flex justify-between items-start py-3 border-b border-gray-700/50">
          <span className="text-gray-400 font-medium min-w-[120px]">{label}</span>
          <span className="text-white text-right flex-1 ml-4">{value || 'Not specified'}</span>
        </div>
      );
    }

    // Only render editable fields for string/number types, not arrays or objects
    const fieldValue = editData[field];
    if (Array.isArray(fieldValue) || (typeof fieldValue === 'object' && fieldValue !== null)) {
      return null; // Skip rendering for array/object fields
    }

    if (type === 'textarea') {
      return (
        <div className="py-3 border-b border-gray-700/50">
          <label className="block text-gray-400 font-medium mb-2">{label}</label>
          <textarea
            value={String(fieldValue || '')}
            onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
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
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
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
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
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
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
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
              <div className="p-3 bg-electric-blue/20 rounded-xl">
                <Target className="h-8 w-8 text-electric-blue" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{job.title}</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${getPriorityColor(job.priority)}`}>
                    {job.priority.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-electric-blue to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${job.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{job.progress_percentage}%</span>
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
                    className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                      ? 'bg-electric-blue text-white shadow-lg'
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
                  <Target className="h-6 w-6 text-electric-blue" />
                  Project Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableField('Project Goals', job.project_goals, 'project_goals', 'textarea')}
                  {renderEditableField('Target Audience', job.target_audience, 'target_audience')}
                  {renderEditableField('Timeline', job.timeline, 'timeline', 'select', [
                    '1-2 weeks',
                    '3-4 weeks', 
                    '1-2 months',
                    '3-6 months',
                    '6+ months'
                  ])}
                  {renderEditableField('Budget Range', job.budget_range, 'budget_range', 'select', [
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
                  <Building2 className="h-6 w-6 text-electric-blue" />
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableField('Business Name', job.business_name, 'business_name')}
                  {renderEditableField('Business Type', job.business_type, 'business_type', 'select', [
                    'Startup',
                    'Small Business',
                    'Medium Business',
                    'Enterprise',
                    'Non-Profit',
                    'Agency',
                    'Freelancer',
                    'Other'
                  ])}
                  <div className="py-3 border-b border-gray-700/50">
                    <label className="block text-gray-400 font-medium mb-2">Industry</label>
                    <select
                      value={editData.industry || ''}
                      onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
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
                        className="w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                    )}
                  </div>
                  {renderEditableField('Brand Guidelines', job.brand_guidelines, 'brand_guidelines', 'textarea')}
                </div>
              </div>

              {/* Online Presence */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <Globe className="h-6 w-6 text-electric-blue" />
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
                                className="flex-1 bg-gray-800 border border-gray-600 rounded-r-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
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
                                className="flex-1 bg-gray-800 border border-gray-600 rounded-r-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
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
                                className="flex-1 bg-gray-800 border border-gray-600 rounded-r-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
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
                              value={editData.social_media?.[platform.key] || ''}
                              onChange={(e) => {
                                const newSocial = { ...editData.social_media, [platform.key]: e.target.value };
                                setEditData({ ...editData, social_media: newSocial });
                              }}
                              className="flex-1 bg-gray-800 border border-gray-600 rounded-r-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                              placeholder="username"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(job.social_media || {}).map(([platform, url]) => (
                        url && (
                          <div key={platform} className="flex items-center gap-2">
                            <span className="capitalize font-medium text-gray-300">{platform}:</span>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-electric-blue hover:text-electric-blue/80 text-sm"
                            >
                              {url}
                            </a>
                          </div>
                        )
                      ))}
                      {(!job.social_media || Object.keys(job.social_media).length === 0) && (
                        <p className="text-gray-400 text-sm col-span-2">No social media links added yet</p>
                      )}
                      {job.social_media && Object.keys(job.social_media).length > 0 && (
                        <div className="col-span-2 mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                          <div className="text-sm text-gray-400 mb-2">Available platforms:</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(job.social_media).map(([platform, url]) => (
                              url && (
                                <span key={platform} className="px-2 py-1 bg-electric-blue/20 text-electric-blue text-xs rounded-full border border-electric-blue/30 capitalize">
                                  {platform}
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-electric-blue" />
                  Project Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableField('Start Date', formatDate(job.start_date), 'start_date', 'date')}
                  {renderEditableField('Deadline', formatDate(job.deadline), 'deadline', 'date')}
                  {job.completion_date && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                      <span className="text-gray-400 font-medium">Completed</span>
                      <span className="text-white">{formatDate(job.completion_date)}</span>
                    </div>
                  )}
                </div>
              </div>

              {job.notes && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-electric-blue" />
                    Additional Notes
                  </h3>
                  {renderEditableField('Notes', job.notes, 'notes', 'textarea')}
                </div>
              )}
            </div>
          )}



          {/* Branding & Design Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* Brand Colors Section */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <Palette className="h-6 w-6 text-electric-blue" />
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
                            <button
                              onClick={() => removeBrandColor(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-opacity opacity-0 group-hover:opacity-100 z-10"
                              style={{ transform: 'translate(50%, -50%)' }}
                            >
                              <X className="h-3 w-3" />
                            </button>
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
                                className="w-full text-xs px-2 py-1 rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30 focus:ring-2 focus:ring-electric-blue focus:border-transparent"
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
                                  className="w-full mt-1 text-xs px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                                />
                              )}
                            </div>
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
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={addBrandColor}
                              className="px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg transition-colors font-medium"
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
                    <Target className="h-6 w-6 text-electric-blue" />
                    Brand Style
                  </h3>
                  <div className="py-3 border-b border-gray-700/50">
                    <label className="block text-gray-400 font-medium mb-2">Brand Style</label>
                    <select
                      value={editData.brand_style || ''}
                      onChange={(e) => setEditData({ ...editData, brand_style: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
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
                        className="w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                    )}
                  </div>
                  <div className="mt-3 text-sm text-gray-400">
                    💡 Choose the style that best represents your brand personality
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-electric-blue" />
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

          {/* Files & Assets Tab */}
          {activeTab === 'files' && (
            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <FolderOpen className="h-6 w-6 text-electric-blue" />
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
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-electric-blue file:text-white hover:file:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">Logos, brand assets, vector files</p>
                        <div className="text-xs text-gray-400">
                          <strong>Accepted:</strong> PNG, JPG, PDF, AI, EPS, SVG
                        </div>
                        {uploadingFiles && (
                          <div className="flex items-center gap-2 text-electric-blue text-sm">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-electric-blue border-t-transparent"></div>
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
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-electric-blue file:text-white hover:file:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-electric-blue file:text-white hover:file:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="text-gray-400 text-sm mb-3">{job.logo_files?.length || 0} uploaded</div>
                  {isEditing && (
                    <button
                      onClick={() => setShowFileManager('logo')}
                      className="text-sm text-electric-blue hover:text-electric-blue/80"
                    >
                      Manage Files
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <div className="text-3xl mb-2">📁</div>
                  <div className="text-white font-medium text-lg">Project Files</div>
                  <div className="text-gray-400 text-sm mb-3">{job.project_files?.length || 0} uploaded</div>
                  {isEditing && (
                    <button
                      onClick={() => setShowFileManager('project')}
                      className="text-sm text-electric-blue hover:text-electric-blue/80"
                    >
                      Manage Files
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <div className="text-3xl mb-2">📚</div>
                  <div className="text-white font-medium text-lg">Reference Files</div>
                  <div className="text-gray-400 text-sm mb-3">{job.reference_files?.length || 0} uploaded</div>
                  {isEditing && (
                    <button
                      onClick={() => setShowFileManager('reference')}
                      className="text-sm text-electric-blue hover:text-electric-blue/80"
                    >
                      Manage Files
                    </button>
                  )}
                </div>
              </div>

              {/* Current Files List */}
              {jobFiles.length > 0 ? (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-electric-blue" />
                    All Files ({jobFiles.length})
                  </h3>
                  
                  <div className="bg-gray-800 rounded-lg border border-gray-700/50 overflow-hidden">
                    {loadingFiles ? (
                      <div className="p-8 text-center text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue mx-auto mb-4"></div>
                        Loading files...
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-700/50">
                        {jobFiles.map((file) => (
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
                                className="px-3 py-1.5 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg text-sm font-medium transition-colors"
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
              ) : (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <div className="text-4xl mb-3">📂</div>
                  <h3 className="text-lg font-medium text-white mb-2">No Files Uploaded Yet</h3>
                  <p className="text-gray-400 mb-4">Start by uploading your first project files</p>
                  {isEditing && (
                    <button
                      onClick={() => setActiveTab('files')}
                      className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg transition-colors font-medium"
                    >
                      Upload Files
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
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
                        <option value="tool">Tool/Service</option>
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
                       {/* Display Added Resources */}
                {(editData.resources?.length || job.resources?.length) && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-white mb-4">Current Resources</h4>
                    <div className="flex w-full flex-wrap gap-4">
                      {/* All Resources */}
                      {(editData.resources || job.resources || []).map((resource, index) => (
                        <div key={`resource-${index}`} className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${
                              resource.type === 'drive' ? 'bg-blue-500/20' :
                              resource.type === 'github' ? 'bg-gray-500/20' :
                              resource.type === 'workspace' ? 'bg-green-500/20' :
                              resource.type === 'tool' ? 'bg-purple-500/20' :
                              resource.type === 'server' ? 'bg-orange-500/20' :
                              'bg-electric-blue/20'
                            }`}>
                              {resource.type === 'drive' ? <FolderOpen className="h-5 w-5 text-blue-400" /> :
                               resource.type === 'github' ? <Github className="h-5 w-5 text-gray-400" /> :
                               resource.type === 'workspace' ? <ExternalLink className="h-5 w-5 text-green-400" /> :
                               resource.type === 'tool' ? <ExternalLink className="h-5 w-5 text-purple-400" /> :
                               resource.type === 'server' ? <ExternalLink className="h-5 w-5 text-orange-400" /> :
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
                              {resource.type === 'tool' && (
                                <div>
                                  <label className="block text-gray-400 text-sm font-medium mb-1">API Key</label>
                                  <div className="relative">
                                    <input
                                      type={visibleApiKeys.has(index) ? "text" : "password"}
                                      value={resource.api_key || ''}
                                      onChange={(e) => {
                                        const updatedResources = [...(editData.resources || [])];
                                        updatedResources[index] = { ...resource, api_key: e.target.value };
                                        setEditData({ ...editData, resources: updatedResources });
                                      }}
                                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 pr-10 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newVisible = new Set(visibleApiKeys);
                                        if (newVisible.has(index)) {
                                          newVisible.delete(index);
                                        } else {
                                          newVisible.add(index);
                                        }
                                        setVisibleApiKeys(newVisible);
                                      }}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                                    >
                                      {visibleApiKeys.has(index) ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                      ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
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
                              {resource.api_key && (
                                <div className="flex items-center gap-2">
                                  <div className="text-gray-500 text-xs flex-1">
                                    API Key: {visibleApiKeys.has(index) ? resource.api_key : '•'.repeat(Math.min(resource.api_key.length, 8))}
                                  </div>
                                  <button
                                    onClick={() => {
                                      const newVisible = new Set(visibleApiKeys);
                                      if (newVisible.has(index)) {
                                        newVisible.delete(index);
                                      } else {
                                        newVisible.add(index);
                                      }
                                      setVisibleApiKeys(newVisible);
                                    }}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                    title={visibleApiKeys.has(index) ? "Hide API Key" : "Show API Key"}
                                  >
                                    {visibleApiKeys.has(index) ? (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(resource.api_key || '')}
                                    className="p-1 text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/20 rounded transition-colors"
                                    title="Copy API Key"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                    </div>
                  </div>
                )}
                </div>
              )}

           

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
                        onClick={() => {
                          if (newTool.name) {
                            const tool = {
                              type: 'tool' as const,
                              name: newTool.name,
                              api_key: newTool.api_key || '',
                              url: newTool.url || '',
                              description: `Tool: ${newTool.name}`
                            };
                            const currentResources = editData.resources || [];
                            setEditData({ ...editData, resources: [...currentResources, tool] });
                            setNewTool({ name: '', api_key: '', url: '' });
                          }
                        }}
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
                
                {/* Display Tools from Resources */}
                {(editData.resources?.filter(r => r.type === 'tool')?.length || job.resources?.filter(r => r.type === 'tool')?.length) ? (
                  <div className="space-y-4">
                    {(editData.resources || job.resources || []).filter(r => r.type === 'tool').map((tool, index) => (
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
                                const toolIndex = (editData.resources || []).findIndex(r => r === tool);
                                if (toolIndex !== -1) removeResource('resources', toolIndex);
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
                                  const updatedResources = [...(editData.resources || [])];
                                  const toolIndex = updatedResources.findIndex(r => r === tool);
                                  if (toolIndex !== -1) {
                                    updatedResources[toolIndex] = { ...tool, name: e.target.value };
                                    setEditData({ ...editData, resources: updatedResources });
                                  }
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-1">API Key</label>
                              <div className="relative">
                                <input
                                  type={visibleApiKeys.has((editData.resources || []).findIndex(r => r === tool)) ? "text" : "password"}
                                  value={tool.api_key || ''}
                                  onChange={(e) => {
                                    const updatedResources = [...(editData.resources || [])];
                                    const toolIndex = updatedResources.findIndex(r => r === tool);
                                    if (toolIndex !== -1) {
                                      updatedResources[toolIndex] = { ...tool, api_key: e.target.value };
                                      setEditData({ ...editData, resources: updatedResources });
                                    }
                                  }}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 pr-10 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const toolIndex = (editData.resources || []).findIndex(r => r === tool);
                                    if (toolIndex !== -1) {
                                      const newVisible = new Set(visibleApiKeys);
                                      if (newVisible.has(toolIndex)) {
                                        newVisible.delete(toolIndex);
                                      } else {
                                        newVisible.add(toolIndex);
                                      }
                                      setVisibleApiKeys(newVisible);
                                    }
                                  }}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                                >
                                  {visibleApiKeys.has((editData.resources || []).findIndex(r => r === tool)) ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-1">URL</label>
                              <input
                                type="url"
                                value={tool.url || ''}
                                onChange={(e) => {
                                  const updatedResources = [...(editData.resources || [])];
                                  const toolIndex = updatedResources.findIndex(r => r === tool);
                                  if (toolIndex !== -1) {
                                    updatedResources[toolIndex] = { ...tool, url: e.target.value };
                                    setEditData({ ...editData, resources: updatedResources });
                                  }
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-white font-medium">{tool.name}</div>
                            {tool.api_key && <div className="text-gray-400 text-sm">API Key: {tool.api_key}</div>}
                            {tool.url && <div className="text-gray-400 text-sm truncate">{tool.url}</div>}
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
                        onClick={() => {
                          if (newServer.name) {
                            const server = {
                              type: 'server' as const,
                              name: newServer.name,
                              url: newServer.url || '',
                              description: `Server: ${newServer.name}`
                            };
                            const currentResources = editData.resources || [];
                            setEditData({ ...editData, resources: [...currentResources, server] });
                            setNewServer({ name: '', url: '', type: '' });
                          }
                        }}
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
                
                {/* Display Servers from Resources */}
                {(editData.resources?.filter(r => r.type === 'server')?.length || job.resources?.filter(r => r.type === 'server')?.length) ? (
                  <div className="space-y-4">
                    {(editData.resources || job.resources || []).filter(r => r.type === 'server').map((server, index) => (
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
                                const serverIndex = (editData.resources || []).findIndex(r => r === server);
                                if (serverIndex !== -1) removeResource('resources', serverIndex);
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
                                  const updatedResources = [...(editData.resources || [])];
                                  const serverIndex = updatedResources.findIndex(r => r === server);
                                  if (serverIndex !== -1) {
                                    updatedResources[serverIndex] = { ...server, name: e.target.value };
                                    setEditData({ ...editData, resources: updatedResources });
                                  }
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-1">URL</label>
                              <input
                                type="url"
                                value={server.url || ''}
                                onChange={(e) => {
                                  const updatedResources = [...(editData.resources || [])];
                                  const serverIndex = updatedResources.findIndex(r => r === server);
                                  if (serverIndex !== -1) {
                                    updatedResources[serverIndex] = { ...server, url: e.target.value };
                                    setEditData({ ...editData, resources: updatedResources });
                                  }
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-1">Type</label>
                              <input
                                type="text"
                                value={server.description?.replace('Server: ', '') || ''}
                                onChange={(e) => {
                                  const updatedResources = [...(editData.resources || [])];
                                  const serverIndex = updatedResources.findIndex(r => r === server);
                                  if (serverIndex !== -1) {
                                    updatedResources[serverIndex] = { ...server, description: `Server: ${e.target.value}` };
                                    setEditData({ ...editData, resources: updatedResources });
                                  }
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-white font-medium">{server.name}</div>
                            {server.url && <div className="text-gray-400 text-sm">URL: {server.url}</div>}
                            {server.description && <div className="text-gray-400 text-sm">Type: {server.description.replace('Server: ', '')}</div>}
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

          {/* Project Planning Tab */}
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

              {/* Deliverables */}
              {job.deliverables && job.deliverables.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4">Deliverables</h3>
                  <div className="space-y-3">
                    {job.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                        {deliverable.delivered ? (
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-400" />
                          </div>
                        ) : (
                          <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-yellow-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-lg">{deliverable.name}</h4>
                          {deliverable.description && (
                            <p className="text-gray-400 mt-1">{deliverable.description}</p>
                          )}
                          {deliverable.date && (
                            <p className="text-gray-500 text-sm mt-2">Delivered: {formatDate(deliverable.date)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!job.milestones?.length && !job.deliverables?.length) && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-gray-400">No project planning details available yet</p>
                </div>
              )}
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <Clock className="h-6 w-6 text-electric-blue" />
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
                    <DollarSign className="h-6 w-6 text-electric-blue" />
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

              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Financial Notes</h3>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    {isCustomer 
                      ? "💡 Financial details are managed by our team. Contact us if you have any questions about pricing or billing."
                      : "💡 Financial information and estimates are subject to change based on project scope and requirements."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
