# Admin & Editorial Overlay — Implementation Spec (Gates 1 + 3)

Design stabilization pass. Resolves ambiguities in the original prompt, corrects token discrepancies, defines all component primitives, and specifies every interaction state. An engineer should be able to implement Gates 1 and 3 from this document alone, without referring back to the prompt or guessing.

---

## 0. Critical corrections before reading further

### 0.1 Token palette mismatch — the prompt is wrong, use these values

The original prompt specifies green-tinted dark hex values (e.g. `--ink-bg #0F1310`). The live codebase uses a navy/blue-tinted dark palette and a warm-cream light palette. **The style guide wins**; use the values below, taken verbatim from `new_app/src/styles.scss`.

The admin shell renders **dark-only** regardless of system preference. Apply `data-theme="dark"` to the outermost admin shell component host. Do not let the OS light/dark toggle affect the annex.

| Token | Dark value (use this) | Prompt had (wrong) |
|---|---|---|
| `--ink-bg` | `#0E1320` | `#0F1310` |
| `--ink-bg-2` | `#0B101C` | `#161B17` |
| `--ink-card` | `#141B2C` | `#1B211C` |
| `--ink-line` | `#1D2434` | `#2A312B` |
| `--ink-line-2` | `#2A3550` | `#3A4239` |
| `--text-1` | `#F2EAD3` | `#F1ECDD` |
| `--text-2` | `#E8E2D2` | *(same)* |
| `--text-3` | `#C5C0AF` | `#C4BAA0` |
| `--text-4` | `#9AA8BD` | `#9A9275` |
| `--text-5` | `#7A8AA0` | `#786F55` |
| `--text-6` | `#5E6A82` | `#555B4A` |
| `--ochre` | `#C9863F` | *(same)* |
| `--ochre-soft` | `#C9B98F` | *(same)* |
| `--heraldic-red` | `#A8331E` | `#B5432B` |

### 0.2 Token name corrections

The prompt uses names that do not exist in the live codebase. Map as follows:

| Prompt name | Live token name |
|---|---|
| `--olive-nav` | `--nav-bg` (`#1F2A1A`) |
| `--olive-nav-fg` | `--nav-fg` (`#ECE3CD`) |

---

## 1. Annotated mockups — section by section

### 1.1 Utility bar (Gate 1, shell chrome)

**Layout:** Single row, `height: 28px`, `background: #08090A` (one step darker than `--ink-bg`; use this literal value — no token for it). Padding: `0 24px`. Flex, `align-items: center`, `justify-content: space-between`.

**Left cluster** (flex row, `gap: 12px`, `align-items: center`):
- `EDITOR` badge: `border: 1px solid var(--ochre)`, `padding: 2px 6px`, `font: 600 10px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .14em`, `color: var(--ochre)`. No background fill. No border-radius.
- Inline label: `"Editorial annex — unbound copy"`, `font: 400 12px/1 "Inter"`, `color: var(--text-4)`. Render as plain `<span>` — not italic, not Source Serif.

**Right cluster** (flex row, `gap: 8px`, `align-items: center`):
- Signed-in text: `"Name · signed in HH:MM GMT"`, `font: 400 12px/1 "Inter"`, `color: var(--text-5)`. The name portion is `--text-3`.
- `·` separator is `--text-6`.
- Sign out: `<button>` element, `font: 400 12px/1 "Inter"`, `color: var(--text-4)`, `text-decoration: underline`, no background, no border, `cursor: pointer`. On hover: `color: var(--ochre)`. On focus: 2 px `--ochre` outline, no box-shadow.

**Visibility rule:** `*ngIf` on token presence in `localStorage.getItem('topcastles.admin.token')`. This element must not render at all in DOM when unauthenticated — not `visibility:hidden`, not `opacity:0`. Remove from DOM.

**HH:MM GMT format:** Use `Intl.DateTimeFormat` with `timeZone:'UTC'`, format as `HH:MM`, append literal ` GMT`. Store login time in localStorage alongside the token.

---

### 1.2 Public masthead (Gate 1)

The masthead component is **not modified** for admin pages. One exception:

- When the current route starts with `/admin/`, the search input placeholder switches to `"Search editorial keys — country, region, castle code…"`. Do this via an Angular route-aware service injecting into the masthead, or via `@Input()` on the masthead component. Do not fork the masthead component.

---

### 1.3 Olive nav band — Editorial tab (Gate 1)

The nav band is `background: var(--nav-bg)` (`#1F2A1A`). Tabs use `color: var(--nav-fg)` (`#ECE3CD`).

**Editorial tab** appended to the right of the primary tabs (before the utility-icon cluster — save, map, etc.):
- Label: `"Editorial"`, same Inter font and sizing as existing nav tabs.
- Visible only when `localStorage.getItem('topcastles.admin.token')` is non-empty. Use `*ngIf` — not `display:none`.
- Active state: `border-bottom: 2px solid var(--ochre)`. The underline rule is 2 px, `--ochre`, flush to the nav band's bottom edge.
- Inactive hover: `background: var(--nav-bg-hover)` (already defined in `styles.scss` as `color-mix(in srgb, var(--nav-fg) 8%, transparent)`).
- Points to `/admin/editorial`.

---

### 1.4 Side nav (Gate 1, admin pages only)

**Dimensions:** `width: 220px`, `min-height: 100vh`, `background: var(--ink-bg-2)`, `border-right: 1px solid var(--ink-line)`.

**Group label "EDITORIAL OVERLAY":**
- `font: 600 10px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .16em`, `color: var(--text-5)`.
- `padding: 20px 16px 8px`. No bottom border.

