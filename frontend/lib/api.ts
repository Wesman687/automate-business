// Environment-aware API URL configuration
export const getApiUrl = (): string => {
  // First try to use environment variables if available
  if (typeof window !== 'undefined') {
    // Client-side: check if we're in development
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('localhost');
    
    if (isDevelopment) {
      return process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:8005';
    } else {
      return process.env.NEXT_PUBLIC_API_URL_PROD || 'https://server.stream-lineai.com';
    }
  }
  
  // Server-side fallback
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:8005';
  } else {
    return process.env.NEXT_PUBLIC_API_URL_PROD || 'https://server.stream-lineai.com';
  }
};

// Helper function for authenticated API calls - TEMPORARILY DISABLED
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  // DISABLED to stop cookie spam - all calls should use JWT directly
  console.error('🚫 fetchWithAuth DISABLED - Use direct fetch with JWT tokens instead');
  console.error('� Attempted endpoint:', endpoint);
  
  return new Response(JSON.stringify({ 
    error: 'fetchWithAuth is disabled. Use JWT tokens instead.' 
  }), { 
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
};

// Quick authenticated fetch for admin operations
export const adminFetch = async (endpoint: string, options: RequestInit = {}) => {
  return fetchWithAuth(endpoint, options);
};
