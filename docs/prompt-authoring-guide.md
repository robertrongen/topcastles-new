# Topcastles Prompt Authoring Guide

## Purpose

Prompts must stay short.
Prefer referencing `docs/agent-preflight.md` instead of repeating workflow instructions inline.

Codex is expected to use the repository documentation already present in the repo. Do not restate large sections of onboarding, workflow, architecture, or verification guidance if those are already documented in:

- `docs/new-developer-onboarding.md`
- `docs/context-pipeline.md`
- `docs/architecture.md`
- `docs/pipeline.md`
- `docs/README.md`
- `DEVELOPER.md`
- `docs/prompts/`
- `.specify/memory/constitution.md`
- `docs/spec-kit.md`

Prompts should define the task, the scope, the exact files or symbols when known, task-specific constraints, and required verification. They should reference repo docs, not duplicate them.

## Core Rule

Use this default flow:

`Bead -> Graphify -> Context -> Implementation -> Verification -> Closure`

If a prompt does not follow this flow, rewrite it.

## Repo Authorities

Every prompt must preserve these authorities:

- Beads = task authority
- Graphify = repo structure authority
- repo-local context pipeline = context authority
- ADRs, architecture docs, and roadmap = architecture authority
- Spec Kit constitution = policy layer for higher-risk work

Spec Kit does not replace Beads, Graphify, or the context pipeline.
Graphify, Beads, and UCM-style context are not additional context sources; they are filters that replace broader repo inspection and repeated documentation injection.

## Default Prompt Structure

A good Topcastles prompt should usually include:

- Bead ID
- one clear task outcome
- explicit scope boundaries
- exact files or symbols if known
- task-specific architecture constraints if any
- required verification for this task
- a short DO NOT section for exclusions

Example shape:

```md
Task
- Bead ID: <topcastles-xxx>
- Goal: <one clear outcome>
- Scope: <specific files, symbols, or subsystem>
- Non-goals: <explicit exclusions>

Follow:
- docs/new-developer-onboarding.md
- docs/context-pipeline.md
- docs/architecture.md
- docs/pipeline.md
- .specify/memory/constitution.md when applicable
```

## Mandatory Workflow

### 1. Start From A Bead

Every task starts from Beads.

Required:

- `bd ready`
- `bd show <id>`
- `bd update <id> --claim`

If no bead exists, create one first using the normal Beads workflow.

Use the bead title, description, and notes as the primary task frame. Do not use alternative task tracking.

### 2. Use Graphify Before Broad File Reading

Required before broad repo inspection:

- `npm run graph:query -- <symbol>`

or

- `graphify query graphify-out/graph.json <symbol>`

Use Graphify to:

- resolve real paths
- identify touched files
- confirm dependencies
- constrain scope
- avoid guessing structure

Do not start with broad browsing or ad hoc repo searching unless Graphify has already narrowed the area.

### 3. Build Minimal Context Before Coding When The Task Is Non-Trivial

For multi-file, architecture-sensitive, workflow-sensitive, or runtime/build-sensitive work:

- `npm run context:index`
- `npm run context:resolve -- <id> --query "<focus>" --budget medium`

Use the resulting bundle:

- `data/context/bundles/<bead-id>.json`

Context priority:

- bead/task context
- architecture and pipeline docs
- Graphify-resolved code
- direct dependencies only
- verification and runtime rules

Do not inject unrelated files, large assets, dist output, `node_modules`, or duplicate context.

### 4. Keep Scope Small And Reviewable

Prompts should be single-purpose by default.

Always include exclusions such as:

- no unrelated changes
- no speculative improvements
- no architecture drift
- no broad refactors unless explicitly requested

Touch only the files required for the bead.

Avoid phased or multi-step prompt structures unless the task is architecture-sensitive and explicitly needs fuller planning.

## Architecture Rules To Preserve

Unless the task explicitly changes architecture through the documented decision path, preserve all of the following:

### Data And Storage

- JSON only
- no database
- `/data` = runtime state
- `/assets/data` = build-time content

### Runtime And Build Separation

- no runtime mutation of prerendered or built artifacts
- content changes flow through the rebuild pipeline

### Deployment

- single container
- Node server is the runtime entry point
- no nginx runtime

### Angular

- use Angular Signals
- no NgRx

## Verification

Verification is mandatory.

Default required checks:

- `npm test`
- `npm run build`
- `npm run dev:server`

Then verify:

- `/` returns `200`
- `/api/health` returns healthy JSON
- `/api/index.json` returns `200`
- unknown route returns the SPA shell
- representative deep link returns `200`

If the task changes workflow tooling or the context pipeline, also verify the relevant helper commands and documentation consistency.

## Session Closure

Required closure sequence:

- `bd close <id>`
- `git pull --rebase`
- `bd dolt push`
- `git push`
- `git status`

Must confirm:

- branch is up to date with origin

If unrelated dirty worktree changes exist:

- do not absorb them
- preserve them
- report them explicitly

## Spec Kit Escalation

Use the normal lightweight flow for:

- bug fixes
- small UI fixes
- narrow endpoint work
- docs updates
- tooling updates
- small deterministic infrastructure fixes

Use fuller Spec Kit flow for:

- PWA or service worker work
- admin API or admin UI work
- rebuild-trigger workflows
- NAS image-serving or runtime-boundary changes
- smoke-test definition for migration/runtime safety
- ADR-sensitive architecture changes

For fuller Spec Kit flow:

- bead first
- Graphify first
- context bundle first
- then follow `.specify/memory/constitution.md`
- use `clarify -> plan -> tasks -> analyze` before implementation

## Prompt Compression Rule

Prefer:

- references to repo docs
- references to the bead
- references to exact symbols or files
- task-specific constraints
- explicit verification

Avoid:

- repeating onboarding docs
- repeating architecture docs
- embedding long generic checklists
- rewriting existing repo templates inline

Long prompts are justified only for:

- architecture-sensitive work
- ADR-sensitive infrastructure changes
- migrations
- first-time scaffolding
- tasks where missing constraints would create real delivery risk

## Short Version

`Bead -> Graphify -> Context -> Code -> Verify -> Close`
