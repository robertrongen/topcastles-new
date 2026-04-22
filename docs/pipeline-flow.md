# Pipeline Flow And old_app Extraction Plan

This document maps the current content pipeline and records the plan to make `old_app/` archival only. It complements [pipeline.md](pipeline.md), which remains the artifact-policy source of truth, and [architecture.md](architecture.md), which remains the runtime architecture source of truth.

## Current Pipeline Flow

1. Source spreadsheet input:
   - Current source: `source-data/topcastles/Topcastles export.xlsx`
   - Also present: `old_app/database/Topcastles export.csv`
   - Current command: `npm run data:regenerate` begins with `npm run data:convert`
   - Current script: `scripts/xlsx_to_json.py`
   - Outputs:
     - `new_app/src/assets/data/castles.json`
     - `new_app/src/assets/data/no_castles.json`

2. Wikipedia enrichment:
   - Command: `npm run data:enrich:wikipedia`
   - Script: `scripts/enrich_wikipedia.js`
   - Input: `new_app/src/assets/data/castles.json`
   - Optional helper data: `scripts/wikipedia_overrides.json`
   - Output: `new_app/src/assets/data/castles_enriched.json`

3. Wikidata enrichment:
   - Command: `npm run data:enrich:wikidata`
   - Script: `scripts/enrich_wikidata.js`
   - Input/output: `new_app/src/assets/data/castles_enriched.json`

4. Optional coordinate enrichment:
   - No root npm script currently wraps this command.
   - Script: `scripts/enrich_coordinates.js`
   - Input/output: `new_app/src/assets/data/castles_enriched.json`

5. Lean app-data generation:
   - Command: `npm run data:lean`
   - Script: `scripts/generate_lean_castles.js`
   - Input: `new_app/src/assets/data/castles_enriched.json`
   - Outputs:
     - `new_app/src/assets/data/castles.json`
     - `new_app/src/assets/data/castles_delta.json`
   - Note: this script may exit nonzero when it detects that prerendered HTML needs a rebuild.

6. Static API generation:
   - Command: `npm run data:api`
   - Script: `scripts/generate_api.js`
   - Input: `new_app/src/assets/data/castles_enriched.json`
   - Outputs:
     - `new_app/public/api/castles.json`
     - `new_app/public/api/top100.json`
     - `new_app/public/api/index.json`
     - `new_app/public/api/by-country/*.json`
   - Related committed API file not written by this script: `new_app/public/api/openapi.yaml`

7. Sitemap generation:
   - Command: `npm run data:sitemap`
   - Script: `scripts/generate_sitemap.js`
   - Input: `new_app/src/assets/data/castles.json`
   - Output: `new_app/public/sitemap.xml`

8. Prerender route generation:
   - Command: `npm run data:routes`
   - Script: `scripts/generate_prerender_routes.js`
   - Input: `new_app/src/assets/data/castles_enriched.json`
   - Output: `new_app/prerender-routes.txt`
   - Angular consumes this through `new_app/angular.json`.

The canonical root-level pipeline command is `npm run data:regenerate`. It runs steps 1 through 8 in order and preserves `data:lean`'s rebuild-required signal as a reminder instead of treating it as a failed regeneration.

9. Angular build and prerender:
   - Command: `npm run build`
   - Delegates to: `npm run build --prefix new_app`
   - Consumes:
     - `new_app/src/assets/data/*.json`
     - `new_app/public/api/**`
     - `new_app/public/sitemap.xml`
     - `new_app/prerender-routes.txt`
   - Generated ignored output: `new_app/dist/new_app/`

10. Runtime JSON state:
    - Runtime user state: `data/users.json`
    - Server path: `server/routes/user.js`
    - JSON helper: `server/lib/json-store.js`
    - This data is runtime-only, mounted under `/data`, and is not part of the build-time content pipeline.

## Artifact Ownership

| Artifact | Current Owner | Category | Notes |
| --- | --- | --- | --- |
| `source-data/topcastles/Topcastles export.xlsx` | Data pipeline input | Source | Canonical active input for `scripts/xlsx_to_json.py`. |
| `old_app/database/Topcastles export.csv` | Legacy data export | Source, currently legacy-located | Present and documented historically; not used by current root pipeline command. |
| `scripts/*.js`, `scripts/xlsx_to_json.py` | Pipeline implementation | Source | Current transformation scripts. |
| `scripts/wikipedia_overrides.json` | Enrichment helper | Source | Manual Wikipedia lookup overrides. |
| `new_app/src/assets/data/castles_enriched.json` | Pipeline output and enrichment source | Generated and committed | Authoritative enriched dataset for API, routes, MCP, and lean-data generation. |
| `new_app/src/assets/data/castles.json` | App startup dataset | Generated and committed | Initially written by conversion, then overwritten by `data:lean` as the lean app dataset. |
| `new_app/src/assets/data/castles_delta.json` | Detail-page enrichment delta | Generated and committed | Lazy-loaded by castle detail pages. |
| `new_app/src/assets/data/no_castles.json` | No-castle dataset | Generated and committed | Loaded by no-castle pages/services. |
| `new_app/public/api/castles.json` | Static API | Generated and committed | Written by `scripts/generate_api.js`. |
| `new_app/public/api/top100.json` | Static API | Generated and committed | Written by `scripts/generate_api.js`. |
| `new_app/public/api/index.json` | Static API index | Generated and committed | Written by `scripts/generate_api.js`. |
| `new_app/public/api/by-country/*.json` | Static API slices | Generated and committed | Written by `scripts/generate_api.js`. |
| `new_app/public/api/openapi.yaml` | API documentation/spec | Committed static source | Not currently written by `scripts/generate_api.js`. |
| `new_app/public/sitemap.xml` | Search-engine sitemap | Generated and committed | Written by `scripts/generate_sitemap.js`. |
| `new_app/prerender-routes.txt` | Angular prerender route list | Generated and committed | Written by `scripts/generate_prerender_routes.js`. |
| `new_app/dist/new_app/` | Angular build output | Generated and ignored | Recreated by `npm run build`. |
| `data/users.json` | Runtime user state | Runtime-only | Must not be committed or mixed with build-time castle content. |

