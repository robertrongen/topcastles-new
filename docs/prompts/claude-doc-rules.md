# Claude documentation rules

## PHP source analysis baseline

When analyzing a PHP file or feature from `old_app/` before migration:

- Treat the PHP source as the behavioral baseline; do not invent behavior.
- Identify routes (form actions), query parameters, response shape (HTML output), database queries, and session/cookie usage.
- Read the relevant `old_app/forms/` and `old_app/functions/` files before proposing new-code changes.
- Separate confirmed behavior from assumptions; if behavior is unclear, point to the exact PHP file and function.
- Propose migration steps incrementally, one page or concern at a time.
- Update `docs/decisions.md` if a migration choice deviates from the PHP baseline.
- After implementation, follow the approval-gated workflow (see `docs/README.md`).

## Docs-first workflow

Before implementing any feature:
1. Read all relevant docs in `docs/` to understand current architecture and workflow.
2. Summarize scope and get alignment before coding.

## Documentation synchronization

When changing code, also update docs in the same task if any of these changed:
- environment variables
- backend routes
- response shape
- architectural assumptions
- operational guidance

Required updates:
- `docs/decisions.md` for architecture changes
- `docs/setup.md` for tooling/stack changes
- `docs/pipeline.md` for CI/CD workflow changes
- root `README.md` when developer workflow expectations change

Do not leave drift between code and docs.

## Approval-gated workflow

After implementation and doc updates:
1. Build and test (commands depend on chosen stack — see `docs/setup.md`)
2. **STOP** — do NOT push to origin
3. Report: branch name (local), commits, files changed, docs updated, build/test results, validation steps
4. Wait for explicit approval before `git push`
