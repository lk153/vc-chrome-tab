# Implementation Plan — Toby-style Tab Manager (Chrome Extension + Cloud Sync)

> Status: **Draft for review (rev 2).** Turns `plan.md` (features) + `ui-design/` (layout) into a concrete
> architecture, tech stack, data model, and roadmap. Nothing is built yet.
>
> **Decisions locked in (your answers):**
> 1. **Auth = email/password** (designed provider-extensible so Google can be added later without rework).
> 2. **Sharing / Organizations = deferred to Phase 5** (single-user accounts in MVP; every object carries `ownerId`).
> 3. **Browser scope = Chrome only.**
> 4. **MongoDB = the provided Atlas cluster is production**, supplied via a Vercel env var (`MONGODB_URI`).
> 5. **Web scope = Option B** — API + minimal hosted pages (`/verify`, `/reset`, `/login`, simple landing). Full web
>    dashboard (Option C) deferred to Phase 5. **All five decisions are now resolved — ready to build on approval.**

---

## 1. What we're building (research summary)

Toby replaces the browser's **new-tab page** with a visual workspace. Users save open tabs into named
**Collections**, group collections into **Spaces**, and restore whole sessions in one click. Everything syncs to
the cloud so it follows the user across devices. Around that core sit productivity add-ons (Links, Next, Notes,
Search, Themes) and a toolbar **popup** for quick capture.

Object hierarchy (confirmed from the store listing + screenshots):

```
Organization (account; members deferred to Phase 5)
└── Space            ← left sidebar: "My Collections", "Personal", "Hobbies"…
    └── Collection    ← collapsible section/card: "Devops", "WorkSpace", "Documents"…
        └── Tab(link) ← a saved URL: favicon + title + url, the unit dragged around
```

Supporting objects: **Links** (`to/docs` shortcuts), **Next** items (to-dos), **Notes**, **Tags**, **prefs/themes**.

---

## 2. Feature → implementation map

| Feature (from plan.md) | How we implement it |
|---|---|
| ☁️ Cloud Sync | Local-first cache in `chrome.storage` + REST sync engine to a Vercel API backed by MongoDB Atlas. Optimistic writes, last-write-wins per object via `updatedAt`. All sync calls are authed (Bearer JWT). |
| ⚡ Session Save & Restore | `chrome.tabs` / `chrome.windows` APIs. "Save session" snapshots open tabs into a Collection; "Restore" opens them in a new window. |
| 📁 Collections & Spaces | Core data model + the new-tab UI (sidebar = Spaces, center = Collections, cards = Tabs). |
| ✏️ Edit Saved Tab | Clicking a saved tab opens its URL; hovering reveals a ✎ icon that opens the **edit modal** (`edit-saved-tab.png`): Title, Description, URL (origin label + editable suffix), Toby Link slug, and Delete. See §7. |
| ✋ Drag & Drop | `@dnd-kit` — drag tabs between/within collections, from the live "Open Tabs" panel into a collection, reorder collections. |
| 🔍 Instant Search | Client-side fuzzy search (`Fuse.js`) over the cached dataset; server `/api/search` fallback for very large accounts. |
| 🔗 Links (`to/docs`) | User-defined slug→URL map. Resolved via `chrome.omnibox` keyword **and** a `declarativeNetRequest` redirect for bare `to/<slug>` navigations. |
| ✅ Next | A lightweight to-do view; items creatable from a tab. Own object type, synced like everything else. |
| 📝 Notes | Per-space (and global) markdown notepad, autosaved + synced. |
| 📌 Quick Access | Extension **popup** (toolbar action): save current tab/window to a collection, or open a collection, from any window. |
| 🎨 Light/Dark + Themes | CSS-variable theme tokens + Tailwind `dark` mode; theme preference on the user profile, synced. |

---

## 3. High-level architecture

