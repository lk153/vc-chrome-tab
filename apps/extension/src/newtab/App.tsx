import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { OpenTab } from "@vctabs/shared";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUiStore } from "@/store/useUiStore";
import { useOpenTabsStore } from "@/store/useOpenTabsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { Button } from "@/components/ui/Button";
import { PromptDialog } from "@/components/ui/PromptDialog";
import { Toast } from "@/components/Toast";
import { IconPlus } from "@/components/icons";
import { Sidebar } from "./components/Sidebar";
import { WorkspaceToolbar } from "./components/WorkspaceToolbar";
import { CollectionList } from "./components/CollectionList";
import { OpenTabsPanel } from "./components/OpenTabsPanel";
import { EditTabModal } from "./components/EditTabModal";
import { CommandPalette } from "./components/CommandPalette";
import { SavePicker } from "./components/SavePicker";
import { VerifyBanner } from "./components/VerifyBanner";
import { collisionDetection, resolveDrop } from "./dnd";

export function App() {
  useBootstrap();
  useCommandHotkey();
  const spaceId = useActiveSpaceId();

  const spaces = useWorkspaceStore((s) => s.data.spaces);
  const collections = useWorkspaceStore((s) => s.data.collections);
  const tabs = useWorkspaceStore((s) => s.data.tabs);
  const addCollection = useWorkspaceStore((s) => s.addCollection);
  const editingTabId = useUiStore((s) => s.editingTabId);
  // Call both hooks unconditionally — `&&` would short-circuit the second one
  // and change the hook count between renders (React error #310).
  const workspaceReady = useWorkspaceStore((s) => s.loaded);
  const uiReady = useUiStore((s) => s.loaded);
  const ready = workspaceReady && uiReady;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [dragLabel, setDragLabel] = useState<string | null>(null);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);

  if (!ready || !spaceId) return <LoadingScreen />;

  const space = spaces.find((s) => s.id === spaceId);
  const spaceCollectionIds = new Set(
    collections.filter((c) => c.spaceId === spaceId).map((c) => c.id),
  );
  const collectionCount = spaceCollectionIds.size;
  const savedTabCount = tabs.filter((t) => spaceCollectionIds.has(t.collectionId)).length;
  const editingTab = editingTabId ? tabs.find((t) => t.id === editingTabId) : undefined;

  const onNewCollection = () => setNewCollectionOpen(true);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={(e) => setDragLabel(dragLabelFor(e))}
        onDragEnd={(e) => {
          setDragLabel(null);
          resolveDrop(e);
        }}
      >
        <main className="flex min-w-0 flex-1 flex-col">
          <VerifyBanner />
          <div className="px-6 py-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-[28px] font-bold leading-tight text-on-surface">
                  {space?.name ?? "Workspace"}
                </h1>
                <p className="body-medium text-on-surface-variant">
                  {collectionCount} collections · {savedTabCount} saved tabs
                </p>
              </div>
              <Button variant="filled" onClick={onNewCollection} className="shrink-0">
                <IconPlus size={18} />
                New Collection
              </Button>
            </div>
            <WorkspaceToolbar spaceId={spaceId} />
          </div>
          <div className="scroll-thin flex-1 overflow-y-auto px-6 py-5">
            <CollectionList spaceId={spaceId} />
          </div>
        </main>

        <OpenTabsPanel spaceId={spaceId} />

        <DragOverlay>{dragLabel ? <DragChip label={dragLabel} /> : null}</DragOverlay>
      </DndContext>

      {editingTab && <EditTabModal key={editingTab.id} tab={editingTab} />}
      {newCollectionOpen && (
        <PromptDialog
          title="New collection"
          label="Collection name"
          placeholder="e.g. Reading list"
          confirmLabel="Create"
          onConfirm={(name) => addCollection(spaceId, name)}
          onClose={() => setNewCollectionOpen(false)}
        />
      )}
      <CommandPalette />
      <SavePicker />
      <Toast />
    </div>
  );
}

/** Loads persisted state once on mount. Auth/sync start AFTER the workspace
 *  data is in place, so the sync engine pushes/merges against real local data. */
function useBootstrap() {
  const initWorkspace = useWorkspaceStore((s) => s.init);
  const initUi = useUiStore((s) => s.init);
  const initAuth = useAuthStore((s) => s.init);
  const refreshTabs = useOpenTabsStore((s) => s.refresh);
  useEffect(() => {
    void (async () => {
      await Promise.all([initWorkspace(), initUi()]);
      void refreshTabs();
      void initAuth();
    })();
  }, [initWorkspace, initUi, initAuth, refreshTabs]);
}

/** Global ⌘K / Ctrl+K toggles the command palette. */
function useCommandHotkey() {
  const toggleCmd = useOverlayStore((s) => s.toggleCmd);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCmd();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggleCmd]);
}

/** Resolves the active space, defaulting to the first available one. */
function useActiveSpaceId(): string | undefined {
  const spaces = useWorkspaceStore((s) => s.data.spaces);
  const activeSpaceId = useUiStore((s) => s.activeSpaceId);
  const setActiveSpace = useUiStore((s) => s.setActiveSpace);

  const valid = Boolean(activeSpaceId && spaces.some((s) => s.id === activeSpaceId));
  useEffect(() => {
    if (spaces.length && !valid) setActiveSpace(spaces[0].id);
  }, [spaces, valid, setActiveSpace]);

  return valid ? (activeSpaceId as string) : spaces[0]?.id;
}

/** Human label for the drag overlay (open-tab title or saved-tab title). */
function dragLabelFor(e: DragStartEvent): string {
  const data = e.active.data.current as { type?: string; tab?: OpenTab } | undefined;
  if (data?.type === "open" && data.tab) return data.tab.title;
  const tab = useWorkspaceStore.getState().data.tabs.find((t) => t.id === e.active.id);
  return tab?.title ?? "Tab";
}

function DragChip({ label }: { label: string }) {
  return (
    <div className="max-w-56 truncate rounded-full bg-surface-container-high px-4 py-2 body-medium text-on-surface shadow-m3-2">
      {label}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="grid h-screen place-items-center bg-surface body-medium text-on-surface-variant">
      Loading your workspace…
    </div>
  );
}
