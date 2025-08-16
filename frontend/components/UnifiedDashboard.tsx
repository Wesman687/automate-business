'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, Clock, MessageSquare, CheckCircle, Users, Briefcase, Mail, X } from 'lucide-react';
import ChangeRequestCard from './ChangeRequestCard';
import ChangeRequestModal from './ChangeRequestModal';
import SmartAppointmentModal from './SmartAppointmentModal';
import { fetchWithAuth } from '@/lib/api';

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
  customer_name?: string;
  job_title?: string;
}

interface Job {
  id: number;
  title: string;
  status: string;
  priority: string;
  deadline?: string;
  customer_name?: string;
  progress_percentage: number;
}

interface Appointment {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  title: string;
  description: string;
  appointment_date: string; // Backend returns date in 'YYYY-MM-DD' format
  appointment_time: string; // Backend returns time in 'HH:MM:SS' format
  duration_minutes: number;
  meeting_type: string;
  status: string;
  notes: string;
  created_at: string;
}

interface ChatLog {
  id: number;
  session_id: string;
  customer?: {
    id: number | null;
    name: string;
    email: string;
  };
  status: string;
  is_seen: boolean;
  created_at: string;
  updated_at: string | null;
  message_count: number;
  latest_message?: {
    text: string;
    timestamp: string;
    is_bot: boolean;
  } | null;
}

interface UnreadEmail {
  id: string;
  account: string;
  from: string;
  subject: string;
  received_date: string;
  preview: string;
  is_important: boolean;
}

interface DashboardStats {
  pending_change_requests: number;
  new_chat_logs: number;
  upcoming_appointments: number;
  unread_emails: number;
}

