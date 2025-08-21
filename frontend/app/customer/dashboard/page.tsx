'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/https';
import JobSetupWizard from '@/components/JobSetupWizard';
import CustomerCard from '@/components/CustomerCard';
import SmartAppointmentModal from '@/components/SmartAppointmentModal';
import EditCustomerModal from '@/components/EditCustomerModal';
import JobManagementPage from '@/components/JobManagementPage';
import ErrorModal from '@/components/ErrorModal';
import DeleteModal from '@/components/DeleteModal';
import SuccessModal from '@/components/SuccessModal';
import { 
  Plus, 
  FileText, 
  Briefcase, 
  Settings, 
  Upload,
  Calendar,
  DollarSign,
  Target,
  Sparkles,
  Eye,
  Edit,
  X,
  Trash2
} from 'lucide-react';

interface JobSetupData {
  business_name: string;
  business_type: string;
  industry: string;
  description: string;
  project_title: string;
  project_description: string;
  project_goals: string;
  target_audience: string;
  timeline: string;
  budget_range: string;
  brand_colors: string[];
  brand_style: string;
  logo_files: number[];
  brand_guidelines: string;
  website_url: string;
  github_url: string;
  social_media: any;
  project_files: number[];
  reference_files: number[];
  requirements_doc: string;
}

