/**
 * Client-generated IDs (UUID v4). Generating on the client keeps offline
 * creates working and makes Phase 2 sync idempotent.
 */
export function newId(): string {
  return crypto.randomUUID();
}
