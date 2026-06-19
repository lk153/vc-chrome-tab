import type { OpenTab } from "@vctabs/shared";
import { hostLabel } from "./favicon";

export interface TabGroup {
  host: string;
  tabs: OpenTab[];
}

/** Group open tabs by site (host), preserving first-seen order. */
export function groupTabsBySite(tabs: OpenTab[]): TabGroup[] {
  const groups = new Map<string, OpenTab[]>();
  for (const tab of tabs) {
    const host = hostLabel(tab.url);
    const existing = groups.get(host);
    if (existing) existing.push(tab);
    else groups.set(host, [tab]);
  }
  return [...groups.entries()].map(([host, list]) => ({ host, tabs: list }));
}

/** Case-insensitive filter over title + url. */
export function filterTabs(tabs: OpenTab[], query: string): OpenTab[] {
  const q = query.trim().toLowerCase();
  if (!q) return tabs;
  return tabs.filter((t) => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q));
}
