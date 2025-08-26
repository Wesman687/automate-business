'use client';

import React, { useCallback } from 'react';
import { Building2, Calendar, Clock, Target, Users } from 'lucide-react';
import { Job } from '../interfaces/job';
import { FormField, FormInput, FormTextarea, FormSelect, StatusBadge } from '../ui';

interface JobBasicInfoProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  setEditData: (data: Job) => void;
}

export default function JobBasicInfo({ data, isEditing, editData, setEditData }: JobBasicInfoProps) {
  const handleInputChange = useCallback((field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  }, [editData, setEditData]);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'on_hold', label: 'On Hold' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Building2 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <FormField label="Job Title" name="title" icon={Target} required>
          {isEditing ? (
            <FormInput
              type="text"
              value={editData.title || ''}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="Enter job title"
            />
          ) : (
            <p className="text-gray-900">{data.title}</p>
          )}
        </FormField>

        {/* Status */}
        <FormField label="Status" name="status" icon={Target}>
          {isEditing ? (
            <FormSelect
              value={editData.status || ''}
              onChange={(value) => handleInputChange('status', value)}
              options={statusOptions}
              placeholder="Select status"
            />
          ) : (
            <StatusBadge status={data.status} />
          )}
        </FormField>

        {/* Description */}
        <FormField label="Description" name="description" icon={Target} className="md:col-span-2">
          {isEditing ? (
            <FormTextarea
              value={editData.description || ''}
              onChange={(value) => handleInputChange('description', value)}
              placeholder="Enter job description"
              rows={3}
            />
          ) : (
            <p className="text-gray-900">{data.description || 'No description provided'}</p>
          )}
        </FormField>

        {/* Dates */}
        <FormField label="Start Date" name="start_date" icon={Calendar}>
          {isEditing ? (
            <FormInput
              type="date"
              value={editData.start_date || ''}
              onChange={(value) => handleInputChange('start_date', value)}
            />
          ) : (
            <p className="text-gray-900">{data.start_date || 'Not set'}</p>
          )}
        </FormField>

        <FormField label="Deadline" name="deadline" icon={Clock}>
          {isEditing ? (
            <FormInput
              type="date"
              value={editData.deadline || ''}
              onChange={(value) => handleInputChange('deadline', value)}
            />
          ) : (
            <p className="text-gray-900">{data.deadline || 'Not set'}</p>
          )}
        </FormField>

        {/* Progress */}
        <FormField label="Progress" name="progress_percentage" icon={Target} className="md:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${data.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm text-gray-600 w-16 text-right">
                {data.progress_percentage}%
              </span>
            </div>
            {isEditing && (
              <input
                type="range"
                min="0"
                max="100"
                value={editData.progress_percentage || 0}
                onChange={(e) => handleInputChange('progress_percentage', parseInt(e.target.value))}
                className="w-full"
              />
            )}
          </div>
        </FormField>
      </div>
    </div>
  );
}
