import { usersCol } from "@/lib/db/collections";
import { randomToken } from "@/lib/auth/tokens";
import { emailSchema } from "@/lib/validation";
import { limitAuth } from "@/lib/ratelimit";
import { devLink, sendResetEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { errorJson, json, preflight } from "@/lib/http";

export const runtime = "nodejs";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function OPTIONS(req: Request) {
  return preflight(req.headers.get("origin"));
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const parsed = emailSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorJson(400, "Invalid email", origin);
  const email = parsed.data.email.toLowerCase();

  if (!(await limitAuth(req, email))) {
    return errorJson(429, "Too many attempts, try again shortly", origin);
  }

  const users = await usersCol();
  const user = await users.findOne({ email });

  // Always return the same response whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  let dev: string | undefined;
  if (user) {
    const reset = randomToken();
    await users.updateOne(
      { id: user.id },
      { $set: { passwordResetTokenHash: reset.hash, passwordResetExpires: Date.now() + RESET_TTL_MS } },
    );
    const link = `${env.appBaseUrl}/reset?token=${reset.raw}`;
    await sendResetEmail(email, link);
    dev = devLink(link);
  }

  return json({ ok: true, ...(dev ? { devResetLink: dev } : {}) }, 200, origin);
}
