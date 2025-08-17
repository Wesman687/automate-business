'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { getApiUrl } from '@/lib/api';
import { setTokenGetter, getAuthToken } from '@/lib/authToken'; // ⬅️ import

type User = {
  id?: number;
  email: string;
  name?: string;
  user_type?: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
  [k: string]: any;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const verifying = useRef(false);

  // --- TOKEN WIRING (this is where tokenGetter is used) ---
  // Keep the JWT in memory; optionally mirror to localStorage
  const tokenRef = useRef<string | null>(null);

  const setToken = useCallback((t: string | null) => {
    tokenRef.current = t;
    // Optional persistence; remove if you want memory-only
    try {
      if (t) localStorage.setItem('auth_token', t);
      else localStorage.removeItem('auth_token');
    } catch {}
  }, []);

  useEffect(() => {
    // Tell the HTTP client how to read the current token
    setTokenGetter(() => tokenRef.current);
    // Rehydrate on first load (optional)
    setToken(getAuthToken());
  }, [setToken]);
  // --- END TOKEN WIRING ---

  // Verify current session using the Next proxy (forwards cookies to API)
  const refresh = useCallback(async () => {
    if (verifying.current) return;
    verifying.current = true;
    try {
      const res = await fetch('/api/check-auth', { cache: 'no-store' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      const u = data?.user ?? data;
      setUser(u ?? null);
    } finally {
      verifying.current = false;
    }
  }, []);

  // On mount, try to restore session
  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  // Login: call API directly so Set-Cookie lands on API domain,
  // and also capture the JWT from the response body for Authorization header usage.
  const login = useCallback(
    async (email: string, password: string) => {
      const apiBase = getApiUrl();
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      // Capture token from body (your backend returns { token, user, ... })
      try {
        const data = await res.json();
        if (data?.token) setToken(data.token);
      } catch {
        // if body is empty or not JSON, ignore
      }

      await refresh();
      return true;
    },
    [refresh, setToken]
  );

  // Logout via proxy and clear the token
  const logout = useCallback(async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } finally {
      setToken(null);
      setUser(null);
    }
  }, [setToken]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: !!(user && (user.is_admin || user.user_type === 'admin')),
      loading,
      login,
      logout,
      refresh,
    }),
    [user, loading, login, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
