import { newId } from "@vctabs/shared";
import { usersCol } from "@/lib/db/collections";
import type { UserDoc } from "@/lib/db/types";
import { hashPassword } from "@/lib/auth/password";
import { randomToken, signAccessToken } from "@/lib/auth/tokens";
import { issueRefreshToken } from "@/lib/auth/refresh";
import { toAuthUser } from "@/lib/auth/session";
import { credentialsSchema } from "@/lib/validation";
import { limitAuth } from "@/lib/ratelimit";
import { devLink, sendVerifyEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { errorJson, json, preflight } from "@/lib/http";

export const runtime = "nodejs";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function OPTIONS(req: Request) {
  return preflight(req.headers.get("origin"));
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const parsed = credentialsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorJson(400, "Invalid email or password format", origin);
  const email = parsed.data.email.toLowerCase();

  if (!(await limitAuth(req, email))) {
    return errorJson(429, "Too many attempts, try again shortly", origin);
  }

  const users = await usersCol();
  if (await users.findOne({ email })) {
    return errorJson(409, "An account with this email already exists", origin);
  }

  const now = Date.now();
  const verify = randomToken();
  const user: UserDoc = {
    id: newId(),
    email,
    passwordHash: await hashPassword(parsed.data.password),
    emailVerified: false,
    tokenVersion: 0,
    emailVerifyTokenHash: verify.hash,
    emailVerifyExpires: now + VERIFY_TTL_MS,
    createdAt: now,
    updatedAt: now,
  };
  await users.insertOne(user);

  const link = `${env.appBaseUrl}/verify?token=${verify.raw}`;
  await sendVerifyEmail(email, link);

  const accessToken = await signAccessToken(user.id, user.tokenVersion);
  const refreshToken = await issueRefreshToken(user.id, undefined, req.headers.get("user-agent") ?? undefined);
  const dev = devLink(link);
  return json(
    { user: toAuthUser(user), tokens: { accessToken, refreshToken }, ...(dev ? { devVerifyLink: dev } : {}) },
    201,
    origin,
  );
}
