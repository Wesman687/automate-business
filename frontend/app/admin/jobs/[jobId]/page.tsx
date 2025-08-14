'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Calendar, Clock, DollarSign, Users, Github, Globe, Server, Video, FolderOpen, Plus, Trash2, ExternalLink, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import EditJobModal from '../../../../components/EditJobModal';
import ChangeRequestCard from '../../../../components/ChangeRequestCard';
import ChangeRequestModal from '../../../../components/ChangeRequestModal';

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

interface ChangeRequest {
  id: number;
  job_id: number;
  customer_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requested_via: string;
  session_id?: string;
  created_at: string;
  updated_at?: string;
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
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newResource, setNewResource] = useState({ name: '', url: '', type: '' });
  const [showAddResource, setShowAddResource] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);

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

        // Fetch change requests for this job
        const changeRequestsResponse = await fetch(`/api/admin/change-requests?job_id=${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (changeRequestsResponse.ok) {
          const changeRequestsData = await changeRequestsResponse.json();
          setChangeRequests(changeRequestsData.change_requests || []);
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

  const updateJobFromModal = async (jobData: any) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJob(updatedJob);
        setShowEditModal(false);
      } else {
        throw new Error('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  };

  const updateChangeRequestStatus = async (requestId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/change-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update the local state
        setChangeRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: newStatus as any } : req
        ));
      }
    } catch (error) {
      console.error('Error updating change request:', error);
    }
  };

  const handleEditRequest = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setShowChangeRequestModal(true);
  };

  const handleSaveRequest = async (updatedRequest: Partial<ChangeRequest>) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/change-requests/${updatedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRequest)
      });

      if (response.ok) {
        // Update the local state
        setChangeRequests(prev => prev.map(req => 
          req.id === updatedRequest.id ? { ...req, ...updatedRequest } : req
        ));
      }
    } catch (error) {
      console.error('Error saving change request:', error);
      throw error;
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

  const completeMilestone = async (index: number) => {
    if (!job || !job.milestones) return;
    
    const updatedMilestones = [...job.milestones];
    updatedMilestones[index].completed = true;
    
    await updateJob({ milestones: updatedMilestones });
  };

  const completeDeliverable = async (index: number) => {
    if (!job || !job.deliverables) return;
    
    const updatedDeliverables = [...job.deliverables];
    updatedDeliverables[index].delivered = true;
    updatedDeliverables[index].date = new Date().toISOString().split('T')[0];
    
    await updateJob({ deliverables: updatedDeliverables });
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
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Job
          </button>
          
          {/* Clickable Status */}
          {editingStatus ? (
            <select
              value={job.status}
              onChange={async (e) => {
                await updateJob({ status: e.target.value });
                setEditingStatus(false);
              }}
              onBlur={() => setEditingStatus(false)}
              className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            >
              <option value="not_started" className="bg-gray-800 text-white">Not Started</option>
              <option value="planning" className="bg-gray-800 text-white">Planning</option>
              <option value="in_progress" className="bg-gray-800 text-white">In Progress</option>
              <option value="on_hold" className="bg-gray-800 text-white">On Hold</option>
              <option value="completed" className="bg-gray-800 text-white">Completed</option>
              <option value="cancelled" className="bg-gray-800 text-white">Cancelled</option>
            </select>
          ) : (
            <button
              onClick={() => setEditingStatus(true)}
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full hover:opacity-80 transition-opacity ${getStatusColor(job.status)}`}
              title="Click to edit status"
            >
              {job.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          )}
          
          {/* Clickable Priority */}
          {editingPriority ? (
            <select
              value={job.priority}
              onChange={async (e) => {
                await updateJob({ priority: e.target.value });
                setEditingPriority(false);
              }}
              onBlur={() => setEditingPriority(false)}
              className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            >
              <option value="low" className="bg-gray-800 text-white">Low Priority</option>
              <option value="medium" className="bg-gray-800 text-white">Medium Priority</option>
              <option value="high" className="bg-gray-800 text-white">High Priority</option>
              <option value="urgent" className="bg-gray-800 text-white">Urgent Priority</option>
            </select>
          ) : (
            <button
              onClick={() => setEditingPriority(true)}
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full hover:opacity-80 transition-opacity ${getPriorityColor(job.priority)}`}
              title="Click to edit priority"
            >
              {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} Priority
            </button>
          )}
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
              <div>
                <div className="text-sm text-gray-400">Description</div>
                <div className="text-white">{job.description ? job.description : "None"}</div>
              </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Start Date</div>
                  <div className="text-white">{job.start_date ? formatDate(job.start_date) : "None"}</div>
                </div>
              
              
                <div>
                  <div className="text-sm text-gray-400">Deadline</div>
                  <div className="text-white">{job.deadline ?  formatDate(job.deadline) : "None"}</div>
                </div>

            </div>
              <div>
                <div className="text-sm text-gray-400">Estimated Hours</div>
                <div className="text-white">{job.estimated_hours ? job.estimated_hours : 0} hours</div>
              </div>

          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Financial Information</h2>
          <div className="space-y-4">
            
              <div>
                <div className="text-sm text-gray-400">Hourly Rate</div>
                <div className="text-white">{job.hourly_rate ? formatCurrency(job.hourly_rate) : 0}/hour</div>
              </div>
            
            
            
              <div>
                <div className="text-sm text-gray-400">Fixed Price</div>
                <div className="text-white">{job.fixed_price ? formatCurrency(job.fixed_price) : 0}</div>
              </div>
            
            
            
              <div>
                <div className="text-sm text-gray-400">Actual Hours</div>
                <div className="text-white">{job.actual_hours ? job.actual_hours : 0} hours</div>
              </div>
            
          </div>
        </div>
      </div>

      {/* Project Resources */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Project Resources</h2>
          <button
            onClick={() => setShowAddResource('add')}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </button>
        </div>
        
        {/* All Resources as Individual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* GitHub Repositories */}
          {job.github_repositories?.map((item, index) => (
            <div key={`github-${index}`} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">GitHub Repository</span>
                </div>
                <button
                  onClick={() => removeResource('github', index)}
                  className="p-1 rounded-md hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-cyan-300 flex items-center gap-2 font-medium"
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
            </div>
          ))}

          {/* Google Drive Links */}
          {job.google_drive_links?.map((item, index) => (
            <div key={`drive-${index}`} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Google Drive</span>
                </div>
                <button
                  onClick={() => removeResource('drive', index)}
                  className="p-1 rounded-md hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-cyan-300 flex items-center gap-2 font-medium"
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
            </div>
          ))}

          {/* Workspace Links */}
          {job.workspace_links?.map((item, index) => (
            <div key={`workspace-${index}`} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Workspace</span>
                </div>
                <button
                  onClick={() => removeResource('workspace', index)}
                  className="p-1 rounded-md hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-cyan-300 flex items-center gap-2 font-medium"
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
            </div>
          ))}

          {/* Server Details */}
          {job.server_details?.map((item, index) => (
            <div key={`server-${index}`} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Server</span>
                </div>
                <button
                  onClick={() => removeResource('server', index)}
                  className="p-1 rounded-md hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-cyan-300 flex items-center gap-2 font-medium"
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
            </div>
          ))}

          {/* Calendar Links */}
          {job.calendar_links?.map((item, index) => (
            <div key={`calendar-${index}`} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Calendar</span>
                </div>
                <button
                  onClick={() => removeResource('calendar', index)}
                  className="p-1 rounded-md hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-cyan-300 flex items-center gap-2 font-medium"
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
            </div>
          ))}

          {/* Meeting Links */}
          {job.meeting_links?.map((item, index) => (
            <div key={`meeting-${index}`} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Meeting</span>
                </div>
                <button
                  onClick={() => removeResource('meeting', index)}
                  className="p-1 rounded-md hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-cyan-300 flex items-center gap-2 font-medium"
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
            </div>
          ))}

          {/* Additional Tools */}
          {job.additional_tools?.map((item, index) => (
            <div key={`tools-${index}`} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Tool</span>
                </div>
                <button
                  onClick={() => removeResource('tools', index)}
                  className="p-1 rounded-md hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-cyan-300 flex items-center gap-2 font-medium"
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
            </div>
          ))}
        </div>

        {/* Show message if no resources */}
        {!job.github_repositories?.length && 
         !job.google_drive_links?.length && 
         !job.workspace_links?.length && 
         !job.server_details?.length && 
         !job.calendar_links?.length && 
         !job.meeting_links?.length && 
         !job.additional_tools?.length && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No resources added yet</div>
            <div className="text-gray-500 text-sm mt-2">Click "Add Resource" to add your first resource</div>
          </div>
        )}

        {/* Add Resource Modal */}
        {showAddResource === 'add' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Add Resource</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Resource Type</label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="" className="bg-gray-800 text-white">Select type...</option>
                    <option value="github" className="bg-gray-800 text-white">GitHub Repository</option>
                    <option value="drive" className="bg-gray-800 text-white">Google Drive</option>
                    <option value="workspace" className="bg-gray-800 text-white">Workspace</option>
                    <option value="server" className="bg-gray-800 text-white">Server</option>
                    <option value="calendar" className="bg-gray-800 text-white">Calendar</option>
                    <option value="meeting" className="bg-gray-800 text-white">Meeting</option>
                    <option value="tools" className="bg-gray-800 text-white">Tool</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Resource name"
                    value={newResource.name}
                    onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (newResource.type && newResource.name && newResource.url) {
                      const typeMapping: {[key: string]: string} = {
                        'github': 'github',
                        'drive': 'drive',
                        'workspace': 'workspace',
                        'server': 'server',
                        'calendar': 'calendar',
                        'meeting': 'meeting',
                        'tools': 'tools'
                      };
                      addResource(typeMapping[newResource.type], { 
                        name: newResource.name, 
                        url: newResource.url, 
                        type: newResource.type 
                      });
                    }
                  }}
                  disabled={!newResource.type || !newResource.name || !newResource.url}
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Resource
                </button>
                <button
                  onClick={() => {
                    setShowAddResource(null);
                    setNewResource({ name: '', url: '', type: '' });
                  }}
                  className="flex-1 px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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

      {/* Change Requests */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <MessageSquare className="h-5 w-5 text-cyan-400 mr-2" />
            Customer Change Requests
          </h2>
          <div className="flex items-center gap-2">
            {changeRequests.filter(req => req.status === 'pending').length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {changeRequests.filter(req => req.status === 'pending').length} Pending
              </span>
            )}
            <span className="text-sm text-gray-400">
              {changeRequests.length} Total
            </span>
          </div>
        </div>
        
        {changeRequests.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No change requests yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Change requests will appear here when customers make requests via the voice agent
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {changeRequests.map(request => (
              <ChangeRequestCard
                key={request.id}
                request={request}
                showJobInfo={false}
                onStatusUpdate={updateChangeRequestStatus}
                onEdit={handleEditRequest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Planning */}
      {((job.milestones && job.milestones.length > 0) || (job.deliverables && job.deliverables.length > 0)) && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Project Planning</h2>
          
          {/* Milestones */}
          {job.milestones && job.milestones.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Milestones</h3>
              <div className="space-y-3">
                {job.milestones.map((milestone, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{milestone.name}</h4>
                      <div className="flex items-center gap-2">
                        {milestone.due_date && (
                          <span className="text-xs text-gray-400">
                            Due: {new Date(milestone.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          milestone.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {milestone.completed ? 'Completed' : 'Pending'}
                        </span>
                        {!milestone.completed && (
                          <button
                            onClick={() => completeMilestone(index)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                    {milestone.description && (
                      <p className="text-gray-300 text-sm mb-2">{milestone.description}</p>
                    )}
                    {milestone.completed && (
                      <div className="mt-2 text-xs text-green-400">
                        ✅ Completed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {job.deliverables && job.deliverables.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Deliverables</h3>
              <div className="space-y-3">
                {job.deliverables.map((deliverable, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{deliverable.name}</h4>
                      <div className="flex items-center gap-2">
                        {deliverable.date && (
                          <span className="text-xs text-gray-400">
                            {deliverable.delivered ? 'Delivered:' : 'Due:'} {new Date(deliverable.date).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          deliverable.delivered 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {deliverable.delivered ? 'Delivered' : 'Pending'}
                        </span>
                        {!deliverable.delivered && (
                          <button
                            onClick={() => completeDeliverable(index)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                    {deliverable.description && (
                      <p className="text-gray-300 text-sm mb-2">{deliverable.description}</p>
                    )}
                    {deliverable.delivered && (
                      <div className="mt-2 text-xs text-green-400">
                        ✅ Delivered on {deliverable.date ? new Date(deliverable.date).toLocaleDateString() : 'Unknown date'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Job Modal */}
      <EditJobModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={updateJobFromModal}
        job={job}
      />

      {/* Change Request Modal */}
      <ChangeRequestModal
        request={selectedRequest}
        isOpen={showChangeRequestModal}
        onClose={() => {
          setShowChangeRequestModal(false);
          setSelectedRequest(null);
        }}
        onSave={handleSaveRequest}
      />
    </div>
  );
}
