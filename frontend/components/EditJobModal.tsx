'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Globe, Github, FolderOpen, Target, CheckCircle, ExternalLink } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface Job {
  id: number;
  customer_id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  deadline?: string;
  completion_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  hourly_rate?: number;
  fixed_price?: number;
  google_drive_links?: Array<{ name: string; url: string; type?: string }>;
  github_repositories?: Array<{ name: string; url: string; type?: string }>;
  workspace_links?: Array<{ name: string; url: string; type?: string }>;
  server_details?: Array<{ name: string; url: string; type?: string }>;
  calendar_links?: Array<{ name: string; url: string; type?: string }>;
  meeting_links?: Array<{ name: string; url: string; type?: string }>;
  additional_tools?: Array<{ name: string; url: string; type?: string }>;
  website_url?: string;
  notes?: string;
  progress_percentage: number;
  milestones?: Array<{ name: string; description?: string; due_date?: string; completed: boolean }>;
  deliverables?: Array<{ name: string; description?: string; delivered: boolean; date?: string }>;
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
    website_url: '',
    google_drive_links: [] as Array<{ name: string; url: string; type?: string }>,
    github_repositories: [] as Array<{ name: string; url: string; type?: string }>,
    workspace_links: [] as Array<{ name: string; url: string; type?: string }>,
    milestones: [] as Array<{ name: string; description?: string; due_date?: string; completed: boolean }>,
    deliverables: [] as Array<{ name: string; description?: string; delivered: boolean; date?: string }>,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      website_url: jobData.website_url || '',
      google_drive_links: jobData.google_drive_links || [],
      github_repositories: jobData.github_repositories || [],
      workspace_links: jobData.workspace_links || [],
      milestones: jobData.milestones || [],
      deliverables: jobData.deliverables || [],
      notes: jobData.notes || ''
    });
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
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

  const addLink = (type: 'google_drive_links' | 'github_repositories' | 'workspace_links') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { name: '', url: '', type: '' }]
    }));
  };

  const updateLink = (type: 'google_drive_links' | 'github_repositories' | 'workspace_links', index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeLink = (type: 'google_drive_links' | 'github_repositories' | 'workspace_links', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000.00"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              {/* Google Drive Links */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FolderOpen className="h-5 w-5 mr-2 text-blue-500" />
                    Google Drive Links
                  </h3>
                  <button
                    type="button"
                    onClick={() => addLink('google_drive_links')}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Link</span>
                  </button>
                </div>
                {formData.google_drive_links.map((link, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) => updateLink('google_drive_links', index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Link name"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink('google_drive_links', index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="https://drive.google.com/..."
                    />
                    <button
                      type="button"
                      onClick={() => removeLink('google_drive_links', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* GitHub Repositories */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Github className="h-5 w-5 mr-2 text-gray-800" />
                    GitHub Repositories
                  </h3>
                  <button
                    type="button"
                    onClick={() => addLink('github_repositories')}
                    className="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Repository</span>
                  </button>
                </div>
                {formData.github_repositories.map((repo, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={repo.name}
                      onChange={(e) => updateLink('github_repositories', index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Repository name"
                    />
                    <input
                      type="url"
                      value={repo.url}
                      onChange={(e) => updateLink('github_repositories', index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="https://github.com/..."
                    />
                    <button
                      type="button"
                      onClick={() => removeLink('github_repositories', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Workspace Links */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2 text-green-500" />
                    Workspace Links
                  </h3>
                  <button
                    type="button"
                    onClick={() => addLink('workspace_links')}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Workspace</span>
                  </button>
                </div>
                {formData.workspace_links.map((workspace, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={workspace.name}
                      onChange={(e) => updateLink('workspace_links', index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Workspace name (Slack, Discord, etc.)"
                    />
                    <input
                      type="url"
                      value={workspace.url}
                      onChange={(e) => updateLink('workspace_links', index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Workspace URL"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink('workspace_links', index)}
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Milestone name"
                      />
                      <input
                        type="date"
                        value={milestone.due_date}
                        onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Deliverable name"
                      />
                      <input
                        type="date"
                        value={deliverable.date}
                        onChange={(e) => updateDeliverable(index, 'date', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes, requirements, or important information..."
                />
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
