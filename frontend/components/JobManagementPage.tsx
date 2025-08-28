'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, Clock, CheckCircle, AlertCircle, Calendar, ExternalLink, Github, FolderOpen, Trash2, Edit3, FileText } from 'lucide-react';
import { api } from '@/lib/https';
import Link from 'next/link';
import CreateJobModal from './CreateJobModal';
// EditJobModal import removed - using JobDetailModal instead
import JobDetailModal from './JobDetailModal';
import { 
  Job, 
  User, 
  TimeEntry,
  JobCreate,
  JOB_STATUSES_OBJ,
  JOB_PRIORITIES_OBJ
} from '@/types';

interface JobManagementPageProps {
  onCreateNewJob?: () => void;
  isCustomer?: boolean; // Add this to determine context
}

export default function JobManagementPage({ onCreateNewJob, isCustomer = false }: JobManagementPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [showTimeEntry, setShowTimeEntry] = useState(false);

  useEffect(() => {
    fetchJobData();
  }, []);

  const fetchJobData = async () => {
    console.log('🔍 Fetching job data...');
    try {
      // Fetch jobs, customers, and time entries
      console.log('🔍 Fetching jobs...');
      const [jobsResponse, customersResponse, timeEntriesResponse] = await Promise.all([
        api.get<Job[]>(isCustomer ? '/jobs/customer' : '/jobs'),
        api.get<User[]>('/customers'),
        api.get<TimeEntry[]>(isCustomer ? '/time-entries/customer' : '/time-entries')
      ]);
      
      console.log('✅ Jobs response:', jobsResponse);
      console.log('✅ Customers response:', customersResponse);
      console.log('✅ Time entries response:', timeEntriesResponse);
      
      // Handle API responses - they should be arrays directly
      const jobs = Array.isArray(jobsResponse) ? jobsResponse : [];
      const customers = Array.isArray(customersResponse) ? customersResponse : [];
      const timeEntries = Array.isArray(timeEntriesResponse) ? timeEntriesResponse : [];
      
      console.log('📊 Processed data:', { jobs: jobs.length, customers: customers.length, timeEntries: timeEntries.length });
      
      setJobs(jobs);
      setCustomers(customers);
      setTimeEntries(timeEntries);
    } catch (error: any) {
      console.error('❌ Error fetching job data:', error);
      console.error('❌ Error details:', {
        message: error?.message || 'Unknown error',
        status: error?.status || 'No status',
        stack: error?.stack || 'No stack'
      });
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: JobCreate) => {
    try {
      console.log('Creating job with data:', jobData);
      // For customers, we'll need to create a job request instead of directly creating
      if (isCustomer) {
        // TODO: Implement job request endpoint for customers
        console.log('Customer job creation - would create job request');
        return;
      }
      await api.post('/jobs', jobData);
      await fetchJobData(); // Refresh the data
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  };

  const updateJob = async (jobId: number, updates: Partial<Job>) => {
    try {
      await api.put(`/jobs/${jobId}`, updates);
      await fetchJobData(); // Refresh the data
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  };

  const deleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await api.del(`/jobs/${jobId}`);
      await fetchJobData(); // Refresh the data
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case JOB_STATUSES_OBJ.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case JOB_STATUSES_OBJ.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case JOB_STATUSES_OBJ.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case JOB_STATUSES_OBJ.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case JOB_PRIORITIES_OBJ.URGENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case JOB_PRIORITIES_OBJ.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case JOB_PRIORITIES_OBJ.MEDIUM:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case JOB_PRIORITIES_OBJ.LOW:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case JOB_STATUSES.COMPLETED:
        return CheckCircle;
      case JOB_STATUSES.IN_PROGRESS:
        return Clock;
      case JOB_STATUSES.ON_HOLD:
        return AlertCircle;
      case JOB_STATUSES.CANCELLED:
        return AlertCircle;
      default:
        return Briefcase;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || customer?.email || 'Unknown Customer';
  };

  const getJobStats = () => {
    const total = jobs.length;
    const completed = jobs.filter(job => job.status === JOB_STATUSES.COMPLETED).length;
    const inProgress = jobs.filter(job => job.status === JOB_STATUSES.IN_PROGRESS).length;
    const pending = jobs.filter(job => job.status === JOB_STATUSES.PLANNING).length;
    const onHold = jobs.filter(job => job.status === JOB_STATUSES.ON_HOLD).length;

    return { total, completed, inProgress, pending, onHold };
  };

  const stats = getJobStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600">Manage and track all your projects and tasks</p>
        </div>
        {!isCustomer && (
          <button
            onClick={() => setShowCreateJob(true)}
            className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Job
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-cyan-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Jobs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Planning</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{stats.onHold}</p>
              <p className="text-sm text-gray-600">On Hold</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Jobs</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job
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
              {jobs.map((job) => {
                const StatusIcon = getStatusIcon(job.status);
                return (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-cyan-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500">
                            {job.description ? job.description.substring(0, 50) + '...' : 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCustomerName(job.customer_id)}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {job.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-cyan-600 h-2 rounded-full" 
                            style={{ width: `${job.progress_percentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{job.progress_percentage || 0}%</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.deadline ? formatDate(job.deadline) : 'No deadline'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowJobDetail(true);
                          }}
                          className="text-cyan-600 hover:text-cyan-900"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        {!isCustomer && (
                          <>
                            <button
                              onClick={() => updateJob(job.id, { status: JOB_STATUSES.IN_PROGRESS })}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteJob(job.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isCustomer ? 'You don\'t have any jobs yet.' : 'Get started by creating a new job.'}
            </p>
            {!isCustomer && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateJob(true)}
                  className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Job
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateJob && (
        <CreateJobModal
          isOpen={showCreateJob}
          onClose={() => setShowCreateJob(false)}
          onSave={createJob}
        />
      )}

      {showJobDetail && selectedJob && (
        <JobDetailModal
          jobId={selectedJob.id}
          isOpen={showJobDetail}
          onClose={() => {
            setShowJobDetail(false);
            setSelectedJob(null);
          }}
          onSave={async (updatedJob: Partial<Job>) => {
            if (selectedJob) {
              await updateJob(selectedJob.id, updatedJob);
            }
          }}
        />
      )}
    </div>
  );
}
