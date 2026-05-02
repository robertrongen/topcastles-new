# UX And Product Execution Plan

This plan turns the approved UX and product improvement strategy into repo-executable work. It is intentionally docs-and-backlog oriented: implementation remains in follow-up beads, and roadmap authority stays in [roadmap.md](roadmap.md).

## Roadmap Coverage

This plan maps directly to these roadmap items:

- **9.5 design refresh** [DONE]: Storybook-led design refresh, cleaner visual style, stronger typography hierarchy, better whitespace rhythm, consistent light/dark theme treatment, and improved table density for top countries and top regions. Routine shared-component and public-page UX refresh work is complete.
- **9.6 homepage reference-atlas structure** [COMPLETED]: Full homepage layout including *From Today's Index*, *Distribution Map* with clickable atlas region callouts, *Top 10* reference table with editor's note, visitor ranking section, and sidebar reference column. See [product-strategy-plan.md](product-strategy-plan.md) §1 for the full structure.
- **9.6.1 By the Numbers strip** [COMPLETED]: Static statistics row between *From Today's Index* and the map. See workstream 3.5.1.
- **9.6.2 Top 10 Countries index** [COMPLETED]: Reference table with country, total score, best rank, and top-ranked castle. See workstream 3.5.2.
- **9.6.3 By Period index** [COMPLETED]: Reference table with era, entries, share, and example castle. See workstream 3.5.3.
- **9.7 Top Countries gazetteer table** [OPEN]: Dual-rank gazetteer with editor's notes, defining tradition, Editor's Sleeper badge, and sort-by-disagreement. See workstream 3.7.1.
- **9.8 Top Regions atlas cards** [OPEN]: Card-first layout with catalogue numerals, editorial descriptions, and Editor's Sleeper badge. SVG region glyphs deferred. See workstream 3.7.2.
- **9.9 "From Today's Index" editor's quote and override** [OPEN]: Editor's pull-quote with attribution below the Wikipedia extract; manual featured-castle override. See workstream 3.7.3.
- **10.3 PWA baseline / service worker** [COMPLETED]: Angular PWA setup, service worker registration, production-safe cache scope, manifest verification, and user-facing install/help UX are all complete. `topcastles-pwa-install-help` closed (`4c329ec`).
- **11.0 / 13.3 NAS image serving** [OPEN]: Single image access path, NAS-mounted image serving, cache-control and missing-file behavior, and eventual removal of bundled castle images if NAS serving becomes authoritative.
- **14.1 complete login behavior**: Complete the remaining token validation login behavior while preserving the file-based user model. [DONE]
- **15.1 to 15.2 admin shell** [OPEN]: Admin auth and protected route. Track B1 prerequisite.
- **15.8 editorial overlay editor** [OPEN]: Form-based admin UI for `/data/editorial/` files. Track B1 deliverable.
- **15.3 to 15.7 pipeline admin** [OPEN, Spec Kit required]: Castle edit/add, enrichment script execution, intro text editing, rebuild trigger. Track B2.

## Current Beads Snapshot

As of 2026-05-02, the backlog has cleared significantly since the last snapshot:

- `topcastles-g3i` [OPEN]: Phase 11 umbrella. Sub-items `topcastles-wj4` (castle of the week) and `topcastles-0b0` (autocomplete) are functionally delivered — see commits below. `topcastles-uax` (comparison view) remains open and deferred.
- `topcastles-uax` [OPEN, P4]: castle comparison view. No blocking dependency; deferred pending a design pass.

Previously tracked open issues that are now resolved:

- `topcastles-pwa-install-help` [CLOSED]: install/help entry added to header and sidenav (`4c329ec`).
- `topcastles-wj4` [functionally done]: Castle of the Week sidebar widget shipped (`4458888`). Bead should be closed.
- `topcastles-0b0` [functionally done]: autocomplete live on masthead search and top1000 page (`fdee0e6`, `9f13b69`, `1740b96`). Bead should be closed or superseded.

New open work from design review pass (2026-05-02):

- `topcastles-wft` [OPEN] — 3.6.1 "Top by visitor rating" layout fix
- `topcastles-chw` [OPEN] — 3.6.2 Top 1000 editorial header band
- `topcastles-7kz` [OPEN] — 3.6.3 Top Countries/Regions tile differentiation
- `topcastles-3e1` [OPEN] — 3.6.4 Period table "Editor's pick" column
- `topcastles-eeb` [OPEN] — 3.6.5 Smaller polish batch (footer, sidebar dedup, nav underline, score labels)

