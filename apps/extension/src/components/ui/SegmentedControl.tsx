import type { ReactNode } from "react";

export interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

/** Two-or-more option toggle in a tonal track; the selected pill is raised. */
export function SegmentedControl<T extends string>({
  value,
  segments,
  onChange,
}: {
  value: T;
  segments: Segment<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-surface-container-highest p-1">
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <button
            key={seg.value}
            type="button"
            onClick={() => onChange(seg.value)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 label-large transition-colors ${
              active
                ? "bg-surface-container-lowest text-on-surface shadow-soft"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {seg.icon}
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
