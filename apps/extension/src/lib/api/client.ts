import { API_BASE_URL } from "./config";
import { clearSession, getSession, updateTokens } from "./session";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Authenticated fetch. Attaches the access token; on a 401 it performs a single
 * de-duplicated refresh and retries once. A failed refresh clears the session
 * (which broadcasts a sign-out to all contexts).
 */
export async function apiFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("content-type", "application/json");
  const token = getSession()?.tokens.accessToken;
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (res.status === 401 && retry && getSession()?.tokens.refreshToken) {
    if (await ensureRefreshed()) return apiFetch(path, init, false);
  }
  return res;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  const data = (await res.json().catch(() => null)) as T & { error?: string };
  if (!res.ok) throw new ApiError(res.status, data?.error ?? "Request failed");
  return data;
}

let refreshing: Promise<boolean> | null = null;

function ensureRefreshed(): Promise<boolean> {
  if (!refreshing) refreshing = doRefresh().finally(() => (refreshing = null));
  return refreshing;
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = getSession()?.tokens.refreshToken;
  if (!refreshToken) return false;
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    await clearSession();
    return false;
  }
  const data = (await res.json()) as { tokens: { accessToken: string; refreshToken: string } };
  await updateTokens(data.tokens);
  return true;
}