Recent commits used for this snapshot:

- `4c329ec`: PWA install/help entry added to header and sidenav.
- `4458888`: Castle of the Week sidebar widget added to homepage.
- `fdee0e6`, `9f13b69`: autocomplete added to masthead search and top1000, dark theme fixed.
- `1740b96`: `MatAutocompleteModule` deferred via `MastheadSearchComponent`.
- `c285df7`: masthead orange nav replaced with olive band + ochre rule.
- `3a3cafc`, `61ba0c5`: homepage hero redesigned as editorial dossier.
- `8baffe7`, `8643f78`: global atlas annotations added; default viewport adjusted.
- `8ac6894`: top countries and regions removed from sidebar widget.

## Strategy Summary

Work proceeds in two explicit tracks.

**Track A — UX Modernization** covers all visual and editorial identity improvements following the reference-atlas model. These are lightweight beads, high cadence, reviewable through Storybook and the running app. Claude Design mockups are the primary design input; they are exploration artifacts, not source of truth.

**Track B — Editorial System** covers the editorial content overlay, admin UI, and pipeline/enrichment workflows. Track B1 (editorial overlay + admin editor) is lightweight and does not require Spec Kit. Track B2 (pipeline admin, enrichment scripts, rebuild trigger) is architecture-sensitive and requires Spec Kit discipline before implementation.

The approved homepage UX model remains the **reference-atlas structure** defined in [product-strategy-plan.md](product-strategy-plan.md) §1. Key constraints for homepage work:
- *From Today's Index* (Top 100 random castle) must be visible on first paint — it is the homepage anchor.
- *Distribution Map* must precede the *Top 10* table in document flow.
- Sidebar is a reference column, not a promotional panel.
- Reference-table layout for Top 10, country index, and period index — not cards.
- Section labels must use the "medieval atlas" register.
- Methodology must be reachable from the footer.

The **editorial overlay** (`/data/editorial/`) is the new architectural concept that makes Track A Phase A2–A4 possible without touching the pipeline. It separates editor-owned content (notes, quotes, picks, sleeper flags) from pipeline-generated castle data. See workstream 8 for the full model.

All work must preserve the current architecture guardrails: JSON only, no database, no runtime mutation of prerendered content, single-container Node runtime, Angular Signals rather than NgRx, and the existing build-time content/runtime state split.

## Phased Workstreams

### 1. Storybook UX Baseline [DONE]

Expand shared-component stories before broad visual implementation. Cover dense, empty, mobile, desktop, light theme, and dark theme states where practical.

Primary surfaces:

- `CastleTableComponent`
- `CastleGridComponent`
- `CastleFilterComponent`
- `ViewToggleComponent`
- Top countries and top regions table states, either through existing page stories or extracted story-friendly presentation components

### 2. Shared Visual System Refresh [DONE]

Define the refreshed typography, spacing, density, color, and theme behavior in the smallest shared surfaces possible. The goal is a cleaner and more harmonic product look without changing app architecture or data flow.

Focus areas:

- Typography hierarchy for headings, summaries, metadata, and dense lists
- Whitespace rhythm across page sections, cards, filters, and repeated content
- Light/dark theme parity
- Table density and width behavior
- Mobile responsiveness and empty states

### 3. Public Page Refresh [DONE]

Apply the shared visual system incrementally to public routes after Storybook gives stable review surfaces.

Primary surfaces:

- Home
- Browse/top100
- Castle detail
- No-castle detail
- Country detail
- Top countries
- Top regions

### 3.5. Homepage Reference-Atlas Structure [COMPLETED]

The approved homepage layout has been implemented and validated as defined in [product-strategy-plan.md](product-strategy-plan.md) §1. This workstream is distinct from the general visual refresh: it establishes structural correctness and reference-atlas identity.

Completed UX targets:

