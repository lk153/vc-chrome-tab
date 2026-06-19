import { create } from "zustand";
import type { OpenTab } from "@vctabs/shared";

interface OverlayState {
  /** Command palette (⌘K) visibility. */
  cmdOpen: boolean;
  /** The open tab being saved via the picker, or null. */
  savePickerTab: OpenTab | null;
  openCmd: () => void;
  closeCmd: () => void;
  toggleCmd: () => void;
  openSavePicker: (tab: OpenTab) => void;
  closeSavePicker: () => void;
}

/** Transient overlay state (not persisted): command palette + save picker. */
export const useOverlayStore = create<OverlayState>((set) => ({
  cmdOpen: false,
  savePickerTab: null,
  openCmd: () => set({ cmdOpen: true }),
  closeCmd: () => set({ cmdOpen: false }),
  toggleCmd: () => set((s) => ({ cmdOpen: !s.cmdOpen })),
  openSavePicker: (tab) => set({ savePickerTab: tab }),
  closeSavePicker: () => set({ savePickerTab: null }),
}));
