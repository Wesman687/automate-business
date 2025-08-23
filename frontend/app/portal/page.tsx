'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, User, Shield } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Script from 'next/script';

export default function Portal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  
  // Use JWT AuthProvider for authentication
  const { user, isAuthenticated, loading: authLoading, login } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user) {
      redirectBasedOnRole(user);
    } else {
      setCheckingAuth(false);
    }
  }, [authLoading, isAuthenticated, user]);

  // Cross-page login sharing for embedded iframe support
  useEffect(() => {
    // Check if we're in an embedded iframe
    const isEmbedded = window.parent !== window.self;
    const urlParams = new URLSearchParams(window.location.search);
    const isEmbeddedParam = urlParams.get('embedded') === 'true';

    // Add embedded styling
    if (isEmbedded || isEmbeddedParam) {
      document.body.classList.add('embedded-mode');
    }
    
    if (isEmbedded || isEmbeddedParam) {
      console.log('🔗 Portal running in embedded mode');
      
      // Function to notify parent window of auth success
      const notifyAuthSuccess = () => {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'AUTH_SUCCESS',
            timestamp: Date.now()
          }, '*'); // In production, use specific origin like 'http://localhost:3000'
          
          console.log('✅ Auth success message sent to parent');
        }
      };
      
      // Monitor for successful login using cookies
      let hasAuthCookie = document.cookie.includes('auth_token') || 
                         document.cookie.includes('admin_token') || 
                         document.cookie.includes('customer_token');
      
      const checkAuthStatus = () => {
        const nowHasAuth = document.cookie.includes('auth_token') || 
                          document.cookie.includes('admin_token') || 
                          document.cookie.includes('customer_token');
        
        if (nowHasAuth && !hasAuthCookie) {
          // Auth cookie appeared - login successful!
          hasAuthCookie = true;
          notifyAuthSuccess();
        }
      };
      
      // Check every 500ms for auth changes
      const authCheckInterval = setInterval(checkAuthStatus, 500);
      
      // Clean up on component unmount
      return () => {
        clearInterval(authCheckInterval);
      };
    }
  }, []);
  const redirectBasedOnRole = (u: any) => {
    if (u?.is_admin) router.replace('/admin');
    else router.replace('/customer/dashboard');
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      } else {
        // Login successful - notify parent window if embedded
        const checkEmbedded = () => {
          try {
            return window.parent !== window.self;
          } catch (e) {
            return false;
          }
        };
        
        const urlParams = new URLSearchParams(window.location.search);
        const isEmbeddedParam = urlParams.get('embedded') === 'true';
        
        if (checkEmbedded() || isEmbeddedParam) {
          try {
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({
                type: 'AUTH_SUCCESS',
                timestamp: Date.now()
              }, '*');
              console.log('✅ Auth success message sent to parent (immediate)');
            }
          } catch (e) {
            console.log('Could not send message to parent:', e);
          }
        }
      }
      // On success the effect above will redirect once user state populates.
    } catch (err: any) {
      setError(err?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingAuth) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-300">Checking authentication…</p>
        </div>
      </div>
    );
  }

  // Check if we're in embedded mode for styling
  const isEmbedded = typeof window !== 'undefined' && (
    window.parent !== window.self || 
    new URLSearchParams(window.location.search).get('embedded') === 'true'
  );

  return (
    <>
      <Script src="/js/embedded-auth.js" strategy="beforeInteractive" />
      <div className={`${isEmbedded ? 'min-h-full bg-transparent' : 'min-h-screen bg-dark-bg'} flex items-center justify-center ${isEmbedded ? 'py-4 px-2' : 'py-12 px-4 sm:px-6 lg:px-8'}`}>
      <div className={`${isEmbedded ? 'max-w-sm' : 'max-w-md'} w-full ${isEmbedded ? 'space-y-4' : 'space-y-8'}`}>
        {!isEmbedded && (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-electric-blue">⚡</span>
              <span className="text-white">Streamline</span>
              <span className="text-neon-green">AI</span>
            </h1>
            <h2 className="text-2xl font-semibold text-white mb-2">Portal Login</h2>
            <p className="text-gray-400">Access your account dashboard</p>
          </div>
        )}

        {isEmbedded && (
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-white mb-1">Login</h2>
            <p className="text-gray-400 text-sm">Access your account</p>
          </div>
        )}

        <div className={`${isEmbedded ? 'bg-dark-card/95 p-4 rounded-lg border border-dark-border/50 shadow-lg backdrop-blur-sm' : 'bg-dark-card p-8 rounded-xl border border-dark-border shadow-xl'}`}>
          <form onSubmit={handleSubmit} className={`${isEmbedded ? 'space-y-4' : 'space-y-6'}`}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className={`block text-sm font-medium text-gray-300 ${isEmbedded ? 'mb-1' : 'mb-2'}`}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full ${isEmbedded ? 'px-3 py-2 text-sm' : 'px-4 py-3'} bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-200`}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium text-gray-300 ${isEmbedded ? 'mb-1' : 'mb-2'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${isEmbedded ? 'px-3 py-2 text-sm pr-10' : 'px-4 py-3 pr-12'} bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 ${isEmbedded ? 'py-2 px-3 text-sm' : 'py-3 px-4'} border border-transparent rounded-lg shadow-sm font-medium text-white bg-electric-blue hover:bg-electric-blue/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {!isEmbedded && (
            <div className="mt-6 pt-6 border-t border-dark-border">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-electric-blue" />
                  <span>Customer Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-neon-green" />
                  <span>Admin Access</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Use your email and password to access your dashboard. 
                You willll be automatically redirected to the appropriate area.
              </p>
            </div>
          )}
        </div>

        {!isEmbedded && (
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Need help accessing your account?{' '}
              <a href="#contact" className="text-electric-blue hover:text-electric-blue/80">
                Contact Support
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
