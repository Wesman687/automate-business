// lib/services/auth.ts
import { api } from '@/lib/https';

export async function verify() {
  // Reads HttpOnly cookies server-side; returns { user }
  return api.get('/auth/verify', { useProxy: true });
}

export async function login(email: string, password: string) {
  // Backend sets Set-Cookie; our proxy re-emits it to browser (first-party cookie)
  return api.post('/auth/login', { email, password }, { useProxy: true });
}

export async function logout() {
  // Clears cookies on the backend; proxy re-emits Set-Cookie clearing
  return api.post('/auth/logout', {}, { useProxy: true });
}
