'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getApiUrl } from '@/lib/api';

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

  // Verify current session using the Next proxy (forwards browser cookies to API)
  const refresh = async () => {
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
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login: hit API directly so Set-Cookie lands on the API domain (.stream-lineai.com)
  const login = async (email: string, password: string) => {
    const apiBase = getApiUrl();
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      credentials: 'include', // <-- receive cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return false;

    // Now verify (via proxy) to fetch the user object and populate context
    await refresh();
    return true;
  };

  // Logout via Next proxy (so Set-Cookie delete header is passed through)
  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      refresh,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
