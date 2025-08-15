'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User, LogIn } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
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
                onClick={() => scrollToSection(item.href)}
                className="text-gray-300 hover:text-electric-blue transition-colors cursor-pointer"
              >
                {item.name}
              </button>
            ))}
            
            {/* Customer Portal Button */}
            <Link
              href="/auth/customer-login"
              className="flex items-center gap-2 bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue px-4 py-2 rounded-lg border border-electric-blue/30 transition-all duration-200"
            >
              <User className="h-4 w-4" />
              Customer Portal
            </Link>

            {/* Admin Login Button */}
            <Link
              href="/auth/login"
              className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 py-2 rounded-lg border border-gray-600 transition-all duration-200"
            >
              <LogIn className="h-4 w-4" />
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
                onClick={() => scrollToSection(item.href)}
                className="block text-gray-300 hover:text-electric-blue transition-colors w-full text-left"
              >
                {item.name}
              </button>
            ))}
            
            <div className="pt-4 border-t border-dark-border space-y-3">
              {/* Customer Portal Button */}
              <Link
                href="/auth/customer-login"
                className="flex items-center gap-2 bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue px-4 py-2 rounded-lg border border-electric-blue/30 transition-all duration-200 w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Customer Portal
              </Link>

              {/* Admin Login Button */}
              <Link
                href="/auth/login"
                className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 py-2 rounded-lg border border-gray-600 transition-all duration-200 w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="h-4 w-4" />
                Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
