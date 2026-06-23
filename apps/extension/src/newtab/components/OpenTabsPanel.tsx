import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import type { OpenTab, OpenTabsGroupMode } from "@vctabs/shared";
import { Favicon } from "@/components/Favicon";
import {
  IconChevronDown,
  IconChevronRight,
  IconGrip,
  IconList,
  IconPlus,
  IconRefresh,
  IconRestore,
  IconSearch,
  IconStar,
  IconX,
} from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { PromptDialog } from "@/components/ui/PromptDialog";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { filterTabs, groupTabsBySite } from "@/lib/data/group";
import { activateTab, closeTab } from "@/lib/chrome/tabs";
import { useOpenTabsStore } from "@/store/useOpenTabsStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUiStore } from "@/store/useUiStore";
import { useOverlayStore } from "@/store/useOverlayStore";

/** Right rail: live browser tabs. Drag a row into a collection, quick-save it,
 *  or snapshot the whole window into a new collection. */
export function OpenTabsPanel({ spaceId }: { spaceId: string }) {
  const tabs = useOpenTabsStore((s) => s.tabs);
  const refresh = useOpenTabsStore((s) => s.refresh);
  const saveSession = useWorkspaceStore((s) => s.saveSession);

  const mode = useUiStore((s) => s.openTabsGroupMode);
  const setMode = useUiStore((s) => s.setOpenTabsGroupMode);
  const [filter, setFilter] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [savingSession, setSavingSession] = useState(false);

  const filtered = useMemo(() => filterTabs(tabs, filter), [tabs, filter]);
  const groups = useMemo(() => groupTabsBySite(filtered), [filtered]);

  const toggleHost = (host: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(host)) next.delete(host);
      else next.add(host);
      return next;
    });

  const onSaveSession = () => {
    if (tabs.length) setSavingSession(true);
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col bg-surface-container">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="label-medium uppercase text-on-surface-variant">Open Tabs</span>
          <span className="rounded-full bg-surface-container-highest px-2 label-small text-on-surface-variant">
            {tabs.length}
          </span>
        </div>
        <IconButton label="Refresh" onClick={() => void refresh()}>
          <IconRefresh size={18} />
        </IconButton>
      </div>

      <div className="px-3 pb-2">
        <Button variant="outlined" onClick={onSaveSession} className="w-full">
          <IconRestore size={18} />
          Save session as collection
        </Button>
      </div>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-full bg-surface-container-highest px-3 py-2">
          <IconSearch size={16} className="shrink-0 text-on-surface-variant" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter open tabs…"
            className="min-w-0 flex-1 bg-transparent body-small text-on-surface placeholder:text-on-surface-variant focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-3 pb-2">
        <ModeDropdown mode={mode} setMode={setMode} />
        {mode === "site" && filtered.length > 0 && (
          <span className="shrink-0 body-small text-on-surface-variant">
            {groups.length} {groups.length === 1 ? "group" : "groups"}
          </span>
        )}
      </div>

      <ul className="scroll-thin flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {filtered.length === 0 ? (
          <li className="px-2 py-6 text-center body-small text-on-surface-variant">
            {tabs.length === 0 ? "No open tabs detected." : "No tabs match your filter."}
          </li>
        ) : mode === "site" ? (
          groups.map((group) => {
            const isCollapsed = collapsed.has(group.host);
            return (
              <li key={group.host}>
                <button
                  type="button"
                  onClick={() => toggleHost(group.host)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-on-surface/[0.06]"
                  aria-expanded={!isCollapsed}
                >
                  {isCollapsed ? (
                    <IconChevronRight size={16} className="shrink-0 text-on-surface-variant" />
                  ) : (
                    <IconChevronDown size={16} className="shrink-0 text-on-surface-variant" />
                  )}
                  <Favicon src={group.tabs[0]?.favIconUrl} title={group.host} size={24} />
                  <span className="min-w-0 flex-1 truncate body-medium text-on-surface">{group.host}</span>
                  <span className="rounded-full bg-surface-container-highest px-2 label-small text-on-surface-variant">
                    {group.tabs.length}
                  </span>
                </button>
                {!isCollapsed && (
                  <ul className="space-y-0.5 pl-2">
                    {group.tabs.map((tab) => (
                      <OpenTabRow key={tab.id} tab={tab} />
                    ))}
                  </ul>
                )}
              </li>
            );
          })
        ) : (
          filtered.map((tab) => <OpenTabRow key={tab.id} tab={tab} />)
        )}
      </ul>

      {savingSession && (
        <PromptDialog
          title="Save session as collection"
          label="Collection name"
          initialValue="Session"
          confirmLabel="Save"
          onConfirm={(name) => saveSession(spaceId, name, tabs)}
          onClose={() => setSavingSession(false)}
        />
      )}
    </aside>
  );
}

/** Switches the panel between site-grouped and open-tab-order listing. */
function ModeDropdown({
  mode,
  setMode,
}: {
  mode: OpenTabsGroupMode;
  setMode: (mode: OpenTabsGroupMode) => void;
}) {
  const items: DropdownItem[] = [
    {
      key: "site",
      label: "Auto-grouped by site",
      icon: <IconStar size={16} />,
      active: mode === "site",
      onSelect: () => setMode("site"),
    },
    {
      key: "flat",
      label: "Same order as open tabs",
      icon: <IconList size={16} />,
      active: mode === "flat",
      onSelect: () => setMode("flat"),
    },
  ];

  return (
    <Dropdown
      trigger={
        <span className="flex items-center gap-1.5 rounded-full px-2 py-1 body-small text-on-surface-variant hover:bg-on-surface/[0.06]">
          {mode === "site" ? <IconStar size={14} /> : <IconList size={14} />}
          <span>{mode === "site" ? "Grouped by site" : "Open-tab order"}</span>
          <IconChevronDown size={14} />
        </span>
      }
      items={items}
    />
  );
}

function OpenTabRow({ tab }: { tab: OpenTab }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `open:${tab.id}`,
    data: { type: "open", tab },
  });

  const refresh = useOpenTabsStore((s) => s.refresh);
  const openSavePicker = useOverlayStore((s) => s.openSavePicker);

  const onClose = async () => {
    await closeTab(tab.id);
    await refresh();
  };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-container-highest"
    >
      <button
        {...attributes}
        {...listeners}
        className="m3-icon-btn h-8 w-8 shrink-0 cursor-grab opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 active:cursor-grabbing"
        title="Drag into a collection"
        aria-label="Drag tab"
      >
        <IconGrip size={16} />
      </button>
      <Favicon src={tab.favIconUrl} title={tab.title} size={24} />
      <button
        type="button"
        onClick={() => void activateTab(tab.id, tab.windowId)}
        className="min-w-0 flex-1 text-left"
        title={tab.title}
      >
        <span className="block truncate body-medium text-on-surface">{tab.title}</span>
      </button>
      <IconButton
        label="Save to collection"
        onClick={() => openSavePicker(tab)}
        className="h-8 w-8 shrink-0 opacity-0 hover:bg-primary-container hover:text-primary group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <IconPlus size={16} />
      </IconButton>
      <IconButton
        label="Close tab"
        onClick={() => void onClose()}
        className="h-8 w-8 shrink-0 opacity-0 hover:text-error group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <IconX size={16} />
      </IconButton>
    </li>
  );
}
