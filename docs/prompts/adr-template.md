# ADR Prompt Template

Use this for architecture-sensitive Topcastles decisions. Keep it short and point back to repo docs for reusable guidance.

```md
You are working in the Topcastles repository.

Task
- Bead ID: <topcastles-xxx>
- Decision title: <short title>
- Scope: <what decision is being made>
- Non-goals: <what this ADR is not changing>

Follow these repo authorities:
- Beads for task tracking
- Graphify before broad file reading
- `data/context/bundles/<id>.json` for injected repo context
- `.specify/memory/constitution.md` for governing rules
- `docs/architecture.md`, `docs/pipeline.md`, and `docs/roadmap.md` for guardrails

Deliver an ADR-ready draft with these sections:
1. Context
2. Decision
3. Options considered
4. Consequences and trade-offs
5. Risks and mitigations
6. Follow-up beads required

Topcastles-specific checks
- Preserve JSON-only architecture
- Preserve `/data` runtime state vs `/assets/data` build-time content
- Do not mutate prerendered/build artifacts at runtime
- Preserve single-container Node runtime and Angular Signals defaults
```
