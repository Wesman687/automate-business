'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    // Redirect to portal instead of having a separate login page
    window.location.href = '/portal';
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
        <p className="text-gray-300">Redirecting to portal...</p>
      </div>
    </div>
  );
}
