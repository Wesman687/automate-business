'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, Phone, MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface TimeSlot {
  time: string;
  display_time: string;
  label: string;
  datetime: string;
  date: string;
  is_next_available?: boolean;
}

interface AvailableDate {
  date: string;
  day_name: string;
  formatted_date: string;
  is_today: boolean;
  is_tomorrow: boolean;
  slots_count: number;
  time_slots: TimeSlot[];
}

interface SmartSlotsResponse {
  success: boolean;
  next_available: TimeSlot | null;
  available_dates: AvailableDate[];
  recommended_times: TimeSlot[];
  total_available_dates: number;
}

interface Appointment {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  title: string;
  description: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  meeting_type: string;
  status: string;
  notes: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: any) => Promise<void>;
  appointment: Appointment | null;
}

export default function AppointmentModal({ isOpen, onClose, onSave, appointment }: AppointmentModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [smartSlots, setSmartSlots] = useState<SmartSlotsResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'recommended' | 'calendar'>('recommended');
  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    description: '',
    duration_minutes: 60,
    meeting_type: 'video_call',
    status: 'scheduled',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      if (appointment) {
        populateFormData(appointment);
      } else {
        resetForm();
        fetchSmartSlots();
      }
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    if (!appointment && formData.duration_minutes) {
      fetchSmartSlots();
    }
  }, [formData.duration_minutes]);

  const populateFormData = (appointmentData: Appointment) => {
    setFormData({
      customer_id: appointmentData.customer_id.toString(),
      title: appointmentData.title,
      description: appointmentData.description || '',
      duration_minutes: appointmentData.duration_minutes,
      meeting_type: appointmentData.meeting_type,
      status: appointmentData.status,
      notes: appointmentData.notes || ''
    });
    setSelectedDate(appointmentData.appointment_date);
    setSelectedTime(appointmentData.appointment_time);
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      title: '',
      description: '',
      duration_minutes: 60,
      meeting_type: 'video_call',
      status: 'scheduled',
      notes: ''
    });
    setSelectedDate('');
    setSelectedTime('');
    setSelectedTimeSlot(null);
    setConflictError(null);
    setError(null);
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        console.error('Failed to fetch customers:', response.status);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchSmartSlots = async (preferredDate?: string) => {
    setLoadingSlots(true);
    try {
      const params = new URLSearchParams({
        duration_minutes: formData.duration_minutes.toString(),
        days_ahead: '14'
      });
      
      if (preferredDate) {
        params.append('preferred_date', preferredDate);
      }

      const response = await fetch(`/api/appointments/smart-slots?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data: SmartSlotsResponse = await response.json();
        setSmartSlots(data);
        
        // Auto-select the next available slot if no selection made
        if (!selectedTimeSlot && data.next_available && !appointment) {
          setSelectedTimeSlot(data.next_available);
          setSelectedDate(data.next_available.date);
          setSelectedTime(data.next_available.time);
        }
      } else {
        setError('Unable to load available appointment times');
      }
    } catch (error) {
      console.error('Error fetching smart slots:', error);
      setError('Error loading appointment availability');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setSelectedDate(timeSlot.date);
    setSelectedTime(timeSlot.time);
    setConflictError(null);
  };

  const handleDateSelect = (date: AvailableDate) => {
    setSelectedDate(date.date);
    if (date.time_slots.length > 0) {
      const firstSlot = date.time_slots[0];
      setSelectedTimeSlot(firstSlot);
      setSelectedTime(firstSlot.time);
    }
    setConflictError(null);
  };

  const handleSubmit = async (e: React.FormEvent, forceCreate: boolean = false) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time for the appointment');
      return;
    }

    if (!formData.customer_id) {
      setError('Please select a customer');
      return;
    }

    setLoading(true);
    setError(null);
    setConflictError(null);

    try {
      // Generate title if not provided
      const selectedCustomer = customers.find(c => c.id.toString() === formData.customer_id);
      const title = formData.title || `Consultation - ${selectedCustomer?.name || 'Customer'}`;
      
      const appointmentData = {
        ...formData,
        title,
        customer_id: parseInt(formData.customer_id),
        duration_minutes: parseInt(formData.duration_minutes.toString()),
        appointment_date: selectedDate,
        appointment_time: selectedTime
      };

      const url = appointment ? `/api/appointments/${appointment.id}` : '/api/appointments';
      const method = appointment ? 'PUT' : 'POST';
      
      // Add force parameter for conflict override
      const urlWithForce = forceCreate ? `${url}?force=true` : url;

      const response = await fetch(urlWithForce, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        await onSave(appointmentData);
        resetForm();
        onClose();
      } else if (response.status === 409) {
        // Conflict - time slot not available
        const errorData = await response.json();
        setConflictError(errorData.detail?.message || errorData.error || 'Time slot is not available');
        // Refresh available slots
        fetchSmartSlots();
        
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save appointment');
      }
    } catch (error) {
      setError('Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {conflictError && (
            <div className="mb-4 p-3 bg-amber-100 border border-amber-400 text-amber-700 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {conflictError}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer *
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Leave blank to auto-generate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate</p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            {/* Smart Appointment Scheduling */}
            {!appointment && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Select Date & Time</h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('recommended')}
                      className={`px-3 py-1 rounded-md text-sm ${
                        viewMode === 'recommended'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Recommended
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('calendar')}
                      className={`px-3 py-1 rounded-md text-sm ${
                        viewMode === 'calendar'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Calendar View
                    </button>
                  </div>
                </div>

                {loadingSlots && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading available times...</p>
                  </div>
                )}

                {!loadingSlots && smartSlots && (
                  <>
                    {/* Next Available Slot Highlight */}
                    {smartSlots.next_available && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-green-800 flex items-center">
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Next Available
                            </h4>
                            <p className="text-green-700">
                              {new Date(smartSlots.next_available.datetime).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} at {smartSlots.next_available.display_time}
                              {smartSlots.next_available.label && ` (${smartSlots.next_available.label})`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTimeSlotSelect(smartSlots.next_available!)}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                              selectedTimeSlot?.datetime === smartSlots.next_available?.datetime
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {selectedTimeSlot?.datetime === smartSlots.next_available?.datetime ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* View Mode Content */}
                    {viewMode === 'recommended' && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Recommended Times</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {smartSlots.recommended_times.map((timeSlot, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleTimeSlotSelect(timeSlot)}
                              className={`p-3 rounded-lg border text-left transition-colors ${
                                selectedTimeSlot?.datetime === timeSlot.datetime
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium text-gray-900">
                                {new Date(timeSlot.datetime).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-sm text-gray-600">
                                {timeSlot.display_time}
                                {timeSlot.label && ` (${timeSlot.label})`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {viewMode === 'calendar' && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Available Dates</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {smartSlots.available_dates.map((date, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="mb-3">
                                <h5 className="font-medium text-gray-900">
                                  {date.formatted_date}
                                  {date.is_today && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Today</span>}
                                  {date.is_tomorrow && <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Tomorrow</span>}
                                </h5>
                                <p className="text-sm text-gray-600">{date.day_name} • {date.slots_count} slots available</p>
                              </div>
                              <div className="space-y-2">
                                {date.time_slots.slice(0, 4).map((timeSlot, timeIndex) => (
                                  <button
                                    key={timeIndex}
                                    type="button"
                                    onClick={() => handleTimeSlotSelect(timeSlot)}
                                    className={`w-full px-3 py-2 rounded-md text-sm text-left transition-colors ${
                                      selectedTimeSlot?.datetime === timeSlot.datetime
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                                  >
                                    {timeSlot.display_time}
                                    {timeSlot.label && ` (${timeSlot.label})`}
                                  </button>
                                ))}
                                {date.time_slots.length > 4 && (
                                  <p className="text-xs text-gray-500 text-center">
                                    +{date.time_slots.length - 4} more available
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selected Time Display */}
                    {selectedTimeSlot && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">Selected Appointment Time</h4>
                        <p className="text-blue-700">
                          {new Date(selectedTimeSlot.datetime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} at {selectedTimeSlot.display_time}
                          {selectedTimeSlot.label && ` (${selectedTimeSlot.label})`}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {!loadingSlots && smartSlots && smartSlots.available_dates.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Slots</h3>
                    <p className="text-gray-600 mb-4">
                      No available appointment slots found for the next 14 days.
                    </p>
                    <button
                      type="button"
                      onClick={() => fetchSmartSlots()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Refresh Availability
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Manual Date/Time for Editing */}
            {appointment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <select
                value={formData.meeting_type}
                onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="video_call">📹 Video Call</option>
                <option value="phone_call">📞 Phone Call</option>
                <option value="in_person">👥 In Person</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes for this appointment..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || (!appointment && (!selectedDate || !selectedTime))}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : appointment ? 'Update Appointment' : 'Schedule Appointment'}
              </button>

              {conflictError && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any, true)}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Force Create Appointment'}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
