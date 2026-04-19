# Migration report: PHP to Angular

Topcastles was migrated from a legacy PHP/MySQL website (`old_app/`) to an Angular 19 application (`new_app/`) between April and April 2026. The migration is complete and the app is deployed.

## What was built

### Pages

| Route             | Component                  | Description                                      |
| ----------------- | -------------------------- | ------------------------------------------------ |
| `/`               | HomePageComponent          | Landing page                                     |
| `/castles`        | CastlesPageComponent       | All castles with inline search and filter        |
| `/castles/:code`  | CastleDetailPageComponent  | Individual castle detail with images and links   |
| `/top1000`        | Top100PageComponent        | Top 1000 ranked castles with region filter       |
| `/top-countries`  | TopCountriesPageComponent  | Countries ranked by top castle score             |
| `/top-regions`    | TopRegionsPageComponent    | Regions ranked by top castle score               |
| `/countries/:country` | CountryDetailPageComponent | Castles filtered by country                  |
| `/background`     | BackgroundPageComponent    | Background information on castle types           |
| `/nocastle/:code` | NoCastleDetailPageComponent| Detail page for "no castle" entries              |

### Shared components

- **CastleTableComponent** — sortable `mat-table` with column filters
- **CastleGridComponent** — responsive card grid (image + name + score)
- **CastleFilterComponent** — dropdown filters applied to both table and grid
- **ViewToggleComponent** — list/card view toggle, persisted in `localStorage`

### Services

- **CastleService** — loads and filters castle JSON data; exposes data as signals
- **NoCastleService** — loads "no castle" entries separately
- **ViewModeService** — manages list/card view preference across pages

## Key decisions

| ADR     | Decision                                                  |
| ------- | --------------------------------------------------------- |
| ADR-001 | English-only; voting and poll features dropped            |
| ADR-002 | Angular 19 + Material + Storybook + SCSS                  |
| ADR-003 | Static JSON from CSV; no database in build or production  |
| ADR-004 | Docker container deployed to Synology NAS via Docker Hub  |
| ADR-005 | Legacy brand palette applied via CSS overrides over M3    |

See [decisions.md](decisions.md) for full ADR details.

## What was dropped

The following legacy features and files were intentionally not migrated:

| Category                  | Items dropped                                                          |
| ------------------------- | ---------------------------------------------------------------------- |
| Language                  | All Dutch (`/nl`) content — English-only per ADR-001                  |
| Voting/polls              | `enquete.php`, all poll pages and widgets, visitor voting              |
| Admin features            | Visitor counter, IP lookup, admin stats pages                          |
| Map downloads             | `.kmz`, `.kml`, `.gpx`, `.ov2`, TomTom export files                   |
| Legacy editor artifacts   | `@rr.wfpr`, Dreamweaver sync files (`dwsync.xml`)                     |
| Search engine artifacts   | Google verification HTML, LiveSearch XML                               |
| Obsolete pages            | `castles_rating.htm` (Excel export), `tumblr_links.html`              |
| Contact/photographers     | Email contact link removed (no contact form in new product)            |
| Visitors page             | Removed — not needed in the new product                               |

Dropped files were moved to `old_app/archive/drop-scope-2026-04-16/`.

## Features added beyond parity

- **Card/table view toggle** — list and card grid views on all castle-listing pages, with `localStorage` persistence
- **Inline search** — search merged into the All Castles page (no separate search page)
- **Column filters** — dropdown filters on all listing pages for country, type, era, etc.
- **Region filter on Top 1000** — clickable regions linking to pre-filtered country pages
- **Responsive layout** — mobile-first with collapsible sidenav and centered banner on small screens
- **Castle type images** — 110×110px images added to castle type and no-castle listing tables
- **No castles page** — dedicated listing for "no castle" entries with images and detail pages

## Architecture notes

The five PHP navigation/lookup functions (`LookupPosition`, `LookupCountry`, `LookupRegion`, `LookupNextCastlePosition`, `LookupNextCastleCountry`) all routed through a single SQL query builder with a known SQL-injection pattern. These were consolidated into `CastleService` methods operating on static JSON, eliminating the injection surface entirely.
