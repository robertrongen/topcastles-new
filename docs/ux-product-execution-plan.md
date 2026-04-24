# UX And Product Execution Plan

This plan turns the approved UX and product improvement strategy into repo-executable work. It is intentionally docs-and-backlog oriented: implementation remains in follow-up beads, and roadmap authority stays in [roadmap.md](roadmap.md).

## Roadmap Coverage

This plan maps directly to these roadmap items:

- **9.5 design refresh**: Storybook-led design refresh, cleaner visual style, stronger typography hierarchy, better whitespace rhythm, consistent light/dark theme treatment, and improved table density for top countries and top regions.
- **10.3 PWA / service worker**: Angular PWA setup, service worker registration, offline caching for static assets and castle JSON, and web app manifest verification.
- **11.0 / 13.3 NAS image serving**: Single image access path, NAS-mounted image serving, cache-control and missing-file behavior, and eventual removal of bundled castle images if NAS serving becomes authoritative.
- **14.1 complete login behavior**: Complete the remaining token validation login behavior while preserving the file-based user model.
- **15.1 to 15.7 admin API/UI workflow**: Admin auth, admin shell, castle edit/add flows, enrichment script execution, intro text editing, and rebuild trigger workflow.

## Strategy Summary

Work should proceed in two tracks.

The routine UX track should stay lightweight and reviewable: expand Storybook coverage first, define shared visual tokens, then refresh shared components and public pages incrementally. Storybook is the implementation anchor for shared UI decisions. Claude Design, Figma, or Penpot may be used as optional exploration inputs, but they are not source of truth.

The architecture-sensitive product track should use fuller Spec Kit discipline before implementation. PWA, NAS image serving, admin APIs, admin UI, and rebuild-trigger behavior touch runtime/deployment boundaries, cache behavior, or build-time versus runtime artifact ownership.

All work must preserve the current architecture guardrails: JSON only, no database, no runtime mutation of prerendered content, single-container Node runtime, Angular Signals rather than NgRx, and the existing build-time content/runtime state split.

## Phased Workstreams

### 1. Storybook UX Baseline

Expand shared-component stories before broad visual implementation. Cover dense, empty, mobile, desktop, light theme, and dark theme states where practical.

Primary surfaces:

- `CastleTableComponent`
- `CastleGridComponent`
- `CastleFilterComponent`
- `ViewToggleComponent`
- Top countries and top regions table states, either through existing page stories or extracted story-friendly presentation components

### 2. Shared Visual System Refresh

Define the refreshed typography, spacing, density, color, and theme behavior in the smallest shared surfaces possible. The goal is a cleaner and more harmonic product look without changing app architecture or data flow.

Focus areas:

- Typography hierarchy for headings, summaries, metadata, and dense lists
- Whitespace rhythm across page sections, cards, filters, and repeated content
- Light/dark theme parity
- Table density and width behavior
- Mobile responsiveness and empty states

### 3. Public Page Refresh

Apply the shared visual system incrementally to public routes after Storybook gives stable review surfaces.

Primary surfaces:

- Home
- Browse/top100
- Castle detail
- No-castle detail
- Country detail
- Top countries
- Top regions

### 4. NAS Image Serving Hardening

Complete image serving as a runtime-sensitive workstream. Keep a single app-facing image access path and verify mounted-volume behavior before changing container image assumptions.

### 5. Login Completion

Complete the remaining user login behavior around the existing token model. This should stay narrow unless it reveals a broader auth contract issue.

### 6. PWA And Offline Browsing

Add PWA/service worker support only after cache scope and image-serving behavior are clear. Treat this as Spec Kit work because caching can easily conflict with content freshness and static/runtime boundaries.

### 7. Admin API And Admin UI Workflow

Build admin capabilities in strict sequence: auth, shell, edit/add content, enrichment, intro text, rebuild trigger. Treat this as Spec Kit work because admin features affect JSON writes, pipeline execution, and prerender freshness.

## Implementation Bead Backlog

Recommended initial backlog ordering:

1. Expand Storybook coverage for UX refresh baseline.
2. Define theme tokens, typography scale, spacing rhythm, and dark theme parity.
3. Refresh shared castle table, grid, filter, and view-toggle components.
4. Improve top countries and top regions table layout density.
5. Refresh homepage and browse/top100 public UX surfaces.
6. Refresh castle detail, no-castle detail, and country detail UX surfaces.
7. Harden NAS image serving and mounted-volume verification.
8. Complete token login endpoint and client behavior.
9. Plan PWA/service worker implementation with Spec Kit.
10. Implement PWA/service worker after cache scope review.
11. Plan admin API/UI workflow with Spec Kit.
12. Implement admin API auth.
13. Implement admin UI shell and token entry.
14. Implement admin castle edit workflow.
15. Implement admin add castle workflow.
16. Implement admin enrichment log workflow.
17. Implement admin intro text workflow only if deliberately activated.
18. Implement admin rebuild trigger workflow.

## Dependencies And Sequencing

- Storybook coverage should precede visual refresh implementation.
- Theme, typography, spacing, and density decisions should precede page-by-page styling.
- Shared table/grid/filter work should precede top countries and top regions layout refinements.
- NAS image-serving behavior should be stable before PWA cache rules include image assumptions.
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

## Recommended First Execution Bead

Start with **Expand Storybook coverage for UX refresh baseline**.

This is the safest first implementation bead because it maps directly to roadmap item 9.5, creates reviewable UI surfaces before styling changes, and keeps the first execution step lightweight.

## Roadmap Wording Gaps To Revisit Later

- The roadmap already mentions NAS image serving, but current code may already contain part of the image-service and server-route baseline. A later docs-only pass could clarify remaining work versus completed baseline.
- The roadmap lists Storybook as part of the design refresh, while `docs/storybook.md` already documents existing stories. A later docs-only pass could cross-link these once the execution backlog starts.
- Admin item 11.5 and admin items 15.1 to 15.7 overlap around JSON content updates. A later docs-only pass could clarify whether 11.5 remains an umbrella or should defer fully to the 15.x admin workflow.
