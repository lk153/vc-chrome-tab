import { useMemo } from "react";
import Fuse from "fuse.js";
import { sortTabs, type SavedTab } from "@vctabs/shared";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUiStore } from "@/store/useUiStore";
import { CollectionCard } from "./CollectionCard";

/** Center column: the active space's collections, filtered + sorted. */
export function CollectionList({ spaceId }: { spaceId: string }) {
  const data = useWorkspaceStore((s) => s.data);
  const viewMode = useUiStore((s) => s.viewMode);
  const sortMode = useUiStore((s) => s.sortMode);
  const query = useUiStore((s) => s.searchQuery).trim();

  const collections = useMemo(
    () => data.collections.filter((c) => c.spaceId === spaceId).sort((a, b) => a.order - b.order),
    [data.collections, spaceId],
  );

  const matchedIds = useSearchMatches(data.tabs, collections.map((c) => c.id), query);

  if (collections.length === 0) {
    return (
      <p className="px-1 py-12 text-center body-medium text-on-surface-variant">
        No collections yet. Use <span className="label-large text-on-surface">Add Collection</span> above, or drag
        a tab from the right panel.
      </p>
    );
  }

  const sections = collections
    .map((collection) => {
      const raw = data.tabs.filter((t) => t.collectionId === collection.id);
      const visible = matchedIds ? raw.filter((t) => matchedIds.has(t.id)) : raw;
      return { collection, tabs: sortTabs(visible, sortMode) };
    })
    .filter(({ tabs }) => !matchedIds || tabs.length > 0);

  if (matchedIds && sections.length === 0) {
    return <p className="px-1 py-12 text-center body-medium text-on-surface-variant">No tabs match “{query}”.</p>;
  }

  return (
    <div>
      {sections.map(({ collection, tabs }) => (
        <CollectionCard key={collection.id} collection={collection} tabs={tabs} view={viewMode} />
      ))}
    </div>
  );
}

/** Returns the set of tab ids matching the query, or null when not searching. */
function useSearchMatches(tabs: SavedTab[], collectionIds: string[], query: string): Set<string> | null {
  const ids = collectionIds.join(",");
  return useMemo(() => {
    if (!query) return null;
    const pool = tabs.filter((t) => collectionIds.includes(t.collectionId));
    const fuse = new Fuse(pool, { keys: ["title", "url"], threshold: 0.4, ignoreLocation: true });
    return new Set(fuse.search(query).map((r) => r.item.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, ids, query]);
}
