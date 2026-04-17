# Migration instructions

## Steps
1. Define migration scope and success criteria.
2. Define drop scope: explicitly list old app parts that will not be migrated.
3. Create/confirm target app skeleton and repository structure.
4. Finalize architecture baseline (see `docs/architecture.md`).
5. Finalize pipeline baseline (see `docs/pipeline.md`).
6. Finalize setup/tooling baseline (see `docs/setup.md`).
7. Analyze PHP source behavior for priority pages/features.
8. Create migration slices (one page/feature at a time) with validation criteria.
9. Implement slice-by-slice with local commits and parity checks.
10. Visual parity pass: replicate the old app's layout, color scheme, and typography in the new app (see "Visual parity" section below).
11. Update docs and ADRs as decisions or behavior change.
12. Run final verification and prepare approval-gate summary.

## Graphify analysis findings (2026-04-17)

Knowledge-graph analysis (481 nodes, 403 edges, 176 communities) surfaced the
following structural insight relevant to migration step 9:

**All PHP navigation/lookup functions route through `PerformQuery()`.**

The five lookup helpers in `old_app/functions/menu.php` —
`LookupPosition()`, `LookupCountry()`, `LookupRegion()`,
`LookupNextCastlePosition()`, `LookupNextCastleCountry()` — each call
`PerformQuery()` in `old_app/functions/perform_query.php`.
This means the castle-detail prev/next navigation, country lookup, and
region lookup all depend on a single SQL query builder that uses string
concatenation (known SQL-injection pattern documented in baseline tests).

**Migration implication:** In Angular, these lookups must be consolidated into
`CastleService` methods that operate on the static JSON dataset. A single
service method with filter/sort parameters can replace the five separate
PHP functions and their shared `PerformQuery()` dependency, eliminating
the SQL-injection surface entirely.

## Visual parity

**Goal:** The new Angular app should replicate the old app's layout and visual
identity so it feels like a refresh, not a redesign.

### Old app design characteristics (from `old_app/style/2col_leftNav.css`)

| Property | Old app value |
|---|---|
| Layout | Fixed-width 1000 px centered `<table>`, 2-column (left nav ~24%, content ~70%) |
| Body background | `#00005C` (dark blue) behind centered white content area |
| Font | Verdana 11 px bold, sans-serif fallback |
| Headings | Verdana/Arial, h1 180%, h2 140%, h3 120%, h4 100% |
| Primary link color | `#000099` (dark blue), underline on hover |
| Link hover background | `#CCCCFF` (light lavender) |
| Masthead / top bar | `#FF9900` (orange) background, black text, padding-left 269 px (logo width) |
| Left nav background | `#E6E6F5` (pale lavender) |
| Table header `<th>` | `#CCCCEB` (lavender) background |
| Feature/section header | `#CCCCFF` (light lavender) background |
| Alternating table rows | `.rowOdd` white, `.rowEven` `#FFF6DE` (cream) |
| Section dividers | `2 px solid #CCCCFF` bottom borders |
| Logo / banner | `style/logo_topkastelen_nl.jpg`, `style/banner_topkastelen_nl.jpg` |
| Favicon | `style/tk-shield.ico` |
| List bullets | Custom `arrow.gif` via `list-style-image` |

### Migration approach

1. **During slice implementation (current):** Use Angular Material defaults;
   focus on functional parity first.
2. **Step 10 — Visual parity pass:** After all functional slices are done,
   apply a dedicated styling pass:
   - Set global SCSS variables matching the old app palette (`$primary: #000099`,
     `$accent: #FF9900`, `$bg-dark: #00005C`, `$nav-bg: #E6E6F5`, etc.).
   - Override Angular Material theme colors to match.
   - Match typography (Verdana 11 px base, heading scale).
   - Replicate the 2-column layout with left nav sidebar using CSS grid/flexbox
     (no `<table>` layout).
   - Port the masthead/header bar with orange background.
   - Apply alternating row colors to tables.
   - Bring over the logo, favicon, and banner images from `old_app/style/`.
3. **Side-by-side comparison:** Open old and new app in adjacent browser windows
   and verify visual alignment page by page.

