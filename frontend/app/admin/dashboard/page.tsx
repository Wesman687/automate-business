'use client';

import { useEffect, useState } from 'react';
import UnifiedDashboard from '../../../components/UnifiedDashboard';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin authentication via API call instead of localStorage
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include', // Include cookies
        });
        if (!response.ok) {
          window.location.href = '/portal';
          return;
        }
        const data = await response.json();
        if (!data.valid || !data.user || !data.user.is_admin) {
          window.location.href = '/portal';
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/portal';
      }
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return <UnifiedDashboard />;
}
