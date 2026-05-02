# Roadmap

This is the active forward-looking worklist for Topcastles. Current runtime architecture is documented in [architecture.md](architecture.md), contributor workflow in [../DEVELOPER.md](../DEVELOPER.md), artifact policy in [pipeline.md](pipeline.md), and completed migration history in [migration-report.md](migration-report.md).

## Resolved Issues Snapshot (as of 2026-04-23)

Recent resolved Beads issues already delivered in this repo:

- Data pipeline and artifact governance: `DP-001` to `DP-006`, `CLEANUP-004`, `topcastles-6ee`, `topcastles-82b`.
- Runtime server baseline and deployment hardening: `topcastles-3w1`, `topcastles-ap2`, `topcastles-hgw`, `topcastles-6s3`, `topcastles-0d1`, `topcastles-d73`, `topcastles-lmw`.
- Images and detail-page image behavior: `IMG-001`, `IMG-002`, `topcastles-r0p`, `topcastles-52t`.
- Build/prerender/runtime quality fixes: `topcastles-76n`, `topcastles-cc9`, `topcastles-v83`, `topcastles-p0u`, `topcastles-o52`.
- User/favorites phase delivery: `topcastles-08a`, `topcastles-vbq`, `topcastles-3c6`, `topcastles-h3j`, `topcastles-ul8`, `topcastles-rye`, `topcastles-c5z`, `topcastles-6kg`, `topcastles-w8e`, `topcastles-d17`, `topcastles-1iu`, `topcastles-1vg`, `topcastles-d7g`.
- Workflow/tooling/docs foundations: `topcastles-2mn`, `topcastles-44i`, `topcastles-ozy`, `topcastles-3rm`, `TEST-001`.

Note: some umbrella phase issues remain open as coordination trackers even when sub-issues above are already completed.

## Current Beads Snapshot (2026-05-02)

Work is structured in two explicit tracks. See [ux-product-execution-plan.md](ux-product-execution-plan.md) for full sequencing.

**Track A — UX Modernization**: visual and editorial identity improvements following the reference-atlas model. Lightweight beads, high cadence.

**Track B — Editorial System**: editorial content overlay, admin UI, and pipeline/enrichment workflows. Architecture-sensitive; lower cadence.

**Track A — current open beads (§3.6 polish):**

- `topcastles-wft` — visitor rating layout fix.
- `topcastles-chw` — Top 1000 editorial header band.
- `topcastles-7kz` — Top Countries/Regions tile differentiation.
- `topcastles-3e1` — Period table Editor's pick column.
- `topcastles-eeb` — smaller polish batch (footer, sidebar dedup, nav underline, score labels).

**Track A — upcoming (Phase A2–A4, Claude Design targets):**

- Top Countries gazetteer table — dual rank, editor's note, defining tradition, Editor's Sleeper badge (§9.7).
- Top Regions atlas cards — card layout with editorial description and Editor's Sleeper badge (§9.8).
- "From Today's Index" editor's quote block — curated quote with attribution and manual override (§9.9).

**Track B — upcoming:**

- Define editorial JSON schema (`/data/editorial/`) for countries, regions, castle quotes, period picks (§B0).
- Admin shell and token login — protected `/admin` route, token entry, `ADMIN_TOKEN` auth (§15.1–15.2).
- Editorial editor UI — form-based editor for editorial overlay files (§15.8).

**Deferred / Spec Kit required:**

- `topcastles-uax` — castle comparison view (P4, needs design pass).
- `topcastles-g3i` — Phase 11 umbrella.
- NAS image serving hardening — needs Spec Kit before deployment changes.
- Pipeline admin (15.3–15.7) — enrichment scripts, rebuild trigger; Spec Kit required.

## Known Baseline Issues

