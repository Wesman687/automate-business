let tokenGetter: () => string | null = () => {
  if (typeof window === "undefined") return null;
  // Check for admin_token first (used by admin components), then fall back to auth_token
  return localStorage.getItem("admin_token") || localStorage.getItem("auth_token");
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