**Nav row — default state:**
- Height: `40px`, `padding: 0 16px`, `display: flex`, `align-items: center`, `gap: 10px`.
- SVG glyph: `width: 16px`, `height: 16px`, `stroke: var(--text-5)`, `stroke-width: 1.5`, `fill: none`. No icon library; each is a hand-crafted inline SVG (see §2.2 for shapes).
- Label: `font: 400 13.5px/1 "Inter"`, `color: var(--text-4)`.
- Right-aligned count: `margin-left: auto`, `font: 400 12px/1 "JetBrains Mono"`, `letter-spacing: .04em`, `color: var(--text-5)`. Format: `"2/56"` for countries, bare integer for others. If file returns `{}`, show `"0"`.

**Nav row — hover:**
- `background: var(--ink-card)`.
- Label: `color: var(--text-2)`.
- SVG stroke: `var(--text-4)`.
- Count: unchanged.

**Nav row — active (current page):**
- `border-left: 3px solid var(--ochre)`, `background: var(--ink-card)`, `padding-left: 13px` (compensates for the 3 px rule so text stays aligned).
- Label: `color: var(--text-1)`, `font-weight: 500`.
- SVG stroke: `var(--ochre)`.
- Count: `color: var(--ochre)`.

**Six file links, in order:** Overview, Countries, Regions, Castle quotes, Period picks, Browse bands.

**Divider:** `border-top: 1px solid var(--ink-line)`, `margin: 12px 0`.

**Group label "REFERENCE"** — same style as "EDITORIAL OVERLAY".

**Three reference links:** Backups, Schema, API reference. Same row styling. These can route to placeholder pages in Gate 1/3; stubs are acceptable.

**Active state persistence:** Use Angular `routerLinkActive` directive. It binds automatically across child routes — no manual route-matching code needed.

---

### 1.5 Login page — left pane (Gate 1)

**Container:** `width: 50%`, `min-height: 100vh`, `background: var(--ink-bg-2)`, `display: flex`, `flex-direction: column`, `justify-content: space-between`, `padding: 48px`.

**Eyebrow** at top:
- `"PLATE 00 · EDITORIAL ANNEX"`, `font: 600 10.5px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .16em`, `color: var(--text-5)`.

**SVG illustration** (inline, no external image):
- Centered in the pane. Target `height: ~280px`, `width: auto`.
- A minimal line-drawing of a keep (rectangular tower with crenellations, one small lancet window, a compass rose below). Do not attempt photo-realism. Two or three simple paths suffice.
- Stroke: `var(--ink-line-2)`, `opacity: 0.35`, `stroke-width: 1`. No fill on tower shapes. The compass rose arms are 4 lines meeting at a point.
- The mockup HTML (`Topcastles Admin Mockups.html`) has the exact paths. **If that file does not exist at the time of implementation, use this minimal substitute and note the gap:**
  ```svg
  <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg"
       style="stroke:var(--ink-line-2);stroke-width:1;opacity:0.35">
    <!-- tower body -->
    <rect x="60" y="80" width="80" height="140"/>
    <!-- crenellations -->
    <polyline points="60,80 60,60 75,60 75,70 85,70 85,60 100,60 100,70 115,70 115,60 125,60 125,70 140,70 140,60 140,80"/>
    <!-- window -->
    <rect x="92" y="130" width="16" height="28"/>
    <path d="M92,130 Q100,118 108,130"/>
    <!-- gate -->
    <rect x="85" y="185" width="30" height="35"/>
    <path d="M85,185 Q100,170 115,185"/>
    <!-- compass rose -->
    <line x1="100" y1="240" x2="100" y2="295"/>
    <line x1="72" y1="267" x2="128" y2="267"/>
    <line x1="80" y1="250" x2="120" y2="285"/>
    <line x1="120" y1="250" x2="80" y2="285"/>
    <text x="100" y="237" text-anchor="middle" font-family="Inter" font-size="8"
          fill="var(--text-6)" stroke="none">N</text>
  </svg>
  ```

**Plate block** (positioned in middle of pane):
- `"VOL. XXII · 2026"` plate number: `font: 600 10.5px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .14em`, `color: var(--text-5)`. Margin-bottom: `16px`.
- `<h1>` `"The editorial annex."`: `font: 600 56px/1.05 "Source Serif 4"`, `text-wrap: balance`, `color: var(--text-1)`. Margin-bottom: `20px`.
- Italic subtitle (one sentence, max 480 px wide): `font: italic 400 17px/1.55 "Source Serif 4"`, `color: var(--text-3)`. Text: `"A quiet room for curatorial work. The atlas is assembled here, out of public view."` (Write this verbatim; do not generate copy on the fly.)

**Footnote** at bottom of pane:
- Italic 12 px Source Serif, `color: var(--text-5)`. Text: `"Overlay files are editor-owned. The data pipeline reads them but never writes them."` (verbatim).

---

### 1.6 Login page — right pane (Gate 1)

**Container:** `width: 460px`, `min-height: 100vh`, `background: var(--ink-bg)`, `padding: 48px`.

**Top row** (`display: flex`, `justify-content: space-between`, `align-items: center`):
- Left: wordmark `"Topcastles."`, `font: 600 22px/1 "Source Serif 4"`, `color: var(--text-1)`.
- Right: `"Public atlas →"` link, `font: 600 11px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .12em`, `color: var(--text-4)`. On hover: `color: var(--ochre)`. Routes to `/`.

**60px vertical gap** (margin-top: 60px on the form block).

**Form heading block:**
- `<h2>` `"Editor's sign in"`, `font: 600 28px/1.1 "Source Serif 4"`, `color: var(--text-1)`. Margin-bottom: `6px`.
- Ochre rule: `border-bottom: 2px solid var(--ochre)`, `display: block`, `width: max-content`, applied to a `<span>` wrapping the h2 text — not to the `<h2>` itself. This constrains the rule to the text width.
- Italic lede below: `font: italic 400 14px/1.55 "Source Serif 4"`, `color: var(--text-4)`. Margin-top: `10px`. Text: `"Sign in to the annex to review and annotate the editorial overlay."` (verbatim).

**Form fields** — two fields, vertical stack, `gap: 20px`:

