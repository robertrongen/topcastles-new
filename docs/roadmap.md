# Roadmap

This is the active forward-looking worklist for Topcastles. Current runtime architecture is documented in [architecture.md](architecture.md), contributor workflow in [../DEVELOPER.md](../DEVELOPER.md), artifact policy in [pipeline.md](pipeline.md), and completed migration history in [migration-report.md](migration-report.md).

## Known Baseline Issues

- **TD-1: Fix pre-existing unit test failures / test runner reliability**
  - Historical note from the modernization plan: 77 of 176 specs failed consistently, with 99 passing.
  - Suspected root cause recorded there: `castle-detail-page.component.spec.ts` leaves an open HTTP request for `/assets/data/castles_delta.json`; `HttpClientTestingBackend.verify()` flags it at teardown, cascading across the suite.
  - Later work reduced the failure count from 77 to 73, but the cleanup passes now observe `npm test -- --watch=false --browsers=ChromeHeadless` timing out.
  - Goal: restore a reliable regression signal.

## UX And Product Improvements

- **9.5: Design refresh with Storybook and Figma/Penpot exploration**
  - Expand Storybook coverage before the redesign begins.
  - Explore layouts and component states before implementation.
  - Candidate areas: typography scale, card layout, colour hierarchy, mobile responsiveness, and empty states.

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
