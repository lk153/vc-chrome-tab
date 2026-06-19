import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SavedTab, ViewMode } from "@vctabs/shared";
import { Favicon } from "@/components/Favicon";
import { IconPencil, IconX } from "@/components/icons";
import { hostLabel } from "@/lib/data/favicon";
import { openUrl } from "@/lib/chrome/tabs";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUiStore } from "@/store/useUiStore";

/** A saved tab card. The whole card is click-to-open and drag-to-reorder; the
 *  always-visible ✕ removes it from the collection, the hover ✎ edits it. */
export function TabCard({ tab, view }: { tab: SavedTab; view: ViewMode }) {
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
  const isRow = view === "list";
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openUrl(tab.url)}
      title={tab.url}
      className={`group relative flex cursor-pointer items-center gap-3 rounded-[13px] border border-outline-variant bg-surface-container-lowest shadow-soft transition hover:-translate-y-px hover:border-primary/40 hover:shadow-soft-hover ${
        isRow ? "px-3 py-2" : "px-3.5 py-3"
      }`}
    >
      <Favicon src={tab.faviconUrl} title={tab.title} size={isRow ? 26 : 32} />
      <div className="min-w-0 flex-1">
        <div className="truncate body-medium font-semibold text-on-surface">{tab.title}</div>
        <div className="truncate font-mono body-small text-on-surface-variant">{hostLabel(tab.url)}</div>
      </div>
      <button
        type="button"
        onPointerDown={stop}
        onClick={(e) => {
          stop(e);
          openTabEditor(tab.id);
        }}
        title="Edit tab"
        aria-label="Edit tab"
        className="m3-icon-btn h-7 w-7 shrink-0 opacity-0 hover:text-primary group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <IconPencil size={15} />
      </button>
      <button
        type="button"
        onPointerDown={stop}
        onClick={(e) => {
          stop(e);
          deleteTab(tab.id);
        }}
        title="Remove from collection"
        aria-label="Remove from collection"
        className="m3-icon-btn h-7 w-7 shrink-0 hover:text-error"
      >
        <IconX size={15} />
      </button>
    </div>
  );
}
