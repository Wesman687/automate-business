'use client';

import React, { useCallback } from 'react';
import { Target, Users, Calendar, DollarSign } from 'lucide-react';
import { Job } from '@/types';
import { FormField, FormTextarea, FormSelect } from '../ui';

interface JobProjectDetailsProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  setEditData: (data: Job) => void;
}

export default function JobProjectDetails({ data, isEditing, editData, setEditData }: JobProjectDetailsProps) {
  const handleInputChange = useCallback((field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  }, [editData, setEditData]);

  const budgetRanges = [
    { value: 'Under $5,000', label: 'Under $5,000' },
    { value: '$5,000 - $10,000', label: '$5,000 - $10,000' },
    { value: '$10,000 - $25,000', label: '$10,000 - $25,000' },
    { value: '$25,000 - $50,000', label: '$25,000 - $50,000' },
    { value: '$50,000 - $100,000', label: '$50,000 - $100,000' },
    { value: '$100,000+', label: '$100,000+' }
  ];

  const timelineOptions = [
    { value: '1-2 weeks', label: '1-2 weeks' },
    { value: '2-4 weeks', label: '2-4 weeks' },
    { value: '1-2 months', label: '1-2 months' },
    { value: '2-3 months', label: '2-3 months' },
    { value: '3-6 months', label: '3-6 months' },
    { value: '6+ months', label: '6+ months' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Target className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Goals */}
        <FormField label="Project Goals" name="project_goals" icon={Target} className="md:col-span-2">
          {isEditing ? (
            <FormTextarea
              value={editData.project_goals || ''}
              onChange={(value) => handleInputChange('project_goals', value)}
              placeholder="Describe the main objectives and goals of this project..."
              rows={4}
            />
          ) : (
            <p className="text-gray-900">{data.project_goals || 'No project goals specified'}</p>
          )}
        </FormField>

        {/* Target Audience */}
        <FormField label="Target Audience" name="target_audience" icon={Users} className="md:col-span-2">
          {isEditing ? (
            <FormTextarea
              value={editData.target_audience || ''}
              onChange={(value) => handleInputChange('target_audience', value)}
              placeholder="Describe the target audience for this project..."
              rows={3}
            />
          ) : (
            <p className="text-gray-900">{data.target_audience || 'No target audience specified'}</p>
          )}
        </FormField>

        {/* Timeline */}
        <FormField label="Timeline" name="timeline" icon={Calendar}>
          {isEditing ? (
            <FormSelect
              value={editData.timeline || ''}
              onChange={(value) => handleInputChange('timeline', value)}
              options={timelineOptions}
              placeholder="Select timeline"
            />
          ) : (
            <p className="text-gray-900">{data.timeline || 'Not specified'}</p>
          )}
        </FormField>

        {/* Budget Range */}
        <FormField label="Budget Range" name="budget_range" icon={DollarSign}>
          {isEditing ? (
            <FormSelect
              value={editData.budget_range || ''}
              onChange={(value) => handleInputChange('budget_range', value)}
              options={budgetRanges}
              placeholder="Select budget range"
            />
          ) : (
            <p className="text-gray-900">{data.budget_range || 'Not specified'}</p>
          )}
        </FormField>

        {/* Project Summary */}
        <div className="md:col-span-2">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Project Summary</span>
            </div>
            <div className="text-sm text-purple-800 space-y-1">
              {data.project_goals && (
                <p><strong>Goals:</strong> {data.project_goals.length > 100 ? `${data.project_goals.substring(0, 100)}...` : data.project_goals}</p>
              )}
              {data.target_audience && (
                <p><strong>Audience:</strong> {data.target_audience.length > 100 ? `${data.target_audience.substring(0, 100)}...` : data.target_audience}</p>
              )}
              {(data.timeline || data.budget_range) && (
                <p><strong>Scope:</strong> {data.timeline && `Timeline: ${data.timeline}`} {data.timeline && data.budget_range && ' • '} {data.budget_range && `Budget: ${data.budget_range}`}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
