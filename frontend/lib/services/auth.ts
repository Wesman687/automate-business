// lib/services/auth.ts
import { api, http } from '@/lib/https';
import { clearAuthToken } from '@/lib/authToken';

export const login = (email: string, password: string) =>
  http<{ token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    useProxy: false, // go straight to FastAPI so Set-Cookie lands on API domain
  });

// ✅ browser hits Next -> Next hits FastAPI
export const verify = () => api.get<{ valid: boolean; user?: any }>('/auth/verify');

export const logout = async () => {
  try {
    await api.post<{ message: string }>('/auth/logout'); // via proxy
  } finally {
    clearAuthToken();
  }
};
