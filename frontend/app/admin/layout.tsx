'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  UserCog, 
  LogOut,
  Activity,
  BarChart3,
  DollarSign,
  Briefcase
} from 'lucide-react';

interface User {
  email: string;
  is_super_admin: boolean;
  admin_id: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetchWithAuth('/auth/me');

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('admin_token');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    router.push('/auth/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Chat Logs', href: '/admin/chat-logs', icon: MessageSquare },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Financial', href: '/admin/financial', icon: DollarSign },
    { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Schedule', href: '/admin/schedule', icon: Calendar },
    ...(user?.is_super_admin ? [{ name: 'Admin Users', href: '/admin/users', icon: UserCog }] : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-cyan-400">
                ⚡ StreamlineAI Admin
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                👤 {user.email}
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
