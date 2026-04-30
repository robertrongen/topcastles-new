# UX And Product Execution Plan

This plan turns the approved UX and product improvement strategy into repo-executable work. It is intentionally docs-and-backlog oriented: implementation remains in follow-up beads, and roadmap authority stays in [roadmap.md](roadmap.md).

## Roadmap Coverage

This plan maps directly to these roadmap items:

- **9.5 design refresh** [DONE]: Storybook-led design refresh, cleaner visual style, stronger typography hierarchy, better whitespace rhythm, consistent light/dark theme treatment, and improved table density for top countries and top regions. Routine shared-component and public-page UX refresh work is complete.
- **9.6 homepage reference-atlas structure** [COMPLETED]: Full homepage layout including *From Today's Index*, *Distribution Map* with clickable atlas region callouts, *Top 10* reference table with editor's note, visitor ranking section, and sidebar reference column. See [product-strategy-plan.md](product-strategy-plan.md) §1 for the full structure.
- **9.6.1 By the Numbers strip** [COMPLETED]: Static statistics row between *From Today's Index* and the map. See workstream 3.5.1.
- **9.6.2 Top 10 Countries index** [COMPLETED]: Reference table with country, total score, best rank, and top-ranked castle. See workstream 3.5.2.
- **9.6.3 By Period index** [COMPLETED]: Reference table with era, entries, share, and example castle. See workstream 3.5.3.
- **10.3 PWA baseline / service worker** [COMPLETED]: Angular PWA setup, service worker registration, production-safe cache scope, and manifest verification are complete. Castle images remain network-only by design. Active follow-up is user-facing install/help UX (`topcastles-pwa-install-help`).
- **11.0 / 13.3 NAS image serving** [OPEN]: Single image access path, NAS-mounted image serving, cache-control and missing-file behavior, and eventual removal of bundled castle images if NAS serving becomes authoritative.
- **14.1 complete login behavior**: Complete the remaining token validation login behavior while preserving the file-based user model. [DONE]
- **15.1 to 15.7 admin API/UI workflow** [OPEN]: Admin auth, admin shell, castle edit/add flows, enrichment script execution, intro text editing, and rebuild trigger workflow.

## Current Beads Snapshot

As of 2026-04-30, the executable backlog is intentionally small:

- `topcastles-pwa-install-help` [IN_PROGRESS]: add visible app-install help and browser fallback instructions without changing service worker scope.
- `topcastles-g3i` [IN_PROGRESS]: Phase 11 umbrella for advanced/optional discovery work.
- `topcastles-0b0` [OPEN]: castle name autocomplete. Current code and commit history (`1e097e1`) indicate this is already present on the castles page, so treat it as verification/bookkeeping unless the bead is re-scoped.
- `topcastles-uax` [OPEN]: castle comparison view.
- `topcastles-wj4` [OPEN]: castle of the week on the homepage.

The next planning move is to finish or explicitly defer the PWA install-help follow-up, close or supersede the stale autocomplete bead after verification, then choose one lightweight discovery improvement before starting another architecture-sensitive track.

Recent commit messages used for this snapshot:

- `14ad697` and `6e88a0e`: PWA baseline landed, then service worker cache scope was corrected to exclude raster image globs.
- `4cc6c1e`: operator verification checklist and user install guide were added to docs.
- `3eb35d4`: token login behavior landed.
- `269a35d`, `5d774c4`, and `a139925`: admin staged upload endpoint pair and operator guidance landed.
- `1e097e1`: castle name autocomplete appears to have landed alongside dark mode toggle work.

## Strategy Summary

Work should proceed in two tracks.

The routine UX track should stay lightweight and reviewable: expand Storybook coverage first, define shared visual tokens, then refresh shared components and public pages incrementally. Storybook is the implementation anchor for shared UI decisions. Claude Design, Figma, or Penpot may be used as optional exploration inputs, but they are not source of truth.

The approved homepage UX model is the **reference-atlas structure** defined in [product-strategy-plan.md](product-strategy-plan.md) §1. All homepage UX work must be evaluated against this model. Key constraints for homepage work:
- *From Today's Index* (Top 100 random castle) must be visible on first paint — it is the homepage anchor.
- *Distribution Map* must precede the *Top 10* table in document flow.
- Sidebar is a reference column, not a promotional panel.
- Reference-table layout for Top 10, country index, and period index — not cards.
- Section labels must use the "medieval atlas" register.
- Methodology must be reachable from the footer.

