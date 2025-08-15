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

// Helper function for authenticated API calls
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const apiUrl = getApiUrl();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for authentication
  });
};

// Quick authenticated fetch for admin operations
export const adminFetch = async (endpoint: string, options: RequestInit = {}) => {
  return fetchWithAuth(endpoint, options);
};
