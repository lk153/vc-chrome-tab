/** Server-only environment. Reads are eager so missing config fails fast. */
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.includes("PASTE_YOUR")) {
    throw new Error(`Missing or unset env var: ${name} (see apps/web/.env.example)`);
  }
  return value;
}

export const env = {
  mongoUri: required("MONGODB_URI"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && !s.includes("REPLACE_WITH")),
};
