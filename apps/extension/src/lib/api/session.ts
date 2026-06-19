import type { AuthTokens, AuthUser } from "@vctabs/shared";
import { getLocal, setLocal } from "@/lib/chrome/storage";
import { hasChromeStorage } from "@/lib/chrome/runtime";

export const AUTH_KEY = "vctabs.auth.v1";

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

// In-memory mirror so apiFetch can read the token synchronously.
let cache: AuthSession | null = null;

export async function loadSession(): Promise<AuthSession | null> {
  cache = await getLocal<AuthSession | null>(AUTH_KEY, null);
  return cache;
}

export function getSession(): AuthSession | null {
  return cache;
}

export async function saveSession(session: AuthSession): Promise<void> {
  cache = session;
  await setLocal(AUTH_KEY, session);
}

export async function updateTokens(tokens: AuthTokens): Promise<void> {
  if (!cache) return;
  cache = { ...cache, tokens };
  await setLocal(AUTH_KEY, cache);
}

/** Refresh the cached user profile (e.g. after email verification flips). */
export async function updateUser(user: AuthUser): Promise<void> {
  if (!cache) return;
  cache = { ...cache, user };
  await setLocal(AUTH_KEY, cache);
}

export async function clearSession(): Promise<void> {
  cache = null;
  await setLocal(AUTH_KEY, null);
}

/** Notify when the session changes in another context (popup ↔ newtab, or a
 *  background refresh-failure sign-out). Returns an unsubscribe function. */
export function subscribeSession(onChange: (session: AuthSession | null) => void): () => void {
  if (!hasChromeStorage()) return () => {};
  const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area === "local" && changes[AUTH_KEY]) {
      cache = (changes[AUTH_KEY].newValue as AuthSession | null) ?? null;
      onChange(cache);
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
