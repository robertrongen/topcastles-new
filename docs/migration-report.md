# Migration Report

Topcastles was migrated from a legacy PHP/MySQL website (`old_app/`) to an Angular 19 application (`new_app`) in April 2026. The migration is complete and the app is deployed. This document is historical; active work lives in [roadmap.md](roadmap.md), current architecture in [architecture.md](architecture.md), and artifact policy in [pipeline.md](pipeline.md).

## Original Migration Scope

### Pages Built

| Route | Component | Description |
|---|---|---|
| `/` | HomePageComponent | Landing page |
| `/castles` | CastlesPageComponent | All castles with inline search and filter |
| `/castles/:code` | CastleDetailPageComponent | Individual castle detail with images and links |
| `/top1000` | Top100PageComponent | Top 1000 ranked castles with region filter |
| `/top-countries` | TopCountriesPageComponent | Countries ranked by top castle score |
| `/top-regions` | TopRegionsPageComponent | Regions ranked by top castle score |
| `/countries/:country` | CountryDetailPageComponent | Castles filtered by country |
| `/background` | BackgroundPageComponent | Background information on castle types |
| `/nocastle/:code` | NoCastleDetailPageComponent | Detail page for "no castle" entries |

### Shared Components And Services

- `CastleTableComponent`: sortable Material table with column filters.
- `CastleGridComponent`: responsive card grid.
- `CastleFilterComponent`: dropdown filters shared by listing pages.
- `ViewToggleComponent`: list/card preference persisted in `localStorage`.
- `CastleService`: JSON-backed castle loading, filtering, and signal-based state.
- `ViewModeService`: shared view preference state.

### Legacy Scope Dropped

The migration intentionally dropped Dutch content, voting/polls, visitor counters, admin stats, map download exports, old editor artifacts, obsolete search files, obsolete pages, contact/photographer pages, and the old visitors page. Dropped files were moved under `old_app/archive/drop-scope-2026-04-16/`.

The old PHP lookup/navigation functions shared a SQL-query-building pattern with injection risk. These were replaced by `CastleService` methods operating on JSON data.

## Completed Modernization Milestones

### Phase 1: Data Enrichment

- Added Wikipedia enrichment via `scripts/enrich_wikipedia.js`.
- Added Wikidata enrichment via `scripts/enrich_wikidata.js`.
- Extended the `Castle` model with enrichment fields.
- Updated `CastleService` to load `castles_enriched.json`.
- Committed enriched castle JSON as build-time content.

### Phase 2: Castle Detail Page

- Added Leaflet map embed on detail pages with browser-safe dynamic import.
- Added Wikipedia summary, thumbnail, and full-article link.
- Added heritage and architectural-style badges.
- Added featured image, thumbnail strip, and fullscreen lightbox.
- Added star rating visualization for visitor score.
- Added nearby castles using Haversine distance.

### Phase 3: Castle List Page

- Added active filter chips with per-filter clearing and "Clear all".
- Added map view mode alongside grid and table views.
- Reused map markers for nearby castles on detail pages.

### Phase 4: Navigation And SEO Polish

- Added breadcrumb navigation on detail pages.
- Added title, description, and Open Graph meta tags for detail pages.

### Phase 5: Data Sharing And AI Access

- Added static JSON API generation under `new_app/public/api/`.
- Added `llms.txt` for AI-agent discovery.
- Added OpenAPI spec at `new_app/public/api/openapi.yaml`.
- Added MCP server tooling with castle search, lookup, country listing, and nearby-castle tools.

### Hotfixes

- Fixed sequential image probing so detail pages no longer request all 25 candidate images at once.
- Fixed Leaflet production interop by resolving `default` exports where needed.

### Phase 6: Detail Page Enhancements

- Made metadata links clickable and reusable as list filters.
- Replaced the static thumbnail strip with an in-place scrollable image strip.
- Increased nearby castles from 5 to 6.
- Added thumbnails to castle table and grid views with fallback behavior.

### Phase 7: Regional And Country Maps

- Added shared map rendering for country pages.
- Added shared map rendering for region-scoped views.

### Phase 8: Data Quality

- Added manual Wikipedia override file for missed matches.
- Added alternate-language Wikipedia fallback.
- Added coordinate enrichment using Wikidata P625 and Nominatim fallback.

### Phase 9: UX And Polish

- Added dark mode with CSS custom properties and persisted manual toggle.
- Added castle name autocomplete.
- Added native Web Share support with clipboard fallback.
- Added sitemap generation at `new_app/public/sitemap.xml`.

### Phase 10: Performance

- Reduced initial bundle pressure by lazy-loading heavy page and Material chunks where possible.
- Recorded JSON compression work. Historically this was covered by nginx gzip in Phase 12; the current runtime uses the Node server and compression middleware.

### Phase 12: Service Architecture And SSG Infrastructure

This phase was originally written for an nginx static runtime. It is preserved here as history because Phase 13 later replaced the production runtime with Node.

- Added nginx SPA fallback and gzip for the then-current static deployment.
- Added prerender route generation via `scripts/generate_prerender_routes.js`.
- Configured Angular prerendering to consume `new_app/prerender-routes.txt`.
- Registered castle loading once at app startup to eliminate concurrent-load races.
- Made `CastleService` trust JSON sort order where appropriate.
- Scoped region summaries to a country to avoid region-name collisions.

### Phase 13: Node.js Server Migration

- Replaced nginx runtime with a Node Alpine runtime stage in `Dockerfile`.
- Copied Angular dist output and `server/` into the image.
- Corrected deployment port mapping to the Node server port.
- Added Express static serving and SPA fallback in `server/index.js`.
- Added gzip middleware via `compression`.
- Added `json-store.js` with atomic temp-file writes and an in-process mutex.
- Added runtime data volume patterns for `/data`, with remaining initialization follow-up tracked in [roadmap.md](roadmap.md).

### Phase 14: User Accounts And Favorites

- Added file-based user registration and token lookup using `/data/users.json`.
- Added favorites CRUD API with authenticated Bearer-token access.
- Added Angular `UserService`, `FavoritesService`, and `/favorites` page.
- Added "add to favorites" behavior from castle detail pages.
- Added favorites UX improvements: optimistic updates, rollback, favorite counts, tooltips, snackbars, favorites-only filtering, toolbar/sidenav links, and account placeholder route.
- Added token share/import flow via account links.
- Added favorites detail route at `/favorites/:id`, reusing existing grid/table/list controls.

## Historical Decisions

| ADR | Decision |
|---|---|
| ADR-001 | English-only; voting and poll features dropped |
| ADR-002 | Angular 19 + Material + Storybook + SCSS |
| ADR-003 | Static JSON from CSV; no database in build or production |
| ADR-004 | Docker container deployed to Synology NAS via Docker Hub |
| ADR-005 | Legacy brand palette applied via CSS overrides over M3 |

See [decisions.md](decisions.md) for the full ADR set.
