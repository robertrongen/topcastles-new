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

- [ ] **8.1** Manual overrides file for Wikipedia misses
  - Create `scripts/wikipedia_overrides.json` mapping `castle_code → wikipedia_title` for the ~215 unmatched castles
  - Update `enrich_wikipedia.js` to consult overrides before network lookup
  - Start with the top-50 unmatched by score (highest-impact misses first)
- [ ] **8.2** Alternate-language Wikipedia fallback
  - For castles not found in English Wikipedia, try `de.wikipedia.org` / `fr.wikipedia.org` (in the castle's country language)
  - Flag with `wikipedia_lang` field so the UI can show "Source: German Wikipedia"

---

## Phase 9 — UX & Polish

Suggested improvements to quality-of-life and discoverability.

- [ ] **9.1** Dark mode
  - Add CSS custom properties for all colours in `styles.scss`
  - Auto-switch via `prefers-color-scheme: dark`; manual toggle in toolbar persisted to `localStorage`
- [ ] **9.2** Castle name autocomplete
  - Dropdown suggestion list while typing in the Name filter on the castles page
  - Angular Material `MatAutocomplete` — data comes from `CastleService`
- [ ] **9.3** Share button on detail page
  - Native Web Share API with URL fallback (copy link to clipboard)
  - Share castle name + URL; show confirmation toast
- [ ] **9.4** Sitemap.xml generation
  - Script `scripts/generate_sitemap.js` writes `new_app/public/sitemap.xml`
  - One `<url>` per castle plus static pages; include `<lastmod>` from enrichment date
  - Add `<link rel="sitemap">` to `index.html` for Google discovery

---

## Phase 10 — Performance

- [ ] **10.1** Reduce initial bundle size (currently ~158 kB over 500 kB budget)
  - Audit Material module imports — import only what each component uses
  - Move `CastleMapComponent` behind a dynamic `import()` so Leaflet is never in the initial chunk
- [ ] **10.2** Pre-compress JSON API files
  - Add gzip compression to nginx config (or generate `.gz` sidecar files)
  - `castles.json` is ~3 MB uncompressed; gzip brings it to ~400 kB
- [ ] **10.3** PWA / service worker
  - Add `@angular/pwa` — generates `ngsw-config.json` and registers service worker
  - Cache `castles_enriched.json` and static assets for offline browsing
  - Add web app manifest for "Add to home screen" on mobile

---

## Phase 11 — Infrastructure & Deployment

- [ ] **11.0** Serve castle images from Synology NAS
  - Add `imageBaseUrl` to `src/environments/environment.ts` (`''`) and `environment.prod.ts` (Synology URL)
  - Create `ImageService` that prepends the base URL; replace all `/images/castles/…` literals in templates and TS with service calls
  - Add `/public/images/castles/` to `.dockerignore` so images are excluded from the container build
  - Configure CORS on the Synology web server (`Access-Control-Allow-Origin`) for the app's domain
  - Prerequisite: confirm Synology URL and whether dev still serves from disk or also from NAS

---

## Phase 11 — Advanced & Optional

Larger or more speculative improvements.

- [ ] **11.1** Castle comparison view
  - Select 2–3 castles and view them side-by-side in a comparison table
  - Pin comparison bar at bottom of the castles list page; accessible from any castle card/row
- [ ] **11.2** Structured data (JSON-LD)
  - Add `schema.org/LandmarksOrHistoricalBuildings` JSON-LD to each detail page
  - Enables Google rich results (knowledge panel, image carousel in search)
- [ ] **11.3** Accessibility audit
  - WCAG 2.1 AA audit: keyboard navigation, focus indicators, ARIA roles on map markers, colour contrast
  - Run `axe` or Lighthouse accessibility score ≥ 90 target
- [ ] **11.4** "Castle of the week" on homepage
  - Deterministic pick based on ISO week number + year (no server needed)
  - Prominent featured card on the home page with image and score

---

## Dependencies

```
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
```
