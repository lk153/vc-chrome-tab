# VC Tabs — Chrome Web Store listing copy

Paste-ready content for the Developer Dashboard. Written to the Chrome
"great listing page" guidance (clear title, ≤132-char summary, overview +
feature list, no superlatives, no keyword spam, accurate). Keep it in sync with
the extension's actual behavior and `PRIVACY.md`.

---

## Title
```
VC Tabs — Tab Manager
```

## Summary (≤ 132 characters — this one is 124)
```
Save, organize, and restore your open tabs into Spaces and Collections — clear the clutter, with optional cross-device sync.
```

## Category
Productivity

## Language
English

---

## Detailed description (paste into "Description")

```
Drowning in open tabs? VC Tabs turns tab chaos into a calm, organized workspace. Save the tabs you care about into Collections, close the clutter, and bring everything back with a single click — without ever losing your place.

VC Tabs replaces your New Tab page with your own workspace: a sidebar of Spaces, your Collections of saved tabs, and your live open tabs side by side. It's local-first and free — everything works instantly on your device, no account needed. Sign in only if you want your tabs to sync across computers.

WHAT YOU CAN DO
• Save any open tab into a Collection — or snapshot your whole window as a session in one click.
• Organize with Spaces and Collections: a tidy hierarchy for Work, Personal, Research, Reading — whatever fits how you think.
• Reopen instantly: open a single tab, or "Open all" to restore an entire Collection.
• Drag and drop tabs between Collections, reorder them, and switch between Card and List views.
• Find anything fast with the ⌘K / Ctrl+K command palette — search every Space, Collection, and saved tab at once.
• Rename saved tabs and add your own notes so you remember why you kept them.
• Clean light and dark themes.

WHY YOU'LL LOVE IT
• Free up memory and focus — close 30 tabs and keep them one click away.
• Never lose a tab again — your research and reading list are saved, not buried.
• Pick up where you left off — restore a whole project's tabs in a second.
• Optional sync — sign in to carry your Collections across devices. Off by default.

HOW IT WORKS
VC Tabs reads the title and URL of your open tabs only when you choose to save them, and shows each site's icon using Google's public favicon service. Your data stays on your device unless you sign in for sync. No ads, no analytics, no tracking — ever.

Privacy policy: https://vc-chrome-tab-extension.vercel.app/privacy
VC Tabs' use of data adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements.
```

---

## Privacy practices tab

**Single purpose**
```
VC Tabs is a tab manager that lets users save their open browser tabs into named Spaces and Collections, then reopen them individually or as a group. Users can optionally sign in to sync their saved collections across devices; the extension is fully functional offline without an account.
```

**Permission justifications**
- `tabs`:
  ```
  Read the title and URL of the user's open tabs so they can save selected tabs (or a whole session) into a collection, and reopen saved tabs when restoring a collection or session. Used only on explicit user action; no background browsing tracking.
  ```
- `storage`:
  ```
  Persist the user's spaces, collections, saved tabs, and UI preferences locally (chrome.storage.local), plus the sign-in session when the user opts into sync.
  ```
- Host permission `https://vc-chrome-tab-extension.vercel.app/*`:
  ```
  Communicate with our first-party sync API to sign in and back up / restore the user's collections across devices. Contacted only when the user chooses to sign in; no other sites are accessed.
  ```
- Remote code: **No, I am not using remote code.**

**Data usage — collected**
- Personally identifiable information (email)
- Authentication information (password / session tokens)
- Web history (saved tab URLs + titles)
- Location (IP — used only for rate-limiting)

**Certify all three:** not sold/transferred outside approved use; not used for unrelated purposes; not used for creditworthiness/lending.

**Privacy policy URL**
```
https://vc-chrome-tab-extension.vercel.app/privacy
```

---

## Additional fields (build trust)
- **Homepage / website:** `https://vc-chrome-tab-extension.vercel.app`
- **Support:** an email or a support page (e.g. `vietnguyen148@gmail.com`, or a GitHub issues URL if the repo is public).

---

## Images

### Store icon (128×128)
`apps/extension/public/icons/icon128.png` — emerald briefcase mark, simple and on-brand (no UI/screenshots inside — ✓ per guidance).

### Screenshots (1280×800, full-bleed — upload all 4; a 5th is recommended)
Use these captions (the dashboard lets you caption each):
1. `store-assets/vc-tab-1-1280x800.png` — "Your tabs, organized into Spaces and Collections"
2. `store-assets/vc-tab-2-1280x800.png` — "Find any tab instantly with the ⌘K command palette"
3. `store-assets/vc-tab-3-1280x800.png` — "Looks great in light and dark themes"
4. `store-assets/vc-tab-4-1280x800.png` — "Optional sync — your Collections on every device"
5. (recommended) capture the save flow: dragging / "+" an open tab into a Collection — "Save any open tab in one click"

### Promotional images
- **Small promo tile:** `store-assets/vc-tab-promo-440x280.png` (440×280).
  **IMPORTANT — upload this one.** It is the image shown on the left of every
  homepage / category / **search-results** row. Without it, the store falls back
  to your 128px icon centered on a white card (lots of empty space); competitors
  who upload a tile get a full-bleed image and look more polished.
- **Marquee:** `store-assets/vc-tab-marquee-1400x560.png` (1400×560) — used only
  if the item is chosen for the featured carousel. Optional but cheap to include.

Both are pre-rendered (full-bleed emerald, real icon, brand font, minimal text —
per guidance: saturated color, fill the region, no "#1 / Editor's Choice" claims).
Regenerate anytime with `make promo` (edits go in `_render-tile.html` /
`_render-marquee.html`).
