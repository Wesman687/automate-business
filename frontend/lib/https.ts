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

  // Always use production server for email endpoints
  const isEmailEndpoint = path.includes('/contact') || path.includes('/email');
  const url = isEmailEndpoint 
    ? `https://server.stream-lineai.com${path}`
    : shouldProxy ? buildProxyUrl(path) : buildBackendUrl(path);
  let res
  const h = new Headers(headers || {});
  if (withAuth) {
    const token = getAuthToken();
    if (token && !h.has("Authorization")) h.set("Authorization", `Bearer ${token}`);
  }
  if (!h.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    h.set("Content-Type", "application/json");
  }

  res = await fetch(url, { ...init, headers: h, credentials: 'include', cache: 'no-store' });
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
