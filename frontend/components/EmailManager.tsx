'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Reply, MoreHorizontal, Search, RefreshCw, X, Eye, EyeOff, Clock, AlertCircle, Forward } from 'lucide-react';

interface Email {
  id: string;
  account: string;
  from: string;
  subject: string;
  received_date: string;
  preview: string;
  is_important: boolean;
  is_read: boolean; // Add read status
  body?: string;
}

interface EmailManagerProps {
  onClose?: () => void;
  selectedEmailId?: string; // Optional email ID to open directly
}

export default function EmailManager({ onClose, selectedEmailId }: EmailManagerProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('all'); // Account filter
  const [error, setError] = useState('');
  const [emailAccounts, setEmailAccounts] = useState<Array<{name: string, value: string, email: string}>>([]);

  // Company email accounts - easily configurable
  // To add more company emails, simply add them to this array
  const companyEmailAccounts = [
    { name: 'Tech Support', value: 'tech', email: 'tech@stream-lineai.com' },
    { name: 'Sales', value: 'sales', email: 'sales@stream-lineai.com' },
    { name: 'No Reply', value: 'no-reply', email: 'no-reply@stream-lineai.com' },
    
    // ✅ TO ADD MORE EMAILS: Uncomment and modify the lines below
    // { name: 'Customer Service', value: 'support', email: 'support@stream-lineai.com' },
    // { name: 'Billing', value: 'billing', email: 'billing@stream-lineai.com' },
    // { name: 'Marketing', value: 'marketing', email: 'marketing@stream-lineai.com' },
    // { name: 'HR', value: 'hr', email: 'hr@stream-lineai.com' },
    
    // Then make sure to configure these email accounts on the server:
    // 1. Add environment variables for each account (EMAIL, PASSWORD, IMAP_SERVER)
    // 2. Update the backend EmailReaderService to include the new accounts
    // 3. Update the backend EmailService to support sending from these accounts
  ];

  // Compose email state
  const [composeData, setComposeData] = useState({
    to_email: '',
    subject: '',
    body: '',
    from_account: 'tech'
  });
  const [sending, setSending] = useState(false);

  // Add new email account state
  const [newAccountData, setNewAccountData] = useState({
    name: '',
    email: '',
    password: '',
    imap_server: 'imap.gmail.com',
    imap_port: '993',
    smtp_server: 'smtp.gmail.com',
    smtp_port: '587'
  });
  const [addingAccount, setAddingAccount] = useState(false);

  useEffect(() => {
    fetchEmails();
    fetchEmailAccounts();
  }, []);

  // Auto-select email if selectedEmailId is provided
  useEffect(() => {
    if (selectedEmailId && emails.length > 0) {
      const email = emails.find(e => e.id === selectedEmailId);
      if (email) {
        selectEmail(email);
      }
    }
  }, [selectedEmailId, emails]);

  const fetchEmailAccounts = async () => {
    try {
      // Try to fetch from server, but fall back to local config
      const response = await fetch('https://server.stream-lineai.com/email/accounts', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Map server accounts to our format
        const serverAccounts = data.accounts?.map((account: any) => ({
          name: account.name,
          value: account.name.toLowerCase(),
          email: account.email
        })) || [];
        setEmailAccounts(serverAccounts.length > 0 ? serverAccounts : companyEmailAccounts);
      } else {
        setEmailAccounts(companyEmailAccounts);
      }
    } catch (error) {
      console.error('Error fetching email accounts:', error);
      setEmailAccounts(companyEmailAccounts);
    }
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      // Always use server API for emails
      const response = await fetch('https://server.stream-lineai.com/email/unread', {
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
    setRefreshing(true);
    await fetchEmails();
    setRefreshing(false);
  };

  const selectEmail = async (email: Email) => {
    try {
      const response = await fetch(`https://server.stream-lineai.com/email/${email.id}`, {
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
    try {
      const response = await fetch(`https://server.stream-lineai.com/email/${emailId}/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',

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

  const markAsUnread = async (emailId: string) => {
    try {
      const response = await fetch(`https://server.stream-lineai.com/email/${emailId}/mark-unread`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to mark email as unread');
      }

      // Refresh emails list
      await fetchEmails();
    } catch (error) {
      console.error('Error marking email as unread:', error);
      setError('Failed to mark email as unread');
    }
  };

  const replyToEmail = (email: Email) => {
    setComposeData({
      to_email: email.from,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${email.from}\nSubject: ${email.subject}\nDate: ${new Date(email.received_date).toLocaleString()}\n\n${email.body || ''}`,
      from_account: email.account.toLowerCase()
    });
    setShowCompose(true);
  };

  const forwardEmail = (email: Email) => {
    setComposeData({
      to_email: '',
      subject: email.subject.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${email.from}\nSubject: ${email.subject}\nDate: ${new Date(email.received_date).toLocaleString()}\n\n${email.body || ''}`,
      from_account: 'tech'
    });
    setShowCompose(true);
  };

  const sendEmail = async () => {
    if (!composeData.to_email || !composeData.subject || !composeData.body) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      const response = await fetch('https://server.stream-lineai.com/email/send', {
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

  const addEmailAccount = async () => {
    if (!newAccountData.name || !newAccountData.email || !newAccountData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setAddingAccount(true);
      const response = await fetch('https://server.stream-lineai.com/email/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newAccountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add email account');
      }

      // Reset form
      setNewAccountData({
        name: '',
        email: '',
        password: '',
        imap_server: 'imap.gmail.com',
        imap_port: '993',
        smtp_server: 'smtp.gmail.com',
        smtp_port: '587'
      });
      setShowAddAccount(false);
      setError('');
      
      // Refresh email accounts
      await fetchEmailAccounts();
      
      alert('Email account added successfully!');
    } catch (error) {
      console.error('Error adding email account:', error);
      setError(error instanceof Error ? error.message : 'Failed to add email account');
    } finally {
      setAddingAccount(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Make account filtering case-insensitive and flexible
    const matchesAccount = selectedAccount === 'all' || 
                          email.account.toLowerCase() === selectedAccount.toLowerCase() ||
                          email.account.toLowerCase().includes(selectedAccount.toLowerCase());
    
    // Debug logging
    if (selectedAccount !== 'all') {
      console.log(`Filtering debug - Selected: "${selectedAccount}", Email account: "${email.account}", Matches: ${matchesAccount}`);
    }
    
    return matchesSearch && matchesAccount;
  });

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
              onClick={() => setShowAddAccount(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Add Email</span>
            </button>
            
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
            
            {/* Search and Filters */}
            <div className="p-4 border-b border-white/10 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-200 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Account Filter */}
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Accounts</option>
                {emailAccounts.map(account => (
                  <option key={account.value} value={account.value}>
                    {account.name}
                  </option>
                ))}
              </select>
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
                    } ${email.is_read ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {/* Read/Unread indicator */}
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            email.is_read ? 'bg-gray-500' : 'bg-blue-400'
                          }`} />
                          <p className={`font-medium truncate ${
                            email.is_read ? 'text-gray-400' : 'text-white'
                          }`}>{email.from}</p>
                          {email.is_important && (
                            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-sm font-medium truncate ml-4 ${
                          email.is_read ? 'text-gray-500' : 'text-gray-200'
                        }`}>{email.subject}</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-xs text-gray-400">{formatDate(email.received_date)}</p>
                        <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded mt-1 block">
                          {email.account}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm truncate ml-6 ${
                      email.is_read ? 'text-gray-500' : 'text-gray-300'
                    }`}>{email.preview}</p>
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
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Reply className="h-4 w-4" />
                        <span>Reply</span>
                      </button>
                      
                      <button
                        onClick={() => forwardEmail(selectedEmail)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Forward className="h-4 w-4" />
                        <span>Forward</span>
                      </button>
                      
                      {selectedEmail.is_read ? (
                        <button
                          onClick={() => markAsUnread(selectedEmail.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <EyeOff className="h-4 w-4" />
                          <span>Mark Unread</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsRead(selectedEmail.id)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Mark Read</span>
                        </button>
                      )}
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
                    {emailAccounts.map(account => (
                      <option key={account.value} value={account.value}>
                        {account.name} ({account.email})
                      </option>
                    ))}
                  </select>
                  {emailAccounts.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">Loading email accounts...</p>
                  )}
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

      {/* Add Email Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-dark-bg border border-white/10 rounded-lg shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Add Email Account</h3>
              <button
                onClick={() => setShowAddAccount(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Account Name *</label>
                  <input
                    type="text"
                    value={newAccountData.name}
                    onChange={(e) => setNewAccountData({ ...newAccountData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Customer Support"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={newAccountData.email}
                    onChange={(e) => setNewAccountData({ ...newAccountData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="support@stream-lineai.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">App Password *</label>
                <input
                  type="password"
                  value={newAccountData.password}
                  onChange={(e) => setNewAccountData({ ...newAccountData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Gmail App Password (16 characters)"
                />
                <p className="text-xs text-gray-400 mt-1">
                  For Gmail: Generate an App Password in your Google Account settings
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">IMAP Server</label>
                  <input
                    type="text"
                    value={newAccountData.imap_server}
                    onChange={(e) => setNewAccountData({ ...newAccountData, imap_server: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">IMAP Port</label>
                  <input
                    type="text"
                    value={newAccountData.imap_port}
                    onChange={(e) => setNewAccountData({ ...newAccountData, imap_port: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Server</label>
                  <input
                    type="text"
                    value={newAccountData.smtp_server}
                    onChange={(e) => setNewAccountData({ ...newAccountData, smtp_server: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
                  <input
                    type="text"
                    value={newAccountData.smtp_port}
                    onChange={(e) => setNewAccountData({ ...newAccountData, smtp_port: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm">
                  <strong>Setup Instructions:</strong><br/>
                  1. Enable 2-factor authentication on your Google account<br/>
                  2. Generate an App Password: Google Account → Security → 2-Step Verification → App passwords<br/>
                  3. Use the 16-character app password (not your regular password)<br/>
                  4. Default settings work for most Gmail accounts
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/10">
              <button
                onClick={() => setShowAddAccount(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addEmailAccount}
                disabled={addingAccount}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {addingAccount ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                <span>{addingAccount ? 'Adding...' : 'Add Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
