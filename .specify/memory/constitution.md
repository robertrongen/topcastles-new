# Topcastles Spec Kit Constitution

This constitution is the policy layer for Spec Kit work in Topcastles. It reinforces the repo's existing workflow; it does not replace Beads, Graphify, the local context pipeline, or repo docs.

## Operational Defaults

1. Prompts stay short.
   Reusable guidance lives in repo docs. Prompts should reference `docs/`, `DEVELOPER.md`, `.specify/memory/constitution.md`, and the relevant bundle or bead instead of restating long instructions.

2. Every task starts from a bead.
   Use `bd ready`, `bd show <id>`, and `bd update <id> --claim` before implementation. Beads remains the task authority.

3. Graphify comes before broad file reading.
   Use `graphify query graphify-out/graph.json <symbol>` or `npm run graph:query -- <symbol>` before wide code navigation. Graphify remains the repo structure authority.

4. Non-trivial work uses the local context pipeline.
   For work that spans multiple files, touches architecture, or changes workflow/tooling behavior, run `npm run context:index` and `npm run context:resolve -- <id> --query "<focus>" --budget medium`. The repo-local UCM-style bundle remains the context authority.

5. Scope stays incremental and reviewable.
   Prefer small, auditable changes. Do not mix roadmap feature work into workflow/governance tasks. Do not absorb unrelated dirty worktree changes.

## Architecture Guardrails

These constraints are non-negotiable unless the repo docs and ADRs are deliberately changed in a separate decision:

- JSON only; do not introduce a database.
- No external services, embeddings, vector databases, or background daemons.
- Build-time content lives under `/assets/data`; runtime state lives under `/data`.
- Runtime code must not mutate prerendered HTML, bundles, or other build artifacts in place.
- Production runtime is a single container.
- Runtime entry point is the Node server in `server/index.js`.
- Do not introduce nginx as the runtime entry point.
- Angular state should use Signals; do not introduce NgRx.

## Verification

Verification is mandatory before closing implementation work:

1. `npm test`
2. `npm run build`
3. `npm run dev:server`
4. Verify `/` returns `200`
5. Verify `/api/health` is healthy
6. Verify `/api/index.json` returns `200`
7. Verify an unknown route returns the SPA shell
8. Verify a representative deep link returns `200`

## Session Closure

Work is not complete until session closure is finished:

1. `bd close <id>`
2. `git pull --rebase`
3. `bd dolt push`
4. `git push`
5. `git status`

## When To Use Fuller Spec Kit Flow

Use the normal lightweight Topcastles flow for small fixes and straightforward doc/tooling updates. Use fuller Spec Kit ceremony only when the task is architecture-sensitive, runtime-boundary-sensitive, build/deployment-sensitive, or roadmap work where non-goals and sequencing need to be explicit.
