/** Diagnostic: do the synced docs have the fields the delta-pull query needs? */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = new URL(uri).pathname.replace(/^\//, "") || "vctabs";
const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

const users = await db.collection("users").find({}).project({ id: 1, email: 1 }).toArray();
console.log("users:", users.length);
for (const u of users) console.log("  id:", u.id, " email:", String(u.email).replace(/(.).+(@.+)/, "$1***$2"));

for (const name of ["spaces", "collections", "tabs"]) {
  const docs = await db.collection(name).find({}).toArray();
  const missingOwner = docs.filter((d) => !d.ownerId).length;
  const missingServerTs = docs.filter((d) => typeof d.serverUpdatedAt !== "number").length;
  const missingDeleted = docs.filter((d) => !("deletedAt" in d)).length;
  console.log(`\n${name}: ${docs.length} doc(s)`);
  console.log(`  missing ownerId: ${missingOwner} | missing serverUpdatedAt(number): ${missingServerTs} | missing deletedAt: ${missingDeleted}`);
  for (const d of docs.slice(0, 12)) {
    console.log(
      `  - id=${String(d.id).slice(0, 8)} owner=${d.ownerId ? String(d.ownerId).slice(0, 8) : "—"} ` +
        `serverUpdatedAt=${d.serverUpdatedAt ?? "MISSING"} deletedAt=${d.deletedAt === undefined ? "MISSING" : d.deletedAt}` +
        (name === "collections" ? ` spaceId=${d.spaceId ? String(d.spaceId).slice(0, 8) : "—"}` : ""),
    );
  }
}

await client.close();
