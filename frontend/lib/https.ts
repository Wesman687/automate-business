// lib/http.ts
import { API_BASE, BACKEND_PREFIX } from "./config";
import { getAuthToken } from "./authToken";

// Build backend URL (allows absolute URLs too)
export function buildBackendUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  const clean = path.replace(/^\/+/, "");
  const prefix = BACKEND_PREFIX ? BACKEND_PREFIX.replace(/^\/?/, "") + "/" : "";
  return `${API_BASE}/${prefix}${clean}`.replace(/\/+/g, "/");
}

// Build Next proxy URL (for when you want to hit /api/[...upstream])
export function buildProxyUrl(path: string) {
  const clean = path.replace(/^\/+/, "");
  return `/api/${clean}`; // our catch-all proxy route
}

type Json = Record<string, any> | any[];

async function parse(res: Response) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  try {
    return ct.includes("application/json") ? (text ? JSON.parse(text) : null) : text;
  } catch {
    return text;
  }
}

export interface HttpOptions extends RequestInit {
  useProxy?: boolean;      // default true in browser
  withAuth?: boolean;      // default true for app endpoints
  expectJson?: boolean;    // default true for convenience
}

export async function http<T = any>(
  path: string,
  { useProxy, withAuth = true, expectJson = true, headers, ...init }: HttpOptions = {}
): Promise<T> {
  // Default to proxy in the browser (avoids CORS), direct on the server
  const defaultUseProxy = typeof window !== "undefined";
  const shouldProxy = useProxy ?? defaultUseProxy;

  const url = shouldProxy ? buildProxyUrl(path) : buildBackendUrl(path);

  const h = new Headers(headers || {});
  if (withAuth) {
    const token = getAuthToken();
    if (token && !h.has("Authorization")) h.set("Authorization", `Bearer ${token}`);
  }
  if (!h.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    h.set("Content-Type", "application/json");
  }

  try {
  const res = await fetch(url, { ...init, headers: h, credentials: 'include', cache: 'no-store' });
  const data = await parse(res);
  if (!res.ok) throw { res, data };
  return (expectJson ? (data as T) : (data as any)) as T;
} catch (e: any) {
  // fallback only on GET + 404 to alternate admin/non-admin paths
  const status = e?.res?.status;
  const method = (init.method || 'GET').toUpperCase();
  if (status === 404 && method === 'GET') {
    const alt = url
      .replace('/sessions', '/admin/chat-logs')
      .replace('/appointments/smart-slots', '/admin/appointments/smart-slots')
      .replace('/appointments?', '/admin/appointments?');
    if (alt !== url) {
      const res2 = await fetch(alt, { ...init, headers: h, credentials: 'include', cache: 'no-store' });
      const data2 = await parse(res2);
      if (!res2.ok) {
        const msg = (data2 && (data2.detail || data2.error || data2.message)) || res2.statusText;
        throw new Error(`${res2.status} ${msg}`);
      }
      return (expectJson ? (data2 as T) : (data2 as any)) as T;
    }
  }
  const msg = (e?.data && (e.data.detail || e.data.error || e.data.message)) || e?.res?.statusText || 'Request failed';
  throw new Error(msg);
}

  const data = await parse(res);
  if (!res.ok) {
    const msg = (data && (data.detail || data.error || data.message)) || res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }

  return (expectJson ? (data as T) : (data as any)) as T;
}

export const api = {
  get: <T = any>(path: string, opt?: HttpOptions) =>
    http<T>(path, { method: "GET", ...opt }),

  post: <T = any>(path: string, body?: Json, opt?: HttpOptions) =>
    http<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
      ...opt,
    }),

  put:  <T = any>(path: string, body?: Json, opt?: HttpOptions) =>
    http<T>(path, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
      ...opt,
    }),

  patch:<T = any>(path: string, body?: Json, opt?: HttpOptions) =>
    http<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
      ...opt,
    }),

  del:  <T = any>(path: string, opt?: HttpOptions) =>
    http<T>(path, { method: "DELETE", ...opt }),
};
