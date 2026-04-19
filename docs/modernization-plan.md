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

- [ ] **4.1** Breadcrumb navigation on detail page
  - `Home > Castles > [Country] > [Castle name]`
  - Built from Angular route data
- [ ] **4.2** SEO / meta tags on detail page
  - `<meta name="description">` using `wikipedia_extract` (first 160 chars)
  - Open Graph tags (`og:title`, `og:description`, `og:image`) for social sharing

---

## Phase 5 — Data Sharing: API & AI Agent Access

Expose the castle dataset for third-party developers, chatbots, and AI agents.

- [ ] **5.1** Static JSON API endpoints (zero infra cost)
  - Serve `castles_enriched.json` and `no_castles.json` as public static files (already served via Angular's `assets/`)
  - Add a `public/api/` folder with pre-sliced files: `castles.json`, `top100.json`, `by-country/{country}.json`
  - Generate these slices as part of the enrichment pipeline
- [ ] **5.2** `llms.txt` — AI-agent discovery file
  - Create `/public/llms.txt` following the [llms.txt spec](https://llmstxt.org/)
  - Describe the dataset, available endpoints, data schema, and usage intent
  - This allows LLMs and agents to self-discover and understand the dataset without manual setup
- [ ] **5.3** OpenAPI spec for the static API
  - Write `public/api/openapi.yaml` describing the JSON endpoints (paths, response schemas)
  - Enables any OpenAPI-aware tool or agent to auto-generate a client or explore the API
- [ ] **5.4** MCP (Model Context Protocol) server — optional, highest AI-agent value
  - Small Node.js MCP server (`scripts/mcp-server.js`) exposing tools:
    - `search_castles(query, country?, era?, condition?)` → returns matching castles
    - `get_castle(castle_code)` → returns full castle detail
    - `list_countries()` → returns country list with castle counts
  - Connects directly into Claude, Cursor, VS Code Copilot, and other MCP-compatible AI assistants
  - Users can point their AI tool at the server and query the castle dataset conversationally

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