The architecture-sensitive product track should use fuller Spec Kit discipline before implementation. PWA, NAS image serving, admin APIs, admin UI, and rebuild-trigger behavior touch runtime/deployment boundaries, cache behavior, or build-time versus runtime artifact ownership.

All work must preserve the current architecture guardrails: JSON only, no database, no runtime mutation of prerendered content, single-container Node runtime, Angular Signals rather than NgRx, and the existing build-time content/runtime state split.

## Phased Workstreams

### 1. Storybook UX Baseline [DONE]

Expand shared-component stories before broad visual implementation. Cover dense, empty, mobile, desktop, light theme, and dark theme states where practical.

Primary surfaces:

- `CastleTableComponent`
- `CastleGridComponent`
- `CastleFilterComponent`
- `ViewToggleComponent`
- Top countries and top regions table states, either through existing page stories or extracted story-friendly presentation components

### 2. Shared Visual System Refresh [DONE]

Define the refreshed typography, spacing, density, color, and theme behavior in the smallest shared surfaces possible. The goal is a cleaner and more harmonic product look without changing app architecture or data flow.

Focus areas:

- Typography hierarchy for headings, summaries, metadata, and dense lists
- Whitespace rhythm across page sections, cards, filters, and repeated content
- Light/dark theme parity
- Table density and width behavior
- Mobile responsiveness and empty states

### 3. Public Page Refresh [DONE]

Apply the shared visual system incrementally to public routes after Storybook gives stable review surfaces.

Primary surfaces:

- Home
- Browse/top100
- Castle detail
- No-castle detail
- Country detail
- Top countries
- Top regions

### 3.5. Homepage Reference-Atlas Structure [COMPLETED]

The approved homepage layout has been implemented and validated as defined in [product-strategy-plan.md](product-strategy-plan.md) §1. This workstream is distinct from the general visual refresh: it establishes structural correctness and reference-atlas identity.

Completed UX targets:

- **From Today's Index**: random castle from Top 100, rendered as the primary content block on first paint. Includes castle name, country, rank, place, era, type, condition, Wikipedia extract, editorial score, and visitor rating. Server-side random selection via deterministic daily algorithm.
- **Distribution Map**: interactive map showing castle density by country with clickable markers and clickable atlas region callouts (Rhine & Moselle, Loire Valley, British Isles) that link to filtered browse views. Includes "Plate I" caption and editorial annotations for each region. Map appears in document flow before the Top 10 table as intended.
- **Top 10 of the List**: reference-table layout (not cards) displaying rank #, castle name, country, era, editorial score, and visitor rating. Includes column headers, links to individual castle detail pages, and link to full ranking.
- **Editor's note**: positioned with Top 10 section; explains ranking methodology (architectural significance, preservation, historical importance, accessibility) and provides link to full methodology documentation.
- **Top by visitor rating**: visitor lead card showing #1 visitor-rated castle with image, name, country, and visitor rating. Followed by table of #2–#5 visitor-rated castles (rank, name, country, rating). Distinct pool from editorial ranking; explains visitor rating independence.
- **Right sidebar**: narrow reference column with three widgets:
  - "About this list" widget: site description, history, visitor rating era context, links to methodology and selection criteria.
  - "Discover the list" widget: random castle picker from positions 100–1000 (distinct pool from Top 100); positioned as deep-discovery entry point.
  - "Tools" widget: "Top castle near me" geolocation button, links to favorites and data/API pages.
- **Typography and spacing**: follows shared visual system refresh (workstream 2); reference-table layout density, sidebar reference-column styling, and section label consistency applied.
- **Methodology link**: reachable from editor's note; link targets `/background` on every Top 10-adjacent section.

Design execution verified:
- No card-heavy layouts on the homepage.
- Reference-table structure used for rankings.
- Section labels and editorial voice follow "medieval atlas" register.
- Random elements are distinct and intentional: Top 100 for From Today's Index; positions 100–1000 for sidebar picker.

