import { create } from "zustand";
import type { SortMode, ThemeMode, ViewMode } from "@vctabs/shared";
import { loadPrefs, savePrefs } from "@/lib/data/repository";
import { applyTheme } from "@/lib/theme";

interface UiState {
  theme: ThemeMode;
  viewMode: ViewMode;
  sortMode: SortMode;
  activeSpaceId: string | null;
  searchQuery: string;
  /** Id of the tab currently open in the edit modal, or null. */
  editingTabId: string | null;
  loaded: boolean;
  init: () => Promise<void>;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setViewMode: (viewMode: ViewMode) => void;
  setSortMode: (sortMode: SortMode) => void;
  setActiveSpace: (id: string) => void;
  setSearchQuery: (query: string) => void;
  openTabEditor: (id: string) => void;
  closeTabEditor: () => void;
}

export const useUiStore = create<UiState>((set, get) => {
  /** Persist the durable preferences (search query stays ephemeral). */
  const persist = () => {
    // Never write before prefs are loaded — the default-space selection runs an
    // early setActiveSpace() that would otherwise clobber the saved theme/view
    // with the store's defaults (race between initUi and initWorkspace).
    if (!get().loaded) return;
    const { theme, viewMode, sortMode, activeSpaceId } = get();
    void savePrefs({ theme, viewMode, sortMode, activeSpaceId });
  };

  let started = false;

  return {
    theme: "light",
    viewMode: "card",
    sortMode: "manual",
    activeSpaceId: null,
    searchQuery: "",
    editingTabId: null,
    loaded: false,

    init: async () => {
      if (started) return;
      started = true;
      const prefs = await loadPrefs();
      applyTheme(prefs.theme);
      set({ ...prefs, loaded: true });
    },

    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
      persist();
    },
    toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
    setViewMode: (viewMode) => {
      set({ viewMode });
      persist();
    },
    setSortMode: (sortMode) => {
      set({ sortMode });
      persist();
    },
    setActiveSpace: (activeSpaceId) => {
      set({ activeSpaceId });
      persist();
    },
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    openTabEditor: (editingTabId) => set({ editingTabId }),
    closeTabEditor: () => set({ editingTabId: null }),
  };
});
