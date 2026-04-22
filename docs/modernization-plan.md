# Castle Page Modernization Plan

Tracked via GitHub. Check boxes as tasks are completed. Each task links to relevant source files.

---

## Phase 1 — Data Enrichment

Foundation for Wikipedia/Wikidata display in Phase 2. Run scripts once, then re-run periodically to refresh data.

- [x] **1.1** Write Wikipedia enrichment script ([scripts/enrich_wikipedia.js](../scripts/enrich_wikipedia.js))
  - Iterates all castles from existing JSON
  - Calls `en.wikipedia.org/api/rest_v1/page/summary/{castle_name}` with name fallbacks
  - Writes `wikipedia_extract`, `wikipedia_thumbnail`, `wikipedia_url` per castle
  - Output: `new_app/src/assets/data/castles_enriched.json`
- [x] **1.2** Write Wikidata enrichment script ([scripts/enrich_wikidata.js](../scripts/enrich_wikidata.js))
  - Resolves Wikidata QID via Wikipedia page title
  - Fetches: `P149` architectural style, `P1435` heritage designation, `P18` image, `P571` inception year
  - Appends `heritage_status`, `architectural_style`, `wikidata_id`, `inception_year`, `wikidata_image` per castle
  - Reads/writes `castles_enriched.json` in-place
- [x] **1.3** Update `Castle` model with optional enrichment fields ([new_app/src/app/models/castle.model.ts](../new_app/src/app/models/castle.model.ts))
  - Added: `wikipedia_extract?`, `wikipedia_thumbnail?`, `wikipedia_url?`, `wikidata_id?`, `architectural_style?`, `heritage_status?`, `inception_year?`, `wikidata_image?`
- [x] **1.4** Update `CastleService` to load enriched JSON ([new_app/src/app/services/castle.service.ts](../new_app/src/app/services/castle.service.ts))
  - Service now loads `castles_enriched.json`; all enrichment fields flow through automatically
- [x] **1.5** Run the enrichment scripts and commit `castles_enriched.json`
  - `node scripts/enrich_wikipedia.js`
  - `node scripts/enrich_wikidata.js`
  - Verify output, commit to repo

---

## Phase 2 — Castle Detail Page

- [x] **2.1** Leaflet map embed on detail page ([new_app/src/app/pages/castle-detail/](../new_app/src/app/pages/castle-detail/))
  - Leaflet loaded via dynamic `import('leaflet')` — SSR safe, browser only
  - Embedded OSM map in right column; 220px tall; Google Maps link below
- [x] **2.2** Wikipedia section on detail page
  - `wikipedia_extract` shown as paragraph; `wikipedia_thumbnail` floated right
  - Link to full Wikipedia article
- [x] **2.3** Heritage / enrichment badges
  - `heritage_status` (amber) and `architectural_style` (teal) as `mat-chip` elements below the title
- [x] **2.4** Image lightbox
  - Featured image (500px right column) + thumbnail strip (up to 4 + overflow count)
  - Fullscreen lightbox with prev/next arrows, counter, keyboard nav (Escape / ←→)
- [x] **2.5** Star rating visualization
  - `score_visitors` rendered as 5 half-star Material icons; numeric score alongside
- [x] **2.6** Nearby castles section
  - Haversine distance computed client-side; 5 closest shown as card grid in left column

---

## Phase 3 — Castle List Page

- [x] **3.1** Active filter chips ([new_app/src/app/pages/castles/](../new_app/src/app/pages/castles/))
  - Active filters shown as dismissible `mat-chip` elements above results
  - Each chip's × clears that single filter; "Clear all" button resets everything
- [x] **3.2** Map view mode (third view alongside grid / table)
  - `CastleMapComponent`: Leaflet circle markers coloured by score (red/orange/blue), tooltip + click-to-detail
  - Castles page: map toggle button added; `<app-castle-map>` shown in a 600px container
  - Castle detail page: nearby castles shown as orange circle markers on the location map

---

## Phase 4 — Navigation & Polish

- [x] **4.1** Breadcrumb navigation on detail page
  - `Home › Castles › Country › Castle name`; country links to filtered castles list
- [x] **4.2** SEO / meta tags on detail page
  - `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image` via Angular `Meta`/`Title` services
  - Description uses `wikipedia_extract` (first 160 chars) or falls back to ranked summary

---

## Phase 5 — Data Sharing: API & AI Agent Access

