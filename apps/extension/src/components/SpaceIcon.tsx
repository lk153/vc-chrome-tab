/**
 * Per-space glyph from the design handoff, keyed by the well-known seed space
 * names; custom spaces fall back to a folder. Inherits `currentColor`.
 */
const PATHS: Record<string, string[]> = {
  "My Collections": ["M4 7l8-4 8 4-8 4-8-4z", "M4 12l8 4 8-4", "M4 17l8 4 8-4"],
  Personal: ["M12 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z", "M5.5 20a6.5 6.5 0 0 1 13 0"],
  Hobbies: ["M12 2.5l2.7 5.45 6.02.88-4.36 4.25 1.03 5.99L12 16.7l-5.39 2.84 1.03-5.99-4.36-4.25 6.02-.88z"],
  Entertainment: [
    "M3 5.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    "M7.5 3.5v17M16.5 3.5v17M3 8.5h4.5M3 15.5h4.5M16.5 8.5H21M16.5 15.5H21",
  ],
  Travel: ["M21.5 2.5 10.5 13.5", "M21.5 2.5l-7 19-4-8.5-8.5-4z"],
  Recipes: ["M7 3v6a3 3 0 0 0 6 0V3", "M10 3v18", "M18 3c-1.7 0-3 1.8-3 4.5V13h3", "M18 13v8"],
};

const FALLBACK = ["M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"];

export function SpaceIcon({ name, size = 15 }: { name: string; size?: number }) {
  const paths = PATHS[name] ?? FALLBACK;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
