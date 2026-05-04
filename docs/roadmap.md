# Roadmap

This is the active forward-looking worklist for Topcastles. Beads are the executable task authority; use `bd ready` for claimable work. Current runtime architecture is documented in [architecture.md](architecture.md), contributor workflow in [../DEVELOPER.md](../DEVELOPER.md), artifact policy in [pipeline.md](pipeline.md), and completed migration history in [migration-report.md](migration-report.md).

## Snapshot: 2026-05-04

Recent closed work reflected here:

- Admin/editorial Gates 1-5 shipped through commits `1f98fba`, `5094129`, `5cba759`, and `eb877d2`.
- The editorial write API, per-file editors, castle lookup, backups, publish status, and rebuild handoff UI are in place.
- User/favorites, PWA baseline/install help, NAS image serving baseline, and server migration items are complete or documented as architecture constraints.
- Agent/developer guidance was consolidated into root [../AGENTS.md](../AGENTS.md) and [../DEVELOPER.md](../DEVELOPER.md); obsolete agent prompt docs were removed in `0db1a0b` and `2568911`.

## Active Tracks

### Track A: Public UX And Editorial Identity

Open beads from the design-review pass remain the immediate public UX queue:

- `topcastles-wft` - Top by visitor rating layout asymmetry.
- `topcastles-chw` - Top 1000 editorial header band.
- `topcastles-7kz` - Top Countries/Regions tile differentiation.
- `topcastles-3e1` - Period table Editor's pick column.
- `topcastles-eeb` - smaller polish batch: footer columns, sidebar deduplication, nav underline, and score unit labels.

Next editorial-identity work should use the editor-owned overlay files in `/data/editorial/` rather than hardcoding long-lived prose in Angular components.

### Track B1: Editorial Annex

The lightweight editorial annex is implemented:

- Admin auth and protected shell are live.
- `/admin/editorial` overview is live.
- Per-file editors for `countries`, `regions`, `castle-quotes`, `period-picks`, and `browse-bands` are live.
- `PUT /api/admin/editorial/:file` writes complete validated files through `json-store.js`.
- Gate 5 publish status and rebuild handoff UX are live.

Remaining B1 work is polish, not architecture:

- richer recent-edit summaries
- build timestamp wiring in the prerender notice
- visual refinements discovered during operator use

### Track B2: Pipeline Admin

Pipeline/enrichment admin remains deferred and higher-risk. Use Spec Kit before implementing:

- `PUT /api/admin/castles/:code`
- `POST /api/admin/castles`
- enrichment-script execution from the admin API
- introduction-text editing if it becomes active runtime content
- rebuild trigger execution and log streaming

This track must preserve the rule that runtime endpoints do not mutate prerendered or built artifacts in place.

### Deferred Ideas

- `topcastles-uax` - castle comparison view.
- `topcastles-g3i` - Phase 11 umbrella, with any already-shipped subitems handled as bead bookkeeping.
- Structured data / JSON-LD.
- Accessibility audit.

## Data And Runtime Guardrails

- JSON only; no database.
- `/data` is runtime state; `/assets/data` is build-time content.
- `source-data/topcastles/Topcastles export.xlsx` remains the active ingestion source.
- Admin editorial overlay files are editor-owned runtime JSON and are not written by enrichment scripts.
- Prerendered pages update only after regeneration/build/deployment.
- Node remains the single-container runtime entry point.
- Angular uses Signals; do not introduce NgRx.

## Documentation Reduction Direction

The roadmap should stay short. Completed phase narratives belong in [migration-report.md](migration-report.md); executable work belongs in beads; strategy rationale belongs in [product-strategy-plan.md](product-strategy-plan.md); detailed UX sequencing belongs in [ux-product-execution-plan.md](ux-product-execution-plan.md) until that document is merged into this roadmap or archived.
