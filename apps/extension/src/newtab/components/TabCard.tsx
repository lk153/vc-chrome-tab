import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SavedTab, ViewMode } from "@vctabs/shared";
import { Favicon } from "@/components/Favicon";
import { IconGrip, IconPencil, IconStar, IconTrash } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { hostLabel } from "@/lib/data/favicon";
import { openUrl } from "@/lib/chrome/tabs";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUiStore } from "@/store/useUiStore";

/** A single saved tab. Click opens the URL; the ✎ icon edits it; the grip drags. */
export function TabCard({ tab, view }: { tab: SavedTab; view: ViewMode }) {
  const toggleStar = useWorkspaceStore((s) => s.toggleStar);
  const deleteTab = useWorkspaceStore((s) => s.deleteTab);
  const openTabEditor = useUiStore((s) => s.openTabEditor);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id,
    data: { type: "tab", collectionId: tab.collectionId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isRow = view === "list" || view === "compact";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-2.5 rounded-m3-lg bg-surface-container-high transition-shadow hover:shadow-m3-1 ${
        isRow ? "px-2.5 py-2" : "flex-col items-start p-3"
      }`}
    >
      <div className="flex w-full items-center gap-2.5">
        <IconButton
          {...attributes}
          {...listeners}
          label="Drag to reorder"
          className="h-7 w-7 cursor-grab text-on-surface-variant opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 active:cursor-grabbing"
        >
          <IconGrip size={15} />
        </IconButton>
        <Favicon src={tab.faviconUrl} title={tab.title} />
        <button
          type="button"
          onClick={() => openUrl(tab.url)}
          className="min-w-0 flex-1 text-left"
          title={tab.url}
        >
          <span className="title-small block truncate text-on-surface">{tab.title}</span>
          {!view.includes("compact") && (
            <span className="body-small block truncate text-on-surface-variant">
              {hostLabel(tab.url)}
            </span>
          )}
        </button>
        <TabActions
          starred={tab.starred}
          onEdit={() => openTabEditor(tab.id)}
          onStar={() => toggleStar(tab.id)}
          onDelete={() => deleteTab(tab.id)}
        />
      </div>
    </div>
  );
}

function TabActions({
  starred,
  onEdit,
  onStar,
  onDelete,
}: {
  starred: boolean;
  onEdit: () => void;
  onStar: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <IconButton
        label="Edit tab"
        onClick={onEdit}
        className="h-8 w-8 text-on-surface-variant opacity-0 hover:text-primary group-hover:opacity-100"
      >
        <IconPencil size={15} />
      </IconButton>
      <IconButton
        label={starred ? "Unstar" : "Star"}
        onClick={onStar}
        className={`h-8 w-8 ${
          starred ? "text-primary" : "text-on-surface-variant opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        }`}
      >
        <IconStar size={15} filled={starred} />
      </IconButton>
      <IconButton
        label="Remove"
        onClick={onDelete}
        className="h-8 w-8 text-on-surface-variant opacity-0 hover:text-error group-hover:opacity-100"
      >
        <IconTrash size={15} />
      </IconButton>
    </div>
  );
}