Each field:
- Label: `font: 600 10.5px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .14em`, `color: var(--text-5)`. Display block, margin-bottom: `6px`.
- Input: `width: 100%`, `background: var(--ink-bg-2)`, `border: 1px solid var(--ink-line-2)`, `padding: 11px 12px`, `font: 400 14px/1 "Inter"`, `color: var(--text-2)`. No border-radius. No box-shadow. No float-label animation.
- Input focus: `border-color: var(--ochre)`, `background: var(--ink-card)`, `outline: none`.
- Input placeholder: `color: var(--text-6)`.

Field labels (verbatim): `"Editor handle"` and `"Passphrase"`. Not "username" and "password".

**Trust + Reset row** (`display: flex`, `justify-content: space-between`, `align-items: center`, margin-top: `16px`):
- Checkbox: `width: 14px`, `height: 14px`, `border: 1px solid var(--ink-line-2)`, `background: var(--ink-bg-2)`. On checked: `background: var(--ochre)`, tick is a white `✓` at 10 px, or rendered via `clip-path` — no browser native checkbox styling. Label text: `"Trust this device for 7 days"`, `font: 400 14px/1.4 "Inter"`, `color: var(--text-4)`. The checkbox and label are wrapped in a `<label>` element for clickability.
- Reset link: `"Reset →"`, `font: 400 13px/1 "Inter"`, `color: var(--text-5)`, `text-decoration: underline`. On hover: `color: var(--ochre)`.

**Inline error** (renders below the Passphrase field when auth fails, absent otherwise):
- `font: italic 400 13px/1.5 "Source Serif 4"`, `color: var(--heraldic-red)`.
- Margin-top: `8px`. No icon. No border. No background.
- Persists until the user edits the Passphrase field or successfully signs in. Do not auto-dismiss.
- On 401: `"Unrecognised handle or passphrase. Try again."` (verbatim).
- On network error: `"Could not reach the annex server. Check your connection."` (verbatim).

**Primary button:**
- `width: 100%`, `height: 44px`, `background: var(--ochre)`, `border: none`, `font: 600 13px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .12em`, `color: #0E1320` (near-black, not white — ensures contrast on ochre). No border-radius.
- Default label: `"Open the annex"`.
- In-flight (disabled) state: label switches to `"Opening…"` (same caps, same tracking). `opacity: 0.7`. `cursor: not-allowed`. No spinner. No icon change.
- Hover (not in flight): `background: var(--ochre-soft)`.
- Focus: `outline: 2px solid var(--ochre)`, `outline-offset: 2px`.
- Margin-top: `24px`.

**Divider and "Last session" block:**
- `border-top: 1px solid var(--ink-line)`, margin-top: `28px`.
- `font: italic 400 12px/1.6 "Source Serif 4"`, `color: var(--text-5)`. Padding-top: `12px`.
- Label `"Last session"` in small caps (font-variant: small-caps, or manually: `font: 600 11px/1 "Inter"`, uppercase, `--text-5`), then a colon, then the most recent backup filename's timestamp parsed as a date. If no backup exists, render `"—"`.

**Foot note:**
- `font: 400 11px/1.5 "JetBrains Mono"`, `color: var(--text-6)`. Margin-top: `16px`.
- Text: the auth endpoint path, e.g. `POST /api/admin/health`. Verbatim, no link.

---

### 2.1 Overview page — crumbs (Gate 3)

`display: flex`, `align-items: center`, `gap: 8px`, margin-bottom: `20px`.

- Segment 1 `"Editorial annex"`: `font: 600 11px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .10em`, `color: var(--text-5)`.
- Chevron `›`: `font: 400 11px/1 "Inter"`, `color: var(--text-6)`.
- Segment 2 `"Overview"`: `font: 600 11px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .10em`, `color: var(--text-2)`.

No link on "Overview" (current page). "Editorial annex" links to `/admin/editorial` (same page — can be an inert span in Gate 3).

---

### 2.2 Overview page — page head (Gate 3)

Single row: `display: flex`, `justify-content: space-between`, `align-items: flex-start`. Margin-bottom: `24px`.

**Left — `<h1>` block:**
- `"Editorial overlay"`, `font: 600 32px/1.15 "Source Serif 4"`, `letter-spacing: -.012em`, `color: var(--text-1)`.
- 2 px ochre rule below the full row (not width-constrained here — the full row has the rule): `border-bottom: 2px solid var(--ochre)`, `padding-bottom: 8px`.

**Right — italic meta** (max `380px`, `text-align: right`, `align-self: flex-end`):
- `font: italic 400 13.5px/1.5 "Source Serif 4"`, `color: var(--text-4)`.
- Text: `"Five JSON files. Served at runtime. Not part of the prerendered build."` (verbatim).

---

### 2.3 Overview page — lede paragraph (Gate 3)

`font: 400 15px/1.6 "Source Serif 4"`, `color: var(--text-3)`, `max-width: 64ch`. Margin-bottom: `28px`.

Text (verbatim):
> The editorial overlay supplements the atlas without entering the data pipeline. Each file — `countries`, `regions`, `castle-quotes`, `period-picks`, `browse-bands` — is read at runtime via the public `/api/editorial/:file` endpoint and merged into the page after hydration.

Inline code spans (`countries`, `castle-quotes`, etc.) render as: `font: 400 13.5px/1 "JetBrains Mono"`, `background: var(--ink-bg-2)`, `border: 1px solid var(--ink-line-2)`, `padding: 1px 5px`. No border-radius.

---

### 2.4 Prerender notice (Gate 3)

This block renders on **every admin editorial page**. It is not dismissible. It has no close button.

**Container:** `display: grid`, `grid-template-columns: 1fr auto`, `gap: 24px`, `padding: 18px 20px`, `background: var(--ink-card)`, `border: 1px solid var(--ink-line-2)`, `border-left: 3px solid var(--heraldic-red)`. Margin-bottom: `32px`.

**Role attribute:** `role="note"`, `aria-label="Prerender publishing notice"`.

