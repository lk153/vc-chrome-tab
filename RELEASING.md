# Releasing VC Tabs to the Chrome Web Store

Every upload must carry a **higher `version`** than the one currently published —
the dashboard rejects an equal or lower one. `public/manifest.json` is the source
of truth; keep `apps/extension/package.json` in step with it.

## 1. Bump the version

- `apps/extension/public/manifest.json` → `"version"`
- `apps/extension/package.json` → `"version"`

The sidebar footer reads the version from the installed manifest at runtime, so
there is nothing else to edit.

## 2. Typecheck, build, zip

```bash
make release        # = make typecheck + make package
```

Produces `apps/extension/vc-tabs-extension.zip` (git-ignored). The production API
origin is baked in via `API_URL` (defaults to the Vercel deployment; override with
`make package API_URL=…`). The zip excludes source maps and unused font files.

## 3. Smoke-test the exact build you will upload

1. `chrome://extensions` → **Developer mode** → **Load unpacked** → `apps/extension/dist`.
2. Open a new tab: the footer must show the new version. Exercise the changed
   flows plus the basics (save a tab, open a collection, ⌘K search).
3. **Remove** the unpacked copy afterwards so it doesn't shadow the store install.

## 4. Commit and tag

```bash
git add -A
git commit -m "Release 0.x.y — <one-line summary>"
git tag v0.x.y
git push && git push --tags
```

## 5. Upload in the Developer Dashboard

1. Open <https://chrome.google.com/webstore/devconsole> and pick **VC Tabs — Tab Manager**.
2. **Package** (left nav) → **Upload new package** → choose `vc-tabs-extension.zip`.
   The page reports the parsed version; any manifest error appears here.
3. **Store listing** — only if copy or screenshots changed. Source of truth is
   [`store-assets/LISTING.md`](./store-assets/LISTING.md); screenshots are the
   `store-assets/*-1280x800.png` files (`make screenshots` regenerates them).
4. **Privacy** tab — re-check only if `permissions`, `host_permissions`, or data
   use changed. Unchanged permissions need no edits.
5. **Save draft** → **Submit for review** → confirm. Leave *Publish automatically
   after review* enabled unless you want to release manually later.

## 6. After submission

- Status shows **Pending review** and then **Published**. Reviews usually take
  from a few hours to a few days; new/changed permissions lengthen them (see
  [`z-docs/Review-Process.md`](./z-docs/Review-Process.md)).
- A rejection arrives by email with the policy clause. Fix it, bump the version
  again (a re-upload always needs a new version), and resubmit.
- Once published, installed copies auto-update within a few hours (Chrome polls
  roughly every 5 hours); `chrome://extensions` → **Update** forces it.
