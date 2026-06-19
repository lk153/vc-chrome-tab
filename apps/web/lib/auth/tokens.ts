import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "node:crypto";
import { env } from "../env";

const accessKey = new TextEncoder().encode(env.jwtAccessSecret);
const ACCESS_TTL = "15m";
const ISSUER = "vctabs";
const AUDIENCE = "vctabs-extension";

export interface AccessClaims {
  sub: string;
  tv: number;
}

export async function signAccessToken(userId: string, tokenVersion: number): Promise<string> {
  return new SignJWT({ tv: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(accessKey);
}

export async function verifyAccessToken(token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, accessKey, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return { sub: String(payload.sub), tv: Number(payload.tv ?? 0) };
  } catch {
    return null;
  }
}

/** Opaque single-use token (32 CSPRNG bytes). Returns the raw value + its hash.
 *  Used for refresh tokens, email verification, and password reset. */
export function randomToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: hashToken(raw) };
}

export const generateRefreshToken = randomToken;

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