**Left column:**
- Eyebrow `"PRERENDER NOTICE"`: `font: 600 11px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .14em`, `color: var(--heraldic-red)`. Margin-bottom: `8px`.
- Body (italic): `font: italic 400 13.5px/1.55 "Source Serif 4"`, `color: var(--text-2)`.
- Body text (verbatim): `"Changes to overlay files take effect immediately via the runtime API but do not appear in prerendered pages until the next full build and deployment. Prerendered pages will continue to show the previous state until then."`

**Right column** (`text-align: right`, `white-space: nowrap`):
- Eyebrow `"LAST BUILD"`: `font: 600 10.5px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .14em`, `color: var(--text-5)`. Margin-bottom: `6px`.
- Date + GMT time: `font: 600 14px/1.2 "Source Serif 4"`, `color: var(--text-1)`. Format: `"3 May 2026, 14:22 GMT"`.
- Relative ago: `font: 400 12px/1 "Inter"`, `color: var(--text-5)`. Format: `"4 days, 5 hours ago"`. Compute from `process.env.BUILD_TIMESTAMP` (injected at build time as an Angular environment variable). If not available, render `"build date unknown"` in `--text-6`.

---

### 2.5 Ledger strip (Gate 3)

`display: grid`, `grid-template-columns: repeat(4, 1fr)`, `border: 1px solid var(--ink-line)`. No background fill. Margin-bottom: `40px`.

Each cell: `padding: 20px 20px 16px`, `border-right: 1px solid var(--ink-line)`. Last cell has no right border (`&:last-child { border-right: none }`).

**Cell internal structure:**
```
label      ← 14px caps Inter, --text-5, letter-spacing .14em
value unit ← value: 22px Source Serif 600, --text-1
             unit: 12px Inter, --text-5, margin-left: 4px, align-baseline
sub        ← italic 11.5px Source Serif, --text-4, margin-top: 4px
```

**Cell 1 — Files:**
- Label: `"FILES"`
- Value: count of five file reads that did NOT return `{}` / `"5"` denominator. e.g. `"3"` with unit `"/ 5 present"`.
- Sub: `"all five overlays initialised"` (when value is 5) or `"N files missing"` (when value < 5).
- Derivation: run all five `/api/editorial/*` calls, count responses where `Object.keys(data).length > 0`.

**Cell 2 — Keys recorded:**
- Label: `"KEYS RECORDED"`
- Value: sum of `Object.keys()` across all five responses.
- Unit: `"total"`.
- Sub: `"across countries, regions, quotes, picks, bands"`.

**Cell 3 — Coverage:**
- Label: `"COVERAGE"`
- Value: `Math.round((Object.keys(countriesData).length / 56) * 100)` where `56` is the total catalogued countries in the index (hardcode this constant; do not derive it from another API call).
- Unit: `"%"`.
- Sub: `"of catalogued countries with editorial notes"`. Zero-state sub: `"no editorial notes yet"`.

**Cell 4 — Backups on disk:**
- Label: `"BACKUPS ON DISK"`
- Value: count from `GET /api/admin/backups` (a new admin endpoint needed in Gate 3 — see §7.1 for risk note).
- Sub: when backups exist: `"oldest <date> · prune manually"`. When zero: `"no backups yet — first save will create one"`.
- **Gate 3 fallback:** if the backups endpoint is not wired, hardcode `0` and render the zero-state sub. Note this gap in the implementation report.

---

### 2.6 Files table (Gate 3)

**Section head:**
```html
<h2 class="sec-head">Files</h2>
<p class="sec-sub">Five editorial overlay files, served via the runtime API.</p>
```
`sec-sub`: `font: italic 400 13px/1.55 "Source Serif 4"`, `color: var(--text-5)`, `max-width: 64ch`, `margin-top: -6px`, `margin-bottom: 16px`.

**Table:** `<table>` element with real `<thead>` / `<tbody>`. Full width. `border-collapse: collapse`.

**Column widths:**

| Column | `<th>` / `<td>` |
|---|---|
| № | `width: 36px` |
| File | `width: 30%` |
| Editor's purpose | (flex, takes remaining space) |
| Keys | `width: 110px` |
| Last edited | `width: 110px` |
| Open | `width: 90px`, `text-align: right` |

**`<th>` styles:** `font: 600 10.5px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .12em`, `color: var(--text-5)`, `padding: 10px 12px`, `border-bottom: 1px solid var(--ink-line)`, `text-align: left`. № column: `text-align: right`.

**`<td>` padding:** `12px` on all sides.

**Row separators:** `border-bottom: 1px solid var(--ink-line)`. Last row also has a bottom border.

**Row hover:** `background: rgba(255,255,255,0.015)` (1.5% white overlay). Do not use a token for this — no token maps to this value.

**Row click:** clicking anywhere on the row navigates to `/admin/editorial/<file-slug>`. The `<a>` in the File cell is the accessible target; the row-level click is a progressive enhancement (add `tabindex="-1"` to the `<tr>` — do not make `<tr>` focusable). Link click takes precedence over row click.

**№ cell:** `font: 400 12px/1 "Inter"`, `font-variant-numeric: tabular-nums`, `color: var(--text-5)`, `text-align: right`.

**File cell (two-line):**
- Line 1: `<a>` with the display name, `font: 600 15px/1.2 "Source Serif 4"`, `color: var(--text-1)`. On hover: `color: var(--ochre)`. `text-decoration: none`.
- Line 2: file path, `font: 400 11px/1.4 "JetBrains Mono"`, `color: var(--text-5)`. Not a link.
- EMPTY badge (when `Object.keys(data).length === 0`): rendered immediately after the line-1 `<a>`, inline. `border: 1px solid var(--ink-line-2)`, `font: 600 9.5px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .12em`, `color: var(--text-5)`, `padding: 2px 5px`, `margin-left: 8px`. No border-radius.

