# New Developer Onboarding (VS Code)

This guide helps you start work the same way maintainers and agents do in Topcastles.

## How to start

1. Open VS Code at repo root and run:
   - `bd ready`
   - `bd show <id>`
   - `bd update <id> --claim`
2. If no issue matches your task, create one first, then claim it.
3. Before code navigation, run Graphify:
   - `npm run graph:query -- <symbol>`
4. For non-trivial tasks, build context artifacts:
   - `npm run context:index`
   - `npm run context:resolve -- <bead-id> --query "<task focus>" --budget medium`

## How to choose context

Use the smallest context that can safely complete the task:

- Trivial edit (single file, obvious): bead + Graphify lookup is enough.
- Non-trivial edit (multiple files or architecture touch): bead + Graphify + context bundle.
- Runtime/build/deployment-sensitive edit: include ADRs and `docs/architecture.md`, `docs/pipeline.md`, `docs/roadmap.md`.

Classify task type early:

- Build-time: scripts, prerender routes, generated JSON, build pipeline.
- Runtime: `server/` behavior, API routes, static serving, SPA fallback.
- Angular: `new_app/src/app` features/components/services/tests.
- Tooling: docs, `.vscode`, workflow scripts, contributor prompts.

## How to inspect code correctly

1. Start from symbols and entry points, not broad file browsing:
   - `npm run graph:query -- CastleService`
   - `npm run graph:query -- server/index.js`
2. Read only the files the bead and Graphify results justify.
3. Use the context bundle (`data/context/bundles/<bead-id>.json`) as your default prompt context for AI-assisted work.
4. Check ADRs and modernization/roadmap notes before changing workflow or architecture assumptions.

## How to keep scope tight

- Make only task-related edits.
- Do not include opportunistic refactors.
- Do not change app/server runtime behavior for workflow tasks.
- Keep changes incremental and reviewable.
- Stage files explicitly (avoid `git add .` for mixed worktrees).
- If unrelated changes are already present, leave them untouched and report them.

## How to verify changes

Before marking work done, verify all of the following:

1. `npm test`
2. `npm run build`
3. `npm run dev:server` starts normally
4. `/` returns HTTP 200
5. `/api/health` returns a healthy response
6. `/api/index.json` returns HTTP 200
7. Unknown SPA route returns app shell (fallback works)
8. Representative deep link returns HTTP 200 (example: `/castles/krak`)
9. If you added workflow helpers/tasks, run them once
10. Confirm docs and commands are internally consistent

Quick manual checks (PowerShell, while server is running):

```powershell
Invoke-WebRequest http://localhost:3000/ | Select-Object StatusCode
Invoke-WebRequest http://localhost:3000/api/health | Select-Object StatusCode, Content
Invoke-WebRequest http://localhost:3000/api/index.json | Select-Object StatusCode
Invoke-WebRequest http://localhost:3000/this-route-should-fallback | Select-Object StatusCode
Invoke-WebRequest http://localhost:3000/castles/krak | Select-Object StatusCode
```

## How to close a task

1. `bd close <id>`
2. `git pull --rebase`
3. `bd dolt push`
4. `git push`
5. `git status` must show branch up to date with `origin/<branch>`

Optional helper:

- `npm run workflow:guide -- <bead-id>` prints the recommended sequence and checks context artifact presence.

## Common mistakes to avoid

- Opening many files before Graphify.
- Skipping bead claiming.
- Coding before assembling minimal context for non-trivial work.
- Touching unrelated files in a dirty worktree.
- Assuming passing tests alone is enough.
- Forgetting SPA fallback and deep-link verification.
- Accidentally committing unrelated dirty worktree changes.

Notes:

- No file named `Claude-Code-Prompt-Creation-Checklist` exists in this repo right now; use [task-implementation-template.md](prompts/task-implementation-template.md) for reusable AI task prompts.
