# Agent Contract - Topcastles

This is the mandatory contract for machine agents working in this repository.
Treat it as authoritative over older prompt snippets, assistant-specific files, or copied workflow checklists. Human setup and release guidance lives in [DEVELOPER.md](DEVELOPER.md).

Do not claim workflow compliance unless the final response includes the evidence required by this file.

## Core Flow

Every task follows:

```text
Bead -> Graphify -> Context -> Implementation -> Verification -> Closure
```

Stop and report instead of proceeding silently if a required step is unavailable, fails before scope is established, or would require absorbing unrelated dirty work.

## Authorities

- Beads is the task authority. Use `bd` for all issue tracking.
- Graphify is the repository structure authority. Use it before broad file inspection.
- The context pipeline is the context authority. Use bundles for non-trivial work.
- [docs/architecture.md](docs/architecture.md), [docs/pipeline.md](docs/pipeline.md), [docs/roadmap.md](docs/roadmap.md), and ADRs in [docs/decisions.md](docs/decisions.md) are architecture authorities.
- Spec Kit is only for higher-risk work. It complements Beads, Graphify, and the context pipeline; it does not replace them.

## Mandatory Preflight

Before planning, broad file reading, implementation, debugging, documentation changes, or architecture work:

1. Load Beads context:

   ```bash
   bd prime
   ```

2. Start from exactly one active bead:

   ```bash
   bd ready
   bd show <id>
   bd update <id> --claim
   ```

   If no suitable bead exists, create one first. Do not use markdown task lists, TodoWrite, TaskCreate, or memory files for repo task tracking.

3. Record the dirty worktree before editing:

   ```bash
   git status --short
   ```

   If dirty files overlap the bead scope, stop and report the conflict. Do not stash, revert, restore, overwrite, or silently absorb unrelated work.

4. Run Graphify before broad repo inspection:

   ```bash
   npm run graph:query -- <symbol-or-name>
   ```

   or:

   ```bash
   graphify query graphify-out/graph.json <symbol-or-name>
   ```

   Use Graphify to resolve real paths, canonical symbols, dependencies, and likely touched files. For docs-only work where Graphify cannot resolve markdown files, record the exact failed query and the limitation in final evidence.

5. Build minimal context for any non-trivial task:

   ```bash
   npm run context:index
   npm run context:resolve -- <id> --query "<focus>" --budget medium
   ```

   Use `data/context/bundles/<id>.json` as the bounded task context. Honor its `guardrails`, `selected_context`, `touched_paths`, `graphify_symbols_checked`, and `warnings`.

6. Check the relevant authority docs:

   - architecture/runtime: [docs/architecture.md](docs/architecture.md)
   - artifacts/pipeline: [docs/pipeline.md](docs/pipeline.md)
   - active roadmap: [docs/roadmap.md](docs/roadmap.md)
   - ADRs: [docs/decisions.md](docs/decisions.md)
   - higher-risk policy: [docs/spec-kit.md](docs/spec-kit.md) and [.specify/memory/constitution.md](.specify/memory/constitution.md)

## Scope And Reuse

- Keep each task single-purpose.
- Touch only files justified by the bead, Graphify scope, and context bundle.
- Before implementing new code, search for existing component, service, route, or helper usage.
- Identify the canonical implementation and explain whether reuse or extension is appropriate.
- Add new implementation only when reuse is clearly impossible.
- Avoid opportunistic refactors, unrelated documentation churn, broad formatting, and generated artifact drift.

Preserve these project constraints unless an explicit architecture task changes them through the documented decision path:

- JSON-only storage.
- `/data` is runtime state.
- `/assets/data` is build-time content.
- Runtime code does not mutate prerendered or built artifacts.
- The production runtime is a single Node container.
- Angular uses Signals; do not introduce NgRx.

## Concurrency And Shared Files

Before editing, capture the initial dirty-file list with `git status --short`.

If another agent or human has changed a file you need:

