'use client';

import React, { memo, useCallback, useState } from 'react';
import { Sparkles, Target, Users, Calendar, DollarSign } from 'lucide-react';
import { api } from '@/lib/https';
import { Job } from '../interfaces/job';

interface AIPlanGeneratorProps {
  jobData: Job;
  onPlanGenerated: (plan: any) => void;
  isCustomer: boolean;
}

export const AIPlanGenerator = memo<AIPlanGeneratorProps>(({
  jobData,
  onPlanGenerated,
  isCustomer
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIPlan = useCallback(async () => {
    if (isCustomer) {
      setError('AI plan generation is only available for admin users');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
              const response = await api.post('/ai/generate-project-plan', {
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
        onPlanGenerated(response.data);
      }
    } catch (error) {
      console.error('Failed to generate AI plan:', error);
      setError('Failed to generate AI plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [jobData, onPlanGenerated, isCustomer]);

  if (isCustomer) {
    return null; // Don't show AI features to customers
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Sparkles className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-blue-900">AI-Powered Project Planning</h4>
          <p className="text-sm text-blue-700">
            Generate intelligent project plans based on your project details
          </p>
        </div>
      </div>

      {/* Project Context Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2 text-sm text-blue-800">
          <Target className="w-4 h-4" />
          <span>
            <strong>Type:</strong> {jobData.brand_style || 'General'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-blue-800">
          <Users className="w-4 h-4" />
          <span>
            <strong>Business:</strong> {jobData.business_type || 'Not specified'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-blue-800">
          <Calendar className="w-4 h-4" />
          <span>
            <strong>Timeline:</strong> {jobData.timeline || 'Not specified'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-blue-800">
          <DollarSign className="w-4 h-4" />
          <span>
            <strong>Budget:</strong> {jobData.budget_range || 'Not specified'}
          </span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateAIPlan}
        disabled={isGenerating}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
          isGenerating
            ? 'bg-blue-300 text-blue-700 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Generating Plan...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate AI Project Plan</span>
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
      <div className="mt-4 text-xs text-blue-600 text-center">
        <p>AI will analyze your project details and suggest optimal milestones, deliverables, and timelines</p>
      </div>
    </div>
  );
});

AIPlanGenerator.displayName = 'AIPlanGenerator';
