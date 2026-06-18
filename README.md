# VC Tabs — Toby-style Tab Manager

A Chrome extension (Manifest V3) that replaces the new-tab page with a visual
workspace: save browser tabs into **Collections**, group them into **Spaces**,
and restore sessions in one click. Built per [`implementation-plan.md`](./implementation-plan.md).

**This repo currently implements Phase 0 (scaffold) + Phase 1 (offline local core).**
Cloud sync, accounts, and the Vercel API land in Phase 2.

## Monorepo layout

```
apps/extension     # the Chrome extension (React + Vite + Tailwind, MV3)
packages/shared    # domain types, id + sort helpers (shared with the future API)
apps/web           # (Phase 2) Next.js API on Vercel — not built yet
```

## Prerequisites

- **Node 18+** and **pnpm 10+**.
- ⚠️ **Heads-up for this machine:** your Homebrew `node@22` keg is broken
  (missing `libsimdjson.29.dylib`) and it sits first on your `PATH`, so a bare
  `node`/`pnpm` fails with a `dyld` error. The working Node is **v26** at
  `/opt/homebrew/bin/node`. Until you fix the keg, prefix commands so v26 wins:

  ```bash
  export PATH="/opt/homebrew/bin:$PATH"
  ```

  Permanent fix (your call): `brew reinstall node@22` **or** `brew unlink node@22`.

## Build & load the extension

```bash
export PATH="/opt/homebrew/bin:$PATH"   # see note above
pnpm install
pnpm build                              # -> apps/extension/dist
```

Then in Chrome:

1. Open `chrome://extensions`.
2. Toggle **Developer mode** (top-right).
3. Click **Load unpacked** and select **`apps/extension/dist`**.
4. Open a new tab — the VC Tabs workspace appears. Click the toolbar icon for
   the **Quick Access** popup.

Rebuild after changes with `pnpm build`, then hit the refresh icon on the
extension card in `chrome://extensions`.

## UI development without Chrome

```bash
pnpm dev      # http://localhost:5173/newtab.html
```

Outside the extension there are no `chrome.*` APIs, so the app falls back to
`localStorage` and a small set of sample "open tabs" — handy for fast UI work.

## What works today (Phase 1)

- Spaces sidebar, collections, and saved-tab cards (seeded sample data on first run).
- **View** modes (Card / Compact / List / Grid) and **Sort** modes
  (Drag & Drop / Alphabetical / Starred To Top / Date Created).
- **Drag & drop**: reorder tabs, move them between collections, and drag a live
  tab from the **Open Tabs** panel into any collection.
- **Save session** (snapshot the window into a new collection) and click-to-open/restore.
- **Instant search** (fuzzy, client-side) and **light/dark themes**, all persisted
  to `chrome.storage.local`.
- **Quick Access popup**: save the current tab or whole window from any page.

## Stubbed / next

- **To / Links** and **Next** appear in the sidebar marked *soon* (Phase 3).
- **Cloud sync, email/password accounts, Notes** — Phase 2/3 (see the plan).
- Naming actions currently use simple prompts; inline editing is a planned polish item.
