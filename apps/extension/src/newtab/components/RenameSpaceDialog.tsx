import type { Space } from "@vctabs/shared";
import { PromptDialog } from "@/components/ui/PromptDialog";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

/** Rename prompt for a space, wired to the store — callers only manage visibility. */
export function RenameSpaceDialog({ space, onClose }: { space: Space; onClose: () => void }) {
  const renameSpace = useWorkspaceStore((s) => s.renameSpace);
  return (
    <PromptDialog
      title="Rename space"
      label="Space name"
      initialValue={space.name}
      confirmLabel="Rename"
      onConfirm={(name) => renameSpace(space.id, name)}
      onClose={onClose}
    />
  );
}
