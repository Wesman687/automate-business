// app/api/check-auth/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force Node runtime so process.env is available (esp. on Vercel)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getServerApiBase() {
  // Prefer explicit envs; fall back to the port you actually run locally
  return (
    process.env.NEXT_PUBLIC_API_URL_PROD ||
    process.env.NEXT_PUBLIC_API_URL_DEV ||
    "http://localhost:8001" // <-- change if your dev API is on a different port
  );
}

export async function GET() {
  const apiBase = getServerApiBase();

  try {
    const cookieHeader = cookies().toString() || "";

    // No auth cookie? Return 401 (not 500)
    if (!/auth_token=/.test(cookieHeader)) {
      return NextResponse.json(
        { valid: false, reason: "no auth cookie" },
        { status: 401 }
      );
    }

    const res = await fetch(`${apiBase}/auth/verify`, {
      method: "GET",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err: any) {
    // Make failures obvious instead of opaque 500s
    return NextResponse.json(
      {
        error: "upstream_error",
        apiBase,
        message: err?.message || "unknown",
        // include stack only in dev
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      },
      { status: 502 }
    );
  }
}
