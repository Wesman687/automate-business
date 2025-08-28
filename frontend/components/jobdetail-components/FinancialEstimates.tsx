'use client';

import React, { memo, useCallback } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { Job } from '@/types';

interface FinancialEstimatesProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  onFieldChange: (field: string, value: any) => void;
}

export const FinancialEstimates = memo<FinancialEstimatesProps>(({
  data,
  isEditing,
  editData,
  onFieldChange
}) => {
  const handleInputChange = useCallback((field: string, value: any) => {
    onFieldChange(field, value);
  }, [onFieldChange]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const calculateTotalEstimate = useCallback(() => {
    const hours = editData.estimated_hours || 0;
    const rate = editData.hourly_rate || 0;
    return hours * rate;
  }, [editData.estimated_hours, editData.hourly_rate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h4 className="text-lg font-medium text-gray-900">Financial Estimates</h4>
      </div>

      {/* Basic Financial Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Hours
          </label>
          {isEditing ? (
            <input
              type="number"
              value={editData.estimated_hours || ''}
              onChange={(e) => handleInputChange('estimated_hours', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="0.5"
            />
          ) : (
            <p className="text-gray-900">{data.estimated_hours || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hourly Rate
          </label>
          {isEditing ? (
            <input
              type="number"
              value={editData.hourly_rate || ''}
              onChange={(e) => handleInputChange('hourly_rate', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="1"
            />
          ) : (
            <p className="text-gray-900">{data.hourly_rate ? `$${data.hourly_rate}/hr` : 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fixed Price
          </label>
          {isEditing ? (
            <input
              type="number"
              value={editData.fixed_price || ''}
              onChange={(e) => handleInputChange('fixed_price', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="1"
            />
          ) : (
            <p className="text-gray-900">{data.fixed_price ? formatCurrency(data.fixed_price) : 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actual Hours
          </label>
          {isEditing ? (
            <input
              type="number"
              value={editData.actual_hours || ''}
              onChange={(e) => handleInputChange('actual_hours', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="0.5"
            />
          ) : (
            <p className="text-gray-900">{data.actual_hours || 'Not specified'}</p>
          )}
        </div>
      </div>

      {/* Calculated Estimates */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h5 className="text-sm font-medium text-blue-800">Calculated Estimates</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-md border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Hourly Estimate</div>
            <div className="text-lg font-semibold text-blue-800">
              {editData.estimated_hours && editData.hourly_rate 
                ? formatCurrency(calculateTotalEstimate())
                : 'Not available'
              }
            </div>
            <div className="text-xs text-blue-600">
              {editData.estimated_hours || 0} hrs × ${editData.hourly_rate || 0}/hr
            </div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-md border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Fixed Price</div>
            <div className="text-lg font-semibold text-blue-800">
              {editData.fixed_price ? formatCurrency(editData.fixed_price) : 'Not set'}
            </div>
            <div className="text-xs text-blue-600">
              {editData.fixed_price ? 'Fixed price project' : 'Hourly billing'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

FinancialEstimates.displayName = 'FinancialEstimates';
