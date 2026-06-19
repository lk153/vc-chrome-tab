import { useState } from "react";
import { monogramColor } from "@/lib/data/color";

/**
 * Site favicon for tab items. Falls back to a colored letter tile (monogram)
 * when the image is missing or fails to load (e.g. localhost / intranet).
 */
export function Favicon({
  src,
  title,
  size = 16,
  radius,
}: {
  src?: string;
  title: string;
  size?: number;
  radius?: number;
}) {
  const [failed, setFailed] = useState(false);
  const r = radius ?? Math.round(size * 0.28);

  if (!src || failed) {
    const color = monogramColor(title);
    const letter = title.trim().charAt(0).toUpperCase() || "•";
    return (
      <span
        className="grid shrink-0 place-items-center font-semibold leading-none"
        style={{
          width: size,
          height: size,
          borderRadius: r,
          color,
          backgroundColor: `${color}22`,
          fontSize: Math.round(size * 0.42),
        }}
      >
        {letter}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="shrink-0 object-contain"
      style={{ borderRadius: r }}
    />
  );
}
