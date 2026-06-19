/**
 * Domain model shared between the extension and (later) the Vercel API.
 * Hierarchy: Space -> Collection -> SavedTab.
 *
 * Every persisted object carries sync-friendly metadata (`createdAt`,
 * `updatedAt`, `order`) so the same shapes work for the Phase 2 cloud sync
 * engine without a migration.
 */

export type ViewMode = "card" | "compact" | "list" | "grid";

export type SortMode = "manual" | "alphabetical" | "starred" | "created";

export type ThemeMode = "light" | "dark";

/** How the live "Open Tabs" panel lists tabs. */
export type OpenTabsGroupMode = "site" | "flat";

/** A unit saved inside a collection: a single URL with display metadata. */
export interface SavedTab {
  id: string;
  collectionId: string;
  title: string;
  url: string;
  faviconUrl?: string;
  starred: boolean;
  order: number;
  /** Optional note shown in the edit modal (the "Description" field). */
  description?: string;
  /** Back-reference to a `to/<slug>` Link (wired up in Phase 3). */
  linkSlug?: string;
  createdAt: number;
  updatedAt: number;
}

/** A named, collapsible group of saved tabs. Rendered as a card/section. */
export interface Collection {
  id: string;
  spaceId: string;
  name: string;
  order: number;
  collapsed: boolean;
  createdAt: number;
  updatedAt: number;
}

/** A top-level area in the left sidebar (e.g. "My Collections", "Personal"). */
export interface Space {
  id: string;
  name: string;
  /** Emoji or short glyph shown beside the space name. */
  icon: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

/** Whole workspace snapshot persisted to chrome.storage.local. */
export interface WorkspaceData {
  spaces: Space[];
  collections: Collection[];
  tabs: SavedTab[];
}

/** User-facing preferences (synced to the profile in Phase 2). */
export interface UiPreferences {
  theme: ThemeMode;
  viewMode: ViewMode;
  sortMode: SortMode;
  activeSpaceId: string | null;
  openTabsGroupMode: OpenTabsGroupMode;
}

/** A live browser tab surfaced in the "Open Tabs" panel. */
export interface OpenTab {
  id: number;
  windowId: number;
  title: string;
  url: string;
  favIconUrl?: string;
  active: boolean;
}
