import { create } from "zustand";
import type { OpenTab, WorkspaceData } from "@vctabs/shared";
import * as mutations from "@/lib/data/mutations";
import { loadWorkspace, saveWorkspace } from "@/lib/data/repository";

type NewTabInput = { title: string; url: string; faviconUrl?: string };

interface WorkspaceState {
  data: WorkspaceData;
  loaded: boolean;
  init: () => Promise<void>;
  /** Replace local state with the merged result of a sync pull (no-op for the
   *  sync subscription, which ignores remote-applied changes). */
  setDataFromRemote: (data: WorkspaceData) => void;
  addSpace: (name: string) => void;
  deleteSpace: (id: string) => void;
  addCollection: (spaceId: string, name: string) => void;
  renameCollection: (id: string, name: string) => void;
  toggleCollapsed: (id: string) => void;
  setAllCollapsed: (spaceId: string, collapsed: boolean) => void;
  deleteCollection: (id: string) => void;
  addTab: (collectionId: string, input: NewTabInput) => void;
  updateTab: (id: string, edits: { title?: string; description?: string; url?: string }) => void;
  deleteTab: (id: string) => void;
  toggleStar: (id: string) => void;
  moveTab: (tabId: string, toCollectionId: string, toIndex: number) => void;
  saveSession: (spaceId: string, name: string, tabs: OpenTab[]) => void;
}

const EMPTY: WorkspaceData = { spaces: [], collections: [], tabs: [] };

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  /** Swap state and persist in one step. */
  const commit = (next: WorkspaceData) => {
    set({ data: next });
    void saveWorkspace(next);
  };

  // Guards against a double init (e.g. React StrictMode) seeding twice.
  let started = false;

  return {
    data: EMPTY,
    loaded: false,

    init: async () => {
      if (started) return;
      started = true;
      const data = await loadWorkspace();
      set({ data, loaded: true });
    },

    setDataFromRemote: (data) => commit(data),
    addSpace: (name) => commit(mutations.addSpace(get().data, name)),
    deleteSpace: (id) => commit(mutations.deleteSpace(get().data, id)),
    addCollection: (spaceId, name) => commit(mutations.addCollection(get().data, spaceId, name)),
    renameCollection: (id, name) => commit(mutations.renameCollection(get().data, id, name)),
    toggleCollapsed: (id) => commit(mutations.toggleCollapsed(get().data, id)),
    setAllCollapsed: (spaceId, collapsed) => commit(mutations.setAllCollapsed(get().data, spaceId, collapsed)),
    deleteCollection: (id) => commit(mutations.deleteCollection(get().data, id)),
    addTab: (collectionId, input) => commit(mutations.addTab(get().data, collectionId, input)),
    updateTab: (id, edits) => commit(mutations.updateTab(get().data, id, edits)),
    deleteTab: (id) => commit(mutations.deleteTab(get().data, id)),
    toggleStar: (id) => commit(mutations.toggleStar(get().data, id)),
    moveTab: (tabId, toCollectionId, toIndex) =>
      commit(mutations.moveTab(get().data, tabId, toCollectionId, toIndex)),

    saveSession: (spaceId, name, tabs) =>
      commit(
        mutations.createCollectionFromTabs(
          get().data,
          spaceId,
          name,
          tabs.map((t) => ({ title: t.title, url: t.url, faviconUrl: t.favIconUrl })),
        ),
      ),
  };
});
