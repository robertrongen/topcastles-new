# Claude Code prompt — Topcastles Admin Editorial · per-file editors (Gate 4)

This prompt covers the **visual + interaction** implementation of the five per-file editors that live under `/admin/editorial/<file>`. Source-of-truth mockups: the **Gate 4 · Per-file editors** section of `Topcastles Admin Mockups.html` — five artboards at 1440×980, one per file. Where this prompt and the existing Topcastles style guide disagree, the **style guide wins** — these editors are the same editorial annex as the Gate 1 + 3 shell, not a new product.

This prompt assumes Gates 1 + 3 have shipped. The shell, side nav, prerender notice, design tokens, and the `/admin/editorial` overview index already exist and must be **reused, not reimplemented**. This prompt is also scoped: it does **not** introduce a new write API beyond what Gate 2 ships, and it does **not** trigger deploys.

---

## Workflow

Follow the Topcastles prompt workflow: **Bead → Graphify → Context → Implementation → Verification → Closure**. Use the fuller Spec Kit flow: bead first, Graphify first, context bundle first, then clarify → plan → tasks → analyze before coding.

Approval gates apply. Do not run past Gate 4 into Gate 5 (pipeline integration).

| Gate | Bead | Scope of this prompt |
|---|---|---|
| 4 | `topcastles-4ed` | Five per-file editors: Countries, Regions, Castle quotes, Period picks, Browse bands |

Gate 5 (pipeline build trigger, deploy notice clearing) is **out of scope**.

---

## Prerequisites

- The Gate 2 write API exists: `PUT /api/admin/editorial/:file` writes the whole JSON for `:file` after `adminAuth`, validates against the schema for that file, and writes a timestamped backup to `/data/editorial/backups/<file>-<ISO>.json` **before** overwriting the live file. If Gate 2 is not on `main`, stop and report — do not stub the API in this gate.
- Reads continue to use the public `/api/editorial/:file` endpoints (whitelisted in `server/routes/editorial.js`). Missing files still return `{}`.
- Castle code resolution uses an existing read endpoint over `castles_enriched.json`. If there is no resolution endpoint yet, build the smallest possible one — `GET /api/admin/castles/lookup?q=<prefix>` returning `[{code, name, country, editorialRank, visitorRank}]` capped at 12 results — and put it in the same `routes/admin.js` file so it is gated by `adminAuth`.
- Routing: `/admin/editorial/:file` where `:file ∈ {countries, regions, castle-quotes, period-picks, browse-bands}`. Anything else 404s into the existing admin 404. Each route renders inside the **existing** Gate 1 shell + side nav; the active side-nav row reflects the current file.
- The prerender notice from Gate 3 must render on every editor route, identical fill, copy, and last-build value. It is the same component — import it.

---

## Design tokens

These are already defined for the public site and reused by Gates 1 + 3. **Reuse, do not redeclare.** Any new token introduced in this gate is a bug.

```
--ink-bg / --ink-bg-2 / --ink-card / --ink-line / --ink-line-2
--text-1 … --text-6
--ochre / --ochre-soft / --heraldic-red
--olive-nav / --olive-nav-fg
```

Typography: Source Serif 4 for headings/prose, Inter for chrome/labels, JetBrains Mono for paths, keys, and castle codes. **No new fonts.** Square corners everywhere — no `border-radius`. No decorative iconography in body content (parent guide §13). Side-nav glyphs are the only exception, and they are inherited from Gate 1, not redrawn here.

---

## Shared editor shell

Every editor uses an identical layout. Build this once as `<EditorPage>` (or the framework-equivalent component) and pass file-specific content into it.

### Page top

1. **Crumbs** — `Editorial annex › Overview › <File name>` (11 px caps `.10em`, `--text-5`; chevron in `--text-6`; current segment `--text-2`). The "Overview" segment links back to `/admin/editorial`.
2. **Page head** — `<h1>` with the file's display name (32 px Source Serif 600), 2 px ochre underline below the whole row, italic meta on the right (max 380 px, right-aligned).
3. **Prerender notice** — exact component from Gate 3. Do not re-skin per file.

### Two-pane editor (Countries, Regions, Castle quotes, Period picks)

A two-column grid: **keys rail** (260 px fixed) on the left, **form pane** (flex) on the right. 1 px `--ink-line-2` between them. No outer border on the pair — they sit on the page surface.

#### Keys rail

