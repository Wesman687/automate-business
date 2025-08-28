'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, MessageSquare, Search, Filter, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/https'
import EditCustomerModal from '@/components/EditCustomerModal';
import { Customer, LeadStatus } from '@/types';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

const fetchCustomers = async () => {
  try {
    const data = await api.get<Customer[]>('/customers');
    setCustomers(data);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
  } finally {
    setLoading(false);
  }
};

const deleteCustomer = async (customerId: number) => {
  if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
    return;
  }

  try {
          await api.del(`/customers/${customerId}`); // throws on error
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  } catch (error) {
    console.error('Error deleting customer:', error);
    alert('Error deleting customer');
  }
};
  const editCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

const updateCustomer = async (
  customerData: Partial<Customer>,
  passwordData?: { password: string }
) => {
  if (!editingCustomer) return;

  try {
    // 1) Optional password change
    if (passwordData?.password) {
      await api.post(`/api/customers/${editingCustomer.id}/set-password`, {
        password: passwordData.password,
      }); // throws if not OK
    }

    // 2) Update customer details
          const updated = await api.put<Customer>(`/api/customers/${editingCustomer.id}`, customerData);

    // Update local list without a full refetch (or keep your fetchCustomers() if you prefer)
    setCustomers(prev => prev.map(c => (c.id === updated.id ? updated : c)));

    setShowEditModal(false);
    setEditingCustomer(null);
  } catch (error) {
    console.error('Error updating customer:', error);
    alert('Error updating customer');
  }
};

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.business_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.lead_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case LeadStatus.CUSTOMER:
        return 'bg-green-100 text-green-800';
      case LeadStatus.LEAD:
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Management</h1>
          <p className="text-gray-400 mt-1">Manage your customer database and leads</p>
        </div>
        <div className="flex space-x-2">
          
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
          >
            <option value="all">All Status</option>
            <option value="lead">Leads</option>
            <option value="customer">Customers</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Total Customers</h3>
          <div className="text-2xl font-bold text-white">{customers.length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Active Leads</h3>
          <div className="text-2xl font-bold text-white">
            {customers.filter(c => c.lead_status === LeadStatus.LEAD).length}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Paying Customers</h3>
          <div className="text-2xl font-bold text-white">
            {customers.filter(c => c.lead_status === LeadStatus.CUSTOMER).length}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400">Total Chats</h3>
          <div className="text-2xl font-bold text-white">
            {customers.reduce((sum, c) => sum + (c.chat_sessions?.length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-cyan-600/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Chats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/admin/customers/${customer.id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {customer.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-400">ID: {customer.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{customer.email}</div>
                    <div className="text-sm text-gray-400">{customer.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white max-w-xs truncate">
                      {customer.address || 'No address'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {customer.business_type || 'N/A'}
                    </div>
                    {customer.business_site && (
                      <a 
                        href={customer.business_site} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Site
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.lead_status || '')}`}>
                      {customer.lead_status || customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-cyan-400">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {customer.chat_count || customer.chat_sessions?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white max-w-xs truncate">
                      {customer.notes ? (
                        <div>
                          {customer.notes.substring(0, 50)}{customer.notes.length > 50 ? '...' : ''}
                          {customer.file_path && (
                            <div className="mt-1">
                              <a 
                                href={customer.file_path} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View File
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No notes</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded"
                        onClick={(e) => e.stopPropagation()}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editCustomer(customer);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded"
                        title="Edit Customer"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomer(customer.id);
                        }}
                        className="text-red-400 hover:text-red-300 p-1 rounded"
                        title="Delete Customer"
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

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No customers match your search criteria'
                : 'No customers found'
              }
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal would go here */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add New Customer</h2>
            <div className="text-gray-400">
              Customer creation form would go here...
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

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          isOpen={showEditModal}
          onSave={updateCustomer}
          onClose={() => {
            setShowEditModal(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </div>
  );
}
