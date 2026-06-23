import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * In-app replacement for `window.confirm`: a titled confirmation modal matching
 * the app's styling, with an optional destructive (red) confirm button. Cancel
 * is focused by default; Escape / click-outside cancels.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const confirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="title-large mb-2 text-on-surface">{title}</h2>
      <p className="body-medium mb-5 text-on-surface-variant">{message}</p>
      <footer className="flex items-center justify-end gap-2">
        <Button variant="text" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant="filled"
          onClick={confirm}
          className={destructive ? "!bg-error !text-on-error hover:!bg-error/90" : ""}
        >
          {confirmLabel}
        </Button>
      </footer>
    </Modal>
  );
}
