# Architecture

Topcastles is an Angular 19 application served by a single Node.js runtime container on a Synology NAS. Architecture decisions are recorded in [decisions.md](decisions.md); artifact ownership is recorded in [pipeline.md](pipeline.md).

## High-level Architecture

```text
┌──────────────────────────────────────────────────┐
│                    Browser                       │
│  Angular 19 SPA (SSR-prerendered for SEO)        │
│  ┌─────────┐ ┌──────────┐ ┌───────────────┐      │
│  │ Pages   │ │Components│ │ Angular       │      │
│  │(routes) │ │(shared)  │ │ Material UI   │      │
│  └────┬────┘ └─────┬────┘ └───────────────┘      │
│       │            │                             │
│       └─────┬──────┘                             │
│             ▼                                    │
│  ┌────────────────────┐                          │
│  │    Services        │  ← inject() DI           │
│  │  CastleService     │                          │
│  │  UserService       │                          │
│  │  FavoritesService  │                          │
│  └──┬─────────────┬───┘                          │
│     │             │ HTTP                         │
│     ▼             ▼                              │
│  ┌──────────┐  ┌──────────────────────────┐      │
│  │  Static  │  │  Node.js server APIs     │      │
│  │  JSON    │  │  /api/user               │      │
│  │  /assets │  │  /api/editorial/:file    │      │
│  └──────────┘  │  /api/admin/* (auth'd)   │      │
│                └──────────────────────────┘      │
└──────────────────────────────────────────────────┘
```

## Runtime Model

```text
Browser
  Angular app
    public pages
    favorites/user UI
    admin editorial annex
  |
  | HTTP
  v
Node server (single Docker container)
  serves Angular build output
  serves static JSON API slices
  serves /api/user and /api/favorites
  serves /api/editorial/:file
  protects /api/admin/*
  writes runtime JSON through json-store.js
  serves NAS-mounted images where configured
  |
  +-- /data runtime volume
  +-- /images NAS image volume
```

Angular SSR/prerendering is build-time only. The Node server is the production entry point; it serves built output and runtime APIs.

## Data Flow

1. `source-data/topcastles/Topcastles export.xlsx` is the active ingestion source.
2. Scripts under `scripts/` generate castle JSON, static API slices, sitemap output, and prerender routes.
3. `ng build` prerenders known routes and creates the Angular build output.
4. The Node server serves the build output at runtime.
5. User/favorites state is stored in `/data/users.json`.
6. Editorial overlay state is stored in `/data/editorial/*.json`.
7. Public pages may load editorial overlay JSON after hydration.

## Build-Time Content

Build-time content is generated, versioned, and deployed with the app:

- `new_app/src/assets/data/*.json`
- `new_app/public/api/**`
- `new_app/public/sitemap.xml`
- `new_app/prerender-routes.txt`
- prerendered HTML and Angular bundles under `new_app/dist/`

Runtime code must not mutate these artifacts in place.

## Runtime State

Runtime state lives on the NAS-mounted `/data` volume:

- `users.json` for user accounts, tokens, and favorites
- `editorial/*.json` for editor-owned overlay content
- pending/admin workflow files when explicitly implemented

All JSON writes go through the Node layer and `json-store.js`.

## Component Hierarchy

```text
AppComponent (shell: toolbar + sidenav + router-outlet)
├── HomePageComponent                      /
├── Top100PageComponent                    /top1000
│   ├── CastleFilterComponent
│   ├── CastleTableComponent
│   ├── CastleGridComponent
│   ├── CastleMapComponent
│   └── ViewToggleComponent
├── CastleDetailPageComponent              /castles/:code
├── CountryRedirectComponent               /countries/:country
├── TopCountriesPageComponent              /top-countries
├── TopRegionsPageComponent                /top-regions
├── NoCastleDetailPageComponent            /nocastle/:code
├── BackgroundPageComponent                /background
├── DeveloperPageComponent                 /developer
├── FavoritesPageComponent                 /favorites
├── FavoritesDetailPageComponent           /favorites/:id
├── AdminLoginComponent                    /admin/login
└── AdminShellComponent                    /admin
    ├── AdminEditorialOverviewComponent        /admin/editorial
    └── AdminEditorialEditorComponent          /admin/editorial/:file
```

## Admin And Editorial Boundaries

The admin API is protected by `ADMIN_TOKEN` Bearer authentication. The token is supplied through the runtime environment and is never baked into the Docker image.

Implemented lightweight editorial annex:

- `/admin/login`
- `/admin/editorial`
- `/admin/editorial/<file>`
- `GET /api/editorial/:file`
- `PUT /api/admin/editorial/:file`
- editorial backups and publish/build handoff status

Higher-risk pipeline admin remains deferred:

- castle edit/add
- enrichment-script execution
- introduction text editing if activated
- rebuild trigger execution and log streaming

Use Spec Kit before implementing those workflows.

## Deployment Architecture

```text
┌──────────────────────────────────────────────┐
│              Synology NAS                    │
│  ┌────────────────────────────────────────┐  │
│  │  Docker Container                      │  │
│  │                                        │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │  Node.js Server (entry point)    │  │  │
│  │  │                                  │  │  │
│  │  │  - Serves Angular SSR output     │  │  │
│  │  │  - Static JSON API slices        │  │  │
│  │  │  - User / favorites API          │  │  │
│  │  │  - Editorial API                 │  │  │
│  │  │  - Admin API (ADMIN_TOKEN auth)  │  │  │
│  │  │  - Serves images (NAS mount)     │  │  │
│  │  └──────────────┬───────────────────┘  │  │
│  │                 │                      │  │
│  │  ┌──────────────▼───────────────────┐  │  │
│  │  │  Static assets (in image)        │  │  │
│  │  │  - Pre-rendered HTML             │  │  │
│  │  │  - JS/CSS bundles                │  │  │
│  │  │  - JSON data (/assets/data)      │  │  │
│  │  └──────────────────────────────────┘  │  │
│  │                                        │  │
│  │  Mounted volumes:                      │  │
│  │  - /data  (users.json, editorial/)     │  │
│  │  - /images (Synology NAS)              │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

## Guardrails

- JSON-only storage; no database.
- `/data` is runtime state.
- `/assets/data` is build-time content.
- No runtime mutation of prerendered HTML, JavaScript bundles, or generated build artifacts.
- Single-container Node runtime.
- Angular uses Signals; do not introduce NgRx.
- Storybook is the review anchor for shared UI changes.

## Key References

- [decisions.md](decisions.md) - ADRs and rationale.
- [pipeline.md](pipeline.md) - artifact classification.
- [deployment.md](deployment.md) - NAS deployment details.
- [admin-readme.md](admin-readme.md) - editorial annex operator guide.
- [roadmap.md](roadmap.md) - active forward-looking work.
