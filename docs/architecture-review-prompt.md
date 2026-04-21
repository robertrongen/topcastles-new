# Architecture Review — Agent Instruction

## Your Task

Review the current architecture of the Topcastles application and propose an evolved architecture that accommodates the pending feature requests listed below. Return a structured proposal covering: what to change, what to keep, the key tradeoffs, and any open questions that need a human decision before implementation.

---

## What This Application Is

**Topcastles** (`topcastles.eu`) is a public read-only website listing the top 1000 medieval castles in Europe, ranked by a scoring algorithm. It migrated from a legacy PHP + MySQL application to Angular 19. The current Angular application has no backend process in production — it is a prerendered static site served by nginx in a Docker container on a personal Synology NAS.

The owner is a single developer (hobbyist/portfolio project, not a commercial product). Operational simplicity and zero running costs are hard constraints.

---

## Where to Find Things

Start by reading these files in order:

1. **`docs/architecture.md`** — high-level architecture, component hierarchy, data flow, deployment diagram, theming
2. **`docs/decisions.md`** — six ADRs explaining why key choices were made
3. **`docs/deployment.md`** — Docker, nginx, deploy.sh, CI/CD pipeline
4. **`docs/pipeline.md`** — data enrichment pipeline (CSV → JSON → enriched JSON → lean JSON)
5. **`docs/modernization-plan.md`** — the full feature roadmap with completion status

Key source directories to explore:

- **`new_app/src/app/`** — Angular application
  - `services/` — `CastleService`, `ViewModeService`, `ThemeService`
  - `components/` — `castle-table`, `castle-grid`, `castle-map`, `castle-filter`, `view-toggle`
  - `pages/` — one directory per route
  - `models/castle.model.ts` — the Castle data model
- **`new_app/src/app/app.config.ts`** — Angular providers including PWA service worker
- **`new_app/src/assets/data/`** — static JSON files loaded at runtime
- **`scripts/`** — data pipeline scripts (enrichment, API generation, sitemap, MCP server)
- **`new_app/public/api/`** — static JSON API endpoints served under `/api/`
- **`new_app/public/manifest.webmanifest`** and **`ngsw-config.json`** — PWA configuration
- **`Dockerfile`** and **`nginx.conf`** (in repo root) — production container

Use `graphify query graphify-out/graph.json <symbol>` to look up specific symbols instead of reading raw files where possible.

---

## Current Architecture Summary (for context, verify against the source)

- **Frontend**: Angular 19, standalone components, Signals API, Angular Material M3
- **Rendering**: Build-time SSG (prerendered HTML baked at `ng build`); no Node process in production
- **Data layer**: Static JSON files (`castles.json`, `castles_enriched.json`) loaded via `HttpClient` at app startup; no database
- **State management**: Angular Signals + computed(); no NgRx or similar
- **UI components**: Three view modes (table with CDK virtual scroll, card grid, Leaflet map); detail page with lightbox, star ratings, nearby castles, Wikipedia extract
- **API surface**: Static JSON files under `/public/api/` (no runtime server); MCP server script for AI agent access
- **PWA**: `@angular/service-worker` (disabled in dev); `manifest.webmanifest`; preconnect + prefetch hints in `index.html`
- **Deployment**: Multi-stage Docker build → nginx Alpine container on Synology NAS port 8080; deployed via `deploy.sh` over SSH
- **Testing**: Karma + Jasmine unit tests; Storybook 9 for component isolation (stories for grid, table, filter, view-toggle)
- **Dark mode**: CSS custom properties (`--tk-*`); `ThemeService` reads `localStorage` + `prefers-color-scheme`

---

## Pending Feature Requests (the "new architecture" must accommodate these)

### 11.0 — Serve castle images from Synology NAS (Infrastructure)

Castle images currently live in `new_app/public/images/castles/` (~1000 JPEGs) and are baked into the Docker image. This makes the image unacceptably large.

Requirements:
- Add `imageBaseUrl` to `environment.ts` / `environment.prod.ts`
- Create an `ImageService` that prepends the base URL
- Replace all `/images/castles/…` literals in templates and TypeScript with `ImageService` calls
- Add `/public/images/castles/` to `.dockerignore`
- Configure CORS on the Synology web server

Open question: should dev mode also load from the NAS, or serve from disk?

