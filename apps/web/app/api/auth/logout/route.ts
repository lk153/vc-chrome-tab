import { revokeRefreshToken } from "@/lib/auth/refresh";
import { refreshSchema } from "@/lib/validation";
import { json, preflight } from "@/lib/http";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return preflight(req.headers.get("origin"));
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const parsed = refreshSchema.safeParse(await req.json().catch(() => null));
  if (parsed.success) await revokeRefreshToken(parsed.data.refreshToken);
  // Always succeed — logout is idempotent and must not leak token validity.
  return json({ ok: true }, 200, origin);
}