- Header row: caps label on the left (10.5 px caps `.14em`, `--text-5`), a count chip on the right (`2 of 56`, `2 of 1,000`, `2 of 22 eras`, etc.) in JetBrains Mono 11 px `--text-4`. 1 px `--ink-line` below the header.
- Search input: full width, square corners, `--ink-bg-2` fill, 1 px `--ink-line-2` border, padding 9×11. Placeholder copy is file-specific (see per-file sections). Hidden for Browse bands and Period picks (use bare list).
- Scrollable list of key rows (max-height fills the viewport minus chrome; not the page). Each row:
  - Two-line stack: primary name in 14 px Source Serif 600 `--text-1`, secondary identifier in 11 px JetBrains Mono `--text-5`.
  - Optional right-aligned flag pill: `Sleeper` in `--ochre`, `Featured` in `--ochre`, `Empty` in `--text-5`.
  - States: default, hover (1.5% white overlay), **active** (3 px ochre left rule, `--ink-card` fill, `--text-1` label), **dirty** (small unfilled ochre dot at the right edge, after the flag pill — 6 px square). Active-and-dirty stacks both treatments.
  - Empty rows render at 55% opacity to recede behind populated keys.
- Foot: a single ghost button "**+ Add <thing>**" — full width, 1 px `--ink-line-2` border, no fill, square corners, 12 px caps `.12em`. Hidden when the file has a fixed key set (Period picks, Browse bands).

#### Form pane

- **Form head** — flex row across the top. Left: `<h3>` with the active key's name (24 px Source Serif 600), then a sub-row of identifier chips (file-specific). Right: italic 12.5 / 1.55 `--text-4` meta — `Last edited <date>` over `by <em>name</em>`. 1 px `--ink-line` below.
- **Form grid** — 2-column responsive grid, 24 px column gap, 20 px row gap. Fields with the `full` class span both columns. Below 1100 px viewport, collapse to one column.
- **Form field** — vertical stack: label, control, hint or charcount. Spacing inside a field is 6 px between rows.
  - Label: 10.5 px caps `.14em`, `--text-5`. Required marker is the small text `Required` (10 px caps `.12em`, `--ochre`) right of the label, separated by a 12 px gap. Optional marker is the same caps treatment in `--text-5`.
  - Input / textarea: full width, `--ink-bg-2` fill, 1 px `--ink-line-2` border, 11×12 padding, 14 px Source Serif for prose fields, 13 px JetBrains Mono for code fields (castle codes, dates). Square corners. **No** float labels. **No** placeholder-as-label.
  - Focus: border switches to `--ochre`, fill to `--ink-card`. No glow, no shadow.
  - Hint: italic 12 / 1.55, `--text-4`. May contain a `<em>` for emphasis or a 11.5 px Mono code chip with `--ink-bg` fill.
  - Charcount: right-aligned, 11 px JetBrains Mono `--text-5`. Format `<n> / <max>`. Turns `--heraldic-red` when over the cap; the form does not block save, but the value is highlighted.
  - Validation error (if any): replaces the hint slot; italic 13 px Source Serif, `--heraldic-red`. **No toasts. No tooltips.**
- **Toggle row** — used for the boolean fields (sleeper, etc.). Horizontal: 36×20 px square switch on the left (1 px `--ink-line-2` border, fill `--ink-bg-2` off / `--ochre` on; 16×16 thumb in `--text-1` on / `--text-3` off, slides 16 px). Stack of label + sub-line on the right. Sub-line is italic 12.5 / 1.5 `--text-4`. Make the entire row a click target.
- **Combobox** — for castle-code lookup and any other resolved-reference field. The input is JetBrains Mono. Below the input, a `resolved` strip renders the looked-up entry: small ochre tick (`✓`), then `<name> · <country> · ★ <ed> [vis]`. If the code does not resolve, render an italic `--heraldic-red` "no castle with that code" line in the same slot. While typing, render a popover below the input — see Period picks for the canonical rendering.
- **Preview block** — every editor surfaces a live preview of how the edited key will render in the public atlas. Bordered region (1 px `--ink-line-2`, no fill), with a head bar:
  - Head bar: 12×16 px padding, `--ink-bg-2` fill, 1 px `--ink-line` bottom border. Left: caps 10.5 px `.14em` `--text-5` "Preview". Right: italic 12 px `--text-4` indicating the surface, e.g. `Top countries gazetteer · row for FR`.
  - Body: 18 px padding, `--ink-bg` fill. Renders the public-site row/card/quote using the **same** components (or close-as-possible CSS) as the public atlas. Do not invent new chrome here.
  - The preview must be live — every keystroke updates it.

