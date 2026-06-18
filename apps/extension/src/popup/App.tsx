import { useEffect, useMemo, useState } from "react";
import type { OpenTab } from "@vctabs/shared";
import { Favicon } from "@/components/Favicon";
import { IconRestore, IconSave } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { hostLabel } from "@/lib/data/favicon";
import { getActiveTab, listOpenTabs } from "@/lib/chrome/tabs";
import { hasTabsApi } from "@/lib/chrome/runtime";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUiStore } from "@/store/useUiStore";

/** Toolbar popup: quick-save the current tab or the whole window. */
export function PopupApp() {
  const ready = useBootstrapPopup();
  const [activeTab, setActiveTab] = useState<OpenTab | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const data = useWorkspaceStore((s) => s.data);
  const addTab = useWorkspaceStore((s) => s.addTab);
  const saveSession = useWorkspaceStore((s) => s.saveSession);
  const activeSpaceId = useUiStore((s) => s.activeSpaceId);

  const spaceId = activeSpaceId && data.spaces.some((s) => s.id === activeSpaceId)
    ? activeSpaceId
    : data.spaces[0]?.id;

  const collections = useMemo(
    () => data.collections.filter((c) => c.spaceId === spaceId).sort((a, b) => a.order - b.order),
    [data.collections, spaceId],
  );

  const [collectionId, setCollectionId] = useState<string>("");
  useEffect(() => {
    if (!collectionId && collections[0]) setCollectionId(collections[0].id);
  }, [collections, collectionId]);

  useEffect(() => {
    void getActiveTab().then(setActiveTab);
  }, []);

  if (!ready) return <div className="p-4 body-medium text-on-surface-variant">Loading…</div>;

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(null), 1600);
  };

  const onSaveTab = () => {
    if (!activeTab || !collectionId) return;
    addTab(collectionId, { title: activeTab.title, url: activeTab.url, faviconUrl: activeTab.favIconUrl });
    flash("Saved to collection ✓");
  };

  const onSaveSession = async () => {
    if (!spaceId) return;
    const tabs = await listOpenTabs();
    saveSession(spaceId, "Session", tabs);
    flash(`Saved ${tabs.length} tabs as a session ✓`);
  };

  const openWorkspace = () => {
    if (hasTabsApi()) chrome.tabs.create({});
  };

  return (
    <div className="bg-surface p-3 text-on-surface">
      <div className="mb-2 flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center rounded-full bg-primary label-medium text-on-primary">V</div>
        <span className="title-small">VC Tabs — Quick Access</span>
      </div>

      {activeTab && (
        <div className="mb-3 flex items-center gap-2 rounded-m3-md bg-surface-container-high p-2">
          <Favicon src={activeTab.favIconUrl} title={activeTab.title} />
          <div className="min-w-0">
            <p className="truncate body-medium">{activeTab.title}</p>
            <p className="truncate body-small text-on-surface-variant">{hostLabel(activeTab.url)}</p>
          </div>
        </div>
      )}

      <label className="mb-1 block body-small text-on-surface-variant">Save to</label>
      <select
        value={collectionId}
        onChange={(e) => setCollectionId(e.target.value)}
        className="m3-field mb-2"
      >
        {collections.length === 0 && <option value="">No collections yet</option>}
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="filled"
          onClick={onSaveTab}
          disabled={!activeTab || !collectionId}
        >
          <IconSave size={15} /> Save tab
        </Button>
        <Button variant="tonal" onClick={() => void onSaveSession()}>
          <IconRestore size={15} /> Session
        </Button>
      </div>

      <Button variant="text" onClick={openWorkspace} className="mt-2 w-full">
        Open workspace →
      </Button>

      {status && <p className="mt-2 text-center body-small text-primary">{status}</p>}
    </div>
  );
}

function useBootstrapPopup(): boolean {
  const initWorkspace = useWorkspaceStore((s) => s.init);
  const initUi = useUiStore((s) => s.init);
  const wsLoaded = useWorkspaceStore((s) => s.loaded);
  const uiLoaded = useUiStore((s) => s.loaded);
  useEffect(() => {
    void initWorkspace();
    void initUi();
  }, [initWorkspace, initUi]);
  return wsLoaded && uiLoaded;
}
