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
- **Data layer**: Static JSON files generated from MySQL export at build time — no live database in production.
- **Rendering**: Angular SSR with prerendering for SEO-critical public pages.
- **Unit testing**: Karma + Jasmine (Angular default) or Vitest (to be confirmed during skeleton setup).

Consequences:
- Heavier client-side framework than strictly necessary for a read-only site, but aligns with professional development goals.
- Angular SSR/prerendering mitigates SEO concerns for a content-heavy public site.
- Static JSON data layer keeps deployment simple (no database dependency in production).
- Storybook enables isolated component development — useful for building and reviewing UI slices before wiring data.
- Angular Material provides accessible, pre-built components (tables, cards, navigation) that map well to castle listings and detail pages.

## ADR-003: Static JSON Data Layer
Status: accepted

Context:
- The PHP app queries MySQL for castle data on every page load.
- After ADR-001, all data is read-only static rankings (no runtime vote aggregation).
- A live database adds operational complexity for no functional benefit.

Decision:
- Export castle data from MySQL to JSON files as a one-time build-time pipeline step.
- The Angular app consumes these JSON files via Angular `HttpClient` or build-time imports.
- JSON files live in `new_app/src/assets/data/` and are versioned in the repository.
- If data needs updating, re-run the export script against the MySQL dump.

Consequences:
- Zero database dependency in production — deploy as static assets + SSR.
- Data changes require re-export and rebuild (acceptable for infrequently changing castle data).
- Simpler hosting: any static hosting or Node SSR server works.
- Export script becomes a migration artifact in `tools/` or `scripts/`.

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