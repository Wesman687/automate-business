'use client';

import React, { memo, useCallback } from 'react';
import { Globe, Github, Link, ExternalLink } from 'lucide-react';
import { Job } from '../interfaces/job';

interface WebsiteLinksProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  onFieldChange: (field: string, value: any) => void;
}

export const WebsiteLinks = memo<WebsiteLinksProps>(({
  data,
  isEditing,
  editData,
  onFieldChange
}) => {
  const handleInputChange = useCallback((field: string, value: any) => {
    onFieldChange(field, value);
  }, [onFieldChange]);

  const validateUrl = useCallback((url: string) => {
    if (!url) return true;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  }, []);

  const formatUrl = useCallback((url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  }, []);

  const websiteFields = [
    {
      key: 'website_url',
      label: 'Website URL',
      icon: Globe,
      placeholder: 'https://example.com'
    },
    {
      key: 'github_url',
      label: 'GitHub Repository',
      icon: Github,
      placeholder: 'https://github.com/username/repo'
    },
    {
      key: 'portfolio_url',
      label: 'Portfolio URL',
      icon: Link,
      placeholder: 'https://portfolio.example.com'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Globe className="w-5 h-5 text-indigo-600" />
        <h4 className="text-lg font-medium text-gray-900">Website Links</h4>
      </div>

      {/* Website Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {websiteFields.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Icon className="inline w-4 h-4 mr-1" />
              {label}
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={editData[key as keyof Job] || ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={placeholder}
                />
                {editData[key as keyof Job] && !validateUrl(editData[key as keyof Job] as string) && (
                  <p className="text-sm text-red-600">Please enter a valid URL</p>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {data[key as keyof Job] ? (
                  <a
                    href={formatUrl(data[key as keyof Job] as string)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <span>{data[key as keyof Job]}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <p className="text-gray-500">No {label.toLowerCase()} provided</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

WebsiteLinks.displayName = 'WebsiteLinks';
