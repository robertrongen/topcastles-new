# Spec Kit In Topcastles

Spec Kit is a lightweight policy layer on top of the existing Topcastles workflow.

It does not replace:

- Beads as task authority
- Graphify as repo structure authority
- The local context pipeline as context authority
- Repo docs and VS Code tasks as operational guidance

## Default: lightweight Topcastles flow

Most work should keep the existing lightweight flow:

1. Start from a bead.
2. Use Graphify before broad file reading.
3. Build a context bundle for non-trivial work.
4. Use a short prompt that references repo docs instead of repeating them.
5. Implement, verify, and close the bead.

This is enough for:

- small bug fixes
- routine docs updates
- focused tooling edits
- single-file or otherwise obvious changes

## Use fuller Spec Kit flow for higher-risk work

Use the fuller Spec Kit flow when the task is architecture-sensitive, crosses runtime/build boundaries, or needs tighter non-goal control before implementation.

Recommended fuller flow:

1. Start from the bead.
2. Check Graphify and build the context bundle.
3. Follow `.specify/memory/constitution.md`.
4. Run a fuller Spec Kit pass: `specify`, `clarify`, `plan`, `tasks`, and `analyze` before implementation.

Use that fuller flow for roadmap categories such as:

- PWA or service worker work
- Admin API or admin UI work
- Rebuild-trigger flows
- NAS image-serving or runtime-boundary changes
- Smoke-test definitions for migration or runtime safety

These tasks affect architecture assumptions, artifact boundaries, runtime behavior, deployment safety, or verification depth. They benefit from explicit non-goals and a reviewed implementation plan before code changes begin.

## Prompt compression rule

Prompts should stay short even when fuller Spec Kit flow is used.

Prefer references like these over repeated instructions:

- `docs/new-developer-onboarding.md`
- `docs/context-pipeline.md`
- `docs/architecture.md`
- `docs/pipeline.md`
- `DEVELOPER.md`
- `.specify/memory/constitution.md`
- `data/context/bundles/<bead-id>.json`

## Decision rule

If the task can be completed safely with the normal bead + Graphify + context-bundle flow, do that.

If the task could accidentally blur build-time versus runtime boundaries, change deployment/runtime assumptions, or expand scope into architecture work, use fuller Spec Kit discipline first.
