import type { Collection, SavedTab, Space } from "./types";

/** Public user shape returned by the API (never includes secrets). */
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

/** IDs deleted (tombstoned) since the client's last sync, by entity. */
export interface SyncDeleted {
  spaces: string[];
  collections: string[];
  tabs: string[];
}

/** Client → server: upserts + deletions to apply. */
export interface SyncPushBody {
  spaces: Space[];
  collections: Collection[];
  tabs: SavedTab[];
  deleted: SyncDeleted;
}

/** Server → client: changes since `?since=`, plus the new cursor (`now`). */
export interface SyncPullResponse {
  now: number;
  spaces: Space[];
  collections: Collection[];
  tabs: SavedTab[];
  deleted: SyncDeleted;
}

export interface SyncPushResponse {
  now: number;
}
