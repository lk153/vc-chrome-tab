# VC Tabs — Material 3 (Emerald · Expressive) UI guide

Single source of truth for the M3 revamp. **Restyle only — never change component
logic, props, hooks, store calls, or handlers.** Swap Tailwind classes / markup
structure to the M3 vocabulary below. Keep all imports valid (drop ones you stop
using; add `Button`/`IconButton` where useful).

## Tokens (Tailwind classes)

Colour roles (theme-aware, light+dark auto): `bg-primary text-on-primary`,
`bg-primary-container text-on-primary-container`, `bg-secondary-container
text-on-secondary-container`, `bg-tertiary-container text-on-tertiary-container`,
`text-error bg-error-container`, surfaces `bg-surface`, `bg-surface-container-low`,
`bg-surface-container`, `bg-surface-container-high`, `bg-surface-container-highest`,
text `text-on-surface` / `text-on-surface-variant`, lines `border-outline` /
`border-outline-variant`.

**State layers:** interactive surfaces get `hover:bg-on-surface/[0.08]` (or
`hover:bg-primary/[0.08]` on primary-tinted controls). Selected nav/menu items use
`bg-secondary-container text-on-secondary-container`.

**Shape:** `rounded-m3-xs|sm|md|lg|xl` (4/8/12/16/28px) and `rounded-full`.
Cards = `rounded-m3-lg`; dialogs = `rounded-m3-xl`; buttons/chips/nav = `rounded-full`.

**Elevation:** `shadow-m3-1|2|3`. Tonal surfaces (surface-container-*) preferred
over borders for separating areas.

**Type scale (classes):** `headline-small title-large title-medium title-small
body-large body-medium body-small label-large label-medium label-small`. Use these
instead of `text-sm/font-*` for anything textual.

## Reusable components / classes

- `<Button variant="filled|tonal|outlined|text|fab">` (`@/components/ui/Button`).
- `<IconButton label="…">` for icon-only actions (`@/components/ui/IconButton`).
- Class helpers: `.m3-chip` (toolbar chips), `.m3-field` (text inputs),
  `.m3-nav-item` + `.m3-nav-item-active` (drawer items), `.m3-menu` (used by Dropdown).
- `Dropdown` and `Modal` are already M3-styled — keep using them.

## Per-component intent

- **Sidebar** → an M3 **navigation drawer**: `bg-surface-container-low`, no hard
  border. Space rows use `.m3-nav-item` (+ `.m3-nav-item-active` when selected,
  showing the delete `IconButton` on hover). Org header uses `title-medium`.
  "Spaces" overline = `label-medium uppercase text-on-surface-variant`. Footer
  theme toggle = `IconButton`. The To/Links & Next stubs stay as disabled nav rows
  with a small tonal "Soon" chip.
- **SearchBar** → M3 filled search field: `bg-surface-container-highest rounded-full`
  h-12, leading search icon, trailing clear `IconButton`, `body-large` text.
- **WorkspaceToolbar** → title `headline-small`; sort/view triggers as `.m3-chip`
  with a trailing chevron; Expand/Collapse as `.m3-chip`; "Add Collection" as a
  **`<Button variant="fab">`** (extended FAB) or filled button with a leading +.
- **CollectionCard** → section header: collapse `IconButton`, name `title-medium`,
  count in a small `bg-secondary-container text-on-secondary-container rounded-full`
  badge; hover actions as `IconButton`s.
- **TabCard / TabList** → each tab is an M3 **filled card**:
  `bg-surface-container-high rounded-m3-lg`, no border, `hover:shadow-m3-1` + subtle
  state layer; title `body-medium`/`title-small`, host `body-small text-on-surface-variant`;
  grip / pencil / star / delete as small `IconButton`s revealed on hover. The empty
  drop target uses a dashed `border-outline-variant rounded-m3-lg`.
- **OpenTabsPanel** → `bg-surface-container-low`; "Open Tabs" overline =
  `label-medium uppercase`; "Save session" as `<Button variant="tonal">` full width;
  rows are list items with `rounded-full hover:bg-on-surface/[0.08]`, quick-save as
  `IconButton`.
- **EditTabModal** → labels `body-small text-on-surface-variant`; inputs `.m3-field`;
  DELETE = `<Button variant="text">` with error tint (`text-error`); CANCEL =
  `<Button variant="text">`; DONE = `<Button variant="filled">`. Header favicon in a
  `rounded-m3-md bg-surface-container-highest` tile. Keep the disabled Toby Link row.
- **popup/App** → compact M3: `bg-surface` container, `.m3-field` select, primary
  `<Button>`s, current-tab tile `bg-surface-container-high rounded-m3-md`.

Keep density reasonable (this is a dense productivity app) but lean into M3:
rounded shapes, tonal surfaces over borders, state layers, and the type scale.
