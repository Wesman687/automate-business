'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/https';

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: any) => Promise<void>;
}

export default function CreateJobModal({ isOpen, onClose, onSave }: CreateJobModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: new Date().toISOString().split('T')[0],
    deadline: '',
    estimated_hours: '',
    hourly_rate: '',
    fixed_price: '',
    website_url: '',
    notes: '',
    milestones: [] as Array<{ name: string; description: string; due_date: string; completed: boolean }>
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    console.log('Fetching customers...');
    try {

      const data = await api.get('/customers');
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const jobData = {
        ...formData,
        customer_id: parseInt(formData.customer_id),
        start_date: formData.start_date || null,
        deadline: formData.deadline || null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        fixed_price: formData.fixed_price ? parseFloat(formData.fixed_price) : null,
        progress_percentage: 0
      };

      await onSave(jobData);
      onClose();
      setHasDeadline(false);
      setFormData({
        customer_id: '',
        title: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        start_date: new Date().toISOString().split('T')[0],
        deadline: '',
        estimated_hours: '',
        hourly_rate: '',
        fixed_price: '',
        website_url: '',
        notes: '',
        milestones: []
      });
    } catch (error) {
      console.error('Error creating job:', error);
      if (error instanceof Error) {
        setError(`Failed to create job: ${error.message}`);
      } else {
        setError('Failed to create job. Please check all fields and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Create New Job</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id} className="bg-gray-800">
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., Website Development"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Job description and requirements..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="planning" className="bg-gray-800">Planning</option>
                <option value="in_progress" className="bg-gray-800">In Progress</option>
                <option value="on_hold" className="bg-gray-800">On Hold</option>
                <option value="completed" className="bg-gray-800">Completed</option>
                <option value="cancelled" className="bg-gray-800">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="low" className="bg-gray-800">Low</option>
                <option value="medium" className="bg-gray-800">Medium</option>
                <option value="high" className="bg-gray-800">High</option>
                <option value="urgent" className="bg-gray-800">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-2">
                <input
                  type="checkbox"
                  id="hasDeadline"
                  checked={hasDeadline}
                  onChange={(e) => {
                    setHasDeadline(e.target.checked);
                    if (!e.target.checked) {
                      setFormData({ ...formData, deadline: '' });
                    }
                  }}
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <label htmlFor="hasDeadline" className="text-sm font-medium text-gray-300">
                  Set Deadline
                </label>
              </div>
              {hasDeadline && (
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="75.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fixed Price ($) - Optional
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.fixed_price}
              onChange={(e) => setFormData({ ...formData, fixed_price: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="5000.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Website URL - Optional
            </label>
            <input
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Additional notes and requirements..."
            />
          </div>

          {/* Milestones Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Project Milestones
              </label>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  milestones: [...formData.milestones, { name: '', description: '', due_date: '', completed: false }]
                })}
                className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </button>
            </div>
            {formData.milestones.map((milestone, index) => (
              <div key={index} className="bg-gray-700/50 p-4 rounded-lg mb-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-300">Milestone {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      milestones: formData.milestones.filter((_, i) => i !== index)
                    })}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Milestone Name
                    </label>
                    <input
                      type="text"
                      value={milestone.name}
                      onChange={(e) => {
                        const newMilestones = [...formData.milestones];
                        newMilestones[index].name = e.target.value;
                        setFormData({ ...formData, milestones: newMilestones });
                      }}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., Design Phase Complete"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={milestone.due_date}
                      onChange={(e) => {
                        const newMilestones = [...formData.milestones];
                        newMilestones[index].due_date = e.target.value;
                        setFormData({ ...formData, milestones: newMilestones });
                      }}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={milestone.description}
                    onChange={(e) => {
                      const newMilestones = [...formData.milestones];
                      newMilestones[index].description = e.target.value;
                      setFormData({ ...formData, milestones: newMilestones });
                    }}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Milestone description..."
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
