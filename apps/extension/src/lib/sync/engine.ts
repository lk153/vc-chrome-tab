import type { SyncPullResponse, SyncPushResponse, WorkspaceData } from "@vctabs/shared";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { apiJson } from "@/lib/api/client";
import { getLocal, setLocal } from "@/lib/chrome/storage";
import { diffById, mergeById } from "./diff";
import { reconcileByName } from "./reconcile";

const CURSOR_KEY = "vctabs.sync.cursor.v1";
const PENDING_KEY = "vctabs.sync.pending.v1";
const PULL_INTERVAL_MS = 25_000;
const FLUSH_DEBOUNCE_MS = 1500;

interface Cursor {
  lastSyncedAt: number;
  migratedUserId: string | null;
}
interface Pending {
  spaces: string[];
  collections: string[];
  tabs: string[];
  deleted: { spaces: string[]; collections: string[]; tabs: string[] };
}
type Entity = "spaces" | "collections" | "tabs";

const emptyPending = (): Pending => ({
  spaces: [],
  collections: [],
  tabs: [],
  deleted: { spaces: [], collections: [], tabs: [] },
});

let enabled = false;
let applyingRemote = false;
let cursor: Cursor = { lastSyncedAt: 0, migratedUserId: null };
let pending = emptyPending();
let unsubscribe: (() => void) | null = null;
let pullTimer: ReturnType<typeof setInterval> | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/** Begin syncing for the signed-in user (called on sign-in / restored session). */
export async function startSync(userId: string): Promise<void> {
  if (enabled) return;
  enabled = true;
  cursor = await getLocal<Cursor>(CURSOR_KEY, { lastSyncedAt: 0, migratedUserId: null });
  pending = await getLocal<Pending>(PENDING_KEY, emptyPending());

  if (cursor.migratedUserId !== userId) {
    // First sign-in for this account on this device → merge local + remote BY NAME.
    await reconcileFirstLogin(userId);
  } else {
    // Re-push current local state on every start so changes made while the engine
    // wasn't running (popup, offline) are captured. LWW makes redundant pushes safe.
    markAllDirty(useWorkspaceStore.getState().data);
    await persistCursor();
  }

  unsubscribe = useWorkspaceStore.subscribe((state, prev) => {
    if (state.data !== prev.data) onLocalChange(prev.data, state.data);
  });

  await syncNow();
  pullTimer = setInterval(() => void pull(), PULL_INTERVAL_MS);
}

/**
 * First sign-in on this device for this account. Spaces/collections created
 * offline on different devices have different ids, so an id-based merge would
 * duplicate same-named collections. Instead: pull the account, merge local into
 * it BY NAME (combining tabs of same-named collections), apply the union
 * locally, and queue it for upload so both sides converge.
 */
async function reconcileFirstLogin(userId: string): Promise<void> {
  let remote: SyncPullResponse;
  try {
    remote = await apiJson<SyncPullResponse>(`/api/sync?since=0`);
  } catch {
    // Offline: defer reconciliation to a later (online) start; queue local upload
    // but do NOT mark migrated, so the name-merge runs once we can reach the API.
    markAllDirty(useWorkspaceStore.getState().data);
    return;
  }

  const local = useWorkspaceStore.getState().data;
  const merged = reconcileByName(local, {
    spaces: remote.spaces,
    collections: remote.collections,
    tabs: remote.tabs,
  });

  applyingRemote = true;
  useWorkspaceStore.getState().setDataFromRemote(merged);
  applyingRemote = false;

  markAllDirty(merged); // upload the union (remote-origin docs are LWW no-ops)
  cursor = { lastSyncedAt: remote.now, migratedUserId: userId };
  await persistCursor();
  await persistPending();
}

/** Stop syncing (sign-out). Leaves the cursor so re-login on this device is cheap. */
export function stopSync(): void {
  enabled = false;
  unsubscribe?.();
  unsubscribe = null;
  if (pullTimer) clearInterval(pullTimer);
  if (flushTimer) clearTimeout(flushTimer);
  pullTimer = null;
  flushTimer = null;
}

/** Flush queued local changes, then pull remote changes. */
export async function syncNow(): Promise<void> {
  await flush();
  await pull();
}

// --- local → remote ------------------------------------------------------

function onLocalChange(prev: WorkspaceData, next: WorkspaceData): void {
  if (!enabled || applyingRemote) return;
  applyEntityDiff("spaces", prev.spaces, next.spaces);
  applyEntityDiff("collections", prev.collections, next.collections);
  applyEntityDiff("tabs", prev.tabs, next.tabs);
  void persistPending();
  scheduleFlush();
}

function applyEntityDiff<T extends { id: string; updatedAt: number }>(
  entity: Entity,
  prev: T[],
  next: T[],
): void {
  const { dirty, deleted } = diffById(prev, next);
  const dirtySet = new Set([...pending[entity], ...dirty]);
  const deletedSet = new Set([...pending.deleted[entity], ...deleted]);
  for (const id of deleted) dirtySet.delete(id);
  for (const id of dirty) deletedSet.delete(id);
  pending[entity] = [...dirtySet];
  pending.deleted[entity] = [...deletedSet];
}

function scheduleFlush(): void {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => void flush(), FLUSH_DEBOUNCE_MS);
}

async function flush(): Promise<void> {
  if (!enabled || isPendingEmpty()) return;
  const data = useWorkspaceStore.getState().data;
  const body = {
    spaces: data.spaces.filter((s) => pending.spaces.includes(s.id)),
    collections: data.collections.filter((c) => pending.collections.includes(c.id)),
    tabs: data.tabs.filter((t) => pending.tabs.includes(t.id)),
    deleted: pending.deleted,
  };
  try {
    await apiJson<SyncPushResponse>("/api/sync", { method: "POST", body: JSON.stringify(body) });
    pending = emptyPending();
    await persistPending();
  } catch {
    // Keep pending; the next interval / change will retry (offline-safe).
  }
}

// --- remote → local ------------------------------------------------------

async function pull(): Promise<void> {
  if (!enabled) return;
  let resp: SyncPullResponse;
  try {
    resp = await apiJson<SyncPullResponse>(`/api/sync?since=${cursor.lastSyncedAt}`);
  } catch {
    return; // offline / transient
  }
  applyRemote(resp);
  cursor.lastSyncedAt = resp.now;
  await persistCursor();
}

function applyRemote(resp: SyncPullResponse): void {
  const data = useWorkspaceStore.getState().data;
  const merged: WorkspaceData = {
    spaces: mergeById(data.spaces, resp.spaces, resp.deleted.spaces),
    collections: mergeById(data.collections, resp.collections, resp.deleted.collections),
    tabs: mergeById(data.tabs, resp.tabs, resp.deleted.tabs),
  };
  applyingRemote = true;
  useWorkspaceStore.getState().setDataFromRemote(merged);
  applyingRemote = false;
}

// --- helpers -------------------------------------------------------------

function markAllDirty(data: WorkspaceData): void {
  pending.spaces = data.spaces.map((s) => s.id);
  pending.collections = data.collections.map((c) => c.id);
  pending.tabs = data.tabs.map((t) => t.id);
}

function isPendingEmpty(): boolean {
  return (
    !pending.spaces.length &&
    !pending.collections.length &&
    !pending.tabs.length &&
    !pending.deleted.spaces.length &&
    !pending.deleted.collections.length &&
    !pending.deleted.tabs.length
  );
}

function persistPending(): Promise<void> {
  return setLocal(PENDING_KEY, pending);
}
function persistCursor(): Promise<void> {
  return setLocal(CURSOR_KEY, cursor);
}
