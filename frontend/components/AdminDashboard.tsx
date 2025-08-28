'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Calendar, Clock, MessageSquare, Mail, Link, Users, Shield, Crown, CreditCard } from 'lucide-react';
import ChangeRequestCard from './ChangeRequestCard';
import ChangeRequestModal from './ChangeRequestModal';
import SmartAppointmentModal from './SmartAppointmentModal';
import EmailManager from './EmailManager';
import CrossAppIntegrationModal from './CrossAppIntegrationModal';
import { api } from '@/lib/https';
import { 
  CustomerChangeRequest,
  Job,
  Appointment,
  ChatSession,
  EmailAccount
} from '@/types';

interface AdminOverviewData {
  upcoming_appointments: Array<{
    id: number;
    customer_name: string;
    customer_email: string;
    scheduled_time: string;
    duration: string;
    type: string;
    status: string;
  }>;
  active_change_requests: Array<{
    id: number;
    title: string;
    priority: string;
    status: string;
    customer_name: string;
    job_title: string;
    created_at: string;
    requested_via: string;
  }>;
  active_jobs: Array<{
    id: number;
    title: string;
    customer_name: string;
    status: string;
    priority: string;
    progress: number;
  }>;
  stats: {
    total_appointments: number;
    total_change_requests: number;
    total_active_jobs: number;
    urgent_change_requests: number;
    high_priority_jobs: number;
  };
}

interface DashboardStats {
  pending_change_requests: number;
  new_chat_logs: number;
  upcoming_appointments: number;
  unread_emails: number;
}

