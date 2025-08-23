'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Globe, Github, FolderOpen, Target, CheckCircle, ExternalLink, DollarSign } from 'lucide-react';
import { api } from '@/lib/https';

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface Job {
  // Basic Job Info
  id: number;
  customer_id: number;
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
    type: 'website' | 'github' | 'drive' | 'workspace' | 'service';
    name: string;
    url?: string;
    description?: string;
  }>;
  
  // Additional Tools (separate from resources)
  additional_tools?: Array<{
    name: string;
    api_key?: string;
    url?: string;
    description?: string;
  }>;

  // Server Details (separate from resources)
  server_details?: Array<{
    name: string;
    url?: string;
    type?: string;
    description?: string;
  }>;
  
  // Additional Information
  notes?: string;
  additional_resource_info?: string[];
  
  meeting_links?: Array<{ name: string; url: string; type?: string }>;
  
  // Project Planning
  milestones?: Array<{ name: string; description?: string; due_date?: string; completed: boolean }>;
  deliverables?: Array<{ name: string; description?: string; delivered: boolean; date?: string }>;
  
  // Financial Data
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

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: any) => Promise<void>;
  job: Job | null;
}

export default function EditJobModal({ isOpen, onClose, onSave, job }: EditJobModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    deadline: '',
    estimated_hours: '',
    hourly_rate: '',
    fixed_price: '',
    
    // Business Information
    business_name: '',
    business_type: '',
    industry: '',
    industry_other: '',
    
    // Project Details
    project_goals: '',
    target_audience: '',
    timeline: '',
    budget_range: '',
    
    // Branding & Design
    brand_style: '',
    brand_style_other: '',
    brand_guidelines: '',
    
    // Resources & Links
    website_url: '',
    github_url: '',
    portfolio_url: '',
    
    // Social Media
    social_media: {
      facebook: '',
      linkedin: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      pinterest: '',
      snapchat: ''
    },
    
    // Unified Resources
    resources: [] as Array<{
      type: 'website' | 'github' | 'drive' | 'workspace' | 'service';
      name: string;
      url?: string;
      description?: string;
    }>,
    
    // Additional Tools
    additional_tools: [] as Array<{
      name: string;
      api_key?: string;
      url?: string;
      description?: string;
    }>,
    
    // Server Details
    server_details: [] as Array<{
      name: string;
      url?: string;
      type?: string;
      description?: string;
    }>,
    
    // Project Planning
    milestones: [] as Array<{ name: string; description?: string; due_date?: string; completed: boolean }>,
    deliverables: [] as Array<{ name: string; description?: string; delivered: boolean; date?: string }>,
    
    // Additional Information
    notes: '',
    additional_resource_info: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [financialEstimation, setFinancialEstimation] = useState<{
    estimated_hours?: number;
    recommended_hourly_rate?: number;
    fixed_price_estimate?: number;
    breakdown_notes?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      if (job) {
        populateFormData(job);
      }
    }
  }, [isOpen, job]);

  const populateFormData = (jobData: Job) => {
    setFormData({
      customer_id: jobData.customer_id.toString(),
      title: jobData.title,
      description: jobData.description || '',
      status: jobData.status,
      priority: jobData.priority,
      start_date: jobData.start_date ? jobData.start_date.split('T')[0] : '',
      deadline: jobData.deadline ? jobData.deadline.split('T')[0] : '',
      estimated_hours: jobData.estimated_hours?.toString() || '',
      hourly_rate: jobData.hourly_rate?.toString() || '',
      fixed_price: jobData.fixed_price?.toString() || '',
      
      // Business Information
      business_name: jobData.business_name || '',
      business_type: jobData.business_type || '',
      industry: jobData.industry || '',
      industry_other: jobData.industry_other || '',
      
      // Project Details
      project_goals: jobData.project_goals || '',
      target_audience: jobData.target_audience || '',
      timeline: jobData.timeline || '',
      budget_range: jobData.budget_range || '',
      
      // Branding & Design
      brand_style: jobData.brand_style || '',
      brand_style_other: jobData.brand_style_other || '',
      brand_guidelines: jobData.brand_guidelines || '',
      
      // Resources & Links
      website_url: jobData.website_url || '',
      github_url: jobData.github_url || '',
      portfolio_url: jobData.portfolio_url || '',
      
      // Social Media
      social_media: {
        facebook: jobData.social_media?.facebook || '',
        linkedin: jobData.social_media?.linkedin || '',
        instagram: jobData.social_media?.instagram || '',
        twitter: jobData.social_media?.twitter || '',
        youtube: jobData.social_media?.youtube || '',
        tiktok: jobData.social_media?.tiktok || '',
        pinterest: jobData.social_media?.pinterest || '',
        snapchat: jobData.social_media?.snapchat || ''
      },
      
      // Unified Resources
      resources: jobData.resources || [],
      
      // Additional Tools
      additional_tools: jobData.additional_tools || [],
      
      // Server Details
      server_details: jobData.server_details || [],
      
      // Project Planning
      milestones: jobData.milestones || [],
      deliverables: jobData.deliverables || [],
      
      // Additional Information
      notes: jobData.notes || '',
      additional_resource_info: jobData.additional_resource_info || []
    });
  };

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers...');   
      const data = await api.get('/customers');
      console.log('Customers received:', data);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const calculateProgress = () => {
    const totalTasks = formData.milestones.length + formData.deliverables.length;
    if (totalTasks === 0) return 0;
    
    const completedTasks = formData.milestones.filter(m => m.completed).length + 
                          formData.deliverables.filter(d => d.delivered).length;
    
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const progress = calculateProgress();
      
      const jobData = {
        ...formData,
        customer_id: parseInt(formData.customer_id),
        start_date: formData.start_date || null,
        deadline: formData.deadline || null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        fixed_price: formData.fixed_price ? parseFloat(formData.fixed_price) : null,
        progress_percentage: progress
      };

      await onSave(jobData);
      onClose();
    } catch (error) {
      console.error('Error updating job:', error);
      if (error instanceof Error) {
        setError(`Failed to update job: ${error.message}`);
      } else {
        setError('Failed to update job. Please check all fields and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { type: 'website', name: '', url: '', description: '' }]
    }));
  };

  const updateResource = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const addTool = () => {
    setFormData(prev => ({
      ...prev,
      additional_tools: [...prev.additional_tools, { name: '', url: '', description: '' }]
    }));
  };

  const updateTool = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      additional_tools: prev.additional_tools.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeTool = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_tools: prev.additional_tools.filter((_, i) => i !== index)
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { name: '', description: '', due_date: '', completed: false }]
    }));
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, { name: '', description: '', delivered: false, date: '' }]
    }));
  };

  const updateDeliverable = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen || !job) return null;

  const currentProgress = calculateProgress();

  return (
    <div className="fixed inset-0 bg-gray-800/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
          <h2 className="text-2xl font-bold">Edit Job: {job.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Display */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Project Progress (Auto-calculated)</span>
            <span className="text-lg font-bold text-blue-600">{currentProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Progress calculated based on completed milestones and deliverables
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'basic', label: 'Basic Info', icon: Calendar },
              { id: 'resources', label: 'Project Resources', icon: Globe },
              { id: 'planning', label: 'Project Planning', icon: Target },
              { id: 'financial', label: 'Financial', icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer
                  </label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    required
                  >
                    <option value="" className="text-gray-500">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id} className="text-gray-900">
                        {customer.name} ({customer.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="e.g., E-commerce Website Development"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Detailed project description and requirements..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="planning" className="text-gray-900">Planning</option>
                    <option value="in_progress" className="text-gray-900">In Progress</option>
                    <option value="on_hold" className="text-gray-900">On Hold</option>
                    <option value="completed" className="text-gray-900">Completed</option>
                    <option value="cancelled" className="text-gray-900">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="low" className="text-gray-900">Low</option>
                    <option value="medium" className="text-gray-900">Medium</option>
                    <option value="high" className="text-gray-900">High</option>
                    <option value="urgent" className="text-gray-900">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Project Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-8">
              {/* Website URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Website URL
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="https://example.com"
                />
              </div>

              {/* Resources */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FolderOpen className="h-5 w-5 mr-2 text-blue-500" />
                    Resources
                  </h3>
                  <button
                    type="button"
                    onClick={addResource}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Resource</span>
                  </button>
                </div>
                {formData.resources.map((resource, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <select
                      value={resource.type}
                      onChange={(e) => updateResource(index, 'type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="website">Website</option>
                      <option value="github">GitHub</option>
                      <option value="drive">Google Drive</option>
                      <option value="workspace">Workspace</option>
                      <option value="service">Service</option>
                    </select>
                    <input
                      type="text"
                      value={resource.name}
                      onChange={(e) => updateResource(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Resource name"
                    />
                    <input
                      type="url"
                      value={resource.url || ''}
                      onChange={(e) => updateResource(index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="URL (optional)"
                    />
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Additional Tools */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-500" />
                    Additional Tools
                  </h3>
                  <button
                    type="button"
                    onClick={addTool}
                    className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Tool</span>
                  </button>
                </div>
                {formData.additional_tools.map((tool, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={tool.name}
                      onChange={(e) => updateTool(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Tool name"
                    />
                    <input
                      type="url"
                      value={tool.url || ''}
                      onChange={(e) => updateTool(index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="URL (optional)"
                    />
                    <button
                      type="button"
                      onClick={() => removeTool(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Server Details */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2 text-green-500" />
                    Server Details
                  </h3>
                  <button
                    type="button"
                    onClick={addTool}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Server</span>
                  </button>
                </div>
                {formData.server_details.map((server, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={server.name}
                      onChange={(e) => updateTool(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Server name"
                    />
                    <input
                      type="url"
                      value={server.url || ''}
                      onChange={(e) => updateTool(index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Server URL"
                    />
                    <button
                      type="button"
                      onClick={() => removeTool(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Custom Resources */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Plus className="h-5 w-5 mr-2 text-purple-500" />
                    Custom Resources & Tools
                  </h3>
                  <button
                    type="button"
                    onClick={addTool}
                    className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Custom Resource</span>
                  </button>
                </div>
                {formData.additional_tools.map((tool, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={tool.name}
                      onChange={(e) => updateTool(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                      placeholder="Resource name (Figma, Notion, API docs, etc.)"
                    />
                    <input
                      type="url"
                      value={tool.url || ''}
                      onChange={(e) => updateTool(index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                      placeholder="Resource URL"
                    />
                    <input
                      type="text"
                      value={tool.description || ''}
                      onChange={(e) => updateTool(index, 'description', e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                      placeholder="Description"
                    />
                    <button
                      type="button"
                      onClick={() => removeTool(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Planning Tab */}
          {activeTab === 'planning' && (
            <div className="space-y-8">
              {/* AI Planning Section */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-500" />
                    AI Project Planning
                  </h3>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const token = localStorage.getItem('admin_token');
                          const prompt = `Please create an actionable project plan based on the following information:
                        
Project Title: ${formData.title}
Description: ${formData.description}
Customer: Customer ID ${formData.customer_id}
Estimated Hours: ${formData.estimated_hours || 'Not specified'}
Priority: ${formData.priority}
Deadline: ${formData.deadline || 'Not specified'}
Notes: ${formData.notes || 'None'}

Additional Context: ${aiPrompt}

Please create specific milestones with due dates and deliverables that would help complete this project successfully.`;

                          const response = await fetch('/ai/generate-plan', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ prompt })
                          });

                          if (response.ok) {
                            const plan = await response.json();
                            // Apply the generated plan to milestones and deliverables
                            if (plan.milestones) {
                              setFormData(prev => ({ ...prev, milestones: plan.milestones }));
                            }
                            if (plan.deliverables) {
                              setFormData(prev => ({ ...prev, deliverables: plan.deliverables }));
                            }
                          }
                        } catch (error) {
                          console.error('AI planning error:', error);
                          alert('Failed to generate AI plan. Please try again.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                    >
                      <Target className="h-4 w-4" />
                      <span>{loading ? 'Generating...' : 'Generate AI Plan'}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional AI Planning Context (Optional)
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onFocus={(e) => {
                      if (e.target.value === '') {
                        e.target.select();
                      }
                    }}
                    rows={4}
                    className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Example: 'Use React and TypeScript for frontend, implement authentication with NextAuth, prioritize mobile responsiveness, integrate with Stripe for payments, deploy on Vercel'"
                  />
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-purple-700">
                    💡 <strong>Pro tip:</strong> The more specific you are about technologies, constraints, and priorities, the better the AI can tailor the project plan to your needs.
                  </p>
                </div>
              </div>
              {/* Milestones */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-500" />
                    Project Milestones
                  </h3>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Milestone</span>
                  </button>
                </div>
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                    <div className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={milestone.name}
                        onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="Milestone name"
                      />
                      <input
                        type="date"
                        value={milestone.due_date}
                        onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                      />
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={(e) => updateMilestone(index, 'completed', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Completed</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                      placeholder="Milestone description..."
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              {/* Deliverables */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Project Deliverables
                  </h3>
                  <button
                    type="button"
                    onClick={addDeliverable}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Deliverable</span>
                  </button>
                </div>
                {formData.deliverables.map((deliverable, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                    <div className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={deliverable.name}
                        onChange={(e) => updateDeliverable(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="Deliverable name"
                      />
                      <input
                        type="date"
                        value={deliverable.date}
                        onChange={(e) => updateDeliverable(index, 'date', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                      />
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={deliverable.delivered}
                          onChange={(e) => updateDeliverable(index, 'delivered', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Delivered</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      value={deliverable.description}
                      onChange={(e) => updateDeliverable(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                      placeholder="Deliverable description..."
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Additional notes, requirements, or important information..."
                />
              </div>
            </div>
          )}

          {/* Financial Estimation Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-8">
              {/* AI Financial Estimation Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                    AI Financial Estimation
                  </h3>
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const token = localStorage.getItem('admin_token');
                        const prompt = `Analyze this project and provide financial estimates:

Title: ${formData.title}
Description: ${formData.description}
Current Hourly Rate: ${formData.hourly_rate || 'Not set'}
Current Fixed Price: ${formData.fixed_price || 'Not set'}
Current Estimated Hours: ${formData.estimated_hours || 'Not set'}

Additional Context: ${aiPrompt}

Please analyze the project complexity and provide realistic estimates for:
1. Total hours needed
2. Recommended hourly rate (if applicable)
3. Alternative fixed price estimate
4. Breakdown by major phases

Return only a JSON object with these fields: estimated_hours, recommended_hourly_rate, fixed_price_estimate, breakdown_notes`;

                        const response = await fetch('/ai/generate-plan', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ prompt })
                        });

                        if (response.ok) {
                          const estimation = await response.json();
                          setFinancialEstimation(estimation);
                          
                          // Apply estimates to form
                          if (estimation.estimated_hours) {
                            setFormData(prev => ({ ...prev, estimated_hours: estimation.estimated_hours.toString() }));
                          }
                          if (estimation.recommended_hourly_rate) {
                            setFormData(prev => ({ ...prev, hourly_rate: estimation.recommended_hourly_rate.toString() }));
                          }
                          if (estimation.fixed_price_estimate) {
                            setFormData(prev => ({ ...prev, fixed_price: estimation.fixed_price_estimate.toString() }));
                          }
                        }
                      } catch (error) {
                        console.error('AI estimation error:', error);
                        setError('Failed to generate financial estimates. Please try again.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>{loading ? 'Generating Estimates...' : 'Generate Financial Estimates'}</span>
                  </button>
                </div>

                {/* Financial Context Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Financial Context (Optional)
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Example: 'Include rush charges, complex integration requirements, maintenance costs, deployment fees'"
                  />
                </div>

                {/* Financial Input Fields */}
                <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                    Project Financial Details
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Hours
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.estimated_hours}
                        onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="75.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fixed Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.fixed_price}
                        onChange={(e) => setFormData({ ...formData, fixed_price: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="5000.00"
                      />
                    </div>
                  </div>

                  {/* Calculated Total */}
                  {formData.estimated_hours && formData.hourly_rate && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Calculated Total (Hours × Rate)</div>
                      <div className="text-xl font-bold text-gray-900">
                        ${(parseFloat(formData.estimated_hours) * parseFloat(formData.hourly_rate)).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Financial Estimation Results */}
                {financialEstimation && (
                  <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      AI Financial Analysis Results
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {financialEstimation.estimated_hours && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-blue-600">Estimated Hours</div>
                          <div className="text-2xl font-bold text-blue-900">{financialEstimation.estimated_hours}</div>
                        </div>
                      )}
                      {financialEstimation.recommended_hourly_rate && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-purple-600">Recommended Rate</div>
                          <div className="text-2xl font-bold text-purple-900">${financialEstimation.recommended_hourly_rate}/hr</div>
                        </div>
                      )}
                      {financialEstimation.fixed_price_estimate && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-green-600">Fixed Price</div>
                          <div className="text-2xl font-bold text-green-900">${financialEstimation.fixed_price_estimate}</div>
                        </div>
                      )}
                    </div>

                    {financialEstimation.breakdown_notes && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2">Analysis Breakdown</div>
                        <div className="text-sm text-gray-600 whitespace-pre-line">{financialEstimation.breakdown_notes}</div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (financialEstimation.estimated_hours) {
                            setFormData(prev => ({ ...prev, estimated_hours: financialEstimation.estimated_hours!.toString() }));
                          }
                        }}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        Apply Hours
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (financialEstimation.recommended_hourly_rate) {
                            setFormData(prev => ({ ...prev, hourly_rate: financialEstimation.recommended_hourly_rate!.toString() }));
                          }
                        }}
                        className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
                      >
                        Apply Rate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (financialEstimation.fixed_price_estimate) {
                            setFormData(prev => ({ ...prev, fixed_price: financialEstimation.fixed_price_estimate!.toString() }));
                          }
                        }}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                      >
                        Apply Fixed Price
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
