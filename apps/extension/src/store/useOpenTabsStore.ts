import { create } from "zustand";
import type { OpenTab } from "@vctabs/shared";
import { listOpenTabs } from "@/lib/chrome/tabs";

interface OpenTabsState {
  tabs: OpenTab[];
  loaded: boolean;
  refresh: () => Promise<void>;
}

/** Live browser tabs for the current window (the "Open Tabs" panel). */
export const useOpenTabsStore = create<OpenTabsState>((set) => ({
  tabs: [],
  loaded: false,
  refresh: async () => set({ tabs: await listOpenTabs(), loaded: true }),
}));
