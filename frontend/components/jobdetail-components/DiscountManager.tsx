'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { DollarSign, Percent, TrendingDown } from 'lucide-react';

interface DiscountManagerProps {
  projectDiscount: number;
  monthlyDiscount: number;
  onDiscountChange: (type: 'projectDiscount' | 'monthlyDiscount', value: number) => void;
  totalProjectCost: number;
  totalMonthlyCost: number;
}

export const DiscountManager = memo<DiscountManagerProps>(({
  projectDiscount,
  monthlyDiscount,
  onDiscountChange,
  totalProjectCost,
  totalMonthlyCost
}) => {
  const handleDiscountChange = useCallback((type: 'projectDiscount' | 'monthlyDiscount', value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    onDiscountChange(type, clampedValue);
  }, [onDiscountChange]);

  const discountedProjectCost = useMemo(() => {
    const discount = projectDiscount / 100;
    return totalProjectCost * (1 - discount);
  }, [totalProjectCost, projectDiscount]);

  const discountedMonthlyCost = useMemo(() => {
    const discount = monthlyDiscount / 100;
    return totalMonthlyCost * (1 - discount);
  }, [totalMonthlyCost, monthlyDiscount]);

  const projectSavings = useMemo(() => {
    return totalProjectCost - discountedProjectCost;
  }, [totalProjectCost, discountedProjectCost]);

  const monthlySavings = useMemo(() => {
    return totalMonthlyCost - discountedMonthlyCost;
  }, [totalMonthlyCost, discountedMonthlyCost]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  if (totalProjectCost === 0 && totalMonthlyCost === 0) {
    return null; // Don't show discounts if no costs
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <TrendingDown className="w-5 h-5 text-orange-600" />
        <h4 className="text-lg font-medium text-gray-900">Discounts & Savings</h4>
      </div>

      {/* Project Discounts */}
      {totalProjectCost > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h5 className="text-lg font-semibold text-gray-900">Project Discount</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Discount Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={projectDiscount}
                  onChange={(e) => handleDiscountChange('projectDiscount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="1"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Percent className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Original Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Cost
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalProjectCost)}
              </div>
            </div>

            {/* Discounted Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discounted Cost
              </label>
              <div className="text-lg font-semibold text-orange-600">
                {formatCurrency(discountedProjectCost)}
              </div>
            </div>
          </div>

          {/* Savings Display */}
          {projectDiscount > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">Total Savings</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(projectSavings)}
                </span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                You save {projectDiscount}% on this project
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly Discounts */}
      {totalMonthlyCost > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h5 className="text-lg font-semibold text-gray-900">Monthly Discount</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Discount Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={monthlyDiscount}
                  onChange={(e) => handleDiscountChange('monthlyDiscount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="1"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Percent className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Original Monthly Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Monthly
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalMonthlyCost)}
              </div>
            </div>

            {/* Discounted Monthly Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discounted Monthly
              </label>
              <div className="text-lg font-semibold text-orange-600">
                {formatCurrency(discountedMonthlyCost)}
              </div>
            </div>
          </div>

          {/* Monthly Savings Display */}
          {monthlyDiscount > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">Monthly Savings</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(monthlySavings)}
                </span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                You save {monthlyDiscount}% every month
              </div>
            </div>
          )}
        </div>
      )}

      {/* Total Savings Summary */}
      {(projectDiscount > 0 || monthlyDiscount > 0) && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingDown className="w-6 h-6 text-green-600" />
            <h5 className="text-lg font-semibold text-green-900">Total Savings Summary</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-2">Project Savings</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(projectSavings)}
              </div>
              <div className="text-xs text-green-600">
                {projectDiscount > 0 ? `${projectDiscount}% off` : 'No discount'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-2">Monthly Savings</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(monthlySavings)}
              </div>
              <div className="text-xs text-blue-600">
                {monthlyDiscount > 0 ? `${monthlyDiscount}% off` : 'No discount'}
              </div>
            </div>
          </div>

          {/* Annual Savings */}
          {monthlySavings > 0 && (
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600 font-medium mb-1">Annual Savings</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(monthlySavings * 12)}
              </div>
              <div className="text-xs text-gray-500">
                Based on monthly discount of {monthlyDiscount}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

DiscountManager.displayName = 'DiscountManager';