Expose the castle dataset for third-party developers, chatbots, and AI agents.

- [x] **5.1** Static JSON API endpoints (zero infra cost)
  - `scripts/generate_api.js` slices `castles_enriched.json` into `new_app/public/api/`
  - Endpoints: `/api/castles.json`, `/api/top100.json`, `/api/by-country/{slug}.json`, `/api/index.json`
  - 56 country files generated; re-run script after data refresh
- [x] **5.2** `llms.txt` — AI-agent discovery file
  - `new_app/public/llms.txt` served at `/llms.txt`
  - Documents schema, endpoints, example agent queries, and data freshness
- [x] **5.3** OpenAPI spec for the static API
  - `new_app/public/api/openapi.yaml` served at `/api/openapi.yaml`
  - Full Castle schema with all enrichment fields; all four endpoints described
- [x] **5.4** MCP (Model Context Protocol) server
  - `scripts/mcp-server.js` with `scripts/package.json` (`@modelcontextprotocol/sdk`, `zod`)
  - Tools: `search_castles`, `get_castle`, `list_countries`, `nearby_castles`
  - Run: `cd scripts && npm install && node ../scripts/mcp-server.js`
  - Configure in Claude Desktop via `claude_desktop_config.json`

---

---

## Hotfixes

Production bugs fixed outside the main phase sequence.

- [x] **HF-1** Sequential image probing on castle detail page
  - The page rendered all 25 candidate `{code}N.jpg` URLs as `<img>` tags simultaneously, firing up to 25 HTTP requests at once — most returning 404 for castles with few images
  - Replaced the batch probe with a single sequential probe: one `<img>` is rendered at a time; `onImageLoad` advances the probe index, `onImageError` stops probing
  - Affected: `castle-detail-page.component.ts` / `.html`
- [x] **HF-2** Leaflet map not loading in production (`c.map is not a function`)
  - `await import('leaflet')` returns `{ default: L }` in the esbuild production bundle; dev build handled the interop transparently
  - Fixed by resolving the default export in both map files: `const L = (leafletModule as any).default ?? leafletModule`
  - Affected: `castle-map.component.ts`, `castle-detail-page.component.ts`

---

## Phase 6 — Detail Page Enhancements

Items from `additional_improvements.md` not yet implemented.

- [x] **6.1** Clickable metadata on detail page
  - Region, castle type, building structure, condition and era become links/buttons
  - Clicking navigates to `/castles?country=…&castleType=…` (etc.) with the filter pre-applied
  - Era link goes to `/castles?era=12` — reuses existing query-param support
- [x] **6.2** In-place scrollable image strip
  - Replace the static thumbnail strip with a horizontally-scrollable carousel in the aside
  - Clicking a thumbnail makes it the featured image *in place* (no overlay) without leaving the page
  - Fullscreen lightbox remains available as an optional second action
- [x] **6.3** Extend nearby castles from 5 to 6
  - One-line change in `nearbyCastles` computed (`slice(0, 6)`)
  - Update spec assertions
- [x] **6.4** Thumbnail images in castle table and grid
  - Show `wikipedia_thumbnail` (or a local `/images/castles/small/{code}_small.jpg`) as a 60×60 cell in the table and a card header in the grid
  - Graceful fallback (castle icon) when no image is available

---

## Phase 7 — Regional & Country Maps

Items from `additional_improvements.md`: "add a map of the country / region with all the castles marked on it".

- [x] **7.1** Country detail page map
  - Embed `<app-castle-map>` on the country detail page (already has a Leaflet map effect — replace with the shared component)
  - `autoFit=true` so it fits all castles in that country
- [x] **7.2** Region detail page map
  - Add `<app-castle-map>` to the region detail page (currently has no map)
  - Filtered to castles in that region, auto-fit bounds
  - Note: regions share the country detail page via `?region=…`; using `cf.filtered()` scopes the map automatically

---

## Phase 8 — Data Quality

Item from `additional_improvements.md`: "further efforts to enrich data for castles that were not found by the script".

- [x] **8.1** Manual overrides file for Wikipedia misses
  - `scripts/wikipedia_overrides.json` maps `castle_code → wikipedia_title` for 120+ unmatched castles
  - `enrich_wikipedia.js` consults overrides as Step 0 before any auto-lookup
  - Covers the top-scoring misses; 157 total missing → ~80 covered after overrides + auto-lookup
