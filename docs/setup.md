# Setup Reference

This file is a compact stack and project-structure reference. Day-to-day commands live in [../DEVELOPER.md](../DEVELOPER.md); architecture decisions live in [decisions.md](decisions.md).

## Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Angular 19.2+ | Standalone components and Signals |
| UI | Angular Material 19.2+ | Material primitives plus Topcastles CSS tokens |
| Component review | Storybook 9.1+ | Shared component review and UX anchors |
| Language | TypeScript 5.7+ | Angular app and tests |
| Styling | SCSS | CSS custom properties and Material theme setup |
| Unit testing | Karma + Jasmine | Root `npm test` runs Angular headless |
| Runtime server | Node.js + Express | Single-container runtime entry point |
| Data layer | JSON files | Spreadsheet-derived build-time content plus `/data` runtime state |
| Rendering | Angular prerender/SSG | Build-time only; Node serves built output |
| Deployment | Docker on Synology NAS | See [deployment.md](deployment.md) |

## Current Project Structure

| Path | Purpose |
| --- | --- |
| `new_app/` | Angular application, routes, shared components, services, Storybook, PWA manifest/config. |
| `new_app/src/app/pages/admin/` | Protected admin/editorial annex UI. |
| `new_app/src/app/pages/favorites/` | Public user favorites and favorite-set UI. |
| `new_app/src/assets/data/` | Build-time castle JSON consumed by Angular. |
| `new_app/public/api/` | Generated static JSON API slices and OpenAPI file. |
| `scripts/` | Data conversion, enrichment, sitemap, prerender route, context pipeline, and MCP helper scripts. |
| `server/` | Node runtime server, API routes, admin/editorial routes, user/favorites routes, image serving, and JSON store helpers. |
| `source-data/topcastles/` | Canonical spreadsheet source for ingestion. |
| `data/` | Ignored local/runtime-like state; production mounts `/data` from the NAS volume. |
| `docs/` | Architecture, ADRs, roadmap, deployment, pipeline, admin, and design/process references. |
| `old_app/` | Legacy PHP application archive/reference only. |

## Runtime Boundaries

- Build-time content comes from `source-data/topcastles/Topcastles export.xlsx` and generated JSON under `new_app/src/assets/data/`.
- Runtime state lives under `/data`, including `users.json` and editor-owned `/data/editorial/*.json`.
- Admin/editorial JSON writes go through the Node server and `json-store.js`.
- Runtime code must not mutate prerendered HTML, JavaScript bundles, sitemap output, or other built artifacts in place.
- Pipeline/admin rebuild-trigger work remains higher-risk Spec Kit work.

## Installed App Assets

PWA support uses:

- `new_app/public/manifest.webmanifest`
- `new_app/public/icons/*`
- `new_app/ngsw-config.json`

Castle photos served from the NAS should remain outside the Angular service-worker cache unless a future Spec Kit review deliberately changes the image-serving strategy.

## Documentation Pointers

- [architecture.md](architecture.md) - current runtime and data-flow model.
- [pipeline.md](pipeline.md) - source/generated/runtime artifact policy.
- [deployment.md](deployment.md) - NAS deployment and runtime environment.
- [admin-readme.md](admin-readme.md) - protected editorial annex operator guide.
- [storybook.md](storybook.md) - Storybook workflow and story conventions.
