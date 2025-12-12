# Auth Server Integration Guide

This guide explains how to integrate your application with the Streamline AI authentication server.

## Base URL

**Production:** `https://server.stream-lineai.com`  
**Development (Local Backend):** `http://localhost:8005`

**Note:** You can use the production auth server from your local development environment! Just point your app to `https://server.stream-lineai.com` instead of localhost.

All endpoints are prefixed with `/api/auth`

---

## Authentication Flow

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "user_type": "customer",
    "is_admin": false,
    "is_customer": true,
    "is_super_admin": false,
    "permissions": []
  }
}
```

**Response (Error - 401):**
```json
{
  "detail": "Invalid email or password"
}
```

**Example (JavaScript/Fetch):**
```javascript
const response = await fetch('https://server.stream-lineai.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();

if (response.ok) {
  // Store token for future requests
  localStorage.setItem('auth_token', data.token);
  console.log('Logged in as:', data.user.email);
} else {
  console.error('Login failed:', data.detail);
}
```

---

### 2. Using the Token for Authenticated Requests

After login, include the token in the `Authorization` header for all authenticated requests:

**Header Format:**
```
Authorization: Bearer <token>
```

**Example:**
```javascript
const token = localStorage.getItem('auth_token');

const response = await fetch('https://server.stream-lineai.com/api/some-protected-endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

### 3. Verify Token / Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "user_type": "customer",
    "is_admin": false,
    "is_customer": true,
    "is_super_admin": false,
    "permissions": []
  }
}
```

**Response (Error - 401):**
```json
{
  "detail": "Not authenticated (no token)"
}
```

**Example:**
```javascript
async function getCurrentUser() {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch('https://server.stream-lineai.com/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.user;
  } else {
    // Token expired or invalid
    localStorage.removeItem('auth_token');
    // Redirect to login
    return null;
  }
}
```

---

### 4. Verify Token Validity

**Endpoint:** `GET /api/auth/verify`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "valid": true,
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "user_type": "customer",
    "is_admin": false,
    "is_customer": true,
    "is_super_admin": false
  }
}
```

**Response (Error - 401):**
```json
{
  "detail": "Invalid or expired token"
}
```

---

### 5. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Logged out successfully"
}
```

**Example:**
```javascript
async function logout() {
  const token = localStorage.getItem('auth_token');
  
  await fetch('https://server.stream-lineai.com/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  localStorage.removeItem('auth_token');
  // Redirect to login page
}
```

---

## Complete Integration Example

```javascript
class AuthClient {
  constructor(baseUrl = 'https://server.stream-lineai.com') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }
  
  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }
  
  async getCurrentUser() {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      this.token = null;
      localStorage.removeItem('auth_token');
      throw new Error('Token expired or invalid');
    }
    
    const data = await response.json();
    return data.user;
  }
  
  async logout() {
    if (!this.token) return;
    
    try {
      await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
    }
  }
  
  async authenticatedFetch(url, options = {}) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // If token expired, clear it
    if (response.status === 401) {
      this.token = null;
      localStorage.removeItem('auth_token');
      throw new Error('Token expired');
    }
    
    return response;
  }
}

// Usage
const auth = new AuthClient();

// Login
try {
  const result = await auth.login('user@example.com', 'password123');
  console.log('Logged in:', result.user);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Make authenticated request
try {
  const response = await auth.authenticatedFetch('https://server.stream-lineai.com/api/some-endpoint');
  const data = await response.json();
  console.log('Data:', data);
} catch (error) {
  console.error('Request failed:', error.message);
}
```

---

## Error Handling

### Common HTTP Status Codes

- **200 OK** - Request successful
- **401 Unauthorized** - Invalid credentials or expired token
- **403 Forbidden** - Valid token but insufficient permissions
- **404 Not Found** - Endpoint doesn't exist
- **500 Internal Server Error** - Server error

### Token Expiration

Tokens expire after 24 hours. When you receive a 401 error:

1. Clear the stored token
2. Redirect user to login page
3. Prompt user to log in again

### Example Error Handler

```javascript
async function handleApiRequest(url, options = {}) {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }
  
  return response.json();
}
```

---

## CORS Configuration

The auth server is configured to allow requests from:
- `localhost` (any port - for local development)
- `127.0.0.1` (any port)
- `https://stream-lineai.com`
- `https://www.stream-lineai.com`
- `https://server.stream-lineai.com`
- `https://whatnot.miracle-coins.com`
- `*.miracle-coins.com` (any subdomain)
- Vercel deployment domains
- Your IP address (67.190.222.*)

**Using Production Auth from Local Development:**

You can absolutely use the production auth server (`https://server.stream-lineai.com`) from your local development environment! This is useful when:
- You want to test against real user data
- You don't want to run the backend locally
- You're developing a frontend that needs authentication

**Example:**
```javascript
// In your local dev environment, use production URL
const AUTH_BASE_URL = 'https://server.stream-lineai.com';

// This will work from localhost:3000, localhost:5173, etc.
const response = await fetch(`${AUTH_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

If you need to add your domain, contact the backend administrator.

---

## Security Best Practices

1. **Never store passwords** - Only store the JWT token
2. **Use HTTPS in production** - Always use `https://` for production requests
3. **Handle token expiration** - Always check for 401 errors and redirect to login
4. **Don't expose tokens** - Never log tokens or include them in error messages
5. **Use secure storage** - Consider using `httpOnly` cookies if possible (requires backend support)

---

## Testing

### Test Login Credentials

Use your actual user credentials that exist in the database.

### Test Endpoints

```bash
# Login
curl -X POST https://server.stream-lineai.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get current user (replace TOKEN with actual token)
curl -X GET https://server.stream-lineai.com/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Verify token
curl -X GET https://server.stream-lineai.com/api/auth/verify \
  -H "Authorization: Bearer TOKEN"
```

---

## Support

If you encounter issues:
1. Check the network tab in browser dev tools
2. Verify the base URL is correct
3. Ensure CORS is properly configured
4. Check that the token is being sent in the Authorization header
5. Verify the token hasn't expired (24 hour lifetime)

For additional help, contact the backend administrator.

