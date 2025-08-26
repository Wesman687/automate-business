"use client";

import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  credits: number;
  credit_status: string;
}

interface FinancialOverview {
  total_users: number;
  total_credits: number;
  active_subscriptions: number;
  total_subscription_revenue: number;
}

interface MonthlyStats {
  credits_spent: number;
  credits_added: number;
  net_change: number;
}

interface Transaction {
  id: string;
  user_id: number;
  user_email: string;
  amount: number;
  description: string;
  created_at: string;
  type: 'credit' | 'debit';
  job_id?: string;
  subscription_id?: string;
  stripe_payment_intent_id?: string;
}

interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  prices: Array<{
    id: string;
    amount: number;
    currency: string;
    interval: string;
    interval_count: number;
  }>;
}

interface FinancialDashboardData {
  overview: FinancialOverview;
  monthly_stats: MonthlyStats;
  recent_transactions: Transaction[];
}

const AdminFinancialDashboard: React.FC = () => {
  const [data, setData] = useState<FinancialDashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '90' | '365'>('30');
  
  // Transaction management
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionFilters, setTransactionFilters] = useState({
    user_id: '',
    transaction_type: '',
    start_date: '',
    end_date: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  // Subscription management
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    user_id: '',
    product_id: '',
    price_id: '',
    description: ''
  });
  const [stripeProducts, setStripeProducts] = useState<StripeProduct[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchFinancialData();
    fetchStripeProducts();
  }, [selectedPeriod]);

  useEffect(() => {
    if (showAllTransactions) {
      fetchTransactions();
    }
  }, [showAllTransactions, transactionFilters]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const result = await response.json();
      setUsers(result.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/financial/overview?period=${selectedPeriod}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch financial data');
      }
      
      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (transactionFilters.user_id) params.append('user_id', transactionFilters.user_id);
      if (transactionFilters.transaction_type) params.append('transaction_type', transactionFilters.transaction_type);
      if (transactionFilters.start_date) params.append('start_date', transactionFilters.start_date);
      if (transactionFilters.end_date) params.append('end_date', transactionFilters.end_date);
      if (transactionFilters.sort_by) params.append('sort_by', transactionFilters.sort_by);
      if (transactionFilters.sort_order) params.append('sort_order', transactionFilters.sort_order);
      
      const response = await fetch(`/api/financial/transactions?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const result = await response.json();
      setTransactions(result.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchStripeProducts = async () => {
    try {
      const response = await fetch('/api/stripe/products');
      if (response.ok) {
        const result = await response.json();
        setStripeProducts(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching Stripe products:', err);
    }
  };

  const handleUserSelect = async (userId: number) => {
    setSelectedUser(userId);
  };

  const handleCreateSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionForm),
      });

      if (response.ok) {
        setShowSubscriptionModal(false);
        setSubscriptionForm({ user_id: '', product_id: '', price_id: '', description: '' });
        fetchFinancialData(); // Refresh data
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
    }
  };

  const handleRefundTransaction = async (transactionId: string, stripePaymentIntentId?: string) => {
    if (!stripePaymentIntentId) {
      alert('This transaction cannot be refunded (no Stripe payment intent)');
      return;
    }

    try {
      const response = await fetch('/api/stripe/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: stripePaymentIntentId,
          reason: 'requested_by_customer'
        }),
      });

      if (response.ok) {
        fetchTransactions(); // Refresh transactions
        alert('Refund processed successfully');
      }
    } catch (err) {
      console.error('Error processing refund:', err);
      alert('Failed to process refund');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: 'credit' | 'debit') => {
    if (type === 'credit') {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchFinancialData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of system finances, user credits, and subscription revenue
        </p>
      </div>

      {/* Customer Selection */}
      <div className="mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Selection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Customer
              </label>
              <select
                id="user-select"
                value={selectedUser || ''}
                onChange={(e) => handleUserSelect(Number(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Customers</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} - {user.credits} credits
                  </option>
                ))}
              </select>
            </div>
            {selectedUser && (
              <div className="flex items-end space-x-2">
                <button
                  onClick={() => window.open(`/api/admin/credits/users/${selectedUser}`, '_blank')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Customer Details
                </button>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Create Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedPeriod('30')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              selectedPeriod === '30'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('90')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              selectedPeriod === '90'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('365')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              selectedPeriod === '365'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Last Year
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(data.overview.total_users)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Credits</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(data.overview.total_credits)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(data.overview.active_subscriptions)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(data.overview.total_subscription_revenue)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Credits Added:</span>
                <span className="text-sm font-medium text-green-600">
                  +{formatNumber(data.monthly_stats.credits_added)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Credits Spent:</span>
                <span className="text-sm font-medium text-red-600">
                  -{formatNumber(data.monthly_stats.credits_spent)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Net Change:</span>
                  <span className={`text-sm font-medium ${
                    data.monthly_stats.net_change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.monthly_stats.net_change >= 0 ? '+' : ''}{formatNumber(data.monthly_stats.net_change)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
              <button
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {showAllTransactions ? 'Show Recent Only' : 'Show All Transactions'}
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.recent_transactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent transactions</p>
              ) : (
                data.recent_transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.user_email}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {transaction.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatNumber(Math.abs(transaction.amount))}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* All Transactions Section */}
      {showAllTransactions && (
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">All Transactions</h3>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  value={transactionFilters.user_id}
                  onChange={(e) => setTransactionFilters({...transactionFilters, user_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Filter by user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={transactionFilters.transaction_type}
                  onChange={(e) => setTransactionFilters({...transactionFilters, transaction_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Types</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={transactionFilters.start_date}
                  onChange={(e) => setTransactionFilters({...transactionFilters, start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={transactionFilters.end_date}
                  onChange={(e) => setTransactionFilters({...transactionFilters, end_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={transactionFilters.sort_by}
                  onChange={(e) => setTransactionFilters({...transactionFilters, sort_by: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="created_at">Date</option>
                  <option value="amount">Amount</option>
                  <option value="user_email">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={transactionFilters.sort_order}
                  onChange={(e) => setTransactionFilters({...transactionFilters, sort_order: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.user_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatNumber(Math.abs(transaction.amount))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{transaction.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transaction.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {transaction.stripe_payment_intent_id && (
                          <button
                            onClick={() => handleRefundTransaction(transaction.id, transaction.stripe_payment_intent_id)}
                            className="text-red-600 hover:text-red-900 mr-2"
                          >
                            Refund
                          </button>
                        )}
                        <button
                          onClick={() => window.open(`/api/admin/credits/users/${transaction.user_id}/transactions`, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View User
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={fetchFinancialData}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
        <button
          onClick={() => window.open('/api/financial/reports', '_blank')}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Generate Report
        </button>
        {selectedUser && (
          <button
            onClick={() => window.open(`/api/admin/credits/users/${selectedUser}/transactions`, '_blank')}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            View Customer Transactions
          </button>
        )}
      </div>

      {/* Subscription Creation Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Manual Subscription</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <select
                    value={subscriptionForm.user_id}
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, user_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.email}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select
                    value={subscriptionForm.product_id}
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, product_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Product</option>
                    {stripeProducts.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <select
                    value={subscriptionForm.price_id}
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, price_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Price</option>
                    {stripeProducts
                      .find(p => p.id === subscriptionForm.product_id)?.prices.map((price) => (
                        <option key={price.id} value={price.id}>
                          {formatCurrency(price.amount / 100)} / {price.interval}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={subscriptionForm.description}
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Subscription description"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubscription}
                  disabled={!subscriptionForm.user_id || !subscriptionForm.product_id || !subscriptionForm.price_id}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinancialDashboard;
