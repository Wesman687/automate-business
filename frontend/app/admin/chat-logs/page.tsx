'use client';

import { useEffect, useState } from 'react';
import { Eye, Trash2, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/https';
import ErrorModal from '@/components/ErrorModal';

interface Customer {
  id: number;
  name: string;
  email: string;
  business_type?: string;
}

interface ChatSession {
  session_id: string;
  customer?: Customer;
  status: string;
  is_seen: boolean;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export default function ChatLogs() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [seenFilter, setSeenFilter] = useState('all');
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'error' | 'warning' | 'success' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  });

  useEffect(() => {
    fetchChatLogs();
  }, []);

  const fetchChatLogs = async () => {
    try {
      const response = await api.get('/sessions');

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        console.error('Failed to fetch chat logs');
      }
    } catch (error) {
      console.error('Error fetching chat logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.del(`/sessions/${sessionId}`);

      if (response.ok) {
        setSessions(sessions.filter(s => s.session_id !== sessionId));
        setErrorModal({
          isOpen: true,
          title: 'Session Deleted',
          message: 'The chat session has been successfully deleted.',
          type: 'success'
        });
      } else {
        const errorData = await response.json();
        setErrorModal({
          isOpen: true,
          title: 'Delete Failed',
          message: errorData.detail || 'Failed to delete the chat session. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setErrorModal({
        isOpen: true,
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error'
      });
    }
  };

  const toggleSeenStatus = async (sessionId: string, currentSeen: boolean) => {
    try {
      const response = await api.put(`/sessions/${sessionId}/seen`, { is_seen: !currentSeen })
      

      if (response.ok) {
        setSessions(sessions.map(s => 
          s.session_id === sessionId 
            ? { ...s, is_seen: !currentSeen }
            : s
        ));
        setErrorModal({
          isOpen: true,
          title: 'Status Updated',
          message: `Session marked as ${!currentSeen ? 'seen' : 'unseen'}.`,
          type: 'success'
        });
      } else {
        const errorData = await response.json();
        setErrorModal({
          isOpen: true,
          title: 'Update Failed',
          message: errorData.detail || 'Failed to update the seen status. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating seen status:', error);
      setErrorModal({
        isOpen: true,
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error'
      });
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchTerm || 
      session.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.session_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeen = seenFilter === 'all' || 
      (seenFilter === 'seen' && session.is_seen) ||
      (seenFilter === 'unseen' && !session.is_seen);
    
    return matchesSearch && matchesSeen;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Chat Logs</h1>
          <p className="text-gray-400 mt-1">Manage and view all customer chat sessions</p>
        </div>
        <div className="text-sm text-gray-400">
          {filteredSessions.length} of {sessions.length} sessions
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by customer name, email, or session ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            value={seenFilter}
            onChange={(e) => setSeenFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
          >
            <option value="all">All Sessions</option>
            <option value="seen">Seen</option>
            <option value="unseen">Unseen</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Total Sessions</h3>
          <div className="text-2xl font-bold text-white">{sessions.length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Unseen Sessions</h3>
          <div className="text-2xl font-bold text-white">
            {sessions.filter(s => !s.is_seen).length}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Seen Sessions</h3>
          <div className="text-2xl font-bold text-white">
            {sessions.filter(s => s.is_seen).length}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Total Messages</h3>
          <div className="text-2xl font-bold text-white">
            {sessions.reduce((sum, s) => sum + (s.message_count || 0), 0)}
          </div>
        </div>
      </div>

      {/* Chat Sessions Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-cyan-600/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Session ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Seen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSessions.map((session) => (
                <tr 
                  key={session.session_id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-cyan-400">
                      {session.session_id.slice(0, 8)}...
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {session.customer?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {session.customer ? (
                        <Link
                          href={`/admin/customers/${session.customer.id}`}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          {session.customer.email}
                        </Link>
                      ) : (
                        'No email'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {session.customer?.business_type || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleSeenStatus(session.session_id, session.is_seen)}
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                        session.is_seen
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        session.is_seen ? 'bg-green-500' : 'bg-orange-500'
                      }`} />
                      {session.is_seen ? 'Seen' : 'Unseen'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {new Date(session.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(session.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-cyan-400 font-medium">
                      {session.message_count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/chat-logs/${session.session_id}`}
                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded"
                        title="View Chat"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteSession(session.session_id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded"
                        title="Delete Session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">
              {searchTerm || seenFilter !== 'all' 
                ? 'No chat sessions match your search criteria'
                : 'No chat sessions found'
              }
            </div>
          </div>
        )}
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        type={errorModal.type}
      />
    </div>
  );
}
