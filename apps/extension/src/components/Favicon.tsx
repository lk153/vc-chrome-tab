import { useState } from "react";

/** Favicon image with a graceful letter fallback when it fails to load. */
export function Favicon({ src, title, size = 16 }: { src?: string; title: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const letter = title.trim().charAt(0).toUpperCase() || "•";

  if (!src || failed) {
    return (
      <span
        className="grid shrink-0 place-items-center rounded-m3-xs bg-primary-container label-small text-on-primary-container"
        style={{ width: size, height: size }}
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
      className="shrink-0 rounded-m3-xs"
    />
  );
}
