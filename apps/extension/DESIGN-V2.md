# VC Tabs — UI revamp v2 (clean, airy, white cards)

Follow the attached mock. **Restyle + add the few new features below; do not break
logic, props, hooks, store calls, or DnD.** Light-mode tokens are already neutral
(warm-gray surfaces, white cards) and dark mode still works — keep both.

## Shared building blocks (use these)
- **`<Monogram label seed? size? radius? fixedColor? />`** (`@/components/Monogram`) — colored
  letter tile. Tabs/open-tabs use the palette (omit `fixedColor`, pass `seed={title}`); spaces use a
  neutral/active colour (`fixedColor`). **Replace `<Favicon>` with `<Monogram>` in tab rows/cards** (the
  mock uses colored letters, not favicons).
- **`<SegmentedControl value segments onChange />`** (`@/components/ui/SegmentedControl`).
- Helpers: `groupTabsBySite`, `filterTabs` (`@/lib/data/group`); `closeTab` (`@/lib/chrome/tabs`).
- `<Button>` / `<IconButton>` as before.

## Visual language
- **Cards = white**: `bg-surface-container-lowest border border-outline-variant rounded-m3-lg shadow-soft
  hover:shadow-soft-hover transition-shadow`. Generous padding.
- Sidebar / open-tabs rails = `bg-surface-container`; center = `bg-surface`.
- Type scale everywhere; titles bold (`font-semibold`/`font-bold`). Hosts in `font-mono body-small text-on-surface-variant`.
- Counts/badges = `rounded-full bg-surface-container-highest px-2 label-small text-on-surface-variant`.
- `viewMode` literals stay `"card" | "list"`. Toolbar labels them **Cards / List**.

## Per component

**App.tsx (center header only — do NOT touch hooks/DnD/bootstrap):**
- Header row: left = space name as a big bold title (`text-[28px] font-bold leading-tight text-on-surface`) with a
  subtitle beside/under it: `"{collectionCount} collections · {savedTabCount} saved tabs"` in
  `body-medium text-on-surface-variant`. Compute `savedTabCount` = tabs whose collection is in this space.
- Right = **`<Button variant="filled">` "New Collection"** (leading `IconPlus`) — calls `addCollection(spaceId, name)`
  via a `window.prompt` (move this action here from the toolbar). Keep the `<WorkspaceToolbar>` row below the header.

**WorkspaceToolbar.tsx:** remove the sort dropdown AND the Add-Collection button. Left-aligned row:
`<SegmentedControl>` (Cards=`IconCard`, List=`IconList`; value=`viewMode`, onChange=`setViewMode`) then
**Expand all** / **Collapse all** as `m3-btn-text` buttons (`setAllCollapsed`).

**Sidebar.tsx:**
- Org header: green `V` tile (`bg-primary text-on-primary rounded-lg`) + name (`title-medium`) + trailing
  `IconChevronsUpDown` (text-on-surface-variant) as an org switcher affordance.
- Search: keep bound to `searchQuery`; placeholder "Search everything"; leading search icon; trailing **⌘K** kbd
  badge (`rounded bg-surface-container-highest px-1.5 label-small text-on-surface-variant`).
- To/Links + Next: green tonal **Soon** badge (`bg-primary-container text-on-primary-container rounded-full px-2 label-small`).
- Space rows: a neutral **`<Monogram label={space.name} size={24} fixedColor={...}/>`** — active →
  primary green (`rgb(var(--m-primary))` via a hex, or pass `fixedColor` = the green), inactive → a grey
  (`#6b7280`/on-surface-variant). Then name, then a right-aligned **collection count** for that space
  (`body-small text-on-surface-variant`). Active row bg `bg-surface-container-high`. Keep delete-on-hover.
  *(The count = number of collections whose `spaceId === space.id`; compute from the workspace store.)*
- Footer: `VC Tabs · 0.2`. Keep `<AccountSection/>`.

**CollectionCard.tsx:** header = collapse chevron `IconButton` + name (`title-medium font-semibold`) + count badge +
on the FAR right an **add-tab `+` IconButton** (always visible) and a delete `IconButton` on hover (`hover:text-error`).

**TabCard.tsx:** replace Favicon with `<Monogram label={tab.title} size={isRow?24:36}/>`.
- **card** view = big white card (the card classes above), `px-4 py-3.5`, `gap-3`: Monogram · (title
  `title-small font-semibold` + host `font-mono body-small text-on-surface-variant`) · right side an **open**
  `IconButton` (`IconExternal`, calls `openUrl`) always visible; on hover also reveal **edit** (`IconPencil`) and
  **delete** (`IconTrash`, `hover:text-error`). Card body click still `openUrl`. Keep the grip drag handle (subtle).
- **list** view = compact row: smaller monogram (24), `px-3 py-2`, tighter.

**TabList.tsx:** card → `flex flex-col gap-2.5`; list → `flex flex-col gap-1`. Empty target = dashed
`border-outline-variant rounded-m3-lg` on white.

**OpenTabsPanel.tsx (new features):**
- Header: `OPEN TABS` (`label-medium uppercase`) + count badge + refresh `IconButton`.
- `<Button variant="tonal">` "Save session" full width.
- **Filter field** (local `useState`): rounded-full `bg-surface-container-highest`, leading search icon,
  "Filter open tabs…", filters via `filterTabs`.
- A line: a small star icon + `"Auto-grouped by site — {n} groups"` (`body-small text-on-surface-variant`).
- **Group the (filtered) tabs with `groupTabsBySite`.** Each group is collapsible (local `Set<string>` of
  collapsed hosts): header = chevron + `<Monogram label={host}/>` + host (`body-medium`) + count (right). When
  open, each tab row = `<Monogram label={title}/>` + title (truncate) + hover **`+`** (quick-save, existing) and
  **`×`** (`closeTab(tab.id)` then `refresh()`) `IconButton`s. Keep each tab row **draggable** (the existing
  `useDraggable` wiring) so drag-into-collection still works.

Keep everything keyboard-accessible (the `.m3-*` classes already include focus rings).
