# EMAIL CONFIGURATION - PRODUCTION SERVER ONLY

## Overview

All email functionality ALWAYS routes to the production server, regardless of whether you're running in development or production mode.

## Configuration Details

### Frontend (lib/https.ts)

- **Production Email Server**: `https://server.stream-lineai.com`
- **Routing Logic**: Any path starting with `email/` or `/email/` automatically routes to production
- **Bypasses**: Local development proxy entirely for email endpoints

### Backend (services/email_service.py)

- **SMTP Server**: `mail.stream-lineai.com` (hardcoded, not from env vars)
- **SMTP Port**: `587` (hardcoded)
- **TLS**: `True` (always enabled)
- **Database Fallback**: Uses environment variables if database accounts not available

### Email Accounts

The system supports multiple email accounts:

- `no_reply@stream-lineai.com` (automated emails)
- `sales@stream-lineai.com` (sales notifications)
- `tech@stream-lineai.com` (technical notifications)

## Development vs Production

### Development Mode

- ✅ **Email endpoints**: Route to production server
- ✅ **Email sending**: Goes through production SMTP
- ✅ **Email reading**: Connects to production email accounts
- ❌ **Other APIs**: Use local development server (localhost:8005)

### Production Mode

- ✅ **Email endpoints**: Route to production server
- ✅ **Email sending**: Goes through production SMTP
- ✅ **Email reading**: Connects to production email accounts
- ✅ **Other APIs**: Use production server

## Why This Configuration?

1. **Centralized Email Management**: All emails live on the production server
2. **Consistent Experience**: Same email functionality regardless of environment
3. **Real Email Testing**: Developers can test with real emails during development
4. **Single Source of Truth**: One email server to manage and monitor

## Verification

To verify this is working correctly:

1. **Frontend**: Check browser network tab - email API calls should go to `server.stream-lineai.com`
2. **Backend**: Check logs - SMTP connections should show `mail.stream-lineai.com:587`
3. **Email Manager**: Should show real emails from production accounts

## Files Modified

- `frontend/lib/https.ts` - Email routing logic
- `backend/services/email_service.py` - SMTP configuration
- `backend/config.py` - Email server constants

## Important Notes

- Email credentials are stored in environment variables and database
- Email accounts must be configured in the admin panel
- All email operations (send/receive/manage) use production infrastructure
- This ensures email continuity and centralized management
