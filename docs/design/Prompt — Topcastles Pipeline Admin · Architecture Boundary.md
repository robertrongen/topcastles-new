# Pipeline Admin — Architecture Boundary (B2 Phase 0)

Track B2 introduces a protected pipeline admin surface. This document records the boundary
decisions that govern the entire track. All phases must honour these constraints. Any gate
that proposes to cross a boundary listed here requires a new ADR before implementation.

## Locked boundary decisions

### 1. Runtime may stage files and write intent/status JSON under `/data`

The Node runtime may write to:

- `/data/pending/` — staged enriched upload and upload metadata (existing, first introduced
  before Track B2)
- `/data/pipeline/` — pipeline state: metadata ledger, rebuild requests, rebuild history,
  castle overrides, job records, and logs

No other directories under `/data` are writable by the pipeline admin surface.

### 2. Runtime may not execute the build pipeline

The runtime container must never run:

- `npm run build`
- `npm run data:regenerate` (or any constituent `data:*` script)
- `scripts/*.js` or `scripts/*.py` data-generation scripts
- `deploy.sh` or any deployment automation

These remain exclusively developer-machine (or approved external-worker, if a future gate
explicitly changes this) responsibilities.

### 3. Runtime may not mutate built or prerendered artifacts

The following paths are immutable at runtime:

- `new_app/dist/` — Angular build output and prerendered HTML
- `new_app/public/api/` — static API JSON slices
- `new_app/src/assets/data/` — generated committed castle data
- `new_app/public/sitemap.xml`
- `new_app/prerender-routes.txt`

Content changes that affect these artifacts must go through `npm run data:regenerate` and
`npm run build` on a developer machine, then be committed and deployed.

### 4. Rebuild execution is request-only through Phase 3

Phases 1, 2, and 3 implement status display and a rebuild-request handoff file only. No
Phase in this range triggers actual execution. The rebuild-request file is a signal
consumed by a developer-machine (or future worker) outside the container.

A later gate (Phase 4 or beyond) may approve a script that runs outside the runtime. That
approval must be explicit and recorded here before implementation.

### 5. Pipeline execution authority

Until a gate explicitly changes this:

- Build pipeline: developer machine
- Enrichment scripts: developer machine
- Deploy: developer machine via `deploy.sh`

A Synology NAS worker or GitHub Actions workflow requires architecture approval (Phase 9
gate) before any implementation begins.

## Directory layout under `/data/pipeline/`

```
/data/pipeline/
  meta.json               # Phase 2 — pipeline state ledger
  rebuild-request.json    # Phase 3 — pending rebuild request
  rebuild-history.json    # Phase 3 — past request outcomes
  castle-overrides.json   # Phase 5 — admin castle correction records
  jobs/                   # Phase 8 — job records (one JSON per job)
  logs/                   # Phase 4+ — rebuild log files
```

The existing `/data/pending/` directory is retained as the staging area for enriched
uploads. Phase 1 status API reads `/data/pending/meta.json`. Phase 2 introduces
`/data/pipeline/meta.json` as the ledger.

## Relationship to existing ADRs

| ADR | Relevance |
|-----|-----------|
| ADR-003 | JSON-only storage. `/data/pipeline/` files are JSON. |
| ADR-007 | Hybrid static + runtime state. `/data/pipeline/` is runtime state. |
| ADR-010 | Admin UI triggers pipeline, not runtime mutation. Rebuild is request-only. |

No new ADR is required for Phases 1–3. If Phase 4 approves developer-machine execution
integration, record the decision in `docs/decisions.md` as ADR-012.

## Approval gate summary

| Gate | Question |
|------|----------|
| Gate 0 | This document — runtime/build boundary, `/data/pipeline/` path, request-only for now |
| Gate 1 | Status UI and status API shape before any write actions |
| Gate 2 | Metadata model and who writes `lastBuildAt` |
| Gate 3 | Rebuild handoff model before introducing scripts or watchers |
| Gate 4 | Whether consumer script may also call `deploy.sh` |
| Gate 5 | Editable fields, new-castle minimum schema, override longevity |
| Gate 6 | Override merge conflict strategy |
| Gate 7 | Whether coordinate enrichment becomes a supported root command |
| Gate 8 | Single-job-only vs queued jobs |
| Gate 9 | External worker architecture |
| Gate 10 | Log streaming transport and retention |
