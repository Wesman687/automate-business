'use client';

import React, { memo, useCallback } from 'react';
import { FileText, Link } from 'lucide-react';
import { Job } from '../interfaces/job';

interface AdditionalResourcesProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  onFieldChange: (field: string, value: any) => void;
}

export const AdditionalResources = memo<AdditionalResourcesProps>(({
  data,
  isEditing,
  editData,
  onFieldChange
}) => {
  const handleInputChange = useCallback((field: string, value: any) => {
    onFieldChange(field, value);
  }, [onFieldChange]);

  const hasResources = data.website_url || data.github_url || data.portfolio_url || 
    (data.social_media && Object.values(data.social_media).some(Boolean)) ||
    data.additional_resource_info;

  const resourceCount = [
    data.website_url,
    data.github_url,
    data.portfolio_url,
    ...(data.social_media ? Object.values(data.social_media) : [])
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-purple-600" />
        <h4 className="text-lg font-medium text-gray-900">Additional Resources & Notes</h4>
      </div>

      {/* Additional Resource Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Resources & Notes
        </label>
        {isEditing ? (
          <textarea
            value={editData.additional_resource_info || ''}
            onChange={(e) => handleInputChange('additional_resource_info', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Add any additional resources, references, or notes..."
          />
        ) : (
          <div className="min-h-[60px]">
            {data.additional_resource_info ? (
              <p className="text-gray-900">{data.additional_resource_info}</p>
            ) : (
              <p className="text-gray-500 italic">No additional resources or notes provided</p>
            )}
          </div>
        )}
      </div>

      {/* Resources Summary */}
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center space-x-2 mb-3">
          <Link className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Resources Summary</span>
        </div>
        
        <div className="text-sm text-purple-800 space-y-2">
          {/* Website Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-center space-x-2">
              <span className={data.website_url ? 'text-green-600' : 'text-red-600'}>
                {data.website_url ? '✓' : '✗'}
              </span>
              <span><strong>Website:</strong> {data.website_url ? 'Provided' : 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={data.github_url ? 'text-green-600' : 'text-red-600'}>
                {data.github_url ? '✓' : '✗'}
              </span>
              <span><strong>GitHub:</strong> {data.github_url ? 'Provided' : 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={data.portfolio_url ? 'text-green-600' : 'text-red-600'}>
                {data.portfolio_url ? '✓' : '✗'}
              </span>
              <span><strong>Portfolio:</strong> {data.portfolio_url ? 'Provided' : 'Not provided'}</span>
            </div>
          </div>

          {/* Social Media Summary */}
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✓</span>
            <span>
              <strong>Social Media:</strong> {
                data.social_media && Object.values(data.social_media).filter(Boolean).length > 0
                  ? `${Object.values(data.social_media).filter(Boolean).length} platform(s) linked`
                  : 'No social media links'
              }
            </span>
          </div>

          {/* Additional Notes Summary */}
          {data.additional_resource_info && (
            <div className="flex items-start space-x-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <div>
                <strong>Additional Notes:</strong>
                <p className="text-purple-700 mt-1">
                  {data.additional_resource_info.length > 100 
                    ? `${data.additional_resource_info.substring(0, 100)}...` 
                    : data.additional_resource_info
                  }
                </p>
              </div>
            </div>
          )}

          {/* Overall Summary */}
          <div className="pt-2 border-t border-purple-200">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Resources:</span>
              <span className="font-bold text-purple-900">
                {resourceCount} resource{resourceCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {hasResources ? 'Project has comprehensive resource information' : 'Project needs more resource information'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AdditionalResources.displayName = 'AdditionalResources';
