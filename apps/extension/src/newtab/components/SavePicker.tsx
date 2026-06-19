import { useEffect } from "react";
import { IconPlus } from "@/components/icons";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUiStore } from "@/store/useUiStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { toast } from "@/store/useToastStore";

/** Modal to choose which collection to save an open tab into (or create one). */
export function SavePicker() {
  const tab = useOverlayStore((s) => s.savePickerTab);
  const close = useOverlayStore((s) => s.closeSavePicker);

  const spaces = useWorkspaceStore((s) => s.data.spaces);
  const collections = useWorkspaceStore((s) => s.data.collections);
  const tabs = useWorkspaceStore((s) => s.data.tabs);
  const addTab = useWorkspaceStore((s) => s.addTab);
  const addCollection = useWorkspaceStore((s) => s.addCollection);
  const activeSpaceId = useUiStore((s) => s.activeSpaceId);

  useEffect(() => {
    if (!tab) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [tab, close]);

  if (!tab) return null;

  const spaceId =
    activeSpaceId && spaces.some((s) => s.id === activeSpaceId) ? activeSpaceId : spaces[0]?.id;
  const list = collections.filter((c) => c.spaceId === spaceId).sort((a, b) => a.order - b.order);

  const saveTo = (collectionId: string, name: string) => {
    addTab(collectionId, { title: tab.title, url: tab.url, faviconUrl: tab.favIconUrl });
    close();
    toast(`Saved to “${name}”`);
  };

  const onNew = () => {
    const name = window.prompt("Name your new collection");
    if (!name?.trim() || !spaceId) return;
    addCollection(spaceId, name.trim());
    const created = useWorkspaceStore
      .getState()
      .data.collections.filter((c) => c.spaceId === spaceId)
      .sort((a, b) => a.order - b.order)
      .at(-1);
    if (created) saveTo(created.id, created.name);
  };

  return (
    <div
      onPointerDown={(e) => e.target === e.currentTarget && close()}
      className="animate-overlay-fade fixed inset-0 z-[55] flex items-start justify-center bg-scrim/40 p-4 pt-[18vh] backdrop-blur-sm"
    >
      <div className="animate-overlay-pop w-full max-w-[420px] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-high shadow-m3-3">
        <div className="border-b border-outline-variant px-5 py-4">
          <div className="label-small uppercase tracking-wide text-on-surface-variant">Save to collection</div>
          <div className="mt-1 truncate body-large font-semibold text-on-surface">{tab.title}</div>
        </div>

        <div className="scroll-thin max-h-[42vh] overflow-y-auto p-2">
          {list.map((c) => {
            const count = tabs.filter((t) => t.collectionId === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => saveTo(c.id, c.name)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-primary-container"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-container-highest label-large font-bold text-primary">
                  {c.name[0]?.toUpperCase() ?? "•"}
                </span>
                <span className="min-w-0 flex-1 truncate body-medium font-semibold text-on-surface">
                  {c.name}
                </span>
                <span className="shrink-0 body-small text-on-surface-variant">{count}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onNew}
            className="mt-1 flex w-full items-center gap-3 rounded-xl border-t border-outline-variant px-3 py-2.5 text-left transition-colors hover:bg-surface-container-highest"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-on-primary">
              <IconPlus size={16} />
            </span>
            <span className="flex-1 body-medium font-semibold text-on-surface">New collection…</span>
          </button>
        </div>
      </div>
    </div>
  );
}
