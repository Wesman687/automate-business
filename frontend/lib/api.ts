// lib/api.ts
import type { RequestInit } from 'next/dist/compiled/node-fetch';

/** Resolve API base URL (works in browser and on server/SSR) */
export const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isDev =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".local");

    return isDev
      ? process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:8001" // <--- make sure this matches your dev port
      : process.env.NEXT_PUBLIC_API_URL_PROD || "https://server.stream-lineai.com";
  }

  // Server side (Next.js)
  return process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:8001"
    : process.env.NEXT_PUBLIC_API_URL_PROD || "https://server.stream-lineai.com";
};

/* ---------------- Proxy-aware helpers (for app data) ---------------- */

function toProxy(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;      // allow absolute URL if ever needed
  if (path.startsWith("/api/")) return path;        // already proxy path
  if (path.startsWith("/api")) return `/${path}`;
  return path.startsWith("/") ? `/api${path}` : `/api/${path}`;
}

/** Drop-in replacement for the old fetchWithAuth:
 * - Hits Next API routes on the same origin (no CORS headaches)
 * - Those routes forward cookies to FastAPI
 */
export async function fetchWithAuth(path: string, init: RequestInit = {}) {
  const url = toProxy(path);
  return fetch(url, { cache: "no-store", ...init });
}

/** Convenience: JSON + throw on !ok */
export async function fetchJsonWithAuth<T = any>(path: string, init: RequestInit = {}) {
  const res = await fetchWithAuth(path, init);
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`) as any;
    err.payload = data;
    throw err;
  }
  return data as T;
}

/** Optional REST sugar */
export const api = {
  get: <T = any>(path: string, init: RequestInit = {}) =>
    fetchJsonWithAuth<T>(path, { ...init, method: "GET" }),

  post: <T = any>(path: string, body?: unknown, init: RequestInit = {}) =>
    fetchJsonWithAuth<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      ...init,
    }),

  put: <T = any>(path: string, body?: unknown, init: RequestInit = {}) =>
    fetchJsonWithAuth<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      ...init,
    }),

  del: <T = any>(path: string, init: RequestInit = {}) =>
    fetchJsonWithAuth<T>(path, { ...init, method: "DELETE" }),
};

/* ---------------- Direct auth calls (cookie set/cleared on API domain) ---------------- */

/** POST /auth/login — sets HttpOnly cookie on the API domain */
export const login = (email: string, password: string) => {
  const base = getApiUrl();
  return fetch(`${base}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  }).then(async (res) => {
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(`${res.status} ${data?.detail || data?.error || "Login failed"}`);
    return data as { token: string; user: any };
  });
};

/** Verify via Next proxy (forwards cookies to FastAPI) */
export const verify = () => fetchJsonWithAuth<{ valid: boolean; user?: any }>("/check-auth");

/** Logout via Next proxy (forwards cookie deletion to FastAPI) */
export const logout = () => fetchJsonWithAuth<{ message: string }>("/logout", { method: "POST" });

// Backward compat for existing imports
export const adminFetch = fetchWithAuth;
