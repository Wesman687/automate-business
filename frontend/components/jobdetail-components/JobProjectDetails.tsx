'use client';

import React from 'react';
import { Target, Users, Calendar, DollarSign } from 'lucide-react';

import { JobDetailData } from '../interfaces/job';

interface JobProjectDetailsProps {
  data: JobDetailData;
  isEditing: boolean;
  editData: JobDetailData;
  setEditData: (data: JobDetailData) => void;
}

export default function JobProjectDetails({ data, isEditing, editData, setEditData }: JobProjectDetailsProps) {
  const handleInputChange = (field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  };

  const budgetRanges = [
    'Under $5,000',
    '$5,000 - $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000 - $100,000',
    '$100,000+'
  ];

  const timelineOptions = [
    '1-2 weeks',
    '2-4 weeks',
    '1-2 months',
    '2-3 months',
    '3-6 months',
    '6+ months'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Target className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Goals */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Goals
          </label>
          {isEditing ? (
            <textarea
              value={editData.project_goals || ''}
              onChange={(e) => handleInputChange('project_goals', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe the main objectives and goals of this project..."
            />
          ) : (
            <p className="text-gray-900">{data.project_goals || 'No project goals specified'}</p>
          )}
        </div>

        {/* Target Audience */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience
          </label>
          {isEditing ? (
            <textarea
              value={editData.target_audience || ''}
              onChange={(e) => handleInputChange('target_audience', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe the target audience for this project..."
            />
          ) : (
            <p className="text-gray-900">{data.target_audience || 'No target audience specified'}</p>
          )}
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Timeline
          </label>
          {isEditing ? (
            <select
              value={editData.timeline || ''}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select timeline</option>
              {timelineOptions.map((timeline) => (
                <option key={timeline} value={timeline}>{timeline}</option>
              ))}
            </select>
          ) : (
            <p className="text-gray-900">{data.timeline || 'Not specified'}</p>
          )}
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4 mr-1" />
            Budget Range
          </label>
          {isEditing ? (
            <select
              value={editData.budget_range || ''}
              onChange={(e) => handleInputChange('budget_range', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select budget range</option>
              {budgetRanges.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          ) : (
            <p className="text-gray-900">{data.budget_range || 'Not specified'}</p>
          )}
        </div>

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
