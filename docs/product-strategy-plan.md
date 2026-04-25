# Product Strategy Plan

> This document sits above roadmap execution and below architecture decisions.
> It answers: **what are we building, in what order, and how do we decide what changes next?**
>
> Authority hierarchy:
> - **Implementation tasks** → [roadmap.md](roadmap.md) and beads (`bd ready`)
> - **Architecture decisions** → [architecture.md](architecture.md) and [decisions.md](decisions.md)
> - **This document** → strategic direction, priority rationale, and update procedure

---

## 1. Product Vision

Topcastles is an authoritative reference for European castles — combining encyclopedic depth, a defensible ranking methodology, and a sense of discovery that feels earned rather than marketed.

The product should feel like **Wikipedia meets Michelin Guide meets a medieval atlas.**

It should not feel like:
- a tourism brochure (no promotional voice, no "visit today!" copy)
- a generic ranking site (ranking must be explainable and consistent)
- a pure wiki clone (editorial curation and design restraint matter)

The north star: **a reader should feel that the castles speak first, and the interface steps aside.**

### Homepage as reference-atlas entry point

The homepage is the primary expression of this vision. Its approved structure is:

**Top section** — title, subtitle, search bar, menu bar.

**Right sidebar** (narrow reference column) — "About this list/site," random castle from positions 100–1000, tools. The sidebar signals that this is a reference, not a portal.

**Main content** (left, flowing top to bottom):
1. *From Today's Index* — a randomly selected castle from the Top 100, shown on first paint. This is the homepage anchor: a castle speaks before any list or map appears.
2. *By the Numbers* — a concise strip of site-wide statistics.
3. *Distribution Map* — geographic overview; map precedes ranking in user flow to establish spatial authority before positional ranking.
4. *Top 10 of the List* — the ranking signal; reference-table layout, not cards.
5. *Index of Top 10 Countries* — structured geographic reference.
6. *Index by Period* — structured historical reference.

**Footer** — copyright, contact, methodology link, data sources.

