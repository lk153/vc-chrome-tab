/** Standalone MongoDB connectivity check. Run: pnpm --filter @vctabs/web db:test */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri || uri.includes("PASTE_YOUR")) {
  console.error("✗ MONGODB_URI is not set in apps/web/.env.local");
  process.exit(1);
}

const dbName = (() => {
  try {
    const path = new URL(uri).pathname.replace(/^\//, "");
    return path || "vctabs";
  } catch {
    return "vctabs";
  }
})();

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
try {
  await client.connect();
  const db = client.db(dbName);
  const ping = await db.command({ ping: 1 });
  const cols = await db.listCollections().toArray();
  console.log("✓ Connected to MongoDB Atlas");
  console.log("  database:", dbName);
  console.log("  ping:", ping.ok === 1 ? "ok" : JSON.stringify(ping));
  console.log("  existing collections:", cols.map((c) => c.name).join(", ") || "(none yet)");
} catch (err) {
  console.error("✗ Connection failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
