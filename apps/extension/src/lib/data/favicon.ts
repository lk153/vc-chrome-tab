/** Best-effort favicon URL for a page, falling back to Google's S2 service. */
export function faviconFor(url: string, explicit?: string): string {
  if (explicit) return explicit;
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return "";
  }
}

/** Short, human-friendly host label (e.g. "github.com"). */
export function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
