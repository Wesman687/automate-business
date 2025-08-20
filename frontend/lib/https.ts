// lib/http.ts
import { API_BASE, BACKEND_PREFIX } from "./config";

// Simple cookie reader for CSRF double-submit (token is NOT HttpOnly)
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export function buildBackendUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  const prefix = BACKEND_PREFIX ? BACKEND_PREFIX.replace(/^\/?/, "") + "/" : "";
  return `${API_BASE}/${prefix}${clean}`.replace(/\/+/g, "/");
}

export function buildProxyUrl(path: string) {
  const clean = path.replace(/^\/+/, "");
  return `/api/${clean}`;
}

type Json = Record<string, any> | any[];

async function parse(res: Response) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  try { return ct.includes("application/json") ? (text ? JSON.parse(text) : null) : text; }
  catch { return text; }
}

export interface HttpOptions extends RequestInit {
  useProxy?: boolean;   // default true in browser
  expectJson?: boolean; // default true
  csrf?: boolean;       // add X-CSRF-Token from cookie 'csrf_token'
}

export async function http<T = any>(
  path: string,
  { useProxy, expectJson = true, headers, csrf, ...init }: HttpOptions = {}
): Promise<T> {
  const defaultUseProxy = typeof window !== "undefined";
  const shouldProxy = useProxy ?? defaultUseProxy;

  // Always force proxy if you want first-party cookies everywhere:
  const url = shouldProxy ? buildProxyUrl(path) : buildBackendUrl(path);
  

  const h = new Headers(headers || {});
  if (!h.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    h.set("Content-Type", "application/json");
  }

  // Optional CSRF header (double-submit): only for unsafe methods
  if (csrf && !['GET','HEAD','OPTIONS'].includes((init.method || 'GET').toUpperCase())) {
    const token = getCookie('csrf_token');
    if (token) h.set('X-CSRF-Token', token);
  }

  const res = await fetch(url, {
    ...init,
    headers: h,
    credentials: 'include', // <-- send cookies
    cache: 'no-store',
  });

  const data = await parse(res);
  if (!res.ok) {
    const msg = (data && (data.detail || data.error || data.message)) || res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  return (expectJson ? (data as T) : (data as any)) as T;
}

export const api = {
  get:  <T = any>(path: string, opt?: HttpOptions) => http<T>(path, { method: "GET", ...opt }),
  post: <T = any>(path: string, body?: Json, opt?: HttpOptions) =>
    http<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body), csrf: true, ...opt }),
  put:  <T = any>(path: string, body?: Json, opt?: HttpOptions) =>
    http<T>(path, { method: "PUT",  body: body === undefined ? undefined : JSON.stringify(body), csrf: true, ...opt }),
  patch:<T = any>(path: string, body?: Json, opt?: HttpOptions) =>
    http<T>(path, { method: "PATCH", body: body === undefined ? undefined : JSON.stringify(body), csrf: true, ...opt }),
  del:  <T = any>(path: string, opt?: HttpOptions) =>
    http<T>(path, { method: "DELETE", csrf: true, ...opt }),
};
