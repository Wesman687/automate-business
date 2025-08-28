'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  MessageSquare, Users, Calendar, UserCog, LogOut, BarChart3, DollarSign, Briefcase, Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect non-admins out of /admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      console.log('❌ User not admin, redirecting to portal');
      router.replace('/portal');
    }
  }, [loading, user, isAdmin, router]);

  const handleLogout = async () => {
    try {
      await logout();          // <- use the AuthProvider logout
    } finally {
      router.replace('/');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Chat Logs', href: '/admin/chat-logs', icon: MessageSquare },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Financial', href: '/admin/financial', icon: DollarSign },
    { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Cross-App Integrations', href: '/admin/cross-app', icon: LinkIcon },
    ...(user?.is_super_admin ? [{ name: 'Admin Users', href: '/admin/users', icon: UserCog }] : []),
  ];

  if (loading || (!user || !isAdmin)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-[95vw] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-cyan-400">⚡ StreamlineAI Admin</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">👤 {user.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-cyan-500/10 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="max-w-[95vw] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-4 py-3 border-b-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-cyan-400 text-white bg-cyan-400/20'
                      : 'border-transparent text-cyan-200 hover:text-white hover:border-cyan-400/50 hover:bg-cyan-400/10'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-[95vw] mx-auto py-6 px-2 sm:px-4 lg:px-6">
        {children}
      </main>
    </div>
  );
}
