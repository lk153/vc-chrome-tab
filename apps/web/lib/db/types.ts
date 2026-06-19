import type { Collection, SavedTab, Space } from "@vctabs/shared";

export interface UserDoc {
  id: string; // app-level UUID (we query by this, not Mongo _id)
  email: string; // lowercased
  passwordHash: string;
  emailVerified: boolean;
  tokenVersion: number; // bumped to revoke all refresh + access tokens
  displayName?: string;
  // Single-use email-verification token (SHA-256 hash + expiry).
  emailVerifyTokenHash?: string | null;
  emailVerifyExpires?: number | null;
  // Single-use password-reset token (SHA-256 hash + expiry).
  passwordResetTokenHash?: string | null;
  passwordResetExpires?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface RefreshTokenDoc {
  id: string;
  userId: string;
  tokenHash: string; // SHA-256 of the opaque token
  family: string; // rotation lineage (reuse detection)
  expiresAt: Date; // Mongo TTL index field
  revokedAt: number | null;
  userAgent?: string;
  createdAt: number;
}

/** Server-side fields added to every synced domain object. */
export interface Owned {
  ownerId: string;
  serverUpdatedAt: number; // server clock — drives the pull cursor
  deletedAt: number | null; // tombstone
}

export type SpaceDoc = Space & Owned;
export type CollectionDoc = Collection & Owned;
export type TabDoc = SavedTab & Owned;
