let tokenGetter: () => string | null = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token"); // or your AuthContext can override
};
export const TOKEN_KEYS = ['admin_token', 'access_token', 'token']; // legacy keys too

export function clearAuthToken() {
  for (const k of TOKEN_KEYS) {
    try { localStorage.removeItem(k); } catch {}
    try { sessionStorage.removeItem(k); } catch {}
  }
}
export function setTokenGetter(fn: () => string | null) {
  tokenGetter = fn;
}

export function getAuthToken(): string | null {
  try {
    return tokenGetter();
  } catch {
    return null;
  }
}