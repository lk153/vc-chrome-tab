# CLAUDE.md — VC Tabs

Toby-style tab manager. Chrome extension (MV3) + (future) Vercel/Mongo backend.
Authoritative scope & decisions live in [`implementation-plan.md`](./implementation-plan.md).

## Toolchain note (important)

Homebrew `node@22` is broken on this machine (missing `libsimdjson.29.dylib`) and
is first on `PATH`. Use Node v26 by prefixing commands:
`export PATH="/opt/homebrew/bin:$PATH"`. Then `pnpm install` / `pnpm build`.

Simpler: use the root `Makefile` (`make help`) — it bakes in the PATH fix.
Common targets: `make dev` (API server), `make build`, `make package` (store zip),
`make typecheck`, `make release`.

## Where things are

- `apps/extension/` — the product. Vite multi-entry build (no CRXJS), static MV3
  manifest at `public/manifest.json`, icons are committed artwork in
  `public/icons/` (copied verbatim into `dist/`).
  - `src/newtab/` — the workspace app (new-tab override) + its components and `dnd.ts`.
  - `src/popup/` — Quick Access popup.
  - `src/background/` — MV3 service worker (ephemeral; alarm stub for Phase 2 auth).
  - `src/lib/` — `chrome/*` API wrappers (with dev fallbacks), `data/*` (seed,
    repository, pure `mutations`), `theme`.
  - `src/store/` — Zustand stores: workspace data, UI prefs, open tabs.
- `packages/shared/` — domain `types`, `id`, pure `sortTabs` (consumed via the
  `@vctabs/shared` Vite/TS alias; no build step).

## Conventions

- Data flow: components → store actions → pure `mutations.ts` → `chrome.storage`.
  Keep mutations pure (return new `WorkspaceData`) and functions small.
- Every domain object carries `id`/`createdAt`/`updatedAt`/`order` so Phase 2
  sync needs no migration.
- Build = `pnpm build` (`tsc --noEmit`, then `vite build` → `dist/`).
  Load `apps/extension/dist` as an unpacked extension.

  NOTE: Codex will strictly verify your work again after you finish any task
