'use client';

import React, { memo, useCallback, useMemo, useState } from 'react';
import { DollarSign, Calculator, TrendingUp, Edit3, Save } from 'lucide-react';
import { FinancialBreakdown } from '@/types';

interface CostBreakdownProps {
  financialBreakdown: FinancialBreakdown | null;
  onBreakdownUpdate: (breakdown: FinancialBreakdown) => void;
  isCustomer: boolean;
}

export const CostBreakdown = memo<CostBreakdownProps>(({
  financialBreakdown,
  onBreakdownUpdate,
  isCustomer
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableCosts, setEditableCosts] = useState<FinancialBreakdown | null>(null);

  const handleEditCosts = useCallback(() => {
    if (financialBreakdown) {
      setEditableCosts({ ...financialBreakdown });
      setIsEditing(true);
    }
  }, [financialBreakdown]);

  const handleSaveCosts = useCallback(() => {
    if (editableCosts) {
      onBreakdownUpdate(editableCosts);
      setEditableCosts(null);
      setIsEditing(false);
    }
  }, [editableCosts, onBreakdownUpdate]);

  const handleCancelEdit = useCallback(() => {
    setEditableCosts(null);
    setIsEditing(false);
  }, []);

  const handleCostChange = useCallback((field: keyof FinancialBreakdown, value: number) => {
    if (editableCosts) {
      setEditableCosts({ ...editableCosts, [field]: value });
    }
  }, [editableCosts]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const totalProjectCost = useMemo(() => {
    if (!financialBreakdown) return 0;
    return financialBreakdown.labor_cost + financialBreakdown.project_costs;
  }, [financialBreakdown]);

  const totalMonthlyCost = useMemo(() => {
    if (!financialBreakdown) return 0;
    return financialBreakdown.monthly_maintenance + financialBreakdown.monthly_support + financialBreakdown.monthly_hosting;
  }, [financialBreakdown]);

  if (!financialBreakdown) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">No Cost Breakdown</h4>
        <p className="text-gray-600">
          Generate an AI financial estimate to see detailed cost breakdowns.
        </p>
      </div>
    );
  }

  const costs = editableCosts || financialBreakdown;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          <h4 className="text-lg font-medium text-gray-900">Cost Breakdown</h4>
        </div>
        {!isCustomer && (
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveCosts}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors"
                >
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleEditCosts}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Costs</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Project Costs */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h5 className="text-lg font-semibold text-gray-900">Project Costs</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Labor Costs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Labor Cost</span>
              {isEditing ? (
                <input
                  type="number"
                  value={costs.labor_cost}
                  onChange={(e) => handleCostChange('labor_cost', parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                  step="1"
                />
              ) : (
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(costs.labor_cost)}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {costs.estimated_hours} hours × ${costs.recommended_hourly_rate}/hr
            </div>
          </div>

          {/* Project Costs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Project Costs</span>
              {isEditing ? (
                <input
                  type="number"
                  value={costs.project_costs}
                  onChange={(e) => handleCostChange('project_costs', parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                  step="1"
                />
              ) : (
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(costs.project_costs)}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Materials, tools, and services
            </div>
          </div>
        </div>

        {/* Total Project Cost */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total Project Cost</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalProjectCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Costs */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h5 className="text-lg font-semibold text-gray-900">Monthly Costs</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Maintenance */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-2">Maintenance</div>
            {isEditing ? (
              <input
                type="number"
                value={costs.monthly_maintenance}
                onChange={(e) => handleCostChange('monthly_maintenance', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-green-300 rounded text-center text-lg font-semibold text-green-800"
                min="0"
                step="1"
              />
            ) : (
              <div className="text-lg font-semibold text-green-800">
                {formatCurrency(costs.monthly_maintenance)}
              </div>
            )}
          </div>

          {/* Support */}
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-2">Support</div>
            {isEditing ? (
              <input
                type="number"
                value={costs.monthly_support}
                onChange={(e) => handleCostChange('monthly_support', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-blue-300 rounded text-center text-lg font-semibold text-blue-800"
                min="0"
                step="1"
              />
            ) : (
              <div className="text-lg font-semibold text-blue-800">
                {formatCurrency(costs.monthly_support)}
              </div>
            )}
          </div>

          {/* Hosting */}
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium mb-2">Hosting</div>
            {isEditing ? (
              <input
                type="number"
                value={costs.monthly_hosting}
                onChange={(e) => handleCostChange('monthly_hosting', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-purple-300 rounded text-center text-lg font-semibold text-purple-800"
                min="0"
                step="1"
              />
            ) : (
              <div className="text-lg font-semibold text-purple-800">
                {formatCurrency(costs.monthly_hosting)}
              </div>
            )}
          </div>
        </div>

        {/* Total Monthly Cost */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total Monthly Cost</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(totalMonthlyCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {costs.breakdown_notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-yellow-800">Notes</span>
          </div>
          <p className="text-sm text-yellow-700">{costs.breakdown_notes}</p>
        </div>
      )}
    </div>
  );
});

CostBreakdown.displayName = 'CostBreakdown';
