import { useState } from "react";
import type { Collection, SavedTab, ViewMode } from "@vctabs/shared";
import { IconChevronRight, IconExternal, IconPencil, IconTrash } from "@/components/icons";
import { PromptDialog } from "@/components/ui/PromptDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onOpenAll = () => {
    if (!tabs.length) {
      toast("Collection is empty");
      return;
    }
    void restoreTabs(tabs.map((t) => t.url));
    toast(`Opening ${tabs.length} tab${tabs.length === 1 ? "" : "s"}`);
  };

  const onDelete = () => setDeleting(true);

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
              setRenaming(true);
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
          onClick={() => setRenaming(true)}
          title="Rename collection"
          aria-label="Rename collection"
          className="m3-icon-btn h-7 w-7 shrink-0 opacity-0 hover:text-primary group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <IconPencil size={15} />
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

      {renaming && (
        <PromptDialog
          title="Rename collection"
          label="Collection name"
          initialValue={collection.name}
          confirmLabel="Rename"
          onConfirm={(name) => renameCollection(collection.id, name)}
          onClose={() => setRenaming(false)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete collection"
          message={
            <>
              Permanently delete <strong className="text-on-surface">{collection.name}</strong>
              {tabs.length > 0 && ` and its ${tabs.length} saved tab${tabs.length === 1 ? "" : "s"}`}? This
              can&rsquo;t be undone.
            </>
          }
          confirmLabel="Delete"
          destructive
          onConfirm={() => deleteCollection(collection.id)}
          onClose={() => setDeleting(false)}
        />
      )}
    </section>
  );
}
