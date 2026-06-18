/**
 * Capability checks. The same React app runs both as an installed extension
 * (real `chrome.*` APIs) and under plain `vite dev` in a normal tab (no
 * `chrome.*`). These guards let the storage/tabs layers fall back gracefully.
 */
export function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && !!chrome.storage?.local;
}

export function hasTabsApi(): boolean {
  return typeof chrome !== "undefined" && !!chrome.tabs;
}
