import type { Collection, SavedTab, ViewMode } from "@vctabs/shared";
import { IconChevronRight, IconExternal, IconTrash } from "@/components/icons";
import { restoreTabs } from "@/lib/chrome/tabs";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { toast } from "@/store/useToastStore";
import { TabList } from "./TabList";

/** A collapsible collection section: header (toggle + count + open-all) + tabs. */
export function CollectionCard({
  collection,
  tabs,
  view,
}: {
  collection: Collection;
  tabs: SavedTab[];
  view: ViewMode;
}) {
  const toggleCollapsed = useWorkspaceStore((s) => s.toggleCollapsed);
  const renameCollection = useWorkspaceStore((s) => s.renameCollection);
  const deleteCollection = useWorkspaceStore((s) => s.deleteCollection);

  const onRename = () => {
    const name = window.prompt("Rename collection", collection.name);
    if (name?.trim()) renameCollection(collection.id, name.trim());
  };

  const onOpenAll = () => {
    if (!tabs.length) {
      toast("Collection is empty");
      return;
    }
    void restoreTabs(tabs.map((t) => t.url));
    toast(`Opening ${tabs.length} tab${tabs.length === 1 ? "" : "s"}`);
  };

  const onDelete = () => {
    if (window.confirm(`Delete "${collection.name}" and its ${tabs.length} tab(s)?`)) {
      deleteCollection(collection.id);
    }
  };

  return (
    <section className="mb-3.5">
      <header className="group flex items-center gap-1 px-1 py-1.5">
        <button
          type="button"
          onClick={() => toggleCollapsed(collection.id)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <IconChevronRight
            size={16}
            className={`shrink-0 text-on-surface-variant transition-transform ${
              collection.collapsed ? "" : "rotate-90"
            }`}
          />
          <h2
            onDoubleClick={(e) => {
              e.stopPropagation();
              onRename();
            }}
            title="Double-click to rename"
            className="title-medium font-bold text-on-surface"
          >
            {collection.name}
          </h2>
          <span className="rounded-full border border-outline-variant bg-surface-container-low px-2 py-0.5 label-small font-bold text-on-surface-variant">
            {tabs.length}
          </span>
        </button>
        <button
          type="button"
          onClick={onOpenAll}
          title="Open all tabs"
          aria-label="Open all tabs"
          className="m3-icon-btn h-7 w-7 shrink-0"
        >
          <IconExternal size={15} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Delete collection"
          aria-label="Delete collection"
          className="m3-icon-btn h-7 w-7 shrink-0 opacity-0 hover:text-error group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <IconTrash size={15} />
        </button>
      </header>

      {!collection.collapsed && <TabList collectionId={collection.id} tabs={tabs} view={view} />}
    </section>
  );
}
