// app/api/[...upstream]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE } from '@/lib/config';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';



async function forward(req: NextRequest) {
  const url = new URL(req.url);

  // IMPORTANT: keep the full pathname (/api/...) so /api/customers -> {API_BASE}/api/customers
  const upstreamUrl = `${API_BASE}${url.pathname}${url.search}`;

  const headers = new Headers(req.headers);
  // Forward cookies, auth header, etc. (Host will be rewritten by fetch)
  // If you set cookies on the API domain, credentials must be included:
  const res = await fetch(upstreamUrl, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : (req as any).body,
    // no streaming in dev: keep it simple
    credentials: 'include',
    cache: 'no-store',
    redirect: 'manual' as RequestRedirect,
  });

  // Pass through on success
  if (res.ok) {
    const body = await res.arrayBuffer();
    const out = new NextResponse(body, {
      status: res.status,
      headers: res.headers,
    });
    return out;
  }

  // Helpful error (so you can see *which* upstream URL failed)
  const text = await res.text();
  return NextResponse.json(
    {
      error: 'upstream_status_not_ok',
      upstream_url: upstreamUrl,
      upstream_status: res.status,
      upstream_body: text,
    },
    { status: res.status }
  );
}

export async function GET(req: NextRequest)  { return forward(req); }
export async function POST(req: NextRequest) { return forward(req); }
export async function PUT(req: NextRequest)  { return forward(req); }
export async function PATCH(req: NextRequest){ return forward(req); }
export async function DELETE(req: NextRequest){ return forward(req); }
