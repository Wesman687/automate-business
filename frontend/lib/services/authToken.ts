// lib/authToken.ts
let tokenGetter: (() => string | null) | null = null;

export function setTokenGetter(fn: () => string | null) {
  tokenGetter = fn;
}

export function getAuthToken(): string | null {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  } catch {
    return null;
  }
}

export function currentToken(): string | null {
  return tokenGetter ? tokenGetter() : null;
}

export function decodeJwt<T = any>(token?: string | null): T | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}