### Save bar

Sticks to the bottom of the form pane (sticky inside the scrolling main column, 16 px above the page footer). 1 px `--ink-line` top border, no fill. Two-column flex:

- Left: status text. When dirty: 6 px ochre square dot + `Unsaved changes` (13 px Inter 500 `--text-2`). When clean: `Saved` in `--text-4`. Always followed by `· last saved <HH:MM GMT>` in italic 12 px `--text-5`.
- Right: two buttons. **Discard** is ghost (1 px `--ink-line-2` border, no fill, 13 px caps `.12em` `--text-2`). **Save changes** is primary (`--ochre` fill, near-black text, 13 px caps `.12em`). Square corners. Save button copy is `Save band` on the Browse bands editor; otherwise `Save changes`.

### Save behaviour

1. Save POSTs the **entire** file's JSON to `PUT /api/admin/editorial/<file>` (Gate 2 contract). Per-key writes are not the protocol — the admin holds the entire file in memory and replaces it.
2. On 200, flip the dirty dot off, update "last saved", and render the **save success row** (italic 12.5 px Source Serif, `--text-3`, 1 px `--ink-line` top border, 12 px above-padding) showing: `✓ Saved <key>. Backup written: <returned filename>`. The backup filename comes back in the response. **No toast.** The success row replaces itself on the next save.
3. On 4xx with a validation error, render an inline error above the save bar — italic 13 px Source Serif `--heraldic-red`, listing the failing field(s) by label. Highlight each failing field in place by switching its border to `--heraldic-red`.
4. On 5xx or network error, render a generic error in the same slot: "Could not save — the server did not accept the change. Your draft is still in this tab." Do not auto-retry. Do not clear the dirty state.
5. **Discard** prompts a single confirm dialog (native is fine for this gate) reading "Discard unsaved changes to <key>?" Confirming reverts the form to the last fetched state from `/api/editorial/<file>`. The keys rail also drops the dirty marker.

### Unsaved-changes guard

- A `beforeunload` handler fires when any form is dirty.
- Switching keys in the rail with unsaved changes opens the same confirm dialog. Cancelling keeps the user on the current key.
- Switching files via the side nav with unsaved changes opens the same confirm dialog.

---

## Per-file specifications

Each section below specifies the **identifier chips, fields, hint copy, charcount caps, validations, and preview surface** for one file. Field labels and hint copy are verbatim. Italics in hints are real `<em>` tags.

### 4.1 Countries — `/admin/editorial/countries`

- Display name: "Countries". Subtitle (italic 13 / 1.55 `--text-4` under the page head): "Short editorial notes per country, surfaced in the Top Countries gazetteer."
- Keys rail header: `Countries · 2 of 56`. Search placeholder: `Filter by country or code…`. List rows show the country name + ISO code · country file id (e.g. `FR · fr001`). Sleeper countries get the `Sleeper` flag. Countries with no editorial entry get the `Empty` flag and 55% opacity.
- Form-head identifier chips: ISO code in JetBrains Mono `--text-3`, then `<n> entries` and `Editorial rank № <n>` chips (1 px `--ink-line-2` border, 10 px caps `.10em`).
- Fields:
  | Key | Label | Control | Required | Hint | Cap |
  |---|---|---|---|---|---|
  | `note` | Editorial note | `<textarea>` 14 px Source Serif | yes | "One short sentence characterising the country's tradition. Surfaced in the gazetteer table beside the country name." | 220 |
  | `tradition` | Defining tradition | `<input>` 14 px Source Serif | yes | "Short label, *style · period*. Italic in the gazetteer." | 60 |
  | `topEntryCode` | Top entry castle code | combobox over `castles_enriched.json` | yes | (no hint; resolution strip shows the resolved castle below) | — |
  | `sleeper` | Editor's sleeper | toggle row | no | sub: "High editorial rank, low visitor traffic. Triggers the EDITOR'S SLEEPER badge in the gazetteer row." | — |
- Validation: `note` and `tradition` non-empty after trim; `topEntryCode` resolves to a real castle in the index.
- Preview surface: a single Top Countries gazetteer row using the public table styles. Columns: Country (name + `★ <ed> ed · <vis> vis ↑` micro-line), Tradition (italic), Editor's note (italic, with a `Sleeper` micro-flag if toggle is on), Top entry (linked name).

