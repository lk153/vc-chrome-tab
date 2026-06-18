import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { OpenTab } from "@vctabs/shared";
import { Favicon } from "@/components/Favicon";
import { IconGrip, IconPlus, IconRefresh, IconRestore } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { hostLabel } from "@/lib/data/favicon";
import { activateTab } from "@/lib/chrome/tabs";
import { useOpenTabsStore } from "@/store/useOpenTabsStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

/** Right rail: live browser tabs. Drag a row into a collection, quick-save it,
 *  or snapshot the whole window into a new collection. */
export function OpenTabsPanel({ spaceId }: { spaceId: string }) {
  const tabs = useOpenTabsStore((s) => s.tabs);
  const refresh = useOpenTabsStore((s) => s.refresh);
  const saveSession = useWorkspaceStore((s) => s.saveSession);

  const onSaveSession = () => {
    if (!tabs.length) return;
    const name = window.prompt("Name this session", "Session") ?? "Session";
    saveSession(spaceId, name, tabs);
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col bg-surface-container">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="label-medium uppercase text-on-surface-variant">
          Open Tabs · {tabs.length}
        </span>
        <IconButton label="Refresh" onClick={() => void refresh()}>
          <IconRefresh size={18} />
        </IconButton>
      </div>

      <div className="px-3 pb-2">
        <Button variant="tonal" onClick={onSaveSession} className="w-full">
          <IconRestore size={18} />
          Save session
        </Button>
      </div>

      <ul className="scroll-thin flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {tabs.map((tab) => (
          <OpenTabRow key={tab.id} tab={tab} spaceId={spaceId} />
        ))}
        {tabs.length === 0 && (
          <li className="px-2 py-6 text-center body-small text-on-surface-variant">
            No open tabs detected.
          </li>
        )}
      </ul>
    </aside>
  );
}

function OpenTabRow({ tab, spaceId }: { tab: OpenTab; spaceId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `open:${tab.id}`,
    data: { type: "open", tab },
  });

  const quickSave = useQuickSave(spaceId);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      className="group flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-on-surface/[0.08]"
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
      <Favicon src={tab.favIconUrl} title={tab.title} size={16} />
      <button
        type="button"
        onClick={() => void activateTab(tab.id, tab.windowId)}
        className="min-w-0 flex-1 text-left"
        title={tab.url}
      >
        <span className="block truncate body-medium text-on-surface">{tab.title}</span>
        <span className="block truncate body-small text-on-surface-variant">{hostLabel(tab.url)}</span>
      </button>
      <IconButton
        label="Save to top collection"
        onClick={() => quickSave(tab)}
        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <IconPlus size={16} />
      </IconButton>
    </li>
  );
}

/** Quick-save targets the active space's first collection, creating one if needed. */
function useQuickSave(spaceId: string) {
  const addCollection = useWorkspaceStore((s) => s.addCollection);
  const addTab = useWorkspaceStore((s) => s.addTab);

  return (tab: OpenTab) => {
    const { collections } = useWorkspaceStore.getState().data;
    const target = collections
      .filter((c) => c.spaceId === spaceId)
      .sort((a, b) => a.order - b.order)[0];

    if (target) {
      addTab(target.id, { title: tab.title, url: tab.url, faviconUrl: tab.favIconUrl });
      return;
    }
    addCollection(spaceId, "Saved");
    const created = useWorkspaceStore
      .getState()
      .data.collections.filter((c) => c.spaceId === spaceId)
      .sort((a, b) => a.order - b.order)[0];
    if (created) addTab(created.id, { title: tab.title, url: tab.url, faviconUrl: tab.favIconUrl });
  };
}
