/** End-to-end smoke test of auth + sync against a running dev server. */
const BASE = process.env.BASE ?? "http://localhost:3000";
const email = `test-${Date.now()}@example.com`;
const password = "supersecret123";

const read = async (res) => ({ status: res.status, body: await res.json().catch(() => null) });
const post = (path, body, headers = {}) =>
  fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

let failures = 0;
function check(label, cond, extra = "") {
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? "  " + extra : ""}`);
  if (!cond) failures++;
}

async function main() {
  let r = await read(await post("/api/auth/register", { email, password }));
  check("register → 201", r.status === 201, `(${r.status})`);
  const access = r.body?.tokens?.accessToken;
  const refresh = r.body?.tokens?.refreshToken;
  const auth = { authorization: `Bearer ${access}` };

  r = await read(await fetch(`${BASE}/api/auth/me`, { headers: auth }));
  check("me → returns user", r.status === 200 && r.body?.user?.email === email);

  const now = Date.now();
  const payload = {
    spaces: [{ id: "s1", name: "Work", icon: "💼", order: 0, createdAt: now, updatedAt: now }],
    collections: [{ id: "c1", spaceId: "s1", name: "Devops", order: 0, collapsed: false, createdAt: now, updatedAt: now }],
    tabs: [{ id: "t1", collectionId: "c1", title: "Prometheus", url: "https://prometheus.io", starred: false, order: 0, createdAt: now, updatedAt: now }],
    deleted: { spaces: [], collections: [], tabs: [] },
  };
  r = await read(await post("/api/sync", payload, auth));
  check("push → 200", r.status === 200);

  r = await read(await fetch(`${BASE}/api/sync?since=0`, { headers: auth }));
  check("pull → has 1 space / 1 collection / 1 tab", r.body?.spaces?.length === 1 && r.body?.collections?.length === 1 && r.body?.tabs?.length === 1);

  r = await read(await post("/api/sync", { spaces: [], collections: [], tabs: [], deleted: { spaces: [], collections: [], tabs: ["t1"] } }, auth));
  check("push delete → 200", r.status === 200);
  r = await read(await fetch(`${BASE}/api/sync?since=0`, { headers: auth }));
  check("pull → tab tombstoned (0 upserts, 1 deleted id)", r.body?.tabs?.length === 0 && r.body?.deleted?.tabs?.includes("t1"));

  r = await read(await post("/api/auth/refresh", { refreshToken: refresh }));
  check("refresh → new access token", r.status === 200 && !!r.body?.tokens?.accessToken && r.body?.tokens?.refreshToken !== refresh);

  r = await read(await post("/api/auth/refresh", { refreshToken: refresh }));
  check("refresh reuse (old token) → rejected", r.status === 401);

  r = await read(await post("/api/auth/login", { email, password }));
  check("login → 200", r.status === 200 && r.body?.user?.email === email);

  // Second "device": a fresh login token pulls the first client's data.
  const deviceB = r.body?.tokens?.accessToken;
  r = await read(await fetch(`${BASE}/api/sync?since=0`, { headers: { authorization: `Bearer ${deviceB}` } }));
  check(
    "2nd client pull → sees space + collection, tab tombstoned",
    r.body?.spaces?.length === 1 && r.body?.collections?.length === 1 && r.body?.deleted?.tabs?.includes("t1"),
  );

  r = await read(await post("/api/auth/login", { email, password: "wrongpassword1" }));
  check("login wrong password → 401", r.status === 401);

  r = await read(await fetch(`${BASE}/api/auth/me`, {}));
  check("me without token → 401", r.status === 401);

  console.log(failures === 0 ? "\n✅ ALL PASSED" : `\n❌ ${failures} FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("E2E crashed:", e.message);
  process.exit(1);
});
