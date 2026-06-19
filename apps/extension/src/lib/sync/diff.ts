type Identified = { id: string; updatedAt: number };

export interface EntityDiff {
  dirty: string[];
  deleted: string[];
}

/** Compare two snapshots of one entity list → changed/new ids + removed ids. */
export function diffById<T extends Identified>(prev: T[], next: T[]): EntityDiff {
  const prevMap = new Map(prev.map((x) => [x.id, x] as const));
  const nextMap = new Map(next.map((x) => [x.id, x] as const));
  const dirty: string[] = [];
  const deleted: string[] = [];
  for (const [id, n] of nextMap) {
    const p = prevMap.get(id);
    if (!p || p.updatedAt !== n.updatedAt) dirty.push(id);
  }
  for (const id of prevMap.keys()) if (!nextMap.has(id)) deleted.push(id);
  return { dirty, deleted };
}

/** Merge incoming docs into local with last-write-wins, then drop deleted ids. */
export function mergeById<T extends Identified>(local: T[], incoming: T[], deletedIds: string[]): T[] {
  const map = new Map(local.map((x) => [x.id, x] as const));
  for (const inc of incoming) {
    const cur = map.get(inc.id);
    if (!cur || inc.updatedAt >= cur.updatedAt) map.set(inc.id, inc);
  }
  for (const id of deletedIds) map.delete(id);
  return [...map.values()];
}
