import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface PromptDialogProps {
  title: string;
  label?: string;
  initialValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

/**
 * In-app replacement for `window.prompt`: a single-field modal that matches the
 * app's Modal/Button/field styling. Submits on Enter, cancels on Escape or
 * click-outside. The initial value is pre-selected for quick replacement.
 */
export function PromptDialog({
  title,
  label,
  initialValue = "",
  placeholder,
  confirmLabel = "Save",
  onConfirm,
  onClose,
}: PromptDialogProps) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    onConfirm(trimmed);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="title-large mb-4 text-on-surface">{title}</h2>
      <form onSubmit={onSubmit}>
        {label && (
          <label className="mb-1.5 block body-small text-on-surface-variant">{label}</label>
        )}
        <input
          className="m3-field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
          onFocus={(e) => e.target.select()}
        />
        <footer className="mt-5 flex items-center justify-end gap-2">
          <Button variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="filled" disabled={!trimmed}>
            {confirmLabel}
          </Button>
        </footer>
      </form>
    </Modal>
  );
}
