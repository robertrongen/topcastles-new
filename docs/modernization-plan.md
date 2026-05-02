# Modernization Plan Archive

The active forward-looking plan now lives in [roadmap.md](roadmap.md).

The historical migration and modernization summary now lives in [migration-report.md](migration-report.md).

For current operational guidance, use:

- [architecture.md](architecture.md) for the current runtime architecture.
- [../DEVELOPER.md](../DEVELOPER.md) for contributor workflow.
- [pipeline.md](pipeline.md) for source, generated artifact, and runtime state policy.

## Current Planning Pointer (2026-05-02)

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

## Design Review Items (2026-05-02)

Status tracking for the visual/editorial design review pass. Execution details live in [ux-product-execution-plan.md](ux-product-execution-plan.md) §3.6.

### Priority Items

1. **[DONE]** Masthead too quiet — orange nav bar dominates. Replaced with Option A: olive band + ochre rule. (`c285df7`)
2. **[DONE]** "From today's index" needs more presence — image small, scores unframed, editor's note missing. Redesigned as editorial dossier with hero layout, fact card, and kicker. (`3a3cafc`, `61ba0c5`)
3. **[DONE]** Map annotations too Europe-centric. Added global atlas annotations; adjusted default viewport. (`8baffe7`, `8643f78`)
4. **[OPEN]** "Top by visitor rating" layout asymmetry — Burg Eltz hero block vs. small ranks 2–5 table. Either match row heights or commit to four equal magazine cards.
5. **[OPEN]** Top 1000 grid page (browse) lacks editorial layer — pure tile grid with no header context or editor's note for the band shown.
6. **[OPEN]** Top Countries / Top Regions tiles are undifferentiated — highlight top 3 with ochre borders, or add one editorial line per top tile.
7. **[OPEN]** Period table missing "Editor's pick" column — add a 5th column with one starred pick per era in italic prose style.

### Smaller Polish

- **[OPEN]** Footer too sparse — add a thin Browse / Contribute / About column structure.
- **[OPEN]** "Castle of the Week" sidebar duplicates "DISCOVER THE LIST" — pick one entry point.
- **[OPEN]** Nav button active state uses dark pill — replace with 2 px ochre underline for clarity.
- **[OPEN]** Score labels ambiguous — "620" and "6.7" need "/1000" and "/10" suffixes or consistent unit framing.
