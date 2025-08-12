'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Calendar, Clock, DollarSign, Users, Github, Globe, Server, Video, FolderOpen, Plus, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

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
  notes?: string;
  progress_percentage: number;
  milestones?: Array<{ name: string; description?: string; due_date?: string; completed: boolean }>;
  deliverables?: Array<{ name: string; description?: string; delivered: boolean; date?: string }>;
  created_at: string;
  updated_at?: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface ResourceCategory {
  id: string;
  name: string;
  icon: any;
  items: Array<{ name: string; url: string; type?: string }>;
  fieldName: string;
}

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newResource, setNewResource] = useState({ name: '', url: '', type: '' });
  const [showAddResource, setShowAddResource] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const jobData = await response.json();
        setJob(jobData);
        
        // Fetch customer data
        const customerResponse = await fetch(`/api/customers/${jobData.customer_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          setCustomer(customerData);
        }
      } else if (response.status === 404) {
        setError('Job not found');
      } else {
        setError('Failed to load job');
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (updateData: Partial<Job>) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJob(updatedJob);
        setEditingSection(null);
      } else {
        throw new Error('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const addResource = async (categoryId: string, resource: { name: string; url: string; type: string }) => {
    if (!job) return;
    
    const category = resourceCategories.find(c => c.id === categoryId);
    if (!category) return;

    const currentItems = job[category.fieldName as keyof Job] as Array<{ name: string; url: string; type?: string }> || [];
    const updatedItems = [...currentItems, resource];
    
    await updateJob({ [category.fieldName]: updatedItems });
    setNewResource({ name: '', url: '', type: '' });
    setShowAddResource(null);
  };

  const removeResource = async (categoryId: string, index: number) => {
    if (!job) return;
    
    const category = resourceCategories.find(c => c.id === categoryId);
    if (!category) return;

    const currentItems = job[category.fieldName as keyof Job] as Array<{ name: string; url: string; type?: string }> || [];
    const updatedItems = currentItems.filter((_, i) => i !== index);
    
    await updateJob({ [category.fieldName]: updatedItems });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'planning':
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-lg font-semibold">Error Loading Job</div>
        <div className="text-gray-400 mt-2">{error || 'Job not found'}</div>
        <Link 
          href="/admin/jobs"
          className="inline-flex items-center mt-4 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>
      </div>
    );
  }

  const resourceCategories: ResourceCategory[] = [
    {
      id: 'github',
      name: 'GitHub Repositories',
      icon: Github,
      items: job.github_repositories || [],
      fieldName: 'github_repositories'
    },
    {
      id: 'drive',
      name: 'Google Drive Links',
      icon: FolderOpen,
      items: job.google_drive_links || [],
      fieldName: 'google_drive_links'
    },
    {
      id: 'workspace',
      name: 'Workspace Links',
      icon: Users,
      items: job.workspace_links || [],
      fieldName: 'workspace_links'
    },
    {
      id: 'server',
      name: 'Server Details',
      icon: Server,
      items: job.server_details || [],
      fieldName: 'server_details'
    },
    {
      id: 'calendar',
      name: 'Calendar Links',
      icon: Calendar,
      items: job.calendar_links || [],
      fieldName: 'calendar_links'
    },
    {
      id: 'meeting',
      name: 'Meeting Links',
      icon: Video,
      items: job.meeting_links || [],
      fieldName: 'meeting_links'
    },
    {
      id: 'tools',
      name: 'Additional Tools',
      icon: Globe,
      items: job.additional_tools || [],
      fieldName: 'additional_tools'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/jobs"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-cyan-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {job.title}
            </h1>
            <p className="text-gray-400">
              Job ID: {job.id} • Customer: {customer?.name || 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(job.status)}`}>
            {job.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(job.priority)}`}>
            {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} Priority
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Progress</h3>
          <span className="text-white font-semibold">{job.progress_percentage}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-3">
          <div
            className="bg-cyan-400 h-3 rounded-full transition-all duration-300"
            style={{ width: `${job.progress_percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Job Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Details */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Project Details</h2>
          <div className="space-y-4">
            {job.description && (
              <div>
                <div className="text-sm text-gray-400">Description</div>
                <div className="text-white">{job.description}</div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {job.start_date && (
                <div>
                  <div className="text-sm text-gray-400">Start Date</div>
                  <div className="text-white">{formatDate(job.start_date)}</div>
                </div>
              )}
              
              {job.deadline && (
                <div>
                  <div className="text-sm text-gray-400">Deadline</div>
                  <div className="text-white">{formatDate(job.deadline)}</div>
                </div>
              )}
            </div>

            {job.estimated_hours && (
              <div>
                <div className="text-sm text-gray-400">Estimated Hours</div>
                <div className="text-white">{job.estimated_hours} hours</div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Financial Information</h2>
          <div className="space-y-4">
            {job.hourly_rate && (
              <div>
                <div className="text-sm text-gray-400">Hourly Rate</div>
                <div className="text-white">{formatCurrency(job.hourly_rate)}/hour</div>
              </div>
            )}
            
            {job.fixed_price && (
              <div>
                <div className="text-sm text-gray-400">Fixed Price</div>
                <div className="text-white">{formatCurrency(job.fixed_price)}</div>
              </div>
            )}
            
            {job.actual_hours && (
              <div>
                <div className="text-sm text-gray-400">Actual Hours</div>
                <div className="text-white">{job.actual_hours} hours</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Resources */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">Project Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resourceCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                  </div>
                  <button
                    onClick={() => setShowAddResource(category.id)}
                    className="p-1 rounded-md hover:bg-white/10 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-cyan-400" />
                  </button>
                </div>

                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {item.name}
                        </a>
                        {item.type && (
                          <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                            {item.type}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeResource(category.id, index)}
                        className="p-1 rounded-md hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </button>
                    </div>
                  ))}

                  {category.items.length === 0 && (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      No {category.name.toLowerCase()} added yet
                    </div>
                  )}

                  {showAddResource === category.id && (
                    <div className="space-y-2 p-3 bg-white/5 rounded-lg">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newResource.name}
                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <input
                        type="url"
                        placeholder="URL"
                        value={newResource.url}
                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <input
                        type="text"
                        placeholder="Type (optional)"
                        value={newResource.type}
                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => addResource(category.id, newResource)}
                          disabled={!newResource.name || !newResource.url}
                          className="px-3 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddResource(null);
                            setNewResource({ name: '', url: '', type: '' });
                          }}
                          className="px-3 py-1 text-gray-300 hover:text-white transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      {job.notes && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
          <div className="text-gray-300 whitespace-pre-wrap">
            {job.notes}
          </div>
        </div>
      )}
    </div>
  );
}