### 4.2 Regions — `/admin/editorial/regions`

- Display name: "Regions". Subtitle: "Named architectural regions and their editorial sleeper flag."
- Keys rail header: `Regions · <n> keyed`. Search placeholder: `Filter by region slug…`. List rows show region display name + slug (`castilian-frontier`).
- Form-head identifier chips: slug (Mono `--text-3`), `<n> entries` chip.
- Fields:
  | Key | Label | Control | Required | Hint | Cap |
  |---|---|---|---|---|---|
  | `description` | Description | `<textarea>` | yes | "One sentence describing the region's architectural identity. Displayed on the Top Regions atlas card." | 200 |
  | `sleeper` | Editor's sleeper | toggle row | no | sub: "High editorial rank, low visitor traffic. Triggers the EDITOR'S SLEEPER badge on the Top Regions card." | — |
- Validation: `description` non-empty after trim.
- Preview surface: a single Top Regions atlas card using the public card styles. The `EDITOR'S SLEEPER` micro-flag renders in `--ochre` caps before the region name when the toggle is on.

### 4.3 Castle quotes — `/admin/editorial/castle-quotes`

- Display name: "Castle quotes". Subtitle: "Editor pull-quotes about specific castles. Optional *featuredUntil* overrides the homepage."
- Keys rail header: `Castle quotes · 2 of 1,000`. Search placeholder: `Filter by castle code…`. List rows show the resolved castle name (Source Serif 600) and a Mono sub-line `<code> · <country> · ★ <rank>`. Quotes whose `featuredUntil` covers today get a `Featured` flag in `--ochre`.
- Form-head identifier chips: castle code (Mono `--text-3`), country code chip, `★ <rank>` chip.
- Fields:
  | Key | Label | Control | Required | Hint | Cap |
  |---|---|---|---|---|---|
  | `castle` | Castle | combobox | yes | "Castle code from *castles_enriched.json*. Autocomplete by name or code." | — |
  | `quote` | Quote | `<textarea>` 14 px Source Serif, min-height 120 px | yes | "Plain prose, no markdown. Rendered italic below the Wikipedia extract on the featured entry." | 480 |
  | `author` | Author | `<input>` | yes | "Byline as it should appear, e.g. *R. Rongen*." | 60 |
  | `role` | Role | `<input>` | yes | (no hint) | 40 |
  | `date` | Date | `<input>` Mono, ISO `YYYY-MM-DD` | yes | (no hint; reject non-ISO) | — |
  | `featuredUntil` | Featured until | `<input>` Mono, ISO `YYYY-MM-DD` | no | "*If today ≤ this date*, this castle overrides the daily algorithm as homepage featured entry." | — |
- Validation: castle code resolves; `quote` non-empty; `date` and `featuredUntil` parse as ISO calendar dates; `featuredUntil ≥ date` if both present.
- Preview surface: italic pull-quote block with the byline run on a separate line — `<name> · <role> · <D MMM YYYY>`. Use the public featured-entry quote styles.

### 4.4 Period picks — `/admin/editorial/period-picks`

- Display name: "Period picks". Subtitle: "Editor's pick castle for each century in the period table."
- Keys rail: **fixed 22 eras**, no add button, no search. Order: 9th c., 10th c., 11th c., 12th c., 13th c., 14th c., 15th c., 16th c., 17th c., 18th c., 19th c., 20th c., (and the in-between half-eras already in the period table). Each row shows the era label and either `★ <pick name>` (`--text-3`) or a 55%-opacity row with an `Empty` flag and `no pick set`.
- Form-head identifier chips: era key in quoted JetBrains Mono (`"12th c."`), `<n> castles in era` chip.
- Fields:
  | Key | Label | Control | Required | Hint | Cap |
  |---|---|---|---|---|---|
  | `code` | Castle pick | combobox (open dropdown shown in mockup) | yes | "Type castle code or name. Choose the entry; the display name will be filled automatically." | — |
  | `name` | Display name | `<input>` 14 px Source Serif (auto-filled from selection, editable) | yes | "Rendered as *★ <name>* in the period gazetteer. Override only for stylised display (e.g. shorter form)." | 60 |
