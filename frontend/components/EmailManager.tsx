'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Reply, MoreHorizontal, Search, RefreshCw, X, Eye, EyeOff, Clock, AlertCircle, Forward } from 'lucide-react';
import { api } from '@/lib/https';

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
  isOpen: boolean;
  onClose: () => void;
  selectedEmailId?: string;
}

interface ComposeData {
  to_email: string;
  subject: string;
  body: string;
  from_account: string;
}

interface NewAccountData {
  name: string;
  email: string;
  password: string;
  imap_server: string;
  imap_port: string;
  smtp_server: string;
  smtp_port: string;
}

export default function EmailManager({ isOpen, onClose }: EmailManagerProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [showCompose, setShowCompose] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [sending, setSending] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [composeData, setComposeData] = useState<ComposeData>({
    to_email: '',
    subject: '',
    body: '',
    from_account: 'tech'
  });
  const [newAccountData, setNewAccountData] = useState<NewAccountData>({
    name: '',
    email: '',
    password: '',
    imap_server: 'imap.gmail.com',
    imap_port: '993',
    smtp_server: 'smtp.gmail.com',
    smtp_port: '587'
  });
  
  // New state for success notification
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // New state for email cache
  const [emailCache, setEmailCache] = useState<Map<string, Email>>(new Map());
  const [emailBodies, setEmailBodies] = useState<Map<string, string>>(new Map());
  const [preloadingEmails, setPreloadingEmails] = useState<Set<string>>(new Set());
  const [cachingProgress, setCachingProgress] = useState({ total: 0, cached: 0 });
  
  // Email accounts state
  const [emailAccounts, setEmailAccounts] = useState<Array<{name: string, value: string, email: string}>>([]);


  
  // Company email accounts - easily configurable
  const companyEmailAccounts = [
    { name: 'Tech Support', value: 'tech', email: 'tech@stream-lineai.com' },
    { name: 'Sales', value: 'sales', email: 'sales@stream-lineai.com' },
    { name: 'No Reply', value: 'no-reply', email: 'no-reply@stream-lineai.com' },
  ];

  useEffect(() => {
    fetchEmails();
    fetchEmailAccounts();
  }, []);

  // Auto-select email if selectedEmail is provided
  useEffect(() => {
    if (selectedEmail && emails.length > 0) {
      const email = emails.find(e => e.id === selectedEmail.id);
      if (email) {
        selectEmail(email);
      }
    }
  }, [selectedEmail, emails]);

  const fetchEmailAccounts = async () => {
    try {
      // Use api utility - automatically routes to production server
      const data = await api.get('/api/email/accounts');
      
      console.log('🔧 Email accounts from server:', data);
      
      // Map server accounts to our format
      const serverAccounts = data.accounts?.map((account: any) => ({
        name: account.name,
        value: account.name.toLowerCase(),
        email: account.email
      })) || [];
      
      console.log('🔧 Mapped server accounts:', serverAccounts);
      console.log('🔧 Company fallback accounts:', companyEmailAccounts);
      
      setEmailAccounts(serverAccounts.length > 0 ? serverAccounts : companyEmailAccounts);
    } catch (error) {
      console.error('Error fetching email accounts:', error);
      setEmailAccounts(companyEmailAccounts);
    }
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      
      // Use api utility - automatically routes to production server
      const data = await api.get('/api/email/all');
      const emailList = data.emails || [];
      setEmails(emailList);
      
      // Set caching progress
      const uncachedEmails = emailList.filter((email: Email) => !emailBodies.has(email.id));
      setCachingProgress({ total: uncachedEmails.length, cached: 0 });
      
      // Preload ALL email bodies for instant access
      console.log(`📧 Preloading ${uncachedEmails.length} email bodies for instant access...`);
      
      // Process emails in batches to avoid overwhelming the server
      const batchSize = 5;
      for (let i = 0; i < uncachedEmails.length; i += batchSize) {
        const batch = uncachedEmails.slice(i, i + batchSize);
        await Promise.all(batch.map((email: Email) => preloadEmailBody(email.id)));
        
        // Update progress
        setCachingProgress(prev => ({ ...prev, cached: Math.min(prev.cached + batchSize, prev.total) }));
      }
      
      console.log('📧 All email bodies cached successfully!');
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to fetch emails');
    } finally {
      setLoading(false);
      setCachingProgress({ total: 0, cached: 0 });
    }
  };

  const preloadEmailBody = async (emailId: string) => {
    try {
      setPreloadingEmails(prev => new Set(prev).add(emailId));
      
      // Use api utility - automatically routes to production server
      const emailDetails = await api.get(`/api/email/${emailId}`);
      
      // Cache the email body
      setEmailBodies(prev => new Map(prev).set(emailId, emailDetails.body || ''));
      
      // Also cache the full email object for instant access
      setEmailCache(prev => new Map(prev).set(emailId, emailDetails));
      
      console.log(`📧 Cached email body for ${emailId}`);
    } catch (error) {
      console.error('Error preloading email body:', error);
      // Don't show error for preloading failures
    } finally {
      setPreloadingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(emailId);
        return newSet;
      });
    }
  };

  const refreshEmails = async () => {
    setRefreshing(true);
    try {
      // Fetch only new emails (since last refresh)
      const data = await api.get('/api/email/all');
      const newEmailList = data.emails || [];
      
      // Update emails list
      setEmails(newEmailList);
      
      // Only preload emails that aren't already cached
      const uncachedEmails = newEmailList.filter((email: Email) => !emailBodies.has(email.id));
      console.log(`📧 Refreshing: ${uncachedEmails.length} new emails to cache`);
      
      for (const email of uncachedEmails) {
        preloadEmailBody(email.id);
      }
    } catch (error) {
      console.error('Error refreshing emails:', error);
      setError('Failed to refresh emails');
    } finally {
      setRefreshing(false);
    }
  };

    const selectEmail = async (email: Email) => {
    try {
      // Check if we have the full email cached
      if (emailCache.has(email.id)) {
        console.log(`📧 Using fully cached email for ${email.id}`);
        const cachedEmail = emailCache.get(email.id);
        if (cachedEmail) {
          setSelectedEmail(cachedEmail);
          
          // Mark as read if not already read
          if (!email.is_read) {
            await markAsRead(email.id);
            // Update local state to reflect read status
            setEmails(prev => prev.map(e => 
              e.id === email.id ? { ...e, is_read: true } : e
            ));
          }
          return;
        }
      }

      // Check if we have just the email body cached
      if (emailBodies.has(email.id)) {
        console.log(`📧 Using cached email body for ${email.id}`);
        const cachedEmail = { ...email, body: emailBodies.get(email.id) };
        setSelectedEmail(cachedEmail);
        
        // Mark as read if not already read
        if (!email.is_read) {
          await markAsRead(email.id);
          // Update local state to reflect read status
          setEmails(prev => prev.map(e => 
            e.id === email.id ? { ...e, is_read: true } : e
          ));
        }
        return;
      }

      // If not cached at all, fetch and cache it
      console.log(`📧 Fetching email body for ${email.id} (not cached)`);
      const emailDetails = await api.get(`/api/email/${email.id}`);
      
      // Cache both the email body and full email object
      setEmailBodies(prev => new Map(prev).set(email.id, emailDetails.body || ''));
      setEmailCache(prev => new Map(prev).set(email.id, emailDetails));
      
      setSelectedEmail(emailDetails);
      
      // Mark as read if not already read
      if (!email.is_read) {
        await markAsRead(email.id);
        // Update local state to reflect read status
        setEmails(prev => prev.map(e => 
          e.id === email.id ? { ...e, is_read: true } : e
        ));
      }
    } catch (error) {
      console.error('Error fetching email details:', error);
      setError('Failed to fetch email details');
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      // Use api utility - automatically routes to production server
      await api.post(`/api/email/${emailId}/mark-read`, {});

      // Update local state immediately for better UX
      setEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, is_read: true } : email
      ));
      
      // Update selected email if it's the same one
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(prev => prev ? { ...prev, is_read: true } : null);
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
      setError('Failed to mark email as read');
    }
  };

  const markAsUnread = async (emailId: string) => {
    try {
      // Use api utility - automatically routes to production server
      await api.post(`/api/email/${emailId}/mark-unread`, {});

      // Update local state immediately for better UX
      setEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, is_read: false } : email
      ));
      
      // Update selected email if it's the same one
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(prev => prev ? { ...prev, is_read: false } : null);
      }
    } catch (error) {
      console.error('Error marking email as unread:', error);
      setError('Failed to mark email as unread');
    }
  };

  const deleteEmail = async (emailId: string) => {
    if (!confirm('Are you sure you want to delete this email? This action cannot be undone.')) {
      return;
    }

    try {
      // Use api utility - automatically routes to production server
      await api.del(`/api/email/${emailId}`);

      // Remove from local state
      setEmails(prev => prev.filter(email => email.id !== emailId));
      
      // Clear selection if this was the selected email
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
      
      // Clear from cache
      setEmailBodies(prev => {
        const newCache = new Map(prev);
        newCache.delete(emailId);
        return newCache;
      });

      // Show success message
      setSuccessMessage('Email deleted successfully! 🗑️');
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error('Error deleting email:', error);
      setError('Failed to delete email');
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
      
      // Use api utility - automatically routes to production server
      // Backend expects to_emails as array, not to_email as string
      const emailData = {
        to_emails: [composeData.to_email],
        subject: composeData.subject,
        body: composeData.body,
        from_account: composeData.from_account
      };
      await api.post('/api/email/send', emailData);

      // Reset compose form
      setComposeData({
        to_email: '',
        subject: '',
        body: '',
        from_account: 'tech'
      });
      setShowCompose(false);
      setError('');
      
      // Show fancy success notification
      setSuccessMessage('Email sent successfully! 🎉');
      setShowSuccessModal(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
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
      
      // Use api utility - automatically routes to production server
      await api.post('/api/email/accounts', newAccountData);

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
      await fetchEmails();
      
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
    
    // Debug logging for all emails to see account values
    console.log(`Email filtering - Email: "${email.subject}", Account: "${email.account}", Selected: "${selectedAccount}", Matches: ${matchesAccount}`);
    
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
              
              {/* Caching Progress */}
              {cachingProgress.total > 0 && (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm text-blue-300 mb-2">
                    <span>📧 Caching emails for instant access...</span>
                    <span>{cachingProgress.cached}/{cachingProgress.total}</span>
                  </div>
                  <div className="w-full bg-blue-500/30 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(cachingProgress.cached / cachingProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Debug: Read/Unread Status */}
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="text-sm text-yellow-300 mb-2">
                  🐛 Debug: Read/Unread Status
                </div>
                <div className="text-xs text-yellow-200 space-y-1">
                  <div>Total emails: {emails.length}</div>
                  <div>Read emails: {emails.filter(e => e.is_read).length}</div>
                  <div>Unread emails: {emails.filter(e => !e.is_read).length}</div>
                  <div>Cached bodies: {emailBodies.size}</div>
                  <div>Cached full emails: {emailCache.size}</div>
                </div>
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
                    <div className="flex items-center justify-between ml-6">
                      <p className={`text-sm truncate flex-1 ${
                        email.is_read ? 'text-gray-500' : 'text-gray-300'
                      }`}>{email.preview}</p>
                      
                      {/* Preloading indicator */}
                      {preloadingEmails.has(email.id) && (
                        <div className="ml-2 p-1">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                        </div>
                      )}
                      
                      {/* Delete button for each email */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent email selection
                          deleteEmail(email.id);
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete email"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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
                      
                      <button
                        onClick={() => deleteEmail(selectedEmail.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
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

      {/* Fancy Success Notification Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 shadow-2xl transform transition-all duration-300 scale-100 animate-in slide-in-from-bottom-4">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 bg-white/20 rounded-full mb-6">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Message */}
              <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
              <p className="text-green-100 text-lg">{successMessage}</p>
              
              {/* Auto-close indicator */}
              <div className="mt-6 w-full bg-white/20 rounded-full h-1">
                <div className="bg-white h-1 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
