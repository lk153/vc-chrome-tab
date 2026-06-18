import type { SavedTab, SortMode } from "./types";

/**
 * Pure ordering for the tabs inside a collection. "manual" preserves the
 * drag-and-drop `order`; every mode returns a new array (no mutation).
 */
export function sortTabs(tabs: SavedTab[], mode: SortMode): SavedTab[] {
  const copy = [...tabs];
  switch (mode) {
    case "alphabetical":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "starred":
      return copy.sort(byStarredThenOrder);
    case "created":
      return copy.sort((a, b) => b.createdAt - a.createdAt);
    case "manual":
    default:
      return copy.sort((a, b) => a.order - b.order);
  }
}

function byStarredThenOrder(a: SavedTab, b: SavedTab): number {
  if (a.starred !== b.starred) return a.starred ? -1 : 1;
  return a.order - b.order;
}

/** Next order value for appending to a list of ordered items. */
export function nextOrder(items: { order: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.order), -1) + 1;
}