- Combobox dropdown: bordered list under the input, 1 px `--ink-line-2`, `--ink-bg-2` fill. Each option is a 3-column row: Mono code on the left (60 px column), name + country sub-line in the middle, `★ <rank>` chip on the right. Active option has `--ink-card` fill and a 2 px ochre left rule. Keyboard nav with ↑/↓/Enter/Escape; Enter commits.
- Preview surface: a single row of the period gazetteer table — Era / Entries / Top scorer / Editor's pick. The pick column renders `★ <name>` (star in `--ochre`, name italic).

### 4.5 Browse bands — `/admin/editorial/browse-bands`

- Display name: "Browse bands". Subtitle: "Three editor's notes — one per rank band on the Top 1000 browse page."
- **No keys rail.** Replace it with a single `<p class="lede">` paragraph under the page head: "Three keys, one per band. There are no other bands; the band labels themselves are not editable here — they come from the browse page's pagination configuration."
- Body is a vertical stack of three `band-card`s — 1 px `--ink-line-2` border, no fill, 18 px padding. Each card has:
  - Head row: range chip on the left (Source Serif 600 17 px `--text-1`, e.g. `1–100`), italic name in the middle (`The canonical hundred`, `The established middle`, `The long tail` — exactly these), right-aligned saved/dirty status (`Saved 14:47` in `--text-5` / `Unsaved` in `--ochre`).
  - Body: two-column grid (1fr 1fr, 24 px gap). Left: `<textarea>` + charcount (cap 240). Right: a preview block showing exactly how the note appears above the rank band on `/top-1000?band=<range>`.
- Three keys, in this order, with these defaults if absent on first save:
  1. `1-100` — "The canonical hundred: the most architecturally significant and best-preserved fortifications in the index."
  2. `101-500` — "The established middle: significant structures that fall just outside the most visited and most cited tier."
  3. `501-1000` — "The long tail: minor structures, fragments, or lesser-known fortifications that round out the thousand."
- **Per-band save.** Each card has its own dirty state. The page-level save bar shows `<n> of 3 bands has unsaved changes` and the right buttons are `Discard band` / `Save band`. Saving still PUTs the **entire** file (Gate 2 contract); the per-band state is purely UI.

---

## Empty / first-time states

- **File returns `{}`** — keys rail shows zero populated rows for the variable-keyed files (Countries, Regions, Castle quotes), the fixed-key files (Period picks, Browse bands) render every row at 55% opacity with `Empty` / `no pick set`. No empty-state illustration. No CTA card. The form pane shows an italic 14 px `--text-4` "Choose a key to begin." centered, on plain paper.
- **Adding a key** (Countries, Regions, Castle quotes) — the `+ Add <thing>` button inserts a new row at the top of the rail, marks it active and dirty, and focuses the first required field. The form's `Last edited` meta reads `unsaved · new key`.
- **Editing the active key while another is dirty** — handled by the unsaved-changes guard above. No silent drops.
- **Castle code does not resolve** — the resolved strip switches to italic 12.5 px Source Serif `--heraldic-red` "no castle with that code". The field's border switches to `--heraldic-red`. Save button stays enabled — but the API will 4xx and the validation message will surface.

---

## Accessibility

- All controls reachable by keyboard. Visible focus is a 2 px `--ochre` outline; never remove it.
- Toggle rows are real `<button role="switch" aria-checked>` elements. Clicking the label area toggles the switch (it is part of the same button).
- Comboboxes implement WAI-ARIA combobox pattern: `aria-expanded`, `aria-controls`, `aria-activedescendant`. The popover items are real list items with `role="option"`.
- The save bar's status text is in an `aria-live="polite"` region so the dirty/saved transition is announced.
- The save success row is in the same live region.
- Validation errors are wired to their fields via `aria-describedby`.
- Tables in preview blocks use real `<table>` markup.
- Colour contrast is unchanged from Gate 3 — `--ochre` on `--ink-bg`, `--text-2/3` on `--ink-bg`, `--text-5` for ≥10 px caps only.

---

## Anti-patterns — do not introduce

- ❌ No `border-radius`. Square corners everywhere.
- ❌ No purple, lavender, periwinkle, or blue tints. The system has no cool accent.
- ❌ No Material-style icons, no floating-label inputs, no shadow-on-focus glow.
- ❌ No toast confirmations. Save success and validation errors are inline.
- ❌ No optimistic UI for save — wait for the 200, then flip dirty off.
- ❌ No autosave. Saves are explicit.
- ❌ No new font families. No emoji.
- ❌ No fork of the public site's CSS tokens — import them.
- ❌ Do not reach into pipeline scripts; do not trigger a build from the editor.
- ❌ Do not write to per-key endpoints — the protocol is whole-file PUT.