- [x] **8.2** Alternate-language Wikipedia fallback
  - After all English strategies fail, `enrich_wikipedia.js` tries the castle's country language (de, fr, it, es, hu, cs, etc.) via search API
  - `wikipedia_lang` field stored in delta when a non-English source is used; detail page shows "(de)" badge next to "From Wikipedia"
  - 27-language mapping covers all dataset countries
- [x] **8.3** Fill missing coordinates via Wikidata
  - `scripts/enrich_coordinates.js` queries Wikidata P625 then falls back to Nominatim
  - Previously 407 missing; now only 23 remain — run `node scripts/enrich_coordinates.js` to fill the last gaps

---

## Phase 9 — UX & Polish

Suggested improvements to quality-of-life and discoverability.

- [x] **9.1** Dark mode
  - Add CSS custom properties for all colours in `styles.scss`
  - Auto-switch via `prefers-color-scheme: dark`; manual toggle in toolbar persisted to `localStorage`
- [x] **9.2** Castle name autocomplete
  - Dropdown suggestion list while typing in the Name filter on the castles page
  - Angular Material `MatAutocomplete` — data comes from `CastleService`
- [x] **9.3** Share button on detail page
  - Native Web Share API with URL fallback (copy link to clipboard)
  - Share castle name + URL; show confirmation toast
- [x] **9.4** Sitemap.xml generation
  - `scripts/generate_sitemap.js` writes `new_app/public/sitemap.xml` (6 static + 1000 castle URLs)
  - `<link rel="sitemap">` added to `index.html`; run via `npm run data:sitemap`
- [ ] **9.5** Design refresh — Storybook + Figma exploration
  - Use Storybook (already in the stack) to build and review components in isolation before reworking the visual design
  - Explore Figma (or a comparable tool such as Penpot, which is open-source) to design page layouts and component states before implementing them
  - Candidate areas for a design pass: typography scale, card layout, colour hierarchy, mobile responsiveness, empty states
  - Storybook stories already exist for some components — expand coverage so every UI component has a story before the redesign begins

---

## Phase 10 — Performance

- [x] **10.1** Reduce initial bundle size
  - Budget updated to 700 kB (realistic for Angular 19 + Material shell); current bundle is 661 kB — within budget
  - Leaflet is already a 149 kB lazy chunk — never in the initial bundle
  - All heavy Material modules (MatTable, MatChips, MatForm, etc.) are in lazy page chunks; AppComponent only imports what the shell needs
- [x] **10.2** Pre-compress JSON API files
  - Covered by nginx.conf gzip added in Phase 12.1 (`application/json` in gzip_types)
  - Add gzip compression to nginx config (or generate `.gz` sidecar files)
  - `castles.json` is ~3 MB uncompressed; gzip brings it to ~400 kB
- [ ] **10.3** PWA / service worker
  - Add `@angular/pwa` — generates `ngsw-config.json` and registers service worker
  - Cache `castles_enriched.json` and static assets for offline browsing
  - Add web app manifest for "Add to home screen" on mobile

---

## Phase 11 — Infrastructure & Deployment

- [ ] **11.5** Admin API for hot-swapping JSON data without rebuild
  - After running enrichment scripts locally, push the updated `castles_enriched.json` to the live server without a full Docker build
  - A minimal password-protected upload endpoint receives the file, writes it to the shared data volume, then re-runs `generate_lean_castles.js` and `generate_sitemap.js` to re-derive `castles.json`, `castles_delta.json`, and `sitemap.xml`
  - The Angular app fetches these files at runtime — visitors get fresh data on next page load with no downtime
  - Prerendered HTML (og tags) remains stale until the next full build — acceptable for data-only updates
  - Architecture resolved (ADR-008): embedded Node server inside the single container handles this endpoint; no sidecar or Synology Task Scheduler needed
  - Auth: `ADMIN_TOKEN` environment variable; `Authorization: Bearer <token>` header

- [ ] **11.0** Serve castle images from Synology NAS
  - Add `imageBaseUrl` to `src/environments/environment.ts` (`''`) and `environment.prod.ts` (Synology URL)
  - Create `ImageService` that prepends the base URL; replace all `/images/castles/…` literals in templates and TS with service calls
  - Add `/public/images/castles/` to `.dockerignore` so images are excluded from the container build
  - Configure CORS on the Synology web server (`Access-Control-Allow-Origin`) for the app's domain
  - Prerequisite: confirm Synology URL and whether dev still serves from disk or also from NAS

