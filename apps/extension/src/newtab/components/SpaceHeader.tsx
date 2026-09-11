import { useState } from "react";
import type { Space } from "@vctabs/shared";
import { IconPencil } from "@/components/icons";
import { RenameSpaceDialog } from "./RenameSpaceDialog";

/** Active-space title + counts. The hover ✎ (or a double-click on the title) renames the space. */
export function SpaceHeader({
  space,
  collectionCount,
  savedTabCount,
}: {
  space: Space;
  collectionCount: number;
  savedTabCount: number;
}) {
  const [renaming, setRenaming] = useState(false);

  return (
    <div className="group min-w-0">
      <div className="flex min-w-0 items-center gap-1.5">
        <h1
          onDoubleClick={() => setRenaming(true)}
          title="Double-click to rename"
          className="truncate text-[28px] font-bold leading-tight text-on-surface"
        >
          {space.name}
        </h1>
        <button
          type="button"
          onClick={() => setRenaming(true)}
          title="Rename space"
          aria-label="Rename space"
          className="m3-icon-btn h-8 w-8 shrink-0 opacity-0 hover:text-primary group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <IconPencil size={16} />
        </button>
      </div>
      <p className="body-medium text-on-surface-variant">
        {collectionCount} collections · {savedTabCount} saved tabs
      </p>

      {renaming && <RenameSpaceDialog space={space} onClose={() => setRenaming(false)} />}
    </div>
  );
}
