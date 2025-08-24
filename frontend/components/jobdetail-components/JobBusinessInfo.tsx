'use client';

import React from 'react';
import { Building2, Globe, Target } from 'lucide-react';

import { JobDetailData } from '../interfaces/job';

interface JobBusinessInfoProps {
  data: JobDetailData;
  isEditing: boolean;
  editData: JobDetailData;
  setEditData: (data: JobDetailData) => void;
}

export default function JobBusinessInfo({ data, isEditing, editData, setEditData }: JobBusinessInfoProps) {
  const handleInputChange = (field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Real Estate',
    'Entertainment',
    'Food & Beverage',
    'Automotive',
    'Other'
  ];

  const businessTypes = [
    'Startup',
    'Small Business',
    'Medium Business',
    'Enterprise',
    'Non-profit',
    'Government',
    'Other'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Building2 className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.business_name || ''}
              onChange={(e) => handleInputChange('business_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter business name"
            />
          ) : (
            <p className="text-gray-900">{data.business_name || 'Not specified'}</p>
          )}
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type
          </label>
          {isEditing ? (
            <select
              value={editData.business_type || ''}
              onChange={(e) => handleInputChange('business_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select business type</option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          ) : (
            <p className="text-gray-900">{data.business_type || 'Not specified'}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <select
                value={editData.industry || ''}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {editData.industry === 'Other' && (
                <input
                  type="text"
                  value={editData.industry_other || ''}
                  onChange={(e) => handleInputChange('industry_other', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Specify industry"
                />
              )}
            </div>
          ) : (
            <p className="text-gray-900">
              {data.industry === 'Other' && data.industry_other 
                ? data.industry_other 
                : data.industry || 'Not specified'
              }
            </p>
          )}
        </div>

        {/* Additional Business Info Placeholder */}
        <div className="md:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Business Context</span>
            </div>
            <p className="text-sm text-gray-600">
              {data.business_name 
                ? `This project is for ${data.business_name}, a ${data.business_type || 'business'} in the ${data.industry === 'Other' && data.industry_other ? data.industry_other : data.industry || 'various'} industry.`
                : 'Business information not yet specified. Please fill in the details above to provide context for this project.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
