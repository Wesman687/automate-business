'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { 
  User, 
  RecurringPaymentCreateRequest 
} from '@/types';

interface CreateRecurringPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: RecurringPaymentCreateRequest) => Promise<void>;
}

export default function CreateRecurringPaymentModal({ isOpen, onClose, onSave }: CreateRecurringPaymentModalProps) {
  const [customers, setCustomers] = useState<User[]>([]);
  const [formData, setFormData] = useState<Partial<RecurringPaymentCreateRequest>>({
    customer_id: 0,
    name: '',
    amount: 0,
    currency: 'USD',
    interval: 'monthly',
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.customer_id || !formData.name || !formData.amount) {
        throw new Error('Customer, name, and amount are required');
      }

      const paymentData: RecurringPaymentCreateRequest = {
        customer_id: formData.customer_id,
        name: formData.name,
        amount: formData.amount,
        currency: formData.currency || 'USD',
        interval: formData.interval || 'monthly',
        status: formData.status || 'active',
        start_date: formData.start_date || new Date().toISOString().split('T')[0],
        description: formData.description
      };

      await onSave(paymentData);
      onClose();
      setFormData({
        customer_id: 0,
        name: '',
        amount: 0,
        currency: 'USD',
        interval: 'monthly',
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        description: ''
      });
    } catch (error) {
      setError('Failed to create recurring payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">Setup Recurring Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Customer <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.customer_id || ''}
              onChange={(e) => setFormData({ ...formData, customer_id: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name || customer.email} ({customer.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Payment Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Monthly Subscription"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Amount <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Billing Interval
            </label>
            <select
              value={formData.interval}
              onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Payment description"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white/80 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Recurring Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
