import { reconcileByName } from "../src/lib/sync/reconcile.ts";

const space = (id: string, name: string) => ({ id, name, icon: "📁", order: 0, createdAt: 1, updatedAt: 1 });
const coll = (id: string, spaceId: string, name: string) => ({ id, spaceId, name, order: 0, collapsed: false, createdAt: 1, updatedAt: 1 });
const tab = (id: string, collectionId: string, url: string) => ({ id, collectionId, title: url, url, starred: false, order: 0, createdAt: 1, updatedAt: 1 });

let failures = 0;
const check = (label: string, cond: boolean) => {
  console.log(`${cond ? "✓" : "✗"} ${label}`);
  if (!cond) failures++;
};

// Scenario 1: A=[A1,B1,C1], B=[A2,B2,C2] (all different names) → union of 6.
{
  const remote = {
    spaces: [space("sA", "My Collections")],
    collections: [coll("cA1", "sA", "A1"), coll("cB1", "sA", "B1"), coll("cC1", "sA", "C1")],
    tabs: [],
  };
  const local = {
    spaces: [space("sB", "My Collections")],
    collections: [coll("cA2", "sB", "A2"), coll("cB2", "sB", "B2"), coll("cC2", "sB", "C2")],
    tabs: [],
  };
  const m = reconcileByName(local as any, remote as any);
  check("S1: one merged space", m.spaces.length === 1);
  check("S1: 6 collections (A1,B1,C1,A2,B2,C2)", m.collections.length === 6);
  check("S1: local collections re-parented to canonical space", m.collections.every((c) => c.spaceId === "sA"));
}

// Scenario 2: A=[A1,B1,C1], B=[A1,B2]; A1 tabs combined + deduped by url.
{
  const remote = {
    spaces: [space("sA", "My Collections")],
    collections: [coll("cA1", "sA", "A1"), coll("cB1", "sA", "B1"), coll("cC1", "sA", "C1")],
    tabs: [tab("t1", "cA1", "u1"), tab("t2", "cA1", "u2")],
  };
  const local = {
    spaces: [space("sB", "My Collections")],
    collections: [coll("cB_A1", "sB", "A1"), coll("cB2", "sB", "B2")],
    tabs: [tab("t3", "cB_A1", "u3"), tab("t4", "cB_A1", "u1") /* dup url */],
  };
  const m = reconcileByName(local as any, remote as any);
  check("S2: 4 collections (A1,B1,C1,B2)", m.collections.length === 4);
  const a1Tabs = m.tabs.filter((t) => t.collectionId === "cA1");
  check("S2: A1 has 3 tabs (t1,t2,t3 — t4 deduped as same url)", a1Tabs.length === 3);
  check("S2: no duplicate url in A1", new Set(a1Tabs.map((t) => t.url)).size === 3);
  check("S2: B2 kept as new collection", m.collections.some((c) => c.name === "B2"));
}

console.log(failures === 0 ? "\n✅ ALL PASSED" : `\n❌ ${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
