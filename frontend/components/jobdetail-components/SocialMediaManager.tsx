'use client';

import React, { memo, useCallback } from 'react';
import { Share2, ExternalLink } from 'lucide-react';
import { Job } from '../interfaces/job';

interface SocialMediaManagerProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  onFieldChange: (field: string, value: any) => void;
}

export const SocialMediaManager = memo<SocialMediaManagerProps>(({
  data,
  isEditing,
  editData,
  onFieldChange
}) => {
  const handleSocialMediaChange = useCallback((platform: string, value: string) => {
    const socialMedia = { ...editData.social_media, [platform]: value };
    onFieldChange('social_media', socialMedia);
  }, [editData.social_media, onFieldChange]);

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

  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: '📘' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { key: 'instagram', label: 'Instagram', icon: '📷' },
    { key: 'twitter', label: 'Twitter', icon: '🐦' },
    { key: 'youtube', label: 'YouTube', icon: '📺' },
    { key: 'tiktok', label: 'TikTok', icon: '🎵' },
    { key: 'pinterest', label: 'Pinterest', icon: '📌' },
    { key: 'snapchat', label: 'Snapchat', icon: '👻' }
  ];

  const providedPlatforms = socialPlatforms.filter(
    platform => data.social_media?.[platform.key]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Share2 className="w-5 h-5 text-pink-600" />
        <h4 className="text-lg font-medium text-gray-900">Social Media Links</h4>
        {providedPlatforms.length > 0 && (
          <span className="text-sm text-gray-500">
            ({providedPlatforms.length} platform{providedPlatforms.length !== 1 ? 's' : ''} linked)
          </span>
        )}
      </div>

      {/* Social Media Grid */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                placeholder={`${label} URL`}
              />
            ) : (
              <div className="flex items-center space-x-2">
                {data.social_media?.[key] ? (
                  <a
                    href={formatUrl(data.social_media[key])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-800 text-sm flex items-center space-x-1"
                  >
                    <span>{data.social_media[key]}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">Not provided</p>
                )}
              </div>
            )}
            {isEditing && editData.social_media?.[key] && !validateUrl(editData.social_media[key]) && (
              <p className="text-xs text-red-600 mt-1">Please enter a valid URL</p>
            )}
          </div>
        ))}
      </div>

      {/* Social Media Summary */}
      {!isEditing && providedPlatforms.length > 0 && (
        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
          <div className="flex items-center space-x-2 mb-3">
            <Share2 className="w-4 h-4 text-pink-600" />
            <span className="text-sm font-medium text-pink-700">Social Media Summary</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {providedPlatforms.map(({ key, label, icon }) => (
              <div key={key} className="flex items-center space-x-2 text-sm">
                <span>{icon}</span>
                <span className="text-pink-800">{label}</span>
                <span className="text-pink-600">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

SocialMediaManager.displayName = 'SocialMediaManager';
