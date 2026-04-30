# Modernization Plan Archive

The active forward-looking plan now lives in [roadmap.md](roadmap.md).

The historical migration and modernization summary now lives in [migration-report.md](migration-report.md).

For current operational guidance, use:

- [architecture.md](architecture.md) for the current runtime architecture.
- [../DEVELOPER.md](../DEVELOPER.md) for contributor workflow.
- [pipeline.md](pipeline.md) for source, generated artifact, and runtime state policy.

## Current Planning Pointer (2026-04-30)

This file remains an archive pointer only. Do not add new execution plans here.

For the current product queue, use:

- [roadmap.md](roadmap.md) for active roadmap status and the current Beads snapshot.
- [ux-product-execution-plan.md](ux-product-execution-plan.md) for UX/product sequencing and next execution beads.
- [product-strategy-plan.md](product-strategy-plan.md) for priority rationale and the reference-atlas product direction.

Recent commit history has moved several formerly open modernization items into completed status:

- PWA baseline and production-safe service worker scope are implemented (`14ad697`, `6e88a0e`, `4cc6c1e`).
- Token login behavior is implemented (`3eb35d4`).
- Admin staged upload endpoints and operator docs are implemented (`269a35d`, `5d774c4`, `a139925`).
- Castle name autocomplete appears implemented in the castles page (`1e097e1`), so any remaining autocomplete bead should be handled as verification/bookkeeping unless a new scope is defined.
