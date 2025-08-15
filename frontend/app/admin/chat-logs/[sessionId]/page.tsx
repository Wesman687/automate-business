'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Bot, Clock } from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  business_type?: string;
  status: string;
  created_at: string;
}

interface Message {
  id: number;
  text: string;
  is_bot: boolean;
  timestamp: string;
}

interface Session {
  session_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer_id?: number;
}

interface ChatLogData {
  session: Session;
  customer?: Customer;
  messages: Message[];
}

export default function ChatLogView() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [data, setData] = useState<ChatLogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchChatLog();
    }
  }, [sessionId]);

  const fetchChatLog = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Fetch session data
      const sessionResponse = await fetch(`/api/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      if (!sessionResponse.ok) {
        throw new Error('Session not found');
      }

      const session = await sessionResponse.json();
      
      // Fetch customer data if available
      let customer = null;
      if (session.customer_id) {
        const customerResponse = await fetch(`/api/customers/${session.customer_id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        if (customerResponse.ok) {
          customer = await customerResponse.json();
        }
      }

      // Fetch messages - need to create API route for this
      const messagesResponse = await fetch(`/api/sessions/${sessionId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      
      const messages = messagesResponse.ok ? await messagesResponse.json() : [];

      setData({ session, customer, messages });
    } catch (error) {
      console.error('Error fetching chat log:', error);
      setError(error instanceof Error ? error.message : 'Failed to load chat log');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-lg font-semibold">Error Loading Chat Log</div>
        <div className="text-gray-400 mt-2">{error || 'Chat log not found'}</div>
        <Link 
          href="/admin/chat-logs"
          className="inline-flex items-center mt-4 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Chat Logs
        </Link>
      </div>
    );
  }

  const { session, customer, messages } = data;
  
  const totalMessages = messages.length;
  const userMessages = messages.filter(m => !m.is_bot).length;
  const botMessages = messages.filter(m => m.is_bot).length;
  const engagementRate = totalMessages > 0 ? Math.round((userMessages / totalMessages) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/chat-logs"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-cyan-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Chat Log Analysis</h1>
          <p className="text-gray-400">Session: {sessionId}</p>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📊 Session Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-400">Session ID</div>
            <div className="text-white font-mono">{session.session_id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Status</div>
            <div className="text-white capitalize">{session.status.replace('_', ' ')}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Created</div>
            <div className="text-white">{new Date(session.created_at).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Last Updated</div>
            <div className="text-white">{new Date(session.updated_at).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      {customer ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 border-l-4 border-l-green-400">
            <h3 className="text-lg font-semibold text-green-400 mb-3">👤 Customer</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Name:</span>
                <span className="text-white ml-2">{customer.name || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <Link 
                  href={`/admin/customers/${customer.id}`}
                  className="text-cyan-400 hover:text-cyan-300 ml-2"
                >
                  {customer.email}
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 border-l-4 border-l-blue-400">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">🏢 Business</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Company:</span>
                <span className="text-white ml-2">{customer.business_type || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-gray-400">Phone:</span>
                <span className="text-white ml-2">{customer.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 border-l-4 border-l-yellow-400">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">📈 Lead Status</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Status:</span>
                <span className="text-white ml-2 capitalize">{customer.status}</span>
              </div>
              <div>
                <span className="text-gray-400">Lead Date:</span>
                <span className="text-white ml-2">{new Date(customer.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ No Customer Information</h3>
          <p className="text-gray-400">This session doesn't have associated customer information yet.</p>
        </div>
      )}

      {/* Chat Container */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">💬 Conversation History</h2>
        </div>
        
        <div className="p-6 max-h-96 overflow-y-auto space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.is_bot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.is_bot
                      ? 'bg-green-400 text-black rounded-bl-sm'
                      : 'bg-cyan-400 text-black rounded-br-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.is_bot ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="text-xs opacity-80">
                      {message.is_bot ? 'StreamlineAI Bot' : customer?.name || 'Customer'}
                    </span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                  <div className="flex items-center gap-1 mt-2 text-xs opacity-60">
                    <Clock className="h-3 w-3" />
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">No messages found</div>
              <div className="text-gray-500 text-sm mt-1">This session doesn't have any recorded messages yet.</div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {messages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 text-center border-t-4 border-t-cyan-400">
            <div className="text-3xl font-bold text-cyan-400">{totalMessages}</div>
            <div className="text-sm text-gray-400">Total Messages</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 text-center border-t-4 border-t-blue-400">
            <div className="text-3xl font-bold text-blue-400">{userMessages}</div>
            <div className="text-sm text-gray-400">Customer Messages</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 text-center border-t-4 border-t-green-400">
            <div className="text-3xl font-bold text-green-400">{botMessages}</div>
            <div className="text-sm text-gray-400">AI Responses</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 text-center border-t-4 border-t-purple-400">
            <div className="text-3xl font-bold text-purple-400">{engagementRate}%</div>
            <div className="text-sm text-gray-400">Customer Engagement</div>
          </div>
        </div>
      )}
    </div>
  );
}
