# Architecture

> Stack: Angular 19 + Material + Storybook + SCSS (ADR-002). See `docs/decisions.md`.

## High-level architecture

```text
┌───────────────────────────────────────────────────┐
│                    Browser                        │
│  Angular 19 SPA (SSR-prerendered for SEO)         │
│  ┌─────────┐ ┌──────────┐ ┌───────────────┐       │
│  │ Pages   │ │Components│ │ Angular       │       │
│  │(routes) │ │(shared)  │ │ Material UI   │       │
│  └────┬────┘ └─────┬────┘ └───────────────┘       │
│       │            │                              │
│       └─────┬──────┘                              │
│             ▼                                     │
│  ┌───────────────────┐                            │
│  │    Services       │  ← inject() DI             │
│  │  (CastleService,  │                            │
│  │   NoCastleService,│                            │
│  │   ViewModeService)│                            │
│  └────────┬──────────┘                            │
│           ▼                                       │
│  ┌──────────────────┐                             │
│  │  Static JSON      │  ← /assets/data/*.json     │
│  │  (castle data)    │     built from CSV export  │
│  └──────────────────┘                             │
└───────────────────────────────────────────────────┘
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

1. **Build time**: `scripts/csv_to_json.py` reads `old_app/database/Topcastles export.csv` and produces JSON files in `new_app/src/assets/data/`.
2. **Runtime**: Angular services load JSON via `HttpClient` (or `fetch` during prerendering).
3. **Signals**: Services expose data as `signal<T[]>()` — components react to changes reactively.
4. **No backend**: Production runs as a Docker container with Angular SSR on Synology NAS (ADR-004).

## Deployment architecture

```text
┌──────────────────────────────────────────────┐
│              Synology NAS                    │
│  ┌────────────────────────────────────────┐  │
│  │  Docker Container (Node Alpine)        │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │  Angular SSR (Express/Node)      │  │  │
│  │  │  - Prerendered HTML pages        │  │  │
│  │  │  - Static assets (JS, CSS, JSON) │  │  │
│  │  │  - SSR for dynamic routes        │  │  │
│  │  └──────────────────────────────────┘  │  │
│  │  Port 8080 → container port 80         │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Optional: Reverse proxy (HTTPS/domain)      │
└──────────────────────────────────────────────┘
```

## SSR and prerendering

Angular SSR (`@angular/ssr`) serves two purposes:

- **SEO**: Castle pages need to be indexable. Prerendering generates static HTML at build time.
- **Performance**: First Contentful Paint is fast because HTML is already rendered.

Static routes prerendered at build time: Home, Top 1000, Top Countries, Top Regions, Background, and all individual castle detail pages (generated from JSON data).

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