---

## Phase 11 — Advanced & Optional

Larger or more speculative improvements.

- [POSTPONE] **11.1** Castle comparison view
  - Select 2–3 castles and view them side-by-side in a comparison table
  - Pin comparison bar at bottom of the castles list page; accessible from any castle card/row
  - Cross-page state: use URL query params (`/compare?codes=nl001,de023`) — no complex state manager needed; Angular Signals are sufficient (confirmed in architecture review)
- [POSTPONE] **11.2** Structured data (JSON-LD)
  - Add `schema.org/LandmarksOrHistoricalBuildings` JSON-LD to each detail page
  - Enables Google rich results (knowledge panel, image carousel in search)
- [POSTPONE] **11.3** Accessibility audit
  - WCAG 2.1 AA audit: keyboard navigation, focus indicators, ARIA roles on map markers, colour contrast
  - Run `axe` or Lighthouse accessibility score ≥ 90 target
- [POSTPONE] **11.4** "Castle of the week" on homepage
  - Deterministic pick based on ISO week number + year (no server needed)
  - Prominent featured card on the home page with image and score

---

## Phase 12 — Service Architecture & Infrastructure

Resolves three classes of issues identified in peer review: a broken production deployment (nginx without SPA fallback), accidental SSR scaffolding that is never run, and structural problems in `CastleService`. The rendering strategy is **Option C — build-time prerendering (SSG)**: Angular's SSR toolchain renders known routes to static HTML at build time; nginx serves those files with a `try_files` fallback for client-side routes. No Node process runs in production.

- [x] **12.1** Add nginx config with SPA fallback and gzip
  - Add `nginx.conf` to the repo with `try_files $uri $uri/ /index.html` so client-side routes work on hard refresh
  - Enable gzip for HTML, JS, CSS, and JSON (supersedes Phase 10.2 nginx approach)
  - Update `Dockerfile` to `COPY nginx.conf /etc/nginx/conf.d/default.conf`
  - Most urgent fix: without it, a hard refresh on any non-root URL returns a 404

- [x] **12.2** Prerender sharing routes (SSG)
  - Write `scripts/generate_prerender_routes.js` that reads `castles_enriched.json` and writes `new_app/prerender-routes.txt`
  - Routes: `/`, `/castles`, all `/countries/:slug` (56 pages), all `/castles/:code` (~1000 pages)
  - Update `angular.json`: `"prerender": { "routesFile": "prerender-routes.txt" }`
  - Purpose: og:title, og:description, og:image (Phase 4.2) are baked into static HTML so link previews work correctly in WhatsApp, Slack, and social media
  - `server.ts` remains as a build-time renderer only; remove the `serve:ssr:new_app` npm script to avoid confusion

- [x] **12.3** Load castles once at app startup
  - Register `CastleService.loadCastles()` via `provideAppInitializer()` in `app.config.ts`
  - Data is guaranteed available before any component renders — eliminates the concurrent-call race condition by design
  - Audit and remove all component-level `loadCastles()` calls
  - Delete `NoCastleService` and `no-castle.service.ts` (verify no remaining imports)

- [x] **12.4** Trust JSON sort order in `CastleService`
  - Add a unit test asserting `castles_enriched.json` is sorted by `score_total` descending — makes the precondition explicit and catches accidental re-ordering from enrichment scripts
  - Simplify `getAllByScore()` → `return this.castles()` (no sort needed)
  - Simplify `getTopByScore(n)` → `return this.castles().slice(0, n)`
  - `getTopByCountry()` is already correct — `filter()` preserves global order; add a comment making the precondition explicit
  - Keep the explicit sort in `getTopByVisitors()` — visitor score order differs from total score order

- [x] **12.5** Scope `getRegionSummaries()` to a country
  - Change signature to `getRegionSummaries(country: string): RegionSummary[]`
  - Filter by country before grouping — regions are only meaningful within a country context
  - Eliminates the region-name collision bug; no composite key needed
  - Update all callers to pass the country parameter

---

## Phase 13 — Infrastructure: Node.js Server Migration

Migrate the production runtime from nginx to an embedded Node.js server (ADR-008). This is the prerequisite for all API-backed features in Phases 14 and 15. The SSG prerendering pipeline (Phase 12) is unchanged — Node serves the same static output that nginx did, plus new API routes.

