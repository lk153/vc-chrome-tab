import { MongoClient, type Db } from "mongodb";
import { env } from "../env";

// This Atlas cluster rejects Node's TLS 1.3 handshake (internal_error alert),
// breaking every DB connection. Cap outbound TLS at 1.2 right before we connect
// — the equivalent of `node --tls-max-v1.2`. We reach the real `tls` singleton
// via a runtime require (webpack's ESM-import interop doesn't reliably mutate
// the live module), and do it in the connect path so it runs inside whichever
// serverless function actually opens the connection (instrumentation.ts only
// runs at server boot, which isn't guaranteed before each lambda's connect).
// TLS 1.2 to Atlas is fully supported and secure.
function capOutboundTls(): void {
  const nodeRequire = eval("require") as (id: string) => { DEFAULT_MAX_VERSION: string };
  nodeRequire("tls").DEFAULT_MAX_VERSION = "TLSv1.2";
}

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
    capOutboundTls();
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