- **From Today's Index**: random castle from Top 100, rendered as the primary content block on first paint. Includes castle name, country, rank, place, era, type, condition, Wikipedia extract, editorial score, and visitor rating. Server-side random selection via deterministic daily algorithm.
- **Distribution Map**: interactive map showing castle density by country with clickable markers and clickable atlas region callouts (Rhine & Moselle, Loire Valley, British Isles) that link to filtered browse views. Includes "Plate I" caption and editorial annotations for each region. Map appears in document flow before the Top 10 table as intended.
- **Top 10 of the List**: reference-table layout (not cards) displaying rank #, castle name, country, era, editorial score, and visitor rating. Includes column headers, links to individual castle detail pages, and link to full ranking.
- **Editor's note**: positioned with Top 10 section; explains ranking methodology (architectural significance, preservation, historical importance, accessibility) and provides link to full methodology documentation.
- **Top by visitor rating**: visitor lead card showing #1 visitor-rated castle with image, name, country, and visitor rating. Followed by table of #2–#5 visitor-rated castles (rank, name, country, rating). Distinct pool from editorial ranking; explains visitor rating independence.
- **Right sidebar**: narrow reference column with three widgets:
  - "About this list" widget: site description, history, visitor rating era context, links to methodology and selection criteria.
  - "Discover the list" widget: random castle picker from positions 100–1000 (distinct pool from Top 100); positioned as deep-discovery entry point.
  - "Tools" widget: "Top castle near me" geolocation button, links to favorites and data/API pages.
- **Typography and spacing**: follows shared visual system refresh (workstream 2); reference-table layout density, sidebar reference-column styling, and section label consistency applied.
- **Methodology link**: reachable from editor's note; link targets `/background` on every Top 10-adjacent section.

Design execution verified:
- No card-heavy layouts on the homepage.
- Reference-table structure used for rankings.
- Section labels and editorial voice follow "medieval atlas" register.
- Random elements are distinct and intentional: Top 100 for From Today's Index; positions 100–1000 for sidebar picker.

### 3.5.1. Homepage Polish — By the Numbers Strip [COMPLETED]

Static `<dl>` flex grid between *From Today's Index* and *Distribution Map*: 1,000 castles · 56 countries · 63,800 visitor ratings · Est. 2004. No TS changes; values are compile-time constants; light/dark handled by `--tk-*` tokens.

### 3.5.2. Homepage Polish — Top 10 Countries Index [COMPLETED]

Reference table after *Top by visitor rating*. Columns: rank, country (link to `/countries/:country`), total score (the sort key), best rank, top-ranked castle with rank in brackets (link to `/castles/:code`). Derived from `CastleService.getCountrySummaries()` via `top10Countries` computed signal in `HomePageComponent`.

### 3.5.3. Homepage Polish — By Period Index [COMPLETED]

Reference table after *Index of Top Countries*. Columns: period label (link to `/castles?era=N`), entries, share of era-tagged castles, example castle with rank in brackets. Derived from `castleService.castles()` grouped by `c.era` in `byPeriod` computed signal; null era excluded; sorted chronologically (9th–17th c.).

### 3.6. Homepage And Browse Polish — Design Review Pass (2026-05-02)

New items from design review. Scope is visual polish only — no architecture changes.

#### 3.6.1. "Top by visitor rating" layout fix [OPEN]

Burg Eltz at #1 occupies a full hero block while ranks 2–5 sit in a smaller adjacent table. The asymmetry reads as accidental. Two acceptable resolutions:

- **Option A (consistent table)**: shrink the #1 block to match table row height — uniform treatment for all five.
- **Option B (magazine cards)**: commit to the large-card format and render ranks 2–5 as equally-sized cards in a four-column row.

Pick one; the current mixed height is the problem to fix.

#### 3.6.2. Top 1000 grid — editorial header band [OPEN]

The browse/top1000 grid is pure tile with no editorial framing. Add a narrow header band above the current tile area when viewing a rank sub-range (e.g. "Ranks 985–1000") with a one-line editor's note in atlas register (example: "These are the long tail: minor structures, fragments, or lesser-known fortifications."). Scope is header text only; tile grid and filter UI unchanged.

#### 3.6.3. Top Countries / Top Regions tile differentiation [OPEN]

Every country/region tile is visually identical. Two lightweight options:

- Highlight the top 3 tiles with an ochre border or badge.
- Add a single editorial line per top tile ("France: the densest catalogue, dominated by Loire châteaux").

Either adds curatorial identity without structural changes to the tile grid.

#### 3.6.4. Period table — "Editor's pick" column [OPEN]

The "Index by Period" table currently shows: Period · Entries · Share · Example Castle. Add a 5th column — **Editor's pick** — with one starred pick per era rendered in italic prose style (e.g. "★ Krak des Chevaliers"). Data is static editorial content; no data-pipeline change required.

