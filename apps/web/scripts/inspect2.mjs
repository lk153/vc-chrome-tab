import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = new URL(uri).pathname.replace(/^\//, "") || "vctabs";
const client = new MongoClient(uri);

try {
  await client.connect();
  const d = client.db(dbName);
  const mask = (e) => String(e).replace(/(.).+(@.+)/, "$1***$2");
  const users = Object.fromEntries(
    (await d.collection("users").find().toArray()).map((u) => [u.id, mask(u.email)]),
  );
  console.log("USERS:");
  for (const [id, e] of Object.entries(users)) console.log(`  ${id}  ${e}`);

  console.log("\nINDEXES on collections:");
  for (const ix of await d.collection("collections").indexes()) {
    console.log(`  ${ix.name}  key=${JSON.stringify(ix.key)} unique=${!!ix.unique}`);
  }

  console.log("\nTHE TWO _ids:");
  for (const oid of ["6a33b2492acca7d67b789967", "6a33b408835c1d7d2811d877"]) {
    let doc = null;
    try {
      doc = await d.collection("collections").findOne({ _id: new ObjectId(oid) });
    } catch {
      /* bad id */
    }
    console.log(
      doc
        ? `  ${oid}: name="${doc.name}" id=${doc.id} owner=${doc.ownerId}(${users[doc.ownerId] ?? "?"}) serverUpdatedAt=${doc.serverUpdatedAt} deletedAt=${doc.deletedAt}`
        : `  ${oid}: NOT FOUND`,
    );
  }

  console.log("\nCOLLECTIONS by owner:");
  const cols = await d.collection("collections").find().toArray();
  const byOwner = {};
  for (const c of cols) (byOwner[c.ownerId] ??= []).push(c);
  for (const [owner, list] of Object.entries(byOwner)) {
    console.log(`  owner ${owner} (${users[owner] ?? "?"}):`);
    for (const c of list)
      console.log(`    id=${c.id} name="${c.name}" serverUpdatedAt=${c.serverUpdatedAt} deletedAt=${c.deletedAt} spaceId=${c.spaceId}`);
    const ids = list.map((c) => c.id);
    const dups = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
    if (dups.length) console.log(`    ⚠️ DUPLICATE (ownerId,id): ${dups.join(", ")}`);
  }
} catch (err) {
  console.error("ERROR:", err.message);
} finally {
  await client.close();
}
