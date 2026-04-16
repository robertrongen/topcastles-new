# Architectural decisions

## ADR-001: Simplify Legacy Scope to EN-Only Static Top 100
Status: accepted

Context:
- The legacy PHP application contains multilingual content and interactive voting/polling paths.
- Migration is scoped to an English-only experience and lower operational complexity.

Decision:
- Enforce English-only runtime behavior.
- Disable castle visitor voting interactions in the UI.
- Use static `score_total` ranking for top 100 views instead of runtime vote aggregation.

Consequences:
- Simpler migration baseline with fewer dynamic dependencies.
- Historic vote-driven behavior is no longer part of active user flows.
- Some legacy vote/poll code remains in repository but is not reachable through primary navigation paths.

Use this format when adding a new decision:

## ADR-001: Decision title
Status: proposed | accepted | superseded

Context:
- Why this decision is needed

Decision:
- What was decided

Consequences:
- Expected benefits
- Trade-offs / risks