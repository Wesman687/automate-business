import React, { useState, useEffect } from 'react';
import { CrossAppAuthSDK, LoginOptions, User } from '../../lib/sdk';

interface CrossAppLoginProps {
  sdk: CrossAppAuthSDK;
  onLoginSuccess?: (user: User) => void;
  onLoginError?: (error: Error) => void;
  onClose?: () => void;
  embedded?: boolean;
  className?: string;
}

/**
 * Cross-App Login Component
 * 
 * Provides a login interface that can be embedded in other applications
 * to authenticate users with the Stream-line AI Automate platform.
 */
export const CrossAppLogin: React.FC<CrossAppLoginProps> = ({
  sdk,
  onLoginSuccess,
  onLoginError,
  onClose,
  embedded = false,
  className = ''
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = sdk.onAuthChange((event) => {
      if (event.type === 'AUTH_SUCCESS') {
        onLoginSuccess?.(event.data.user);
      } else if (event.type === 'AUTH_FAILURE') {
        setError(event.data.error?.message || 'Authentication failed');
        onLoginError?.(event.data.error);
      }
    });

    return unsubscribe;
  }, [sdk, onLoginSuccess, onLoginError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loginOptions: LoginOptions = {
        email: email.trim(),
        password
      };

      const user = await sdk.login(loginOptions);
      onLoginSuccess?.(user);
      
      // Clear form
      setEmail('');
      setPassword('');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      onLoginError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const baseClasses = `
    cross-app-login
    ${embedded ? 'embedded' : ''}
    ${className}
  `.trim();

  return (
    <div className={baseClasses}>
      <div className="login-container">
        {!embedded && onClose && (
          <button 
            className="close-button"
            onClick={handleClose}
            aria-label="Close login"
          >
            ×
          </button>
        )}
        
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <span className="loading-spinner">
                <span className="spinner"></span>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="help-text">
            Don't have an account?{' '}
            <a 
              href={`https://${sdk['config'].domain}/portal?embedded=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="signup-link"
            >
              Sign up here
            </a>
          </p>
          <p className="help-text">
            <a 
              href={`https://${sdk['config'].domain}/portal/forgot-password`}
              target="_blank"
              rel="noopener noreferrer"
              className="forgot-password-link"
            >
              Forgot your password?
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .cross-app-login {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }

        .cross-app-login.embedded {
          max-width: 100%;
          padding: 0;
        }

        .login-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          padding: 32px;
          position: relative;
        }

        .cross-app-login.embedded .login-container {
          box-shadow: none;
          border: 1px solid #e5e7eb;
        }

        .close-button {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: #111827;
        }

        .login-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .login-form {
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input:disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .password-input-container {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          font-size: 16px;
          color: #6b7280;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #374151;
        }

        .login-button {
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .login-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .login-footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .help-text {
          margin: 8px 0;
          font-size: 14px;
          color: #6b7280;
        }

        .signup-link,
        .forgot-password-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .signup-link:hover,
        .forgot-password-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .cross-app-login {
            padding: 16px;
          }
          
          .login-container {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};
