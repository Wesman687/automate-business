'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import UnifiedDashboard from '../../../components/UnifiedDashboard';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin authentication
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/portal';
      return;
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-cyan-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Dashboard Overview
              </h1>
              <p className="text-gray-400">
                Central view of all pending items and activities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/jobs"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Jobs
            </Link>
            <Link
              href="/admin/customers"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Manage Customers
            </Link>
          </div>
        </div>

        {/* Dashboard Content */}
        <UnifiedDashboard />
      </div>
    </div>
  );
}
