# Architectural Decisions

This file records accepted architecture decisions. Keep the short form here; add a fuller ADR only when a new decision needs more context.

## ADR-001: English-only static Top 1000 scope

Status: accepted

- English-only runtime behavior.
- Legacy voting/polling interactions are out of active scope.
- Static `score_total` ranking is used instead of runtime vote aggregation.

## ADR-002: Angular 19 target stack

Status: accepted

- Angular 19.2+ with standalone components and Signals.
- Angular Material 19 as UI foundation.
- Storybook 9 for component review.
- TypeScript 5.7+ and SCSS.
- Angular prerender/SSG for SEO and link previews.
- Karma + Jasmine for unit tests.

## ADR-003: Static JSON data layer

Status: accepted

- Castle content is JSON generated from spreadsheet source.
- No database in build or production.
- `source-data/topcastles/Topcastles export.xlsx` is the active ingestion source.
- Generated castle JSON is versioned as build-time content.

## ADR-004: Docker deployment on Synology NAS

Status: accepted

- Package and deploy as a Docker container to Synology NAS.
- Deployment is handled through `deploy.sh`.
- The original nginx-only runtime was superseded by ADR-008.

## ADR-005: Legacy brand palette through CSS overrides

Status: accepted

- Preserve the old Topcastles visual identity through CSS tokens and targeted Material overrides.
- Use the legacy orange, dark blue, link, nav, table, and alternating-row colors where they define brand identity.
- Keep the approach maintainable rather than pursuing a full custom Material palette.

## ADR-006: Build-time SSG

Status: accepted

- Angular SSR tooling is used at build time to prerender known routes.
- The server bundle is not a separate deployed SSR service.
- Unknown client routes fall back to the SPA shell.

## ADR-007: Hybrid static content with runtime user state

Status: accepted

- Castle content remains build-time static JSON.
- User data lives separately at runtime under `/data/users.json`.
- Runtime data must not directly mutate prerendered content.

## ADR-008: Embedded Node middleware in one container

Status: accepted

- Node.js is the production runtime entry point.
- Node serves built Angular output, APIs, admin routes, user/favorites routes, and NAS-mounted images where configured.
- The single-container deployment model is preserved.

## ADR-009: Lean file-based user account model

Status: accepted

- User data is stored in `/data/users.json`.
- Authentication uses generated tokens.
- No passwords, email verification, external auth provider, or database.
- Writes go through the Node JSON store layer.

## ADR-010: Admin UI triggers pipeline, not runtime mutation

Status: accepted

- Admin/pipeline changes must preserve the build pipeline as the source of prerendered content.
- Runtime endpoints must not mutate prerendered HTML, JavaScript bundles, or other built artifacts in place.
- Content changes that affect prerendered pages require a rebuild before prerendered output reflects them.

## ADR-011: Editor-owned editorial overlay

Status: accepted

- Editor-owned overlay files live under `/data/editorial/`.
- Public reads use `GET /api/editorial/:file`.
- Protected admin writes use `PUT /api/admin/editorial/:file`.
- Overlay files are written through `json-store.js`, validated, and backed up.
- Overlay content stays separate from pipeline-generated castle data.
- Editorial-only changes are served immediately at runtime after hydration; prerendered output reflects them after the next build.
