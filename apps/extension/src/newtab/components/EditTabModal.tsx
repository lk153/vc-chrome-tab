import { useMemo, useState, type ReactNode } from "react";
import type { SavedTab } from "@vctabs/shared";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Favicon } from "@/components/Favicon";
import { IconInfo, IconTrash, IconX } from "@/components/icons";
import { joinUrl, splitUrl } from "@/lib/data/url";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUiStore } from "@/store/useUiStore";

/** Edit modal for a saved tab (design: ui-design/edit-saved-tab.png). */
export function EditTabModal({ tab }: { tab: SavedTab }) {
  const updateTab = useWorkspaceStore((s) => s.updateTab);
  const deleteTab = useWorkspaceStore((s) => s.deleteTab);
  const close = useUiStore((s) => s.closeTabEditor);

  const initial = useMemo(() => splitUrl(tab.url), [tab.url]);
  const [title, setTitle] = useState(tab.title);
  const [description, setDescription] = useState(tab.description ?? "");
  const [urlSuffix, setUrlSuffix] = useState(initial.suffix);

  const onDone = () => {
    updateTab(tab.id, {
      title: title.trim() || tab.title,
      description: description.trim(),
      url: joinUrl(initial.origin, urlSuffix),
    });
    close();
  };

  const onDelete = () => {
    if (window.confirm(`Delete “${tab.title}”?`)) {
      deleteTab(tab.id);
      close();
    }
  };

  return (
    <Modal onClose={close}>
      <header className="mb-4 flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-m3-md bg-surface-container-highest">
          <Favicon src={tab.faviconUrl} title={tab.title} size={22} />
        </div>
        <IconButton label="Close" onClick={close}>
          <IconX size={20} />
        </IconButton>
      </header>

      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="m3-field" />
      </Field>

      <Field label="Description">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a short description"
          className="m3-field"
        />
      </Field>

      <Field
        label={
          initial.origin ? (
            <>
              URL: <span className="text-on-surface-variant">{initial.origin}</span>
            </>
          ) : (
            "URL"
          )
        }
      >
        <input
          value={urlSuffix}
          onChange={(e) => setUrlSuffix(e.target.value)}
          placeholder={initial.origin ? "path" : "https://…"}
          className="m3-field"
        />
      </Field>

      <TobyLinkField />

      <footer className="mt-5 flex items-center justify-between">
        <Button variant="text" onClick={onDelete} className="text-error">
          <IconTrash size={16} /> Delete
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="text" onClick={close}>
            Cancel
          </Button>
          <Button variant="filled" onClick={onDone}>
            Done
          </Button>
        </div>
      </footer>
    </Modal>
  );
}

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block body-small text-on-surface-variant">{label}</label>
      {children}
    </div>
  );
}

/** Toby Link (the `to/<slug>` shortcut) — disabled until the Links feature (Phase 3). */
function TobyLinkField() {
  return (
    <div className="mb-1">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="body-small text-on-surface-variant">Toby Link</span>
        <IconInfo size={14} className="text-on-surface-variant" />
      </div>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center rounded-m3-xs bg-surface-container-highest px-4 py-2.5 body-large text-on-surface">
          <span className="text-on-surface-variant">to /</span>
          <input
            disabled
            placeholder="Type custom name"
            className="ml-1 flex-1 bg-transparent text-on-surface outline-none placeholder:text-on-surface-variant"
          />
        </div>
        <Button variant="outlined" disabled>
          Save
        </Button>
      </div>
      <p className="mt-1.5 body-small text-on-surface-variant">Links (to/docs) arrive in a later release.</p>
    </div>
  );
}
