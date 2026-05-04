# Documentation index

## Files

- [architecture.md](architecture.md) - system design, component hierarchy, data flow, deployment topology
- [decisions.md](decisions.md) - architectural decisions (ADRs)
- [deployment.md](deployment.md) - Synology NAS deployment via `deploy.sh`
- [admin-readme.md](admin-readme.md) - protected editorial annex operator guide
- [design/README.md](design/README.md) - design specs, screenshots, and historical prompt artifacts
- [new-developer-onboarding.md](new-developer-onboarding.md) - VS Code-first workflow for beads, Graphify, context pipeline, and verification
- [pipeline.md](pipeline.md) - build and CI pipeline steps
- [product-strategy-plan.md](product-strategy-plan.md) - product direction and priority rationale
- [roadmap.md](roadmap.md) - active forward-looking worklist
- [spec-kit.md](spec-kit.md) - when to use normal lightweight workflow vs fuller Spec Kit discipline
- [prompts/adr-template.md](prompts/adr-template.md) - short prompt scaffold for architecture decision drafts
- [prompts/bug-rca-template.md](prompts/bug-rca-template.md) - short prompt scaffold for non-trivial bug root-cause analysis
- [prompts/deployment-smoke-check-template.md](prompts/deployment-smoke-check-template.md) - short prompt scaffold for runtime-sensitive deployment and smoke verification
- [prompts/high-risk-roadmap-template.md](prompts/high-risk-roadmap-template.md) - short prompt scaffold for architecture-sensitive roadmap work
- [prompts/task-implementation-template.md](prompts/task-implementation-template.md) - reusable prompt scaffold for AI-assisted task implementation
- [setup.md](setup.md) - stack and tooling reference
- [migration-report.md](migration-report.md) - summary of the PHP-to-Angular migration

## Documentation rules

When behavior, architecture, or operational assumptions change, update the relevant doc in the same commit as the code change:

- `decisions.md` for architectural decisions
- `setup.md` for tooling or stack changes
- `pipeline.md` for build or deployment pipeline changes
- `deployment.md` for operational changes to `deploy.sh` or the NAS setup
- root `README.md` when the developer workflow changes
- Keep prompts short by referencing root [AGENTS.md](../AGENTS.md) instead of repeating long instructions in prompt templates

## Reduction proposal

The current documentation set can be reduced further without losing authority:

| Proposed action | Documents | Reason |
| --- | --- | --- |
| Keep as root authorities | `AGENTS.md`, `DEVELOPER.md` | Machine workflow and human workflow are now consolidated. |
| Keep as architecture authorities | `architecture.md`, `decisions.md`, `pipeline.md`, `deployment.md` | These answer current runtime, ADR, artifact, and operations questions. |
| Keep as active planning | `roadmap.md`, `product-strategy-plan.md` | Roadmap answers current work; strategy answers why and priority. |
| Done | `ux-product-execution-plan.md` merged into `roadmap.md` | The remaining UX constraints and sequence now live in the roadmap. |
| Keep as historical archive | `migration-report.md` | Completed migration history should stay out of active plans. |
| Done | `modernization-plan.md` deleted | Active planning is in roadmap/strategy; history is in migration report. |
| Consider merging | `setup.md` into `DEVELOPER.md` | Setup is short enough to live in the human guide if one fewer docs file is preferred. |
| Keep specialized references | `admin-readme.md`, `storybook.md`, `context-pipeline.md`, `spec-kit.md` | These are still useful operator/process references. |
