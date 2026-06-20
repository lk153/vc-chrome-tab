/**
 * Base URL of the sync API. Defaults to the deployed Vercel backend; override
 * with VITE_API_BASE_URL at build time (e.g. http://localhost:3000) to point at
 * a local dev server.
 */
export const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://vc-chrome-tab-extension.vercel.app"
).replace(/\/$/, "");
