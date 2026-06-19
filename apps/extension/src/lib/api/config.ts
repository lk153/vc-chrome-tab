/**
 * Base URL of the sync API. Defaults to the local dev server; set
 * VITE_API_BASE_URL at build time to point a production bundle at Vercel.
 */
export const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:3000"
).replace(/\/$/, "");