---

## Required verification per gate

Per the spec:

- `npm test`
- `npm run build`
- `npm run test:smoke`
- `node server/routes/editorial.test.js`
- `node server/routes/admin.test.js` if it exists; otherwise add a minimal test that confirms a forged token cannot PUT an editorial file.

Manual curl checks (Gate 4):

- `PUT /api/admin/editorial/countries` with a valid bearer and a valid body returns 200 and a backup filename.
- The same PUT without a bearer returns 401.
- A PUT with a `topEntryCode` that does not exist in `castles_enriched.json` returns 4xx and the editor surfaces the validation error inline.
- After a successful PUT, `GET /api/editorial/countries` returns the new content; a backup file with the returned filename exists in `/data/editorial/backups/`.

Visual verification (Gate 4):

- Open `Topcastles Admin Mockups.html` and confirm each of the five live editor routes matches its artboard at 1440 × 980. Pixel-perfect is not required; rhythm, hierarchy, and the preview surface fidelity are.
- The prerender notice renders identically on every editor route. It is **not** dismissible.
- The Editorial side-nav row for the active file uses the standard Gate 1 active treatment (3 px ochre left rule, `--ink-card` fill, ochre count).
- The preview block in each editor visually matches the corresponding public-site surface (Top Countries row, Top Regions card, featured-entry quote, period table row, browse-band note). Drift here is a bug — the preview's job is to be a faithful rehearsal of the public render.

---

## Closure

- Close only `topcastles-4ed`.
- `git pull --rebase`
- `bd dolt push`
- `git push`
- `git status`
- Confirm the working branch is clean and up to date with origin.
- **Stop and report** before opening Gate 5. Do not roll Gate 4 + Gate 5 into a single PR — the deploy/build trigger is a separate bead and a separate review.

# Summary

**Top of file** — workflow + gate scope. Names bead topcastles-4ed. Carves out Gate 5 (pipeline/deploy) as out of scope.

**Prerequisites** — depends on Gate 2 being on main (do not stub the API), reuses public read endpoints, specifies the castle-code lookup endpoint contract (GET /api/admin/castles/lookup?q=) if not yet built. Routing for the five files. Prerender notice is the same component, not re-skinned.

**Design tokens** — "reuse, do not redeclare. Any new token introduced in this gate is a bug."

**Shared editor shell** — built once, parameterised per file. Specifies:

- Page-top crumbs/head/prerender
- Two-pane layout (260 px keys rail + form pane)
- Keys rail: header chip, search, row states (default/hover/active/dirty/empty), + Add ghost button
- Form pane: head, 2-col grid, field anatomy (label/control/hint/charcount), focus rules, toggle switch geometry, combobox + resolution strip, preview block
- Save bar: dirty dot, status, ghost Discard + ochre Save, sticky inside main column

**Save behaviour** — whole-file PUT (not per-key), 200 path with inline success row + returned backup filename, 4xx validation surfacing per-field, 5xx generic error, no toasts, no auto-retry, no optimistic UI, no autosave. Discard confirms before reverting.

**Unsaved-changes guard** — beforeunload, key-switch confirm, file-switch confirm.

**Per-file specifications** — one section each for Countries / Regions / Castle quotes / Period picks / Browse bands. Each section gives:

- Display name + subtitle (verbatim)
- Keys-rail header, search placeholder, row composition, flag pills
- Form-head identifier chips
- A field table with key / label / control / required / hint copy / charcount cap
- Validation rules
- Preview surface (which public-site component it must match)

Browse bands gets the per-band card-stack treatment with three explicit default strings and per-band save-state UI but a whole-file PUT under the hood.

**Empty/error states** — {} file, adding a key, dirty-while-editing, unresolved castle code.

**A11y** — combobox is real ARIA combobox, toggle is role="switch", save bar status is aria-live="polite", validation errors aria-describedby.

**Anti-patterns** — same list as Gate 1+3 plus "no optimistic UI, no autosave, no per-key endpoints."

**Verification** — npm test, build, smoke, editorial test suite, plus four explicit curl checks (PUT happy path, missing bearer, unresolved castle code, post-save read + backup file existence). Visual cross-check against the five artboards.

**Closure** — close topcastles-4ed only, the same git pull --rebase / bd dolt push / git push / git status sequence, explicit instruction not to roll Gate 4 + Gate 5 into one PR.