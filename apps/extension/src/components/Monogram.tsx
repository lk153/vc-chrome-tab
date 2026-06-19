import { monogramColor } from "@/lib/data/color";

/**
 * Colored letter tile (design v2). The letter is the first character of `label`;
 * the colour is derived from `seed` (defaults to `label`). `fixedColor` overrides
 * the palette (used for neutral/active states like the spaces list).
 */
export function Monogram({
  label,
  seed,
  size = 32,
  radius = 10,
  fixedColor,
}: {
  label: string;
  seed?: string;
  size?: number;
  radius?: number;
  fixedColor?: string;
}) {
  const color = fixedColor ?? monogramColor(seed ?? label);
  const letter = label.trim().charAt(0).toUpperCase() || "•";
  return (
    <span
      className="grid shrink-0 place-items-center font-semibold leading-none"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        color,
        backgroundColor: `${color}22`,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {letter}
    </span>
  );
}
