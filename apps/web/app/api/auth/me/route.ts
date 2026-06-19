import { toAuthUser, userFromRequest } from "@/lib/auth/session";
import { errorJson, json, preflight } from "@/lib/http";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return preflight(req.headers.get("origin"));
}

export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  const user = await userFromRequest(req);
  if (!user) return errorJson(401, "Unauthorized", origin);
  return json({ user: toAuthUser(user) }, 200, origin);
}
