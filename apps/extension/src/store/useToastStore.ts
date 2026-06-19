import { create } from "zustand";

interface ToastState {
  message: string | null;
  show: (message: string) => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

/** Transient bottom-center confirmation toast (auto-dismisses). */
export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    set({ message });
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => set({ message: null }), 2200);
  },
}));

/** Convenience for non-component call sites. */
export const toast = (message: string) => useToastStore.getState().show(message);
