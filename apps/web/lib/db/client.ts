import tls from "node:tls";
import { MongoClient, type Db } from "mongodb";
import { env } from "../env";

// This Atlas cluster's TLS endpoint rejects Node's TLS 1.3 handshake (it replies
// with an internal_error alert), which breaks every DB connection on both local
// Node 26 and Vercel's Node runtime. Cap outbound TLS at 1.2 in code — the
// equivalent of `node --tls-max-v1.2`, but applied at runtime so it works on
// Vercel without relying on NODE_OPTIONS. TLS 1.2 to Atlas is fully secure.
tls.DEFAULT_MAX_VERSION = "TLSv1.2";

/**
 * Cached client + index init memoized on globalThis so warm serverless
 * invocations (and Next dev HMR) reuse one pool instead of exhausting Atlas
 * connections. We cache the connect() PROMISE, not the resolved client, to
 * dedupe concurrent cold starts.
 */
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoIndexesReady?: Promise<void>;
};

const dbName = (() => {
  try {
    return new URL(env.mongoUri).pathname.replace(/^\//, "") || "vctabs";
  } catch {
    return "vctabs";
  }
})();

function clientPromise(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(env.mongoUri, { maxPoolSize: 5 }).connect();
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  const db = client.db(dbName);
  if (!globalForMongo._mongoIndexesReady) {
    globalForMongo._mongoIndexesReady = ensureIndexes(db);
  }
  await globalForMongo._mongoIndexesReady;
  return db;
}

async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("users").createIndex({ id: 1 }, { unique: true }),
    // Sparse: only docs with a pending token are indexed (lookups on verify/reset).
    db.collection("users").createIndex({ emailVerifyTokenHash: 1 }, { sparse: true }),
    db.collection("users").createIndex({ passwordResetTokenHash: 1 }, { sparse: true }),
    db.collection("refreshTokens").createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection("refreshTokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("refreshTokens").createIndex({ userId: 1 }),
    ...["spaces", "collections", "tabs"].flatMap((c) => [
      db.collection(c).createIndex({ ownerId: 1, id: 1 }, { unique: true }),
      db.collection(c).createIndex({ ownerId: 1, serverUpdatedAt: 1 }),
    ]),
  ]);
}
