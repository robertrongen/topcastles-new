# UX And Product Execution Plan

This plan translates the product strategy into UX execution tracks. Beads remain the executable backlog; this document should not duplicate every closed phase.

## Current Status

Completed work:

- Storybook-led shared visual refresh.
- Homepage reference-atlas structure and 9.6 polish.
- PWA baseline and install/help UX.
- Token login and favorites UX.
- NAS image serving baseline.
- Editorial annex Gates 1-5: auth shell, overview, write API, per-file editors, backups, publish status, and rebuild handoff.

Open public UX work:

- `topcastles-wft` - Top by visitor rating layout asymmetry.
- `topcastles-chw` - Top 1000 editorial header band.
- `topcastles-7kz` - Top Countries/Regions tile differentiation.
- `topcastles-3e1` - Period table Editor's pick column.
- `topcastles-eeb` - footer/sidebar/nav/score-label polish.

Deferred or higher-risk work:

- Pipeline admin and rebuild-trigger execution require Spec Kit.
- Castle comparison remains deferred pending design direction.
- Any service-worker/image-cache strategy change requires Spec Kit.

## Product Constraints For UX Work

- The approved product model is the reference atlas: "Wikipedia meets Michelin Guide meets a medieval atlas."
- Castles speak before the UI.
- Ranking remains the moat; `score_total` ordering must stay explainable.
- Public pages should favor reference tables, dense but readable data, and editorial restraint over marketing layouts.
- Editorial prose should come from `/data/editorial/` where it is intended to be editor-owned.
- Storybook is the review anchor for shared UI and styling work.

## Editorial Overlay Usage

The editorial overlay supports public UX without changing the pipeline:

- `countries.json` - country notes, defining traditions, sleeper flags.
- `regions.json` - region descriptions and sleeper flags.
- `castle-quotes.json` - quotes and featured-entry overrides.
- `period-picks.json` - editor picks by era.
- `browse-bands.json` - rank-band notes for Top 1000 browsing.

The admin editor writes these files at runtime. Public pages should handle missing files or missing keys gracefully.

## Next UX Sequence

1. Finish the five open Track A polish beads.
2. Use overlay-backed content for the Top Countries, Top Regions, homepage quote, period pick, and browse-band refinements.
3. Keep pipeline admin separate from editorial UX; do not mix enrichment/rebuild execution into lightweight page polish.

## Reduction Note

This document can be merged into [roadmap.md](roadmap.md) once the current public UX polish batch closes. Long completed phase descriptions should remain in [migration-report.md](migration-report.md) or Git history, not in the active execution plan.