### 11.1 — Castle comparison view

Allow the user to select 2–3 castles from the list and compare them side-by-side in a table.

Requirements:
- A "compare" toggle on each castle card and table row
- A pinned comparison bar at the bottom of the castles list page (similar to a shopping cart)
- A comparison table view (full-page or slide-up panel) showing all selected castles' attributes in columns

Implications: requires new cross-page state (selected castles must survive navigation within the SPA). Assess whether Angular Signals + a singleton service is sufficient, or whether a more structured state management approach is warranted.

### 11.2 — Structured data (JSON-LD)

Add `schema.org/LandmarksOrHistoricalBuildings` JSON-LD to each castle detail page. This pairs with the existing `og:` meta tags (already implemented via Angular's `Meta` service) and must be present in the prerendered HTML.

Constraint: must work with SSG (baked at build time, not added client-side after hydration), because Google's crawler reads the static HTML.

### 11.3 — Accessibility audit (WCAG 2.1 AA)

Target: Lighthouse accessibility score ≥ 90. Focus areas: keyboard navigation, focus indicators, ARIA roles on Leaflet map markers, colour contrast in dark mode.

Assess whether the current component structure and CSS architecture makes this straightforward or whether a pass through all components is needed.

### 11.4 — Castle of the week on homepage

A featured castle card on the home page, picked deterministically from the top 1000 using ISO week number + year (no server needed, purely computed client-side).

### 11.5 — Admin hot-swap API (data update without full rebuild)

After running enrichment scripts locally, push updated `castles_enriched.json` to the live server without a full Docker rebuild and redeploy.

Requirements:
- A minimal password-protected upload endpoint
- On upload: write the new file to the shared data volume, then re-run `generate_lean_castles.js` and `generate_sitemap.js`
- The Angular app already fetches JSON at runtime, so visitors get fresh data on next page load
- Prerendered HTML (og: tags) stays stale until the next full build — acceptable for data-only updates
- Auth: Bearer token or HTTP basic auth

Implementation options to evaluate:
1. Small Node.js sidecar container sharing the assets volume with the nginx container
2. Synology Task Scheduler script triggered on file-system change
3. A GitHub Actions workflow that rebuilds and redeploys on data push

Constraint: must not introduce a runtime process that needs to stay up (acceptable: something that wakes up briefly to handle a request).

---

## What to Include in Your Proposal

Structure your response as follows:

### 1. Architecture assessment
What is working well in the current architecture. What will become strained or awkward as the pending features are added. Be specific — reference file paths and component names.

### 2. Proposed changes

For each pending feature, describe:
- The minimal implementation that fits the current architecture
- Any architectural change that would enable it better (new service, new pattern, new infrastructure component)
- What existing code needs to change

### 3. State management assessment
Currently: Signals + computed() in singleton services. Is this sufficient for the comparison view (11.1) and potential future features? Or is a more structured store pattern warranted?

### 4. Infrastructure evolution
The current deployment is a single nginx container. Feature 11.5 (hot-swap) and 11.0 (external images) push toward a small multi-container setup. Propose the minimal viable container topology that covers all pending features without over-engineering.

### 5. What to keep as-is
Explicitly list what should NOT change and why — avoid scope creep.

### 6. Open questions requiring human decision
List any decisions that depend on context the agent cannot determine from code alone (e.g., Synology NAS hostname, acceptable downtime window, budget for tooling).

---

## Constraints to Respect

- **Zero cloud cost** — no paid services, no managed databases, no CDN (unless free tier)
- **Single developer** — proposed architecture must be maintainable alone
- **No runtime Node process in production** for the main Angular app (ADR-006) — this may be revisited for 11.5, but any Node sidecar must be minimal and optional
- **Angular 19 Signals** — do not propose a migration to a different frontend framework or a signals-to-NgRx migration unless the case is overwhelming
- **Storybook** — new components should get stories; keep Storybook as the component development tool
- **Backward compatibility with existing URLs** — `/castles/:code`, `/countries/:country`, `/top1000` are indexed and must not change

---

## Output Format

Return a markdown document. Use headings for each section. Be concrete — name the specific files, services, and components that would change. Where there are genuine alternatives, present them as a short comparison table (option, pro, con) rather than prose.
