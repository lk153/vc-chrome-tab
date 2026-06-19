/**
 * Rate limiting. When Upstash Redis is configured (UPSTASH_REDIS_REST_URL/TOKEN)
 * it uses a shared sliding-window limiter that survives across serverless
 * instances; otherwise it falls back to a per-process in-memory limiter, which
 * is fine for local single-process dev.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

/** True when real Upstash creds are present (shared limiter active). */
export const usingUpstash = Boolean(url && token);

const redis = usingUpstash ? new Redis({ url: url!, token: token! }) : null;

// Reuse one Ratelimit per (bucket, limit, window) instead of rebuilding it.
const limiters = new Map<string, Ratelimit>();
function upstashLimiter(bucket: string, limit: number, windowSec: number): Ratelimit | null {
  if (!redis) return null;
  const cacheKey = `${bucket}:${limit}:${windowSec}`;
  let rl = limiters.get(cacheKey);
  if (!rl) {
    rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: `vctabs:rl:${bucket}`,
      analytics: false,
    });
    limiters.set(cacheKey, rl);
  }
  return rl;
}

// In-memory fallback (per-process).
const mem = new Map<string, { count: number; resetAt: number }>();
function memAllow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const e = mem.get(key);
  if (!e || e.resetAt < now) {
    mem.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (e.count >= limit) return false;
  e.count += 1;
  return true;
}

/** Allow one hit against `bucket:key`. Returns false when the limit is hit. */
export async function checkLimit(
  bucket: string,
  key: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  const rl = upstashLimiter(bucket, limit, windowSec);
  if (rl) {
    const { success } = await rl.limit(key);
    return success;
  }
  return memAllow(`${bucket}:${key}`, limit, windowSec * 1000);
}

/**
 * Client IP. On Vercel x-forwarded-for is "client, proxy…" and the leftmost
 * entry is the real client; falls back to x-real-ip, then a constant for local.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "local";
}

/**
 * Layered limit for credential endpoints: per-IP (burst) AND per-email (slow).
 * Both must pass.
 */
export async function limitAuth(req: Request, email: string): Promise<boolean> {
  const [okIp, okEmail] = await Promise.all([
    checkLimit("auth-ip", clientIp(req), 30, 60), // 30 / min per IP
    checkLimit("auth-email", email.toLowerCase(), 8, 900), // 8 / 15 min per email
  ]);
  return okIp && okEmail;
}

/** Per-IP limit for endpoints without an email (refresh, reset-password). */
export function limitIp(
  req: Request,
  bucket: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  return checkLimit(bucket, clientIp(req), limit, windowSec);
}
