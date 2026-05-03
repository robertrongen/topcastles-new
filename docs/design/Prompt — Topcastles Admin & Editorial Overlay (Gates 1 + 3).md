# Prompt — Topcastles Admin & Editorial Overlay (Gates 1 + 3)

This prompt covers the **visual** implementation of the Admin shell, the Admin login, and the Editorial overview index. Source-of-truth mockup: `Topcastles Admin Mockups.html` (two artboards on a design canvas — login at 1280×800, shell + overview at 1440×900). Where this prompt and the existing Topcastles style guide disagree, the **style guide wins** — these screens are an annex of the public atlas, not a separate product.

This prompt is **scoped to the visual layer**: shell chrome, login screen, and the overview index. It does **not** cover the write API (Gate 2), per-file editors (Gate 4), or pipeline integration (Gate 5). Stop at the gate boundaries the spec defines.

---

## Workflow

Follow the Topcastles prompt workflow: **Bead → Graphify → Context → Implementation → Verification → Closure**. Because this is admin UI, use the fuller Spec Kit flow: bead first, Graphify first, context bundle first, then clarify → plan → tasks → analyze before coding.

Approval gates apply. Do not run past a gate without stopping and reporting.

| Gate | Bead | Scope of this prompt |
|---|---|---|
| 1 | `topcastles-1tt` | Admin shell, login, protected `/admin`, signed-in chrome, side nav |
| 3 | `topcastles-46h` | `/admin/editorial` overview index — the file table + ledger strip + prerender notice + recent-edits log |

Gate 2 (write API) and Gate 4 (per-file editors) are **out of scope** for this prompt. So is Gate 5.

---

## Prerequisites

- Admin auth pattern in `server/routes/admin.js` exists; reuse `adminAuth` middleware. Do not invent a new auth path.
- Admin token is stored under a localStorage key **distinct** from the user-facing one. Suggest `topcastles.admin.token`.
- Admin nav must be hidden from regular users — gate the `Editorial` tab on token presence.
- The overview reads existing JSON via the public `/api/editorial/:file` endpoints already whitelisted in `server/routes/editorial.js`. Missing files return `{}`. Do not write through this endpoint — writes belong to Gate 2.

---

## Design tokens (mirror the public dark theme)

These are already defined for the public site. Reuse, do not redeclare. Names map to the mockup CSS:

```
--ink-bg       #0F1310    page surface
--ink-bg-2     #161B17    side nav, deep inset
--ink-card     #1B211C    table-row hover, callout fill
--ink-line     #2A312B    1 px hairline
--ink-line-2   #3A4239    card / input border

--text-1       #F1ECDD    headings
--text-2       #DCD3BB    body
--text-3       #C4BAA0    italic body
--text-4       #9A9275    caption / muted body
--text-5       #786F55    TH labels, footnotes
--text-6       #555B4A    timestamps

--ochre        #C9863F    accent, active rule, primary button
--ochre-soft   #A8702E    secondary accent
--heraldic-red #B5432B    prerender notice left rule, sleeper, errors

--olive-nav    #1F2A1A    nav band background
--olive-nav-fg #ECE3CD    nav text
```

Typography: Source Serif 4 for headings/prose, Inter for chrome/labels, JetBrains Mono for paths and keys. **No new fonts.** Square corners everywhere — no `border-radius`. Decorative iconography is forbidden in body content (parent guide §13).

---

## Gate 1 — Admin shell chrome

### Three layers, top to bottom

1. **Utility bar** (28 px tall, `#0A0D0B`, only when signed in)
   - Left: ochre `EDITOR` badge (1 px ochre border, 10 px caps `.14em`)
   - Inline label: "Editorial annex — unbound copy" (12 px `--text-4`)
   - Right: signed-in-as line — `Name · signed in HH:MM GMT · Sign out`
   - Hide entirely for unauthenticated users.

2. **Public masthead** — unchanged from the public site. Search input placeholder switches to "Search editorial keys — country, region, castle code…" when on `/admin/*`.

3. **Public olive nav band** — append an **Editorial** tab on the right side of the primary tabs (before the utility-icon cluster). Render only when admin token is present. Active state uses the standard 2 px `--ochre` underline.

### Side nav (admin pages only)

- 220 px wide, `--ink-bg-2` background, 1 px right hairline.
- Group label "EDITORIAL OVERLAY" (10 px caps `.16em`, `--text-5`), then six links: Overview, Countries, Regions, Castle quotes, Period picks, Browse bands. Each with:
  - Small hairline glyph (1.5 stroke, 16×16) — drawn as inline SVG, no icon library.
  - Right-aligned `count` (`2/56`, `2`, etc.) in JetBrains Mono `.04em`, `--text-5`. Active row's count uses `--ochre`.
  - Active row: 3 px ochre left rule, `--ink-card` background, `--text-1` label.
