import type { AuthResponse, AuthUser } from "@vctabs/shared";
import { API_BASE_URL } from "./config";
import { ApiError, apiJson } from "./client";

async function postPublic<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as T & { error?: string };
  if (!res.ok) throw new ApiError(res.status, data?.error ?? "Request failed");
  return data;
}

export function registerApi(email: string, password: string): Promise<AuthResponse> {
  return postPublic<AuthResponse>("/api/auth/register", { email, password });
}

export function loginApi(email: string, password: string): Promise<AuthResponse> {
  return postPublic<AuthResponse>("/api/auth/login", { email, password });
}

export function logoutApi(refreshToken: string): Promise<{ ok: boolean }> {
  return postPublic<{ ok: boolean }>("/api/auth/logout", { refreshToken });
}

export function meApi(): Promise<{ user: AuthUser }> {
  return apiJson<{ user: AuthUser }>("/api/auth/me");
}

/** Re-send the email-verification link (authenticated). */
export function resendVerificationApi(): Promise<{
  ok: boolean;
  alreadyVerified?: boolean;
  devVerifyLink?: string;
}> {
  return apiJson("/api/auth/resend-verification", { method: "POST" });
}

/** Request a password-reset email. Always succeeds (no account enumeration). */
export function requestPasswordResetApi(email: string): Promise<{ ok: boolean; devResetLink?: string }> {
  return postPublic("/api/auth/request-password-reset", { email });
}
