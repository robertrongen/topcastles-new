# Agent Preflight Contract

This file is the mandatory preflight contract for any agent working in Topcastles.

Use it before planning, implementation, debugging, docs changes, or architecture work.

This contract complements:
- `docs/new-developer-onboarding.md`
- `docs/prompt-authoring-guide.md`
- `docs/spec-kit.md`
- `AGENTS.md`
- `DEVELOPER.md`

## Core Rule

Follow this flow for every task:

`Bead -> Graphify -> Context -> Implementation -> Verification -> Closure`

Do not claim compliance with this workflow unless you provide the required evidence in your final response.

## 1. Mandatory Preflight

Before broad file reading or code changes, do all of the following:

1. Start from a bead
   - `bd ready`
   - `bd show <id>`
   - `bd update <id> --claim`

2. Run Graphify before broad repo inspection
   - `npm run graph:query -- <symbol>`
   - or `graphify query graphify-out/graph.json <symbol>`

3. Build minimal context for any non-trivial task
   - `npm run context:index`
   - `npm run context:resolve -- <id> --query "<focus>" --budget medium`

4. Check the relevant repo authority docs for the task:
   - architecture/runtime: `docs/architecture.md`
   - pipeline/artifacts: `docs/pipeline.md`
   - active roadmap work: `docs/roadmap.md`
   - higher-risk work: `docs/spec-kit.md` and `.specify/memory/constitution.md`

5. Before implementing new code, the agent must:

   - search for existing component/service usage
   - identify the canonical implementation
   - explain why reuse or extension is chosen

New implementation is only allowed if reuse is clearly impossible.
## 2. Required Final-Response Evidence

Every final response for a task must include these items in concise form:

### Graphify evidence
- exact Graphify queries/commands used
- exact files or symbols resolved
- short note on how Graphify narrowed scope

### Context evidence
- whether context indexing was run
- whether a context bundle was created
- bundle path used, if applicable

### Change evidence
- exact files changed
- whether `.beads/issues.jsonl` changed due to bead operations
- whether any generated artifacts changed, and whether they were kept or reverted

### Verification evidence
- exact verification commands run
- test/build/server outcomes
- any route or endpoint checks performed
- whether a step was skipped and why

## 3. Stop Conditions

Stop and report instead of proceeding silently if any of these occur:

- no bead exists and one was not created
- Graphify is unavailable or fails before scope is established
- a non-trivial task cannot build its context bundle
- unrelated dirty files are present and would be absorbed
- task scope expands into architecture-sensitive work without following `docs/spec-kit.md`

## 4. Scope Rules

- keep tasks single-purpose by default
- touch only the files justified by the bead and Graphify
- do not include opportunistic refactors
- do not drift into unrelated docs, tests, or features
- preserve:
  - JSON-only storage
  - `/data` as runtime state
  - `/assets/data` as build-time content
  - no runtime mutation of prerendered or built artifacts
  - single-container Node runtime
  - Angular Signals, no NgRx

## 5. Storybook Rule For UX Work

For shared UI or styling work:

- Storybook is the review anchor, not just an optional build artifact
- if a modified shared component already has a story, update it when needed to reflect the change
- if a modified shared component has no story and the change is meaningful for review, add one
- if no Storybook changes are needed, explain why

## 6. Test Rule For Behavior Changes

For any task that changes route, service, or API behavior:

- run the repo’s intended verification commands
- add or update focused tests when the affected surface is testable and the task changes behavior materially
- if no focused tests are added, explain why not

This is especially important for:
- Angular services
- API routes
- retry/recovery logic
- token/state restore logic
- data transformation logic

## 7. Closure Requirements

Before ending the session:

- `bd close <id>`
- `git pull --rebase`
- `bd dolt push`
- `git push`
- `git status`

Final confirmation must state that the branch is up to date with origin.

## 8. Short Prompt Rule

Prompts should reference this file instead of repeating the full workflow.

Preferred prompt pattern:

- task goal
- scope
- non-goals
- exact files/symbols when known
- required verification
- `Follow: docs/agent-preflight.md`

## 9. Higher-Risk Work

Use fuller Spec Kit flow for:
- PWA or service worker work
- NAS image-serving or runtime-boundary changes
- admin API or admin UI work
- rebuild-trigger workflows
- ADR-sensitive architecture changes

For those tasks:
- bead first
- Graphify first
- context first
- then follow `.specify/memory/constitution.md`
- use `clarify -> plan -> tasks -> analyze` before implementation