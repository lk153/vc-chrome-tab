/**
 * Deterministic accent colour for letter monograms (design v2). The same seed
 * always maps to the same colour. Returned as a hex; components apply it as the
 * letter colour over a translucent tint of itself, so it reads on light + dark.
 */
const PALETTE = [
  "#6D5AE6", // violet
  "#D84C4C", // red
  "#E0840A", // orange
  "#2F76D9", // blue
  "#0E9E8E", // teal
  "#C2479E", // pink
  "#4B8B2B", // green
  "#8A6D3B", // amber
];

export function monogramColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}