This structure encodes the three core tensions deliberately: **random discovery** (From Today's Index) establishes the human dimension; **map** establishes geographic authority; **Top 10 table** establishes ranking authority. Methodology must be reachable from the footer on every page.

---

## 2. Product Principles

These principles govern every feature decision, design choice, and content addition.

### Castles speak before the UI

The interface exists to surface castle content, not to demonstrate design skill. Pages should feel calm and referential. Visual noise, promotional layouts, and marketing patterns are out of scope.

On the homepage, this principle is expressed through *From Today's Index*: a specific castle — not a banner, not a featured collection — is the first substantive element the reader sees.

### Ranking is the moat

The `score_total` ranking is what distinguishes Topcastles from a generic list site. The ranking must stay deterministic, explainable, and consistent. Any change to scoring methodology is a high-stakes decision that affects every view that uses `score_total` ordering.

Ranking authority is established on the homepage through the *Top 10 of the List* reference table. Methodology must be reachable from the footer. A reader who questions why a castle ranks where it does should be able to find a direct answer.

### Editorial voice matters

Copy, page structure, and section naming should reflect the "medieval atlas" register — measured, authoritative, and specific. Avoid vague superlatives. Prefer concrete description. Inconsistent tone is a product defect.

Section labels matter: "From Today's Index," "Index of Top 10 Countries," and "Index by Period" carry register. Do not replace them with marketing-style labels ("Discover," "Explore," "Featured").

### Map-first discovery matters

Geographic and spatial discovery is a core mode. Browsing by country, region, or map proximity should feel natural. The data model (country codes, coordinates, region slugs) must remain first-class. Any navigation or filter work should strengthen — not dilute — geographic orientation.

On the homepage, the *Distribution Map* appears before the Top 10 table. This ordering is intentional: spatial orientation precedes ranking. The map establishes *where* before the ranking establishes *which*. This ordering should be preserved in any homepage revision.

### Random discovery must be visible on first paint

Serendipity is part of the atlas experience. The *From Today's Index* castle (Top 100) and the sidebar's random castle (positions 100–1000) together ensure that no two visits begin identically. This is not decorative — it is the mechanism by which a reference becomes a destination.

### Curated reference over marketing design

Design choices should favor legibility, information density, and scan-ability over visual delight or conversion optimization. Tables and structured lists are often better than cards. Typography hierarchy should serve the reader, not the brand.

The homepage sidebar is a reference column, not a promotional panel. The right rail should feel like a reference book's index page, not a CMS widget zone.

### Architecture simplicity must be preserved

Topcastles runs in a single Docker container on a personal NAS. Zero-cost deployment, zero database dependency, and single-developer maintainability are hard constraints. Features that require operational complexity beyond this model are out of scope unless a compelling case is made via the ADR process.

---

## 3. Strategic Workstreams

These are the five active or near-term strategic areas. Each maps to specific roadmap items (see [roadmap.md](roadmap.md)) and execution tracks (see [ux-product-execution-plan.md](ux-product-execution-plan.md)).

### A. Content Quality and Discovery

Making the castle data itself richer, more consistent, and more discoverable.

- Canonical source: `source-data/topcastles/Topcastles export.xlsx`
- Enrichment: Wikipedia and Wikidata supplementary fields via enrichment scripts
- Ranking: `score_total` is the current ordering signal; methodology is embedded in enrichment
- Priority lever: content is the product — pipeline quality and data completeness directly raise product value

### B. Presentation and UX Refinement

Ensuring that what users see reflects the "medieval atlas" design direction.

- The Storybook-led UX refresh (9.5) is complete; shared components, typography, and page layout have been updated
- Future UX work should be narrowly scoped, justified by a specific legibility or discovery problem, and anchored in Storybook
- Design direction principle: castles speak first — every layout decision should be evaluated against that test

### C. Infrastructure and Image Serving

Serving castle images reliably from the NAS mount.

- This is partially complete (server route exists); remaining work involves hardening mounted-volume behavior
- This is a prerequisite for PWA cache correctness (workstream D)
- Must preserve the single-container deployment model (ADR-004, ADR-008)

### D. Offline and PWA Capability

Allowing the reference to be consulted without a network connection.

- Depends on stable image-serving behavior (workstream C)
- Must be planned via Spec Kit before implementation — cache scope and content freshness require explicit decisions
- Not a current active workstream; deferred until C is stable

### E. Admin Workflow

Enabling content updates without a full redeploy.

- Admin auth → admin shell → edit/add castles → enrichment scripts → rebuild trigger (15.1–15.7)
- All admin writes go through `json-store.js`; prerendered content updates only after rebuild (ADR-010)
- This is the highest-complexity workstream; must be planned via Spec Kit before any implementation

---

## 4. Priority Order

### Now (active or unblocked)

These can begin with a normal beads + Graphify flow:

1. **NAS image serving hardening** (13.3 / 11.0) — unblocked, prerequisite for PWA
2. **Data volume initialization** (13.4 remaining) — small, safe, unblocked
3. **Smoke tests for server migration** (13.6) — verification gap, should be closed

### Next (ready once prerequisites clear)

These are unblocked after specific Now items complete:

4. **PWA / service worker** (10.3) — plan with Spec Kit after image serving is stable
5. **Admin API auth** (15.1) — plan with Spec Kit as entry to the admin workstream
6. **Admin UI shell** (15.2) — depends on 15.1

### Later (deliberate scheduling required)

These are valuable but require sequencing, Spec Kit planning, or explicit prioritization:

7. **Admin castle edit / add / enrichment / rebuild** (15.3–15.7) — sequenced behind 15.1–15.2
8. **Castle comparison view** (11.1) — postponed; good eventual feature, no current urgency
9. **Structured data / JSON-LD** (11.2) — SEO enhancement; low urgency given current SEO posture
10. **Accessibility audit** (11.3) — important but requires dedicated scheduling
11. **Castle of the week** (11.4) — lightweight feature; suitable for a quiet sprint

### Decision criteria for reprioritization

Change the order when any of the following is true:

- A dependency is unblocked earlier than expected
- A specific content gap becomes a user-visible problem
- A new workstream is justified by editorial direction (new data source, ranking methodology change)
- A Spec Kit review reveals that a planned feature is riskier than classified

Do not reprioritize based on feature novelty alone. Topcastles compounds value through content quality and architectural stability, not feature velocity.

---

## 5. Architecture Guardrails

These constraints are non-negotiable. They are not revisited per feature — they are enforced per feature.

> Full rationale lives in [architecture.md](architecture.md) and [decisions.md](decisions.md). This section lists the rules only.

| Constraint | Authority |
|---|---|
| JSON-only storage; no database | ADR-003, ADR-009 |
| Single-container Node runtime on Synology NAS | ADR-004, ADR-008 |
| Build-time content strictly separated from runtime state | ADR-007 |
| Runtime must not mutate prerendered HTML or build artifacts | ADR-007, ADR-010 |
| Angular Signals; no NgRx | ADR-002 |
| All JSON writes go through `json-store.js` | ADR-009 |
| Admin changes require rebuild to affect prerendered pages | ADR-010 |
| `/data` is runtime state; `/assets/data` is build-time content | architecture.md |
| Architecture-sensitive work (PWA, NAS, admin) requires Spec Kit | agent-preflight.md §9 |

Proposing a change to any of these constraints requires an ADR, not a bead.

---

## 6. Monthly Review and Update Procedure

### When to review

Review this document at the start of each month, or after any of these triggers:

- A Now workstream completes and the Next queue needs promotion
- A significant new content source or data model change is introduced
- A Spec Kit review produces new architecture constraints
- The "medieval atlas" design direction is challenged by a proposed feature

### What to check

1. **Section 3 workstream status** — mark completed workstreams, promote deferred ones if appropriate
2. **Section 4 Now / Next / Later** — move items based on completed prerequisites; add new items from beads backlog
3. **Section 5 guardrails** — check whether any new ADRs have been accepted; add them to the table
4. **Consistency with authority docs** — cross-check against current [roadmap.md](roadmap.md) and [ux-product-execution-plan.md](ux-product-execution-plan.md)

### Who updates it

Any session that completes a Now item or changes strategic direction should update this document as part of session closure, alongside `git push`.

### What this document is not

- It is not a task list. Tasks live in beads.
- It is not an architecture document. Architecture decisions live in [decisions.md](decisions.md).
- It is not a UX spec. Execution details live in [ux-product-execution-plan.md](ux-product-execution-plan.md).
- It is not a pipeline reference. Pipeline rules live in [pipeline.md](pipeline.md).

---

## 7. How Roadmap, Beads, and Strategy Interact

```
product-strategy-plan.md     ← you are here
        │
        │  sets direction and priority rationale
        ▼
    roadmap.md               ← active forward-looking worklist
        │
        │  identifies specific items and their status
        ▼
  beads (bd ready)           ← executable, claimable tasks
        │
        │  bead → Graphify → context → implement → verify → close
        ▼
    git push                 ← work is not done until pushed
```

### The contract between layers

- **Strategy** answers *why* and *in what order*.
- **Roadmap** answers *what* and *whether it is done*.
- **Beads** answer *who, when, and how much detail*.

An AI agent or developer starting work should:
1. Check `bd ready` for claimable tasks.
2. Read the relevant roadmap section for scope and constraints.
3. Consult this document only when reprioritization, cross-workstream sequencing, or design direction is in question.

### When to escalate to this document

- The bead scope touches more than one workstream.
- The task implies a design or voice decision that affects multiple pages.
- The task might break or require an architecture guardrail change.
- A completed Now item needs to promote a Next item and someone needs to decide which one.

### When not to escalate

- Normal feature implementation that fits within a clear bead.
- Routine UX refinement on a single component.
- Bug fixes with no cross-workstream implications.
- Documentation-only tasks that don't change strategic direction.
