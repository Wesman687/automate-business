'use client';

import React from 'react';
import CrossAppIntegrations from '@/components/admin/CrossAppIntegrations';

const CrossAppAdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Cross-App Integration Management</h1>
        <p className="text-gray-300">
          Manage external applications that integrate with Stream-line AI's authentication and credit system.
          Create new integrations, approve pending requests, and monitor usage.
        </p>
      </div>
      
      <CrossAppIntegrations />
    </div>
  );
};

export default CrossAppAdminPage;