- Divider, then "REFERENCE": Backups, Schema, API reference.

### Routing

- `/admin/login` — public.
- `/admin/*` — protected. Redirect unauthenticated to `/admin/login`. Redirect authenticated away from `/admin/login` to `/admin/editorial`.
- The `Editorial` nav tab points at `/admin/editorial`.

### Verify

- `/api/admin/...` rejects missing/invalid Bearer tokens with 401.
- The Editorial tab does not render in the public site for an unauthenticated visitor.
- The admin token lives at `topcastles.admin.token`, separate from any public-user token.

**Stop and report after Gate 1.**

---

## Gate 1 — Admin login (`/admin/login`)

Two-pane layout, 1280 px reference width, full-bleed.

### Left pane (50 % width, `--ink-bg-2`)

- Quiet engraved silhouette of a generic keep + compass rose, `--ink-line-2` strokes at ~35 % opacity. **Inline SVG, do not source an external image.** The mockup has the exact paths.
- Top: "PLATE 00 · EDITORIAL ANNEX" eyebrow (10.5 px caps `.16em`, `--text-5`).
- Plate block:
  - "VOL. XXII · 2026" plate number (10.5 px caps `.14em`).
  - `<h1>` "The editorial annex." — 56 px Source Serif 600, `text-wrap: balance`.
  - Italic subtitle, 17 px / 1.55, `--text-3`, max 480 px.
- Bottom: small italic footnote about pipeline ownership (the overlay is editor-owned, not pipeline-written).

### Right pane (460 px fixed)

- Top row: 22 px wordmark on the left, "Public atlas →" link on the right (11 px caps `.12em`, `--text-4`).
- 60 px vertical gap.
- `<h1>` "Editor's sign in" — 28 px Source Serif 600 with 2 px ochre rule constrained to text width.
- Italic lede, 14 px / 1.55, `--text-4`.
- Form fields: **Editor handle**, **Passphrase**.
  - Label: 10.5 px caps `.14em`, `--text-5`.
  - Input: full width, `--ink-bg-2` background, 1 px `--ink-line-2`, padding 11×12, square corners, no float-label animation.
  - Focus: border switches to `--ochre`, background to `--ink-card`.
- Row: "Trust this device for 7 days" checkbox (typographic, 14 px square box, ochre tick when on) + "Reset →" link on the right.
- Primary button: `--ochre` fill, near-black text, full width, 13 px caps `.12em`, "Open the annex". Square corners.
- "Last session" ledger block (italic 12 / 1.6, `--text-5`) below a 1 px `--ink-line` divider — populate from the most recent backup log entry.
- Foot: API path note, 11 px Mono, `--text-6`.

### Behaviour

- Submit POSTs to the existing admin auth endpoint. On 200, store the bearer at `topcastles.admin.token` and redirect to `/admin/editorial`.
- On 401, render a single inline error below the passphrase: italic 13 px Source Serif, `--heraldic-red`. Do not use a toast.
- On network error, render the same inline error with a generic message.
- "Trust this device for 7 days" sets a longer-lived storage flag — implementation detail; UI just persists the checkbox state.
- Disable the button while in flight; do not show a spinner — switch the label to "Opening…" in the same caps tracking.

---

## Gate 3 — Editorial overview (`/admin/editorial`)

Single column inside the side-nav shell, 36 px main padding.

### Top of page

1. **Crumbs** — `Editorial annex › Overview` (11 px caps `.10em`, `--text-5`; chevron in `--text-6`; current segment `--text-2`).
2. **Page head** — `<h1>` "Editorial overlay" (32 px Source Serif 600), 2 px ochre underline below the whole row, italic meta on the right (max 380 px, right-aligned).
3. **Lede** paragraph — 15 px Source Serif / 1.6, `--text-3`, max 64 ch. The mono code chip uses JetBrains Mono with `--ink-bg-2` fill + `--ink-line-2` border.

### Prerender notice

A single persistent callout. Two-column grid (`1fr auto`), 18 px padding, `--ink-card` fill, 1 px `--ink-line-2` border, **3 px `--heraldic-red` left rule**.

- Left:
  - Eyebrow `PRERENDER NOTICE` — 11 px caps `.14em`, `--heraldic-red`.
  - Italic body, 13.5 / 1.55, `--text-2`.
- Right:
  - `LAST BUILD` eyebrow (10.5 caps `.14em`).
  - Date + GMT time in Source Serif 600.
  - Relative ago (e.g. "4 days, 5 hours ago") in `--text-5`.

This must render on every editorial page (overview + the per-file editors when they ship in Gate 4). It is **not dismissible**.

