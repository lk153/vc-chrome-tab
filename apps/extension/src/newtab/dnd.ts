import type { DragEndEvent } from "@dnd-kit/core";
import type { OpenTab } from "@vctabs/shared";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

const COLLECTION_PREFIX = "collection:";

/**
 * Turns a drag-end event into a workspace mutation:
 *  - dragging an open tab onto a collection  -> save it as a new tab
 *  - dragging a saved tab                     -> move/reorder it
 */
export function resolveDrop(event: DragEndEvent): void {
  const { active, over } = event;
  if (!over) return;

  const target = resolveTarget(String(over.id));
  if (!target) return;

  const store = useWorkspaceStore.getState();
  const activeData = active.data.current as { type?: string; tab?: OpenTab } | undefined;

  if (activeData?.type === "open" && activeData.tab) {
    const { title, url, favIconUrl } = activeData.tab;
    store.addTab(target.collectionId, { title, url, faviconUrl: favIconUrl });
    return;
  }

  const tabId = String(active.id);
  if (tabId === target.overTabId) return;
  store.moveTab(tabId, target.collectionId, targetIndex(target.collectionId, tabId, target.overTabId));
}

/** Where the drop landed: a collection, optionally over a specific tab. */
function resolveTarget(overId: string): { collectionId: string; overTabId: string | null } | null {
  if (overId.startsWith(COLLECTION_PREFIX)) {
    return { collectionId: overId.slice(COLLECTION_PREFIX.length), overTabId: null };
  }
  const overTab = useWorkspaceStore.getState().data.tabs.find((t) => t.id === overId);
  return overTab ? { collectionId: overTab.collectionId, overTabId: overId } : null;
}

/** Insertion index within the target collection (excluding the moving tab). */
function targetIndex(collectionId: string, movingId: string, overTabId: string | null): number {
  const list = useWorkspaceStore
    .getState()
    .data.tabs.filter((t) => t.collectionId === collectionId && t.id !== movingId)
    .sort((a, b) => a.order - b.order);
  if (!overTabId) return list.length;
  const i = list.findIndex((t) => t.id === overTabId);
  return i < 0 ? list.length : i;
}
