# Local Testing with Cross-App Integration

## Domain Validation

**Good news**: The `app_domain` field in your app integration is **not strictly enforced** for authentication. It's primarily used for:
- Organization and tracking
- Display purposes in the admin panel
- Future features (like domain-based routing)

## Local Testing

You can test your app from **any domain**, including:
- `localhost:3000` (or any port)
- `127.0.0.1`
- Your local development domain
- Any other domain

The authentication will work as long as:
1. ✅ Your `app_id` is correct
2. ✅ Your app integration is active
3. ✅ CORS is properly configured (already done for localhost)

## SDK Configuration for Local Testing

### Option 1: Use Production API (Recommended for Testing)

Even when testing locally, you can use the production API:

```typescript
import { createCrossAppSDK } from './lib/sdk';

const sdk = createCrossAppSDK({
  appId: 'app_xxxxx', // Your App ID from admin panel
  domain: 'whatnot.miracle-coins.com', // Your production domain (just for metadata)
  apiBase: 'https://server.stream-lineai.com', // Production API
  debug: true
});
```

**Why this works**: The `domain` field in the SDK config is just metadata. The actual authentication happens via the `app_id` and `apiBase`.

### Option 2: Use Local Backend

If you're running the backend locally:

```typescript
const sdk = createCrossAppSDK({
  appId: 'app_xxxxx',
  domain: 'whatnot.miracle-coins.com', // Your production domain
  apiBase: 'http://localhost:8005', // Local backend
  debug: true
});
```

## Important Notes

1. **Domain Field is Metadata**: The `app_domain` you set in the admin panel doesn't restrict where your app can run
2. **CORS is Configured**: The backend already allows localhost origins for development
3. **App ID is What Matters**: Authentication is based on `app_id`, not domain
4. **Production Domain**: Set your production domain in the admin panel for tracking, but it won't block local testing

## Testing Checklist

- [x] App ID is correct
- [x] App integration is active in admin panel
- [x] SDK configured with correct `apiBase`
- [x] Can authenticate from localhost
- [x] Can authenticate from production domain

## Example: Testing from Multiple Domains

You can test the same app from multiple domains:

```typescript
// Works from localhost:3000
const sdk = createCrossAppSDK({
  appId: 'app_xxxxx',
  domain: 'whatnot.miracle-coins.com',
  apiBase: 'https://server.stream-lineai.com',
  debug: true
});

// Also works from production domain
// Same SDK config, just deployed to different domain
```

## Troubleshooting

### Issue: CORS errors during local testing

**Solution**: The backend already allows localhost. If you still get CORS errors:
1. Check that you're using the correct `apiBase` URL
2. Verify the backend CORS configuration includes your localhost port
3. Check browser console for specific CORS error messages

### Issue: Authentication fails from localhost

**Solution**: 
1. Verify your `app_id` is correct
2. Check that the app integration status is "active" in admin panel
3. Ensure you're using the correct `apiBase` URL
4. Check browser network tab for API response errors

## Summary

**You can test from any domain!** The `app_domain` field is just for organization. Your app will work from:
- ✅ localhost (any port)
- ✅ Your production domain
- ✅ Any other domain you want to test from

The only requirement is that your `app_id` is correct and your app integration is active.

