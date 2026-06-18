import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { SavedTab, ViewMode } from "@vctabs/shared";
import { TabCard } from "./TabCard";

const LAYOUT: Record<ViewMode, string> = {
  card: "grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]",
  grid: "grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(170px,1fr))]",
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
          <div className="rounded-m3-lg border border-dashed border-outline-variant px-3 py-6 text-center body-small text-on-surface-variant">
            Drop tabs here
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
