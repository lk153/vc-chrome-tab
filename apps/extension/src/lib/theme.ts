import type { ThemeMode } from "@vctabs/shared";

/** Applies the theme by toggling the `dark` class on <html>. */
export function applyTheme(theme: ThemeMode): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
