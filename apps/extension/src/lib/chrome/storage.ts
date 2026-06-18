import { hasChromeStorage } from "./runtime";

/**
 * Promise-based key/value storage. Uses `chrome.storage.local` inside the
 * extension and `localStorage` during browser-tab development.
 */
export async function getLocal<T>(key: string, fallback: T): Promise<T> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T | undefined) ?? fallback;
  }
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

export async function setLocal<T>(key: string, value: T): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [key]: value });
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}
