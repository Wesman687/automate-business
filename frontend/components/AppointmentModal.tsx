'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, Phone, MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  User, 
  Appointment,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  TimeSlot,
  AvailableDate,
  SmartSlotsResponse
} from '@/types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: AppointmentCreateRequest | AppointmentUpdateRequest) => Promise<void>;
  appointment: Appointment | null;
}

export default function AppointmentModal({ isOpen, onClose, onSave, appointment }: AppointmentModalProps) {
  const [customers, setCustomers] = useState<User[]>([]);
  const [smartSlots, setSmartSlots] = useState<SmartSlotsResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'recommended' | 'calendar'>('recommended');
  const [formData, setFormData] = useState<AppointmentCreateRequest>({
    customer_id: 0,
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
      customer_id: appointmentData.customer_id,
      title: appointmentData.title,
      description: appointmentData.description,
      duration_minutes: appointmentData.duration_minutes,
      meeting_type: appointmentData.meeting_type,
      status: appointmentData.status,
      notes: appointmentData.notes
    });

    // Set selected date and time for editing
    if (appointmentData.appointment_date && appointmentData.appointment_time) {
      setSelectedDate(appointmentData.appointment_date);
      setSelectedTime(appointmentData.appointment_time);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: 0,
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
      const response = await fetch('/api/customers');
      if (response.ok) {
        const customersData = await response.json();
        setCustomers(customersData);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchSmartSlots = async () => {
    if (!formData.duration_minutes) return;

    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/smart-slots?duration=${formData.duration_minutes}`);
      if (response.ok) {
        const slotsData = await response.json();
        setSmartSlots(slotsData);
      }
    } catch (error) {
      console.error('Error fetching smart slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.title || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const appointmentData = {
        ...formData,
        appointment_date: selectedDate,
        appointment_time: selectedTime
      };

      await onSave(appointmentData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving appointment:', error);
      setError('Failed to save appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setSelectedTimeSlot(null);
    setConflictError(null);
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    setSelectedTime(timeSlot.time);
    setSelectedTimeSlot(timeSlot);
    setConflictError(null);
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video_call':
        return Video;
      case 'phone_call':
        return Phone;
      case 'in_person':
        return MapPin;
      case 'group_meeting':
        return Users;
      default:
        return Calendar;
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    switch (type) {
      case 'video_call':
        return 'Video Call';
      case 'phone_call':
        return 'Phone Call';
      case 'in_person':
        return 'In Person';
      case 'group_meeting':
        return 'Group Meeting';
      default:
        return 'General Meeting';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {conflictError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">{conflictError}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.customer_id || ''}
                onChange={(e) => setFormData({ ...formData, customer_id: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name || customer.email} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Appointment title"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Appointment description"
            />
          </div>

          {/* Meeting Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <select
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <select
                value={formData.meeting_type}
                onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="video_call">Video Call</option>
                <option value="phone_call">Phone Call</option>
                <option value="in_person">In Person</option>
                <option value="group_meeting">Group Meeting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Smart Scheduling */}
          {!appointment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Smart Scheduling</h3>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('recommended')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
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
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      viewMode === 'calendar'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Calendar
                  </button>
                </div>
              </div>

              {viewMode === 'recommended' && smartSlots && (
                <div className="space-y-4">
                  {smartSlots.next_available && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900">Next Available Slot</h4>
                          <p className="text-blue-700">
                            {smartSlots.next_available.display_time} on {smartSlots.next_available.date}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTimeSelect(smartSlots.next_available!)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  )}

                  {smartSlots.recommended_times.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recommended Times</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {smartSlots.recommended_times.map((slot, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleTimeSelect(slot)}
                            className={`p-3 text-center rounded-lg border transition-colors ${
                              selectedTimeSlot === slot
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">{slot.display_time}</div>
                            <div className="text-sm text-gray-500">{slot.date}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {viewMode === 'calendar' && smartSlots && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {smartSlots.available_dates.map((date) => (
                      <div
                        key={date.date}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedDate === date.date
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleDateSelect(date.date)}
                      >
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{date.day_name}</div>
                          <div className="text-sm text-gray-500">{date.formatted_date}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {date.slots_count} slots available
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedDate && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Available Times for {selectedDate}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {smartSlots.available_dates
                          .find(d => d.date === selectedDate)
                          ?.time_slots.map((slot, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleTimeSelect(slot)}
                              className={`p-3 text-center rounded-lg border transition-colors ${
                                selectedTimeSlot === slot
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {slot.display_time}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual Date/Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes for the appointment"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : (appointment ? 'Update Appointment' : 'Schedule Appointment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
