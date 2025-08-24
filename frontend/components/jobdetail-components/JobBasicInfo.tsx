'use client';

import React from 'react';
import { Building2, Calendar, Clock, Target, Users } from 'lucide-react';

import { JobDetailData } from '../interfaces/job';

interface JobBasicInfoProps {
  data: JobDetailData;
  isEditing: boolean;
  editData: JobDetailData;
  setEditData: (data: JobDetailData) => void;
}

export default function JobBasicInfo({ data, isEditing, editData, setEditData }: JobBasicInfoProps) {
  const handleInputChange = (field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Building2 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{data.title}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          {isEditing ? (
            <select
              value={editData.status || ''}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          ) : (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              data.status === 'completed' ? 'bg-green-100 text-green-800' :
              data.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              data.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {data.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={editData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{data.description || 'No description provided'}</p>
          )}
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          {isEditing ? (
            <input
              type="date"
              value={editData.start_date || ''}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{data.start_date || 'Not set'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deadline
          </label>
          {isEditing ? (
            <input
              type="date"
              value={editData.deadline || ''}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{data.deadline || 'Not set'}</p>
          )}
        </div>

        {/* Progress */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Progress
          </label>
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
              className="w-full mt-2"
            />
          )}
        </div>
      </div>
    </div>
  );
}