export default function UnifiedDashboard() {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
    const [unreadEmails, setUnreadEmails] = useState<any[]>([]);
  
  const markChatLogAsSeen = async (sessionId: number) => {
    try {
      const response = await fetchWithAuth(`/api/admin/chat-logs/${sessionId}/mark-seen`, {
        method: 'PUT'
      });

      if (response.ok) {
        // Remove the chat log from the list and update stats
        setChatLogs(prev => prev.filter(log => log.id !== sessionId));
        setStats(prev => ({
          ...prev,
          new_chat_logs: Math.max(0, prev.new_chat_logs - 1)
        }));
      }
    } catch (error) {
      console.error('Failed to mark chat log as seen:', error);
    }
  };
  const [stats, setStats] = useState<DashboardStats>({
    pending_change_requests: 0,
    new_chat_logs: 0,
    upcoming_appointments: 0,
    unread_emails: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Appointment modal state
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Determine if we're running locally and need to use server endpoints
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const serverBaseUrl = 'https://server.stream-lineai.com';
      
      // Email endpoint - always use server for email operations
      const emailEndpoint = `${serverBaseUrl}/api/admin/emails/unread`;

      // Fetch all dashboard data using the new fetchWithAuth function
      const [overviewRes, requestsRes, appointmentsRes, chatLogsRes, emailsRes] = await Promise.all([
        fetchWithAuth('/api/admin/overview'),
        fetchWithAuth('/api/admin/change-requests'),
        fetchWithAuth('/api/appointments?upcoming=true'),
        fetchWithAuth('/api/sessions'), // Updated to use the new chat sessions endpoint
        fetch(emailEndpoint, { credentials: 'include' }) // Email still uses direct fetch
      ]);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        const overviewStats = overviewData.stats || {
          pending_change_requests: 0,
          new_chat_logs: 0,
          upcoming_appointments: 0,
          unread_emails: 0
        };
        setStats(overviewStats);
      } else {
        console.error('❌ Overview API error:', overviewRes.status, await overviewRes.text());
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setChangeRequests(requestsData.change_requests || []);
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        const appointmentsList = Array.isArray(appointmentsData) ? appointmentsData : [];
        setAppointments(appointmentsList);
        
        // Calculate upcoming appointments count for stats
        const upcomingCount = appointmentsList.filter(apt => {
          try {
            // Combine appointment_date and appointment_time to create a proper datetime
            const dateTimeString = apt.appointment_time 
              ? `${apt.appointment_date}T${apt.appointment_time}` 
              : `${apt.appointment_date}T00:00:00`;
            const aptDate = new Date(dateTimeString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isValid = !isNaN(aptDate.getTime());
            const isUpcoming = aptDate >= today;
            
            return isValid && isUpcoming;
          } catch (error) {
            console.error('Error parsing appointment date:', apt.appointment_date, apt.appointment_time, error);
            return false;
          }
        }).length;
        
        // Update stats with correct upcoming appointments count
        setStats(prev => ({
          ...prev,
          upcoming_appointments: upcomingCount
        }));
      }

      if (chatLogsRes.ok) {
        const chatLogsData = await chatLogsRes.json();
        // Filter for only unseen chat logs
        const unseenLogs = Array.isArray(chatLogsData) ? chatLogsData.filter(log => !log.is_seen) : [];
        setChatLogs(unseenLogs);
        // Update stats with unseen count
        setStats(prev => ({
          ...prev,
          new_chat_logs: unseenLogs.length
        }));
      } else {
        console.error('❌ Chat logs API error:', chatLogsRes.status, await chatLogsRes.text());
      }

      if (emailsRes.ok) {
        const emailsData = await emailsRes.json();
        setUnreadEmails(emailsData.emails || []);
      } else if (isLocal) {
        // If running locally and server email fails, show a helpful message
        console.warn('Email fetching failed - this is expected when running locally without server access');
        setUnreadEmails([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChangeRequestStatus = async (requestId: number, newStatus: string) => {
    try {
      const response = await fetchWithAuth(`/api/admin/change-requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh the change requests
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
    setShowEditModal(true);
  };

  const handleSaveRequest = async (updatedRequest: Partial<ChangeRequest>) => {
    try {
      const response = await fetchWithAuth(`/api/admin/change-requests/${updatedRequest.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedRequest)
      });

      if (response.ok) {
        // Refresh the change requests
        setChangeRequests(prev => prev.map(req => 
          req.id === updatedRequest.id ? { ...req, ...updatedRequest } : req
        ));
      }
    } catch (error) {
      console.error('Error saving change request:', error);
      throw error;
    }
  };

  // Appointment handlers
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleAppointmentSave = async (appointmentData: any) => {
    try {
      await fetchDashboardData(); // Refresh the dashboard data
      setShowAppointmentModal(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error handling appointment save:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        // Refresh the appointments
        await fetchDashboardData();
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  const pendingRequests = changeRequests.filter(req => req.status === 'pending');
  const inProgressRequests = changeRequests.filter(req => req.status === 'in_progress');
  // Since we're already fetching only unseen chat logs from the API, we don't need to filter them again
  const newChatLogs = chatLogs;
  
  // Filter upcoming appointments (today and future) with better date parsing
  const upcomingAppointments = appointments.filter(apt => {
    try {
      // Combine appointment_date and appointment_time to create a proper datetime
      const dateTimeString = apt.appointment_time 
        ? `${apt.appointment_date}T${apt.appointment_time}` 
        : `${apt.appointment_date}T00:00:00`;
      const aptDate = new Date(dateTimeString);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      
      // Check if date is valid and is today or in the future
      return !isNaN(aptDate.getTime()) && aptDate >= today;
    } catch (error) {
      console.error('Error parsing appointment date:', apt.appointment_date, apt.appointment_time, error);
      return false;
    }
  });
  
  const importantEmails = unreadEmails.filter(email => email.is_important);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-white">{stats.pending_change_requests}</p>
              <p className="text-sm text-gray-300">Pending Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-white">{stats.new_chat_logs}</p>
              <p className="text-sm text-gray-300">Unseen Chat Logs</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-white">{stats.upcoming_appointments}</p>
              <p className="text-sm text-gray-300">Upcoming Appointments</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-white">{stats.unread_emails}</p>
              <p className="text-sm text-gray-300">Unread Emails</p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Change Requests */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              Pending Change Requests
            </h2>
            <span className="bg-red-400/20 text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <p className="text-gray-400 text-sm">No pending change requests</p>
            ) : (
              pendingRequests.map(request => (
                <ChangeRequestCard
                  key={request.id}
                  request={request}
                  showJobInfo={true}
                  onStatusUpdate={updateChangeRequestStatus}
                  onEdit={handleEditRequest}
                />
              ))
            )}
          </div>
        </div>

        {/* New Chat Logs */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <MessageSquare className="h-5 w-5 text-blue-400 mr-2" />
              Unseen Chat Logs
            </h2>
            <span className="bg-blue-400/20 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {newChatLogs.length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {newChatLogs.length === 0 ? (
              <p className="text-gray-400 text-sm">No unseen chat logs</p>
            ) : (
              newChatLogs.map(log => (
                <div key={log.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-white">
                        {log.customer?.name || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-gray-300">{log.customer?.email || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {new Date(log.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-400">{log.message_count} messages</p>
                    </div>
                  </div>
                  {log.latest_message && (
                    <p className="text-sm text-gray-300 truncate mb-2">
                      {log.latest_message.text}
                    </p>
                  )}
                  <div className="mt-2 flex justify-between items-center">
                    <button 
                      onClick={() => markChatLogAsSeen(log.id)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-medium transition-colors"
                    >
                      Mark as Seen
                    </button>
                    <button 
                      onClick={() => window.open(`/admin/chat-logs/${log.session_id}`, '_blank')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      View Full Log →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Secondary Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Calendar className="h-5 w-5 text-green-400 mr-2" />
              Upcoming Appointments
            </h2>
            <span className="bg-green-400/20 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {upcomingAppointments.length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-400 text-sm">No upcoming appointments</p>
            ) : (
              upcomingAppointments.map(appointment => (
                <div 
                  key={appointment.id} 
                  className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-white">{appointment.customer_name}</h3>
                      <p className="text-sm text-gray-300">{appointment.meeting_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {(() => {
                          try {
                            const dateTimeString = appointment.appointment_time 
                              ? `${appointment.appointment_date}T${appointment.appointment_time}` 
                              : `${appointment.appointment_date}T00:00:00`;
                            const date = new Date(dateTimeString);
                            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            });
                          } catch (error) {
                            return 'Invalid Date';
                          }
                        })()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(() => {
                          try {
                            const dateTimeString = appointment.appointment_time 
                              ? `${appointment.appointment_date}T${appointment.appointment_time}` 
                              : `${appointment.appointment_date}T00:00:00`;
                            const date = new Date(dateTimeString);
                            return isNaN(date.getTime()) ? 'Invalid Time' : date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          } catch (error) {
                            return 'Invalid Time';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-400/20 text-green-300' 
                        : 'bg-yellow-400/20 text-yellow-300'
                    }`}>
                      {appointment.status}
                    </span>
                    <span className="text-xs text-gray-400">{appointment.duration_minutes} min</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleEditAppointment(appointment)}
                      className="text-xs bg-blue-600/80 hover:bg-blue-600 text-white px-6 py-1 rounded text-center font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="text-xs bg-red-600/80 hover:bg-red-600 text-white px-4 py-1 rounded font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unread Emails */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Mail className="h-5 w-5 text-purple-400 mr-2" />
              Unread Emails
            </h2>
            <span className="bg-purple-400/20 text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {unreadEmails.length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {unreadEmails.length === 0 ? (
              <p className="text-gray-400 text-sm">No unread emails</p>
            ) : (
              unreadEmails.map(email => (
                <div key={email.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white truncate">{email.from}</h3>
                        {email.is_important && (
                          <span className="bg-red-400/20 text-red-300 text-xs font-medium px-1.5 py-0.5 rounded-full">
                            !
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-200 truncate">{email.subject}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-xs text-gray-400">
                        {new Date(email.received_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">
                        {email.account}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 truncate mb-2">{email.preview}</p>
                  <div className="flex justify-end">
                    <button 
                      onClick={async () => {
                        // Mark email as read on server
                        try {
                          await fetchWithAuth(`/api/admin/emails/mark-read/${email.id}`, {
                            method: 'POST'
                          });
                          // Refresh dashboard data to update counts
                          fetchDashboardData();
                        } catch (error) {
                          console.error('Error marking email as read:', error);
                        }
                        
                        // TODO: Open email client or webmail
                        console.log('Opening email:', email.id);
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                    >
                      Open Email →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* In Progress Items */}
      {inProgressRequests.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Clock className="h-5 w-5 text-blue-400 mr-2" />
              In Progress Change Requests
            </h2>
          <span className="bg-blue-400/20 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {inProgressRequests.length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressRequests.map(request => (
              <ChangeRequestCard
                key={request.id}
                request={request}
                showJobInfo={true}
                onStatusUpdate={updateChangeRequestStatus}
                onEdit={handleEditRequest}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Change Request Modal */}
      <ChangeRequestModal
        request={selectedRequest}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRequest(null);
        }}
        onSave={handleSaveRequest}
      />

      {/* Edit Appointment Modal */}
      <SmartAppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => {
          setShowAppointmentModal(false);
          setEditingAppointment(null);
        }}
        onSave={handleAppointmentSave}
        appointment={editingAppointment}
      />
    </div>
  );
}
