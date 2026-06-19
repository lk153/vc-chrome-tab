import type { Collection as MongoCollection, Filter, OptionalUnlessRequiredId } from "mongodb";
import type { Owned } from "../db/types";

type Domain = { id: string; updatedAt: number };

/** Insert new docs / overwrite stored ones only when the incoming copy is
 *  newer-or-equal (last-write-wins). Stamps server fields + clears tombstone. */
export async function applyUpserts<D extends Domain>(
  col: MongoCollection<D & Owned>,
  ownerId: string,
  docs: D[],
  now: number,
): Promise<void> {
  for (const doc of docs) {
    const filter = { ownerId, id: doc.id } as Filter<D & Owned>;
    const existing = await col.findOne(filter);
    const owned = { ...doc, ownerId, serverUpdatedAt: now, deletedAt: null };
    if (!existing) {
      await col.insertOne(owned as OptionalUnlessRequiredId<D & Owned>);
    } else if (doc.updatedAt >= existing.updatedAt) {
      await col.updateOne(filter, { $set: owned as Partial<D & Owned> });
    }
  }
}

/** Tombstone the given ids (soft delete) so the deletion propagates on pull. */
export async function applyDeletes<D extends Domain>(
  col: MongoCollection<D & Owned>,
  ownerId: string,
  ids: string[],
  now: number,
): Promise<void> {
  if (!ids.length) return;
  await col.updateMany({ ownerId, id: { $in: ids } } as Filter<D & Owned>, {
    $set: { deletedAt: now, serverUpdatedAt: now } as Partial<D & Owned>,
  });
}

/** Everything changed for this owner since `since`, split into upserts + deletions. */
export async function pullChanges<D extends Domain>(
  col: MongoCollection<D & Owned>,
  ownerId: string,
  since: number,
): Promise<{ upserts: D[]; deletedIds: string[] }> {
  const filter = { ownerId, serverUpdatedAt: { $gt: since } } as Filter<D & Owned>;
  const docs = await col.find(filter).toArray();
  const upserts: D[] = [];
  const deletedIds: string[] = [];
  for (const doc of docs) {
    if (doc.deletedAt) {
      deletedIds.push(doc.id);
    } else {
      const { _id, ownerId: _o, serverUpdatedAt: _s, deletedAt: _d, ...client } = doc;
      upserts.push(client as unknown as D);
    }
  }
  return { upserts, deletedIds };
}
