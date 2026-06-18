import { useEffect, useRef, useState, type ReactNode } from "react";

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onSelect: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

/** Click-to-open menu that closes on outside click or Escape. */
export function Dropdown({ trigger, items, align = "left" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {trigger}
      </button>
      {open && (
        <div
          className={`m3-menu absolute z-30 mt-1.5 min-w-48 ${align === "right" ? "right-0" : "left-0"}`}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                item.onSelect();
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-m3-xs px-3 py-2.5 text-left label-large transition-colors hover:bg-on-surface/[0.08] focus-visible:bg-on-surface/[0.08] focus-visible:outline-none ${
                item.active ? "bg-secondary-container text-on-secondary-container" : "text-on-surface"
              }`}
            >
              {item.icon && <span className="text-on-surface-variant">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
