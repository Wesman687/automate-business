import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getServerApiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL_PROD ||
    process.env.NEXT_PUBLIC_API_URL_DEV ||
    "http://localhost:8001"
  );
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const apiBase = getServerApiBase();
  const upstream = `${apiBase}/customers/${params.id}`;
  const cookieHeader = cookies().toString() || "";
  try {
    const res = await fetch(upstream, { headers: { cookie: cookieHeader }, cache: "no-store" });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: "upstream_error", upstream, message: e?.message || "unknown" }, { status: 502 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const apiBase = getServerApiBase();
  const upstream = `${apiBase}/customers/${params.id}`;
  const cookieHeader = cookies().toString() || "";
  try {
    const res = await fetch(upstream, {
      method: "PUT",
      headers: { cookie: cookieHeader, "Content-Type": "application/json" },
      body: await req.text(),
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: "upstream_error", upstream, message: e?.message || "unknown" }, { status: 502 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const apiBase = getServerApiBase();
  const upstream = `${apiBase}/customers/${params.id}`;
  const cookieHeader = cookies().toString() || "";
  try {
    const res = await fetch(upstream, { method: "DELETE", headers: { cookie: cookieHeader } });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: "upstream_error", upstream, message: e?.message || "unknown" }, { status: 502 });
  }
}
