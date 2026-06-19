import { usersCol } from "@/lib/db/collections";
import { signAccessToken } from "@/lib/auth/tokens";
import { rotateRefreshToken } from "@/lib/auth/refresh";
import { toAuthUser } from "@/lib/auth/session";
import { refreshSchema } from "@/lib/validation";
import { errorJson, json, preflight } from "@/lib/http";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return preflight(req.headers.get("origin"));
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const parsed = refreshSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorJson(400, "Missing refresh token", origin);

  const rotated = await rotateRefreshToken(
    parsed.data.refreshToken,
    req.headers.get("user-agent") ?? undefined,
  );
  if (!rotated) return errorJson(401, "Invalid or expired session", origin);

  const user = await (await usersCol()).findOne({ id: rotated.userId });
  if (!user) return errorJson(401, "Invalid or expired session", origin);

  const accessToken = await signAccessToken(user.id, user.tokenVersion);
  return json({ user: toAuthUser(user), tokens: { accessToken, refreshToken: rotated.raw } }, 200, origin);
}
