import { NextRequest, NextResponse } from 'next/server';
import { API_BASE, BACKEND_PREFIX } from '@/lib/config'; // uses NEXT_PUBLIC_API_URL_* that you already have

// Add the backend prefix ONLY for proxied requests.
// Keep your lib/config BACKEND_PREFIX = "" so direct calls (e.g. /auth) still work.
// No prefix needed - we want the request to go straight to the backend path
function buildTargetUrl(req: NextRequest, upstreamParts: string[]) {
  const upstream = (upstreamParts || []).join('/');
  const search = req.nextUrl.search; // includes leading '?', '' if none
  const base = API_BASE.replace(/\/+$/, '');
  const prefix = BACKEND_PREFIX ? BACKEND_PREFIX.replace(/^\/?/, '') + '/' : '';
  // Add /api prefix to match backend router structure
  const url = `${base}/${prefix}api/${upstream}`.replace(/\/+/g, '/');
  return `${url}${search}`;
}

function forwardHeaders(req: NextRequest) {
  const h = new Headers(req.headers);
  h.delete('host');
  h.delete('content-length');
  // keep cookies + auth
  return h;
}

async function handler(req: NextRequest, ctx: { params: { upstream: string[] } }) {
  console.log('Upstream parts:', ctx.params.upstream);
  const target = buildTargetUrl(req, ctx.params.upstream || []);
  console.log('Target URL:', target);
  const headers = forwardHeaders(req);

  let body: BodyInit | undefined = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Preserve body for POST/PUT/PATCH/DELETE
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) body = await req.text();
    else if (contentType.includes('form')) body = await req.formData();
    else body = await req.arrayBuffer();
  }

  const res = await fetch(target, {
    method: req.method,
    headers,
    body,
    credentials: 'include',
    redirect: 'manual',
    cache: 'no-store',
  });

  const buf = await res.arrayBuffer();
  const out = new NextResponse(buf, { status: res.status, statusText: res.statusText });
  res.headers.forEach((v, k) => out.headers.set(k, v));
  return out;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