export default function AdminDashboard() {
  const [overviewData, setOverviewData] = useState<AdminOverviewData | null>(null);
  const [chatLogs, setChatLogs] = useState<ChatSession[]>([]);
  const [unreadEmails, setUnreadEmails] = useState<EmailAccount[]>([]);
  const [showEmailManager, setShowEmailManager] = useState(false);
  const [showCrossAppModal, setShowCrossAppModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    pending_change_requests: 0,
    new_chat_logs: 0,
    upcoming_appointments: 0,
    unread_emails: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Initialize stats with default values to ensure display
  useEffect(() => {
    if (!loading) {
      // Ensure stats are never undefined
      setStats(prev => ({
        pending_change_requests: prev.pending_change_requests || 0,
        new_chat_logs: prev.new_chat_logs || 0,
        upcoming_appointments: prev.upcoming_appointments || 0,
        unread_emails: prev.unread_emails || 0,
      }));
    }
  }, [loading]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin overview data
      try {
        const overviewResponse = await api.get('/admin/overview');
        setOverviewData(overviewResponse);
        
        // Update stats from overview data
        if (overviewResponse) {
          setStats(prev => ({
            ...prev,
            pending_change_requests: overviewResponse.stats.total_change_requests,
            upcoming_appointments: overviewResponse.stats.total_appointments,
          }));
        }
      } catch (e) {
        console.error('Failed to fetch admin overview:', e);
        // Set default stats if overview fails
        setStats(prev => ({
          ...prev,
          pending_change_requests: 0,
          upcoming_appointments: 0,
        }));
      }

      // Fetch chat sessions
      try {
        const sessionsResponse = await api.get('/sessions');
        if (Array.isArray(sessionsResponse)) {
          const unseen = sessionsResponse.filter((l: any) => !l.is_seen);
          setChatLogs(unseen);
          setStats(prev => ({ ...prev, new_chat_logs: unseen.length }));
        }
      } catch (e) {
        console.error('Failed to fetch chat sessions:', e);
        setStats(prev => ({ ...prev, new_chat_logs: 0 }));
      }

      // Fetch unread emails
      try {
        const emailsResponse = await api.get('/emails/unread');
        if (emailsResponse && emailsResponse.emails) {
          setUnreadEmails(emailsResponse.emails);
          setStats(prev => ({ ...prev, unread_emails: emailsResponse.count || emailsResponse.emails.length }));
        }
      } catch (e) {
        console.error('Failed to fetch emails:', e);
        setStats(prev => ({ ...prev, unread_emails: 0 }));
      }

    } catch (e) {
      console.error('Admin dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const markChatLogAsSeen = async (sessionId: string) => {
    try {
      await api.patch(`/sessions/${sessionId}/seen`, { is_seen: true });
      setChatLogs((prev) => prev.filter((l) => l.session_id !== sessionId));
      setStats((prev) => ({ ...prev, new_chat_logs: Math.max(0, prev.new_chat_logs - 1) }));
    } catch (e) {
      console.error('Failed to mark chat log as seen:', e);
    }
  };

  const updateChangeRequestStatus = async (requestId: number, newStatus: string) => {
    try {
      await api.put(`/change-requests/${requestId}`, { status: newStatus });
      // Refresh data
      fetchAdminData();
    } catch (e) {
      console.error('Error updating change request:', e);
    }
  };

  const handleEditRequest = (request: any) => {
    setSelectedRequest(request);
    setShowEditModal(true);
  };

  const handleSaveRequest = async (updated: any) => {
    try {
      await api.put(`/change-requests/${updated.id}`, updated);
      fetchAdminData();
    } catch (e) {
      console.error('Error saving change request:', e);
      throw e;
    }
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleAppointmentSave = async () => {
    try {
      await fetchAdminData();
      setShowAppointmentModal(false);
      setEditingAppointment(null);
    } catch (e) {
      console.error('Error handling appointment save:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats - Original 4-square layout */}
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

        <div
          onClick={() => setShowEmailManager(true)}
          className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-white">{stats.unread_emails}</p>
              <p className="text-sm text-gray-300">Unread Emails</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Change Requests</h2>
            <span className="text-sm text-gray-400">
              {overviewData?.active_change_requests.length || 0} active
            </span>
          </div>

          <div className="space-y-3">
            {overviewData?.active_change_requests.slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleEditRequest(request)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{request.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    request.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    request.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {request.priority}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{request.customer_name}</p>
                <p className="text-gray-400 text-xs">{request.job_title}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{request.created_at}</span>
                  <span className="text-xs text-gray-500">{request.requested_via}</span>
                </div>
              </div>
            ))}
            {(!overviewData?.active_change_requests || overviewData.active_change_requests.length === 0) && (
              <p className="text-gray-400 text-center py-4">No active change requests</p>
            )}
          </div>
        </div>

        {/* Chat Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Chat Sessions</h2>
            <span className="text-sm text-gray-400">{chatLogs.length} unseen</span>
          </div>

          <div className="space-y-3">
            {chatLogs.slice(0, 3).map((chat) => (
              <div
                key={chat.id}
                className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => markChatLogAsSeen(chat.session_id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {chat.customer?.name || 'Anonymous User'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {chat.customer?.email || 'No email'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(chat.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Session: {chat.session_id.slice(0, 8)}...
                  </span>
                  <span className="text-xs text-blue-400">Click to mark as seen</span>
                </div>
              </div>
            ))}
            {chatLogs.length === 0 && (
              <p className="text-gray-400 text-center py-4">No unseen chat sessions</p>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Upcoming Appointments</h2>
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Schedule New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {overviewData?.upcoming_appointments.slice(0, 6).map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => handleEditAppointment(appointment)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">{appointment.customer_name}</h3>
                <span className="text-xs text-gray-400">
                  {appointment.duration}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                {appointment.type || 'General Meeting'}
              </p>
              <div className="text-gray-400 text-xs mb-1">
                {appointment.scheduled_time}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  appointment.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                  appointment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {appointment.status}
                </span>
                <span className="text-xs text-gray-500">{appointment.customer_email}</span>
              </div>
            </div>
          ))}
          {(!overviewData?.upcoming_appointments || overviewData.upcoming_appointments.length === 0) && (
            <p className="text-gray-400 text-center py-4 col-span-full">No upcoming appointments</p>
          )}
        </div>
      </div>

      {/* Cross-App Integration Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Cross-App Integrations</h2>
          <button
            onClick={() => setShowCrossAppModal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Manage Apps
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sample App Cards - Replace with real data */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">Slack</h3>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Connected</span>
            </div>
            <p className="text-gray-400 text-sm">Team communication & notifications</p>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span>Last sync: 2 hours ago</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">Trello</h3>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">Pending</span>
            </div>
            <p className="text-gray-400 text-sm">Project management & task tracking</p>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span>Setup required</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">Zapier</h3>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-gray-400 text-sm">Workflow automation & integrations</p>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span>15 active workflows</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">HubSpot</h3>
              <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">Inactive</span>
            </div>
            <p className="text-gray-400 text-sm">CRM & marketing automation</p>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span>Disconnected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && selectedRequest && (
        <ChangeRequestModal
          request={selectedRequest}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRequest(null);
          }}
          onSave={handleSaveRequest}
        />
      )}

      {showAppointmentModal && (
        <SmartAppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setEditingAppointment(null);
          }}
          onSave={handleAppointmentSave}
          appointment={editingAppointment}
        />
      )}

      {showEmailManager && (
        <EmailManager
          isOpen={showEmailManager}
          onClose={() => setShowEmailManager(false)}
        />
      )}

      {showCrossAppModal && (
        <CrossAppIntegrationModal
          isOpen={showCrossAppModal}
          onClose={() => setShowCrossAppModal(false)}
        />
      )}
    </div>
  );
}
