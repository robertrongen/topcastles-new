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

## Known Baseline Issues

- **TD-1: Fix pre-existing unit test failures / test runner reliability**
  - Historical note from the modernization plan: 77 of 176 specs failed consistently, with 99 passing.
  - Suspected root cause recorded there: `castle-detail-page.component.spec.ts` leaves an open HTTP request for `/assets/data/castles_delta.json`; `HttpClientTestingBackend.verify()` flags it at teardown, cascading across the suite.
  - Later work reduced the failure count from 77 to 73, but the cleanup passes now observe `npm test -- --watch=false --browsers=ChromeHeadless` timing out.
  - Goal: restore a reliable regression signal.

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

- **9.5: Design refresh with Storybook and Figma/Penpot exploration**
  - Expand Storybook coverage before the redesign begins.
  - Use design exploration or prototyping to establish a cleaner, more harmonic visual direction before implementation.
  - Refine typography hierarchy and relative font sizing so headings, summary text, metadata, and dense lists have clearer priority.
  - Improve whitespace consistency and layout rhythm across page sections, cards, filters, and repeated content.
  - Modernize the overall visual language so the product no longer feels dated, while preserving the current app architecture and content model.
  - Improve consistency across both light and dark themes instead of treating dark mode as isolated fixes.
  - Make table layouts scale more deliberately, especially top countries and top regions, so they avoid unnecessary full-width presentation and excessive whitespace on larger screens.
  - Candidate areas: typography scale, card layout, colour hierarchy, table density and width behavior, mobile responsiveness, and empty states.

- **10.3: PWA / service worker**
  - Add `@angular/pwa`, generate `ngsw-config.json`, and register the service worker.
  - Cache `castles_enriched.json` and static assets for offline browsing.
  - Add or verify the web app manifest for mobile "Add to home screen".

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

- **11.5: Admin API for JSON content updates**
  - Original intent: upload refreshed `castles_enriched.json` to the live server without a full Docker image build.
  - Use the embedded Node server in the single container; no sidecar or Synology Task Scheduler.
  - Auth via `ADMIN_TOKEN` and `Authorization: Bearer <token>`.
  - Preserve the architecture constraint: build-time content and runtime state stay separate, and prerendered/build artifacts are not mutated in place.
  - Any implementation needs to reconcile data-only freshness with the artifact policy in [pipeline.md](pipeline.md).

## User Accounts

- **14.1: Complete login behavior**
  - Done: `POST /api/user/register` creates a user record in `/data/users.json` and returns `{ token }`.
  - Done: `GET /api/user/me` returns `{ id, favorites }` from the Bearer token.
  - Remaining: `POST /api/user/login` to validate an existing token and return the user object.
  - Keep the ADR-009 file-based model: token is stored in `users.json`; all writes go through `json-store.js`.

## Admin UI

Web-based admin is still open. It should follow ADR-010: admin changes update JSON and trigger rebuild/regeneration where needed; runtime must not mutate prerendered content directly.

- **15.1: Admin API auth**
  - Protect `/api/admin/...` routes with `Authorization: Bearer <token>`.
  - Read token from `ADMIN_TOKEN` at server startup.
  - Return 401 for missing or invalid token.

- **15.2: Admin UI shell**
  - Add protected `/admin` route.
  - Add `/admin/login` token entry.
  - Store admin token in `localStorage`.
  - Hide admin navigation for regular users.

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

- **11.2: Structured data (JSON-LD)**
  - Add `schema.org/LandmarksOrHistoricalBuildings` JSON-LD to detail pages.
  - Pair with existing SEO/meta work.

- **11.3: Accessibility audit**
  - WCAG 2.1 AA audit covering keyboard navigation, focus, ARIA roles, map markers, and colour contrast.
  - Use axe or Lighthouse with a target score of at least 90.

- **11.4: Castle of the week**
  - Deterministic homepage feature based on ISO week number and year.

## Dependency Notes

- Phase 13 is a prerequisite for Phase 15 admin work.
- `json-store.js` is required for user and admin JSON write routes.
- Phase 1 enrichment scripts already exist and are prerequisites for admin enrichment endpoints.
- Rebuild/admin-trigger work depends on the prerender route and sitemap generation pipeline.
