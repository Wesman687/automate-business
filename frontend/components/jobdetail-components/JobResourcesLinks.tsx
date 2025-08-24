'use client';

import React from 'react';
import { Globe, Github, ExternalLink, Link } from 'lucide-react';

import { JobDetailData } from '../interfaces/job';

interface JobResourcesLinksProps {
  data: JobDetailData;
  isEditing: boolean;
  editData: JobDetailData;
  setEditData: (data: JobDetailData) => void;
}

export default function JobResourcesLinks({ data, isEditing, editData, setEditData }: JobResourcesLinksProps) {
  const handleInputChange = (field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    const socialMedia = { ...editData.social_media, [platform]: value };
    handleInputChange('social_media', socialMedia);
  };

  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: '📘' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { key: 'instagram', label: 'Instagram', icon: '📷' },
    { key: 'twitter', label: 'Twitter', icon: '🐦' },
    { key: 'youtube', label: 'YouTube', icon: '📺' }
  ];

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const formatUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Globe className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Resources & Links</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Website URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="inline w-4 h-4 mr-1" />
            Website URL
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="url"
                value={editData.website_url || ''}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
              {editData.website_url && !validateUrl(editData.website_url) && (
                <p className="text-sm text-red-600">Please enter a valid URL</p>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {data.website_url ? (
                <>
                  <a
                    href={formatUrl(data.website_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <span>{data.website_url}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              ) : (
                <p className="text-gray-500">No website URL provided</p>
              )}
            </div>
          )}
        </div>

        {/* GitHub URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Github className="inline w-4 h-4 mr-1" />
            GitHub Repository
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="url"
                value={editData.github_url || ''}
                onChange={(e) => handleInputChange('github_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://github.com/username/repo"
              />
              {editData.github_url && !validateUrl(editData.github_url) && (
                <p className="text-sm text-red-600">Please enter a valid URL</p>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {data.github_url ? (
                <>
                  <a
                    href={formatUrl(data.github_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <span>{data.github_url}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              ) : (
                <p className="text-gray-500">No GitHub repository provided</p>
              )}
            </div>
          )}
        </div>

        {/* Portfolio URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Link className="inline w-4 h-4 mr-1" />
            Portfolio URL
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="url"
                value={editData.portfolio_url || ''}
                onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://portfolio.example.com"
              />
              {editData.portfolio_url && !validateUrl(editData.portfolio_url) && (
                <p className="text-sm text-red-600">Please enter a valid URL</p>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {data.portfolio_url ? (
                <>
                  <a
                    href={formatUrl(data.portfolio_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <span>{data.portfolio_url}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              ) : (
                <p className="text-gray-500">No portfolio URL provided</p>
              )}
            </div>
          )}
        </div>

        {/* Social Media */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Social Media Links
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialPlatforms.map(({ key, label, icon }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {icon} {label}
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editData.social_media?.[key] || ''}
                    onChange={(e) => handleSocialMediaChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder={`${label} URL`}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    {data.social_media?.[key] ? (
                      <a
                        href={formatUrl(data.social_media[key])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center space-x-1"
                      >
                        <span>{data.social_media[key]}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-gray-500 text-sm">Not provided</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resource Info */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Resources & Notes
          </label>
          {isEditing ? (
            <textarea
              value={editData.additional_resource_info || ''}
              onChange={(e) => handleInputChange('additional_resource_info', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="md:col-span-2">
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <div className="flex items-center space-x-2 mb-2">
              <Link className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Resources Summary</span>
            </div>
            <div className="text-sm text-indigo-800 space-y-1">
              {[
                { label: 'Website', url: data.website_url },
                { label: 'GitHub', url: data.github_url },
                { label: 'Portfolio', url: data.portfolio_url }
              ].map(({ label, url }) => (
                <p key={label}>
                  <strong>{label}:</strong> {url ? '✓ Provided' : '✗ Not provided'}
                </p>
              ))}
              {data.social_media && (
                <p>
                  <strong>Social Media:</strong> {
                    Object.values(data.social_media).filter(Boolean).length > 0
                      ? `${Object.values(data.social_media).filter(Boolean).length} platform(s) linked`
                      : 'No social media links'
                  }
                </p>
              )}
              {data.additional_resource_info && (
                <p>
                  <strong>Additional Notes:</strong> {data.additional_resource_info.length > 100 
                    ? `${data.additional_resource_info.substring(0, 100)}...` 
                    : data.additional_resource_info
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
