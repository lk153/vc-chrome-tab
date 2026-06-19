import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { SavedTab, ViewMode } from "@vctabs/shared";
import { IconPlus } from "@/components/icons";
import { TabCard } from "./TabCard";

const LAYOUT: Record<ViewMode, string> = {
  // Cards = responsive grid (multiple per row); List = single-column rows.
  card: "grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]",
  grid: "grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]",
  compact: "flex flex-col gap-1",
  list: "flex flex-col gap-1.5",
};

/** Renders a collection's tabs in the selected view; a droppable container. */
export function TabList({
  collectionId,
  tabs,
  view,
}: {
  collectionId: string;
  tabs: SavedTab[];
  view: ViewMode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `collection:${collectionId}`,
    data: { type: "collection", collectionId },
  });

  const strategy = view === "compact" || view === "list" ? verticalListSortingStrategy : rectSortingStrategy;

  return (
    <SortableContext id={collectionId} items={tabs.map((t) => t.id)} strategy={strategy}>
      <div
        ref={setNodeRef}
        className={`rounded-m3-lg p-1 transition-colors ${isOver ? "bg-primary/[0.08]" : ""}`}
      >
        {tabs.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center gap-2 rounded-m3-lg border border-dashed px-4 py-10 text-center transition-colors ${
              isOver ? "border-primary bg-primary/[0.06]" : "border-outline-variant"
            }`}
          >
            <IconPlus size={26} className="text-on-surface-variant" />
            <p className="title-small font-semibold text-on-surface-variant">No tabs yet</p>
            <p className="body-small text-outline">Hit + on any open tab, or press ⌘K to search and add</p>
          </div>
        ) : (
          <div className={LAYOUT[view]}>
            {tabs.map((tab) => (
              <TabCard key={tab.id} tab={tab} view={view} />
            ))}
          </div>
        )}
      </div>
    </SortableContext>
  );
}
