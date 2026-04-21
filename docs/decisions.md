# Architectural decisions

## ADR-001: Simplify legacy scope to EN-only static top 1000

Status: accepted

Context:

- The legacy PHP application contains multilingual content and interactive voting/polling paths.
- Migration is scoped to an English-only experience and lower operational complexity.

Decision:

- Enforce English-only runtime behavior.
- Disable castle visitor voting interactions in the UI.
- Use static `score_total` ranking for top 1000 views instead of runtime vote aggregation.

Consequences:

- Simpler migration baseline with fewer dynamic dependencies.
- Historic vote-driven behavior is no longer part of active user flows.
- Some legacy vote/poll code remains in `old_app/` but is unreachable through primary navigation.

## ADR-002: Angular 19 target stack

Status: accepted

Context:

- The legacy PHP application needed a modern framework.
- Angular 19 + Material + Storybook is the developer's professional stack, providing skill development alongside the migration.
- The site is read-only public content (no auth, no user writes after ADR-001).

Decision:

- **Framework**: Angular 19.2+ with Standalone Components and Signals.
- **UI library**: Angular Material 19 as design foundation.
- **Component docs**: Storybook 9 for component development and documentation.
- **Language**: TypeScript 5.7+.
- **Styling**: SCSS with CSS Custom Properties.
- **Data layer**: Static JSON files converted from source CSV at build time — no database in build or production.
- **Rendering**: Angular SSR with prerendering for SEO-critical public pages.
- **Unit testing**: Karma + Jasmine (Angular default).

Consequences:

- Heavier client-side framework than strictly necessary for a read-only site, but aligns with professional development goals.
- Angular SSR/prerendering mitigates SEO concerns for a content-heavy public site.
- Static JSON data layer keeps deployment simple (no database dependency in production).
- Storybook enables isolated component development and visual review.

## ADR-003: Static JSON data layer from CSV

Status: accepted

Context:

- The PHP app queries MySQL for castle data on every page load.
- After ADR-001, all data is read-only static rankings (no runtime vote aggregation).
- A live database adds operational complexity for no functional benefit.
- The original CSV used to populate MySQL is available: `old_app/database/Topcastles export.csv` (1000 castles, 41 columns, semicolon-delimited, NL+EN fields).

Decision:

- Convert the CSV directly to JSON files — no MySQL dependency in the build pipeline.
- A Python script (`scripts/csv_to_json.py`) reads the CSV source and produces EN-only JSON.
- JSON files live in `new_app/src/assets/data/` and are versioned in the repository.
- The Angular app consumes these JSON files via Angular `HttpClient` or build-time imports.
- If data needs updating, edit the CSV and re-run the conversion script.

Consequences:

- Zero database dependency in both build and production.
- CSV to JSON is simpler and faster than MySQL to JSON (no DB install required).
- Data changes require CSV edit + script re-run + rebuild.

## ADR-004: Docker deployment on Synology NAS

Status: accepted (runtime updated by ADR-006)

Context:

- The application needs a hosting target for production.
- The developer has a personal Synology NAS that supports Docker containers.
- The site is read-only content — lightweight resource requirements.

Decision:

- Package the application as a Docker container.
- Use a multi-stage Dockerfile: Node build stage then nginx Alpine runtime stage.
- Deploy to Synology NAS via Docker Hub and SSH (`deploy.sh`).
- Expose the app on NAS port 8080 mapped to container port 80.

Consequences:

- Self-hosted, no cloud hosting costs.
- nginx Alpine is extremely lightweight — well within Synology Docker resource limits.
- See ADR-006 for the rendering mode decision (build-time SSG, no Node process in production).
- Future option: add a reverse proxy (Synology built-in or nginx) for HTTPS/domain mapping.

## ADR-006: Rendering mode — build-time SSG with nginx static serving

Status: accepted

Context:

- `angular.json` had `ssr.entry` and `prerender: true` configured, producing both a browser bundle and a Node/Express server bundle at build time.
- The `Dockerfile` copied only the browser bundle to nginx and discarded the server bundle — so runtime SSR was never active in production.
- nginx was running without `try_files $uri $uri/ /index.html`, meaning hard refresh on any non-root route returned a 404.
- Three options were evaluated: (A) pure SPA, (B) runtime SSR with Node/Express, (C) build-time prerendering (SSG) served by nginx.
- SEO is not a priority. The requirement is correct link-preview rendering (og: meta tags) when sharing the home page, country pages, or a castle detail page in WhatsApp/Slack.

Decision:

- **Option C: build-time SSG.** Angular's SSR toolchain (`@angular/ssr`) runs only at `ng build` time to prerender known routes to static HTML files. No Node process runs in production.
- A script (`scripts/generate_prerender_routes.js`) generates the prerender route list: `/`, `/castles`, all `/countries/:slug`, and all `/castles/:code`.
- nginx serves the pre-rendered HTML files for known routes and falls back to `index.html` for any client-side route not in the prerender list.
- `server.ts` remains in the codebase as the build-time renderer but is not deployed. The `serve:ssr:new_app` npm script is removed to avoid confusion.
- A custom `nginx.conf` is added to the repo and referenced in the Dockerfile.

Consequences:

- og: meta tags set by Angular (Phase 4.2) are baked into the pre-rendered HTML, enabling correct link previews without a runtime server.
- No Node process in production — deployment is a single nginx container, simpler and lighter than a Node/Express container.
- Hard-refresh 404s on non-root routes are fixed by the `try_files` nginx config.
- Data changes (enrichment script runs) require a rebuild to update pre-rendered HTML; acceptable given data changes infrequently.
- Castle detail pages (~1000) are included in the prerender list because they are the primary sharing targets.

## ADR-005: Visual parity — old-app brand applied via CSS overrides

Status: accepted

Context:

- The Angular app should replicate the old app's visual identity so it feels like a refresh rather than a redesign.
- The old app's canonical palette is defined in `old_app/style/2col_leftNav.css`.
- Angular Material 19 (M3) uses a generated colour system. Rebuilding a full custom M3 palette to hit specific legacy hex values adds complexity with no functional gain.

Decision:

- Apply the old-app palette through two layers:
  1. Switch the Angular Material primary palette to `mat.$orange-palette` (closest standard palette to `#FF9900`) so Material-managed surfaces pick up a warm primary tone.
  2. Override specific surfaces — toolbar, sidenav, links, table rows, section headings — with exact legacy hex values in `styles.scss` and `app.component.scss`.
- Replace the Roboto import with the system-available Verdana stack (`Verdana, Arial, sans-serif`) at 11px bold, matching the old app body font.
- Copy `logo_topkastelen_nl.jpg` and `tk-shield.ico` from `old_app/style/` into `new_app/public/`.
- Remove the email contact link from the Photographers tab (confirmed drop-scope item).

Consequences:

- The app is visually familiar to users of the old site with minimal structural changes.
- Material M3 internal surfaces retain M3 defaults and do not perfectly match the old app — acceptable given the goal is a refresh, not a pixel-perfect clone.
- The CSS override approach is simpler to maintain than a full M3 custom theme.
