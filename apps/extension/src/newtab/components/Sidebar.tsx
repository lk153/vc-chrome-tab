import type { Space } from "@vctabs/shared";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUiStore } from "@/store/useUiStore";
import { IconMoon, IconPlus, IconSun, IconTrash } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { SearchBar } from "./SearchBar";

/** Left rail: organization, search, spaces list, and the theme toggle. */
export function Sidebar() {
  const spaces = useWorkspaceStore((s) => s.data.spaces);
  const addSpace = useWorkspaceStore((s) => s.addSpace);
  const deleteSpace = useWorkspaceStore((s) => s.deleteSpace);
  const activeSpaceId = useUiStore((s) => s.activeSpaceId);
  const setActiveSpace = useUiStore((s) => s.setActiveSpace);

  const onAddSpace = () => {
    const name = window.prompt("Name your new space");
    if (name?.trim()) addSpace(name.trim());
  };

  const onDeleteSpace = (space: Space) => {
    if (spaces.length <= 1) return; // always keep at least one space
    if (!window.confirm(`Delete space “${space.name}” and everything inside it?`)) return;
    if (space.id === activeSpaceId) {
      const fallback = spaces.find((s) => s.id !== space.id);
      if (fallback) setActiveSpace(fallback.id);
    }
    deleteSpace(space.id);
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-surface-container">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-on-primary title-medium">
          V
        </div>
        <span className="truncate text-on-surface title-medium">Vito's organization</span>
      </div>

      <div className="px-3">
        <SearchBar />
      </div>

      <nav className="mt-2 space-y-1 px-3">
        <NavStub label="To / Links" />
        <NavStub label="Next" />
      </nav>

      <div className="mt-4 flex items-center justify-between px-4 pb-1">
        <span className="label-medium uppercase text-on-surface-variant">Spaces</span>
        <IconButton label="Add space" onClick={onAddSpace}>
          <IconPlus size={18} />
        </IconButton>
      </div>

      <ul className="scroll-thin flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {spaces.map((space) => (
          <SpaceRow
            key={space.id}
            space={space}
            active={space.id === activeSpaceId}
            canDelete={spaces.length > 1}
            onClick={() => setActiveSpace(space.id)}
            onDelete={() => onDeleteSpace(space)}
          />
        ))}
      </ul>

      <SidebarFooter />
    </aside>
  );
}

function SpaceRow({
  space,
  active,
  canDelete,
  onClick,
  onDelete,
}: {
  space: Space;
  active: boolean;
  canDelete: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={onClick}
        className={`m3-nav-item pr-12 ${active ? "m3-nav-item-active" : ""}`}
      >
        <span className="text-base leading-none">{space.icon}</span>
        <span className="min-w-0 flex-1 truncate">{space.name}</span>
      </button>
      {canDelete && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <IconButton
            label="Delete space"
            onClick={onDelete}
            className="hover:text-error"
          >
            <IconTrash size={16} />
          </IconButton>
        </span>
      )}
    </li>
  );
}

function NavStub({ label }: { label: string }) {
  return (
    <div className="m3-nav-item cursor-default justify-between" title="Coming soon">
      <span>{label}</span>
      <span className="rounded-full bg-secondary-container px-2 py-0.5 text-on-secondary-container label-small">
        Soon
      </span>
    </div>
  );
}

function SidebarFooter() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="body-small text-on-surface-variant">VC Tabs · 0.1</span>
      <IconButton label="Toggle theme" onClick={toggleTheme}>
        {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
      </IconButton>
    </div>
  );
}
