# Documentation index

This folder is the source of truth for architecture, decisions, pipeline, and tooling.

## Files

- `architecture.md`  
  High-level system design and package boundaries.

- `decisions.md`  
  Architectural and implementation decisions (ADRs).

- `pipeline.md`  
  CI/CD pipeline stages.

- `setup.md`  
  Stack, tooling, and project structure.

- `prompts/claude-doc-rules.md`  
  Canonical agent guidance for PHP-source analysis, docs sync, and approval-gated workflow.

## Documentation rules

When behavior, architecture, or operational assumptions change:
1. Update the relevant doc in the same commit as the code change.
2. Update `decisions.md` if the change is architectural.
3. Update `setup.md` if tooling or stack choices change.

Do not leave behavior changes undocumented.

## Agent workflow rules

Use `prompts/claude-doc-rules.md` as the canonical workflow reference for:

- PHP source analysis baseline
- docs-first implementation flow
- documentation synchronization requirements
- approval-gated push process

