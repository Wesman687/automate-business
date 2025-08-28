'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Calendar, Clock, MessageSquare, Mail, Link } from 'lucide-react';
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

// Adapter interfaces to match component expectations
interface ChangeRequestAdapter {
  id: number;
  customer_id: number;
  customer_name?: string;
  job_title?: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requested_via: string;
  session_id?: string;
  created_at: string;
  updated_at?: string;
}

interface ChangeRequestModalAdapter {
  id: number;
  customer_id: number;
  customer_name?: string;
  job_title?: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requested_via: string;
  session_id?: string;
  created_at: string;
  updated_at?: string;
}

interface AppointmentModalAdapter extends Appointment {
  customer_name: string;
  customer_email: string;
  title?: string;
  description?: string;
  appointment_date?: string;
  appointment_time?: string;
  meeting_type?: string;
  notes?: string;
}

interface DashboardStats {
  pending_change_requests: number;
  new_chat_logs: number;
  upcoming_appointments: number;
  unread_emails: number;
}

export default function Dashboard() {
  const [changeRequests, setChangeRequests] = useState<CustomerChangeRequest[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatSession[]>([]);
  const [unreadEmails, setUnreadEmails] = useState<EmailAccount[]>([]);
  const [showEmailManager, setShowEmailManager] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | undefined>();
  const [showCrossAppModal, setShowCrossAppModal] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    pending_change_requests: 0,
    new_chat_logs: 0,
    upcoming_appointments: 0,
    unread_emails: 0,
  });

  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CustomerChangeRequest | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to convert CustomerChangeRequest to ChangeRequestAdapter
  const adaptChangeRequest = (request: CustomerChangeRequest): ChangeRequestAdapter => ({
    id: request.id,
    customer_id: request.customer_id,
    title: request.title,
    description: request.description,
    status: request.status as 'pending' | 'in_progress' | 'completed' | 'rejected',
    priority: 'normal', // Default priority since CustomerChangeRequest doesn't have it
    requested_via: request.requested_via,
    session_id: request.session_id,
    created_at: request.created_at,
    updated_at: request.updated_at,
    customer_name: request.user?.name,
    job_title: request.job?.title
  });

  // Helper function to convert CustomerChangeRequest to ChangeRequestModalAdapter
  const adaptChangeRequestForModal = (request: CustomerChangeRequest): ChangeRequestModalAdapter => ({
    id: request.id,
    customer_id: request.customer_id,
    title: request.title,
    description: request.description,
    status: request.status as 'pending' | 'in_progress' | 'completed' | 'rejected',
    priority: 'normal', // Default priority since CustomerChangeRequest doesn't have it
    requested_via: request.requested_via,
    session_id: request.session_id,
    created_at: request.created_at,
    updated_at: request.updated_at,
    customer_name: request.user?.name,
    job_title: request.job?.title
  });

  // Helper function to convert Appointment to AppointmentModalAdapter
  const adaptAppointmentForModal = (appointment: Appointment): AppointmentModalAdapter => ({
    id: appointment.id,
    customer_id: appointment.customer_id,
    customer_name: appointment.customer?.name || 'Unknown Customer',
    customer_email: appointment.customer?.email || 'unknown@example.com',
    title: appointment.appointment_type || 'General Meeting',
    description: appointment.notes || '',
    appointment_date: appointment.scheduled_date.split('T')[0], // Extract date part
    appointment_time: appointment.scheduled_date.split('T')[1]?.split('.')[0] || '00:00:00', // Extract time part
    duration_minutes: appointment.duration_minutes,
    meeting_type: appointment.appointment_type || 'video_call',
    status: 'scheduled',
    notes: appointment.notes || ''
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewR, requestsR, appointmentsR, sessionsR, emailsR] =
        await Promise.allSettled([
          api.get<any>('/admin/overview'),
          api.get<{ change_requests: CustomerChangeRequest[] }>('/change-requests'),
          api.get<Appointment[]>('/appointments?upcoming=true'),
          api.get<ChatSession[]>('/sessions'),
          api.get<{ emails: EmailAccount[]; count?: number }>('/email/unread'),
        ]);

      // Overview / stats
      if (overviewR.status === 'fulfilled' && overviewR.value) {
        const overview = overviewR.value;
        console.log('Admin overview response:', overview); // Debug log
        
        // Map the overview stats to our expected format
        const s = {
          pending_change_requests: overview.stats?.total_change_requests || 0,
          new_chat_logs: 0, // Will be set from sessions
          upcoming_appointments: overview.stats?.total_appointments || 0,
          unread_emails: 0, // Will be set from emails
        };
        setStats((prev) => ({ ...prev, ...s }));
        
        // Use appointments from overview if available
        if (overview.upcoming_appointments && Array.isArray(overview.upcoming_appointments)) {
          // Transform the overview appointments to match our Appointment type
          const transformedAppointments = overview.upcoming_appointments.map((apt: any) => ({
            id: apt.id,
            customer_id: 0, // We don't have this in overview
            scheduled_date: new Date().toISOString(), // We'll need to parse the scheduled_time
            duration_minutes: parseInt(apt.duration) || 30,
            appointment_type: apt.type || 'General Meeting',
            status: 'confirmed' as any, // Use a valid AppointmentStatus
            notes: '',
            customer: {
              name: apt.customer_name || 'Unknown Customer',
              email: apt.customer_email || 'unknown@example.com'
            }
          }));
          setAppointments(transformedAppointments);
        }
      }

      // Change requests
      if (requestsR.status === 'fulfilled') {
        setChangeRequests(requestsR.value.change_requests || []);
      }

      // Appointments + compute upcoming count (fallback if overview doesn't have them)
      if (appointmentsR.status === 'fulfilled' && (overviewR.status !== 'fulfilled' || !overviewR.value?.upcoming_appointments)) {
        const list = Array.isArray(appointmentsR.value) ? appointmentsR.value : [];
        setAppointments(list);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingCount = list.filter((apt) => {
          try {
            const dateTimeString = apt.scheduled_date;
            const d = new Date(dateTimeString);
            return !isNaN(d.getTime()) && d >= today;
          } catch {
            return false;
          }
        }).length;

        setStats((prev) => ({ ...prev, upcoming_appointments: upcomingCount }));
      }

      // Chat logs (only unseen here)
      if (sessionsR.status === 'fulfilled') {
        const unseen = Array.isArray(sessionsR.value)
          ? sessionsR.value.filter((l) => !l.is_seen)
          : [];
        setChatLogs(unseen);
        setStats((prev) => ({ ...prev, new_chat_logs: unseen.length }));
      }

      // Emails
      if (emailsR.status === 'fulfilled') {
        setUnreadEmails(emailsR.value.emails || []);
        setStats((prev) => ({
          ...prev,
          unread_emails: emailsR.value.count ?? emailsR.value.emails?.length ?? 0,
        }));
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e);
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
      setChangeRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );
    } catch (e) {
      console.error('Error updating change request:', e);
    }
  };

  const handleEditRequest = (request: CustomerChangeRequest) => {
    setSelectedRequest(request);
    setShowEditModal(true);
  };

  const handleSaveRequest = async (updated: Partial<ChangeRequestModalAdapter>) => {
    try {
      await api.put(`/change-requests/${updated.id}`, updated);
      setChangeRequests((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    } catch (e) {
      console.error('Error saving change request:', e);
      throw e;
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleAppointmentSave = async () => {
    try {
      await fetchDashboardData();
      setShowAppointmentModal(false);
      setEditingAppointment(null);
    } catch (e) {
      console.error('Error handling appointment save:', e);
    }
  };

  const pendingRequests = changeRequests.filter((r) => r.status === 'pending');
  const inProgressRequests = changeRequests.filter((r) => r.status === 'in_progress');
  const newChatLogs = chatLogs;

  const upcomingAppointments = appointments.filter((apt) => {
    try {
      const d = new Date(apt.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(d.getTime()) && d >= today;
    } catch {
      return false;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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

        <div
          onClick={() => setShowCrossAppModal(true)}
          className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center">
            <Link className="h-8 w-8 text-orange-400" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-white">+</p>
              <p className="text-sm text-gray-300">Cross-App</p>
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
              {pendingRequests.length} pending, {inProgressRequests.length} in progress
            </span>
          </div>

          <div className="space-y-3">
            {pendingRequests.slice(0, 3).map((request) => (
              <ChangeRequestCard
                key={request.id}
                request={adaptChangeRequest(request)}
                onEdit={() => handleEditRequest(request)}
                onStatusUpdate={(requestId, status) => updateChangeRequestStatus(requestId, status)}
              />
            ))}
            {pendingRequests.length === 0 && (
              <p className="text-gray-400 text-center py-4">No pending change requests</p>
            )}
          </div>
        </div>

        {/* Chat Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Chat Sessions</h2>
            <span className="text-sm text-gray-400">{newChatLogs.length} unseen</span>
          </div>

          <div className="space-y-3">
            {newChatLogs.slice(0, 3).map((chat) => (
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
            {newChatLogs.length === 0 && (
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
          {upcomingAppointments.slice(0, 6).map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => handleEditAppointment(appointment)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">{appointment.customer?.name || 'Unknown Customer'}</h3>
                <span className="text-xs text-gray-400">
                  {appointment.duration_minutes} min
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                {appointment.appointment_type || 'General Meeting'}
              </p>
              <div className="flex items-center text-gray-400 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(appointment.scheduled_date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-gray-400 text-xs mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(appointment.scheduled_date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              {appointment.notes && (
                <p className="text-gray-500 text-xs mt-2 truncate">{appointment.notes}</p>
              )}
            </div>
          ))}
          {upcomingAppointments.length === 0 && (
            <p className="text-gray-400 text-center py-4 col-span-full">No upcoming appointments</p>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && selectedRequest && (
        <ChangeRequestModal
          request={adaptChangeRequestForModal(selectedRequest)}
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
          appointment={editingAppointment ? adaptAppointmentForModal(editingAppointment) : null}
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
