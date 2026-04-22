# Architecture

> Stack: Angular 19 + Material + Storybook + SCSS (ADR-002). See [decisions.md](decisions.md). Active future work lives in [roadmap.md](roadmap.md); historical migration context lives in [migration-report.md](migration-report.md).

## High-level architecture

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
│  ┌───────────────────┐                           │
│  │    Services       │  ← inject() DI            │
│  │  (CastleService,  │                           │
│  │   ViewModeService)│                           │
│  └────────┬──────────┘                           │
│           ▼                                      │
│  ┌──────────────────┐                            │
│  │  Static JSON     │  ← /assets/data/*.json     │
│  │  (castle data)   │     built from XLSX source │
│  └──────────────────┘                            │
└──────────────────────────────────────────────────┘
```

## Component hierarchy

```text
AppComponent (shell: toolbar + sidenav + router-outlet)
├── HomePageComponent              /
├── CastlesPageComponent           /castles  (all castles + inline search/filter)
│   ├── CastleFilterComponent
│   ├── CastleTableComponent
│   ├── CastleGridComponent
│   └── ViewToggleComponent
├── CastleDetailPageComponent      /castles/:code
├── Top100PageComponent            /top1000
│   ├── CastleFilterComponent
│   ├── CastleTableComponent
│   ├── CastleGridComponent
│   └── ViewToggleComponent
├── TopCountriesPageComponent      /top-countries
├── TopRegionsPageComponent        /top-regions
├── CountryDetailPageComponent     /countries/:country
│   ├── CastleFilterComponent
│   ├── CastleTableComponent
│   ├── CastleGridComponent
│   └── ViewToggleComponent
├── BackgroundPageComponent        /background
└── NoCastleDetailPageComponent    /nocastle/:code
```

## Data flow

1. **Build time**: `scripts/xlsx_to_json.py` reads `source-data/topcastles/Topcastles export.xlsx` and produces JSON files in `new_app/src/assets/data/`. Enrichment scripts append Wikipedia/Wikidata fields to `castles_enriched.json`. `scripts/generate_prerender_routes.js` produces `prerender-routes.txt` consumed by `ng build`.
2. **App startup**: `CastleService.loadCastles()` is registered via `provideAppInitializer()` — data is fetched once before any component renders, eliminating concurrent-load race conditions (Phase 12.3).
3. **Signals**: Services expose data as `signal<T[]>()` — components react reactively. `castles_enriched.json` is sorted by `score_total` descending; service methods rely on this ordering and avoid redundant re-sorts.
4. **Build-time content serving**: Pre-rendered HTML, JS/CSS bundles, and static JSON are produced by `ng build` and served by the Node.js server at runtime (ADR-006, ADR-008).
5. **Runtime user flow**: Angular calls the Node API for user actions. User data (favorites, accounts) is written to `/data/users.json`. Admin actions update castle JSON files and trigger a rebuild — no prerendered content is mutated directly (ADR-007, ADR-010).
6. **Runtime admin flow**: Admin API writes to castle JSON files and triggers the enrichment/rebuild pipeline. Prerendered HTML is updated on the next build cycle.

## Deployment architecture

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
│  │  │  - Admin API                     │  │  │
│  │  │  - User API (accounts/favorites) │  │  │
│  │  │  - Serves images (NAS mount)     │  │  │
│  │  │  - Optional caching              │  │  │
│  │  └──────────────┬───────────────────┘  │  │
│  │                 │                      │  │
│  │  ┌──────────────▼───────────────────┐  │  │
│  │  │  Static assets                   │  │  │
│  │  │  - Pre-rendered HTML             │  │  │
│  │  │  - JS/CSS bundles                │  │  │
│  │  │  - JSON data                     │  │  │
│  │  └──────────────────────────────────┘  │  │
│  │                                        │  │
│  │  Mounted volumes:                      │  │
│  │  - /data (JSON content + user data)    │  │
│  │  - /images (Synology NAS)              │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

Node.js runs in production as the single container entry point (ADR-008), replacing the previous nginx-only runtime (ADR-006).

## Build-time prerendering (SSG)

Angular SSR (`@angular/ssr`) is used **only at build time** — `ng build` runs the server bundle to render known routes to static HTML files. The server bundle is not deployed.

- **Purpose**: og:title, og:description, og:image (set via Angular's `Meta` service) are baked into the static HTML, enabling correct link previews when sharing pages in WhatsApp, Slack, or social media.
- **Routes prerendered**: generated by `scripts/generate_prerender_routes.js` — covers `/`, `/castles`, all `/countries/:slug` (56 pages), and all `/castles/:code` (~1000 pages).
- **Client-side fallback**: routes not in the prerender list are served as the SPA shell (`index.html`) and rendered client-side.
- `server.ts` and `app.config.server.ts` remain in the codebase as the build-time rendering engine, not as a deployed service.

## Runtime vs Build-time data separation

Not all data is equal. The system enforces a strict boundary between build-time content and runtime state:

### Build-time (produced by `ng build`, versioned in repo)

- `castles_enriched.json` — castle content and enrichment data
- Pre-rendered HTML — static pages baked at build time
- JS/CSS bundles — Angular app output

### Runtime (written by the Node server, persisted on `/data` volume)

- `users.json` — user accounts, tokens, and favorites

Rule: runtime data must never directly mutate prerendered content. Content changes (castle data, enrichment) require a rebuild to take effect (ADR-007, ADR-010).

## Node server responsibilities

The Node.js server is the single runtime entry point (ADR-008):

### Static file serving

- Pre-rendered HTML pages
- JS/CSS bundles
- Static JSON data files

### Admin API (`/api/admin/...`)

- Update castle data in JSON files
- Add a new castle
- Trigger enrichment scripts
- Trigger rebuild pipeline

### User API (`/api/user/...`)

- Create user (returns token)
- Authenticate via token
- Save / retrieve favorites and named sets (ADR-009)

### Image serving

- Serve images from the `/images` NAS mount volume

## Theming

Angular Material M3 theme configured in `new_app/src/styles.scss` with the legacy brand palette applied via CSS overrides (ADR-005).

```scss
html {
  @include mat.theme((
    color: (
      theme-type: light,
      primary: mat.$orange-palette,
      tertiary: mat.$blue-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}

$tk-orange:     #FF9900;  // masthead / toolbar
$tk-dark-blue:  #00005C;  // page body background
$tk-link:       #000099;  // primary link colour
$tk-link-hover: #CCCCFF;  // link hover background
$tk-nav-bg:     #E6E6F5;  // sidenav background
$tk-th-bg:      #CCCCEB;  // table header background
$tk-row-even:   #FFF6DE;  // alternating table row (even)
```

Key public assets in `new_app/public/`:

- `banner_en.gif` — "Topcastles.com" scroll banner rendered in the orange masthead toolbar
- `tk-shield.ico` — favicon
