import type { ReactNode } from "react";
import type { SortMode, ViewMode } from "@vctabs/shared";
import { Button } from "@/components/ui/Button";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import {
  IconAlpha,
  IconCalendar,
  IconCard,
  IconChevronDown,
  IconCompact,
  IconGrid,
  IconGrip,
  IconList,
  IconPlus,
  IconStar,
} from "@/components/icons";
import { useUiStore } from "@/store/useUiStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

const SORTS: { mode: SortMode; label: string; icon: ReactNode }[] = [
  { mode: "manual", label: "Drag & Drop", icon: <IconGrip size={16} /> },
  { mode: "alphabetical", label: "Alphabetical", icon: <IconAlpha size={16} /> },
  { mode: "starred", label: "Starred To Top", icon: <IconStar size={16} /> },
  { mode: "created", label: "Date Created", icon: <IconCalendar size={16} /> },
];

const VIEWS: { mode: ViewMode; label: string; icon: ReactNode }[] = [
  { mode: "card", label: "Card", icon: <IconCard size={16} /> },
  { mode: "compact", label: "Compact", icon: <IconCompact size={16} /> },
  { mode: "list", label: "List", icon: <IconList size={16} /> },
  { mode: "grid", label: "Grid", icon: <IconGrid size={16} /> },
];

export function WorkspaceToolbar({ spaceId }: { spaceId: string }) {
  const { sortMode, setSortMode, viewMode, setViewMode } = useUiStore();
  const addCollection = useWorkspaceStore((s) => s.addCollection);
  const setAllCollapsed = useWorkspaceStore((s) => s.setAllCollapsed);

  const sort = SORTS.find((s) => s.mode === sortMode) ?? SORTS[0];
  const view = VIEWS.find((v) => v.mode === viewMode) ?? VIEWS[0];

  const sortItems: DropdownItem[] = SORTS.map((s) => ({
    key: s.mode,
    label: s.label,
    icon: s.icon,
    active: s.mode === sortMode,
    onSelect: () => setSortMode(s.mode),
  }));

  const viewItems: DropdownItem[] = VIEWS.map((v) => ({
    key: v.mode,
    label: v.label,
    icon: v.icon,
    active: v.mode === viewMode,
    onSelect: () => setViewMode(v.mode),
  }));

  const onAddCollection = () => {
    const name = window.prompt("Name your new collection");
    if (name?.trim()) addCollection(spaceId, name.trim());
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dropdown trigger={<ChipTrigger icon={sort.icon} label={sort.label} />} items={sortItems} />
      <Dropdown trigger={<ChipTrigger icon={view.icon} label={view.label} />} items={viewItems} />

      <button type="button" onClick={() => setAllCollapsed(spaceId, false)} className="m3-chip">
        Expand
      </button>
      <button type="button" onClick={() => setAllCollapsed(spaceId, true)} className="m3-chip">
        Collapse
      </button>

      <Button variant="filled" onClick={onAddCollection} className="ml-auto">
        <IconPlus size={18} />
        Add Collection
      </Button>
    </div>
  );
}

function ChipTrigger({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="m3-chip">
      {icon}
      <span>{label}</span>
      <IconChevronDown size={16} />
    </span>
  );
}