interface Customer {
  id: number;
  user_id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  business_site?: string;
  business_type?: string;
  additional_websites?: string;
  status: string;
  notes?: string;
  file_path?: string;
  created_at: string;
  updated_at?: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Appointment {
  id?: number;
  customer_id: number;
  title: string;
  description?: string;
  appointment_date?: string;
  appointment_time?: string;
  scheduled_date?: string; // Alternative field name
  scheduled_time?: string; // Alternative field name
  duration_minutes?: number;
  meeting_type?: string;
  status: string;
  notes?: string;
}

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const [showJobSetup, setShowJobSetup] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showViewCustomerModal, setShowViewCustomerModal] = useState(false);
  const [showJobsModal, setShowJobsModal] = useState(false);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalJobs: 0,
    activeProjects: 0
  });

  useEffect(() => {
    if (user) {
      fetchCustomerData();
      fetchRecentFiles();
      fetchJobs();
      fetchAppointments();
      fetchStats();
    }
  }, [user]);

  const fetchCustomerData = async () => {
    try {
      // Use the user endpoint instead of customers
      const response = await api.get(`/users/${user?.user_id}`);
      setCustomerData(response);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const fetchRecentFiles = async () => {
    try {
      const response = await api.get('/file-upload/files');
      setRecentFiles(response.files?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching recent files:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/customer');
      setJobs(response.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/customer');
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch stats from various endpoints
      const filesResponse = await api.get('/file-upload/files');
      const jobsResponse = await api.get('/jobs/customer');
      
      setStats({
        totalFiles: filesResponse.files?.length || 0,
        totalJobs: jobsResponse.jobs?.length || 0,
        activeProjects: jobsResponse.jobs?.filter((j: any) => j.status === 'active').length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleJobSetupComplete = async (data: JobSetupData) => {
    try {
      // Submit job setup data
              const response = await api.post('/jobs/setup-request', data);
      
      if (response.success) {
        setSuccessMessage('Job setup request submitted successfully! Our team will review and contact you soon.');
        setShowSuccessModal(true);
        setShowJobSetup(false);
        fetchJobs(); // Refresh jobs
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error submitting job setup:', error);
      setErrorMessage('Error submitting job setup. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleScheduleAppointment = async (appointmentData: Appointment) => {
    try {
      // Ensure the appointment data has the correct structure
      const appointmentPayload = {
        ...appointmentData,
        customer_id: user?.user_id,
        status: 'scheduled'
      };

      // Create appointment
      await api.post('/appointments', appointmentPayload);
      setShowScheduleModal(false);
      
      // Refresh appointments list
      await fetchAppointments();
      
      // Show success message
      setSuccessMessage('Appointment scheduled successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      setErrorMessage('Error scheduling appointment. Please try again.');
      setShowErrorModal(true);
    }
  };

  const openEditCustomerModal = () => {
    setShowEditCustomerModal(true);
  };

  const handleEditCustomer = async (customerData: Partial<Customer>, passwordData?: { password: string }) => {
    try {
      // Update customer data
      await api.put(`/users/${user?.user_id}`, customerData);
      if (passwordData?.password) {
        await api.post(`/users/${user?.user_id}/password`, { password: passwordData.password });
      }
      setShowEditCustomerModal(false);
      fetchCustomerData(); // Refresh customer data
      setSuccessMessage('Customer information updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating customer:', error);
      setErrorMessage('Error updating customer information. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setShowViewCustomerModal(true);
  };

  const handleViewJobs = () => {
    setShowJobsModal(true);
  };

  const editAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowEditAppointmentModal(true);
  };

  const deleteAppointment = async (appointmentId: number) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setDeletingAppointment(appointment);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteAppointment = async () => {
    if (!deletingAppointment) return;
    
    setIsDeleting(true);
    try {
      await api.del(`/appointments/${deletingAppointment.id}`);
      await fetchAppointments(); // Refresh the list
      setShowDeleteModal(false);
      setDeletingAppointment(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setErrorMessage('Failed to delete appointment. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  // Transform user data to match Customer interface
  const transformUserToCustomer = (userData: any): Customer => {
    return {
      id: userData.id || userData.user_id,
      user_id: userData.user_id || userData.id,
      email: userData.email,
      name: userData.name || userData.email?.split('@')[0] || 'Unknown',
      phone: userData.phone,
      address: userData.address,
      city: userData.city,
      state: userData.state,
      zip_code: userData.zip_code,
      country: userData.country,
      business_site: userData.business_site,
      business_type: userData.business_type,
      additional_websites: userData.additional_websites,
      status: userData.status || 'active',
      notes: userData.notes,
      file_path: userData.file_path,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (showJobSetup) {
    return <JobSetupWizard onComplete={handleJobSetupComplete} onClose={() => setShowJobSetup(false)} />;
  }

  // Transform customer data for display
  const displayCustomerData = customerData ? transformUserToCustomer(customerData) : null;


  return (
    <div className="min-h-screen bg-dark-bg pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-electric-blue to-red-500 text-white px-6 py-3 rounded-full mb-6 font-semibold">
            <Sparkles className="w-5 h-5" />
            <span>Customer Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome back,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-red-500">
              {displayCustomerData?.name || user?.email?.split('@')[0]}
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage your projects, upload files, and start new automation initiatives
          </p>
        </div>

        {/* Getting Started Guide - MOVED TO TOP */}
        <div className="bg-gradient-to-r from-electric-blue to-red-500 rounded-xl shadow-lg p-8 mb-12 text-white">
          <h2 className="text-2xl font-bold mb-4">Getting Started with Automation</h2>
          <p className="text-white/90 mb-6 font-medium">
            Ready to transform your business with automation? Follow these simple steps:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Start Your Project</h3>
              <p className="text-white/90 text-sm">Use our interactive wizard to describe your automation needs</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Expert Review</h3>
              <p className="text-white/90 text-sm">Our specialists will review and plan your project</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Implementation</h3>
              <p className="text-white/90 text-sm">We&apos;ll build and deploy your automation solution</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button
              onClick={() => setShowJobSetup(true)}
              className="px-8 py-3 bg-white text-electric-blue rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
            >
              Start Your Automation Journey
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-dark-card rounded-xl shadow-lg p-6 border border-dark-border hover:border-electric-blue hover:shadow-xl hover:shadow-electric-blue/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Files</p>
                <p className="text-3xl font-bold text-white">{stats.totalFiles}</p>
              </div>
              <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-electric-blue" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card rounded-xl shadow-lg p-6 border border-dark-border hover:border-red-500 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Jobs</p>
                <p className="text-3xl font-bold text-white">{stats.totalJobs}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card rounded-xl shadow-lg p-6 border border-dark-border hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Projects</p>
                <p className="text-3xl font-bold text-white">{stats.activeProjects}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-card rounded-xl shadow-lg p-8 mb-12 border border-dark-border">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => setShowJobSetup(true)}
              className="group p-6 bg-gradient-to-br from-electric-blue to-electric-blue/80 rounded-xl text-white hover:from-electric-blue/90 hover:to-electric-blue/90 transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start New Job</h3>
              <p className="text-white/90 text-sm">Begin a new automation project</p>
            </button>

            <button 
              onClick={handleViewJobs}
              className="group p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">View Jobs</h3>
              <p className="text-red-100 text-sm">Check current job status</p>
            </button>

                              <button 
                    onClick={() => {
                      // Open file upload functionality
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = '*/*';
                      input.onchange = async (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) {
                          try {
                            console.log('Files selected:', files);
                                              // Upload each file
                  for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_type', 'project_file');
                    
                    const result = await api.post('/file-upload/upload', formData);
                    console.log('File upload result:', result);
                  }
                  
                  // Refresh files list
                  await fetchRecentFiles();
                  setErrorMessage("Files uploaded successfully!");
                  setShowErrorModal(true);
                          } catch (error) {
                            console.error('Error uploading files:', error);
                            setErrorMessage('Error uploading files. Please try again.');
                            setShowErrorModal(true);
                          }
                        }
                      };
                      input.click();
                    }}
                    className="group p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 font-semibold w-full text-left"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
                    
                    {/* File Status */}
                    {recentFiles.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        <p className="text-purple-100 text-sm font-medium">Recent Files:</p>
                        {recentFiles.slice(0, 2).map((file: any) => (
                          <div key={file.id} className="bg-white/10 rounded-lg p-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-white truncate">
                                  {file.original_filename}
                                </p>
                                <p className="text-purple-200">
                                  {file.upload_type} • {new Date(file.uploaded_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {recentFiles.length > 2 && (
                          <p className="text-purple-200 text-xs text-center">
                            +{recentFiles.length - 2} more files
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-purple-100 text-sm mb-4">No files uploaded yet</p>
                    )}
                    
                    {/* Upload Button */}
                    <div className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm text-center">
                      {recentFiles.length > 0 ? 'Upload More Files' : 'Upload Your First File'}
                    </div>
                  </button>

            <button className="group p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 font-semibold">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Billing</h3>
              <p className="text-orange-100 text-sm">View invoices & payments</p>
            </button>
          </div>
        </div>

        {/* Customer Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Your Profile</h2>
            {displayCustomerData && (
              <CustomerCard 
                customer={displayCustomerData} 
                showActions={true}
                onEdit={openEditCustomerModal}
                onView={handleViewCustomer}
                className="w-full"
              />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Appointments</h2>
            <div className="bg-dark-card rounded-xl shadow-lg border border-dark-border flex flex-col">
              {appointments.length > 0 ? (
                <div className="p-6 flex-1">
                  <div className="space-y-4 h-full">
                    {appointments.map((appointment) => {
                      console.log('Full appointment object:', appointment);
                      return (
                      <div key={appointment.id} className="bg-dark-bg rounded-lg border border-dark-border hover:border-electric-blue transition-colors p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-6 h-6 text-electric-blue flex-shrink-0" />
                            <div>
                              <h3 className="font-semibold text-white text-lg">{appointment.title || 'Consultation'}</h3>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-400">
                                  {(() => {
                                    // Check both possible date fields
                                    const dateValue = appointment.appointment_date || appointment.scheduled_date;
                                    console.log('Appointment date data:', dateValue);
                                    if (dateValue) {
                                      try {
                                        const date = new Date(dateValue);
                                        console.log('Parsed date:', date);
                                        if (!isNaN(date.getTime())) {
                                          return date.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                          });
                                        }
                                      } catch (e) {
                                        console.error('Error parsing date:', e);
                                      }
                                    }
                                    return 'Date: TBD';
                                  })()}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {(() => {
                                    // Check both possible time fields
                                    const timeValue = appointment.appointment_time || appointment.scheduled_time;
                                    console.log('Appointment time data:', timeValue);
                                    if (timeValue) {
                                      try {
                                        // Handle different time formats
                                        let timeStr = timeValue;
                                        if (timeStr.includes('T')) {
                                          // If it's already a full datetime
                                          const date = new Date(timeStr);
                                          if (!isNaN(date.getTime())) {
                                            return date.toLocaleTimeString('en-US', {
                                              hour: 'numeric',
                                              minute: '2-digit',
                                              hour12: true
                                            });
                                          }
                                        } else {
                                          // If it's just time (HH:MM)
                                          const [hours, minutes] = timeStr.split(':');
                                          if (hours && minutes) {
                                            const date = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
                                            return date.toLocaleTimeString('en-US', {
                                              hour: 'numeric',
                                              minute: '2-digit',
                                              hour12: true
                                            });
                                          }
                                        }
                                      } catch (e) {
                                        console.error('Error parsing time:', e);
                                      }
                                    }
                                    return 'Time: TBD';
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-500/20 text-green-400' 
                              : appointment.status === 'scheduled'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        {appointment.description && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-300">{appointment.description}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-3 border-t border-dark-border">
                          <div className="text-xs text-gray-500">
                            Duration: {appointment.duration_minutes || 60} minutes
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => editAppointment(appointment)}
                              className="flex items-center space-x-1 px-3 py-1 text-xs bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-colors"
                              title="Edit appointment"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => appointment.id && deleteAppointment(appointment.id)}
                              className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                              title="Delete appointment"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Appointments Scheduled</h3>
                    <p className="text-gray-400 mb-6">Schedule your first consultation to get started with your automation project</p>
                    <button 
                      onClick={() => setShowScheduleModal(true)}
                      className="px-6 py-3 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 font-semibold text-lg transition-colors"
                    >
                      Schedule Appointment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <SmartAppointmentModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSave={handleScheduleAppointment}
          appointment={null}
          customerId={user?.user_id}
          customerName={customerData?.name}
          customerEmail={customerData?.email}
        />
      )}

      {/* Edit Customer Modal */}
      {showEditCustomerModal && displayCustomerData && (
        <EditCustomerModal
          customer={displayCustomerData}
          isOpen={showEditCustomerModal}
          onSave={handleEditCustomer}
          onClose={() => setShowEditCustomerModal(false)}
        />
      )}

      {/* View Customer Modal */}
      {showViewCustomerModal && displayCustomerData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-xl shadow-xl border border-dark-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h2 className="text-2xl font-bold text-white">Customer Details</h2>
              <button
                onClick={() => setShowViewCustomerModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-border rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <p className="text-white">{displayCustomerData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <p className="text-white">{displayCustomerData.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <p className="text-white">{displayCustomerData.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      displayCustomerData.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {displayCustomerData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Business Type</label>
                    <p className="text-white">{displayCustomerData.business_type || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Business Website</label>
                    <p className="text-white">{displayCustomerData.business_site || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Additional Websites</label>
                    <p className="text-white">{displayCustomerData.additional_websites || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                    <p className="text-white">{displayCustomerData.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
                    <p className="text-white">{displayCustomerData.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">State</label>
                    <p className="text-white">{displayCustomerData.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">ZIP Code</label>
                    <p className="text-white">{displayCustomerData.zip_code || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {displayCustomerData.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
                  <p className="text-gray-300">{displayCustomerData.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-dark-border">
                <button
                  onClick={() => {
                    setShowViewCustomerModal(false);
                    setShowEditCustomerModal(true);
                  }}
                  className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors"
                >
                  Edit Customer
                </button>
                <button
                  onClick={() => setShowViewCustomerModal(false)}
                  className="px-4 py-2 bg-dark-border text-gray-300 rounded-lg hover:bg-dark-border/80 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Modal */}
      {showJobsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-bg rounded-xl shadow-xl border border-dark-border max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h2 className="text-2xl font-bold text-white">Your Jobs</h2>
              <button
                onClick={() => setShowJobsModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-border rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
                                  <div className="p-6">
                        <JobManagementPage 
                          isCustomer={true}
                          onCreateNewJob={() => {
                            setShowJobsModal(false);
                            setShowJobSetup(true);
                          }}
                        />
                      </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditAppointmentModal && editingAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-xl shadow-xl border border-dark-border max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h2 className="text-2xl font-bold text-white">Edit Appointment</h2>
              <button
                onClick={() => setShowEditAppointmentModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-border rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  defaultValue={editingAppointment.title || ''}
                  onChange={(e) => setEditingAppointment({
                    ...editingAppointment,
                    title: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                  placeholder="Appointment title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  defaultValue={editingAppointment.description || ''}
                  onChange={(e) => setEditingAppointment({
                    ...editingAppointment,
                    description: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                  placeholder="Appointment description"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  defaultValue={editingAppointment.notes || ''}
                  onChange={(e) => setEditingAppointment({
                    ...editingAppointment,
                    notes: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                  placeholder="Additional notes"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-dark-border">
                <button
                  onClick={async () => {
                    try {
                      await api.put(`/appointments/${editingAppointment.id}`, editingAppointment);
                      setShowEditAppointmentModal(false);
                      setEditingAppointment(null);
                      await fetchAppointments();
                      setSuccessMessage('Appointment updated successfully!');
                      setShowSuccessModal(true);
                    } catch (error) {
                      console.error('Error updating appointment:', error);
                      setErrorMessage('Failed to update appointment. Please try again.');
                      setShowErrorModal(true);
                    }
                  }}
                  className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditAppointmentModal(false)}
                  className="px-4 py-2 bg-dark-border text-gray-300 rounded-lg hover:bg-dark-border/80 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingAppointment(null);
        }}
        onConfirm={confirmDeleteAppointment}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        itemName={deletingAppointment?.title || 'Appointment'}
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        message={successMessage}
        variant="success"
      />

      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Error"
          message={errorMessage}
        />
      )}
    </div>
  );
}
