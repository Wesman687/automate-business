# How to Use the Cross-App SDK in Your Whatnot Autoprint App

The SDK is currently in the codebase but not published to npm. Here are three ways to use it:

## Option 1: Copy SDK Files Directly (Easiest for Quick Setup)

Copy the SDK files directly into your Whatnot Autoprint project:

### Step 1: Copy the SDK folder

Copy the entire `frontend/lib/sdk` folder to your Whatnot Autoprint project:

```bash
# From the atuomate-web directory
cp -r frontend/lib/sdk /path/to/your/whatnot-app/lib/
```

Or on Windows:
```powershell
# From the atuomate-web directory
xcopy /E /I frontend\lib\sdk C:\path\to\your\whatnot-app\lib\sdk
```

### Step 2: Install dependencies

In your Whatnot Autoprint project, install the required dependencies:

```bash
npm install typescript @types/node
```

### Step 3: Use the SDK

```typescript
// In your Whatnot Autoprint app
import { createCrossAppSDK } from './lib/sdk';

const sdk = createCrossAppSDK({
  appId: 'whatnot-autoprint',
  domain: 'stream-lineai.com',
  apiBase: 'https://server.stream-lineai.com', // ✅ Important: Set this!
  debug: true
});

// Login
async function handleLogin(email: string, password: string) {
  try {
    const user = await sdk.auth.login({
      email,
      password,
      appMetadata: {
        app_name: 'Whatnot Autoprint',
        version: '1.0.0'
      }
    });
    console.log('Logged in:', user);
    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

---

## Option 2: Use as Local npm Package (Recommended for Development)

This allows you to keep the SDK updated from the main codebase.

### Step 1: Link the SDK package

In the `frontend/lib/sdk` directory:

```bash
cd frontend/lib/sdk
npm link
```

### Step 2: Link it in your Whatnot Autoprint project

In your Whatnot Autoprint project:

```bash
npm link streamline-cross-app-sdk
```

### Step 3: Use the SDK

```typescript
import { createCrossAppSDK } from 'streamline-cross-app-sdk';

const sdk = createCrossAppSDK({
  appId: 'whatnot-autoprint',
  domain: 'stream-lineai.com',
  apiBase: 'https://server.stream-lineai.com',
  debug: true
});
```

---

## Option 3: Install from Local File Path

If your Whatnot Autoprint project is in the same workspace or you can reference the path:

### Step 1: Update package.json

In your Whatnot Autoprint project's `package.json`:

```json
{
  "dependencies": {
    "streamline-cross-app-sdk": "file:../atuomate-web/frontend/lib/sdk"
  }
}
```

### Step 2: Install

```bash
npm install
```

### Step 3: Use the SDK

```typescript
import { createCrossAppSDK } from 'streamline-cross-app-sdk';

const sdk = createCrossAppSDK({
  appId: 'whatnot-autoprint',
  domain: 'stream-lineai.com',
  apiBase: 'https://server.stream-lineai.com',
  debug: true
});
```

---

## Complete Example: Login Component

Here's a complete example of how to use the SDK in a React component:

```typescript
// components/Login.tsx
import React, { useState } from 'react';
import { createCrossAppSDK } from '../lib/sdk'; // or 'streamline-cross-app-sdk'

const sdk = createCrossAppSDK({
  appId: 'whatnot-autoprint',
  domain: 'stream-lineai.com',
  apiBase: 'https://server.stream-lineai.com', // ✅ Set this!
  debug: true
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await sdk.auth.login({
        email,
        password,
        appMetadata: {
          app_name: 'Whatnot Autoprint',
          version: '1.0.0'
        }
      });

      console.log('✅ Login successful:', user);
      // Redirect or update app state
      
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## Important Configuration

**Always set `apiBase` explicitly!** The SDK defaults to `https://api.${domain}` which doesn't exist. Use:

- **Production**: `apiBase: 'https://server.stream-lineai.com'`
- **Local Development**: `apiBase: 'http://localhost:8005'`

---

## SDK Files Location

The SDK is located at:
```
atuomate-web/frontend/lib/sdk/
├── core/
│   ├── CrossAppAuthSDK.ts
│   └── CreditSDK.ts
├── types/
│   ├── auth.ts
│   └── credit.ts
├── dist/          # Compiled JavaScript (already built)
├── index.ts        # Main entry point
└── package.json
```

---

## Quick Start Checklist

1. ✅ Copy SDK files to your project (Option 1) OR link it (Option 2)
2. ✅ Install dependencies: `npm install typescript @types/node`
3. ✅ Initialize SDK with `apiBase: 'https://server.stream-lineai.com'`
4. ✅ Test login functionality
5. ✅ Register your app in the admin panel to get your `appId`

---

## Troubleshooting

### Error: Cannot find module 'streamline-cross-app-sdk'
- Make sure you've copied the SDK files or linked the package
- Check that the path in your import statement is correct

### Error: ERR_NAME_NOT_RESOLVED
- Make sure you've set `apiBase: 'https://server.stream-lineai.com'` in your SDK config
- Don't rely on the default `api.${domain}` URL

### Error: Module not found
- Ensure TypeScript can find the SDK types
- Check your `tsconfig.json` includes the SDK directory

---

**Need help?** Check the main integration guide: `ai_docs/docs/whatnot-autoprint-integration-guide.md`

