// lib/services/auth.ts
import { api, http } from "@/lib/https";
import { clearAuthToken } from '@/lib/authToken';

// If you want the cookie set on backend domain specifically, call direct (no proxy)
export const login = (email: string, password: string) =>
  http<{ token: string; user: any }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    useProxy: false, // call backend domain directly
  });

export const verify = () => (
  typeof window === 'undefined'
    // Server: call backend directly (no proxy)
    ? http<{ valid: boolean; user?: any }>('/auth/verify', {
        method: 'GET',
        useProxy: false,
      })
    // Browser: hit Next proxy so cookies are forwarded
    : api.get<{ valid: boolean; user?: any }>('/check-auth')
);

export const logout = async () => {
  try {
    // clears HttpOnly cookie on the API domain
    await api.post<{ message: string }>('/auth/logout');
  } catch {
    // even if network fails, still nuke local storage
  } finally {
    clearAuthToken(); // remove any stored tokens client-side
  }
};