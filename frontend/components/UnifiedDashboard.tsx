'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, Clock, MessageSquare, CheckCircle, Users, Briefcase, Mail } from 'lucide-react';
import ChangeRequestCard from './ChangeRequestCard';
import ChangeRequestModal from './ChangeRequestModal';

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
  customer_name: string;
  scheduled_date: string;
  appointment_type: string;
  status: string;
  duration_minutes: number;
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
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await fetch(`/api/admin/chat-logs/${sessionId}/mark-seen`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Determine if we're running locally and need to use server endpoints
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const serverBaseUrl = 'https://server.stream-lineai.com';
      
      // Email endpoint - always use server for email operations
      const emailEndpoint = isLocal 
        ? `${serverBaseUrl}/api/admin/emails/unread`
        : '/api/admin/emails/unread';

      // Fetch all dashboard data
      const [overviewRes, requestsRes, appointmentsRes, chatLogsRes, emailsRes] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/change-requests', { headers }),
        fetch('/api/appointments?upcoming=true', { headers }),
        fetch('/api/admin/chat-logs?seen=false&limit=10', { headers }), // Only get unseen chat logs
        fetch(emailEndpoint, { headers })
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
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      }

      if (chatLogsRes.ok) {
        const chatLogsData = await chatLogsRes.json();
        setChatLogs(chatLogsData.chat_logs || []);
        // Only update stats if the API returned valid data
        if (chatLogsData.total !== undefined) {
          setStats(prev => ({
            ...prev,
            new_chat_logs: chatLogsData.total
          }));
        }
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

  const pendingRequests = changeRequests.filter(req => req.status === 'pending');
  const inProgressRequests = changeRequests.filter(req => req.status === 'in_progress');
  // Since we're already fetching only unseen chat logs from the API, we don't need to filter them again
  const newChatLogs = chatLogs;
  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    return new Date(apt.scheduled_date).toDateString() === today;
  });
  const importantEmails = unreadEmails.filter(email => email.is_important);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{stats.pending_change_requests}</p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{stats.new_chat_logs}</p>
              <p className="text-sm text-gray-600">Unseen Chat Logs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{stats.upcoming_appointments}</p>
              <p className="text-sm text-gray-600">Upcoming Appointments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{stats.unread_emails}</p>
              <p className="text-sm text-gray-600">Unread Emails</p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Change Requests */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Pending Change Requests
            </h2>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending change requests</p>
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
              Unseen Chat Logs
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {newChatLogs.length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {newChatLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">No unseen chat logs</p>
            ) : (
              newChatLogs.map(log => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {log.customer?.name || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-gray-600">{log.customer?.email || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(log.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">{log.message_count} messages</p>
                    </div>
                  </div>
                  {log.latest_message && (
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {log.latest_message.text}
                    </p>
                  )}
                  <div className="mt-2 flex justify-between items-center">
                    <button 
                      onClick={() => markChatLogAsSeen(log.id)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-medium"
                    >
                      Mark as Seen
                    </button>
                    <button 
                      onClick={() => window.open(`/admin/chat-logs/${log.id}`, '_blank')}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 text-green-500 mr-2" />
              Upcoming Appointments
            </h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {appointments.length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming appointments</p>
            ) : (
              appointments.map(appointment => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{appointment.customer_name}</h3>
                      <p className="text-sm text-gray-600">{appointment.appointment_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(appointment.scheduled_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.scheduled_date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                    <span className="text-xs text-gray-500">{appointment.duration_minutes} min</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unread Emails */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Mail className="h-5 w-5 text-purple-500 mr-2" />
              Unread Emails
            </h2>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {unreadEmails.length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {unreadEmails.length === 0 ? (
              <p className="text-gray-500 text-sm">No unread emails</p>
            ) : (
              unreadEmails.map(email => (
                <div key={email.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{email.from}</h3>
                        {email.is_important && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                            !
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-700 truncate">{email.subject}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-xs text-gray-500">
                        {new Date(email.received_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {email.account}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-2">{email.preview}</p>
                  <div className="flex justify-end">
                    <button 
                      onClick={async () => {
                        // Mark email as read on server if needed
                        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                        const serverBaseUrl = 'https://server.stream-lineai.com';
                        const markReadEndpoint = isLocal 
                          ? `${serverBaseUrl}/api/admin/emails/mark-read/${email.id}`
                          : `/api/admin/emails/mark-read/${email.id}`;
                        
                        try {
                          const token = localStorage.getItem('admin_token');
                          await fetch(markReadEndpoint, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                            }
                          });
                          // Refresh dashboard data to update counts
                          fetchDashboardData();
                        } catch (error) {
                          console.error('Error marking email as read:', error);
                        }
                        
                        // TODO: Open email client or webmail
                        console.log('Opening email:', email.id);
                      }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              In Progress Change Requests
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
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
    </div>
  );
}
