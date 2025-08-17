'use client';

import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return <Dashboard />;

}