- **TD-1: Fix pre-existing unit test failures / test runner reliability** [RESOLVED]
  - Historical note from the modernization plan: 77 of 176 specs failed consistently, with 99 passing.
  - Suspected root cause recorded there: `castle-detail-page.component.spec.ts` leaves an open HTTP request for `/assets/data/castles_delta.json`; `HttpClientTestingBackend.verify()` flags it at teardown, cascading across the suite.
  - Resolved: subsequent feature bead work (castle-detail Phase 2.x/4.x) rewrote the spec with correct `httpTesting.match('/assets/data/castles_delta.json').forEach(r => r.flush([]))` teardown and `PLATFORM_ID: 'server'` to prevent browser-specific HTTP calls. `npm test -- --watch=false --browsers=ChromeHeadless` now produces 176/176 SUCCESS in ~1.3 s.

## Data Pipeline And Content Ownership

This roadmap is the execution layer for data pipeline work. [pipeline.md](pipeline.md) remains the source of truth for artifact classification and regeneration rules, [pipeline-flow.md](pipeline-flow.md) maps the current flow and `old_app/` extraction plan, and [architecture.md](architecture.md) remains the source of truth for data flow, the JSON-only model, and build-time versus runtime separation.

### Goal

- Establish a single canonical source of castle content.
- Keep the regeneration pipeline deterministic and repeatable.
- Make ownership of generated artifacts unambiguous.
- Make it clear where a content change starts and how it propagates through source data, generated JSON, static API files, sitemap output, prerender routes, and the app build.
- Preserve the existing constraints: JSON-only content, Node server runtime entry point, single-container deployment, strict separation of build-time content from runtime state, and no runtime mutation of prerendered artifacts.

### DP-1: Map the current pipeline end-to-end

- Done: current flow, artifact ownership, active `old_app/` dependencies, and extraction targets are mapped in [pipeline-flow.md](pipeline-flow.md).
- Document the flow from `source-data/topcastles/` through `scripts/`, generated JSON, static API slices, sitemap output, prerender routes, and Angular app consumption.
- Identify the transformation steps and their required order.
- Cross-check the map against [pipeline.md](pipeline.md) rather than duplicating artifact rules here.

### DP-2: Define canonical source of truth

- Done: `source-data/topcastles/Topcastles export.xlsx` is the canonical source for ingestion.
- Record future source-of-truth changes in the appropriate docs if they change the current artifact policy.
- Keep `old_app/database/` archival unless a future task deliberately extracts or removes remaining legacy exports.

### DP-3: Create a single canonical pipeline command

- Done: `npm run data:regenerate` runs the full data regeneration workflow in the supported order.
- Keep the command aligned with the existing steps listed in [pipeline.md](pipeline.md).
- Ensure the command remains compatible with the current JSON-only, build-time content model.

### DP-4: Validate generated artifact ownership

- Done: generated artifact ownership is documented in the ownership matrix in [pipeline.md](pipeline.md).
- Generated-and-committed artifacts, generated-and-ignored artifacts, and runtime-only state are now classified without changing the runtime model.

### DP-5: Eliminate pipeline ambiguity

- Done: contributor guardrails in [pipeline.md](pipeline.md) and root `README.md` now identify the canonical source, `npm run data:regenerate`, and the required follow-up `npm run build`.
- Generated artifacts are explicitly documented as pipeline outputs, not hand-edit targets.
- Admin and rebuild-trigger guidance now reflects that prerendered output changes only after regeneration and build.

### DP-6: Prepare for eventual `old_app` decoupling

- Done: current `old_app/` dependency status is classified in [pipeline-flow.md](pipeline-flow.md).
- Active ingestion uses `source-data/topcastles/Topcastles export.xlsx`; remaining `old_app/` references are transitional test/archive coverage or historical documentation.
- Future decoupling work should stay incremental and preserve the artifact boundaries documented in [pipeline.md](pipeline.md).

## UX And Product Improvements

- **9.5: Design refresh with Storybook and Figma/Penpot exploration** [DONE]
  - Storybook coverage expanded; shared components, typography, whitespace, and light/dark theme parity updated.
  - The approved design direction is the **reference-atlas model**: "Wikipedia meets Michelin Guide meets a medieval atlas." See [product-strategy-plan.md](product-strategy-plan.md) §1 for the rationale and homepage structure.

