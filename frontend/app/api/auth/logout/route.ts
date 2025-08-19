import { NextRequest, NextResponse } from "next/server";
import { API_BASE, BACKEND_PREFIX } from "@/lib/config";

export const dynamic = "force-dynamic";

function join(base: string, ...parts: string[]) {
  const b = base.replace(/\/+$/, "");
  const path = parts.filter(Boolean).map(p => p.replace(/^\/+|\/+$/g, "")).join("/");
  return `${b}/${path}`;
}

export async function POST(req: NextRequest) {
  const upstream = join(API_BASE, BACKEND_PREFIX, "auth/logout");

  const res = await fetch(upstream, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      authorization: req.headers.get("authorization") ?? "",
      "content-type": "application/json",
    },
    body: (await req.text()) || undefined,
    cache: "no-store",
  });

  const bodyText = await res.text();
  const out = new NextResponse(bodyText, { status: res.status });

  const ct = res.headers.get("content-type");
  if (ct) out.headers.set("content-type", ct);

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) out.headers.set("set-cookie", setCookie);

  return out;
}
