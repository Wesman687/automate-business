'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, Clock, CheckCircle, AlertCircle, Calendar, ExternalLink, Github, FolderOpen, Trash2, Edit3, FileText } from 'lucide-react';
import Link from 'next/link';
import CreateJobModal from './CreateJobModal';
import EditJobModal from './EditJobModal';

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

interface TimeEntry {
  id: number;
  job_id: number;
  start_time: string;
  end_time?: string;
  duration_hours?: number;
  description: string;
  billable: boolean;
  hourly_rate?: number;
  amount?: number;
}

export default function JobManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showEditJob, setShowEditJob] = useState(false);
  const [showTimeEntry, setShowTimeEntry] = useState(false);

  useEffect(() => {
    fetchJobData();
  }, []);

  const fetchJobData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch jobs and time entries
      const [jobsRes, timeRes] = await Promise.all([
        fetch('/api/jobs', { headers }),
        fetch('/api/time-entries', { headers })
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }

      if (timeRes.ok) {
        const timeData = await timeRes.json();
        setTimeEntries(timeData);
      }
    } catch (error) {
      console.error('Error fetching job data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: any) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        await fetchJobData(); // Refresh the data
      } else {
        throw new Error('Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  };

  const updateJob = async (jobData: any) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/jobs/${selectedJob?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        await fetchJobData(); // Refresh the data
        setShowEditJob(false);
        setSelectedJob(null);
      } else {
        throw new Error('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  };

  const updateJobProgress = async (jobId: number, progress: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ progress_percentage: progress })
      });

      if (response.ok) {
        await fetchJobData(); // Refresh the data
      } else {
        throw new Error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const deleteJob = async (jobId: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchJobData(); // Refresh the data
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  };

  const createTimeEntry = async (timeData: any) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(timeData)
      });

      if (response.ok) {
        await fetchJobData(); // Refresh the data
      } else {
        throw new Error('Failed to log time');
      }
    } catch (error) {
      console.error('Error logging time:', error);
      throw error;
    }
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
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'on_hold':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'planning':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Briefcase className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeJobs = jobs.filter(job => job.status !== 'completed' && job.status !== 'cancelled');
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const cancelledJobs = jobs.filter(job => job.status === 'cancelled');
  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration_hours || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Job Management</h1>
        <button 
          onClick={() => setShowCreateJob(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Job</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{activeJobs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{completedJobs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.filter(job => job.priority === 'high').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Briefcase },
            { id: 'jobs', label: 'All Jobs', icon: Briefcase },
            { id: 'time', label: 'Time Tracking', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Active Jobs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    {getStatusIcon(job.status)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(job.priority)}`}>
                      {job.priority}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{job.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(job.progress_percentage)}`}
                      style={{ width: `${job.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Job Details */}
                <div className="space-y-2 text-sm">
                  {job.deadline && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Due: {formatDate(job.deadline)}</span>
                    </div>
                  )}
                  {job.estimated_hours && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{job.estimated_hours}h estimated</span>
                    </div>
                  )}
                </div>

                {/* Resource Links */}
                {(job.google_drive_links?.length || job.github_repositories?.length || job.workspace_links?.length) && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      {job.google_drive_links?.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          <FolderOpen className="h-3 w-3 mr-1" />
                          Drive
                        </a>
                      ))}
                      {job.github_repositories?.map((repo, index) => (
                        <a
                          key={index}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                        >
                          <Github className="h-3 w-3 mr-1" />
                          GitHub
                        </a>
                      ))}
                      {job.workspace_links?.map((workspace, index) => (
                        <a
                          key={index}
                          href={workspace.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Workspace
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-4">
                  <Link 
                    href={`/admin/jobs/${job.id}`}
                    className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Completed Jobs Section */}
          {completedJobs.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Completed Jobs</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {completedJobs.map((job) => (
                  <div key={job.id} className="bg-green-50 rounded-lg shadow border border-green-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{job.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500 ml-4" />
                    </div>
                    <div className="text-sm text-gray-600">
                      {job.completion_date && (
                        <p>Completed: {formatDate(job.completion_date)}</p>
                      )}
                    </div>
                    <div className="mt-4">
                      <Link 
                        href={`/admin/jobs/${job.id}`}
                        className="w-full text-center text-green-600 hover:text-green-800 text-sm font-medium block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Jobs Section */}
          {cancelledJobs.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cancelled Jobs</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {cancelledJobs.map((job) => (
                  <div key={job.id} className="bg-red-50 rounded-lg shadow border border-red-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{job.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                      </div>
                      <AlertCircle className="h-5 w-5 text-red-500 ml-4" />
                    </div>
                    <div className="mt-4">
                      <Link 
                        href={`/admin/jobs/${job.id}`}
                        className="w-full text-center text-red-600 hover:text-red-800 text-sm font-medium block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeJobs.length === 0 && completedJobs.length === 0 && cancelledJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Jobs</h3>
              <p className="text-gray-600">Create a new job to get started.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">All Jobs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="text-cyan-600 hover:text-cyan-800 font-medium"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Customer #{job.customer_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(job.progress_percentage)}`}
                            style={{ width: `${job.progress_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{job.progress_percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.deadline ? formatDate(job.deadline) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link 
                          href={`/admin/jobs/${job.id}`}
                          className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          View
                        </Link>
                        <button 
                          onClick={() => {
                            setSelectedJob(job);
                            setShowEditJob(true);
                          }}
                          className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${job.title}"?`)) {
                              deleteJob(job.id);
                            }
                          }}
                          className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'time' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Time Entries</h3>
            <button 
              onClick={() => setShowTimeEntry(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Log Time</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeEntries.map((entry) => {
                  const job = jobs.find(j => j.id === entry.job_id);
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job?.title || `Job #${entry.job_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(entry.start_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.duration_hours?.toFixed(2) || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.billable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.billable ? 'Billable' : 'Non-billable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.amount ? formatCurrency(entry.amount) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={showCreateJob}
        onClose={() => setShowCreateJob(false)}
        onSave={createJob}
      />

      {/* Edit Job Modal */}
      <EditJobModal
        isOpen={showEditJob}
        onClose={() => {
          setShowEditJob(false);
          setSelectedJob(null);
        }}
        onSave={updateJob}
        job={selectedJob}
      />

      {/* Time Entry Modal */}
      {showTimeEntry && (
        <div className="fixed inset-0 bg-gray-800/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Log Time Entry</h2>
              <button
                onClick={() => setShowTimeEntry(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const timeData = {
                  job_id: parseInt(formData.get('job_id') as string),
                  start_time: new Date().toISOString(),
                  duration_hours: parseFloat(formData.get('hours') as string),
                  description: formData.get('description') as string,
                  billable: formData.get('billable') === 'on'
                };
                try {
                  await createTimeEntry(timeData);
                  setShowTimeEntry(false);
                } catch (error) {
                  alert('Failed to log time entry');
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job
                    </label>
                    <select
                      name="job_id"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    >
                      <option value="" className="bg-white text-gray-900">Select a job</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id} className="bg-white text-gray-900">
                          {job.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hours
                    </label>
                    <input
                      type="number"
                      name="hours"
                      step="0.25"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What did you work on?"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="billable"
                      id="billable"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="billable" className="ml-2 text-sm text-gray-700">
                      Billable time
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowTimeEntry(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Log Time
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
