import {
  newId,
  nextOrder,
  type Collection,
  type SavedTab,
  type Space,
  type WorkspaceData,
} from "@vctabs/shared";
import { faviconFor } from "./favicon";

/**
 * Pure transforms over the workspace snapshot. Each returns a NEW WorkspaceData
 * (no mutation), so the store can swap state and persist atomically. Keeping
 * these small and side-effect-free makes them trivial to reason about and test.
 */

type NewTabInput = { title: string; url: string; faviconUrl?: string };

export function addSpace(data: WorkspaceData, name: string): WorkspaceData {
  const now = Date.now();
  const space: Space = {
    id: newId(),
    name: name.trim() || "New space",
    icon: "🗂️",
    order: nextOrder(data.spaces),
    createdAt: now,
    updatedAt: now,
  };
  return { ...data, spaces: [...data.spaces, space] };
}

/** Remove a space and cascade-delete its collections and their tabs. */
export function deleteSpace(data: WorkspaceData, id: string): WorkspaceData {
  const removedCollectionIds = new Set(
    data.collections.filter((c) => c.spaceId === id).map((c) => c.id),
  );
  return {
    spaces: data.spaces.filter((s) => s.id !== id),
    collections: data.collections.filter((c) => c.spaceId !== id),
    tabs: data.tabs.filter((t) => !removedCollectionIds.has(t.collectionId)),
  };
}

export function addCollection(data: WorkspaceData, spaceId: string, name: string): WorkspaceData {
  const now = Date.now();
  const collection: Collection = {
    id: newId(),
    spaceId,
    name: name.trim() || "Untitled collection",
    order: nextOrder(collectionsIn(data, spaceId)),
    collapsed: false,
    createdAt: now,
    updatedAt: now,
  };
  return { ...data, collections: [...data.collections, collection] };
}

export function renameCollection(data: WorkspaceData, id: string, name: string): WorkspaceData {
  return mapCollection(data, id, (c) => ({ ...c, name: name.trim() || c.name }));
}

export function toggleCollapsed(data: WorkspaceData, id: string): WorkspaceData {
  return mapCollection(data, id, (c) => ({ ...c, collapsed: !c.collapsed }));
}

export function setAllCollapsed(data: WorkspaceData, spaceId: string, collapsed: boolean): WorkspaceData {
  const now = Date.now();
  return {
    ...data,
    collections: data.collections.map((c) =>
      c.spaceId === spaceId ? { ...c, collapsed, updatedAt: now } : c,
    ),
  };
}

export function deleteCollection(data: WorkspaceData, id: string): WorkspaceData {
  return {
    ...data,
    collections: data.collections.filter((c) => c.id !== id),
    tabs: data.tabs.filter((t) => t.collectionId !== id),
  };
}

export function addTab(data: WorkspaceData, collectionId: string, input: NewTabInput): WorkspaceData {
  const tab = makeTab(collectionId, input, nextOrder(tabsIn(data, collectionId)));
  return { ...data, tabs: [...data.tabs, tab] };
}

export function deleteTab(data: WorkspaceData, id: string): WorkspaceData {
  return { ...data, tabs: data.tabs.filter((t) => t.id !== id) };
}

type TabEdits = Partial<Pick<SavedTab, "title" | "description" | "url">>;

/** Apply edits from the edit modal; recompute the favicon when the URL changes. */
export function updateTab(data: WorkspaceData, id: string, edits: TabEdits): WorkspaceData {
  return mapTab(data, id, (t) => {
    const next: SavedTab = { ...t, ...edits };
    if (edits.url && edits.url !== t.url) next.faviconUrl = faviconFor(edits.url);
    return next;
  });
}

export function toggleStar(data: WorkspaceData, id: string): WorkspaceData {
  return mapTab(data, id, (t) => ({ ...t, starred: !t.starred }));
}

/** Move a tab to `toCollectionId` at `toIndex`, renumbering affected lists. */
export function moveTab(
  data: WorkspaceData,
  tabId: string,
  toCollectionId: string,
  toIndex: number,
): WorkspaceData {
  const moving = data.tabs.find((t) => t.id === tabId);
  if (!moving) return data;

  const target = tabsIn(data, toCollectionId).filter((t) => t.id !== tabId);
  const index = Math.max(0, Math.min(toIndex, target.length));
  target.splice(index, 0, { ...moving, collectionId: toCollectionId, updatedAt: Date.now() });

  const untouched = data.tabs.filter(
    (t) => t.collectionId !== toCollectionId && t.collectionId !== moving.collectionId && t.id !== tabId,
  );
  const source =
    moving.collectionId === toCollectionId ? [] : reindex(tabsIn(data, moving.collectionId).filter((t) => t.id !== tabId));

  return { ...data, tabs: [...untouched, ...source, ...reindex(target)] };
}

/** Create a new collection from a set of links (used by "Save session"). */
export function createCollectionFromTabs(
  data: WorkspaceData,
  spaceId: string,
  name: string,
  inputs: NewTabInput[],
): WorkspaceData {
  const withCollection = addCollection(data, spaceId, name);
  const collection = withCollection.collections[withCollection.collections.length - 1];
  const tabs = inputs.map((input, i) => makeTab(collection.id, input, i));
  return { ...withCollection, tabs: [...withCollection.tabs, ...tabs] };
}

// --- helpers -------------------------------------------------------------

function makeTab(collectionId: string, input: NewTabInput, order: number): SavedTab {
  const now = Date.now();
  return {
    id: newId(),
    collectionId,
    title: input.title.trim() || input.url,
    url: input.url,
    faviconUrl: faviconFor(input.url, input.faviconUrl),
    starred: false,
    order,
    createdAt: now,
    updatedAt: now,
  };
}

function collectionsIn(data: WorkspaceData, spaceId: string): Collection[] {
  return data.collections.filter((c) => c.spaceId === spaceId);
}

function tabsIn(data: WorkspaceData, collectionId: string): SavedTab[] {
  return data.tabs.filter((t) => t.collectionId === collectionId).sort((a, b) => a.order - b.order);
}

function reindex(tabs: SavedTab[]): SavedTab[] {
  return tabs.map((t, i) => (t.order === i ? t : { ...t, order: i }));
}

function mapCollection(
  data: WorkspaceData,
  id: string,
  fn: (c: Collection) => Collection,
): WorkspaceData {
  return {
    ...data,
    collections: data.collections.map((c) => (c.id === id ? { ...fn(c), updatedAt: Date.now() } : c)),
  };
}

function mapTab(data: WorkspaceData, id: string, fn: (t: SavedTab) => SavedTab): WorkspaceData {
  return {
    ...data,
    tabs: data.tabs.map((t) => (t.id === id ? { ...fn(t), updatedAt: Date.now() } : t)),
  };
}