## Active old_app Dependency Inventory

| Path or Reference | Classification | Evidence | Extraction Status |
| --- | --- | --- | --- |
| `source-data/topcastles/Topcastles export.xlsx` | REQUIRED FOR ACTIVE PIPELINE | `scripts/xlsx_to_json.py` reads this path; `npm run data:convert` runs that script. | Extracted from `old_app/`; this is now the canonical active source. |
| `old_app/database/Topcastles export.csv` | HISTORICAL/DOCUMENTATION ONLY | File is tracked and documented, but no current package script or pipeline script reads it. | Keep as archival or move alongside XLSX if retained as supporting source export. |
| `old_app/` PHP files and includes | REQUIRED FOR ACTIVE TESTING | `tests/test_php_baseline.py` sets `OLD_APP` and validates PHP include paths, security patterns, forms, SEO files, and static assets. | Decide whether these baseline tests remain active; if yes, rename their scope as archive validation rather than product tests. |
| `old_app/sitemap.xml`, `old_app/robots.txt`, old PHP forms/assets | REQUIRED FOR ACTIVE TESTING | Referenced by `tests/test_php_baseline.py`. | Keep under `old_app/` while PHP baseline tests remain active. |
| `docs/migration-report.md` references to `old_app/` | HISTORICAL/DOCUMENTATION ONLY | Migration history explicitly describes the legacy app and dropped scope. | No extraction needed. |
| `docs/decisions.md` references to `old_app/` and `scripts/csv_to_json.py` | HISTORICAL/DOCUMENTATION ONLY, with stale implementation details | ADRs record past decisions; some names reflect earlier CSV-based implementation. | Leave ADR history intact unless a future ADR supersedes it. |
| `docs/setup.md` source-data references | CURRENT DOCUMENTATION | Current command uses XLSX via `scripts/xlsx_to_json.py`; setup now names the active spreadsheet source. | No extraction action needed. |
| `docs/architecture.md` prior `csv_to_json.py`/CSV reference | DEAD/STALE REFERENCE | Current script is `scripts/xlsx_to_json.py`; this document has been corrected to the current implementation. | Corrected in this task. |
| Runtime server and Angular app code | No active old_app dependency found | Targeted search found no runtime reads from `old_app/`. | No extraction needed. |

## Proposed Extraction Targets

| Current Path | Why Still Needed | Proposed New Path | References To Update | Risk |
| --- | --- | --- | --- | --- |
| `source-data/topcastles/Topcastles export.xlsx` | Canonical active spreadsheet input for `npm run data:convert`. | Already moved. | No active converter update remains. | Low |
| `old_app/database/Topcastles export.csv` | Supporting historical export; not currently active. | `source-data/topcastles/Topcastles export.csv` if retained with source data, otherwise leave archived under `old_app/`. | Documentation only unless a script starts reading it again. | Low |
| `old_app/` PHP baseline fixture tree | Active only because baseline tests validate the archived PHP app. | Keep as `old_app/` until the team decides whether PHP archive validation should remain in active tests; possible later target: `archive/old_app/`. | `tests/test_php_baseline.py` and historical docs if moved. | Medium |

## Recommended Extraction Sequence

1. Run `npm run data:convert`, then inspect generated JSON for unintended changes.
2. Decide whether the CSV export moves with the XLSX or remains archival-only in `old_app/database/`.
3. Run the full pipeline commands and commit source-data plus generated-and-committed outputs.
4. Review `tests/test_php_baseline.py` separately: either keep it as archive validation, move it to an archive-test category, or retire it if old PHP validation is no longer part of active project quality gates.
5. Only after source data and tests are settled, consider moving or labeling the remaining `old_app/` tree as archival.

## Open Questions

- Should `old_app/database/Topcastles export.csv` remain a supporting source export, or should it stay with the archived PHP app?
- Should `tests/test_php_baseline.py` continue to run as an active test suite, or should it be treated as archive validation outside the main quality signal?
- Should `scripts/enrich_coordinates.js` receive a root npm script if it remains part of the supported pipeline?