```
┌─────────────────────────────┐        ┌──────────────────────────────────┐
│  Chrome Extension (MV3)     │  HTTPS │  Vercel — Next.js (Node runtime)  │
│  • new-tab override (React) │ <────► │  • /api/* Route Handlers (JSON)   │
│  • popup (React)            │  JSON  │  • email/password auth → JWT      │
│  • background service worker│ Bearer │  • /verify + /reset pages (req'd) │
│  • chrome.storage cache     │        │  • landing + /login pages (Opt B) │
└─────────────────────────────┘        └───────────────┬──────────────────┘
                                                        │ mongodb driver (cached singleton)
                                          ┌─────────────┴───────────┐
                                          │ MongoDB Atlas (prod)    │   + Upstash Redis (rate limit)
                                          └─────────────────────────┘   + Resend (transactional email)
```

Key facts:
- The **UI lives inside the extension** (Chrome requires the new-tab override to be a local page). Vercel hosts the
  **API + auth + the auth-email landing pages**, not the new-tab page.
- **All Mongo-touching routes pin `export const runtime = 'nodejs'`** — the `mongodb` driver uses TCP sockets and is
  incompatible with Vercel's Edge runtime. (`jose` is Edge-safe, but the DB is not.)
- Email/password auth forces two real hosted pages — **`/verify` and `/reset`** — because verification/reset emails
  must link somewhere the extension can't be linked to directly.

---

## 4. Proposed tech stack (Vercel-friendly)

**Extension (`apps/extension`)**
- **React 18 + TypeScript**, **Vite + `@crxjs/vite-plugin`** (pin an exact version; validate the generated
  `manifest.json` in Phase 0 — the MV3 plugin has historically been finicky).
- **Tailwind CSS** (clean dense Toby look + trivial dark mode), **`@dnd-kit/core`** (drag & drop),
  **`@tanstack/react-query`** (server cache, optimistic mutations, retry/offline), **Zustand** (local UI state),
  **`Fuse.js`** (instant search).

**Backend + web (`apps/web`)**
- **Next.js (App Router) on Vercel** — Route Handlers under `/api/*` as serverless functions (Node runtime).
- **MongoDB Atlas** via the official **`mongodb`** driver with a cached/pooled singleton (serverless-safe).
- **Auth**: **email/password** — **`jose`** (JWT), **`@node-rs/argon2`** for password hashing (fallback
  **`bcryptjs`** if the native binary is troublesome on Vercel), **`@upstash/ratelimit` + `@upstash/redis`** for
  auth rate limiting, **Resend** for transactional email (verify/reset). **Zod** for validation.

**Shared (`packages/shared`)**
- TypeScript types + Zod schemas for every object, the API client, and sync helpers — imported by both apps so the
  contract can't drift.

**Monorepo** — **pnpm workspaces + Turborepo**: one repo, three packages, shared types, single CI.

> Why: every piece deploys to Vercel with no infra work, MongoDB Atlas is the provided store, the extension is a
> standard Vite/React build, and it's TypeScript end-to-end with shared validation — directly serving the
> "readable & maintainable, small functions" requirement.

---

## 5. Repository structure

```
vc-chrome-tab/
├─ apps/
│  ├─ extension/
│  │  └─ src/
│  │     ├─ newtab/        # workspace app: Sidebar, CollectionGrid, CollectionCard, TabCard, OpenTabsPanel, Toolbar…
│  │     ├─ auth/          # <AuthGate>, <LoginForm>, <RegisterForm>, <ForgotPassword> (shared by newtab + popup)
│  │     ├─ popup/         # Quick Access popup
│  │     ├─ background/    # MV3 service worker: tab events, omnibox, DNR, silent token refresh (owns refresh token)
│  │     ├─ lib/           # api-client (apiFetch), storage-cache, sync-engine (pull/push/merge/queue), auth
│  │     └─ manifest.config.ts
│  └─ web/
│     ├─ app/
│     │  ├─ api/           # Route Handlers (runtime='nodejs'): auth/*, sync, spaces, collections, tabs, links, next, notes, search
│     │  └─ (site)/        # REQUIRED: /verify, /reset, /login ; OPTIONAL: landing, (future) dashboard
│     └─ lib/db/           # mongo cached client + thin repositories (one concern each)
├─ packages/shared/        # types, zod schemas, api-client interface, sync utils
├─ turbo.json
└─ pnpm-workspace.yaml
```

