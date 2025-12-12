'use client';

import { useEffect, useState } from 'react';
import Dashboard from '@/components/admin/Dashboard';
import { useUserStats } from '@/hooks/useUsers';
import { Users, Shield, Crown, CreditCard } from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const { stats: userStats, loading: statsLoading } = useUserStats();

  useEffect(() => {
    // Simulate loading for now
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Statistics Section */}
      {userStats && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="h-5 w-5 text-cyan-400 mr-2" />
            User Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{userStats.total_users}</div>
              <div className="text-sm text-gray-300">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{userStats.total_customers}</div>
              <div className="text-sm text-gray-300">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{userStats.total_admins}</div>
              <div className="text-sm text-gray-300">Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{userStats.total_credits.toLocaleString()}</div>
              <div className="text-sm text-gray-300">Total Credits</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      <Dashboard />
    </div>
  );
}
