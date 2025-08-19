// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE, BACKEND_PREFIX } from '@/lib/config';

export const dynamic = 'force-dynamic';

function join(base: string, ...parts: string[]) {
  const normalizedBase = base.replace(/\/+$/, '');
  const path = parts
    .filter(Boolean)
    .map(p => p.replace(/^\/+|\/+$/g, ''))
    .join('/');
  return `${normalizedBase}/${path}`;
}

export async function POST(req: NextRequest) {
  const upstream = join(API_BASE, BACKEND_PREFIX, 'auth/login');

  const res = await fetch(upstream, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: req.headers.get('cookie') ?? '',
      authorization: req.headers.get('authorization') ?? '',
    },
    body: await req.text(), // Forward the request body
    cache: 'no-store',
    credentials: 'include',
  });

  const body = await res.text();
  const out = new NextResponse(body, { status: res.status });

  // Preserve useful headers
  const ct = res.headers.get('content-type');
  if (ct) out.headers.set('content-type', ct);
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) out.headers.set('set-cookie', setCookie);

  return out;
}
