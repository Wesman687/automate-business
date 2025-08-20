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
  
  // Project Details
  project_goals?: string;
  target_audience?: string;
  timeline?: string;
  budget_range?: string;
  
  // Branding & Design
  brand_colors?: string[];
  brand_style?: string;
  logo_files?: number[];
  brand_guidelines?: string;
  
  // Resources & Links
  website_url?: string;
  github_url?: string;
  social_media?: {
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  
  // Project Resources
  google_drive_links?: Array<{ name: string; url: string; type?: string }>;
  github_repositories?: Array<{ name: string; url: string; type?: string }>;
  workspace_links?: Array<{ name: string; url: string; type?: string }>;
  server_details?: Array<{ name: string; url: string; type?: string }>;
  calendar_links?: Array<{ name: string; url: string; type?: string }>;
  meeting_links?: Array<{ name: string; url: string; type?: string }>;
  additional_tools?: Array<{ name: string; url: string; type?: string }>;
  
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
  const [showResourceHelp, setShowResourceHelp] = useState(false);
  const [showFileManager, setShowFileManager] = useState<'logo' | 'project' | 'reference' | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [newColor, setNewColor] = useState('#000000');
  const [jobFiles, setJobFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

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

  if (!isOpen || !job) return null;

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
    if (onSave) {
      try {
        await onSave(editData);
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving job:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditData(job);
    setIsEditing(false);
    setNewResource({ type: '', name: '', url: '' });
  };

  const addResource = () => {
    if (!newResource.type || !newResource.name || !newResource.url) return;
    
    const resource = {
      name: newResource.name,
      url: newResource.url,
      type: newResource.type
    };

    // Add to appropriate array based on type
    if (newResource.type === 'drive') {
      const currentLinks = editData.google_drive_links || [];
      setEditData({
        ...editData,
        google_drive_links: [...currentLinks, resource]
      });
    } else if (newResource.type === 'github') {
      const currentRepos = editData.github_repositories || [];
      setEditData({
        ...editData,
        github_repositories: [...currentRepos, resource]
      });
    } else if (newResource.type === 'workspace') {
      const currentWorkspaces = editData.workspace_links || [];
      setEditData({
        ...editData,
        workspace_links: [...currentWorkspaces, resource]
      });
    } else if (newResource.type === 'website' || newResource.type === 'social' || newResource.type === 'tool') {
      const currentTools = editData.additional_tools || [];
      setEditData({
        ...editData,
        additional_tools: [...currentTools, resource]
      });
    }

    setNewResource({ type: '', name: '', url: '' });
  };

  const removeResource = (field: keyof JobDetailData, index: number) => {
    const currentArray = editData[field] as any[];
    if (!currentArray) return;
    
    const newArray = currentArray.filter((_, i) => i !== index);
    setEditData({
      ...editData,
      [field]: newArray
    });
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

  const renderEditableField = (label: string, value: any, field: keyof JobDetailData, type: 'text' | 'textarea' | 'select' = 'text', options?: string[]) => {
    if (!isEditing) {
      return (
        <div className="flex justify-between items-start py-3 border-b border-gray-700/50">
          <span className="text-gray-400 font-medium min-w-[120px]">{label}</span>
          <span className="text-white text-right flex-1 ml-4">{value || 'Not specified'}</span>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="py-3 border-b border-gray-700/50">
          <label className="block text-gray-400 font-medium mb-2">{label}</label>
          <textarea
            value={editData[field] || ''}
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
            value={editData[field] || ''}
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

    return (
      <div className="py-3 border-b border-gray-700/50">
        <label className="block text-gray-400 font-medium mb-2">{label}</label>
        <input
          type="text"
          value={editData[field] || ''}
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
              {onSave && (
                <>
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
                        className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                </>
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
                  {renderEditableField('Timeline', job.timeline, 'timeline')}
                  {renderEditableField('Budget Range', job.budget_range, 'budget_range')}
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
                  {renderEditableField('Business Type', job.business_type, 'business_type')}
                  {renderEditableField('Industry', job.industry, 'industry')}
                  {renderEditableField('Brand Guidelines', job.brand_guidelines, 'brand_guidelines', 'textarea')}
                </div>
              </div>

              {/* Online Presence */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <Globe className="h-6 w-6 text-electric-blue" />
                  Online Presence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableField('Website', job.website_url, 'website_url')}
                  {renderEditableField('GitHub', job.github_url, 'github_url')}
                </div>
                
                {/* Social Media */}
                {job.social_media && Object.keys(job.social_media).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-medium text-white mb-3">Social Media</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(job.social_media).map(([platform, url]) => (
                        url && (
                          <div key={platform} className="flex items-center gap-2">
                            <span className="capitalize font-medium text-gray-300">{platform}:</span>
                            {isEditing ? (
                              <input
                                type="url"
                                value={url}
                                onChange={(e) => {
                                  const newSocial = { ...editData.social_media, [platform]: e.target.value };
                                  setEditData({ ...editData, social_media: newSocial });
                                }}
                                className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                placeholder={`${platform} URL`}
                              />
                            ) : (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-electric-blue hover:text-electric-blue/80 text-sm"
                              >
                                {url}
                              </a>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-electric-blue" />
                  Project Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableField('Start Date', formatDate(job.start_date), 'start_date')}
                  {renderEditableField('Deadline', formatDate(job.deadline), 'deadline')}
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
                          <div
                            className="w-20 h-20 rounded-xl border-2 border-gray-600 shadow-lg cursor-pointer transition-transform hover:scale-105"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => removeBrandColor(index)}
                              className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="mt-2 text-center">
                            <div className="text-white font-medium text-sm">{color}</div>
                            <div className="text-gray-400 text-xs">Color {index + 1}</div>
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
                  {renderEditableField('Brand Style', job.brand_style, 'brand_style', 'select', [
                    'Modern & Minimalist',
                    'Classic & Professional',
                    'Creative & Artistic',
                    'Bold & Dynamic',
                    'Elegant & Sophisticated',
                    'Playful & Fun',
                    'Tech & Futuristic',
                    'Organic & Natural'
                  ])}
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
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-electric-blue file:text-white hover:file:bg-electric-blue/90"
                      />
                      <p className="text-xs text-gray-500">Logos, brand assets, vector files</p>
                      <div className="text-xs text-gray-400">
                        <strong>Accepted:</strong> PNG, JPG, PDF, AI, EPS, SVG
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-gray-400 font-medium">📁 Project Files</label>
                      <input
                        type="file"
                        multiple
                        accept="*/*"
                        onChange={(e) => handleFileUpload(e.target.files, 'project')}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-electric-blue file:text-white hover:file:bg-electric-blue/90"
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
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-electric-blue file:text-white hover:file:bg-electric-blue/90"
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
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <Plus className="h-6 w-6 text-electric-blue" />
                    Add New Resource
                  </h3>
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

              {/* Project Resources */}
              {(job.google_drive_links?.length || job.github_repositories?.length || job.workspace_links?.length) && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Project Resources</h3>
                    {isEditing && (
                      <button
                        onClick={() => setShowResourceHelp(true)}
                        className="text-sm text-electric-blue hover:text-electric-blue/80"
                      >
                        Need help? View examples
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {job.google_drive_links?.map((link, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <FolderOpen className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{link.name || 'Google Drive'}</div>
                          <div className="text-gray-400 text-sm">{link.type || 'Document'}</div>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removeResource('google_drive_links', index)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {job.github_repositories?.map((repo, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                        <div className="p-2 bg-gray-500/20 rounded-lg">
                          <Github className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{repo.name || 'GitHub Repository'}</div>
                          <div className="text-gray-400 text-sm">{repo.type || 'Code'}</div>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removeResource('github_repositories', index)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {job.workspace_links?.map((workspace, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <ExternalLink className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{workspace.name || 'Workspace'}</div>
                          <div className="text-gray-400 text-sm">{workspace.type || 'Collaboration'}</div>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removeResource('workspace_links', index)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Tools */}
              {job.additional_tools?.length && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4">Additional Tools</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job.additional_tools.map((tool, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <ExternalLink className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{tool.name}</div>
                          {tool.type && <div className="text-gray-400 text-sm">{tool.type}</div>}
                        </div>
                        {tool.url && (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-electric-blue hover:text-electric-blue/80 transition-colors"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Server Details */}
              {job.server_details?.length && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4">Server Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job.server_details.map((server, index) => (
                      <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                        <div className="text-white font-medium mb-2">{server.name}</div>
                        {server.url && <div className="text-gray-400 text-sm mb-1">URL: {server.url}</div>}
                        {server.type && <div className="text-gray-400 text-sm">Type: {server.type}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!job.google_drive_links?.length && !job.github_repositories?.length && !job.workspace_links?.length && !job.additional_tools?.length && !job.server_details?.length) && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                  <div className="text-4xl mb-4">🔧</div>
                  <p className="text-gray-400">No resources or tools configured yet</p>
                </div>
              )}
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
