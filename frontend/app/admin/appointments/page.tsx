'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Phone, MapPin, Plus, Edit, Trash2, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SmartAppointmentModal from '@/components/SmartAppointmentModal';
import { api } from '@/lib/https';

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
  created_at: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      console.log('🔍 Fetching appointments...');
      const data = await api.get('/appointments');
      console.log('📊 Appointments data:', data);
      setAppointments(data);
    } catch (error) {
      console.error('💥 Error fetching appointments:', error);
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteAppointment = async (id: number) => {
    const appointment = appointments.find(apt => apt.id === id);
    if (appointment) {
      setDeletingAppointment(appointment);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!deletingAppointment) return;

    try {
      await api.del(`/appointments/${deletingAppointment.id}`);
      setAppointments(appointments.filter(apt => apt.id !== deletingAppointment.id));
      setShowDeleteModal(false);
      setDeletingAppointment(null);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      alert('Failed to delete appointment');
    }
  };

  const handleSave = async (appointmentData: any) => {
    try {
      await fetchAppointments(); // Refresh the list
      setShowModal(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error handling save:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'No time set';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'video_call':
        return <Video className="h-4 w-4" />;
      case 'phone_call':
        return <Phone className="h-4 w-4" />;
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const today = new Date();
    const appointmentDate = new Date(appointment.appointment_date);
    
    switch (filter) {
      case 'today':
        return appointmentDate.toDateString() === today.toDateString();
      case 'upcoming':
        return appointmentDate >= today;
      case 'past':
        return appointmentDate < today;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Appointments</h1>
          <p className="text-gray-400">Manage your scheduled consultations and meetings</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Appointment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Appointments</p>
              <p className="text-2xl font-bold text-white">{appointments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-cyan-400" />
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Today</p>
              <p className="text-2xl font-bold text-white">
                {appointments.filter(apt => new Date(apt.appointment_date).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-white">
                {appointments.filter(apt => {
                  const aptDate = new Date(apt.appointment_date);
                  const today = new Date();
                  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
                  return aptDate >= weekStart && aptDate <= weekEnd;
                }).length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Scheduled</p>
              <p className="text-2xl font-bold text-white">
                {appointments.filter(apt => apt.status === 'scheduled').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-1">
        {[
          { key: 'all', label: 'All Appointments' },
          { key: 'today', label: 'Today' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-cyan-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No appointments found</h3>
            <p className="text-gray-400 mb-4">
              {filter === 'all' 
                ? "You haven't scheduled any appointments yet." 
                : `No appointments found for ${filter} filter.`}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Schedule Your First Appointment
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {appointment.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-cyan-400" />
                          <Link 
                            href={`/admin/customers/${appointment.customer_id}`}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            {appointment.customer_name}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(appointment.appointment_date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatTime(appointment.appointment_time)} ({appointment.duration_minutes} min)
                        </div>
                        <div className="flex items-center gap-2">
                          {getMeetingIcon(appointment.meeting_type)}
                          {appointment.meeting_type.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      
                      {appointment.description && (
                        <p className="text-gray-400 text-sm">{appointment.description}</p>
                      )}
                      
                      {appointment.notes && (
                        <p className="text-gray-500 text-sm italic">Note: {appointment.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingAppointment(appointment);
                        setShowModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Edit appointment"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteAppointment(appointment.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete appointment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/admin/customers/${appointment.customer_id}`}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="View customer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

             {/* Smart Appointment Modal */}
       <SmartAppointmentModal
         isOpen={showModal}
         onClose={() => {
           setShowModal(false);
           setEditingAppointment(null);
         }}
         onSave={handleSave}
         appointment={editingAppointment}
         customerId={editingAppointment?.customer_id}
         customerName={editingAppointment?.customer_name}
         customerEmail={editingAppointment?.customer_email}
       />

       {/* Delete Confirmation Modal */}
       {showDeleteModal && deletingAppointment && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
             <h3 className="text-lg font-semibold text-white mb-4">Delete Appointment</h3>
             <p className="text-gray-300 mb-6">
               Are you sure you want to delete the appointment for{' '}
               <span className="text-white font-medium">{deletingAppointment.customer_name}</span>?
               This action cannot be undone.
             </p>
             <div className="flex gap-3">
               <button
                 onClick={confirmDelete}
                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
               >
                 Delete Appointment
               </button>
               <button
                 onClick={() => {
                   setShowDeleteModal(false);
                   setDeletingAppointment(null);
                 }}
                 className="flex-1 px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
               >
                 Cancel
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
