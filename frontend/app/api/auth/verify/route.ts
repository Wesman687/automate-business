import { NextRequest, NextResponse } from "next/server";
import { API_BASE, BACKEND_PREFIX } from "@/lib/config";

export const dynamic = "force-dynamic"; // no caching

// Safe URL join (handles empty or leading/trailing slashes)
function join(base: string, ...parts: string[]) {
  const b = base.replace(/\/+$/, "");
  const path = parts
    .filter(Boolean)
    .map((p) => p.replace(/^\/+|\/+$/g, ""))
    .join("/");
  return `${b}/${path}`;
}

export async function GET(req: NextRequest) {
  const upstream = join(API_BASE, BACKEND_PREFIX, "auth/verify");

  const res = await fetch(upstream, {
    method: "GET",
    headers: {
      // Forward session cookie & bearer token if present
      cookie: req.headers.get("cookie") ?? "",
      authorization: req.headers.get("authorization") ?? "",
      // You can forward more headers if your API needs them
    },
    cache: "no-store",
  });

  const bodyText = await res.text();
  const out = new NextResponse(bodyText, { status: res.status });

  // Preserve content-type if provided
  const ct = res.headers.get("content-type");
  if (ct) out.headers.set("content-type", ct);

  // Bubble up Set-Cookie from the API (important for session refresh)
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) out.headers.set("set-cookie", setCookie);

  return out;
}
