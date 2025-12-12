# Fix: 404 Error on Cross-App Authentication

## Problem

Getting a 404 error when trying to authenticate:
```
POST https://server.stream-lineai.com/api/cross-app/auth 404 (Not Found)
```

## Possible Causes

1. **Endpoint not deployed** - The cross-app endpoints might not be available on production yet
2. **Wrong API path** - The server might use a different path structure
3. **Server routing** - The production server might handle routing differently

## Solutions

### Solution 1: Check if Endpoint Exists

First, test if the endpoint exists by visiting:
```
https://server.stream-lineai.com/docs
```

This should show the FastAPI documentation. Look for `/api/cross-app/auth` in the endpoints list.

### Solution 2: Try Without /api Prefix

If the server doesn't use `/api` prefix, you might need to modify the SDK temporarily. The SDK hardcodes `/api/cross-app/auth`, so if your server expects just `/cross-app/auth`, you'll need to adjust.

**Temporary workaround** - Modify your SDK copy:

```typescript
// In CrossAppAuthSDK.ts, change line 86 from:
const response = await fetch(`${this.apiBase}/api/cross-app/auth`, {

// To (if server doesn't use /api):
const response = await fetch(`${this.apiBase}/cross-app/auth`, {
```

### Solution 3: Check Server Configuration

The endpoint should be at `/api/cross-app/auth` based on the backend code:
- Router prefix: `/cross-app`
- Mounted at: `/api`
- Final path: `/api/cross-app/auth`

If production server is different, you may need to:
1. Deploy the latest backend code with cross-app endpoints
2. Check server routing/nginx configuration
3. Verify the endpoint is accessible

### Solution 4: Use Direct API Call (Temporary)

As a workaround, you can make direct API calls instead of using the SDK:

```typescript
async function loginDirect(email: string, password: string, appId: string) {
  try {
    const response = await fetch('https://server.stream-lineai.com/api/cross-app/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
        email: email,
        password: password,
        app_metadata: {
          app_name: 'Whatnot Autoprint',
          version: '1.0.0'
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Authentication failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

### Solution 5: Check Alternative Endpoints

Try these alternative paths to see which one works:

```typescript
// Option 1: With /api (current)
'https://server.stream-lineai.com/api/cross-app/auth'

// Option 2: Without /api
'https://server.stream-lineai.com/cross-app/auth'

// Option 3: Different base path
'https://api.server.stream-lineai.com/cross-app/auth'
```

## Verification Steps

1. **Check FastAPI docs**: Visit `https://server.stream-lineai.com/docs` and look for cross-app endpoints
2. **Test with curl**:
   ```bash
   curl -X POST https://server.stream-lineai.com/api/cross-app/auth \
     -H "Content-Type: application/json" \
     -d '{"app_id":"your-app-id","email":"test@example.com","password":"test"}'
   ```
3. **Check browser network tab**: See the exact URL being called and the response
4. **Check server logs**: If you have access, check backend logs for routing errors

## Most Likely Issue

The cross-app endpoints might not be deployed to production yet. The backend code exists, but the production server might be running an older version without these endpoints.

**Solution**: Deploy the latest backend code that includes the cross-app authentication endpoints.

## Quick Test

Try accessing the FastAPI docs to see available endpoints:
```
https://server.stream-lineai.com/docs
```

If you don't see `/api/cross-app/auth` in the list, the endpoint isn't deployed yet.