## Scope decisions

### Migrate

- Core public pages and features from `old_app/` that are still required for end users.
- Shared behavior required for parity (routing, query parameters, form handling, content display).
- Language scope: English only (`old_app/content/en/` baseline).

### Drop (do not migrate)

Use this checklist before implementation starts. Any dropped item should be explicitly approved.

- Legacy admin pages not used in the new product.
- Non-English content and language-specific assets (NL and other non-EN variants).
- Deprecated utilities, experiments, or one-off maintenance scripts.
- Obsolete static assets/content no longer referenced by retained pages.
- Outdated map download artifacts (KMZ/KML/GPX/OV2 and legacy navigator export files).
- Integration code for third-party services that are no longer needed.

## Drop-scope register

Track every intentionally dropped part here.

| Old app path | Reason to drop | Approved by | Date | Replacement/impact |
|---|---|---|---|---|
| `old_app/@rr.wfpr` | Legacy editor/workflow artifact; not runtime content | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/@rr.wfpr` |
| `old_app/ie4 fouten.txt` | Legacy troubleshooting notes for obsolete browser compatibility | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/ie4 fouten.txt` |
| `old_app/content/en/_notes/dwsync.xml` | Dreamweaver sync metadata; not runtime content | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/en/_notes/dwsync.xml` |
| `old_app/content/nl/_notes/dwsync.xml` | Dreamweaver sync metadata; not runtime content | User | 2026-04-16 | Included in archived `old_app/content/nl/` tree |
| `old_app/images/kasteelsoorten.vsd` | Source diagram file for editing only; not web-delivered asset | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/images/kasteelsoorten.vsd` |
| `old_app/images/kasteelsoortenv2.vsd` | Source diagram file for editing only; not web-delivered asset | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/images/kasteelsoortenv2.vsd` |
| `old_app/google4324f9ef63fd4ac0.html` | Legacy search-engine verification file from old deployment | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/google4324f9ef63fd4ac0.html` |
| `old_app/LiveSearchSiteAuth.xml` | Legacy search-engine verification artifact | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/LiveSearchSiteAuth.xml` |
| `old_app/castles_rating.htm` | Standalone legacy export page (Excel-generated), not linked from current public flows | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/castles_rating.htm` |
| `old_app/tumblr_links.html` | Legacy external-link page outside core product flows | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/tumblr_links.html` |
| `old_app/content/nl/` | Product decision: EN-only migration; NL content not in target scope | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/nl/` |
| `old_app/content/Topcastles.kmz` | Outdated map download artifact; approved for removal | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/Topcastles.kmz` |
| `old_app/content/Topcastles.kml` | Outdated map download artifact; approved for removal | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/Topcastles.kml` |
| `old_app/content/Topcastles.gpx` | Outdated map download artifact; approved for removal | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/Topcastles.gpx` |
| `old_app/content/Topcastles.ov2` | Outdated map download artifact; approved for removal | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/Topcastles.ov2` |
| `old_app/content/Topcastles_Belgium.kmz` | Outdated map download artifact; approved for removal | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/Topcastles_Belgium.kmz` |
| `old_app/content/Topcastles_Belgium.kml` | Outdated map download artifact; approved for removal | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/Topcastles_Belgium.kml` |
| `old_app/content/Topcastles_Netherlands.kmz` | Outdated map download artifact; approved for removal | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/Topcastles_Netherlands.kmz` |
| `old_app/content/Topcastles_Netherlands.kml` | Outdated map download artifact; approved for removal | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/Topcastles_Netherlands.kml` |
| `old_app/content/tomtom/` | Legacy navigator export package; related to outdated map downloads | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/tomtom/` |
| `old_app/includes/counter.php` | Legacy visitor counter admin feature; not required in new product | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/includes/counter.php` |
| `old_app/functions/enquete.php` | Poll management functions; voting disabled, full feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/functions/enquete.php` |
| `old_app/functions/ip.php` | IP lookup utility for admin visitor stats; admin feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/functions/ip.php` |
| `old_app/includes/change_language.php` | Language toggle UI; EN-only enforced, toggle no longer needed | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/includes/change_language.php` |
| `old_app/includes/ct_achtergrond_resultaat.php` | Poll results display include; poll feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/includes/ct_achtergrond_resultaat.php` |
| `old_app/includes/ct_achtergrond_reageer.php` | Comments/reactions feature include; feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/includes/ct_achtergrond_reageer.php` |
| `old_app/includes/ct_bezoekers_reageer.php` | Visitor comments feature include; feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/includes/ct_bezoekers_reageer.php` |
| `old_app/includes/ct_bezoekers_stemmen.php` | Admin IP-based visitor stats page; admin feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/includes/ct_bezoekers_stemmen.php` |
| `old_app/includes/nb_index_enquete.php` | Poll widget in index sidebar; poll feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/includes/nb_index_enquete.php` |
| `old_app/content/en/nb_index_enquete.php` | EN poll widget in index sidebar; poll feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/en/nb_index_enquete.php` |
| `old_app/content/en/ct_achtergrond_resultaat.php` | EN poll results display page; poll feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/en/ct_achtergrond_resultaat.php` |
| `old_app/content/en/ct_achtergrond_enquetes.php` | EN poll voting page; poll feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/en/ct_achtergrond_enquetes.php` |
| `old_app/content/en/ct_bezoekers_resultaat.php` | EN visitor poll results page; poll feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/en/ct_bezoekers_resultaat.php` |
| `old_app/content/en/ct_bezoekers_enquetes.php` | EN visitor poll voting page; poll feature dropped | User | 2026-04-16 | Moved to `old_app/archive/drop-scope-2026-04-16/content/en/ct_bezoekers_enquetes.php` |

