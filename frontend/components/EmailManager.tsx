'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Reply, MoreHorizontal, Search, RefreshCw, X, Eye, Clock, AlertCircle } from 'lucide-react';

interface Email {
  id: string;
  account: string;
  from: string;
  subject: string;
  received_date: string;
  preview: string;
  is_important: boolean;
  body?: string;
}

interface EmailManagerProps {
  onClose?: () => void;
}

export default function EmailManager({ onClose }: EmailManagerProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isProduction, setIsProduction] = useState(false);

  // Compose email state
  const [composeData, setComposeData] = useState({
    to_email: '',
    subject: '',
    body: '',
    from_account: 'tech'
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Check if we're in production environment
    const checkEnvironment = () => {
      const isDev = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('localhost');
      setIsProduction(!isDev);
      if (!isDev) {
        setError('Email functionality is only available on the production server. This is a development environment.');
        setLoading(false);
      } else {
        fetchEmails();
      }
    };
    
    checkEnvironment();
  }, []);

  const fetchEmails = async () => {
    if (!isProduction) {
      // Show mock data for development
      setEmails([
        {
          id: 'dev-1',
          account: 'Development',
          from: 'dev@example.com',
          subject: 'Development Mode - No Real Emails',
          received_date: new Date().toISOString(),
          preview: 'Email functionality is only available on the production server.',
          is_important: false
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/emails/unread', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const refreshEmails = async () => {
    if (!isProduction) {
      setRefreshing(true);
      // Simulate refresh delay in development
      setTimeout(() => setRefreshing(false), 1000);
      return;
    }
    
    setRefreshing(true);
    await fetchEmails();
    setRefreshing(false);
  };

  const selectEmail = async (email: Email) => {
    if (!isProduction) {
      setSelectedEmail({
        ...email,
        body: 'This is a development environment. Email functionality is only available on the production server where actual email accounts are configured.'
      });
      return;
    }

    try {
      const response = await fetch(`/api/emails/${email.id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch email details');
      }

      const emailDetails = await response.json();
      setSelectedEmail(emailDetails);
    } catch (error) {
      console.error('Error fetching email details:', error);
      setError('Failed to fetch email details');
    }
  };

  const markAsRead = async (emailId: string) => {
    if (!isProduction) {
      setError('Email actions are only available on the production server.');
      return;
    }

    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'mark-read' }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark email as read');
      }

      // Refresh emails list
      await fetchEmails();
    } catch (error) {
      console.error('Error marking email as read:', error);
      setError('Failed to mark email as read');
    }
  };

  const sendEmail = async () => {
    if (!isProduction) {
      setError('Email sending is only available on the production server.');
      return;
    }

    if (!composeData.to_email || !composeData.subject || !composeData.body) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(composeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      // Reset compose form
      setComposeData({
        to_email: '',
        subject: '',
        body: '',
        from_account: 'tech'
      });
      setShowCompose(false);
      setError('');
      
      // Show success message
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      setError(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const replyToEmail = (email: Email) => {
    if (!isProduction) {
      setError('Email replies are only available on the production server.');
      return;
    }
    
    setComposeData({
      to_email: email.from,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      body: `\\n\\n--- Original Message ---\\nFrom: ${email.from}\\nSubject: ${email.subject}\\nDate: ${new Date(email.received_date).toLocaleString()}\\n\\n${email.body || email.preview}`,
      from_account: 'tech'
    });
    setShowCompose(true);
  };

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-bg border border-white/10 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <Mail className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Email Manager</h2>
            <span className="bg-blue-400/20 text-blue-300 text-sm font-medium px-3 py-1 rounded-full">
              {emails.length} unread
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCompose(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>Compose</span>
            </button>
            
            <button
              onClick={refreshEmails}
              disabled={refreshing}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          
          {/* Email List */}
          <div className="w-1/3 border-r border-white/10 flex flex-col">
            
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="text-center text-gray-400 p-8">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No emails found</p>
                </div>
              ) : (
                filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => selectEmail(email)}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                      selectedEmail?.id === email.id ? 'bg-blue-500/20 border-blue-500/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-white truncate">{email.from}</p>
                          {email.is_important && (
                            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-200 truncate">{email.subject}</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-xs text-gray-400">{formatDate(email.received_date)}</p>
                        <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded mt-1 block">
                          {email.account}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 truncate">{email.preview}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Email Content */}
          <div className="flex-1 flex flex-col">
            {selectedEmail ? (
              <>
                {/* Email Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{selectedEmail.subject}</h3>
                      <p className="text-gray-300">From: {selectedEmail.from}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(selectedEmail.received_date).toLocaleString()} • {selectedEmail.account}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => replyToEmail(selectedEmail)}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Reply className="h-4 w-4" />
                        <span>Reply</span>
                      </button>
                      
                      <button
                        onClick={() => markAsRead(selectedEmail.id)}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Mark Read</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <pre className="whitespace-pre-wrap text-gray-200 font-sans leading-relaxed">
                      {selectedEmail.body || selectedEmail.preview}
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Select an email to read</p>
                  <p className="text-sm">Choose an email from the list to view its contents</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-dark-bg border border-white/10 rounded-lg shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Compose Email</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">From Account</label>
                  <select
                    value={composeData.from_account}
                    onChange={(e) => setComposeData({ ...composeData, from_account: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tech">Tech Account</option>
                    <option value="sales">Sales Account</option>
                    <option value="no-reply">No Reply</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">To Email *</label>
                  <input
                    type="email"
                    value={composeData.to_email}
                    onChange={(e) => setComposeData({ ...composeData, to_email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="recipient@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
                <textarea
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Write your message here..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/10">
              <button
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                disabled={sending}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{sending ? 'Sending...' : 'Send Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
