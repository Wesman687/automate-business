# Password Reset/Recovery Guide

## Overview

Yes, there is password reset/recovery functionality available for the auth server. However, the current implementation is primarily designed for admin users, but it works with the unified User model, so it should work for all users.

## Available Endpoints

### 1. Request Password Reset

**Endpoint:** `POST /email/forgot-password`

**Description:** Sends a password reset email to the user.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Important Notes:**
- For security, the response is the same whether the email exists or not
- The reset link expires in **1 hour**
- Email functionality only works on production server (`https://server.stream-lineai.com`)
- In development, emails are logged but not actually sent

### 2. Reset Password with Token

**Endpoint:** `POST /email/reset-password`

**Description:** Resets the password using the token from the email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "newSecurePassword123",
  "confirm_password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

**Validation Rules:**
- Token must be valid and not expired
- Token can only be used once
- Passwords must match
- Password must be at least 8 characters long

## Usage Examples

### For Your Whatnot Autoprint App

#### Option 1: Direct API Call

```typescript
// Request password reset
async function requestPasswordReset(email: string) {
  const response = await fetch('https://server.stream-lineai.com/email/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  return data;
}

// Reset password with token
async function resetPassword(token: string, newPassword: string, confirmPassword: string) {
  const response = await fetch('https://server.stream-lineai.com/email/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token,
      new_password: newPassword,
      confirm_password: confirmPassword
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to reset password');
  }
  
  return await response.json();
}
```

#### Option 2: React Component Example

```typescript
// components/ForgotPassword.tsx
import React, { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('https://server.stream-lineai.com/email/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('If the email exists, a password reset link has been sent. Please check your inbox.');
      } else {
        setError(data.detail || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  );
}
```

#### Option 3: Password Reset Page Component

```typescript
// components/ResetPassword.tsx
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://server.stream-lineai.com/email/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          new_password: formData.password,
          confirm_password: formData.confirmPassword
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div>Invalid reset link. Please request a new password reset.</div>;
  }

  if (success) {
    return (
      <div>
        <h2>Password Reset Successful!</h2>
        <p>Your password has been reset. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        placeholder="New Password"
        required
      />
      <input
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
        placeholder="Confirm Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}
```

## Integration with Cross-App SDK

You can add password reset functionality to your login component:

```typescript
import { createCrossAppSDK } from './lib/sdk';

const sdk = createCrossAppSDK({
  appId: 'whatnot-autoprint',
  domain: 'stream-lineai.com',
  apiBase: 'https://server.stream-lineai.com',
  debug: true
});

// Add to your login component
function LoginComponent() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // ... login logic ...
  
  return (
    <div>
      {/* Login form */}
      <form onSubmit={handleLogin}>
        {/* ... */}
        <a href="#" onClick={() => setShowForgotPassword(true)}>
          Forgot your password?
        </a>
      </form>
      
      {/* Forgot password form */}
      {showForgotPassword && (
        <ForgotPassword 
          onClose={() => setShowForgotPassword(false)} 
        />
      )}
    </div>
  );
}
```

## Password Reset Flow

1. **User requests reset:**
   - User enters their email address
   - System sends reset email (if email exists)

2. **User receives email:**
   - Email contains a reset link: `https://stream-lineai.com/reset-password?token=...`
   - Link expires in 1 hour
   - Token can only be used once

3. **User resets password:**
   - User clicks link and is taken to reset page
   - User enters new password (min 8 characters)
   - System validates token and updates password
   - User is redirected to login page

## Security Features

- **Token expiration:** Reset tokens expire after 1 hour
- **One-time use:** Tokens can only be used once
- **Email privacy:** Response doesn't reveal if email exists
- **Password strength:** Minimum 8 characters required
- **Secure tokens:** Cryptographically secure random tokens

## Current Limitations

1. **Admin-focused:** The current implementation uses `AdminService`, but since it uses the unified User model, it should work for all users
2. **In-memory tokens:** Reset tokens are stored in memory (not persistent across server restarts)
3. **Production only:** Email sending only works on production server

## Future Improvements

Consider these enhancements:
- Store reset tokens in database for persistence
- Support for regular users (not just admins)
- Add rate limiting to prevent abuse
- Support for custom reset link URLs per app
- Add password strength requirements (uppercase, numbers, special chars)

## Testing

### Test Password Reset Flow

```bash
# 1. Request reset
curl -X POST https://server.stream-lineai.com/email/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# 2. Check email for token (or use test endpoint)

# 3. Reset password
curl -X POST https://server.stream-lineai.com/email/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your_token_here",
    "new_password": "newPassword123",
    "confirm_password": "newPassword123"
  }'
```

## Related Endpoints

- `POST /users/{user_id}/password` - Update password (requires current password)
- `POST /email/test-forgot-password` - Test endpoint for development

## Support

If you encounter issues:
- Check that you're using the production API URL: `https://server.stream-lineai.com`
- Verify the email exists in the system
- Ensure the reset token hasn't expired (1 hour limit)
- Check that the token hasn't been used already

---

**Note:** The password reset functionality is available and working, but it's currently optimized for admin users. For cross-app users, you can use the same endpoints since they use the unified User model.

