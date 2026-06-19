import { NextResponse } from "next/server";
import { env } from "./env";

/** CORS headers. Echoes an allowed origin, or `*` in dev when none configured. */
export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = env.allowedOrigins;
  const allow = !allowed.length ? "*" : origin && allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export function json(data: unknown, status = 200, origin: string | null = null): NextResponse {
  return NextResponse.json(data, { status, headers: corsHeaders(origin) });
}

export function errorJson(status: number, message: string, origin: string | null = null): NextResponse {
  return json({ error: message }, status, origin);
}

export function preflight(origin: string | null): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}
