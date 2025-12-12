# Email Verification Setup Guide for Whatnot AutoPrint

This guide explains how to set up email verification for your Whatnot AutoPrint app, including the verification page and email configuration.

## Overview

When users register, they receive a verification email with:
- A clickable "Verify Email Address" button that links to your verification page
- A 6-digit verification code for manual entry
- Custom branding (shows "Whatnot AutoPrint" instead of "StreamlineAI")

## Backend Configuration

### Environment Variables

On your backend server, set these environment variables:

```bash
# App name shown in emails
export APP_NAME="Whatnot AutoPrint"

# URL to your verification page (users will be redirected here)
export VERIFICATION_URL="https://whatnot.miracle-coins.com/verify-email"

# Email account credentials (for sending emails)
export PAUL_EMAIL="paul@stream-lineai.com"
export PAUL_PASSWORD="<your_gmail_app_password>"

# SMTP server (defaults to Gmail)
export SMTP_SERVER="smtp.gmail.com"
export SMTP_PORT="587"
```

**Important:** After setting these, restart your backend server.

## Frontend: Create Verification Page

### Step 1: Create the Verification Page

Create a new page at `/verify-email` in your Whatnot AutoPrint app.

**Example using Next.js:**

```typescript
// app/verify-email/page.tsx or pages/verify-email.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    // Get email and code from URL query parameters
    const emailParam = searchParams.get('email');
    const codeParam = searchParams.get('code');

    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);

    // If both are in URL, auto-verify
    if (emailParam && codeParam) {
      verifyEmail(emailParam, codeParam);
    }
  }, [searchParams]);

  const verifyEmail = async (emailToVerify: string, codeToVerify: string) => {
    try {
      setStatus('loading');
      setMessage('Verifying your email...');

      const response = await fetch('https://server.stream-lineai.com/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailToVerify,
          verification_code: codeToVerify,
        }),
      });

      const data = await response.json();

      if (response.ok && data.message) {
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.detail || 'Verification failed. Please check your code and try again.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('Network error. Please try again.');
      console.error('Verification error:', error);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && code) {
      verifyEmail(email, code);
    } else {
      setMessage('Please enter both email and verification code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and verification code to complete registration
          </p>
        </div>

        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 text-green-600 font-medium">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="mt-4 text-red-600">{message}</p>
          </div>
        )}

        {(status === 'error' || (!email && !code)) && (
          <form className="mt-8 space-y-6" onSubmit={handleManualSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="your-email@example.com"
                />
              </div>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Verify Email
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  // Resend verification code
                  fetch('https://server.stream-lineai.com/api/auth/resend-verification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  })
                    .then(res => res.json())
                    .then(data => {
                      if (data.message) {
                        setMessage('Verification code resent! Check your email.');
                        setStatus('error'); // Reset to show form
                      }
                    });
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Resend verification code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
```

### Step 2: Update Login Page to Handle Unverified Users

When a user tries to login but their email isn't verified, the API returns:

```json
{
  "error": "Email verification required",
  "requires_verification": true,
  "email": "user@example.com",
  "message": "Please verify your email address before logging in..."
}
```

Update your login handler to redirect to the verification page:

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('https://server.stream-lineai.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.requires_verification) {
      // Redirect to verification page
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      return;
    }

    if (response.ok) {
      // Normal login success
      // Handle token/user data
    } else {
      // Other login errors
      setError(data.detail || 'Login failed');
    }
  } catch (error) {
    setError('Network error. Please try again.');
  }
};
```

## API Endpoints

### Verify Email
```
POST https://server.stream-lineai.com/api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "verification_code": "123456"
}
```

**Success Response:**
```json
{
  "message": "Email verified successfully. Your account is now active.",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "User Name",
    "status": "active",
    "email_verified": true
  }
}
```

**Error Response:**
```json
{
  "detail": "Invalid verification code or code expired"
}
```

### Resend Verification Code
```
POST https://server.stream-lineai.com/api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Success Response:**
```json
{
  "message": "Verification email sent successfully. Please check your email."
}
```

## Email Flow

1. **User registers** → Receives verification email
2. **Email contains:**
   - Clickable button: "Verify Email Address" → Links to `/verify-email?email=...&code=...`
   - 6-digit code for manual entry
3. **User clicks button or enters code** → Verification page calls API
4. **On success** → User redirected to login page
5. **User can now login** → Email is verified

## Testing

1. **Register a new user:**
   ```bash
   POST https://server.stream-lineai.com/api/auth/register
   {
     "email": "test@example.com",
     "password": "testpassword123",
     "name": "Test User"
   }
   ```

2. **Check email** - Should receive email with:
   - "Whatnot AutoPrint" branding
   - Clickable verification button
   - 6-digit code

3. **Click button or enter code** - Should verify and redirect to login

4. **Try to login before verification** - Should redirect to verification page

5. **Login after verification** - Should work normally

## Troubleshooting

### Email not received
- Check spam folder
- Verify `PAUL_EMAIL` and `PAUL_PASSWORD` are set correctly
- Check server logs for email sending errors
- Verify SMTP server is correct (`smtp.gmail.com` for Gmail)

### Verification fails
- Code expires after 24 hours
- Code can only be used once
- Use "Resend verification code" if needed

### Redirect not working
- Ensure `VERIFICATION_URL` is set correctly
- URL should be absolute (include `https://`)
- Make sure the verification page exists at that path

## Environment Variables Summary

```bash
# Required for email sending
PAUL_EMAIL=paul@stream-lineai.com
PAUL_PASSWORD=<gmail_app_password>

# Required for custom branding and links
APP_NAME="Whatnot AutoPrint"
VERIFICATION_URL="https://whatnot.miracle-coins.com/verify-email"

# Optional (defaults shown)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

## Next Steps

1. ✅ Set environment variables on backend server
2. ✅ Restart backend server
3. ✅ Create `/verify-email` page in your Whatnot app
4. ✅ Update login handler to redirect unverified users
5. ✅ Test the full flow

---

**Questions?** Check the server logs for detailed error messages, or verify your environment variables are set correctly.

