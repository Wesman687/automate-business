'use client';

import React, { useCallback } from 'react';
import { Building2, Globe, Target } from 'lucide-react';
import { Job } from '../interfaces/job';
import { FormField, FormInput, FormSelect } from '../ui';

interface JobBusinessInfoProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  setEditData: (data: Job) => void;
}

export default function JobBusinessInfo({ data, isEditing, editData, setEditData }: JobBusinessInfoProps) {
  const handleInputChange = useCallback((field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  }, [editData, setEditData]);

  const industries = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Education', label: 'Education' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Food & Beverage', label: 'Food & Beverage' },
    { value: 'Automotive', label: 'Automotive' },
    { value: 'Other', label: 'Other' }
  ];

  const businessTypes = [
    { value: 'Startup', label: 'Startup' },
    { value: 'Small Business', label: 'Small Business' },
    { value: 'Medium Business', label: 'Medium Business' },
    { value: 'Enterprise', label: 'Enterprise' },
    { value: 'Non-profit', label: 'Non-profit' },
    { value: 'Government', label: 'Government' },
    { value: 'Other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Building2 className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Name */}
        <FormField label="Business Name" name="business_name" icon={Building2}>
          {isEditing ? (
            <FormInput
              type="text"
              value={editData.business_name || ''}
              onChange={(value) => handleInputChange('business_name', value)}
              placeholder="Enter business name"
            />
          ) : (
            <p className="text-gray-900">{data.business_name || 'Not specified'}</p>
          )}
        </FormField>

        {/* Business Type */}
        <FormField label="Business Type" name="business_type" icon={Building2}>
          {isEditing ? (
            <FormSelect
              value={editData.business_type || ''}
              onChange={(value) => handleInputChange('business_type', value)}
              options={businessTypes}
              placeholder="Select business type"
            />
          ) : (
            <p className="text-gray-900">{data.business_type || 'Not specified'}</p>
          )}
        </FormField>

        {/* Industry */}
        <FormField label="Industry" name="industry" icon={Globe}>
          {isEditing ? (
            <div className="space-y-3">
              <FormSelect
                value={editData.industry || ''}
                onChange={(value) => handleInputChange('industry', value)}
                options={industries}
                placeholder="Select industry"
              />
              {editData.industry === 'Other' && (
                <FormInput
                  type="text"
                  value={editData.industry_other || ''}
                  onChange={(value) => handleInputChange('industry_other', value)}
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
        </FormField>

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