**Editor's purpose cell:** `font: italic 400 13px/1.55 "Source Serif 4"`, `color: var(--text-3)`, `text-wrap: pretty`. Long text wraps — no truncation. `<em>` tags render as italics within an already-italic context: use `font-style: normal` on `<em>` inside this cell so the `<em>` text de-italicises and reads as emphasis.

**Keys cell:**
- Big number: `font: 600 22px/1 "Source Serif 4"`, `color: var(--text-1)`.
- Unit label: `font: 600 10px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .10em`, `color: var(--text-5)`, `display: block`, `margin-top: 3px`. Format: `"OF 56"` for countries (56 is the total), `"ENTRIES"` for others.
- When file is empty: big number is `"0"` in `--text-5` (not `--text-1`). Badge in File cell handles the visual indicator.
- On FETCH ERROR: render `"FETCH ERROR"` in place of the big number: `font: 600 10px/1 "Inter"`, `text-transform: uppercase`, `color: var(--heraldic-red)`. No number.

**Last edited cell:**
- Timestamp: `font: 500 13px/1.3 "Inter"`, `color: var(--text-2)`. Format: `"3 May · 14:47"`.
- Author below: `font: 400 11.5px/1 "Inter"`, `color: var(--text-5)`, `margin-top: 3px`.
- In Gate 3, derive from the most recent backup filename for that file. If no backup: render `"—"` in `--text-6`.

**Open cell:** `"Open →"`, `font: 500 13px/1 "Inter"`, `color: var(--ochre)`. On hover: `color: var(--text-1)`. Not a button — an `<a>` to `/admin/editorial/<file-slug>`.

**Five rows — verbatim content:**

| № | Name | Path | Editor's purpose |
|---|---|---|---|
| 01 | Countries | `/data/editorial/countries.json` | A short characterising note and defining tradition for each country in the index. Marks editorial sleepers — countries scored high by editors and low by visitors. |
| 02 | Regions | `/data/editorial/regions.json` | One-sentence descriptions of named architectural regions — e.g. the Middle Rhine, the Castilian Frontier — and their editorial sleeper flag. |
| 03 | Castle quotes | `/data/editorial/castle-quotes.json` | Editor pull-quotes about specific castles, with byline and date. The optional *featuredUntil* field overrides the homepage featured entry until the date passes. |
| 04 | Period picks | `/data/editorial/period-picks.json` | Editor's pick castle for each century in the period table. Rendered as a starred italic entry in the period gazetteer column. |
| 05 | Browse bands | `/data/editorial/browse-bands.json` | A short editor's note above each rank band on the Top 1000 browse page (1–100, 101–500, 501–1000). |

Italic in the purpose column maps to `<em>` tags: `<em>featuredUntil</em>`, `<em>Middle Rhine</em>`, `<em>Castilian Frontier</em>`, `<em>featuredUntil</em>`.

---

### 2.7 Recent edits (Gate 3)

**Section head + subtitle:**
```html
<h2 class="sec-head">Recent edits</h2>
<p class="sec-sub">Last six entries from the per-file backup log.</p>
```

**Container:** `border: 1px solid var(--ink-line)`. No background fill.

**Each row:** `display: grid`, `grid-template-columns: 110px 1fr 90px 120px`, `align-items: center`, `padding: 10px 16px`, `border-bottom: 1px solid var(--ink-line)`. Last row: no bottom border.

**When cell:**
- `font: 400 11.5px/1 "JetBrains Mono"`, `color: var(--text-4)`.
- Format: `"02 May · 14:47"`. Parse from backup filename `<file>-<timestamp>.json` where timestamp is Unix ms or ISO 8601.

**What cell (flex row, `gap: 8px`, `align-items: center`, `flex-wrap: wrap`):**
- File tag chip: `border: 1px solid var(--ink-line-2)`, `background: var(--ink-bg-2)`, `font: 600 10px/1 "Inter"`, `text-transform: uppercase`, `letter-spacing: .10em`, `color: var(--text-3)`, `padding: 3px 6px`. No border-radius. Text: the file name, e.g. `"COUNTRIES"`.
- Verb phrase (italic): `font: italic 400 13px/1.4 "Source Serif 4"`, `color: var(--text-3)`. In Gate 3: render `"wrote backup of"` always — do not attempt diffing. Note this in the implementation report. Gate 4 will improve this.
- Key chip (when diffing is implemented): `font: 400 12px/1 "JetBrains Mono"`, `color: var(--text-1)`, `background: var(--ink-bg-2)`, `border: 1px solid var(--ink-line-2)`, `padding: 2px 5px`. No border-radius. In Gate 3: omit this chip entirely since diffing is deferred.

**Who cell:** `font: italic 400 12.5px/1 "Source Serif 4"`, `color: var(--text-4)`. Value: editor handle stored in the backup file's metadata, or `"—"` if unavailable in Gate 3.

**Action cell:** `text-align: right`. `"Open backup →"`, `font: 500 13px/1 "Inter"`, `color: var(--ochre)`. On hover: `color: var(--text-1)`. Links to the backup file download or a read-only view (Gate 4 concern; in Gate 3 can be a dead `<a>` with `href="#"` and a note).

**Source for backup data:** the server must expose a `GET /api/admin/backups` endpoint (see §7.1). It returns an array of `{ file, timestamp, filename }` objects, sorted newest-first. Take the first six.

---

### 2.8 Overview page — footer (Gate 3)

`margin-top: 48px`, `padding-top: 12px`, `border-top: 1px solid var(--ink-line)`, `display: flex`, `justify-content: space-between`, `align-items: center`.

- Left: `font: italic 400 12px/1 "Source Serif 4"`, `color: var(--text-5)`. Text: `"Editorial annex — unbound copy. Topcastles vol. XXII · 2026."` (verbatim).
- Right: `font: 400 11px/1 "JetBrains Mono"`, `color: var(--text-6)`. Text: the API base path + a short build hash. Format: `"/api/editorial · build abc1234"`. Source the hash from `process.env.BUILD_HASH` (inject via Angular environment). If not available: render `"/api/editorial"` only.

