import { usersCol } from "@/lib/db/collections";
import { hashPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/tokens";
import { revokeAllForUser } from "@/lib/auth/refresh";
import { resetPasswordSchema } from "@/lib/validation";
import { limitIp } from "@/lib/ratelimit";
import { errorJson, json, preflight } from "@/lib/http";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return preflight(req.headers.get("origin"));
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (!(await limitIp(req, "reset-password", 20, 60))) {
    return errorJson(429, "Too many attempts, try again shortly", origin);
  }

  const parsed = resetPasswordSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorJson(400, "Invalid reset request or weak password", origin);

  const users = await usersCol();
  const user = await users.findOne({ passwordResetTokenHash: hashToken(parsed.data.token) });
  if (!user || !user.passwordResetExpires || user.passwordResetExpires < Date.now()) {
    return errorJson(400, "This reset link is invalid or has expired", origin);
  }

  await users.updateOne(
    { id: user.id },
    {
      $set: {
        passwordHash: await hashPassword(parsed.data.password),
        emailVerified: true, // resetting via emailed link proves email control
        tokenVersion: user.tokenVersion + 1, // invalidate existing access tokens
        updatedAt: Date.now(),
      },
      $unset: { passwordResetTokenHash: "", passwordResetExpires: "" },
    },
  );
  // Revoke every refresh token so other sessions are signed out after a reset.
  await revokeAllForUser(user.id);

  return json({ ok: true }, 200, origin);
}
