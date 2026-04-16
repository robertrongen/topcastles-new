# Documentation index

This folder is the source of truth for architecture, contracts, workflows, and operational knowledge.

## Files

- `architecture.md`  
  High-level system design and package boundaries.

- `decisions.md`  
  Important architectural and implementation decisions.

- `development-workflow.md`  
  How to work locally and how to keep docs in sync.

- `testing.md`  
  Expected testing strategy and what should be covered.

- `troubleshooting.md`  
  Known failure modes and how to debug them.

- `deployment-architecture.md`  
  Production deployment model.

- `release-process.md`  
  How the backend and plugin should be versioned and deployed.

- `prompts/`  
  Instructions and prompts used to guide Claude.

## Documentation rules

When behavior, architecture, contracts, or operational assumptions change:
1. update the relevant doc in the same task/commit as the code change
2. update `decisions.md` if the change is architectural
3. update `api-contract.md` if the plugin/backend contract changes
4. update `troubleshooting.md` if a new failure mode is found

Do not leave behavior changes undocumented.

## Claude/agent workflow rules

**Before coding**: Read all relevant docs first, then fetch feature/user stories, then summarize.

**During implementation**: Make local commits; update docs if behavior changes.

**Approval gate**: After implementation, build plugin and run `npx yalc publish` from `packages/sanity-plugin-keyshot`, then STOP. Do not push to origin. Report summary and wait for explicit approval.

**After approval**: Only then push the branch to origin.

See `development-workflow.md` for the complete approval-gated workflow.
