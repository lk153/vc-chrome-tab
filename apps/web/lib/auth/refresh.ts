import { newId } from "@vctabs/shared";
import { refreshTokensCol } from "../db/collections";
import { generateRefreshToken, hashToken } from "./tokens";

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Mint a new refresh token (new family unless continuing rotation). */
export async function issueRefreshToken(userId: string, family?: string, userAgent?: string): Promise<string> {
  const { raw, hash } = generateRefreshToken();
  const col = await refreshTokensCol();
  await col.insertOne({
    id: newId(),
    userId,
    tokenHash: hash,
    family: family ?? newId(),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    revokedAt: null,
    userAgent,
    createdAt: Date.now(),
  });
  return raw;
}

export interface RotateResult {
  userId: string;
  raw: string;
}

/**
 * Validate + rotate a refresh token. Reuse of an already-revoked token (theft
 * signal) revokes the entire family and fails.
 */
export async function rotateRefreshToken(raw: string, userAgent?: string): Promise<RotateResult | null> {
  const col = await refreshTokensCol();
  const doc = await col.findOne({ tokenHash: hashToken(raw) });
  if (!doc) return null;

  if (doc.revokedAt || doc.expiresAt.getTime() < Date.now()) {
    await col.updateMany({ family: doc.family, revokedAt: null }, { $set: { revokedAt: Date.now() } });
    return null;
  }

  await col.updateOne({ id: doc.id }, { $set: { revokedAt: Date.now() } });
  const next = generateRefreshToken();
  await col.insertOne({
    id: newId(),
    userId: doc.userId,
    tokenHash: next.hash,
    family: doc.family,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    revokedAt: null,
    userAgent,
    createdAt: Date.now(),
  });
  return { userId: doc.userId, raw: next.raw };
}

export async function revokeRefreshToken(raw: string): Promise<void> {
  const col = await refreshTokensCol();
  await col.updateOne({ tokenHash: hashToken(raw) }, { $set: { revokedAt: Date.now() } });
}

/** Revoke every live refresh token for a user (password reset / log out all). */
export async function revokeAllForUser(userId: string): Promise<void> {
  const col = await refreshTokensCol();
  await col.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: Date.now() } });
}