---

## 2. Component primitives

### 2.1 `<app-admin-utility-bar>`

**Inputs:** `handle: string`, `loginTime: Date | null`

**Template structure:**
```
div.utility-bar
  div.utility-bar__left
    span.badge[EDITOR]
    span.utility-bar__label[Editorial annex — unbound copy]
  div.utility-bar__right
    span.utility-bar__signed-in
    button.utility-bar__signout[Sign out]
```

**States:** visible/hidden based on token in localStorage. Exposed via `*ngIf` at the parent shell level. The component itself always renders if mounted.

---

### 2.2 `<app-admin-sidenav>` — nav row

Single row component (`<a>` or `<button>` wrapping):

```
a.sidenav-row[routerLinkActive="sidenav-row--active"]
  svg.sidenav-row__glyph
  span.sidenav-row__label
  span.sidenav-row__count
```

**States:** default / hover / active. Styles defined once in the component SCSS using `:host` and `[routerLinkActive]`.

**SVG glyphs (inline, one per link):**

| Link | Glyph description |
|---|---|
| Overview | Grid of 4 squares (2×2), 2 px gap between, hairline stroke |
| Countries | Simple map outline polygon (abstract, 5–6 points) |
| Regions | Stacked horizontal lines (3 lines, varying widths — like a text excerpt) |
| Castle quotes | Quotation mark shape (open curly `"` — two stacked circles with tails) |
| Period picks | Star outline (5-point, no fill) |
| Browse bands | Three horizontal bars, heights 100% / 60% / 40% — bar chart form |
| Backups | Clockwise arc + download arrow |
| Schema | Curly braces `{ }` |
| API reference | Angle brackets `< />` |

All: `viewBox="0 0 16 16"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.5"`.

---

### 2.3 `<app-admin-ledger-cell>`

**Inputs:** `label: string`, `value: string | number`, `unit: string`, `sub: string`, `loading: boolean`

**Template:**
```
div.ledger-cell
  span.ledger-cell__label
  div.ledger-cell__value-row
    span.ledger-cell__value
    span.ledger-cell__unit
  span.ledger-cell__sub
```

**Loading state:** value shows `"—"` in `--text-5`, sub is blank. No skeleton loader, no spinner.

---

### 2.4 `<app-admin-prerender-notice>`

No inputs. Reads `BUILD_TIMESTAMP` from Angular environment.

```
aside[role="note"][aria-label="Prerender publishing notice"].prerender-notice
  div.prerender-notice__left
    span.prerender-notice__eyebrow[PRERENDER NOTICE]
    p.prerender-notice__body
  div.prerender-notice__right
    span.prerender-notice__last-build-label[LAST BUILD]
    span.prerender-notice__date
    span.prerender-notice__ago
```

---

### 2.5 `<app-admin-inline-error>`

**Inputs:** `message: string | null`

Renders nothing when `message` is null. When non-null:
```
p.inline-error[role="alert"]
  [italic Source Serif --heraldic-red text]
```

`role="alert"` causes screen readers to announce it when it appears.

---

### 2.6 Primary button (admin context)

Not a separate component — a CSS modifier class `btn--admin-primary`:
```css
.btn--admin-primary {
  width: 100%;
  height: 44px;
  background: var(--ochre);
  border: none;
  font: 600 13px/1 "Inter";
  text-transform: uppercase;
  letter-spacing: .12em;
  color: #0E1320;
  cursor: pointer;
}
.btn--admin-primary:hover:not(:disabled) { background: var(--ochre-soft); }
.btn--admin-primary:focus { outline: 2px solid var(--ochre); outline-offset: 2px; }
.btn--admin-primary:disabled { opacity: 0.7; cursor: not-allowed; }
```

No border-radius on any button in the admin shell.

---

### 2.7 Editorial table row

Not a sub-component. Rendered directly in the overview table's `*ngFor`. Row-level click handler dispatches to the same route as the `<a>` in the File cell. The `<tr>` does not receive `tabindex` — it is not keyboard-navigable as a unit; the `<a>` cell handles keyboard access.

---

## 3. Interaction spec

### 3.1 Login flow

```
User lands on /admin/login
  → If token exists in localStorage: redirect to /admin/editorial (Angular route guard)
  → If no token: render login form

User types → no live validation, no real-time feedback

User clicks "Open the annex" (or presses Enter in Passphrase field)
  → Button label changes to "Opening…", button becomes disabled
  → POST to /api/admin/health with Authorization: Bearer <passphrase>
     (The passphrase IS the token — there is no separate handle/password auth endpoint.
      The "Editor handle" field is display-only / UX framing. It is not sent to the server.
      See §7.2 for the risk note on this design gap.)
  → On 200: store token in localStorage at key 'topcastles.admin.token'
             store current time at 'topcastles.admin.login-time'
             store handle value at 'topcastles.admin.handle'
             redirect to /admin/editorial
  → On 401: re-enable button, reset label to "Open the annex", render inline error
  → On network error: same as 401 path, different error message

"Trust this device for 7 days":
  → When checked on successful login, set localStorage 'topcastles.admin.trust-expiry'
     to Date.now() + 7*24*60*60*1000
  → Route guard checks this expiry alongside the token
  → When unchecked (or expired), token is treated as session-only (cleared on tab close
     via sessionStorage instead of localStorage — implementation detail)
```

### 3.2 Route guard

```
AdminAuthGuard.canActivate():
  token = localStorage.getItem('topcastles.admin.token')
  if (!token) → navigate('/admin/login'), return false
  expiry = localStorage.getItem('topcastles.admin.trust-expiry')
  if (expiry && Date.now() > parseInt(expiry)) → clear token, navigate('/admin/login'), return false
  return true

AdminLoginGuard.canActivate():  // prevents auth'd users from seeing login
  token = localStorage.getItem('topcastles.admin.token')
  if (token) → navigate('/admin/editorial'), return false
  return true
```

### 3.3 Sign out

