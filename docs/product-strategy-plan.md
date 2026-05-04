# Product Strategy Plan

This document sits above roadmap execution and below architecture decisions. It answers what Topcastles is trying to become and how to choose between competing work.

Implementation tasks live in beads. Active sequencing lives in [roadmap.md](roadmap.md). Architecture decisions live in [architecture.md](architecture.md) and [decisions.md](decisions.md).

## Product Vision

Topcastles is an authoritative reference for European castles, combining encyclopedic depth, defensible ranking, and a sense of discovery that feels earned rather than marketed.

The product should feel like Wikipedia meets Michelin Guide meets a medieval atlas.

It should not feel like:

- a tourism brochure
- a generic ranking site
- a pure wiki clone
- a marketing landing page

The north star: a reader should feel that the castles speak first, and the interface steps aside.

## Product Principles

### Castles Speak Before The UI

Pages should feel calm and referential. Visual noise, promotional patterns, and decorative UI should yield to castle content, ranking evidence, map context, and editorial notes.

### Ranking Is The Moat

`score_total` is the primary differentiator. Ranking must stay deterministic, explainable, and consistent. Any change to scoring methodology requires architectural review and likely an ADR.

### Editorial Voice Matters

Copy, page structure, and section naming should use a measured atlas register. Prefer concrete description over vague superlatives. Inconsistent tone is a product defect.

### Map-First Discovery Matters

Geographic and spatial browsing remain core discovery modes. Country codes, coordinates, region slugs, and map interactions should stay first-class.

### Curated Reference Over Marketing Design

Tables and structured lists are often better than cards. The design should support repeated reading, comparison, and browsing rather than conversion.

## Strategic Workstreams

### A. Content Quality And Discovery

- Canonical source: `source-data/topcastles/Topcastles export.xlsx`.
- Enrichment: Wikipedia and Wikidata supplementary fields via scripts.
- Editorial overlay: editor-owned `/data/editorial/*.json` files for notes, quotes, picks, and rank-band prose.
- Priority lever: content quality directly raises product value.

### B. Public UX Refinement

- Storybook-led shared component refresh is complete.
- Homepage reference-atlas structure is complete.
- Current public UX work is the remaining Track A polish beads listed in [roadmap.md](roadmap.md).
- Future public UX should use editorial overlay content where prose is editor-owned.

### C. Runtime And Infrastructure

- Topcastles runs as a single Node container on a Synology NAS.
- JSON-only storage, no database, and `/data` runtime state are hard constraints.
- NAS image serving and service-worker cache assumptions require Spec Kit if they change.

### D. Editorial Annex

- The lightweight editorial annex is live: admin auth, protected shell, overview, per-file editors, backups, publish status, and rebuild handoff.
- Editorial writes update runtime JSON immediately through `json-store.js`.
- Prerendered pages reflect editorial changes after the next build/deploy cycle.

### E. Pipeline Admin

Pipeline admin remains higher-risk and deferred:

- castle edit/add
- enrichment-script execution
- intro text editing if activated
- rebuild trigger execution and log streaming

Use Spec Kit before implementation.

## Priority Order

### Now

1. Close the remaining public UX polish beads.
2. Use `/data/editorial/` content in the public editorial-identity targets.
3. Polish editorial annex operator details such as richer recent-edit summaries and build timestamp display.

### Next

4. Plan pipeline admin through Spec Kit.
5. Revisit NAS/image-serving hardening only when a concrete deployment or cache issue requires it.

### Later

6. Castle comparison view.
7. Structured data / JSON-LD.
8. Accessibility audit.

## Architecture Guardrails

| Constraint | Authority |
| --- | --- |
| JSON-only storage; no database | ADR-003, ADR-009 |
| Single-container Node runtime on Synology NAS | ADR-004, ADR-008 |
| Build-time content strictly separated from runtime state | ADR-007 |
| Runtime must not mutate prerendered HTML or build artifacts | ADR-007, ADR-010 |
| Angular Signals; no NgRx | ADR-002 |
| All JSON writes go through `json-store.js` | ADR-009 |
| Admin pipeline changes require rebuild before prerendered pages reflect them | ADR-010 |
| `/data` is runtime state; `/assets/data` is build-time content | [architecture.md](architecture.md) |
| Architecture-sensitive work requires Spec Kit | [../AGENTS.md](../AGENTS.md) |

Proposing a change to any of these constraints requires an ADR, not just a bead.

## Review Procedure

Review this document when:

- a workstream completes and priorities need to shift
- a new content source or ranking model is proposed
- a Spec Kit review creates new constraints
- the reference-atlas product direction is challenged by a proposed feature

Keep this document strategic. Move execution detail to [roadmap.md](roadmap.md), historical detail to [migration-report.md](migration-report.md), and task detail to beads.
