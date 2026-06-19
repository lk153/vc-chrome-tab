import { useEffect, useMemo, useRef, useState } from "react";
import { Favicon } from "@/components/Favicon";
import { IconSearch } from "@/components/icons";
import { hostLabel } from "@/lib/data/favicon";
import { activateTab, openUrl } from "@/lib/chrome/tabs";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useOpenTabsStore } from "@/store/useOpenTabsStore";
import { useUiStore } from "@/store/useUiStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { toast } from "@/store/useToastStore";

type Kind = "Space" | "Collection" | "Saved" | "Tab";
interface Result {
  key: string;
  kind: Kind;
  title: string;
  sub: string;
  faviconSrc?: string;
  act: () => void;
}

const KBD = "rounded-md border border-outline-variant bg-surface-container-highest px-2 py-0.5 label-small font-mono text-on-surface-variant";

/** ⌘K command palette: search collections, saved tabs, open tabs, and spaces. */
export function CommandPalette() {
  const open = useOverlayStore((s) => s.cmdOpen);
  const close = useOverlayStore((s) => s.closeCmd);
  const setActiveSpace = useUiStore((s) => s.setActiveSpace);

  const spaces = useWorkspaceStore((s) => s.data.spaces);
  const collections = useWorkspaceStore((s) => s.data.collections);
  const tabs = useWorkspaceStore((s) => s.data.tabs);
  const openTabs = useOpenTabsStore((s) => s.tabs);

  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<Result[]>(() => {
    const out: Result[] = [];
    for (const sp of spaces) {
      const n = collections.filter((c) => c.spaceId === sp.id).length;
      out.push({
        key: `space:${sp.id}`,
        kind: "Space",
        title: sp.name,
        sub: `${n} collection${n === 1 ? "" : "s"}`,
        act: () => {
          setActiveSpace(sp.id);
          close();
          toast(`Switched to “${sp.name}”`);
        },
      });
    }
    for (const c of collections) {
      const space = spaces.find((s) => s.id === c.spaceId);
      const n = tabs.filter((t) => t.collectionId === c.id).length;
      out.push({
        key: `col:${c.id}`,
        kind: "Collection",
        title: c.name,
        sub: `${n} tab${n === 1 ? "" : "s"}${space ? ` · ${space.name}` : ""}`,
        act: () => {
          setActiveSpace(c.spaceId);
          close();
          toast(`Opened “${c.name}”`);
        },
      });
    }
    for (const t of tabs) {
      const c = collections.find((x) => x.id === t.collectionId);
      out.push({
        key: `saved:${t.id}`,
        kind: "Saved",
        title: t.title,
        sub: `${hostLabel(t.url)}${c ? ` · ${c.name}` : ""}`,
        faviconSrc: t.faviconUrl,
        act: () => {
          void openUrl(t.url);
          close();
        },
      });
    }
    for (const t of openTabs) {
      out.push({
        key: `open:${t.id}`,
        kind: "Tab",
        title: t.title,
        sub: hostLabel(t.url),
        faviconSrc: t.favIconUrl,
        act: () => {
          void activateTab(t.id, t.windowId);
          close();
        },
      });
    }
    const q = query.trim().toLowerCase();
    if (!q) return out.slice(0, 9);
    return out.filter((r) => `${r.title} ${r.sub}`.toLowerCase().includes(q)).slice(0, 30);
  }, [spaces, collections, tabs, openTabs, query, setActiveSpace, close]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setIndex(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape") {
        e.preventDefault();
        close();
      } else if (k === "arrowdown") {
        e.preventDefault();
        setIndex((i) => (results.length ? (i + 1) % results.length : 0));
      } else if (k === "arrowup") {
        e.preventDefault();
        setIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
      } else if (k === "enter") {
        e.preventDefault();
        results[Math.min(index, results.length - 1)]?.act();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, results, index, close]);

  if (!open) return null;
  const idx = Math.min(index, Math.max(0, results.length - 1));

  return (
    <div
      onPointerDown={(e) => e.target === e.currentTarget && close()}
      className="animate-overlay-fade fixed inset-0 z-[60] flex items-start justify-center bg-scrim/40 p-4 pt-[13vh] backdrop-blur-sm"
    >
      <div className="animate-overlay-pop w-full max-w-[640px] overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-high shadow-m3-3">
        <div className="flex items-center gap-3 border-b border-outline-variant px-5 py-4">
          <IconSearch size={20} className="text-primary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            placeholder="Search tabs, collections, spaces…"
            className="flex-1 bg-transparent text-[16.5px] font-medium text-on-surface outline-none placeholder:text-on-surface-variant"
          />
          <kbd className={KBD}>ESC</kbd>
        </div>

        <div className="scroll-thin max-h-[46vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-5 py-9 text-center body-medium text-on-surface-variant">
              No matches for “{query}”.
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.key}
                type="button"
                onMouseEnter={() => setIndex(i)}
                onClick={() => r.act()}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  i === idx ? "bg-primary-container" : ""
                }`}
              >
                <Favicon src={r.faviconSrc} title={r.title} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="truncate body-large font-semibold text-on-surface">{r.title}</div>
                  <div className="truncate font-mono body-small text-on-surface-variant">{r.sub}</div>
                </div>
                <span className="shrink-0 rounded-md border border-outline-variant bg-surface-container-highest px-2 py-0.5 label-small uppercase text-on-surface-variant">
                  {r.kind}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-outline-variant px-5 py-2.5 body-small text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <kbd className={KBD}>↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className={KBD}>↵</kbd> Open
          </span>
          <div className="flex-1" />
          <span>
            {results.length} result{results.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