- **9.6: Homepage reference-atlas structure** [COMPLETED]
  - The approved homepage layout has been implemented as defined in [product-strategy-plan.md](product-strategy-plan.md) §1.
  - Completed sections:
    1. *From Today's Index* — random castle from Top 100; homepage anchor; visible on first paint.
    2. *Distribution Map* — geographic overview with "Plate I" caption and clickable atlas region callouts (Rhine & Moselle, Loire Valley, British Isles) linking to filtered browse views; appears before ranking table.
    3. *Top 10 of the List* — reference-table layout showing rank, castle name, country, era, editorial score, and visitor rating.
    4. *Editor's note* — positioned with ranking methodology explanation and link to full methodology.
    5. *Top by visitor rating* — visitor lead (#1) with featured castle card and table showing #2–#5 visitor-rated castles.
    6. Right sidebar (reference column) — "About this list" widget, "Discover the list" random castle picker (positions 100–1000), and "Tools" widget.
  - Design execution: no card-heavy layouts; reference-table structures used; section labels follow "medieval atlas" register; methodology reachable from every page.

- **9.6.1: Homepage polish — By the Numbers strip** [COMPLETED]
  - Static statistics row between *From Today's Index* and *Distribution Map*: 1,000 castles · 56 countries · 63,800 visitor ratings · Est. 2004.
  - Implemented as a `<dl>` flex grid using `--tk-*` design tokens; no TS changes; light/dark via existing token system.

- **9.6.2: Homepage polish — Top 10 Countries index** [COMPLETED]
  - Reference table after *Top by visitor rating*: rank, country (link to `/countries/:country`), total score (sorted), best rank + top-ranked castle (link to `/castles/:code`).
  - Data derived from `CastleService.getCountrySummaries()` via a `top10Countries` computed signal in `HomePageComponent`. No new service methods.

- **9.6.3: Homepage polish — By Period index** [COMPLETED]
  - Reference table after *Index of Top Countries*: period (link to `/castles?era=N`), entries count, share of era-tagged castles, top-ranked example castle (link to `/castles/:code`).
  - Data derived from `castleService.castles()` grouped by `c.era` in a single `byPeriod` computed signal; null era values excluded; sorted chronologically.

- **9.7: Top Countries gazetteer table** [OPEN]
  - Redesign the Top Countries page as a dual-rank gazetteer table.
  - Columns: flag/code, country, editorial rank (★), visitor rank (with direction arrow), entries, mean score, defining tradition, editor's note, Editor's Sleeper badge, top entry.
  - Sort toggle: by editorial rank / by visitor rank / by disagreement.
  - Editor's notes and defining traditions sourced from `/data/editorial/countries.json`.
  - "Editor's Sleeper" badge applied to high-editorial, low-visitor entries.
  - Bead: `topcastles-ecg` (create).

- **9.8: Top Regions atlas cards** [OPEN]
  - Redesign Top Regions page as a card grid in atlas plate style.
  - Each card: catalogue numeral (№ 01–08), editorial and visitor ranks with direction arrows, editorial description, Editor's Sleeper badge where applicable, entries count, mean score.
  - SVG region glyphs deferred — cards use text-only layout initially.
  - Region descriptions sourced from `/data/editorial/regions.json`.
  - Bead: `topcastles-reg` (create).

- **9.9: "From Today's Index" — editor's quote and manual override** [OPEN]
  - Add a curated editor's quote block below the Wikipedia extract on the featured entry.
  - Quote includes: pull-quote text, author name, author role (e.g. "Contributing Editor"), and date.
  - Sourced from `/data/editorial/castle-quotes.json` keyed by castle code.
  - Manual override: the editorial JSON can designate a specific castle as the featured entry for a given date range, overriding the deterministic daily algorithm.
  - Bead: `topcastles-fqi` (create).

- **10.3: PWA baseline / production-safe service worker configuration** [COMPLETED]
  - `@angular/service-worker` installed and registered via `provideServiceWorker` in `app.config.ts`.
  - `ngsw-config.json` corrected: raster image globs (`jpg/png/webp/gif`) removed from all asset
    groups to prevent the NAS-served `/castle-images/*` files from being absorbed into the SW
    cache manifest. Production `ngsw.json` now contains 57 hashed entries (down from 6,777).
  - Castle images remain network-only; the Node server's `max-age:1d` header is the cache layer.
  - `manifest.webmanifest` and all 8 PWA icon sizes present and correct.
  - SW cache strategy documented in `docs/deployment.md` — Service Worker section.
  - Intentionally deferred (not part of this baseline):
    - Install prompt UX
    - Offline UX refinement beyond NGSW navigation fallback
    - `skipWaiting` / update notification UI
  - Active follow-up: `topcastles-pwa-install-help` adds visible install/help UX and browser fallback instructions.

## Infrastructure And Runtime Data

- **11.0 / 13.3: Serve castle images from Synology NAS**
  - Add an image base URL or image-serving route so castle images can come from a NAS mount instead of the app bundle.
  - Replace hard-coded `/images/castles/...` references through an `ImageService` or equivalent single access path.
  - Exclude bundled castle images from container builds if NAS serving becomes authoritative.
  - Configure CORS or same-origin serving as needed.
  - Verify image requests against the mounted volume with cache-control and missing-file behavior.

- **13.4: Data volume structure and initialization (partial)**
  - Done: `data/` is ignored; `deploy.sh` mounts `/volume1/docker/topcastles/data` as `/data`; `json-store.js` creates directories on first write.
  - Remaining: ensure `/data/users.json` exists at server startup with `{ "users": [] }` if absent.
  - Remaining: ensure `/data/content.json` exists if runtime intro text becomes active.
  - Remaining: document `/data` and `/images` volume mounts in deployment docs or compose examples.

- **13.6: Smoke tests for server migration**
  - Verify static Angular pages load, including home, castle detail, and country/deep routes.
  - Verify hard-refresh on a deep route returns the app shell.
  - Verify image serving from the mounted volume once image serving exists.
  - Verify gzip behavior with `Accept-Encoding: gzip`.

- **Editorial Overlay (`/data/editorial/`)** [OPEN]
  - Editor-owned JSON files that sit alongside pipeline-generated data without touching it.
  - `castles_enriched.json` stays pipeline-owned; editorial voice stays editor-owned and never conflicts with enrichment scripts.
  - File structure (see [docs/editorial-overlay.md](editorial-overlay.md) for full schema):
    - `countries.json` — editor's note, defining tradition, top entry, Editor's Sleeper flag per country code.
    - `regions.json` — editorial description, Editor's Sleeper flag per region.
    - `castle-quotes.json` — editor's quote, author, role, date per castle code; optional `featuredUntil` override.
    - `period-picks.json` — editor's starred pick per era.
    - `browse-bands.json` — one-line editorial note per rank band for the Top 1000 browse page.
  - Served by Node at `GET /api/editorial/:file`; Angular reads at runtime. No build-time merge.
  - Prerendered pages do not include overlay data — editorial content loads after hydration.
  - Admin editorial editor (§15.8) writes only to these files; enrichment scripts never touch them.
  - Mounted at `/data/editorial/` on the NAS volume alongside `/data/users.json`.

- **11.5: Admin API for JSON content updates**
  - Original intent: upload refreshed `castles_enriched.json` to the live server without a full Docker image build.
  - Use the embedded Node server in the single container; no sidecar or Synology Task Scheduler.
  - Auth via `ADMIN_TOKEN` and `Authorization: Bearer <token>`.
  - Preserve the architecture constraint: build-time content and runtime state stay separate, and prerendered/build artifacts are not mutated in place.
  - Done: `POST /api/admin/upload-enriched` stages a validated enriched JSON upload under `/data/pending/`, and `GET /api/admin/pending-status` reports staged state.
  - Done: operator documentation for the staged upload flow lives in `docs/deployment.md`.
  - Remaining admin UI and rebuild behavior belongs under the 15.x admin workflow; do not expand 11.5 further.

## User Accounts

- **14.1: Complete login behavior**
  - Done: `POST /api/user/register` creates a user record in `/data/users.json` and returns `{ token }`.
  - Done: `GET /api/user/me` returns `{ id, favorites }` from the Bearer token.
  - Done: `POST /api/user/login` validates an existing token and returns the user object.
  - Keep the ADR-009 file-based model: token is stored in `users.json`; all writes go through `json-store.js`.

## Admin UI And Editorial Editor

The admin system has two distinct sub-tracks. **Track B1** covers the editorial content editor — lightweight, no pipeline involvement, can be built independently. **Track B2** covers the pipeline/enrichment admin — architecture-sensitive, Spec Kit required before implementation.

### Track B1 — Editorial Content Editor

- **15.1: Admin API auth** [OPEN]
  - Protect `/api/admin/...` routes with `Authorization: Bearer <token>`.
  - Read token from `ADMIN_TOKEN` at server startup.
  - Return 401 for missing or invalid token.

- **15.2: Admin UI shell** [OPEN]
  - Add protected `/admin` route.
  - Add `/admin/login` token entry form.
  - Store admin token in `localStorage`.
  - Hide admin navigation for regular users.

- **15.8: Editorial overlay editor** [OPEN]
  - Form-based editor UI for `/data/editorial/` files.
  - Country editor: edit note, defining tradition, top entry, Editor's Sleeper flag.
  - Region editor: editorial description, Editor's Sleeper flag.
  - Castle quote editor: quote text, author, role, date; featured-date override field.
  - Period picks editor: one starred pick per era.
  - All writes go through `json-store.js`; no pipeline involvement.
  - Changes take effect at next build (prerender refreshes editorial content from `/data/editorial/`).

### Track B2 — Pipeline And Enrichment Admin (Spec Kit Required)

- **15.3: Edit castle data**
  - `PUT /api/admin/castles/:code` updates fields in `castles_enriched.json`.
  - Admin form covers name, country, region, coordinates, castle type, condition, and score overrides.
  - Writes go through `json-store.js`; rebuild required for prerendered pages to reflect changes.

- **15.4: Add a new castle**
  - `POST /api/admin/castles` appends a new castle entry.
  - Validate required fields and code uniqueness.
  - Prompt for enrichment and rebuild after save.

- **15.5: Run enrichment scripts**
  - Spawn `enrich_wikipedia.js` and `enrich_wikidata.js` from admin API endpoints.
  - Stream logs to the admin UI and return completion status.

- **15.6: Edit introduction text**
  - `PUT /api/admin/content/intro` writes intro text to `/data/content.json` via `json-store.js`.
  - Homepage should read runtime content only if this feature is implemented deliberately.

- **15.7: Trigger rebuild**
  - Run the build/regeneration pipeline from an admin endpoint.
  - Stream progress and final success/failure.
  - Required for content changes; user data changes take effect immediately.

## Postponed Ideas

- **11.1: Castle comparison view**
  - Select 2-3 castles and compare them side-by-side.
  - Use URL query params such as `/compare?codes=nl001,de023` for cross-page state.
  - Bead: `topcastles-uax`.

- **11.2: Structured data (JSON-LD)**
  - Add `schema.org/LandmarksOrHistoricalBuildings` JSON-LD to detail pages.
  - Pair with existing SEO/meta work.

- **11.3: Accessibility audit**
  - WCAG 2.1 AA audit covering keyboard navigation, focus, ARIA roles, map markers, and colour contrast.
  - Use axe or Lighthouse with a target score of at least 90.

- **11.4: Castle of the week**
  - Deterministic homepage feature based on ISO week number and year.
  - Bead: `topcastles-wj4`.

## Dependency Notes

- Phase 13 is a prerequisite for Phase 15 admin work.
- `json-store.js` is required for user and admin JSON write routes.
- Phase 1 enrichment scripts already exist and are prerequisites for admin enrichment endpoints.
- Rebuild/admin-trigger work depends on the prerender route and sitemap generation pipeline.
- Editorial overlay (`/data/editorial/`) must be defined (§B0) before Track A Phase A2–A4 layouts can source real content; placeholder hardcoded content is acceptable during initial layout implementation.
- Track B1 (editorial editor, §15.8) can be implemented independently of Track B2 (pipeline admin, §15.3–15.7) — do not block editorial editor on enrichment script work.
