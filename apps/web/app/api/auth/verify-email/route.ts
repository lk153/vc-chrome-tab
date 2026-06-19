import { usersCol } from "@/lib/db/collections";
import { hashToken } from "@/lib/auth/tokens";
import { verifyTokenSchema } from "@/lib/validation";
import { limitIp } from "@/lib/ratelimit";
import { errorJson, json, preflight } from "@/lib/http";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return preflight(req.headers.get("origin"));
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (!(await limitIp(req, "verify-email", 20, 60))) {
    return errorJson(429, "Too many attempts, try again shortly", origin);
  }

  const parsed = verifyTokenSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorJson(400, "Invalid verification link", origin);

  const users = await usersCol();
  const user = await users.findOne({ emailVerifyTokenHash: hashToken(parsed.data.token) });
  if (!user || !user.emailVerifyExpires || user.emailVerifyExpires < Date.now()) {
    return errorJson(400, "This verification link is invalid or has expired", origin);
  }

  await users.updateOne(
    { id: user.id },
    {
      $set: { emailVerified: true, updatedAt: Date.now() },
      $unset: { emailVerifyTokenHash: "", emailVerifyExpires: "" },
    },
  );
  return json({ ok: true, email: user.email }, 200, origin);
}
