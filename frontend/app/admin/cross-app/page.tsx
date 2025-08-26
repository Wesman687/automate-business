'use client';

import React from 'react';
import CrossAppIntegrations from '@/components/admin/CrossAppIntegrations';

const CrossAppAdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-gray-300 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-300 mb-4 glow-text">
            Cross-App Integration Management
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Manage external applications that integrate with Stream-line AI's authentication and credit system.
            Create new integrations, approve pending requests, and monitor usage.
          </p>
        </div>
        
        <div className="bg-dark-card border border-dark-border rounded-xl p-8 hover:border-electric-blue/50 transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/20">
          <CrossAppIntegrations />
        </div>
      </div>
    </div>
  );
};

export default CrossAppAdminPage;
