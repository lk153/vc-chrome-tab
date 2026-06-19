import type { ViewMode } from "@vctabs/shared";
import { SegmentedControl, type Segment } from "@/components/ui/SegmentedControl";
import { IconCard, IconList } from "@/components/icons";
import { useUiStore } from "@/store/useUiStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

const VIEW_SEGMENTS: Segment<ViewMode>[] = [
  { value: "card", label: "Cards", icon: <IconCard size={16} /> },
  { value: "list", label: "List", icon: <IconList size={16} /> },
];

export function WorkspaceToolbar({ spaceId }: { spaceId: string }) {
  const { viewMode, setViewMode } = useUiStore();
  const setAllCollapsed = useWorkspaceStore((s) => s.setAllCollapsed);

  return (
    <div className="flex items-center gap-2">
      <SegmentedControl value={viewMode} segments={VIEW_SEGMENTS} onChange={setViewMode} />

      <button type="button" onClick={() => setAllCollapsed(spaceId, false)} className="m3-btn-text">
        Expand all
      </button>
      <button type="button" onClick={() => setAllCollapsed(spaceId, true)} className="m3-btn-text">
        Collapse all
      </button>
    </div>
  );
}