## Skeleton

Create folder structure for:
1. `new_app/` (target framework application)
2. `old_app/` (legacy PHP baseline, read-only for reference)
3. `plan/` and `docs/` (migration planning and decisions)

## Clean up

Instruction:
1. Move pages/assets confirmed as dropped to an archive area or document them in the drop-scope register.
2. Do not delete legacy files without documenting reason and impact.

Not required:
- admin pages
- non-EN language content (including `old_app/content/nl/`)
- outdated map/navigation download files (`*.kmz`, `*.kml`, `*.gpx`, `*.ov2`, `old_app/content/tomtom/`)

## Post-migration features

### Discogs-style list/card view toggle

**Inspiration:** [Discogs collection view](https://www.discogs.com/user/hobunror/collection) — a toggle that switches between a compact list and a visual card grid.

**Scope:** All castle-listing pages (top 100, countries, search results, etc.) should support two presentation modes with a view selector toggle.

**List view** (default — the tabular format already built during migration):
- Corresponds to the bottom table in `old_app/includes/ct_top100_main.php`
  which includes `content/en/tabel_top100.php`.
- Compact rows: position, name, country, rating, etc.

**Card view** (visual grid):
- Corresponds to the top table in `old_app/includes/ct_top100_main.php`
  which includes `content/en/tabel_20plaatjes.php`.
- Castle image (110×110 in old app) prominently displayed per card.
- Additional info overlaid or below the image: name, country, position/rating.
- Cards fill the full page width using a responsive CSS grid (not the old 5-column fixed table).
- Cards link to the castle detail page.

**View selector UI:**
- A toggle control (icon buttons or segmented control) placed above the castle listing.
- Two states: list icon / grid icon, similar to Discogs.
- Selected view preference persisted in `localStorage` so it survives page navigation.

**Implementation notes:**
- Reuse the same data source (`CastleService`) for both views.
- The list view component already exists from migration.
- New work: a `CastleCardComponent` (single card) and a `CastleCardGridComponent` (responsive grid wrapper).
- Parent pages wrap both views and conditionally show one based on the toggle state.
- Responsive breakpoints: ≥5 cards/row on desktop, 3 on tablet, 2 on mobile.

**PHP source reference:**
- `old_app/content/en/tabel_20plaatjes.php` — card layout (5-column image grid, 120×120 cells).
- `old_app/content/en/tabel_top100.php` — list layout (tabular rows).
- `old_app/includes/ct_top100_main.php` — page that renders both (top = cards, bottom = list).