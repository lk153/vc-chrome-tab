/**
 * Step 2 end-to-end: email verification, password reset, token revocation, and
 * rate limiting against a running dev server. Because Resend is configured the
 * API no longer leaks dev links, so we seed the token HASH directly in Mongo to
 * stand in for what the email would have contained, then drive the endpoint.
 */
import { MongoClient } from "mongodb";
import { createHash } from "node:crypto";

const BASE = process.env.BASE ?? process.env.APP_BASE_URL ?? "http://localhost:3000";
const URI = process.env.MONGODB_URI;
const dbName = (() => {
  try {
    return new URL(URI).pathname.replace(/^\//, "") || "vctabs";
  } catch {
    return "vctabs";
  }
})();

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const GEN_IP = "198.51.100.21"; // isolate this run's IP bucket from other tests
const RL_IP = "198.51.100.22";

const read = async (res) => ({ status: res.status, body: await res.json().catch(() => null) });
const post = (path, body, headers = {}) =>
  fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": GEN_IP, ...headers },
    body: JSON.stringify(body),
  });
const get = (path, headers = {}) =>
  fetch(`${BASE}${path}`, { headers: { "x-forwarded-for": GEN_IP, ...headers } });

let failures = 0;
const check = (label, cond, extra = "") => {
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? "  " + extra : ""}`);
  if (!cond) failures++;
};

async function main() {
  const mongo = new MongoClient(URI, { maxPoolSize: 2 });
  await mongo.connect();
  const users = mongo.db(dbName).collection("users");

  const email = `step2-${Date.now()}@example.com`;
  const password = "supersecret123";
  const cleanup = [email];

  // ── Register ──────────────────────────────────────────────────────────────
  let r = await read(await post("/api/auth/register", { email, password }));
  check("register → 201 + tokens", r.status === 201 && !!r.body?.tokens?.accessToken, `(${r.status})`);
  const access = r.body?.tokens?.accessToken;
  const refresh = r.body?.tokens?.refreshToken;
  check("register → user starts unverified", r.body?.user?.emailVerified === false);

  r = await read(await get("/api/auth/me", { authorization: `Bearer ${access}` }));
  check("me → emailVerified false", r.status === 200 && r.body?.user?.emailVerified === false);

  // ── Email verification ────────────────────────────────────────────────────
  r = await read(await post("/api/auth/verify-email", { token: "bogus-token-1234567890" }));
  check("verify-email bogus token → 400", r.status === 400);

  const vtok = `verify-${Date.now()}-abcdefghij`;
  await users.updateOne(
    { email },
    { $set: { emailVerifyTokenHash: sha256(vtok), emailVerifyExpires: Date.now() + 60_000 } },
  );
  r = await read(await post("/api/auth/verify-email", { token: vtok }));
  check("verify-email valid token → 200", r.status === 200 && r.body?.ok === true);

  r = await read(await get("/api/auth/me", { authorization: `Bearer ${access}` }));
  check("me → emailVerified true after verify", r.body?.user?.emailVerified === true);

  r = await read(await post("/api/auth/verify-email", { token: vtok }));
  check("verify-email reuse → 400 (single-use)", r.status === 400);

  // ── Password reset request (anti-enumeration) ─────────────────────────────
  r = await read(await post("/api/auth/request-password-reset", { email }));
  check("request-reset existing → 200", r.status === 200 && r.body?.ok === true);

  r = await read(await post("/api/auth/request-password-reset", { email: `nope-${Date.now()}@example.com` }));
  check("request-reset unknown → 200 (no enumeration)", r.status === 200 && r.body?.ok === true);

  // ── Password reset apply + revocation ─────────────────────────────────────
  r = await read(await post("/api/auth/reset-password", { token: "bogus", password: "newsecret123" }));
  check("reset-password bogus token → 400", r.status === 400);

  const rtok = `reset-${Date.now()}-abcdefghij`;
  const newPassword = "brandnewsecret456";
  await users.updateOne(
    { email },
    { $set: { passwordResetTokenHash: sha256(rtok), passwordResetExpires: Date.now() + 60_000 } },
  );
  r = await read(await post("/api/auth/reset-password", { token: rtok, password: newPassword }));
  check("reset-password valid token → 200", r.status === 200 && r.body?.ok === true);

  r = await read(await get("/api/auth/me", { authorization: `Bearer ${access}` }));
  check("old access token after reset → 401 (tokenVersion bumped)", r.status === 401);

  r = await read(await post("/api/auth/refresh", { refreshToken: refresh }));
  check("old refresh token after reset → 401 (revoked)", r.status === 401);

  r = await read(await post("/api/auth/login", { email, password: newPassword }));
  check("login with new password → 200", r.status === 200);

  r = await read(await post("/api/auth/login", { email, password }));
  check("login with old password → 401", r.status === 401);

  // ── Rate limiting (real Upstash if configured) ────────────────────────────
  const rlEmail = `rl-${Date.now()}@example.com`;
  let got429 = false;
  let attempts = 0;
  for (let i = 0; i < 14; i++) {
    attempts++;
    const rr = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": RL_IP },
      body: JSON.stringify({ email: rlEmail, password: "wrongwrong1" }),
    });
    if (rr.status === 429) {
      got429 = true;
      break;
    }
  }
  check("login brute force → 429 (rate limited)", got429, `(after ${attempts} attempts)`);

  await users.deleteMany({ email: { $in: cleanup } });
  await mongo.close();

  console.log(failures === 0 ? "\n✅ STEP 2 PASSED" : `\n❌ ${failures} FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("E2E step2 crashed:", e);
  process.exit(1);
});