### 3.5.1. Homepage Polish — By the Numbers Strip [COMPLETED]

Static `<dl>` flex grid between *From Today's Index* and *Distribution Map*: 1,000 castles · 56 countries · 63,800 visitor ratings · Est. 2004. No TS changes; values are compile-time constants; light/dark handled by `--tk-*` tokens.

### 3.5.2. Homepage Polish — Top 10 Countries Index [COMPLETED]

Reference table after *Top by visitor rating*. Columns: rank, country (link to `/countries/:country`), total score (the sort key), best rank, top-ranked castle with rank in brackets (link to `/castles/:code`). Derived from `CastleService.getCountrySummaries()` via `top10Countries` computed signal in `HomePageComponent`.

### 3.5.3. Homepage Polish — By Period Index [COMPLETED]

Reference table after *Index of Top Countries*. Columns: period label (link to `/castles?era=N`), entries, share of era-tagged castles, example castle with rank in brackets. Derived from `castleService.castles()` grouped by `c.era` in `byPeriod` computed signal; null era excluded; sorted chronologically (9th–17th c.).

### 4. NAS Image Serving Hardening

Complete image serving as a runtime-sensitive workstream. Keep a single app-facing image access path and verify mounted-volume behavior before changing container image assumptions.

### 5. Login Completion [DONE]

Complete the remaining user login behavior around the existing token model. This should stay narrow unless it reveals a broader auth contract issue.

### 6. PWA And Offline Browsing

The production-safe PWA baseline is complete: the service worker is registered, static app assets and build-time JSON are cached deliberately, and NAS-served castle images are excluded from the service worker cache. Remaining PWA work is product-facing rather than cache-architecture work: help users discover installation, explain browser-specific install paths, and set expectations that app shell and castle data can work offline while castle images require network.

`topcastles-pwa-install-help` is the active follow-up. It should stay narrow: add an install/help entry to the existing header and mobile sidenav, use `beforeinstallprompt` where available, fall back to concise browser instructions, and avoid changing `ngsw-config.json` unless a separate Spec Kit pass justifies it.

### 7. Admin API And Admin UI Workflow

Build admin capabilities in strict sequence: auth, shell, edit/add content, enrichment, intro text, rebuild trigger. Treat this as Spec Kit work because admin features affect JSON writes, pipeline execution, and prerender freshness.

## Implementation Bead Backlog

Recommended backlog ordering:

1. Expand Storybook coverage for UX refresh baseline. [DONE]
2. Define theme tokens, typography scale, spacing rhythm, and dark theme parity. [DONE]
3. Refresh shared castle table, grid, filter, and view-toggle components. [DONE]
4. Improve top countries and top regions table layout density. [DONE]
5. Refresh homepage and browse/top100 public UX surfaces. [DONE]
6. Refresh castle detail, no-castle detail, and country detail UX surfaces. [DONE]
7. Implement homepage polish items (9.6.1–9.6.3): By the Numbers strip, Top 10 Countries index, By Period index. See workstream 3.5.1–3.5.3. [DONE]
8. Complete token login endpoint and client behavior. [DONE]
9. Complete PWA install/help UX (`topcastles-pwa-install-help`). [IN_PROGRESS]
10. Verify and close or supersede `topcastles-0b0` because autocomplete appears already implemented in commit `1e097e1`.
11. Choose one Phase 11 discovery feature: castle of the week (`topcastles-wj4`) is the lighter homepage slice; comparison (`topcastles-uax`) is larger and should wait for a design pass.
12. Harden NAS image serving and mounted-volume verification before changing image delivery assumptions.
13. Plan the remaining admin API/UI workflow with Spec Kit.
14. Implement admin UI shell and token entry.
15. Implement admin castle edit workflow.
16. Implement admin add castle workflow.
17. Implement admin enrichment log workflow.
18. Implement admin intro text workflow only if deliberately activated.
19. Implement admin rebuild trigger workflow only after a dedicated runtime/build-boundary plan.

## Dependencies And Sequencing