> Small-function rule: components stay single-purpose; data access is thin repository functions; sync logic splits
> into `pull` / `push` / `merge` / `queue`; auth splits into `hash` / `tokens` / `email` / `rateLimit`.

**Extension manifest (MV3) — the artifact that makes this a Chrome extension, not a web app.**
`@crxjs/vite-plugin` emits this `manifest.json`; loading the built `dist/` as an *Unpacked extension* in
`chrome://extensions` is how the product runs. The new-tab page, popup, and service worker are all declared here —
none of this exists for a plain web app:

```jsonc
{
  "manifest_version": 3,
  "name": "VC Tabs",
  "version": "0.1.0",
  "description": "Save, organize, and restore your tabs.",
  "chrome_url_overrides": { "newtab": "src/newtab/index.html" }, // ← THE product surface (the workspace)
  "action": { "default_popup": "src/popup/index.html" },         // ← Quick Access (toolbar)
  "background": { "service_worker": "src/background/index.ts", "type": "module" }, // ← tab events, refresh, omnibox, DNR
  "omnibox": { "keyword": "to" },                                // ← to/docs links
  "permissions": ["tabs", "storage", "alarms", "declarativeNetRequest"],
  "host_permissions": ["https://<app>.vercel.app/*"],            // ← only to call the sync API
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"    // ← strict CSP per §8.1 (no inline/remote script)
  }
}
```

Distribution is the **Chrome Web Store** (a packaged `.zip` of the extension build), *not* a Vercel URL. Vercel only
ever serves the JSON API + the three small auth/landing pages.

---

## 6. Data model (MongoDB)

All domain docs carry `_id` (client-generated UUID for offline-safe idempotent sync), `ownerId`, `createdAt`,
`updatedAt`, `deletedAt` (tombstone), and an `order` field for manual sort.

