import type { Space } from "@vctabs/shared";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUiStore } from "@/store/useUiStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { IconChevronsUpDown, IconMoon, IconPlus, IconSearch, IconSun, IconTrash } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { SpaceIcon } from "@/components/SpaceIcon";
import { AccountSection } from "./AccountSection";

/** Left rail: organization, search (→ command palette), spaces, theme toggle. */
export function Sidebar() {
  const spaces = useWorkspaceStore((s) => s.data.spaces);
  const collections = useWorkspaceStore((s) => s.data.collections);
  const addSpace = useWorkspaceStore((s) => s.addSpace);
  const deleteSpace = useWorkspaceStore((s) => s.deleteSpace);
  const activeSpaceId = useUiStore((s) => s.activeSpaceId);
  const setActiveSpace = useUiStore((s) => s.setActiveSpace);

  const onAddSpace = () => {
    const name = window.prompt("Name your new space");
    if (name?.trim()) addSpace(name.trim());
  };

  const onDeleteSpace = (space: Space) => {
    if (spaces.length <= 1) return;
    if (!window.confirm(`Delete space “${space.name}” and everything inside it?`)) return;
    if (space.id === activeSpaceId) {
      const fallback = spaces.find((s) => s.id !== space.id);
      if (fallback) setActiveSpace(fallback.id);
    }
    deleteSpace(space.id);
  };

  return (
    <aside className="flex w-[266px] shrink-0 flex-col border-r border-outline-variant bg-surface-container-low px-3.5 pb-3 pt-3.5">
      <button
        type="button"
        className="flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface-container-highest"
      >
        <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-primary text-[15px] font-extrabold text-on-primary">
          V
        </span>
        <span className="min-w-0 flex-1 truncate title-small font-bold text-on-surface">Vito's organization</span>
        <IconChevronsUpDown size={15} className="shrink-0 text-on-surface-variant" />
      </button>

      <SidebarSearch />

      <nav className="mt-4 space-y-0.5">
        <NavStub label="To / Links" />
        <NavStub label="Next" />
      </nav>

      <div className="mb-1 mt-4 flex items-center justify-between px-2.5">
        <span className="label-small font-bold uppercase tracking-wider text-on-surface-variant">Spaces</span>
        <IconButton label="Add space" onClick={onAddSpace} className="h-6 w-6">
          <IconPlus size={15} />
        </IconButton>
      </div>

      <ul className="scroll-thin -mx-1 flex-1 space-y-0.5 overflow-y-auto px-1">
        {spaces.map((space) => (
          <SpaceRow
            key={space.id}
            space={space}
            active={space.id === activeSpaceId}
            canDelete={spaces.length > 1}
            collectionCount={collections.filter((c) => c.spaceId === space.id).length}
            onClick={() => setActiveSpace(space.id)}
            onDelete={() => onDeleteSpace(space)}
          />
        ))}
      </ul>

      <AccountSection />
      <SidebarFooter />
    </aside>
  );
}

/** Opens the command palette (⌘K also works globally). */
function SidebarSearch() {
  const openCmd = useOverlayStore((s) => s.openCmd);
  return (
    <button
      type="button"
      onClick={openCmd}
      className="mt-3.5 flex h-[42px] w-full items-center gap-2.5 rounded-xl border border-outline-variant bg-surface-container-highest px-3 text-left transition-colors hover:border-primary/40"
    >
      <IconSearch size={16} className="shrink-0 text-on-surface-variant" />
      <span className="flex-1 body-medium text-on-surface-variant">Search everything</span>
      <kbd className="rounded-md border border-outline-variant bg-surface px-1.5 py-0.5 label-small font-mono text-on-surface-variant">
        ⌘K
      </kbd>
    </button>
  );
}

function SpaceRow({
  space,
  active,
  canDelete,
  collectionCount,
  onClick,
  onDelete,
}: {
  space: Space;
  active: boolean;
  canDelete: boolean;
  collectionCount: number;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-2.5 rounded-[10px] py-2 pl-2.5 pr-9 text-left title-small font-semibold transition-colors ${
          active ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-highest"
        }`}
      >
        <span
          className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-lg ${
            active ? "bg-primary/20 text-primary" : "bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          <SpaceIcon name={space.name} size={15} />
        </span>
        <span className="min-w-0 flex-1 truncate">{space.name}</span>
        <span className={`shrink-0 label-small font-semibold ${active ? "text-primary/70" : "text-on-surface-variant"}`}>
          {collectionCount}
        </span>
      </button>
      {canDelete && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <IconButton label="Delete space" onClick={onDelete} className="h-7 w-7 hover:text-error">
            <IconTrash size={15} />
          </IconButton>
        </span>
      )}
    </li>
  );
}

function NavStub({ label }: { label: string }) {
  return (
    <div className="flex cursor-default items-center justify-between rounded-[9px] px-2.5 py-1.5" title="Coming soon">
      <span className="body-medium font-medium text-on-surface-variant">{label}</span>
      <span className="rounded-full bg-primary-container px-2 py-0.5 label-small font-semibold text-primary">Soon</span>
    </div>
  );
}

function SidebarFooter() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  return (
    <div className="mt-2 flex items-center justify-between border-t border-outline-variant pt-3">
      <span className="body-small font-medium text-on-surface-variant">
        VC Tabs · <span className="font-mono">0.3</span>
      </span>
      <button
        type="button"
        onClick={toggleTheme}
        title="Toggle theme"
        aria-label="Toggle theme"
        className="grid h-8 w-8 place-items-center rounded-[9px] border border-outline-variant bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
      >
        {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
      </button>
    </div>
  );
}
