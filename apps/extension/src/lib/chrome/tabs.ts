import type { OpenTab } from "@vctabs/shared";
import { hasTabsApi } from "./runtime";

/** Sample tabs shown when running under `vite dev` (no real browser tabs). */
const DEV_TABS: OpenTab[] = [
  { id: 1, windowId: 1, title: "Go concurrency with channels", url: "https://go.dev/blog/pipelines", active: true },
  { id: 2, windowId: 1, title: "The 10 Engineering Fundamentals", url: "https://newsletter.example.com/10-fundamentals", active: false },
  { id: 3, windowId: 1, title: "How Uber Tracking Works", url: "https://eng.uber.com/tracking", active: false },
  { id: 4, windowId: 1, title: "A Single CLAUDE.md file", url: "https://docs.anthropic.com/claude-md", active: false },
  { id: 5, windowId: 1, title: "11 Kafka Design Patterns", url: "https://kafka.example.com/patterns", active: false },
];

export async function listOpenTabs(): Promise<OpenTab[]> {
  if (!hasTabsApi()) return DEV_TABS;
  const tabs = await chrome.tabs.query({ currentWindow: true });
  return tabs.filter((t) => t.id != null && t.url).map(toOpenTab);
}

export async function getActiveTab(): Promise<OpenTab | null> {
  if (!hasTabsApi()) return DEV_TABS[0];
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab && tab.id != null ? toOpenTab(tab) : null;
}

/** Opens the given URLs together in a fresh window (session restore). */
export async function restoreTabs(urls: string[]): Promise<void> {
  if (!urls.length) return;
  if (!hasTabsApi()) {
    urls.forEach((url) => window.open(url, "_blank"));
    return;
  }
  await chrome.windows.create({ url: urls });
}

/** Closes an open browser tab. */
export async function closeTab(tabId: number): Promise<void> {
  if (!hasTabsApi()) return;
  await chrome.tabs.remove(tabId);
}

/** Focuses an already-open browser tab and its window. */
export async function activateTab(tabId: number, windowId: number): Promise<void> {
  if (!hasTabsApi()) return;
  await chrome.tabs.update(tabId, { active: true });
  await chrome.windows.update(windowId, { focused: true });
}

export async function openUrl(url: string): Promise<void> {
  if (!hasTabsApi()) {
    window.open(url, "_blank");
    return;
  }
  await chrome.tabs.create({ url });
}

function toOpenTab(tab: chrome.tabs.Tab): OpenTab {
  return {
    id: tab.id as number,
    windowId: tab.windowId,
    title: tab.title || tab.url || "Untitled",
    url: tab.url || "",
    favIconUrl: tab.favIconUrl,
    active: Boolean(tab.active),
  };
}
