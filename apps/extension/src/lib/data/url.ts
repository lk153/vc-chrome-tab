/**
 * Splits a URL into a display origin and an editable suffix, matching the edit
 * modal's design (`URL: http://host/` heading + a `path?query#hash` input).
 * Falls back to a single full-URL field when the value isn't a parseable URL.
 */
export function splitUrl(url: string): { origin: string; suffix: string } {
  try {
    const u = new URL(url);
    return {
      origin: `${u.origin}/`,
      suffix: `${u.pathname}${u.search}${u.hash}`.replace(/^\//, ""),
    };
  } catch {
    return { origin: "", suffix: url };
  }
}

/** Re-joins an origin + suffix back into a full URL (inverse of `splitUrl`). */
export function joinUrl(origin: string, suffix: string): string {
  if (!origin) return suffix.trim();
  return origin + suffix.trim().replace(/^\//, "");
}
