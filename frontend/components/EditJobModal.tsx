'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Globe, Github, FolderOpen, Target, CheckCircle, ExternalLink, DollarSign, Building2 } from 'lucide-react';
import { api } from '@/lib/https';
import { 
  Job, 
  User,
  JobUpdateRequest,
  JOB_STATUSES_OBJ,
  JOB_PRIORITIES_OBJ
} from '@/types';

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: JobUpdateRequest) => Promise<void>;
  job: Job | null;
}

export default function EditJobModal({ isOpen, onClose, onSave, job }: EditJobModalProps) {
  const [customers, setCustomers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<Partial<JobUpdateRequest>>({
    customer_id: 0,
    title: '',
    description: '',
    status: JOB_STATUSES_OBJ.PLANNING,
    priority: JOB_PRIORITIES_OBJ.MEDIUM,
    start_date: '',
    deadline: '',
    estimated_hours: 0,
    hourly_rate: 0,
    fixed_price: 0,
    
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
  const [success, setSuccess] = useState<string | null>(null);

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
      customer_id: jobData.customer_id,
      title: jobData.title,
      description: jobData.description,
      status: jobData.status,
      priority: jobData.priority,
      start_date: jobData.start_date,
      deadline: jobData.deadline,
      estimated_hours: jobData.estimated_hours,
      hourly_rate: jobData.hourly_rate,
      fixed_price: jobData.fixed_price,
      
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
      social_media: jobData.social_media || {
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
      const data = await api.get<User[]>('/customers');
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.customer_id || !formData.title) {
        throw new Error('Customer and title are required');
      }

      const jobData: JobUpdateRequest = {
        customer_id: formData.customer_id,
        title: formData.title,
        description: formData.description,
        status: formData.status || JOB_STATUSES.PLANNING,
        priority: formData.priority || JOB_PRIORITIES.MEDIUM,
        start_date: formData.start_date,
        deadline: formData.deadline,
        estimated_hours: formData.estimated_hours,
        hourly_rate: formData.hourly_rate,
        fixed_price: formData.fixed_price,
        
        // Business Information
        business_name: formData.business_name,
        business_type: formData.business_type,
        industry: formData.industry,
        industry_other: formData.industry_other,
        
        // Project Details
        project_goals: formData.project_goals,
        target_audience: formData.target_audience,
        timeline: formData.timeline,
        budget_range: formData.budget_range,
        
        // Branding & Design
        brand_style: formData.brand_style,
        brand_style_other: formData.brand_style_other,
        brand_guidelines: formData.brand_guidelines,
        
        // Resources & Links
        website_url: formData.website_url,
        github_url: formData.github_url,
        portfolio_url: formData.portfolio_url,
        
        // Social Media
        social_media: formData.social_media,
        
        // Unified Resources
        resources: formData.resources || [],
        
        // Additional Tools
        additional_tools: formData.additional_tools || [],
        
        // Server Details
        server_details: formData.server_details || [],
        
        // Project Planning
        milestones: formData.milestones || [],
        deliverables: formData.deliverables || [],
        
        // Additional Information
        notes: formData.notes,
        additional_resource_info: formData.additional_resource_info || []
      };

      await onSave(jobData);
      setSuccess('Job updated successfully!');
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setError(error?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof JobUpdateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media!,
        [platform]: value
      }
    }));
  };

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...(prev.resources || []), { type: 'website', name: '', url: '', description: '' }]
    }));
  };

  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources?.filter((_, i) => i !== index) || []
    }));
  };

  const updateResource = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources?.map((resource, i) => 
        i === index ? { ...resource, [field]: value } : resource
      ) || []
    }));
  };

  const addTool = () => {
    setFormData(prev => ({
      ...prev,
      additional_tools: [...(prev.additional_tools || []), { name: '', url: '', description: '' }]
    }));
  };

  const removeTool = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_tools: prev.additional_tools?.filter((_, i) => i !== index) || []
    }));
  };

  const updateTool = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      additional_tools: prev.additional_tools?.map((tool, i) => 
        i === index ? { ...tool, [field]: value } : tool
      ) || []
    }));
  };

  const addServer = () => {
    setFormData(prev => ({
      ...prev,
      server_details: [...(prev.server_details || []), { name: '', url: '', type: '', description: '' }]
    }));
  };

  const removeServer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      server_details: prev.server_details?.filter((_, i) => i !== index) || []
    }));
  };

  const updateServer = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      server_details: prev.server_details?.map((server, i) => 
        i === index ? { ...server, [field]: value } : server
      ) || []
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), { name: '', description: '', due_date: '', completed: false }]
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones?.filter((_, i) => i !== index) || []
    }));
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones?.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      ) || []
    }));
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...(prev.deliverables || []), { name: '', description: '', delivered: false, date: '' }]
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables?.filter((_, i) => i !== index) || []
    }));
  };

  const updateDeliverable = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables?.map((deliverable, i) => 
        i === index ? { ...deliverable, [field]: value } : deliverable
      ) || []
    }));
  };

  const addResourceInfo = () => {
    setFormData(prev => ({
      ...prev,
      additional_resource_info: [...(prev.additional_resource_info || []), '']
    }));
  };

  const removeResourceInfo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_resource_info: prev.additional_resource_info?.filter((_, i) => i !== index) || []
    }));
  };

  const updateResourceInfo = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      additional_resource_info: prev.additional_resource_info?.map((info, i) => 
        i === index ? value : info
      ) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">Edit Job</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-6">
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-white/20 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'basic', label: 'Basic Info', icon: Target },
                { id: 'business', label: 'Business', icon: Building2 },
                { id: 'project', label: 'Project', icon: FolderOpen },
                { id: 'branding', label: 'Branding', icon: CheckCircle },
                { id: 'resources', label: 'Resources', icon: Globe },
                { id: 'planning', label: 'Planning', icon: Calendar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-white/60 hover:text-white/80 hover:border-white/40'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Customer <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.customer_id || ''}
                    onChange={(e) => handleInputChange('customer_id', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name || customer.email} ({customer.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Job title"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Job description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(JOB_STATUSES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(JOB_PRIORITIES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Timeline
                  </label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2-3 weeks"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.estimated_hours || ''}
                    onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Hourly Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourly_rate || ''}
                    onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Fixed Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fixed_price || ''}
                    onChange={(e) => handleInputChange('fixed_price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes"
                />
              </div>
            </div>
          )}

          {/* Additional tab content would go here - keeping this focused on the upgrade */}
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white/80 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
