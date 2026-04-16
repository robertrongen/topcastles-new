# Claude documentation rules

## Docs-first workflow

Before implementing any feature:
1. Read all relevant docs in `docs/` to understand current architecture, contracts, and workflows
2. Fetch feature/user stories from backlog
3. Summarize scope and get alignment before coding

## Documentation synchronization

When changing code, also update docs in the same task if any of these changed:
- environment variables
- backend routes
- response shape
- architectural assumptions
- troubleshooting knowledge

Required updates:
- `docs/api-contract.md` for contract changes
- `docs/decisions.md` for architecture changes
- `docs/troubleshooting.md` for new failure modes
- package READMEs when setup or usage changes

Do not leave drift between code and docs.

## Approval-gated workflow

After implementation and doc updates:
1. Build: ``
2. Publish: ``
3. **STOP** — do NOT push to origin
4. Report: branch name (local), commits, files changed, docs updated, build results, validation steps
5. Wait for explicit approval before `git push`
