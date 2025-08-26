'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Video, Phone, MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/https';

interface TimeSlot {
  time: string;
  display_time: string;
  label: string;
  datetime: string;
  date: string;
  is_next_available?: boolean;
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
  success: boolean;
  next_available: TimeSlot | null;
  available_dates: DateSlot[];
  recommended_times: TimeSlot[];
  total_available_dates: number;
}

interface CustomerAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: any) => Promise<void>;
  customerId: number; // Add customer ID prop
}

export default function CustomerAppointmentModal({ isOpen, onClose, onSave, customerId }: CustomerAppointmentModalProps) {
  const [smartSlots, setSmartSlots] = useState<SmartSlotsResponse | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'recommended' | 'calendar'>('recommended');
  const [formData, setFormData] = useState({
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
      resetForm();
      fetchSmartSlots();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.duration_minutes) {
      fetchSmartSlots();
    }
  }, [formData.duration_minutes]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration_minutes: 60,
      meeting_type: 'video_call',
      status: 'scheduled',
      notes: ''
    });
    setSelectedTimeSlot(null);
    setConflictError(null);
    setError(null);
    setViewMode('recommended');
  };

  const fetchSmartSlots = async () => {
    setLoadingSlots(true);
    try {
      const params = new URLSearchParams({
        duration_minutes: formData.duration_minutes.toString(),
        days_ahead: '14'
      });

      const data: SmartSlotsResponse = await api.get(`/api/appointments/smart-slots?${params}`);
      setSmartSlots(data);
      
      // Auto-select the next available slot
      if (data.next_available && !selectedTimeSlot) {
        setSelectedTimeSlot(data.next_available);
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
    setConflictError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTimeSlot) {
      setError('Please select a recommended time slot');
      return;
    }

    setLoading(true);
    setError(null);
    setConflictError(null);

    try {
      const title = formData.title || 'Business Consultation';
      
      // Extract date and time from the selected time slot (same format as admin modal)
      const appointmentData = {
        customer_id: customerId,
        title,
        description: formData.description,
        appointment_date: selectedTimeSlot.date, // Use the date directly from the slot
        appointment_time: selectedTimeSlot.time, // Use the time directly from the slot
        duration_minutes: parseInt(formData.duration_minutes.toString()),
        meeting_type: formData.meeting_type,
        status: formData.status,
        notes: formData.notes
      };
      
      console.log('Sending appointment data:', appointmentData);

      await api.post('/appointments', appointmentData);
      await onSave(appointmentData);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Appointment creation error:', error);
      if (error.status === 409) {
        // Conflict - time slot not available
        setConflictError(error.detail?.message || error.error || 'Time slot is not available');
        // Refresh available slots
        fetchSmartSlots();
      } else {
        setError(error.error || error.detail || 'Failed to save appointment');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Schedule Your Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 bg-gray-900">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {conflictError && (
            <div className="mb-4 p-3 bg-amber-900/50 border border-amber-500 text-amber-300 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {conflictError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Appointment Duration *
              </label>
              <select
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meeting Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center p-3 bg-gray-800 border border-gray-600 rounded-md cursor-pointer hover:border-cyan-500">
                  <input
                    type="radio"
                    name="meeting_type"
                    value="video_call"
                    checked={formData.meeting_type === 'video_call'}
                    onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                    className="mr-2 text-cyan-500"
                  />
                  <Video className="w-4 h-4 mr-2 text-cyan-500" />
                  Video Call
                </label>
                <label className="flex items-center p-3 bg-gray-800 border border-gray-600 rounded-md cursor-pointer hover:border-cyan-500">
                  <input
                    type="radio"
                    name="meeting_type"
                    value="phone_call"
                    checked={formData.meeting_type === 'phone_call'}
                    onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                    className="mr-2 text-cyan-500"
                  />
                  <Phone className="w-4 h-4 mr-2 text-cyan-500" />
                  Phone Call
                </label>
                <label className="flex items-center p-3 bg-gray-800 border border-gray-600 rounded-md cursor-pointer hover:border-cyan-500">
                  <input
                    type="radio"
                    name="meeting_type"
                    value="in_person"
                    checked={formData.meeting_type === 'in_person'}
                    onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                    className="mr-2 text-cyan-500"
                  />
                  <MapPin className="w-4 h-4 mr-2 text-cyan-500" />
                  In Person
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Appointment Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Business Consultation, Project Discussion"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Brief description of what you'd like to discuss..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Smart Appointment Scheduling */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Select Date & Time</h3>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('recommended')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      viewMode === 'recommended'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Recommended
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      viewMode === 'calendar'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Calendar View
                  </button>
                </div>
              </div>

              {loadingSlots && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-gray-300 mt-2">Loading available times...</p>
                </div>
              )}

              {!loadingSlots && smartSlots && (
                <>
                  {/* Next Available Slot Highlight */}
                  {smartSlots.next_available && (
                    <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-green-300 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Next Available (Auto-Selected)
                          </h4>
                          <p className="text-green-400">
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
                              : 'bg-green-700 text-green-200 hover:bg-green-600'
                          }`}
                        >
                          {selectedTimeSlot?.datetime === smartSlots.next_available?.datetime ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* View Mode Content */}
                  {viewMode === 'recommended' && smartSlots.recommended_times.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-white">Recommended Times</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {smartSlots.recommended_times.map((timeSlot: TimeSlot, index: number) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleTimeSlotSelect(timeSlot)}
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              selectedTimeSlot?.datetime === timeSlot.datetime
                                ? 'border-cyan-500 bg-cyan-900/50'
                                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                            }`}
                          >
                            <div className="font-medium text-white">
                              {new Date(timeSlot.datetime).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-sm text-gray-300">
                              {timeSlot.display_time}
                              {timeSlot.label && ` (${timeSlot.label})`}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewMode === 'calendar' && smartSlots.available_dates.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-white">Available Dates</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {smartSlots.available_dates.map((date: DateSlot, index: number) => (
                          <div key={index} className="border border-gray-600 bg-gray-800 rounded-lg p-4">
                            <div className="mb-3">
                              <h5 className="font-medium text-white">
                                {date.formatted_date}
                                {date.is_today && <span className="ml-2 text-xs bg-cyan-600 text-white px-2 py-1 rounded">Today</span>}
                                {date.is_tomorrow && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">Tomorrow</span>}
                              </h5>
                              <p className="text-sm text-gray-300">{date.day_name} • {date.slots_count} slots available</p>
                            </div>
                            <div className="space-y-2">
                              {date.time_slots.slice(0, 6).map((timeSlot: TimeSlot, timeIndex: number) => (
                                <button
                                  key={timeIndex}
                                  type="button"
                                  onClick={() => handleTimeSlotSelect(timeSlot)}
                                  className={`w-full px-3 py-2 rounded-md text-sm text-left transition-colors ${
                                    selectedTimeSlot?.datetime === timeSlot.datetime
                                      ? 'bg-cyan-600 text-white border border-cyan-400'
                                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                  }`}
                                >
                                  {timeSlot.display_time}
                                  {timeSlot.label && ` (${timeSlot.label})`}
                                </button>
                              ))}
                              {date.slots_count > 6 && (
                                <p className="text-xs text-gray-400 text-center">
                                  +{date.slots_count - 6} more times available
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
                    <div className="bg-cyan-900/50 border border-cyan-500 rounded-lg p-4">
                      <h4 className="font-medium text-cyan-300 mb-2">✅ Selected Appointment Time</h4>
                      <p className="text-cyan-400">
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

              {!loadingSlots && (!smartSlots || (smartSlots.recommended_times.length === 0 && smartSlots.available_dates.length === 0)) && (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p>No available time slots</p>
                  <p className="text-sm">Please try a different duration or check back later</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any specific requirements, questions, or additional information..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedTimeSlot || loading}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scheduling...' : 'Schedule Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
