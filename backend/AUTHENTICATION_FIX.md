# Production Deployment Guide - Authentication & Cookie Fix

## Issue
Authentication cookies are not being properly shared between frontend and backend in production due to incorrect cookie security settings.

## Root Cause
Cookies were being set with:
- `secure=False` (should be `True` in HTTPS production)
- `samesite="lax"` (should be `"none"` for cross-domain)
- Missing domain specification for subdomain sharing

## Solution

### 1. Environment Variables Required on Production Server

Add these environment variables to your production server:

```bash
# Production environment
ENVIRONMENT=production
HTTPS_ENABLED=true

# Existing email variables (already set)
TECH_EMAIL=tech@stream-lineai.com
TECH_PASSWORD=gcvv csqr syhc bbar
SALES_EMAIL=sales@stream-lineai.com  
SALES_PASSWORD=uzby cikm qxvw dvfw
```

### 2. Code Changes Made

Updated `backend/api/login.py` to use environment-aware cookie settings:

- **Development**: `secure=False`, `samesite="lax"`, no domain
- **Production**: `secure=True`, `samesite="none"`, `domain=".stream-lineai.com"`

This allows cookies to be shared between `stream-lineai.com` and `server.stream-lineai.com`.

### 3. Test the Fix

After deploying with the environment variables:

1. **Login Test**: Go to your login page and authenticate
2. **Cookie Check**: In browser dev tools, verify cookies are set with correct attributes
3. **API Test**: Check that admin endpoints work without unauthorized errors

### 4. Expected Cookie Attributes in Production

After login, cookies should show:
- ✅ `Secure: true`
- ✅ `SameSite: None` 
- ✅ `Domain: .stream-lineai.com`
- ✅ `HttpOnly: true`
- ✅ `Path: /`

### 5. Deployment Steps

1. Set environment variables on server
2. Restart the backend service
3. Clear browser cookies (important!)
4. Test login and admin access

## Verification

The logs should show:
```
✅ Authentication successful for user 'your@email.com' (type: admin)
🍪 Found token in cookie: abc123...
```

Instead of:
```
🚫 No token found in any cookie
❌ No authentication token found
```