- Storybook coverage should precede visual refresh implementation.
- Theme, typography, spacing, and density decisions should precede page-by-page styling.
- Shared table/grid/filter work should precede top countries and top regions layout refinements.
- Castle images must remain outside the service worker cache unless a future Spec Kit pass changes the image-serving strategy deliberately.
- Admin API auth must precede admin UI and content workflows.
- Admin edit/add/enrichment/rebuild work must preserve the pipeline rule that prerendered content updates only after regeneration and build.

## Acceptance Criteria By Workstream

### Storybook UX Baseline

- Key shared components have stories for default, dense, empty, mobile, and desktop states where relevant.
- Storybook can be used to review light/dark theme behavior for shared UI.
- Stories use repo-local mock data and do not introduce runtime dependencies.

### Shared Visual System Refresh

- Typography hierarchy is clearer across headings, summaries, metadata, and dense lists.
- Whitespace rhythm is consistent across sections, cards, filters, and repeated content.
- Light and dark themes share one coherent visual direction rather than isolated fixes.
- Changes are incremental and reviewable through Storybook and public pages.

### Public Page Refresh

- Home, browse/top100, detail, country, top countries, and top regions pages reflect the refreshed shared system.
- Top countries and top regions tables avoid unnecessary full-width presentation on large screens.
- Mobile layouts remain readable and do not rely on horizontal whitespace.

### NAS Image Serving

- Castle image URLs go through a single service or equivalent access path.
- Runtime image serving works from the NAS mount with expected cache-control and 404 behavior.
- Container image assumptions are updated only after NAS serving is authoritative.

### Login Completion

- `POST /api/user/login` validates an existing token and returns the user object.
- Missing or invalid tokens return `401`.
- User state remains in `/data/users.json` through `json-store.js`.

### PWA / Service Worker

- Service worker registration is production-safe.
- Static assets and castle JSON are cached deliberately for offline browsing.
- Cache behavior does not obscure content freshness expectations.
- Manifest supports mobile add-to-home-screen behavior.
- Install/help UX explains when the browser install prompt is available and gives concise fallback instructions when it is not.

### Admin API/UI Workflow

- `/api/admin/...` routes require `Authorization: Bearer <token>` from `ADMIN_TOKEN`.
- Admin UI token storage is separate from regular user token behavior.
- Admin JSON writes go through `json-store.js`.
- Admin content changes trigger or clearly require regeneration/rebuild before prerendered pages reflect them.
- No runtime endpoint mutates prerendered HTML, JavaScript bundles, or other build artifacts in place.

## Lightweight Vs Spec Kit Classification

Use the normal lightweight Topcastles flow for:

- Storybook coverage.
- Shared visual tokens.
- Shared component refresh.
- Top countries/top regions layout density.
- Public page visual refresh.
- Narrow token login completion if it stays within the existing file-based user model.

Use fuller Spec Kit flow for:

- PWA/service worker work.
- NAS image-serving work that changes deployment, container, cache, or runtime assumptions.
- Admin API and admin UI work.
- Enrichment and rebuild-trigger workflows.
- Any change that could blur build-time content and runtime state.

## Next Execution Beads

The routine UX refresh backlog, the homepage reference-atlas structure (9.6), and all three homepage polish additions (9.6.1–9.6.3) are complete. The homepage UX track is fully delivered.

Open work should now be scheduled deliberately:

- Finish `topcastles-pwa-install-help` to close the gap between PWA capability and user discovery.
- Close or supersede `topcastles-0b0` after verifying the existing autocomplete behavior on `/castles`.
- Use `topcastles-g3i` to decide whether Phase 11 should prioritize `topcastles-wj4` castle of the week or `topcastles-uax` comparison.
- Schedule NAS hardening and the remaining admin UI/rebuild work only with explicit Spec Kit planning, because those still touch runtime/deployment boundaries.

## Roadmap Wording Gaps To Revisit Later

- The roadmap already mentions NAS image serving, but current code contains part of the server-route baseline. A later docs-only pass could clarify remaining work versus completed baseline.
- The roadmap lists Storybook as part of the design refresh, while `docs/storybook.md` already documents existing stories. A later docs-only pass could cross-link these once the execution backlog starts.
- Admin item 11.5 now covers the staged upload endpoint pair; remaining admin UI and rebuild behavior belongs under 15.x.
