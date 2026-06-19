import { usersCol } from "@/lib/db/collections";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/tokens";
import { issueRefreshToken } from "@/lib/auth/refresh";
import { toAuthUser } from "@/lib/auth/session";
import { credentialsSchema } from "@/lib/validation";
import { limitAuth } from "@/lib/ratelimit";
import { errorJson, json, preflight } from "@/lib/http";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return preflight(req.headers.get("origin"));
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const parsed = credentialsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorJson(400, "Invalid email or password", origin);
  const email = parsed.data.email.toLowerCase();

  if (!(await limitAuth(req, email))) {
    return errorJson(429, "Too many attempts, try again shortly", origin);
  }

  const user = await (await usersCol()).findOne({ email });
  // Always run a hash comparison (dummy hash when no user) to avoid enumeration.
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? null);
  if (!user || !ok) return errorJson(401, "Invalid email or password", origin);

  const accessToken = await signAccessToken(user.id, user.tokenVersion);
  const refreshToken = await issueRefreshToken(user.id, undefined, req.headers.get("user-agent") ?? undefined);
  return json({ user: toAuthUser(user), tokens: { accessToken, refreshToken } }, 200, origin);
}
