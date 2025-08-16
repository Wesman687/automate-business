'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, Phone, Mail, MapPin, Building2, Globe, LogOut, Edit, Save, X, Plus } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import EditCustomerModal from '@/components/EditCustomerModal';

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
  date: string;
  time: string;
  status: string;
  notes?: string;
}

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCustomerData();
    fetchAppointments();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setCustomer(userData.user);
      } else {
        // Not authenticated, redirect to portal
        router.push('/portal');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setError('Failed to load customer data');
    }
  };

  const fetchAppointments = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/appointments/customer`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const appointmentData = await response.json();
        setAppointments(appointmentData);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async (updatedData: Partial<Customer>, passwordData?: { password: string }) => {
    if (!customer) return;
    
    try {
      // If password change is requested, handle it separately first
      if (passwordData?.password) {
        const apiUrl = getApiUrl();
        const passwordResponse = await fetch(`${apiUrl}/api/customers/${customer.id}/set-password`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: passwordData.password })
        });

        if (!passwordResponse.ok) {
          setError('Failed to update password');
          return;
        }
      }

      // Update customer data
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/customers/${customer.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        setCustomer(updatedCustomer);
        setIsEditModalOpen(false);
      } else {
        setError('Failed to update information');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      setError('Failed to update information');
    }
  };

  const handleLogout = async () => {
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  const scheduleAppointment = () => {
    setShowScheduleModal(true);
    setSelectedDate('');
    setSelectedTime('');
    setAppointmentNotes('');
    setAvailableSlots([]);
  };

  const fetchAvailableSlots = async (date: string) => {
    if (!date) return;
    
    setSchedulingLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/appointments/available-slots?date=${date}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const slots = await response.json();
        setAvailableSlots(slots);
      } else {
        setError('Failed to fetch available time slots');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Failed to fetch available time slots');
    } finally {
      setSchedulingLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (date) {
      fetchAvailableSlots(date);
    } else {
      setAvailableSlots([]);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    setSchedulingLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/appointments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          notes: appointmentNotes,
        }),
      });

      if (response.ok) {
        setShowScheduleModal(false);
        fetchAppointments(); // Refresh appointments
        setError('');
        // You might want to show a success message here
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      setError('Failed to schedule appointment');
    } finally {
      setSchedulingLoading(false);
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
                  className="w-full flex items-center gap-3 bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue px-4 py-3 rounded-lg transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                  Schedule Appointment
                </button>
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
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-electric-blue" />
                        <span className="text-white">{appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Clock className="h-4 w-4 text-neon-green" />
                        <span className="text-white">{appointment.time}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          appointment.status === 'confirmed' 
                            ? 'bg-neon-green/20 text-neon-green' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No upcoming appointments</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-card p-6 rounded-xl border border-dark-border w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Schedule Appointment</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
                />
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Available Time Slots
                  </label>
                  {schedulingLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-electric-blue mx-auto"></div>
                      <p className="text-gray-400 text-sm mt-2">Loading available slots...</p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedTime === slot
                              ? 'bg-electric-blue text-white'
                              : 'bg-dark-bg border border-dark-border text-gray-300 hover:border-electric-blue'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No available slots for this date</p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  rows={3}
                  placeholder="Any additional information or specific requirements..."
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleSubmit}
                  disabled={!selectedDate || !selectedTime || schedulingLoading}
                  className="flex-1 px-4 py-2 bg-electric-blue hover:bg-electric-blue/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {schedulingLoading ? 'Scheduling...' : 'Schedule'}
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
    </div>
  );
}