### Ledger strip

A 4-column grid with single 1 px `--ink-line` borders between cells (no rounded corners, no fill). Each cell:

- 14 px caps `.14em` label, `--text-5`.
- 22 px Source Serif 600 value with optional `unit` span (12 px `--text-5` after a 2 px gap).
- Italic 11.5 px sub, `--text-4`.

Cells, in order:

1. **Files** — `5 / 5 present` · "all five overlays initialised"
2. **Keys recorded** — total count across all five files · "across countries, regions, quotes, picks, bands"
3. **Coverage** — `(populated countries / total countries) × 100`% · "of catalogued countries with editorial notes"
4. **Backups on disk** — count from `/data/editorial/backups/` · "oldest <date> · prune manually"

The values are derived from the five `/api/editorial/*` reads + a new admin read for the backups directory listing (or hardcode 0 in this gate if the backups list isn't wired yet — note the gap in your report).

### Files table

`<h2 class="sec-head">` "Files" — 22 px Source Serif 600 with a constrained 1 px ochre rule (`width: max-content`), italic 13 px subtitle below, max 64 ch.

Five-column table, hairline rows top and bottom of each row:

| Col | Width | Content |
|---|---|---|
| № | 36 px | `01`–`05` in Inter 12 px tabular nums, `--text-5` |
| File | 30% | `<a>` name in 15 px Source Serif 600 `--text-1` (hover → `--ochre`); 11 px Mono path on second line, `--text-5` |
| Editor's purpose | flex | Italic 13 / 1.55, `--text-3`, `text-wrap: pretty` |
| Keys | 110 px | Big serif number `--text-1` + caps label `--text-5` (e.g. `2  OF 56`) |
| Last edited | 110 px | Timestamp on top (`--text-2` 500 weight), author below in `--text-5` 11.5 px |
| Open | 90 px right-aligned | `Open →` link in `--ochre`, hover `--text-1` |

Row hover: 1.5% white overlay. Click anywhere on the row routes to `/admin/editorial/<file>`. The route itself is a Gate-4 concern; for Gate 3 it can render a placeholder "Editor coming in next gate" page so the routing is complete.

The **fixed display order and copy** for the five rows:

1. **Countries** — `/data/editorial/countries.json` — "A short characterising note and defining tradition for each country in the index. Marks editorial sleepers — countries scored high by editors and low by visitors."
2. **Regions** — `/data/editorial/regions.json` — "One-sentence descriptions of named architectural regions — e.g. the Middle Rhine, the Castilian Frontier — and their editorial sleeper flag."
3. **Castle quotes** — `/data/editorial/castle-quotes.json` — "Editor pull-quotes about specific castles, with byline and date. The optional *featuredUntil* field overrides the homepage featured entry until the date passes."
4. **Period picks** — `/data/editorial/period-picks.json` — "Editor's pick castle for each century in the period table. Rendered as a starred italic entry in the period gazetteer column."
5. **Browse bands** — `/data/editorial/browse-bands.json` — "A short editor's note above each rank band on the Top 1000 browse page (1–100, 101–500, 501–1000)."

Use these strings verbatim. Italics are real `<em>` tags.

If a file's API response is `{}`, render its keys cell as `0` in `--text-5` and append a small caps `EMPTY` badge (1 px `--ink-line-2` border, 9.5 px caps `.12em`, `--text-5`) after the file name. Do not break the row.

### Recent edits

`<h2 class="sec-head">` "Recent edits" + italic subtitle "Last six entries from the per-file backup log."

A bordered list (1 px `--ink-line` outer, 1 px `--ink-line` row dividers; no fill). Each row is a 4-column grid:

| Col | Width | Content |
|---|---|---|
| When | 110 px | 11.5 px JetBrains Mono, `--text-4` (e.g. `02 May · 14:47`) |
| What | flex | `<file-tag>` chip + italic verb phrase + key chip |
| Who | 90 px | Italic 12.5 px Source Serif, `--text-4` |
| Action | 120 px right | "Open backup →" link in `--ochre` |

- File tag chip: 1 px `--ink-line-2`, 10 px caps `.10em`, `--text-3`, `--ink-bg-2` fill.
- Key chip: JetBrains Mono 12 px, `--text-1`, `--ink-bg-2` fill, 1 px `--ink-line-2` border.

Source: most recent six entries derived from `/data/editorial/backups/` filenames (`<file>-<timestamp>.json`). The "verb phrase" is computed from a diff between the backup and the current file; if diffing is too much for this gate, render the simpler "wrote backup of <file>" and note the gap.

### Footer

48 px above-margin, 1 px top hairline, italic 12 px caption left ("Editorial annex — unbound copy. Topcastles vol. XXII · 2026."), Mono 11 px right showing the API path + a short build hash from `process.env`.

---

## Empty / first-time states

- **No backups yet** — `Backups on disk` cell shows `0`, sub reads "no backups yet — first save will create one". The "Recent edits" section is replaced by a single italic line: "No editorial edits yet. Open a file to begin." Centered, `--text-4`, 14 px Source Serif italic, on plain paper. No empty-state illustration.
- **All five files return `{}`** — `Coverage` cell shows `0%`, sub reads "no editorial notes yet". Rows still render with `EMPTY` badges.
- **API error fetching a file** — render the row with a single inline error in the keys cell: caps 10 px `--heraldic-red` "FETCH ERROR". Do not fail the whole page.

---

## Accessibility

- All interactive elements reachable by keyboard; visible focus is a 2 px `--ochre` outline (no shadow).
- The signed-in chip in the utility bar is a real `<button>` that toggles a sign-out menu (or routes directly — implementer's choice). Make it focusable.
- The prerender notice is `role="note"` with `aria-label="Prerender publishing notice"`.
- Tables use real `<table>` / `<thead>` / `<tbody>` with column headers. Sort affordances are not in scope for this gate.
- Colour contrast: `--ochre` on `--ink-bg` passes AA at 14 px+. `--text-5` on `--ink-bg` is for ≥10 px caps only.

---

## Anti-patterns — do not introduce

- ❌ No `border-radius`. Square corners everywhere.
- ❌ No purple, lavender, periwinkle, or blue tints. The system has no cool accent.
- ❌ No Material-style icons or floating-label inputs.
- ❌ No toast confirmations for the login error or for save success — use inline messages keyed to the action.
- ❌ No new font families. No emoji.
- ❌ No fork of the public site's CSS tokens — import them.
- ❌ Do not write to `/data/editorial/` from this gate. Reads only.
- ❌ Do not modify any pipeline script.

---

## Required verification per gate

Per the spec:

- `npm test`
- `npm run build`
- `npm run test:smoke`
- `node server/routes/editorial.test.js`

Manual curl checks (Gate 1):

- Missing/invalid admin token returns 401 on every `/api/admin/...` route.
- Public `/api/editorial/:file` for a missing file returns `{}` with 200.

Visual verification (Gate 1 + Gate 3):

- Open the design canvas mockup in `Topcastles Admin Mockups.html` and confirm the live build matches the artboards at the same widths (1280 for login, 1440 for shell). Pixel-perfect is not required; rhythm and hierarchy are.
- Confirm the Editorial nav tab is **not present** in a logged-out browser session.
- Confirm the prerender notice renders on the overview page and is not dismissible.

---

## Closure

- Close only the bead completed in the current gate (`topcastles-1tt` after Gate 1; `topcastles-46h` after Gate 3).
- `git pull --rebase`
- `bd dolt push`
- `git push`
- `git status`
- Confirm the working branch is clean and up to date with origin.
- **Stop and report** before opening the next gate. Do not roll Gate 1 + Gate 3 into a single PR — they are separate beads and should land as separate, reviewable commits.


# Summary

**Top of file** — workflow + gate scope. Names beads topcastles-1tt (Gate 1) and topcastles-46h (Gate 3). Explicitly carves out Gates 2, 4, 5 as out of scope so it doesn't run past the approval boundary.

**Prerequisites** — token storage at topcastles.admin.token (distinct key), reuse of existing adminAuth middleware, read-only access via the existing public /api/editorial/:file endpoints.

**Design tokens block** — full token list mapped to mockup CSS, with the line "reuse, do not redeclare." All hex values match the public site.

**Gate 1 — shell** — three layers (utility bar, masthead, olive nav with new Editorial tab), 220 px side nav with the six file links + counts + glyphs, routing rules including auth redirects.

**Gate 1 — login** — pixel spec for both panes, including the engraved-keep SVG instruction (inline only, no external image), inline-error pattern (italic Source Serif --heraldic-red, no toast), button states.

**Gate 3 — overview** — section-by-section: crumbs → page head → lede → prerender notice (verbatim copy) → ledger strip (formulas for each cell value) → files table (verbatim copy for all five rows, with italic markup spelled out) → recent edits (sourced from backup filenames; fallback to "wrote backup of <file>" if diffing is out of scope).

**Empty / error states** — three explicit cases, no surprise behaviours.

**A11y + anti-patterns** — short, concrete: no border-radius, no purple, no Material icons, no toast confirmations, square focus outlines.

**Verification** — picks up the spec's npm test / npm run build / npm run test:smoke / editorial test suite, plus manual curl checks and a visual cross-check against the canvas mockup.

**Closure** — the spec's exact close-the-bead sequence, with an explicit instruction not to combine the two gates into one PR.