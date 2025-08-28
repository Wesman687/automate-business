'use client';

import React, { memo, useCallback, useState } from 'react';
import { Sparkles, Target, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { api } from '@/lib/https';
import { Job, FinancialBreakdown } from '@/types';

interface AIFinancialGeneratorProps {
  jobData: Job;
  onEstimateGenerated: (breakdown: FinancialBreakdown) => void;
  isCustomer: boolean;
}

export const AIFinancialGenerator = memo<AIFinancialGeneratorProps>(({
  jobData,
  onEstimateGenerated,
  isCustomer
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIEstimate = useCallback(async () => {
    if (isCustomer) {
      setError('AI financial estimation is only available for admin users');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
              const response = await api.post('/ai/generate-financial-estimate', {
        project_type: jobData.brand_style || 'General',
        business_type: jobData.business_type,
        industry: jobData.industry,
        project_goals: jobData.project_goals,
        target_audience: jobData.target_audience,
        budget_range: jobData.budget_range,
        brand_style: jobData.brand_style,
        current_estimated_hours: jobData.estimated_hours,
        current_hourly_rate: jobData.hourly_rate,
        current_fixed_price: jobData.fixed_price
      });

      if (response.data) {
        onEstimateGenerated(response.data);
        setError(null);
      }
    } catch (error) {
      console.error('Failed to generate AI financial estimate:', error);
      setError('Failed to generate AI financial estimate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [jobData, onEstimateGenerated, isCustomer]);

  if (isCustomer) {
    return null; // Don't show AI features to customers
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Sparkles className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-green-900">AI Financial Estimation</h4>
          <p className="text-sm text-green-700">
            Generate intelligent financial estimates based on your project details
          </p>
        </div>
      </div>

      {/* Project Context Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2 text-sm text-green-800">
          <Target className="w-4 h-4" />
          <span>
            <strong>Type:</strong> {jobData.brand_style || 'General'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-800">
          <Users className="w-4 h-4" />
          <span>
            <strong>Business:</strong> {jobData.business_type || 'Not specified'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-800">
          <Calendar className="w-4 h-4" />
          <span>
            <strong>Timeline:</strong> {jobData.timeline || 'Not specified'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-800">
          <DollarSign className="w-4 h-4" />
          <span>
            <strong>Budget:</strong> {jobData.budget_range || 'Not specified'}
          </span>
        </div>
      </div>

      {/* Current Estimates Summary */}
      {(jobData.estimated_hours || jobData.hourly_rate || jobData.fixed_price) && (
        <div className="bg-white border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Current Estimates</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {jobData.estimated_hours && (
              <div>
                <span className="text-green-600 font-medium">Hours:</span> {jobData.estimated_hours}
              </div>
            )}
            {jobData.hourly_rate && (
              <div>
                <span className="text-green-600 font-medium">Rate:</span> ${jobData.hourly_rate}/hr
              </div>
            )}
            {jobData.fixed_price && (
              <div>
                <span className="text-green-600 font-medium">Fixed:</span> ${jobData.fixed_price}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generateAIEstimate}
        disabled={isGenerating}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
          isGenerating
            ? 'bg-green-300 text-green-700 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Generating Estimate...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate AI Financial Estimate</span>
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Info Text */}
      <div className="mt-4 text-xs text-green-600 text-center">
        <p>AI will analyze your project details and suggest optimal pricing, hours, and cost breakdowns</p>
      </div>
    </div>
  );
});

AIFinancialGenerator.displayName = 'AIFinancialGenerator';
