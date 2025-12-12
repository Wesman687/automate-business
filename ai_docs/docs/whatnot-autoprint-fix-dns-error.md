# Fix: ERR_NAME_NOT_RESOLVED for Whatnot Autoprint Login

## Problem

When trying to login to your Whatnot Autoprint app, you're getting:
```
api.stream-lineai.com/api/cross-app/auth:1 Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

This error occurs because the `CrossAppAuthSDK` is trying to reach `api.stream-lineai.com`, which doesn't exist or isn't configured.

## Root Cause

The SDK constructs the API base URL as:
```typescript
this.apiBase = config.apiBase || `https://api.${config.domain}`;
```

If you initialize the SDK with just a `domain` (like `stream-lineai.com`), it tries to construct `https://api.stream-lineai.com`, which may not be a valid domain.

## Solution

You need to provide the `apiBase` directly in your SDK configuration. Here are the options:

### Option 1: Development (Local Backend)

If you're running the backend locally, use:

```typescript
import { createCrossAppSDK } from '@streamline/cross-app-sdk';

const sdk = createCrossAppSDK({
  appId: 'your-app-id-here',
  domain: 'stream-lineai.com', // Your app domain
  apiBase: 'http://localhost:8005', // Local backend URL
  debug: true
});
```

### Option 2: Production API (Correct URL)

**IMPORTANT**: The production API URL is `https://server.stream-lineai.com`, NOT `https://api.stream-lineai.com`.

For production (or to use production API during development):

```typescript
const sdk = createCrossAppSDK({
  appId: 'your-app-id-here',
  domain: 'stream-lineai.com',
  apiBase: 'https://server.stream-lineai.com', // ✅ Correct production API URL
  debug: true
});
```

**Why this is needed**: The SDK defaults to `https://api.${config.domain}` which would be `https://api.stream-lineai.com`, but that domain doesn't exist. The actual production API is at `https://server.stream-lineai.com`.

### Option 4: Environment-Based Configuration (Recommended)

Use environment variables to configure the API base URL:

```typescript
import { createCrossAppSDK } from '@streamline/cross-app-sdk';

const getApiBase = () => {
  // Check if we're in development
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isDev = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
    
    if (isDev) {
      return process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:8005';
    }
  }
  
  // Production
  return process.env.NEXT_PUBLIC_API_URL_PROD || 'https://server.stream-lineai.com';
};

const sdk = createCrossAppSDK({
  appId: process.env.NEXT_PUBLIC_APP_ID || 'your-app-id',
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN || 'stream-lineai.com',
  apiBase: getApiBase(),
  debug: process.env.NODE_ENV === 'development'
});
```

## Environment Variables Setup

Create or update your `.env.local` file in your frontend directory:

```bash
# App Configuration
NEXT_PUBLIC_APP_ID=your-app-id-here
NEXT_PUBLIC_APP_DOMAIN=stream-lineai.com

# API URLs
NEXT_PUBLIC_API_URL_DEV=http://localhost:8005
NEXT_PUBLIC_API_URL_PROD=https://server.stream-lineai.com
```

## Complete Example

Here's a complete example of how to set up the SDK in your Whatnot Autoprint app:

```typescript
// lib/whatnot-sdk.ts
import { createCrossAppSDK } from '@streamline/cross-app-sdk';

// Get API base URL based on environment
function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable
    return process.env.NEXT_PUBLIC_API_URL_PROD || 'https://server.stream-lineai.com';
  }
  
  // Client-side: detect environment
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isLocal) {
    return process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:8005';
  }
  
  return process.env.NEXT_PUBLIC_API_URL_PROD || 'https://server.stream-lineai.com';
}

// Initialize SDK
export const whatnotSDK = createCrossAppSDK({
  appId: process.env.NEXT_PUBLIC_APP_ID || 'whatnot-autoprint',
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN || 'stream-lineai.com',
  apiBase: getApiBaseUrl(), // ✅ This fixes the DNS error!
  debug: process.env.NODE_ENV === 'development'
});

// Usage in your login component
export async function loginUser(email: string, password: string) {
  try {
    const result = await whatnotSDK.auth.login({
      email,
      password,
      appMetadata: {
        app_name: 'Whatnot Autoprint',
        version: '1.0.0'
      }
    });
    
    return result;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

## Verification Steps

1. **Check your SDK initialization** - Make sure you're providing `apiBase` in the config
2. **Verify backend is running** - If using localhost, ensure backend is running on port 8005
3. **Check environment variables** - Ensure `.env.local` has the correct values
4. **Test the API URL directly** - Try accessing `http://localhost:8005/api/cross-app/auth` (or your production URL) in a browser to verify it's reachable

## Common Issues

### Issue: Still getting DNS error after adding apiBase

**Solution**: Make sure you're passing `apiBase` correctly. Check the SDK initialization code and verify the config object.

### Issue: CORS errors

**Solution**: If you're using a different domain/port, you may need to configure CORS on the backend. Check `backend/main.py` for CORS settings.

### Issue: Backend not running

**Solution**: Start your backend server:
```bash
cd backend
python main.py
# or
uvicorn main:app --reload --port 8005
```

## Quick Fix Checklist

- [ ] Add `apiBase: 'https://server.stream-lineai.com'` to your SDK configuration
- [ ] **IMPORTANT**: Use `https://server.stream-lineai.com` (NOT `api.stream-lineai.com`)
- [ ] Create/update `.env.local` with correct values
- [ ] Restart your development server after changing environment variables
- [ ] Test login again

---

**After applying this fix, your login should work!** The key is always providing the `apiBase` explicitly rather than relying on the auto-generated `api.${domain}` URL.