| Collection | Key fields |
|---|---|
| `users` | `email` (unique, lowercased, collation strength 2), `passwordHash` (argon2id PHC string), `emailVerified`, `emailVerifyTokenHash`+`emailVerifyExpires`, `passwordResetTokenHash`+`passwordResetExpires`, `failedLoginAttempts`, `lockoutUntil`, `tokenVersion`, `authProviders[]` (`["password"]`; future `"google"`), `displayName`, `prefs` (theme/defaultView/defaultSort) |
| `refreshTokens` | `userId`, `tokenHash` (SHA-256 of opaque 32-byte CSPRNG token), `family` (rotation lineage), `expiresAt` (**TTL index**), `revokedAt`, `userAgent`, `createdAt` |
| `organizations` | `name`, `ownerId`, `memberIds[]` — dormant until **Phase 5** |
| `spaces` | `ownerId`, `name`, `icon`, `order`, `type` (`personal`/`shared`) |
| `collections` | `spaceId`, `name`, `order`, `collapsed`, `tagIds[]` |
| `tabs` | `collectionId`, `title`, `url`, `faviconUrl`, `starred`, `order`, `description?` (editable in the modal), `linkSlug?` (back-ref to a `to/<slug>` Link) |
| `links` | `slug` (`docs`), `url`, `ownerId`, `tabId?` (set when created from a tab's edit modal) |
| `nextItems` | `text`, `done`, `order`, `sourceTabId?` |
| `notes` | `scope` (`global`/`space`), `spaceId?`, `contentMarkdown` |
| `tags` | `name`, `color` |

**Indexes:** unique `email`; sparse `emailVerifyTokenHash` / `passwordResetTokenHash`; TTL on `refreshTokens.expiresAt`;
`{ ownerId, updatedAt }` on every synced collection (drives delta pulls); unique `{ ownerId, slug }` on `links`;
`{ collectionId, order }` on `tabs`. **All verify/reset/refresh raw tokens are `crypto.randomBytes(32)` (CSPRNG),
base64url, single-use, stored only as a hash.**

---

## 7. UI breakdown (from the screenshots)

**Sign-in is OPTIONAL (decided).** The workspace works fully offline with no account (as in Phase 1); signing in
just turns on cross-device cloud sync. So there is **no blocking auth gate** — instead a "Sign in to sync" entry
point (sidebar/account area) opens `<LoginForm>` / `<RegisterForm>` (the popup shows a compact version). On sign-in,
a `chrome.storage.onChanged` listener flips newtab + popup into "synced" state, and the existing local collections
are stamped with `ownerId` and pushed up (first-login migration). *(Required-gate alternative was rejected.)*

**Three-column workspace** (mirrors `main.png`):
1. **Left sidebar** — `OrgSwitcher`, `SearchTrigger`, `LinksNav`, `NextNav`, `SpaceList` (+add), footer (Upgrade/Invite/Settings/Account).
2. **Center** — `WorkspaceToolbar` (Drag&Drop sort · Tag Filter · **View** · Expand/Collapse · Add Collection · Share) over a `CollectionList`; each `CollectionCard` = collapsible header + `TabGrid` of `TabCard`s.
3. **Right sidebar** — `OpenTabsPanel` of live `chrome.tabs` (current window), each draggable into a collection; "Save session".

**View modes** (Card/Compact/List/Grid) → one `TabList` component switching density via a `viewMode` prop.
**Sort modes** (Drag&Drop/Alphabetical/Starred-To-Top/Date-Created) → a pure `sortTabs(tabs, mode)` helper; "Drag & Drop" persists manual `order`.

**Edit Saved Tab modal** (`edit-saved-tab.png`) — a reusable `<Modal>` + `<EditTabModal>`:
- **Opens via a hover ✎ icon.** Clicking the card navigates (opens the tab's URL); hovering reveals a pencil icon
  that opens the edit modal. *(This is the conventional pattern — click = open, hover ✎ = edit.)*
- **Fields:** `Title` (text) · `Description` (text, maps to the new `tabs.description`) · `URL` rendered as the
  design splits it — a static `URL: {origin}/` heading plus an input pre-filled with the suffix (path+query+hash);
  on save `url = origin + suffix`. If the URL can't be parsed into origin+suffix, fall back to one full-URL input.
- **Toby Link** (`to / <slug>` + **SAVE**, info tooltip, permission notice) — this is the **Links feature**, so it's
  wired in **Phase 3**. In Phase 1 the field renders disabled with a "soon" hint; the rest of the modal is fully live.
- **Footer:** `DELETE` (removes the tab, with confirm) · `CANCEL` (discard) · `DONE` (persist via
  `updateTab(id, patch)`).
- A11y: focus-trap, Escape to cancel, click-outside to cancel, restore focus to the originating card on close.
**Theme** → CSS-variable tokens; `light`/`dark`/accent selectable from settings, persisted to `prefs`.

---

## 8. Auth & sync strategy

### Auth (email/password)
- **Hashing:** argon2id (`@node-rs/argon2`), OWASP baseline params (`mem ≈ 19 MiB, t=2, p=1`), per-hash salt in the
  PHC string. Verify cold-start memory headroom on Vercel; `bcryptjs` is the fallback.
- **Access token:** JWT, ~15 min, signed with `jose`. Pin the verifier to a single algorithm and set `iss`/`aud`
  (prefer **EdDSA** so verifiers hold no signing secret). Payload `{ sub: userId, tv: tokenVersion }`.
- **Refresh token:** opaque 32-byte CSPRNG value, **stored hashed server-side** in `refreshTokens`, **rotating** with
  **reuse detection** (replay of a revoked token → revoke the whole `family`). `tokenVersion` is the global
  kill-switch (password reset / "log out everywhere" bumps it and revokes all rows).
- **Where tokens live:** in `chrome.storage.local`; the **service worker owns the refresh token** and performs silent
  refresh (`chrome.alarms` ~14 min + on-demand 401 retry via a single de-duplicated refresh).
- **Extension UX:** `chrome.identity.launchWebAuthFlow` is OAuth-only and unused here — we render our own forms.

### Security hardening (from adversarial review — these are ship-blockers, baked into the build)
1. **XSS is the top threat (H2).** A strict MV3 `content_security_policy.extension_pages` (no `unsafe-inline`, no
   remote script); **never** `dangerouslySetInnerHTML` synced content; validate every saved URL to `http(s):` (block
   `javascript:`). The **refresh token is held by the service worker, not exposed to the newtab DOM** — a newtab XSS
   then leaks at most a 15-min access token, not a 30-day refresh token.
2. **Consistent revocation (H1).** Resolve the `tokenVersion` window deliberately: no security-sensitive action
   (password/email change, future OAuth linking) is reachable on a stale access token — those re-check `tokenVersion`
   (Upstash-cached) or require a fresh token. Document the 15-min access-token revocation SLA explicitly.
3. **No user-enumeration (H3).** On unknown email, run an argon2 verify against a **fixed dummy hash** so login does
   equal work on both paths; identical generic message + timing; `request-password-reset` always returns `200`.
4. **CSPRNG tokens (H4).** `crypto.randomBytes(32)` for all verify/reset/refresh tokens; single-use; reset also sets
   `emailVerified=true` and invalidates outstanding verify tokens.
5. **Rate limiting (M1/M2).** Upstash Redis with **layered** limits (per-email + per-IP + global), correct Vercel IP
   handling (never trust raw `x-forwarded-for`); prefer backoff/CAPTCHA over hard per-account lockout (lockout alone
   is a victim-DoS lever).
6. **Email-link hygiene (M3).** `/verify` and `/reset` set `Referrer-Policy: no-referrer`, load **zero** third-party
   resources, `history.replaceState` to strip the token from the URL on load, and require an explicit button (no
   auto-POST). Add `X-Frame-Options: DENY`.
7. **Refresh race safety (M5).** A short rotation grace window + persist-new-token-before-returning, so multi-context
   (newtab + popup) or flaky-network refreshes don't mass-log-out a legitimate user.

### Sync engine (local-first)
- **Read:** UI renders instantly from the `chrome.storage` cache, then background **delta pull**
  `GET /api/sync?since=<lastSyncedAt>` (authed) for changed docs.
- **Write:** optimistic apply to cache → enqueue op → batched `POST /api/sync` (authed).
- **Conflicts:** last-write-wins per doc via `updatedAt`; deletes are tombstones (`deletedAt`).
- **Offline:** queue persists in `chrome.storage`, flushes on reconnect; React Query handles retry/backoff.

---

## 9. API surface (Next.js Route Handlers, `runtime = 'nodejs'`)

```
# Auth (public unless noted)
POST   /api/auth/register              # { email, password } → 201 { user, accessToken, refreshToken } + verify email
POST   /api/auth/login                 # → 200 { user, accessToken, refreshToken } | generic 401
POST   /api/auth/refresh               # { refreshToken } → rotated { accessToken, refreshToken }
POST   /api/auth/logout                # (authed) revoke refresh row/family
POST   /api/auth/verify-email          # { token }
POST   /api/auth/request-password-reset# { email } → always 200 (no enumeration)
POST   /api/auth/reset-password        # { token, newPassword } → bumps tokenVersion, revokes all refresh rows
GET    /api/auth/me                    # (authed) hydrate UI
# (future Google OAuth bolts on via authProviders[] — Phase 5)

# Data (ALL authed — Bearer JWT, scoped to ownerId from `sub`)
GET    /api/sync?since=<ts>            # delta pull
POST   /api/sync                       # batched create/update/delete push
GET/POST/PATCH/DELETE  /api/spaces · /api/collections · /api/tabs   # granular CRUD (popup uses these)
GET/POST  /api/links · GET/POST/PATCH /api/next · GET/PUT /api/notes
GET    /api/search?q=...               # server search fallback
```

Each handler: `verifyJwt → zod-validate → repository → typed JSON`. Mongo client is a cached singleton
(`globalThis`-memoized **promise**, small `maxPoolSize`, never `close()`).

---

## 10. Delivery roadmap (phased)

**Phase 0 — Scaffold + de-risk infra.**
Monorepo (pnpm + Turbo), `shared` types/zod, extension Vite/CRXJS build (empty newtab + popup, validate manifest),
Next.js on Vercel with health route, Mongo cached singleton + connection test. **Pull a thin infra slice forward:**
provision Upstash + Resend (verified sending domain), env vars in Vercel, stub `/verify` + `/reset` pages,
**rotate the Atlas demo creds** to a least-privilege user.

**Phase 1 — Local core (fully offline, no account).**
Data model in `chrome.storage`, Spaces sidebar (add/delete), Collections + Tab cards, View/Sort dropdowns, live
Open-Tabs panel, Drag & Drop, Save/Restore session, and the **Edit Saved Tab modal** (Title/Description/URL/Delete
— Toby Link deferred to Phase 3). *Deliverable: a usable single-device tab manager before any auth exists.*

**Phase 2a — Account auth (lean first, decided).** Step 1: `users`/`refreshTokens` collections, all `/api/auth/*`
handlers, `jose` JWT issuance, argon2id, the extension login/register forms + SW silent refresh — with
**unverified login allowed** and **basic in-handler rate limiting** so it's testable end-to-end without DNS/Upstash
setup. Step 2 (fast-follow): **Resend** verify/reset emails + hosted `/verify` `/reset` pages, **Upstash** layered
rate limiting, and the rest of the §8 hardening. Sign-in is optional (see §7).

**Phase 2b — Cloud sync engine.**
`/api/sync` pull/push, local-first sync engine, optimistic writes, offline queue, LWW conflict handling.
*Deliverable: collections follow the user across devices.*

**Phase 3 — Productivity add-ons.** Instant Search (Fuse.js), Links (`to/` omnibox + DNR redirect), Next, Notes, Tags + Tag Filter.

**Phase 4 — Polish & themes.** Light/Dark + accent themes, popup refinement, settings, empty/loading states, keyboard shortcuts.

**Phase 5 — Sharing + OAuth (stretch).** Organizations, shared spaces, member invites/permissions, Google sign-in via `authProviders[]`, and (optionally) the full web dashboard (Option C). *Out of MVP.*

**Phase 6 — Ship.** Icons/store assets, **privacy policy + data-handling disclosure** (storing hashed email/password
raises Web Store review scrutiny), `chrome.storage` migration safety, package & submit; Vercel prod deploy with all
secrets in env.

---

## 11. Web scope — decided: Option B

The Vercel app serves the **JSON API** (`/api/*`, always required) plus a **minimal human-facing web surface**:

- **`/verify` + `/reset`** — required landing pages for email-verification and password-reset links (hardened per §8.6).
- **`/login`** — parity page; also the future entry point if we grow into a web dashboard.
- **simple landing page** — for the Chrome Web Store listing + basic legitimacy.

No full web dashboard for the MVP. Because every page reuses the same `/api/*`, **Option C (a full browser dashboard
mirroring the extension, à la `app.gettoby.com`) is an additive Phase-5 decision, not a rewrite.**

---

## 12. Risks & notes

- **Edge vs Node runtime** — Mongo needs Node; pin `runtime = 'nodejs'` on every DB/auth route as a hard rule.
- **Serverless + Mongo connections** — cached singleton + small `maxPoolSize`; never `close()` in a handler.
- **Rate limiting can't be in-memory** on serverless — Upstash Redis is mandatory for auth throttling.
- **Email deliverability** — verify the sending domain (SPF/DKIM/DMARC) early; spam-foldered verify mail looks like
  "auth is broken." Allow unverified login but rate-limit registration to prevent signup-spam/email-bombing.
- **argon2 native binary** on Vercel — validate the build in Phase 0; `bcryptjs` fallback has a different security
  posture (72-byte cap) — don't swap silently.
- **JWT correctness** — pin `algorithms`, set `iss`/`aud`, small `clockTolerance` for serverless clock skew.
- **`to/<slug>` links** — `declarativeNetRequest` redirect is robust; `chrome.omnibox` keyword ships first.
- **New-tab UX** — render instantly from cache (no blank flash while syncing) — local-first covers this.
- **MV3 service worker** is ephemeral — durable state only in `chrome.storage`, never worker memory.
- **Atlas creds** — the original demo credentials were weak and committed (now redacted; treat as compromised).
  Rotate the DB password to a least-privilege user, keep the URI only in env vars (`apps/web/.env.local` for dev,
  Vercel env for prod), never committed.
```
