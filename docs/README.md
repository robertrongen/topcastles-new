# Documentation index

## Files

- [architecture.md](architecture.md) - system design, component hierarchy, data flow, deployment topology
- [decisions.md](decisions.md) - architectural decisions (ADRs)
- [deployment.md](deployment.md) - Synology NAS deployment via `deploy.sh`
- [new-developer-onboarding.md](new-developer-onboarding.md) - VS Code-first workflow for beads, Graphify, context pipeline, and verification
- [pipeline.md](pipeline.md) - build and CI pipeline steps
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