- [x] **13.1** Rewrite Dockerfile runtime stage
  - Replace `FROM nginx:alpine` runtime stage with `FROM node:alpine`
  - Copy Angular dist output (`/dist/new_app/browser`) and `server/` directory into image
  - `CMD ["node", "server/index.js"]`; expose `PORT` env variable (default 3000)
  - Remove `nginx.conf` from the build (no longer used at runtime)
  - Update `deploy.sh` image tags and port mappings
  - **Bugfix**: `deploy.sh` `CONTAINER_PORT` corrected from `80` → `3000` to match the Node server

- [x] **13.2** Express server — static serving and SPA fallback
  - `server/index.js`: Express app with `express.static('/dist/new_app/browser')`
  - SPA fallback: catch-all route returns `index.html` for any path not matched by a static file or API route (equivalent to nginx `try_files`)
  - Gzip middleware (`compression` package) replacing the nginx gzip config from Phase 12.1
  - `deploy.sh` extended with `--autostart <policy>` flag (default: `unless-stopped`; supports `always`, `no`)

- [ ] **13.3** Image serving from NAS mount
  - `GET /images/*` → stream from `/images` volume mount
  - Cache-Control headers (long TTL); 404 for missing files
  - Test with a castle image request against the mounted volume

- [~] **13.4** Data volume structure and initialisation *(partial)*
  - `data/` added to `.gitignore` — runtime data never committed ✓
  - `deploy.sh` mounts NAS path `/volume1/docker/topcastles/data` as `/data` inside the container; `mkdir -p` ensures the host dir exists before `docker run` ✓
  - `json-store.js` calls `mkdir({ recursive: true })` on first write — directory created automatically, no startup script needed ✓
  - On server startup, ensure `/data/users.json` exists (create with `{ "users": [] }` if absent) ✗
  - Ensure `/data/content.json` exists (create with default intro text if absent) ✗
  - Document both volume mounts (`/data`, `/images`) in `docker-compose.yml` and README ✗

- [x] **13.5** JSON write safety utility
  - `server/lib/json-store.js`: atomic writes via write-to-`.tmp`-then-rename pattern
  - In-process async mutex (`async-mutex`) to serialise concurrent writes to the same file
  - Exported as `readJson(path)` / `writeJson(path, data)` — used by all routes that touch `/data/**`
  - `mkdir({ recursive: true })` before each write — `/data/` created automatically on first use (Docker volume safe)

- [ ] **13.6** Smoke tests for server migration
  - Verify static Angular pages load (home, castle detail, country detail) — SPA fallback working
  - Verify hard-refresh on a deep route returns the correct page (regression vs. Phase 12.1 fix)
  - Verify `/images/castles/nl001_1.jpg` is served from the volume mount
  - Verify gzip is active (`Accept-Encoding: gzip` → `Content-Encoding: gzip` in response)

---

## Phase 14 — User Accounts & Favorites

Introduces runtime user state: accounts, token auth, and named castle sets. Implements ADR-009 (file-based user model). Requires Phase 13 complete.

- [~] **14.1** User API — accounts and token auth *(partial)*
  - `POST /api/user/register` ✓ — creates user record in `/data/users.json`, returns `{ token }`
  - `GET /api/user/me` ✓ — returns `{ id, favorites }` from Bearer token header
  - `POST /api/user/login` ✗ — not yet implemented (validate existing token, return user object)
  - Token is a 32-byte hex string stored plaintext in `users.json`; no password hashing needed (ADR-009)
  - All writes via `json-store.js` (Phase 13.5) ✓

- [ ] **14.2** Angular `UserService`
  - Signals: `currentUser = signal<User | null>(null)`
  - Token stored in `localStorage`; auto-login on app startup via `provideAppInitializer()`
  - Methods: `register()`, `login(token)`, `logout()`

- [ ] **14.3** Favorites: save and remove castle
  - `PUT /api/user/favorites/:setId/castles/:code` — add castle to named set
  - `DELETE /api/user/favorites/:setId/castles/:code` — remove castle from named set
  - Heart/bookmark icon on castle cards (grid + table) and castle detail page; filled state reflects membership in any set

- [ ] **14.4** Named sets — create, rename, delete
  - `POST /api/user/favorites` — create named set (e.g. "My trip 2025"), returns set id
  - `PATCH /api/user/favorites/:setId` — rename set
  - `DELETE /api/user/favorites/:setId` — delete set and all its castle memberships
  - `GET /api/user/favorites` — list all sets with castle counts

