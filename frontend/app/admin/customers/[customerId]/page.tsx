'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Mail, Phone, Building, Globe, Calendar, MessageSquare, DollarSign, Briefcase } from 'lucide-react';
import Link from 'next/link';
import EditCustomerModal from '@/components/EditCustomerModal';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  business_site?: string;
  business_type?: string;
  additional_websites?: string;
  status: string;
  notes?: string;
  file_path?: string;
  created_at: string;
  chat_sessions?: ChatSession[];
}

interface ChatSession {
  id: number;
  session_id: string;
  customer_id: number;
  start_time: string;
  end_time?: string;
  status: string;
  message_count: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  total_amount: number;
  status: string;
  issue_date: string;
  due_date: string;
}

interface Job {
  id: number;
  title: string;
  status: string;
  priority: string;
  progress_percentage: number;
  deadline?: string;
}

export default function CustomerDetail() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [financialLoading, setFinancialLoading] = useState(false);

  // Utility functions
  const formatCurrency = (amount: number) => {
    return amount ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/20 text-green-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'overdue':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-blue-500/20 text-blue-300';
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'on_hold':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
      fetchFinancialData();
    }
  }, [customerId]);

  const fetchFinancialData = async () => {
    if (!customerId) return;
    
    setFinancialLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch customer's invoices and jobs
      const [invoicesRes, jobsRes] = await Promise.all([
        fetch(`/api/invoices?customer_id=${customerId}`, { headers }),
        fetch(`/api/jobs?customer_id=${customerId}`, { headers })
      ]);

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setFinancialLoading(false);
    }
  };

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      } else if (response.status === 404) {
        setError('Customer not found');
      } else {
        setError('Failed to load customer');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      setError('Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async (updatedData: Partial<Customer>) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        setCustomer(updatedCustomer);
        // Show success message or notification here if desired
      } else {
        throw new Error('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error; // Re-throw so the modal can handle it
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'customer':
        return 'bg-green-100 text-green-800';
      case 'lead':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChatStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'proposal_sent':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-lg font-semibold">Error Loading Customer</div>
        <div className="text-gray-400 mt-2">{error || 'Customer not found'}</div>
        <Link 
          href="/admin/customers"
          className="inline-flex items-center mt-4 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/customers"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-cyan-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {customer.name || "Unknown Customer"}
            </h1>
            <p className="text-gray-400">Customer ID: {customer.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
              customer.status
            )}`}
          >
            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
          </span>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </button>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-cyan-400" />
              <div>
                <div className="text-sm text-gray-400">Email</div>
                <div className="text-white">{customer.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-cyan-400" />
              <div>
                <div className="text-sm text-gray-400">Phone</div>
                <div className="text-white">
                  {customer.phone ? customer.phone : "Not specified"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-cyan-400 mt-1" />
              <div>
                <div className="text-sm text-gray-400">Address</div>
                <div className="text-white">
                  {customer.address && (
                    <div className="space-y-1">
                      <div>{customer.address}</div>
                      {(customer.city || customer.state || customer.zip_code) && (
                        <div>
                          {customer.city && customer.city}
                          {customer.city && customer.state && ', '}
                          {customer.state && customer.state}
                          {customer.zip_code && ` ${customer.zip_code}`}
                        </div>
                      )}
                      {customer.country && <div>{customer.country}</div>}
                    </div>
                  )}
                  {!customer.address && !customer.city && !customer.state && !customer.zip_code && !customer.country && (
                    "Not specified"
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-cyan-400" />
              <div>
                <div className="text-sm text-gray-400">Customer Since</div>
                <div className="text-white">
                  {new Date(customer.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Business Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-cyan-400" />
              <div>
                <div className="text-sm text-gray-400">Business Type</div>
                <div className="text-white">
                  {customer.business_type || "Not specified"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-cyan-400" />
              <div>
                <div className="text-sm text-gray-400">Business Website</div>
                <a
                  href={customer.business_site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  {customer.business_site
                    ? customer.business_site
                    : "Not specified"}
                </a>
              </div>
            </div>
            {customer.additional_websites && (
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-cyan-400 mt-1" />
              <div>
                <div className="text-sm text-gray-400">Additional Websites</div>
                <div className="text-white whitespace-pre-line">
                  {customer.additional_websites
                    ? customer.additional_websites
                    : "Not specified"}
                </div>
              </div>
            </div>
            )}
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-cyan-400 mt-1" />
              <div>
                <div className="text-sm text-gray-400">Notes</div>
                <div className="text-white whitespace-pre-line">
                  {customer.notes ? customer.notes : "Not specified"}
                </div>
                {customer.file_path && (
                  <div className="mt-2">
                    <a
                      href={customer.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      View Uploaded File
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
              <div>
                <div className="text-sm text-gray-400">Chat Sessions</div>
                <div className="text-white">
                  {customer.chat_sessions?.length || 0} sessions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
          <div className="text-gray-300 whitespace-pre-wrap">
            {customer.notes}
          </div>
        </div>
      )}

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <DollarSign className="h-5 w-5 text-cyan-400 mr-2" />
              Recent Invoices
            </h2>
            <Link 
              href="/admin/financial" 
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              View All →
            </Link>
          </div>
          
          {financialLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
            </div>
          ) : invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.slice(0, 3).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{invoice.invoice_number}</div>
                    <div className="text-sm text-gray-400">Due: {formatDate(invoice.due_date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{formatCurrency(invoice.total_amount)}</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
              {invoices.length > 3 && (
                <div className="text-center text-sm text-gray-400">
                  +{invoices.length - 3} more invoices
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No invoices found for this customer
            </div>
          )}
        </div>

        {/* Active Jobs */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Briefcase className="h-5 w-5 text-cyan-400 mr-2" />
              Active Jobs
            </h2>
            <Link 
              href="/admin/jobs" 
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              View All →
            </Link>
          </div>
          
          {financialLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.slice(0, 3).map((job) => (
                <div key={job.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Link 
                      href={`/admin/jobs/${job.id}`}
                      className="text-white font-medium hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {job.title}
                    </Link>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getJobStatusColor(job.status)}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-400">
                      Progress: {job.progress_percentage}%
                    </div>
                    {job.deadline && (
                      <div className="text-sm text-gray-400">
                        Due: {formatDate(job.deadline)}
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {jobs.length > 3 && (
                <div className="text-center text-sm text-gray-400">
                  +{jobs.length - 3} more jobs
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No jobs found for this customer
            </div>
          )}
        </div>
      </div>

      {/* Chat Sessions */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Chat Sessions</h2>
        </div>

        {customer.chat_sessions && customer.chat_sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-cyan-600/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Session ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customer.chat_sessions.map((session) => (
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
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChatStatusColor(
                          session.status
                        )}`}
                      >
                        {session.status
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {session.message_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {new Date(session.start_time).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(session.start_time).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/chat-logs/${session.session_id}`}
                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                      >
                        View Chat →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="text-gray-400">
              No chat sessions found for this customer
            </div>
          </div>
        )}
      </div>

      {/* Edit Customer Modal */}
      {customer && (
        <EditCustomerModal
          customer={customer}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateCustomer}
        />
      )}
    </div>
  );
}