#### 3.6.5. Smaller polish batch [OPEN]

Four lightweight fixes, suitable for a single bead:

- **Footer**: replace single-line credit with a thin three-column structure: Browse / Contribute / About.
- **Sidebar duplication**: "Castle of the Week" widget and "DISCOVER THE LIST" CTA serve the same function — remove one; keep whichever has the stronger entry-point framing.
- **Nav active state**: replace dark pill active indicator with a 2 px ochre underline on the active nav item.
- **Score unit labels**: display "620 / 1000" and "6.7 / 10" (or equivalent suffix) wherever editorial score and visitor rating appear as bare numbers.

### 3.7. Claude Design Targets — Editorial Identity (2026-05) [OPEN]

New layout targets from Claude Design. These go beyond polish — they restructure key pages around the editorial identity established in the reference-atlas model. Each target requires editorial overlay data (§8) to source real content; placeholder content is acceptable during initial layout work.

#### 3.7.1. Top Countries gazetteer table [OPEN]

Redesign the Top Countries page as a full gazetteer table. The current tile grid has no editorial framing and no ranking hierarchy. The new layout:

- Dual rank columns: editorial rank (★) and visitor rank, with direction arrows showing where they diverge.
- Additional columns: flag/country code, entries, mean score, defining tradition (italic), editor's note, top entry.
- Sort toggle: by editorial rank / by visitor rank / by disagreement (most interesting for revealing editor/visitor splits).
- "Editor's Sleeper" badge on entries with high editorial rank and low visitor traffic.
- Data sourced from computed signals (existing `getCountrySummaries()`) merged with `/data/editorial/countries.json`.

Bead: create new (`topcastles-ecg`).

#### 3.7.2. Top Regions atlas cards [OPEN]

Redesign the Top Regions page as a card grid in atlas plate style. The current tile layout has no editorial identity or rank hierarchy. The new layout:

- Catalogue numeral prefix (№ 01–08) as primary visual identifier.
- Editorial and visitor rank with direction arrows.
- Editorial description (one sentence, italic).
- Editor's Sleeper badge where applicable.
- Entries count and mean score.
- SVG region glyphs (hand-drawn topology silhouettes) — deferred to a later pass; cards use text-only layout initially.
- Data sourced from existing region summaries merged with `/data/editorial/regions.json`.

Bead: create new (`topcastles-reg`).

#### 3.7.3. "From Today's Index" — editor's quote and manual override [OPEN]

The current featured entry block shows Wikipedia text and scores. Add:

- A pull-quote block below the Wikipedia extract: editor's quote in italic, author name, author role (e.g. "Contributing Editor"), date.
- Sourced from `/data/editorial/castle-quotes.json` keyed by castle code; gracefully absent if no quote exists for the featured castle.
- Manual override: the editorial JSON can pin a specific castle as the featured entry for a given date range, taking priority over the deterministic daily algorithm. The editorial admin (§8) provides a field for this.

Bead: create new (`topcastles-fqi`).

### 4. NAS Image Serving Hardening [DONE]

Complete image serving as a runtime-sensitive workstream. Keep a single app-facing image access path and verify mounted-volume behavior before changing container image assumptions.

### 5. Login Completion [DONE]

Complete the remaining user login behavior around the existing token model. This should stay narrow unless it reveals a broader auth contract issue.

### 6. PWA And Offline Browsing [COMPLETED]

The production-safe PWA baseline is complete: the service worker is registered, static app assets and build-time JSON are cached deliberately, and NAS-served castle images are excluded from the service worker cache. `topcastles-pwa-install-help` is closed: an install/help entry was added to the header and sidenav (`4c329ec`), with `beforeinstallprompt` handling and browser-specific fallback instructions. `ngsw-config.json` was not changed. No remaining open work in this workstream unless a Spec Kit pass deliberately re-scopes PWA caching.

### 7. Admin API And Admin UI Workflow [OPEN]

Build admin capabilities in strict sequence: auth, shell, edit/add content, enrichment, intro text, rebuild trigger. Treat this as Spec Kit work because admin features affect JSON writes, pipeline execution, and prerender freshness.

### 8. Editorial Overlay Architecture [OPEN]

The editorial overlay is a set of editor-owned JSON files that provide the content backing for Track A Phase A2–A4 layouts. These files are separate from and never overwritten by the data pipeline.

