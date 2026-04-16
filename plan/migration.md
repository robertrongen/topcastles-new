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
10. Update docs and ADRs as decisions or behavior change.
11. Run final verification and prepare approval-gate summary.

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