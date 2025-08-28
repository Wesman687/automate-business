'use client';

import React, { useCallback } from 'react';
import { Globe } from 'lucide-react';
import { Job } from '@/types';
import { WebsiteLinks } from './WebsiteLinks';
import { SocialMediaManager } from './SocialMediaManager';
import { AdditionalResources } from './AdditionalResources';

interface JobResourcesLinksProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  setEditData: (data: Job) => void;
}

export default function JobResourcesLinks({ data, isEditing, editData, setEditData }: JobResourcesLinksProps) {
  const handleFieldChange = useCallback((field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  }, [editData, setEditData]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Globe className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-semibold text-gray-900">Resources & Links</h3>
      </div>

      {/* Website Links */}
      <WebsiteLinks
        data={data}
        isEditing={isEditing}
        editData={editData}
        onFieldChange={handleFieldChange}
      />

      {/* Social Media Manager */}
      <SocialMediaManager
        data={data}
        isEditing={isEditing}
        editData={editData}
        onFieldChange={handleFieldChange}
      />

      {/* Additional Resources */}
      <AdditionalResources
        data={data}
        isEditing={isEditing}
        editData={editData}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
}
