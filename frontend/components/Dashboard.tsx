'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Calendar, Clock, MessageSquare, Mail } from 'lucide-react';
import ChangeRequestCard from './ChangeRequestCard';
import ChangeRequestModal from './ChangeRequestModal';
import SmartAppointmentModal from './SmartAppointmentModal';
import EmailManager from './EmailManager';
import { api } from '@/lib/https'; // ⬅️ use the shared API helper

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
  appointment_date: string; // 'YYYY-MM-DD'
  appointment_time: string; // 'HH:MM:SS'
  duration_minutes: number;
  meeting_type: string;
  status: string;
  notes: string;
  created_at: string;
}

interface ChatLog {
  id: number;
  session_id: string;
  customer?: { id: number | null; name: string; email: string };
  status: string;
  is_seen: boolean;
  created_at: string;
  updated_at: string | null;
  message_count: number;
  latest_message?: { text: string; timestamp: string; is_bot: boolean } | null;
}

interface DashboardStats {
  pending_change_requests: number;
  new_chat_logs: number;
  upcoming_appointments: number;
  unread_emails: number;
}

export default function Dashboard() {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [unreadEmails, setUnreadEmails] = useState<any[]>([]);
  const [showEmailManager, setShowEmailManager] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | undefined>();

  const [stats, setStats] = useState<DashboardStats>({
    pending_change_requests: 0,
    new_chat_logs: 0,
    upcoming_appointments: 0,
    unread_emails: 0,
  });

  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewR, requestsR, appointmentsR, sessionsR, emailsR] =
        await Promise.allSettled([
          api.get<any>('/overview'),
          api.get<{ change_requests: ChangeRequest[] }>('/change-requests'),
          api.get<Appointment[]>('/appointments?upcoming=true'),
          api.get<ChatLog[]>('/sessions'),
          api.get<{ emails: any[]; count?: number }>('/email/unread'),
        ]);

      // Overview / stats
      if (overviewR.status === 'fulfilled' && overviewR.value) {
        const s =
          overviewR.value.stats ?? {
            pending_change_requests: 0,
            new_chat_logs: 0,
            upcoming_appointments: 0,
            unread_emails: 0,
          };
        setStats((prev) => ({ ...prev, ...s }));
      }

      // Change requests
      if (requestsR.status === 'fulfilled') {
        setChangeRequests(requestsR.value.change_requests || []);
      }

      // Appointments + compute upcoming count
      if (appointmentsR.status === 'fulfilled') {
        const list = Array.isArray(appointmentsR.value) ? appointmentsR.value : [];
        setAppointments(list);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingCount = list.filter((apt) => {
          try {
            const dateTimeString = apt.appointment_time
              ? `${apt.appointment_date}T${apt.appointment_time}`
              : `${apt.appointment_date}T00:00:00`;
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
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus as any } : r))
      );
    } catch (e) {
      console.error('Error updating change request:', e);
    }
  };

  const handleEditRequest = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setShowEditModal(true);
  };

  const handleSaveRequest = async (updated: Partial<ChangeRequest>) => {
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

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${appointmentId}`, { status: 'cancelled' });
      await fetchDashboardData();
    } catch (e) {
      console.error('Error canceling appointment:', e);
      alert('Failed to cancel appointment');
    }
  };

  const pendingRequests = changeRequests.filter((r) => r.status === 'pending');
  const inProgressRequests = changeRequests.filter((r) => r.status === 'in_progress');
  const newChatLogs = chatLogs;

  const upcomingAppointments = appointments.filter((apt) => {
    try {
      const dateTimeString = apt.appointment_time
        ? `${apt.appointment_date}T${apt.appointment_time}`
        : `${apt.appointment_date}T00:00:00`;
      const d = new Date(dateTimeString);
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

      {/* Pending Change Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              pendingRequests.map((req) => (
                <ChangeRequestCard
                  key={req.id}
                  request={req}
                  showJobInfo
                  onStatusUpdate={updateChangeRequestStatus}
                  onEdit={handleEditRequest}
                />
              ))
            )}
          </div>
        </div>

        {/* Unseen Chat Logs */}
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
              newChatLogs.map((log) => (
                <div key={log.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-white">{log.customer?.name || 'Anonymous'}</h3>
                      <p className="text-sm text-gray-300">{log.customer?.email || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {new Date(log.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-gray-400">{log.message_count} messages</p>
                    </div>
                  </div>
                  {log.latest_message && (
                    <p className="text-sm text-gray-300 truncate mb-2">{log.latest_message.text}</p>
                  )}
                  <div className="mt-2 flex justify-between items-center">
                    <button
                      onClick={() => markChatLogAsSeen(log.session_id)}
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

      {/* Upcoming Appointments & Unread Emails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments */}
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
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-white">{apt.customer_name}</h3>
                      <p className="text-sm text-gray-300">{apt.meeting_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {(() => {
                          try {
                            const s = apt.appointment_time
                              ? `${apt.appointment_date}T${apt.appointment_time}`
                              : `${apt.appointment_date}T00:00:00`;
                            const d = new Date(s);
                            return isNaN(d.getTime())
                              ? 'Invalid Date'
                              : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          } catch {
                            return 'Invalid Date';
                          }
                        })()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(() => {
                          try {
                            const s = apt.appointment_time
                              ? `${apt.appointment_date}T${apt.appointment_time}`
                              : `${apt.appointment_date}T00:00:00`;
                            const d = new Date(s);
                            return isNaN(d.getTime())
                              ? 'Invalid Time'
                              : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                          } catch {
                            return 'Invalid Time';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        apt.status === 'confirmed'
                          ? 'bg-green-400/20 text-green-300'
                          : 'bg-yellow-400/20 text-yellow-300'
                      }`}
                    >
                      {apt.status}
                    </span>
                    <span className="text-xs text-gray-400">{apt.duration_minutes} min</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEditAppointment(apt)}
                      className="text-xs bg-blue-600/80 hover:bg-blue-600 text-white px-6 py-1 rounded text-center font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(apt.id)}
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
            <div className="flex items-center space-x-3">
              <span className="bg-purple-400/20 text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {unreadEmails.length}
              </span>
              <button
                onClick={() => setShowEmailManager(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                <span>Email Manager</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {unreadEmails.length === 0 ? (
              <p className="text-gray-400 text-sm">No unread emails</p>
            ) : (
              unreadEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedEmailId(email.id);
                    setShowEmailManager(true);
                  }}
                  className="border border-white/10 rounded-lg p-4 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                >
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
                          day: 'numeric',
                        })}
                      </p>
                      <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">
                        {email.account}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 truncate mb-2">{email.preview}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* In Progress */}
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
            {inProgressRequests.map((req) => (
              <ChangeRequestCard
                key={req.id}
                request={req}
                showJobInfo
                onStatusUpdate={updateChangeRequestStatus}
                onEdit={handleEditRequest}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ChangeRequestModal
        request={selectedRequest}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRequest(null);
        }}
        onSave={handleSaveRequest}
      />

      <SmartAppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => {
          setShowAppointmentModal(false);
          setEditingAppointment(null);
        }}
        onSave={handleAppointmentSave}
        appointment={editingAppointment}
      />

      {/* Email Manager */}
      {showEmailManager && (
        <EmailManager
          selectedEmailId={selectedEmailId}
          onClose={() => {
            setShowEmailManager(false);
            setSelectedEmailId(undefined);
          }}
        />
      )}
    </div>
  );
}
