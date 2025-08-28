"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StripeSubscription } from '@/types';

interface Subscription extends StripeSubscription {
  amount: number;
  currency: string;
  product_name: string;
  interval: string;
  interval_count: number;
}

interface SubscriptionManagerProps {
  userId: number;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ userId }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSubscriptions();
  }, [userId]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stripe/subscriptions/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription? You will continue to have access until the end of your current billing period.')) {
      return;
    }

    try {
      setCancellingId(subscriptionId);
      const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Refresh subscriptions
      await fetchSubscriptions();
      
      // Show success message
      alert('Subscription cancelled successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancellingId(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal');
      
      if (!response.ok) {
        throw new Error('Failed to get customer portal URL');
      }
      
      const data = await response.json();
      window.open(data.url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open customer portal');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-red-100 text-red-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Cancelled';
      case 'incomplete':
        return 'Incomplete';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchSubscriptions}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
        <button
          onClick={handleManageBilling}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Manage Billing
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
          <p className="text-gray-500">You don't have any active subscriptions at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {subscription.product_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {subscription.interval_count > 1
                      ? `Every ${subscription.interval_count} ${subscription.interval}s`
                      : `Every ${subscription.interval}`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(subscription.amount, subscription.currency)}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                    {getStatusText(subscription.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Current period:</span>
                  <div className="font-medium">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Next billing:</span>
                  <div className="font-medium">
                    {formatDate(subscription.current_period_end)}
                  </div>
                </div>
              </div>

              {subscription.status === 'active' && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleCancelSubscription(subscription.stripe_subscription_id)}
                    disabled={cancellingId === subscription.stripe_subscription_id}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {cancellingId === subscription.stripe_subscription_id ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