- [ ] **14.5** Favorites page
  - New route `/favorites` — lists user's named sets; each set shows its castles as a grid/table (reuse existing components)
  - Add to component hierarchy and sidenav
  - Empty state: prompt to browse castles and save the first one

---

## Phase 15 — Admin UI

Web-based admin interface for content management. Implements ADR-010 (admin triggers rebuild, not runtime mutation). Requires Phase 13 complete (Node server running).

- [ ] **15.1** Admin API auth
  - All `/api/admin/...` routes require `Authorization: Bearer <token>` header
  - Token read from `ADMIN_TOKEN` environment variable at server startup
  - Return 401 for missing/invalid token

- [ ] **15.2** Admin UI shell (Angular)
  - Protected route `/admin` — guarded by `AdminAuthGuard` that checks `localStorage` for admin token
  - Token entry: `/admin/login` page with a single token input; stores to `localStorage` on success
  - Sidenav links hidden from regular users; admin nav shown when token is present

- [ ] **15.3** Edit castle data
  - `PUT /api/admin/castles/:code` — update fields in `castles_enriched.json` for the given code
  - Admin form: inline editing of name, country, region, coordinates, castle type, condition, score overrides
  - Changes write to JSON only via `json-store.js` (Phase 13.5) — a rebuild is required for prerendered pages to reflect them (ADR-010)

- [ ] **15.4** Add a new castle
  - `POST /api/admin/castles` — append new castle entry to `castles_enriched.json`
  - Form with required fields (code, name, country, coordinates); auto-validate code uniqueness
  - After save: prompt to run enrichment scripts then trigger rebuild

- [ ] **15.5** Run enrichment scripts
  - `POST /api/admin/enrichment/wikipedia` — spawn `enrich_wikipedia.js` as a child process, stream stdout to response
  - `POST /api/admin/enrichment/wikidata` — same for `enrich_wikidata.js`
  - Admin UI shows live log output; completion status returned when process exits

- [ ] **15.6** Edit introduction text
  - `PUT /api/admin/content/intro` — write intro text to `/data/content.json` via `json-store.js`
  - Angular homepage reads `content.json` via `HttpClient` (runtime fetch, not build-time import) so intro updates are visible without rebuild

- [ ] **15.7** Trigger rebuild
  - `POST /api/admin/rebuild` — runs the full build pipeline: `ng build` + `generate_prerender_routes.js` + sitemap + API generation
  - Admin UI shows build progress (streamed stdout) and final success/failure status
  - Only required for content changes (castle data, enrichment); user data changes take effect immediately

---

## Dependencies

```text
1.1 → 1.2 → 1.5            (enrichment pipeline, sequential; 1.3 + 1.4 are code-only)
1.5 → 2.2, 2.3             (Wikipedia/Wikidata data must be committed before display)
2.1 (Leaflet install) → 3.2 (reuses same library)
1.5 → 5.1                  (enriched JSON must exist before slicing)
5.1 → 5.2, 5.3, 5.4        (endpoints must exist before describing them)
```

Independent (can be done in any order): 2.4, 2.5, 2.6, 3.1, 4.1, 4.2

```text
6.1 → 6.4        (clickable metadata needs filter query-param support already in place ✓)
8.1 → re-run 1.1 (overrides file feeds the Wikipedia script)
9.4 → submit to Google Search Console after deploy
10.1 before 10.3 (reduce bundle first, then add PWA to avoid caching bloated chunks)
11.2 pairs with 4.2 (both are SEO — do together)
12.1 independent (most urgent — fixes live 404 bug)
12.2 requires 4.2 ✓ (meta tags must be set by Angular before prerendering captures them)
12.3 independent (land before 12.4 — APP_INITIALIZER guarantees data before any sort runs)
12.4 after 12.3
12.5 independent
Phase 13 is a prerequisite for all of Phase 14 and Phase 15
13.1 → 13.2 → 13.3, 13.4 → 13.5 → 13.6
14.1 → 14.2 → 14.3, 14.4 → 14.5
15.1 → 15.2 → 15.3, 15.4, 15.5, 15.6, 15.7
13.5 (json-store) required by 14.1, 15.3, 15.6 (all JSON write routes)
11.5 after Phase 13 (uses the same Node server)
15.5 after Phase 1 scripts exist ✓ (enrichment scripts must exist before the API can spawn them)
15.7 after 12.2 ✓ (rebuild pipeline must be defined before admin can trigger it)
```
