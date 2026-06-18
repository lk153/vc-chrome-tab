import type { Collection, SavedTab, ViewMode } from "@vctabs/shared";
import { IconChevronDown, IconChevronRight, IconPlus, IconTrash } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { TabList } from "./TabList";

/** A collapsible collection section with its header actions and tab list. */
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
  const addTab = useWorkspaceStore((s) => s.addTab);

  const onRename = () => {
    const name = window.prompt("Rename collection", collection.name);
    if (name?.trim()) renameCollection(collection.id, name.trim());
  };

  const onAddTab = () => {
    const url = window.prompt("Paste a URL to save");
    if (url?.trim()) addTab(collection.id, { title: url.trim(), url: url.trim() });
  };

  const onDelete = () => {
    if (window.confirm(`Delete "${collection.name}" and its ${tabs.length} tab(s)?`)) {
      deleteCollection(collection.id);
    }
  };

  return (
    <section className="mb-5">
      <header className="group mb-1.5 flex items-center gap-1.5">
        <IconButton
          label={collection.collapsed ? "Expand" : "Collapse"}
          className="h-8 w-8"
          onClick={() => toggleCollapsed(collection.id)}
        >
          {collection.collapsed ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
        </IconButton>
        <h2
          onDoubleClick={onRename}
          title="Double-click to rename"
          className="cursor-text title-medium text-on-surface"
        >
          {collection.name}
        </h2>
        <span className="rounded-full bg-secondary-container px-2 py-0.5 label-small text-on-secondary-container">
          {tabs.length}
        </span>
        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
          <IconButton label="Add tab" className="h-8 w-8" onClick={onAddTab}>
            <IconPlus size={15} />
          </IconButton>
          <IconButton label="Delete collection" className="h-8 w-8 hover:text-error" onClick={onDelete}>
            <IconTrash size={15} />
          </IconButton>
        </div>
      </header>

      {!collection.collapsed && <TabList collectionId={collection.id} tabs={tabs} view={view} />}
    </section>
  );
}
