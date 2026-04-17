
# Architecture

> Stack locked: Angular 19 + Material + Storybook + SCSS (ADR-002). See `docs/decisions.md`.

## Source application

The legacy application lives in `old_app/` and is a PHP website with:

- Server-rendered PHP pages with MySQL backend
- Bilingual content (NL/EN) under `old_app/content/` (EN-only in migration scope — ADR-001)
- Static assets under `old_app/images/` and `old_app/style/`
- Form handling under `old_app/forms/` and shared logic under `old_app/functions/`

## New application

### High-level architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│  Angular 19 SPA (SSR-prerendered for SEO)          │
│  ┌─────────┐ ┌──────────┐ ┌───────────────┐       │
│  │ Pages   │ │Components│ │ Angular       │       │
│  │(routes) │ │(shared)  │ │ Material UI   │       │
│  └────┬────┘ └─────┬────┘ └───────────────┘       │
│       │            │                                │
│       └─────┬──────┘                                │
│             ▼                                       │
│  ┌──────────────────┐                               │
│  │    Services       │  ← inject() DI               │
│  │  (CastleService,  │                               │
│  │   CountryService) │                               │
│  └────────┬─────────┘                               │
│           ▼                                         │
│  ┌──────────────────┐                               │
│  │  Static JSON      │  ← /assets/data/*.json       │
│  │  (castle data)    │     built from CSV export     │
│  └──────────────────┘                               │
└─────────────────────────────────────────────────────┘
```

### How Angular concepts map to PHP patterns

Understanding how the old PHP app's structure translates to Angular helps keep the migration
grounded in real behavior (per migration rules: PHP = behavioral source of truth).

| PHP pattern | Angular equivalent | Example |
|---|---|---|
| Top-level `.php` page (e.g., `kastelen.php`) | **Page component** in `pages/` with a route | `CastlesPageComponent` at `/castles` |
| `old_app/forms/form_kastelen.php` (form handler) | Logic inside the page component or a service method | `CastleService.filterCastles()` |
| `old_app/functions/perform_query.php` (DB queries) | **Service** using `HttpClient` to load JSON | `CastleService.loadCastles()` |
| `old_app/includes/ct_*.php` (content templates) | **Child components** composed inside page components | `<app-castle-card>`, `<app-castle-table>` |
| `old_app/functions/menu.php` (shared nav) | **Layout component** with `mat-toolbar`/`mat-sidenav` | `AppComponent` shell |
| `old_app/style/*.css` | **SCSS** with Angular Material theming | `_theme.scss` + component `.scss` files |
| `$_GET` query parameters | Angular Router `queryParams` | `ActivatedRoute.queryParams` |
| PHP `include()` / `require()` | Angular component composition (`<app-child>`) | Template `<app-castle-list>` |

### Component hierarchy (planned)

```
AppComponent (shell: toolbar + sidenav + router-outlet)
├── HomePageComponent              ← index.php
├── CastlesPageComponent           ← kastelen.php
│   ├── CastleTableComponent       ← ct_kastelen_main.php
│   └── CastleFilterComponent      ← form_kastelen.php
├── CastleDetailPageComponent      ← kastelen.php?kasteel=X
│   └── CastleCardComponent        ← ct_kastelen_next.php
├── Top100PageComponent            ← top100.php / topkastelen.php
│   └── CastleRankingComponent     ← ct_topkastelen_main.php
├── CountriesPageComponent         ← landen.php
│   └── CountryListComponent       ← ct_landen_main.php
├── TypesPageComponent             ← soorten.php
│   └── CastleTypesComponent       ← ct_soorten_main.php
├── SearchPageComponent            ← zoeken.php
│   └── SearchFormComponent        ← form_zoeken.php
├── BackgroundPageComponent        ← achtergrond.php
│   └── BackgroundSectionComponent ← ct_achtergrond_*.php
└── VisitorsPageComponent          ← bezoekers.php
    └── VisitorSectionComponent    ← ct_bezoekers_*.php
```

### Data flow

1. **Build time**: Python script reads `old_app/database/Topcastles export.csv` → produces `castles.json`, `countries.json`, etc.
2. **Runtime**: Angular services load JSON via `HttpClient` (or `fetch` for prerendering).
3. **Signals**: Services expose data as `signal<T[]>()` → components react to changes.
4. **No backend API**: The production app runs as a Docker container with Angular SSR on Synology NAS (ADR-004).

### Deployment architecture

```
┌──────────────────────────────────────────────┐
│              Synology NAS                     │
│  ┌────────────────────────────────────────┐  │
│  │  Docker Container (Node Alpine)        │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │  Angular SSR (Express/Node)      │  │  │
│  │  │  - Prerendered HTML pages        │  │  │
│  │  │  - Static assets (JS, CSS, JSON) │  │  │
│  │  │  - SSR for dynamic routes        │  │  │
│  │  └──────────────────────────────────┘  │  │
│  │  Port 4000 (configurable)              │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Optional: Reverse proxy (HTTPS/domain)      │
└──────────────────────────────────────────────┘
```

### SSR and prerendering strategy

Angular SSR (`@angular/ssr`) serves two purposes for this project:

- **SEO**: Castle pages need to be indexable. Prerendering generates static HTML at build time.
- **Performance**: First Contentful Paint is fast because HTML is already rendered.

Pages to prerender (static routes known at build time):
- Home, Top 100, Countries, Types, Background, Visitors
- Individual castle detail pages (generated from JSON data)

### Theming approach

Angular Material's theming system is configured in `new_app/src/styles.scss` using the M3 `mat.theme()` mixin, with the old-app brand applied on top via CSS overrides (ADR-005).

```scss
// styles.scss — actual implementation
@use '@angular/material' as mat;

// Step 1: M3 theme — orange primary aligns Material internals with the brand
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

// Step 2: old-app palette variables
$tk-orange:     #FF9900;  // masthead / toolbar
$tk-dark-blue:  #00005C;  // page body background
$tk-link:       #000099;  // primary link colour
$tk-link-hover: #CCCCFF;  // link hover background
$tk-nav-bg:     #E6E6F5;  // sidenav background
$tk-th-bg:      #CCCCEB;  // table header background
$tk-row-even:   #FFF6DE;  // alternating table row (even)

// Step 3: targeted overrides applied on top of M3 defaults
body { font-family: Verdana, Arial, sans-serif; font-size: 11px; font-weight: bold; }
.mat-toolbar { background-color: $tk-orange !important; }
mat-sidenav  { background-color: $tk-nav-bg !important; }
a:link, a:visited { color: $tk-link; }
a:hover { background-color: $tk-link-hover; }
```

Key assets from `old_app/style/` now live in `new_app/public/`:
- `logo_topkastelen_nl.jpg` — rendered in the orange masthead toolbar
- `favicon.ico` (replaced with `tk-shield.ico`)