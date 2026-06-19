import { usersCol } from "@/lib/db/collections";
import { randomToken } from "@/lib/auth/tokens";
import { userFromRequest } from "@/lib/auth/session";
import { checkLimit } from "@/lib/ratelimit";
import { devLink, sendVerifyEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { errorJson, json, preflight } from "@/lib/http";

export const runtime = "nodejs";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function OPTIONS(req: Request) {
  return preflight(req.headers.get("origin"));
}

/** Authenticated resend of the email-verification link. */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const user = await userFromRequest(req);
  if (!user) return errorJson(401, "Unauthorized", origin);

  if (!(await checkLimit("resend-verify", user.id, 3, 600))) {
    return errorJson(429, "Please wait before requesting another email", origin);
  }
  if (user.emailVerified) return json({ ok: true, alreadyVerified: true }, 200, origin);

  const verify = randomToken();
  await (await usersCol()).updateOne(
    { id: user.id },
    { $set: { emailVerifyTokenHash: verify.hash, emailVerifyExpires: Date.now() + VERIFY_TTL_MS } },
  );

  const link = `${env.appBaseUrl}/verify?token=${verify.raw}`;
  await sendVerifyEmail(user.email, link);
  const dev = devLink(link);
  return json({ ok: true, ...(dev ? { devVerifyLink: dev } : {}) }, 200, origin);
}
