'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, ChevronDown, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // 🔑 Use the hook INSIDE the component
  const { user, isAuthenticated, loading, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', sectionId: null },
    { name: 'About', href: '/about', sectionId: 'about' },
    { name: 'Services', href: '/services', sectionId: 'services' },
    { name: 'Contact', href: '/contact', sectionId: 'contact' },
  ];

  useEffect(() => {
    const handleClickOutside = () => {
      if (showUserDropdown) setShowUserDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserDropdown]);

  const handleLogout = async () => {
    await logout();               // ← from context
    setShowUserDropdown(false);
    setIsMenuOpen(false);
    router.replace('/');          // soft redirect (use window.location if you want a hard reload)
  };

  const getDashboardLink = () => {
    if (!user) return '/portal';
    return user.is_admin ? '/admin' : '/customer';
  };

  const handleNavigation = (item: typeof navigation[number]) => {
    setIsMenuOpen(false);

    if (pathname === '/' && item.sectionId) {
      const element = document.getElementById(item.sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    if (item.href === '/') {
      router.push('/');
      return;
    }

    if (pathname !== '/' && item.sectionId) {
      router.push('/');
      setTimeout(() => {
        const element = document.getElementById(item.sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      router.push(item.href);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-dark-bg/90 backdrop-blur-sm border-b border-dark-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              <span className="text-electric-blue">⚡</span>
              <span className="text-white">Streamline</span>
              <span className="text-neon-green">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item)}
                className="text-gray-300 hover:text-electric-blue transition-colors cursor-pointer"
              >
                {item.name}
              </button>
            ))}

            {/* User area */}
            {!loading && (
              isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserDropdown(!showUserDropdown);
                    }}
                    className="flex items-center gap-2 bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue px-4 py-2 rounded-lg border border-electric-blue/30 transition-all duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden lg:block">
                      {user?.name || user?.email || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-dark-card border border-dark-border rounded-lg shadow-xl z-50">
                      <div className="p-3 border-b border-dark-border">
                        <div className="text-sm text-gray-300">Signed in as</div>
                        <div className="text-white font-medium truncate">{user?.email}</div>
                        <div className="text-xs text-electric-blue capitalize">
                          {user?.is_admin ? 'Admin' : 'Customer'}
                        </div>
                      </div>
                      <div className="py-2">
                        <Link
                          href={getDashboardLink()}
                          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-bg transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Home className="h-4 w-4" />
                          Go to Dashboard
                        </Link>
                        <Link
                          href="/portal"
                          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-bg transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <User className="h-4 w-4" />
                          Portal
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-dark-bg transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/portal"
                  className="flex items-center gap-2 bg-electric-blue/20 hover:bg-electric-blue hover:text-white text-electric-blue px-4 py-2 rounded-lg border border-electric-blue/30 transition-all duration-200"
                >
                  <User className="h-4 w-4" />
                  Portal
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-card border-b border-dark-border">
          <div className="px-6 py-4 space-y-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item)}
                className="block text-gray-300 hover:text-electric-blue transition-colors w-full text-left"
              >
                {item.name}
              </button>
            ))}

            <div className="pt-4 border-t border-dark-border space-y-3">
              {!loading && (
                isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 bg-dark-bg rounded-lg border border-dark-border">
                      <div className="text-xs text-gray-400">Signed in as</div>
                      <div className="text-white text-sm font-medium truncate">{user?.email}</div>
                      <div className="text-xs text-electric-blue capitalize">
                        {user?.is_admin ? 'Admin' : 'Customer'}
                      </div>
                    </div>
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center gap-2 bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue px-4 py-2 rounded-lg border border-electric-blue/30 transition-all duration-200 w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      Go to Dashboard
                    </Link>
                    <Link
                      href="/portal"
                      className="flex items-center gap-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-4 py-2 rounded-lg border border-gray-600/30 transition-all duration-200 w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Portal
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg border border-red-500/30 transition-all duration-200 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/portal"
                    className="flex items-center gap-2 bg-electric-blue/20 hover:bg-electric-blue text-electric-blue px-4 py-2 rounded-lg border border-electric-blue/30 transition-all duration-200 w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Portal
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