**File structure at `/data/editorial/`:**

- `countries.json` — keyed by country code. Fields: `editorialNote` (short prose), `definingTradition` (short label), `topEntry` (castle code), `editorSleeper` (boolean).
- `regions.json` — keyed by region slug. Fields: `description` (one sentence), `editorSleeper` (boolean).
- `castle-quotes.json` — keyed by castle code. Fields: `quote` (prose), `author`, `role`, `date`; optional `featuredUntil` (ISO date string for manual featured-entry override).
- `period-picks.json` — keyed by era identifier. Fields: `pick` (castle name in display form), `castleCode`.

**Merge strategy:** app reads editorial overlay at build time (Angular build step) and merges into computed signals or template bindings. No pipeline involvement. If an overlay file is missing or a key is absent, the UI degrades gracefully (omits the editorial column or quote).

**Admin editor (§15.8):** form-based UI in the protected `/admin` route. One section per overlay file. Writes via `PUT /api/admin/editorial/:file` through `json-store.js`. No rebuild required for editorial-only changes — but prerendered pages will not reflect them until the next build.

**Lightweight vs Spec Kit:** editorial overlay editing is Track B1 — lightweight, no pipeline involvement. Keep it out of the Spec Kit queue.

## Implementation Bead Backlog

Recommended backlog ordering:

1. Expand Storybook coverage for UX refresh baseline. [DONE]
2. Define theme tokens, typography scale, spacing rhythm, and dark theme parity. [DONE]
3. Refresh shared castle table, grid, filter, and view-toggle components. [DONE]
4. Improve top countries and top regions table layout density. [DONE]
5. Refresh homepage and browse/top100 public UX surfaces. [DONE]
6. Refresh castle detail, no-castle detail, and country detail UX surfaces. [DONE]
7. Implement homepage polish items (9.6.1–9.6.3): By the Numbers strip, Top 10 Countries index, By Period index. See workstream 3.5.1–3.5.3. [DONE]
8. Complete token login endpoint and client behavior. [DONE]
9. Complete PWA install/help UX (`topcastles-pwa-install-help`). [DONE — `4c329ec`]
10. Verify and close `topcastles-0b0` — autocomplete is live (`fdee0e6`, `9f13b69`). [DONE — close bead]
11. Castle of the Week on homepage (`topcastles-wj4`). [DONE — `4458888` — close bead]

**Track A — §3.6 design review polish (current):**

11a. `topcastles-eeb` — Design review polish batch (§3.6.5): footer columns, sidebar CTA dedup, nav underline, score unit labels. [OPEN]
11b. `topcastles-wft` — Fix "Top by visitor rating" layout asymmetry (§3.6.1). [OPEN]
11c. `topcastles-chw` — Top 1000 editorial header band (§3.6.2). [OPEN]
11d. `topcastles-7kz` — Top Countries/Regions tile differentiation (§3.6.3). [OPEN]
11e. `topcastles-3e1` — Period table "Editor's pick" column (§3.6.4). [OPEN]

**Track A — §3.7 Claude Design targets (next phase):**

12a. Define editorial JSON schema and create placeholder `/data/editorial/` files. [B0 — no code, docs only]
12b. Top Countries gazetteer table (§3.7.1). [OPEN — create bead]
12c. Top Regions atlas cards (§3.7.2). [OPEN — create bead]
12d. "From Today's Index" editor's quote and manual override (§3.7.3). [OPEN — create bead]

**Track B1 — Editorial System (can overlap with Track A §3.7):**

13a. Admin shell and token login (§15.1–15.2). [OPEN — create bead]
13b. Editorial overlay editor UI (§15.8). [OPEN — create bead]

**Track B2 — Pipeline Admin (Spec Kit required, deferred):**

14. Harden NAS image serving and mounted-volume verification.
15. Plan pipeline admin workflow with Spec Kit.
16. Implement castle edit, add, enrichment, and rebuild trigger workflows (§15.3–15.7).

## Dependencies And Sequencing

- Storybook coverage should precede visual refresh implementation.
- Theme, typography, spacing, and density decisions should precede page-by-page styling.
- Shared table/grid/filter work should precede top countries and top regions layout refinements.
- Castle images must remain outside the service worker cache unless a future Spec Kit pass changes the image-serving strategy deliberately.
- Admin API auth must precede admin UI and content workflows.
- Admin edit/add/enrichment/rebuild work must preserve the pipeline rule that prerendered content updates only after regeneration and build.

