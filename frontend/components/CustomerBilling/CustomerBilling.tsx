"use client";

import React, { useState, useEffect } from 'react';
import { Invoice, StripeSubscription, CreditDispute, CustomerBillingData } from '@/types';



const CustomerBilling: React.FC = () => {
  const [data, setData] = useState<CustomerBillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'subscriptions' | 'disputes' | 'payment-methods'>('overview');
  
  // Dispute form
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    transaction_id: '',
    reason: '',
    description: '',
    requested_refund: 0
  });
  
  // Payment form
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    description: '',
    payment_method_id: ''
  });

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customer/billing');
      
      if (!response.ok) {
        throw new Error('Failed to fetch billing data');
      }
      
      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDispute = async () => {
    try {
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(disputeForm),
      });

      if (response.ok) {
        setShowDisputeModal(false);
        setDisputeForm({ transaction_id: '', reason: '', description: '', requested_refund: 0 });
        fetchBillingData(); // Refresh data
        alert('Dispute submitted successfully');
      }
    } catch (err) {
      console.error('Error submitting dispute:', err);
      alert('Failed to submit dispute');
    }
  };

  const handlePayment = async () => {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount) * 100, // Convert to cents
          description: paymentForm.description,
          payment_method_id: paymentForm.payment_method_id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Handle payment confirmation
        setShowPaymentModal(false);
        setPaymentForm({ amount: '', description: '', payment_method_id: '' });
        fetchBillingData(); // Refresh data
        alert('Payment processed successfully');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Failed to process payment');
    }
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    if (invoice.status === 'paid') {
      alert('This invoice is already paid');
      return;
    }

    setPaymentForm({
      amount: (invoice.amount / 100).toString(), // Convert from cents
      description: `Payment for invoice ${invoice.number}`,
      payment_method_id: data?.payment_methods[0]?.id || ''
    });
    setShowPaymentModal(true);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Convert from cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
      case 'past_due':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-orange-100 text-orange-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          onClick={fetchBillingData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return <div>No billing data available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your invoices, subscriptions, and payment methods
        </p>
      </div>

      {/* Credit Balance Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Credit Balance</h3>
            <p className="text-3xl font-bold text-blue-600">{data.credit_balance} credits</p>
            <p className="text-sm text-gray-500">Available for services</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.open('/api/stripe/create-checkout-session', '_blank')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Buy Credits
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Add Payment Method
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'invoices', label: 'Invoices' },
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'disputes', label: 'Disputes' },
            { id: 'payment-methods', label: 'Payment Methods' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Invoices</h3>
            <div className="space-y-3">
              {data.invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{invoice.number}</p>
                    <p className="text-xs text-gray-500">{formatDate(invoice.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(invoice.amount, invoice.currency)}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveTab('invoices')}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View all invoices
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Active Subscriptions</h3>
            <div className="space-y-3">
              {data.subscriptions.filter(s => s.status === 'active').map((subscription) => (
                <div key={subscription.id} className="border-l-4 border-green-400 pl-3">
                  <p className="text-sm font-medium text-gray-900">{subscription.product_name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(subscription.amount || 0, subscription.currency || 'USD')} / {subscription.interval}</p>
                  <p className="text-xs text-gray-400">Next billing: {formatDate(subscription.next_billing_date || '')}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Manage subscriptions
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Disputes</h3>
            <div className="space-y-3">
              {data.disputes.slice(0, 3).map((dispute) => (
                <div key={dispute.id} className="border-l-4 border-yellow-400 pl-3">
                  <p className="text-sm font-medium text-gray-900">{dispute.reason}</p>
                  <p className="text-xs text-gray-500">{formatDate(dispute.created_at)}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dispute.status)}`}>
                    {dispute.status}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveTab('disputes')}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View all disputes
            </button>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Make Payment
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">#{invoice.number}</div>
                          <div className="text-sm text-gray-500">{invoice.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => handlePayInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Pay Now
                          </button>
                        )}
                        <button
                          onClick={() => window.open(`/api/customer/invoices/${invoice.id}/download`, '_blank')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Download
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

      {activeTab === 'subscriptions' && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Subscriptions</h3>
              <button
                onClick={() => window.open('/api/stripe/customer-portal', '_blank')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Manage Subscriptions
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.subscriptions.map((subscription) => (
                <div key={subscription.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-medium text-gray-900">{subscription.product_name}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Amount:</strong> {formatCurrency(subscription.amount || 0, subscription.currency || 'USD')} / {subscription.interval}</p>
                    <p><strong>Current Period:</strong> {formatDate(subscription.current_period_start || '')} - {formatDate(subscription.current_period_end || '')}</p>
                    <p><strong>Next Billing:</strong> {formatDate(subscription.next_billing_date || '')}</p>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => window.open(`/api/stripe/subscriptions/${subscription.stripe_subscription_id}/cancel`, '_blank')}
                      className="text-red-600 hover:text-red-900 text-sm underline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => window.open(`/api/stripe/subscriptions/${subscription.stripe_subscription_id}/update`, '_blank')}
                      className="text-blue-600 hover:text-blue-900 text-sm underline"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'disputes' && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Disputes</h3>
              <button
                onClick={() => setShowDisputeModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Submit Dispute
              </button>
            </div>
            
            <div className="space-y-4">
              {data.disputes.map((dispute) => (
                <div key={dispute.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{dispute.reason}</h4>
                      <p className="text-sm text-gray-500">Transaction: {dispute.transaction_id}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{dispute.reason || ''}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Requested Refund: {formatCurrency(dispute.requested_refund || 0)}</span>
                    <span>Submitted: {formatDate(dispute.created_at)}</span>
                  </div>
                  
                  {dispute.resolution_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700"><strong>Resolution:</strong> {dispute.resolution_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payment-methods' && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
              <button
                onClick={() => window.open('/api/stripe/customer-portal', '_blank')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Manage Payment Methods
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.payment_methods.map((method) => (
                <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-gray-600">{method.brand.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{method.brand} •••• {method.last4}</p>
                      <p className="text-xs text-gray-500">Expires {method.exp_month}/{method.exp_year}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/api/stripe/payment-methods/${method.id}/update`, '_blank')}
                      className="text-blue-600 hover:text-blue-900 text-sm underline"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => window.open(`/api/stripe/payment-methods/${method.id}/delete`, '_blank')}
                      className="text-red-600 hover:text-red-900 text-sm underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Dispute</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                  <input
                    type="text"
                    value={disputeForm.transaction_id}
                    onChange={(e) => setDisputeForm({...disputeForm, transaction_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter transaction ID"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <select
                    value={disputeForm.reason}
                    onChange={(e) => setDisputeForm({...disputeForm, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select reason</option>
                    <option value="Service not delivered">Service not delivered</option>
                    <option value="Incorrect amount charged">Incorrect amount charged</option>
                    <option value="Duplicate charge">Duplicate charge</option>
                    <option value="Unauthorized charge">Unauthorized charge</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={disputeForm.description}
                    onChange={(e) => setDisputeForm({...disputeForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Provide detailed description of the issue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested Refund (credits)</label>
                  <input
                    type="number"
                    value={disputeForm.requested_refund}
                    onChange={(e) => setDisputeForm({...disputeForm, requested_refund: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitDispute}
                  disabled={!disputeForm.transaction_id || !disputeForm.reason || !disputeForm.description}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Make Payment</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Payment description"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.payment_method_id}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_method_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select payment method</option>
                    {data.payment_methods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.brand} •••• {method.last4}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!paymentForm.amount || !paymentForm.description || !paymentForm.payment_method_id}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBilling;
