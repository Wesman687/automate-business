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
import { setTokenGetter, getAuthToken } from '@/lib/authToken';
import { verify as verifySvc, login as apiLogin, logout as apiLogout } from '@/lib/services/auth';


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

  // ---- Token wiring ----
  const tokenRef = useRef<string | null>(null);

  const setToken = useCallback((t: string | null) => {
    tokenRef.current = t;
    // optional persistence; keep if you want header auth to survive reloads
    try {
      if (t) localStorage.setItem('auth_token', t);
      else localStorage.removeItem('auth_token');
    } catch {}
  }, []);

  useEffect(() => {
    // let the HTTP client read the current token whenever it sends requests
    setTokenGetter(() => tokenRef.current);
    // rehydrate on first load (optional)
    setToken(getAuthToken());
  }, [setToken]);
  // ----------------------

  // Verify current session (via Next proxy -> FastAPI)
const refresh = useCallback(async () => {
  try {
    console.log('🔍 useAuth: Calling verifySvc...');
    const data = await verifySvc();          // <— use the service
    console.log('🔍 useAuth: verifySvc response:', data);
    const u = data?.user ?? data;
    console.log('🔍 useAuth: Setting user to:', u);
    setUser(u ?? null);
  } catch (error) {
    console.error('❌ useAuth: Error in refresh:', error);
    setUser(null);
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

  // Login: hit backend (no proxy) so Set-Cookie lands on API domain; also capture JWT from body
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const data = await apiLogin(email, password); // { token, user? }
        if (data?.token) setToken(data.token);
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [refresh, setToken]
  );

  // Logout via service; always clear local token & user
  const doLogout = useCallback(async () => {
    try {
      await apiLogout();
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
      logout: doLogout,   // <-- expose the wrapper
      refresh,
    }),
    [user, loading, login, doLogout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