## Acceptance Criteria By Workstream

### Storybook UX Baseline

- Key shared components have stories for default, dense, empty, mobile, and desktop states where relevant.
- Storybook can be used to review light/dark theme behavior for shared UI.
- Stories use repo-local mock data and do not introduce runtime dependencies.

### Shared Visual System Refresh

- Typography hierarchy is clearer across headings, summaries, metadata, and dense lists.
- Whitespace rhythm is consistent across sections, cards, filters, and repeated content.
- Light and dark themes share one coherent visual direction rather than isolated fixes.
- Changes are incremental and reviewable through Storybook and public pages.

### Public Page Refresh

- Home, browse/top100, detail, country, top countries, and top regions pages reflect the refreshed shared system.
- Top countries and top regions tables avoid unnecessary full-width presentation on large screens.
- Mobile layouts remain readable and do not rely on horizontal whitespace.

### NAS Image Serving

- Castle image URLs go through a single service or equivalent access path.
- Runtime image serving works from the NAS mount with expected cache-control and 404 behavior.
- Container image assumptions are updated only after NAS serving is authoritative.

### Login Completion

- `POST /api/user/login` validates an existing token and returns the user object.
- Missing or invalid tokens return `401`.
- User state remains in `/data/users.json` through `json-store.js`.

### PWA / Service Worker

- Service worker registration is production-safe.
- Static assets and castle JSON are cached deliberately for offline browsing.
- Cache behavior does not obscure content freshness expectations.
- Manifest supports mobile add-to-home-screen behavior.
- Install/help UX explains when the browser install prompt is available and gives concise fallback instructions when it is not.

### Admin API/UI Workflow

- `/api/admin/...` routes require `Authorization: Bearer <token>` from `ADMIN_TOKEN`.
- Admin UI token storage is separate from regular user token behavior.
- Admin JSON writes go through `json-store.js`.
- Admin content changes trigger or clearly require regeneration/rebuild before prerendered pages reflect them.
- No runtime endpoint mutates prerendered HTML, JavaScript bundles, or other build artifacts in place.

## Lightweight Vs Spec Kit Classification

Use the normal lightweight Topcastles flow for:

- Storybook coverage.
- Shared visual tokens.
- Shared component refresh.
- Top countries/top regions layout density.
- Public page visual refresh.
- Narrow token login completion if it stays within the existing file-based user model.

Use fuller Spec Kit flow for:

- PWA/service worker work.
- NAS image-serving work that changes deployment, container, cache, or runtime assumptions.
- Admin API and admin UI work.
- Enrichment and rebuild-trigger workflows.
- Any change that could blur build-time content and runtime state.

## Next Execution Beads

Updated 2026-05-02. Two tracks now active.

**Track A — §3.6 polish (immediate, pick one):**
- `topcastles-wft` — highest-visibility: visitor rating layout asymmetry is the most prominent accidental mismatch on the homepage.
- `topcastles-eeb` — lowest-risk: four self-contained visual fixes, no structural change.

**Track A — §3.7 Claude Design targets (next phase after §3.6):**
- Start with B0 (editorial JSON schema, no code) in parallel with finishing §3.6.
- Then implement §3.7.1–3.7.3 with placeholder editorial content initially.

**Track B1 — Editorial system (can start in parallel with §3.7):**
- Admin shell (§15.1–15.2) is a prerequisite for the editorial editor (§15.8).
- Editorial editor can be implemented immediately once the shell is done — no Spec Kit needed.

**Deferred / Spec Kit required:**
- `topcastles-uax` (comparison view) — deferred; needs a design pass before implementation.
- NAS image serving hardening — needs Spec Kit before changing deployment assumptions.
- Pipeline admin (§15.3–15.7) — Spec Kit required; do not conflate with Track B1 editorial editor.

## Roadmap Wording Gaps To Revisit Later

- The roadmap already mentions NAS image serving, but current code contains part of the server-route baseline. A later docs-only pass could clarify remaining work versus completed baseline.
- The roadmap lists Storybook as part of the design refresh, while `docs/storybook.md` already documents existing stories. A later docs-only pass could cross-link these once the execution backlog starts.
- Admin item 11.5 covers the staged upload endpoint pair; remaining admin UI and editorial editor behavior is now under 15.8 (Track B1) and 15.3–15.7 (Track B2).