- stop before editing that file
- report the conflicting path
- state which bead owns your intended change
- ask for the branches or beads to be merged or sequenced

Never use `git stash`, `git checkout -- <file>`, `git restore`, or broad formatting to hide unrelated changes. Commit only files that are justified by the active bead.

## Context Pipeline

The local context pipeline is documented in [docs/context-pipeline.md](docs/context-pipeline.md). Agents should use it as infrastructure, not as runtime behavior.

The pipeline is:

1. Beads supplies the task frame.
2. Graphify resolves structure from `graphify-out/graph.json`.
3. The context resolver creates a compact JSON bundle from configured repository roots.

Generated bundles under `data/context/` are local ignored artifacts and should not be committed.

## Prompt Discipline

Keep prompts short. Reference this file instead of repeating long workflow checklists.

Good task prompts include:

- bead id or instruction to create one
- one clear outcome
- explicit scope and non-goals
- exact files or symbols when known
- task-specific constraints
- required verification

Prompt-authoring details remain in [docs/prompt-authoring-guide.md](docs/prompt-authoring-guide.md), but this root contract is the authority agents must follow.

## Verification

Verification must match the risk and surface area of the task.

For code changes, run the repo's intended checks for the affected area. Common commands include:

```bash
npm test
npm run build
npm run dev:server
```

For route or runtime behavior changes, verify representative endpoints or routes, such as:

- `/`
- `/api/health`
- `/api/index.json`
- an unknown SPA route
- a representative deep link

For documentation-only changes, run markdown or link sanity checks if available, then always run:

```bash
git diff --check
```

If a verification step is skipped, state why.

## Storybook Rule

For shared UI or styling work, Storybook is the review anchor.

- If a modified shared component already has a story, update it when needed.
- If a meaningful shared component change has no story, add one when review would benefit.
- If no Storybook change is needed, explain why.

## Test Rule

For route, service, API, retry/recovery, token/state restore, or data transformation behavior changes:

- run the intended verification commands
- add or update focused tests when the affected surface is testable and the task materially changes behavior
- explain why no focused tests were added when that is the right call

## Higher-Risk Work

Use the fuller Spec Kit flow for:

- PWA or service worker work
- NAS image-serving or runtime-boundary changes
- admin API or admin UI work
- rebuild-trigger workflows
- ADR-sensitive architecture changes

For those tasks:

```text
bead first -> Graphify first -> context first -> Spec Kit clarify -> plan -> tasks -> analyze -> implementation
```

Use [docs/spec-kit.md](docs/spec-kit.md) and [.specify/memory/constitution.md](.specify/memory/constitution.md) before implementation.

## Non-Interactive Shell Commands

Use non-interactive flags for operations that may prompt.

```bash
cp -f source dest
mv -f source dest
rm -f file
rm -rf directory
cp -rf source dest
scp -o BatchMode=yes source host:path
ssh -o BatchMode=yes host command
apt-get -y install package
HOMEBREW_NO_AUTO_UPDATE=1 brew install package
```

## Closure

Before ending a work session:

1. File beads for any remaining follow-up work.
2. Run quality gates appropriate to the change.
3. Update bead status and close completed work:

   ```bash
   bd close <id>
   ```

4. Push code and beads data:

   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status
   ```

Work is not complete until `git push` succeeds and `git status` shows the branch is up to date with origin.

## Required Final Evidence

Every final response for a task must include concise evidence:

- Graphify evidence: exact queries or commands used, files or symbols resolved, and how Graphify narrowed scope or failed to cover markdown.
- Context evidence: whether indexing ran, whether a bundle was created, and the bundle path.
- Change evidence: exact files intentionally changed, whether `.beads/issues.jsonl` changed due to bead operations, and whether generated artifacts changed or were left uncommitted.
- Verification evidence: exact checks run, outcomes, and any skipped checks with reasons.
- Dirty-file and concurrency evidence: initial dirty files, files intentionally changed, unrelated files left untouched, and whether overlap or conflict was detected.
