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

Status: accepted

Context:

- The application needs a hosting target for production.
- The developer has a personal Synology NAS that supports Docker containers.
- The site is read-only content with Angular SSR — lightweight resource requirements.

Decision:

- Package the Angular SSR application as a Docker container.
- Use a multi-stage Dockerfile: Node build stage then lightweight Node runtime stage.
- Deploy to Synology NAS via Docker Hub and SSH (`deploy.sh`).
- Expose the app on NAS port 8080 mapped to container port 80.

Consequences:

- Self-hosted, no cloud hosting costs.
- Synology Docker has limited resources — keep the container image small (Node Alpine base).
- SSR serves prerendered HTML and handles dynamic routes; static assets served by Node/Express.
- Future option: add a reverse proxy (Synology built-in or Nginx) for HTTPS/domain mapping.

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