Clicking "Sign out" in the utility bar:
1. Removes `topcastles.admin.token` from localStorage.
2. Removes `topcastles.admin.login-time` from localStorage.
3. Removes `topcastles.admin.trust-expiry` from localStorage.
4. Navigates to `/admin/login`.

No confirmation prompt. The action is immediately reversible (user can sign back in).

### 3.4 Overview page data loading

All five editorial reads run in parallel (`forkJoin` in Angular). The page renders immediately with loading states; cells update as responses arrive.

```
ngOnInit():
  forkJoin({
    countries: editorialService.getFile('countries'),
    regions:   editorialService.getFile('regions'),
    quotes:    editorialService.getFile('castle-quotes'),
    picks:     editorialService.getFile('period-picks'),
    bands:     editorialService.getFile('browse-bands'),
    backups:   adminService.getBackups(),   // authenticated call
  }).subscribe(...)
```

On individual error: that file's row renders with FETCH ERROR in the keys cell. Other rows are unaffected.

### 3.5 Table row hover and click

- Hover: CSS `tr:hover td { background: rgba(255,255,255,0.015); }`. Applied via CSS, no JS.
- Row click handler: `(click)="router.navigate(['/admin/editorial/', row.slug])"` on `<tr>`.
- Link click (File cell `<a>`, Open cell `<a>`): `routerLink` attribute — native Angular router link. These propagate to the `<tr>` click naturally; since both navigate to the same route, there is no conflict. No `stopPropagation()` needed.

### 3.6 Nav active state

`routerLinkActive="sidenav-row--active"` with `[routerLinkActiveOptions]="{ exact: false }"` on Overview; `exact: true` would also work since Overview is the index. All other links use default (non-exact) matching so sub-routes within a section keep the parent row active.

### 3.7 Focus behavior

All interactive elements: `outline: 2px solid var(--ochre)`, `outline-offset: 2px`. This applies uniformly — no element-specific focus ring exceptions.

Tab order follows DOM order. The utility bar is first in DOM, followed by masthead, olive nav, side nav, main content. This is the natural reading order.

The signed-in chip / Sign out button in the utility bar is `<button>` — inherently focusable. It does not open a menu in Gate 1; it signs out directly.

---

## 4. Data-to-UI mapping

### 4.1 Endpoint → file → slug

| Endpoint | File | Route slug | Keys denominator |
|---|---|---|---|
| `/api/editorial/countries` | `countries.json` | `countries` | 56 (hardcoded) |
| `/api/editorial/regions` | `regions.json` | `regions` | — (no denominator shown) |
| `/api/editorial/castle-quotes` | `castle-quotes.json` | `castle-quotes` | — |
| `/api/editorial/period-picks` | `period-picks.json` | `period-picks` | — |
| `/api/editorial/browse-bands` | `browse-bands.json` | `browse-bands` | — |

### 4.2 "Keys count" derivation

For every file: `Object.keys(response).length` where `response` is the parsed JSON object. If the response is `{}`, count is `0`. The API never returns an array for these files.

### 4.3 "Empty" rendering

When a file returns `{}`:
- File table row: renders normally, `EMPTY` badge in File cell, `0` in Keys cell (`--text-5`).
- Side nav count: `"0"`.
- Ledger strip: counted as `0` for "Keys recorded" and "Files" cells.

### 4.4 Coverage formula

```
coverage = Math.round((Object.keys(countriesData).length / 56) * 100)
```

`56` is a constant representing the total countries in the Topcastles catalogue. Do not derive this from an API call. If `countriesData` is `{}`, coverage is `0%`.

### 4.5 Backups endpoint contract (new — needed for Gate 3)

`GET /api/admin/backups` (authenticated):
```json
[
  { "file": "countries", "timestamp": 1746274027000, "filename": "countries-1746274027000.json" },
  ...
]
```
Sorted newest-first. Returns max 50. Returns `[]` if `/data/editorial/backups/` does not exist.

---

## 5. Risks and fallbacks

### 5.1 `GET /api/admin/backups` does not exist yet

**Risk:** The ledger "Backups on disk" cell and "Recent edits" section both depend on a server endpoint that is not in the current codebase.

**Gate 3 fallback:** Hardcode `0` backups. Render the zero-state sub copy. Replace "Recent edits" section with the empty-state text (see §5.3). Note the gap in the Gate 3 implementation report.

**What is needed:** Add to `server/routes/admin.js`:
```js
router.get('/backups', adminAuth, async (req, res) => {
  const dir = path.join(DATA_DIR, 'editorial', 'backups');
  try {
    const files = await fs.readdir(dir);
    const entries = files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const parts = f.replace('.json', '').split('-');
        const ts = parseInt(parts[parts.length - 1]);
        const file = parts.slice(0, -1).join('-');
        return { file, timestamp: ts, filename: f };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
    res.json(entries);
  } catch {
    res.json([]);
  }
});
```

### 5.2 `process.env.BUILD_TIMESTAMP` not injected

**Risk:** The prerender notice right column shows "build date unknown."

**Gate 1/3 fallback:** Render `"build date unknown"` in `--text-6`. Do not show a placeholder date.

**What is needed:** In `angular.json`, add to the production build's `fileReplacements` or in `environment.ts`:
```ts
export const environment = {
  buildTimestamp: '%%BUILD_TIMESTAMP%%',  // replaced by build script
  buildHash: '%%BUILD_HASH%%',
};
```

### 5.3 "Recent edits" verb phrase diffing

**Risk:** Computing what changed (e.g. "added note for DE") requires reading two JSON files and diffing them.

**Gate 3 fallback:** Always render `"wrote backup of"` as the verb phrase. Omit the key chip. Mark this as a Gate 4 enhancement in the implementation report.

### 5.4 "Editor handle" is not validated server-side

**Risk:** The login form has an "Editor handle" field but the `adminAuth` middleware only checks the Bearer token. There is no handle/username concept on the server. Sending a wrong handle with a correct token still succeeds.

