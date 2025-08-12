'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, User } from 'lucide-react';

interface ScheduleItem {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  type: 'meeting' | 'call' | 'demo' | 'follow_up';
  customer_id?: number;
  customer_name?: string;
  customer_email?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

export default function Schedule() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:8005/admin/schedule?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setScheduleItems(data);
      } else {
        console.error('Failed to fetch schedule');
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteScheduleItem = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:8005/admin/schedule/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setScheduleItems(scheduleItems.filter(item => item.id !== itemId));
      } else {
        alert('Error deleting schedule item');
      }
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      alert('Error deleting schedule item');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'call':
        return 'bg-green-100 text-green-800';
      case 'demo':
        return 'bg-purple-100 text-purple-800';
      case 'follow_up':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group items by time
  const groupedItems = scheduleItems.reduce((groups: { [key: string]: ScheduleItem[] }, item) => {
    const time = new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!groups[time]) {
      groups[time] = [];
    }
    groups[time].push(item);
    return groups;
  }, {});

  const sortedTimes = Object.keys(groupedItems).sort();

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Schedule Management</h1>
          <p className="text-gray-400 mt-1">Manage appointments and meetings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Appointment
        </button>
      </div>

      {/* Date Selector */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-cyan-400" />
          <label className="text-white font-medium">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <div className="text-gray-400 ml-4">
            {scheduleItems.length} appointment{scheduleItems.length !== 1 ? 's' : ''} scheduled
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Total Scheduled</h3>
          <div className="text-2xl font-bold text-white">{scheduleItems.length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Completed</h3>
          <div className="text-2xl font-bold text-white">
            {scheduleItems.filter(item => item.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Upcoming</h3>
          <div className="text-2xl font-bold text-white">
            {scheduleItems.filter(item => item.status === 'scheduled').length}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Cancelled</h3>
          <div className="text-2xl font-bold text-white">
            {scheduleItems.filter(item => item.status === 'cancelled').length}
          </div>
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        </div>

        {scheduleItems.length > 0 ? (
          <div className="divide-y divide-white/5">
            {sortedTimes.map((time) => (
              <div key={time} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <span className="text-cyan-400 font-medium">{time}</span>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {groupedItems[time].map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-white font-semibold">{item.title}</h3>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                                {item.type.replace('_', ' ')}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                            
                            {item.description && (
                              <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              
                              {item.customer_name && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {item.customer_name}
                                  {item.customer_email && (
                                    <span className="text-cyan-400">({item.customer_email})</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => {
                                // TODO: Edit functionality
                              }}
                              className="text-blue-400 hover:text-blue-300 p-1 rounded"
                              title="Edit Appointment"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteScheduleItem(item.id)}
                              className="text-red-400 hover:text-red-300 p-1 rounded"
                              title="Delete Appointment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400 text-lg">No appointments scheduled for this date</div>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Schedule your first appointment →
            </button>
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add New Appointment</h2>
            <div className="text-gray-400">
              Appointment creation form would go here...
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
