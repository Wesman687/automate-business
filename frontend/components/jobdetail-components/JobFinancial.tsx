'use client';

import React, { useState } from 'react';
import { DollarSign, Calculator, TrendingUp, Sparkles, Edit3, Save } from 'lucide-react';
import { api } from '@/lib/https';
import ErrorModal from '../ErrorModal';

import { JobDetailData, FinancialBreakdown } from '../interfaces/job';

interface JobFinancialProps {
  data: JobDetailData;
  isEditing: boolean;
  editData: JobDetailData;
  setEditData: (data: JobDetailData) => void;
  isCustomer: boolean;
  onSave?: () => void;
}

export default function JobFinancial({ data, isEditing, editData, setEditData, isCustomer, onSave }: JobFinancialProps) {
  const [financialBreakdown, setFinancialBreakdown] = useState<FinancialBreakdown | null>(null);
  const [editableCosts, setEditableCosts] = useState<FinancialBreakdown | null>(null);
  const [discounts, setDiscounts] = useState({ projectDiscount: 0, monthlyDiscount: 0 });
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string; type: 'error' | 'warning' | 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'error'
  });

  const handleInputChange = (field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  };

  const generateAIEstimate = async () => {
    try {
      const response = await api.post('/ai/generate-financial-estimate', {
        project_type: editData.brand_style || 'General',
        business_type: editData.business_type,
        industry: editData.industry,
        project_goals: editData.project_goals,
        target_audience: editData.target_audience,
        budget_range: editData.budget_range,
        brand_style: editData.brand_style,
        current_estimated_hours: editData.estimated_hours,
        current_hourly_rate: editData.hourly_rate,
        current_fixed_price: editData.fixed_price
      });

      if (response.data) {
        setFinancialBreakdown(response.data);
        // Update job data with AI estimates
        handleInputChange('estimated_hours', response.data.estimated_hours);
        handleInputChange('hourly_rate', response.data.recommended_hourly_rate);
        handleInputChange('fixed_price', response.data.fixed_price_estimate);
        
        setErrorModal({
          show: true,
          message: 'AI financial estimate generated successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      setErrorModal({
        show: true,
        message: 'Failed to generate AI financial estimate. Please try again.',
        type: 'error'
      });
    }
  };

  const handleEditCosts = () => {
    if (financialBreakdown) {
      setEditableCosts({ ...financialBreakdown });
    }
  };

  const handleSaveCosts = () => {
    if (editableCosts) {
      setFinancialBreakdown(editableCosts);
      setEditableCosts(null);
      setErrorModal({
        show: true,
        message: 'Cost breakdown updated successfully!',
        type: 'success'
      });
    }
  };

  const handleCostChange = (field: keyof FinancialBreakdown, value: number) => {
    if (editableCosts) {
      setEditableCosts({ ...editableCosts, [field]: value });
    }
  };

  const handleDiscountChange = (type: 'projectDiscount' | 'monthlyDiscount', value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    setDiscounts({ ...discounts, [type]: clampedValue });
  };

  const calculateDiscountedCosts = () => {
    if (!financialBreakdown) return { projectCost: 0, monthlyCost: 0 };
    
    const projectDiscount = discounts.projectDiscount / 100;
    const monthlyDiscount = discounts.monthlyDiscount / 100;
    
    return {
      projectCost: financialBreakdown.total_project_cost * (1 - projectDiscount),
      monthlyCost: financialBreakdown.total_monthly_cost * (1 - monthlyDiscount)
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const discountedCosts = calculateDiscountedCosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <DollarSign className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Financial Information</h3>
      </div>

      {/* AI Financial Estimation - Admin Only */}
      {!isCustomer && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="text-sm font-medium text-green-800 mb-3">AI Financial Estimation</h4>
          <button
            onClick={generateAIEstimate}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Estimate</span>
          </button>
        </div>
      )}

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
            />
          ) : (
            <p className="text-gray-900">{data.actual_hours || 'Not specified'}</p>
          )}
        </div>
      </div>

      {/* Detailed Financial Breakdown */}
      {financialBreakdown && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Detailed Cost Breakdown</h4>
            {!isCustomer && (
              <button
                onClick={editableCosts ? handleSaveCosts : handleEditCosts}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
              >
                {editableCosts ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{editableCosts ? 'Save Changes' : 'Edit Costs'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* One-time Project Costs */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">One-time Project Costs</h5>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Labor Cost:</span>
                  <span className="text-sm font-medium">
                    {editableCosts ? (
                      <input
                        type="number"
                        value={editableCosts.labor_cost}
                        onChange={(e) => handleCostChange('labor_cost', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    ) : (
                      formatCurrency(financialBreakdown.labor_cost)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Project Costs:</span>
                  <span className="text-sm font-medium">
                    {editableCosts ? (
                      <input
                        type="number"
                        value={editableCosts.project_costs}
                        onChange={(e) => handleCostChange('project_costs', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    ) : (
                      formatCurrency(financialBreakdown.project_costs)
                    )}
                  </span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Project Cost:</span>
                    <span className="text-green-600">
                      {formatCurrency(editableCosts ? editableCosts.total_project_cost : financialBreakdown.total_project_cost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Service Costs */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">Monthly Service Costs</h5>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Maintenance:</span>
                  <span className="text-sm font-medium">
                    {editableCosts ? (
                      <input
                        type="number"
                        value={editableCosts.monthly_maintenance}
                        onChange={(e) => handleCostChange('monthly_maintenance', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    ) : (
                      formatCurrency(financialBreakdown.monthly_maintenance)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Support:</span>
                  <span className="text-sm font-medium">
                    {editableCosts ? (
                      <input
                        type="number"
                        value={editableCosts.monthly_support}
                        onChange={(e) => handleCostChange('monthly_support', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    ) : (
                      formatCurrency(financialBreakdown.monthly_support)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hosting:</span>
                  <span className="text-sm font-medium">
                    {editableCosts ? (
                      <input
                        type="number"
                        value={editableCosts.monthly_hosting}
                        onChange={(e) => handleCostChange('monthly_hosting', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    ) : (
                      formatCurrency(financialBreakdown.monthly_hosting)
                    )}
                  </span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Monthly Cost:</span>
                    <span className="text-blue-600">
                      {formatCurrency(editableCosts ? editableCosts.total_monthly_cost : financialBreakdown.total_monthly_cost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Justification */}
          <div className="mt-6">
            <h5 className="font-medium text-gray-800 mb-2">Cost Justification</h5>
            <p className="text-sm text-gray-600">
              {editableCosts ? editableCosts.breakdown_notes : financialBreakdown.breakdown_notes}
            </p>
          </div>

          {/* Discounts & Promotions */}
          {!isCustomer && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-3">Discounts & Promotions</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Project Cost Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discounts.projectDiscount}
                    onChange={(e) => handleDiscountChange('projectDiscount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Monthly Service Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discounts.monthlyDiscount}
                    onChange={(e) => handleDiscountChange('monthlyDiscount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Discount Summary */}
          {(discounts.projectDiscount > 0 || discounts.monthlyDiscount > 0) && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h5 className="font-medium text-yellow-800 mb-2">Discount Summary</h5>
              <div className="space-y-2 text-sm">
                {discounts.projectDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Project Cost Savings:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(financialBreakdown.total_project_cost - discountedCosts.projectCost)}
                    </span>
                  </div>
                )}
                {discounts.monthlyDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Monthly Service Savings:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(financialBreakdown.total_monthly_cost - discountedCosts.monthlyCost)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Annual Savings:</span>
                    <span className="text-green-600">
                      {formatCurrency(
                        (financialBreakdown.total_project_cost - discountedCosts.projectCost) +
                        ((financialBreakdown.total_monthly_cost - discountedCosts.monthlyCost) * 12)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Pricing Display */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h5 className="font-medium text-green-800 mb-3">Final Pricing</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(discountedCosts.projectCost)}
                </div>
                <div className="text-sm text-green-700">One-time Project Cost</div>
                {discounts.projectDiscount > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    {discounts.projectDiscount}% discount applied
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(discountedCosts.monthlyCost)}
                </div>
                <div className="text-sm text-blue-700">Monthly Service Cost</div>
                {discounts.monthlyDiscount > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    {discounts.monthlyDiscount}% discount applied
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-lg font-medium text-gray-700">
                Annual Recurring Revenue: {formatCurrency(discountedCosts.monthlyCost * 12)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.show}
        onClose={() => setErrorModal({ ...errorModal, show: false })}
        message={errorModal.message}
        type={errorModal.type}
      />
    </div>
  );
}
