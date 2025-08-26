'use client';

import React, { useState, useCallback } from 'react';
import { DollarSign } from 'lucide-react';
import { Job, FinancialBreakdown } from '../interfaces/job';
import { FinancialEstimates } from './FinancialEstimates';
import { AIFinancialGenerator } from './AIFinancialGenerator';
import { CostBreakdown } from './CostBreakdown';
import { DiscountManager } from './DiscountManager';

interface JobFinancialProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  setEditData: (data: Job) => void;
  isCustomer: boolean;
  onSave?: () => void;
}

export default function JobFinancial({ data, isEditing, editData, setEditData, isCustomer, onSave }: JobFinancialProps) {
  const [financialBreakdown, setFinancialBreakdown] = useState<FinancialBreakdown | null>(null);
  const [discounts, setDiscounts] = useState({ projectDiscount: 0, monthlyDiscount: 0 });

  const handleFieldChange = useCallback((field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  }, [editData, setEditData]);

  const handleEstimateGenerated = useCallback((breakdown: FinancialBreakdown) => {
    setFinancialBreakdown(breakdown);
    // Update job data with AI estimates
    handleFieldChange('estimated_hours', breakdown.estimated_hours);
    handleFieldChange('hourly_rate', breakdown.recommended_hourly_rate);
    handleFieldChange('fixed_price', breakdown.fixed_price_estimate);
  }, [handleFieldChange]);

  const handleBreakdownUpdate = useCallback((breakdown: FinancialBreakdown) => {
    setFinancialBreakdown(breakdown);
  }, []);

  const handleDiscountChange = useCallback((type: 'projectDiscount' | 'monthlyDiscount', value: number) => {
    setDiscounts(prev => ({ ...prev, [type]: value }));
  }, []);

  const calculateTotalProjectCost = useCallback(() => {
    if (!financialBreakdown) return 0;
    return financialBreakdown.labor_cost + financialBreakdown.project_costs;
  }, [financialBreakdown]);

  const calculateTotalMonthlyCost = useCallback(() => {
    if (!financialBreakdown) return 0;
    return financialBreakdown.monthly_maintenance + financialBreakdown.monthly_support + financialBreakdown.monthly_hosting;
  }, [financialBreakdown]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <DollarSign className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-900">Financial Information</h3>
      </div>

      {/* AI Financial Generator */}
      <AIFinancialGenerator 
        jobData={editData}
        onEstimateGenerated={handleEstimateGenerated}
        isCustomer={isCustomer}
      />

      {/* Financial Estimates */}
      <FinancialEstimates
        data={data}
        isEditing={isEditing}
        editData={editData}
        onFieldChange={handleFieldChange}
      />

      {/* Cost Breakdown */}
      <CostBreakdown
        financialBreakdown={financialBreakdown}
        onBreakdownUpdate={handleBreakdownUpdate}
        isCustomer={isCustomer}
      />

      {/* Discount Manager */}
      <DiscountManager
        projectDiscount={discounts.projectDiscount}
        monthlyDiscount={discounts.monthlyDiscount}
        onDiscountChange={handleDiscountChange}
        totalProjectCost={calculateTotalProjectCost()}
        totalMonthlyCost={calculateTotalMonthlyCost()}
      />
    </div>
  );
}