**Design implication:** The handle field is purely a UX affordance. It is stored locally (step 3.1) and displayed in the utility bar and "Who" column of Recent edits. The server never validates it.

**Gate 1 approach:** Accept this limitation. The handle is stored in `localStorage` at `topcastles.admin.handle`. The sign-in form sends only the passphrase as the Bearer token. Document this in the implementation report so Gate 2 (write API) can decide whether to attach a handle to backup metadata.

### 5.5 `Topcastles Admin Mockups.html` does not exist

**Risk:** The prompt references it for visual cross-checking and the SVG illustration paths.

**Gate 1 fallback:** Use the minimal SVG substitute in §1.5. Use this implementation spec as the visual reference for rhythm and hierarchy checks instead of the missing canvas. Log the absent file as a blocker for the verification step.

### 5.6 Angular SSR / hydration on admin routes

**Risk:** The admin shell is a protected SPA route. If SSR is active for `/admin/*`, the server will attempt to prerender the admin page, hit the editorial API, and embed results — which contradicts the "editorial data is not in prerendered pages" rule.

**Gate 1 approach:** Exclude `/admin/**` from SSR prerendering. In `app.routes.ts`, mark admin routes with `data: { prerender: false }`. Confirm this in `angular.json` or the prerender config.

---

## 6. Empty and error states — complete catalogue

| Situation | Where | What renders |
|---|---|---|
| No token in localStorage | Any `/admin/*` route | Guard redirects to `/admin/login` |
| Authenticated, `/admin/login` | Login page | Guard redirects to `/admin/editorial` |
| No backups yet | Ledger "Backups" cell | Value: `"0"`, sub: `"no backups yet — first save will create one"` |
| No backups yet | Recent edits section | Replace entire section with: single `<p>` centered, `font: italic 400 14px/1.5 "Source Serif 4"`, `color: var(--text-4)`. Text: `"No editorial edits yet. Open a file to begin."` No illustration. |
| All five files return `{}` | Ledger "Coverage" | `"0%"`, sub: `"no editorial notes yet"` |
| All five files return `{}` | Files table | All rows render with `EMPTY` badge; keys cells show `"0"` in `--text-5` |
| Individual file API error | Files table row | Keys cell: `"FETCH ERROR"` in caps 10 px `--heraldic-red`. File cell, purpose cell, last-edited cell render normally. |
| Individual file API error | Ledger | That file counts as `0` keys, counts as not-present for "Files" cell |
| `BUILD_TIMESTAMP` absent | Prerender notice | Right column shows `"build date unknown"` in `--text-6` |

---

## 7. Final validation checklist

Engineering verifies each of these before closing the gate bead.

### Gate 1

**Automated:**
- [ ] `npm test` passes (all 176 Angular specs plus any new admin specs)
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run test:smoke` passes
- [ ] `node server/routes/editorial.test.js` passes

**Manual curl:**
- [ ] `curl /api/admin/health` with no Authorization header → 401
- [ ] `curl /api/admin/health` with wrong token → 401
- [ ] `curl /api/admin/health` with correct token → 200
- [ ] `curl /api/editorial/countries` (no auth) → 200 (either `{}` or populated)
- [ ] `curl /api/editorial/nonexistent` (no auth) → 200 with `{}`

**Visual (at 1280 px viewport):**
- [ ] Login page two-pane layout renders. Left pane occupies 50%, right pane is 460 px.
- [ ] No border-radius anywhere on the login page.
- [ ] No colour outside the token set appears.
- [ ] "Editorial" tab in the olive nav is absent when signed out (verify in DOM inspector — it must not be in the DOM).
- [ ] Navigating to `/admin/editorial` when signed out redirects to `/admin/login`.
- [ ] Signing in with a wrong token shows the inline error below the Passphrase field (no toast, no modal).
- [ ] Button shows "Opening…" and is disabled while the request is in flight.
- [ ] After successful sign-in, utility bar is visible with correct handle and time.

**Token / localStorage:**
- [ ] Token is stored at key `topcastles.admin.token`, not `tc_user_token` or any other key.
- [ ] Clearing localStorage and refreshing `/admin/editorial` redirects to login.

### Gate 3

**Automated:**
- [ ] All Gate 1 checks still pass
- [ ] Any new admin service unit tests pass

**Manual curl:**
- [ ] `curl /api/admin/backups` with correct token → `[]` or populated array
- [ ] `curl /api/admin/backups` with no token → 401

**Visual (at 1440 px viewport, signed in):**
- [ ] Overview page renders with all five sections: crumbs, page head, lede, prerender notice, ledger, files table, recent edits, footer.
- [ ] Prerender notice has 3 px `--heraldic-red` left rule. No dismiss button.
- [ ] Prerender notice `role="note"` and `aria-label` present (check DOM inspector).
- [ ] Files table is a real `<table>` with `<thead>` / `<tbody>` (check DOM).
- [ ] All five rows render with correct verbatim names and purpose text.
- [ ] EMPTY badge appears for any file that returns `{}`.
- [ ] FETCH ERROR renders in the keys cell if an editorial endpoint is forced to error (temporarily break one endpoint to test).
- [ ] Row hover shows the 1.5% white overlay (subtle — compare hover vs default).
- [ ] Clicking a table row navigates to `/admin/editorial/<slug>` (even if destination is a placeholder).
- [ ] Ledger strip has 4 cells with correct labels and formulas.
- [ ] Footer renders with correct text and API path.
- [ ] No border-radius on any element.
- [ ] Side nav "Overview" row is active (3 px ochre left rule, `--ink-card` background).

**Accessibility:**
- [ ] Tab through the entire page without a mouse — every interactive element receives a visible 2 px ochre focus ring.
- [ ] Sign out button in utility bar is reachable by keyboard.

---

*End of implementation spec. Gate 1 bead: `topcastles-1tt`. Gate 3 bead: `topcastles-46h`. Do not roll these into a single PR.*
