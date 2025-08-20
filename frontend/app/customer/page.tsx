'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, Phone, Mail, MapPin, Building2, Globe, LogOut, Edit, Save, X, Plus, Trash2, CheckCircle } from 'lucide-react';

import EditCustomerModal from '@/components/EditCustomerModal';
import CustomerAppointmentModal from '@/components/CustomerAppointmentModal';
import ErrorModal from '@/components/ErrorModal';
import DeleteModal from '@/components/DeleteModal';
import { api } from '@/lib/https';
import { useAuth } from '@/hooks/useAuth';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  business_site?: string;
  business_type?: string;
  notes?: string;
  status: string;
}

interface Appointment {
  id: number;
  appointment_date?: string;
  appointment_time?: string;
  scheduled_date?: string; // Backend might return this instead
  status: string;
  title?: string;
  description?: string;
  duration_minutes?: number;
  meeting_type?: string;
  notes?: string;
}

interface TimeSlot {
  datetime: string;
  date: string;
  time: string;
  display_time: string;
  label?: string;
}

interface DateSlot {
  formatted_date: string;
  day_name: string;
  is_today: boolean;
  is_tomorrow: boolean;
  slots_count: number;
  time_slots: TimeSlot[];
}

interface SmartSlotsResponse {
  recommended_times: TimeSlot[];
  available_dates: DateSlot[];
  next_available?: TimeSlot;
}

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleViewMode, setRescheduleViewMode] = useState<'recommended' | 'calendar'>('recommended');
  const [rescheduleSmartSlots, setRescheduleSmartSlots] = useState<SmartSlotsResponse | null>(null);
  const [rescheduleLoadingSlots, setRescheduleLoadingSlots] = useState(false);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState<TimeSlot | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    fetchCustomerData();
  }, []);

  // Fetch appointments when user is available
  useEffect(() => {
    if (user?.user_id) {
      fetchAppointments();
    }
  }, [user]);

  // Fetch reschedule slots when reschedule modal opens
  useEffect(() => {
    if (showRescheduleModal && editingAppointment) {
      fetchRescheduleSlots();
    }
  }, [showRescheduleModal, editingAppointment]);

  const fetchCustomerData = async () => {
    try {
      if (!user) {
        router.push('/portal');
        return;
      }
      console.log('Fetching customer data for user:', user);
      
      // Use user_id for customer lookup to match JWT token
      const userData = await api.get(`/api/customers/${user.user_id}`);

      
      if (userData) {
        setCustomer(userData);
        console.log('Customer set successfully');
      } else {
        console.error('No customer data in response:', userData);
        setError('Invalid customer data received');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setError(`Failed to load customer data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      if (!user?.user_id) return; // Use user ID from JWT token
      const appointmentData = await api.get(`/api/appointments/customer?customer_id=${user.user_id}`);
      console.log('Appointments data from backend:', appointmentData);
      console.log('Individual appointments:', appointmentData.appointments);
      if (appointmentData.appointments && appointmentData.appointments.length > 0) {
        console.log('First appointment structure:', appointmentData.appointments[0]);
      }
      setAppointments(appointmentData.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async (updatedData: Partial<Customer>, passwordData?: { password: string }) => {
    if (!customer || !user) return;
    
    try {
      // If password change is requested, handle it separately first
      if (passwordData?.password) {
        // Use user.user_id for password updates to match the JWT token
        await api.post(`/customers/${user.user_id}/set-password`, { password: passwordData.password });
      }

      // Update customer data using user.user_id to match the JWT token
      const updatedCustomer = await api.put(`/customers/${user.user_id}`, updatedData);
      setCustomer(updatedCustomer);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating customer:', error);
      setError('Failed to update information');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  const scheduleAppointment = () => {
    setShowScheduleModal(true);
  };

  const hasScheduledAppointment = () => {
    return appointments.some(apt => apt.status === 'scheduled');
  };

  const editAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowEditAppointmentModal(true);
  };

  const handleUpdateAppointment = async (updatedData: Partial<Appointment>) => {
    if (!editingAppointment) return;
    
    try {
      await api.put(`/api/appointments/${editingAppointment.id}`, updatedData);
      await fetchAppointments(); // Refresh the list
      setShowEditAppointmentModal(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment');
    }
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
      await api.del(`/api/appointments/${deletingAppointment.id}`);
      setSuccess('Appointment deleted successfully');
      
      await fetchAppointments(); // Refresh the list
      setError(''); // Clear any previous errors
      setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Failed to delete appointment');
    } finally {
      setShowDeleteModal(false);
      setDeletingAppointment(null);
      setIsDeleting(false);
    }
  };

  const fetchRescheduleSlots = async () => {
    if (!editingAppointment) return;
    
    setRescheduleLoadingSlots(true);
    try {
      const params = new URLSearchParams({
        duration_minutes: (editingAppointment.duration_minutes || 60).toString(),
        days_ahead: '14'
      });

      const data: SmartSlotsResponse = await api.get(`/api/appointments/smart-slots?${params}`);
      setRescheduleSmartSlots(data);
      
      // Auto-select the next available slot
      if (data.next_available && !selectedRescheduleSlot) {
        setSelectedRescheduleSlot(data.next_available);
      }
    } catch (error) {
      console.error('Error fetching reschedule slots:', error);
      setError('Error loading available time slots');
    } finally {
      setRescheduleLoadingSlots(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedRescheduleSlot || !editingAppointment) return;
    
    try {
      // Update the appointment with new date/time
      const updatedData = {
        ...editingAppointment,
        appointment_date: selectedRescheduleSlot.date,
        appointment_time: selectedRescheduleSlot.time
      };
      
      await api.put(`/api/appointments/${editingAppointment.id}`, updatedData);
      await fetchAppointments(); // Refresh the list
      setShowRescheduleModal(false);
      setShowEditAppointmentModal(false);
      setEditingAppointment(null);
      setSelectedRescheduleSlot(null);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setError('Failed to reschedule appointment');
    }
  };

  const handleScheduleSubmit = async (appointmentData: any) => {
    try {
      // The modal already handles the API call, so we just need to refresh appointments
      await fetchAppointments();
      setError('');
      // You might want to show a success message here
    } catch (error) {
      console.error('Error refreshing appointments:', error);
      setError('Appointment scheduled but failed to refresh list');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load customer data</p>
          <button 
            onClick={() => router.push('/portal')}
            className="mt-4 text-electric-blue hover:text-electric-blue/80"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">
                <span className="text-electric-blue">⚡</span>
                <span className="text-white">Streamline</span>
                <span className="text-neon-green">AI</span>
              </h1>
              <span className="text-gray-400">|</span>
              <h2 className="text-xl text-white">Customer Dashboard</h2>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2">
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Your Information</h3>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="inline h-4 w-4 mr-2" />
                      Full Name
                    </label>
                    <p className="text-white">{customer.name || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Email
                    </label>
                    <p className="text-white">{customer.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Phone className="inline h-4 w-4 mr-2" />
                      Phone
                    </label>
                    <p className="text-white">{customer.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Building2 className="inline h-4 w-4 mr-2" />
                      Company
                    </label>
                    <p className="text-white">{customer.business_type || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="inline h-4 w-4 mr-2" />
                      Address
                    </label>
                    <p className="text-white">{customer.address || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Globe className="inline h-4 w-4 mr-2" />
                      Business Website
                    </label>
                    <p className="text-white">
                      {customer.business_site ? (
                        <a 
                          href={customer.business_site} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-electric-blue hover:text-electric-blue/80"
                        >
                          {customer.business_site}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Type
                    </label>
                    <p className="text-white">{customer.business_type || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Appointments */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={scheduleAppointment}
                  disabled={hasScheduledAppointment()}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    hasScheduledAppointment()
                      ? 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                      : 'bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  {hasScheduledAppointment() 
                    ? 'Appointment Already Scheduled' 
                    : 'Schedule Appointment'
                  }
                </button>
                {hasScheduledAppointment() && (
                  <p className="text-xs text-gray-400 text-center">
                    You can only have one appointment at a time. Delete your current appointment to schedule a new one.
                  </p>
                )}
                <button
                  onClick={() => window.open('#', '_blank')}
                  className="w-full flex items-center gap-3 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-4 py-3 rounded-lg transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  Contact Support
                </button>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Appointments</h3>
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="bg-dark-bg p-3 rounded-lg border border-dark-border">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-electric-blue" />
                            <span className="text-white">
                              {appointment.scheduled_date ? 
                                new Date(appointment.scheduled_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                }) : appointment.appointment_date ? 
                                new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                }) : 'Date not set'
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <Clock className="h-4 w-4 text-neon-green" />
                            <span className="text-white">
                              {appointment.scheduled_date ? 
                                new Date(appointment.scheduled_date).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                }) : appointment.appointment_time ? 
                                new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                }) : 'Time not set'
                              }
                            </span>
                          </div>
                          {appointment.title && (
                            <div className="mt-2 text-sm text-gray-300">
                              {appointment.title}
                            </div>
                          )}
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              appointment.status === 'confirmed' 
                                ? 'bg-neon-green/20 text-neon-green' 
                                : appointment.status === 'scheduled'
                                ? 'bg-electric-blue/20 text-electric-blue'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-3">
                          <button
                            onClick={() => editAppointment(appointment)}
                            className="p-2 text-electric-blue hover:bg-electric-blue/10 rounded-lg transition-colors"
                            title="Edit appointment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteAppointment(appointment.id)}
                            className="p-2 text-red-600 hover:bg-red-600/10 rounded-lg transition-colors"
                            title="Delete appointment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {appointments.length > 3 && (
                    <div className="text-center pt-2">
                      <span className="text-xs text-gray-400">
                        +{appointments.length - 3} more appointments
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No upcoming appointments</p>
                  <p className="text-gray-500 text-xs mt-1">Schedule your first appointment to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Appointment Modal */}
      <CustomerAppointmentModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSave={handleScheduleSubmit}
        customerId={user?.user_id || 0}
      />

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card p-6 rounded-xl border border-dark-border w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Appointment</h3>
              <button
                onClick={() => setShowEditAppointmentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
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

              {/* Reschedule Section */}
              <div className="border-t border-gray-600 pt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Reschedule Appointment</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowRescheduleModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue px-4 py-2 rounded-lg transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    Pick New Time Slot
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    Current: {editingAppointment.scheduled_date ? 
                      new Date(editingAppointment.scheduled_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Date not set'
                    } at {editingAppointment.scheduled_date ? 
                      new Date(editingAppointment.scheduled_date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }) : 'Time not set'
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditAppointmentModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateAppointment(editingAppointment)}
                  className="flex-1 px-4 py-2 bg-electric-blue hover:bg-electric-blue/80 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card p-6 rounded-xl border border-dark-border w-full max-w-4xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Reschedule Appointment</h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Select a new time slot for your appointment. The current appointment will be updated with the new time.
              </p>
              
              {/* Current Appointment Info */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Current Appointment</h4>
                <div className="text-white text-sm">
                  <div><strong>Title:</strong> {editingAppointment.title || 'Untitled'}</div>
                  <div><strong>Date:</strong> {editingAppointment.scheduled_date ? 
                    new Date(editingAppointment.scheduled_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Date not set'
                  }</div>
                  <div><strong>Time:</strong> {editingAppointment.scheduled_date ? 
                    new Date(editingAppointment.scheduled_date).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }) : 'Time not set'
                  }</div>
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select New Time Slot
                </label>
                
                {/* Duration Selection */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Appointment Duration
                  </label>
                  <select
                    value={editingAppointment.duration_minutes || 60}
                    onChange={(e) => setEditingAppointment({
                      ...editingAppointment,
                      duration_minutes: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-300">Available Time Slots</h4>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setRescheduleViewMode('recommended')}
                      className={`px-3 py-1 rounded-md text-xs ${
                        rescheduleViewMode === 'recommended'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Recommended
                    </button>
                    <button
                      type="button"
                      onClick={() => setRescheduleViewMode('calendar')}
                      className={`px-3 py-1 rounded-md text-xs ${
                        rescheduleViewMode === 'calendar'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Calendar View
                    </button>
                  </div>
                </div>

                {/* Loading State */}
                {rescheduleLoadingSlots && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-gray-400 text-sm">Loading available time slots...</p>
                  </div>
                )}

                {/* Time Slots Display */}
                {!rescheduleLoadingSlots && rescheduleSmartSlots && (
                  <>
                    {/* Next Available Slot Highlight */}
                    {rescheduleSmartSlots.next_available && (
                      <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-green-300 flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Next Available (Recommended)
                            </h4>
                            <p className="text-green-400 text-sm">
                              {new Date(rescheduleSmartSlots.next_available.datetime).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })} at {rescheduleSmartSlots.next_available.display_time}
                              {rescheduleSmartSlots.next_available.label && ` (${rescheduleSmartSlots.next_available.label})`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedRescheduleSlot(rescheduleSmartSlots.next_available!)}
                            className={`px-3 py-1 rounded-md text-xs font-medium ${
                              selectedRescheduleSlot?.datetime === rescheduleSmartSlots.next_available?.datetime
                                ? 'bg-green-600 text-white'
                                : 'bg-green-700 text-green-200 hover:bg-green-600'
                            }`}
                          >
                            {selectedRescheduleSlot?.datetime === rescheduleSmartSlots.next_available?.datetime ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* View Mode Content */}
                    {rescheduleViewMode === 'recommended' && rescheduleSmartSlots.recommended_times.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-white text-sm">Recommended Times</h5>
                        <div className="max-h-96 overflow-y-auto pr-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {rescheduleSmartSlots.recommended_times.map((timeSlot: TimeSlot, index: number) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setSelectedRescheduleSlot(timeSlot)}
                                className={`p-3 rounded-lg border text-left transition-colors ${
                                  selectedRescheduleSlot?.datetime === timeSlot.datetime
                                    ? 'border-cyan-500 bg-cyan-900/50'
                                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                                }`}
                              >
                                <div className="font-medium text-white text-sm">
                                  {new Date(timeSlot.datetime).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="text-xs text-gray-300">
                                  {timeSlot.display_time}
                                  {timeSlot.label && ` (${timeSlot.label})`}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {rescheduleViewMode === 'calendar' && rescheduleSmartSlots.available_dates.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-white text-sm">Available Dates</h5>
                        <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {rescheduleSmartSlots.available_dates.map((date: DateSlot, index: number) => (
                              <div key={index} className="border border-gray-600 bg-gray-800 rounded-lg p-3">
                                <div className="mb-2">
                                  <h6 className="font-medium text-white text-sm">
                                    {date.formatted_date}
                                    {date.is_today && <span className="ml-2 text-xs bg-cyan-600 text-white px-2 py-1 rounded">Today</span>}
                                    {date.is_tomorrow && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">Tomorrow</span>}
                                  </h6>
                                  <p className="text-xs text-gray-300">{date.day_name} • {date.slots_count} slots available</p>
                                </div>
                                <div className="space-y-1">
                                  {date.time_slots.slice(0, 4).map((timeSlot: TimeSlot, timeIndex: number) => (
                                    <button
                                      key={timeIndex}
                                      type="button"
                                      onClick={() => setSelectedRescheduleSlot(timeSlot)}
                                      className={`w-full px-2 py-1 rounded-md text-xs text-left transition-colors ${
                                        selectedRescheduleSlot?.datetime === timeSlot.datetime
                                          ? 'bg-cyan-600 text-white border border-cyan-400'
                                          : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                      }`}
                                    >
                                      {timeSlot.display_time}
                                      {timeSlot.label && ` (${timeSlot.label})`}
                                    </button>
                                  ))}
                                  {date.slots_count > 4 && (
                                    <p className="text-xs text-gray-400 text-center">
                                      +{date.slots_count - 4} more times available
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selected Time Display */}
                    {selectedRescheduleSlot && (
                      <div className="bg-cyan-900/50 border border-cyan-500 rounded-lg p-4">
                        <h4 className="font-medium text-cyan-300 mb-2 text-sm">✅ New Appointment Time</h4>
                        <p className="text-cyan-400 text-sm">
                          {new Date(selectedRescheduleSlot.datetime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} at {selectedRescheduleSlot.display_time}
                          {selectedRescheduleSlot.label && ` (${selectedRescheduleSlot.label})`}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* No Slots Available */}
                {!rescheduleLoadingSlots && (!rescheduleSmartSlots || (rescheduleSmartSlots.recommended_times.length === 0 && rescheduleSmartSlots.available_dates.length === 0)) && (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-sm">No available time slots</p>
                    <p className="text-xs mt-1">Please try a different duration or check back later</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={!selectedRescheduleSlot}
                  className="flex-1 px-4 py-2 bg-electric-blue hover:bg-electric-blue/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {customer && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customer={customer}
          onSave={handleUpdateCustomer}
        />
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
    </div>
  );
}
