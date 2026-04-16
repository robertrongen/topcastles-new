# Architectural decisions

## ADR-001: Simplify Legacy Scope to EN-Only Static Top 100
Status: accepted

Context:
- The legacy PHP application contains multilingual content and interactive voting/polling paths.
- Migration is scoped to an English-only experience and lower operational complexity.

Decision:
- Enforce English-only runtime behavior.
- Disable castle visitor voting interactions in the UI.
- Use static `score_total` ranking for top 100 views instead of runtime vote aggregation.

Consequences:
- Simpler migration baseline with fewer dynamic dependencies.
- Historic vote-driven behavior is no longer part of active user flows.
- Some legacy vote/poll code remains in repository but is not reachable through primary navigation paths.

## ADR-002: Angular 19 Target Stack
Status: accepted

Context:
- The legacy PHP application needs a modern framework for the migration.
- The developer's company uses Angular 19 + Material + Storybook as their standard stack.
- Using the same stack provides professional skill development alongside the migration.
- The site is read-only public content (no auth, no user writes after ADR-001 simplifications).

Decision:
- **Framework**: Angular 19.2+ with Standalone Components and Signals.
- **UI library**: Angular Material 19 as design foundation.
- **Component docs**: Storybook 9 for component development, visual testing, and documentation.
- **Language**: TypeScript 5.7+.
- **Styling**: SCSS with CSS Custom Properties.
- **Data layer**: Static JSON files converted from source CSV at build time — no database in build or production.
- **Rendering**: Angular SSR with prerendering for SEO-critical public pages.
- **Unit testing**: Karma + Jasmine (Angular default) or Vitest (to be confirmed during skeleton setup).

Consequences:
- Heavier client-side framework than strictly necessary for a read-only site, but aligns with professional development goals.
- Angular SSR/prerendering mitigates SEO concerns for a content-heavy public site.
- Static JSON data layer keeps deployment simple (no database dependency in production).
- Storybook enables isolated component development — useful for building and reviewing UI slices before wiring data.
- Angular Material provides accessible, pre-built components (tables, cards, navigation) that map well to castle listings and detail pages.

## ADR-003: Static JSON Data Layer from CSV
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

CSV column mapping (EN fields used in migration):
- `position`, `castle_code`, `castle_name`, `country`, `area`, `place`, `region`
- `Latitude`, `Longitude`, `founder`, `era`, `castle_type`, `castle_concept`, `condition`
- `remarkable`, `description`, `website`, `score_total`, `score_visitors`, `visitors`
- NL-only columns (`land`, `gebied`, `kasteel_type`, `kasteel_concept`, `conditie`, `opmerkelijk`, `beschrijving`) are excluded per ADR-001 (EN-only).

Consequences:
- Zero database dependency in both build and production.
- CSV → JSON is simpler and faster than MySQL → JSON (no DB install required).
- Data changes require CSV edit + script re-run + rebuild.
- Export script becomes a migration artifact in `scripts/`.

## ADR-004: Docker Deployment on Synology NAS
Status: accepted

Context:
- The application needs a hosting target for production.
- The developer has a personal Synology NAS that supports Docker containers.
- The site is read-only content with Angular SSR — lightweight resource requirements.

Decision:
- Package the Angular SSR application as a Docker container.
- Use a multi-stage Dockerfile: Node build stage → lightweight Node runtime stage.
- Deploy the container to Synology NAS via Docker (Synology Container Manager).
- Expose the app on a configurable port (default `4000`).
- Use `node dist/new_app/server/server.mjs` as the container entrypoint.

Consequences:
- Self-hosted, no cloud hosting costs.
- Synology Docker has limited resources — keep the container image small (Node Alpine base).
- No CI/CD pipeline to Synology initially — manual `docker build` + `docker load` or registry pull.
- SSR serves prerendered HTML + handles dynamic routes; static assets served by Node/Express.
- Future option: add a reverse proxy (Synology built-in or Nginx) for HTTPS/domain mapping.

---

Use this format when adding a new decision:

## ADR-NNN: Decision title
Status: proposed | accepted | superseded

Context:
- Why this decision is needed

Decision:
- What was decided

Consequences:
- Expected benefits
- Trade-offs / risks