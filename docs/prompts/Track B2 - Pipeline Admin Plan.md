Track B2: Pipeline Admin Plan
Track Goal

Create a protected admin surface for pipeline visibility, staged dataset handling, controlled rebuild requests, castle data overrides, and eventually enrichment/rebuild orchestration, while preserving the rule that runtime endpoints do not mutate prerendered or built artifacts in place.

The current pipeline remains based on the canonical XLSX source and regeneration scripts.

Phase 0 — Architecture Preflight
Goal

Define the safe B2 boundary before implementation.

Deliverables
docs/design/Prompt — Topcastles Pipeline Admin · Architecture Boundary.md
B2 architecture decision note, either in existing decisions docs or a dedicated design doc
Beads for Phase 1
Decisions to lock
Runtime may stage files and write intent/status JSON under /data
Runtime may not run npm run build
Runtime may not mutate new_app/dist, new_app/public/api, prerender routes, or committed app data directly
Pipeline execution remains developer-machine or external-worker owned unless a later gate explicitly changes this
Approval Gate 0

Approve:

runtime/build boundary
/data/pipeline/ as the admin pipeline runtime state location
whether rebuild execution is limited to “request only” for now
Phase 1 — Pipeline Status Admin
Goal

Add a read-only /admin/pipeline page showing current staged dataset and pipeline readiness.

Bead proposal

topcastles-b2-pipeline-status

Scope
Admin route/page: /admin/pipeline
Admin nav link from existing admin shell
API:
GET /api/admin/pipeline/status
Read existing pending upload status
Show:
pending enriched file
timestamp
file size
checksum if available
warnings
build/prerender notice
Non-goals
No rebuild trigger
No castle editing
No enrichment execution
No generated artifact writes
Expected files

Likely:

new_app/src/app/...admin...
server/routes/...
server/index.js
focused specs
Verification
Admin page route renders
unauthenticated API rejected
authenticated status API works
existing editorial admin still works
tests/build pass
Approval Gate 1

Approve the status UI and status API shape before adding any write actions.

Phase 2 — Pipeline Metadata Ledger
Goal

Introduce a simple runtime metadata file for pipeline status history.

Bead proposal

topcastles-b2-pipeline-meta-ledger

Runtime file
/data/pipeline/meta.json
Example shape
{
  "lastStagedAt": "2026-05-04T12:00:00Z",
  "lastStagedHash": "sha256...",
  "lastBuildAt": null,
  "lastDeployAt": null,
  "notes": []
}
Scope
Create pipeline state helper
Ensure directory creation
Add metadata to GET /api/admin/pipeline/status
Update metadata when enriched upload is staged
Non-goals
No job queue
No rebuild request
No castle edit API
Approval Gate 2

Approve the metadata model and confirm whether lastBuildAt is manual, deploy-script written, or future worker-written.

Phase 3 — Rebuild Request Handoff
Goal

Allow admin to request a rebuild without executing it inside the runtime container.

Bead proposal

topcastles-b2-rebuild-request-handoff

Runtime files
/data/pipeline/rebuild-request.json
/data/pipeline/rebuild-history.json
API
POST /api/admin/pipeline/rebuild-request
GET  /api/admin/pipeline/rebuild-request
UI

Add to /admin/pipeline:

“Request rebuild” button
pending request status
operator instructions
last request timestamp and handle
Request payload
{
  "reason": "staged enriched dataset ready",
  "requestedBy": "Robert"
}
Non-goals
No execution
No live logs
No deploy automation
Approval Gate 3

Approve the handoff model before introducing scripts or watchers.

Phase 4 — Developer-Machine Rebuild Consumer
Goal

Create a local script that consumes the rebuild request and runs the established pipeline outside runtime.

Bead proposal

topcastles-b2-rebuild-consumer-script

Script
scripts/consume-pipeline-rebuild-request.js
Responsibilities
Read /data/pipeline/rebuild-request.json or local equivalent
Validate staged file exists
Copy/prepare staged file according to current pipeline policy
Run:
npm run data:regenerate
npm run build
Write result back to pipeline metadata
Produce log file
Logs
/data/pipeline/logs/<timestamp>-rebuild.log
Non-goals
No daemon yet
No server-side execution
No automatic deploy unless explicitly approved
Approval Gate 4

Approve whether this script may also call deploy.sh, or whether deployment remains manual.

Phase 5 — Admin Castle Overrides
Goal

Add admin-managed castle correction/addition data without editing generated pipeline artifacts directly.

Bead proposal

topcastles-b2-castle-overrides

Runtime file
/data/pipeline/castle-overrides.json
API
GET  /api/admin/castles/:code
PUT  /api/admin/castles/:code
POST /api/admin/castles
Principle

Admin writes override records. The pipeline later merges them into generated data.

Example override
{
  "fr001": {
    "name": "Corrected name",
    "lat": 48.123,
    "lng": 2.456,
    "note": "Corrected from admin pipeline override"
  }
}
UI
Lookup castle
Edit allowed fields
Add new castle draft
Show “requires pipeline rebuild” warning
Non-goals
No direct mutation of castles_enriched.json
No public page changes yet
No spreadsheet mutation
Approval Gate 5

Approve:

allowed editable fields
add-new-castle minimum schema
whether overrides are temporary patches or long-lived source-adjacent data
Phase 6 — Pipeline Merge Overrides
Goal

Make the build-time pipeline consume admin overrides deterministically.

Bead proposal

topcastles-b2-merge-overrides

Scope
Add merge step to pipeline
Validate override schema
Apply overrides to enriched data during regeneration
Emit clear diagnostics
Preserve generated artifact policy
Possible script
scripts/apply_castle_overrides.js
Pipeline position

After enrichment, before lean/API/sitemap/route generation.

Non-goals
No admin UI changes except status messaging if needed
No editorial overlay changes
No hidden mutation of runtime overlay files
Approval Gate 6

Approve generated diff strategy and conflict handling:

override wins
pipeline wins
conflict blocks build
Phase 7 — Enrichment Execution Request
Goal

Add admin ability to request enrichment runs, still as handoff intent.

Bead proposal

topcastles-b2-enrichment-request

API
POST /api/admin/pipeline/enrichment-request
GET  /api/admin/pipeline/enrichment-request
Supported actions
Wikipedia enrichment
Wikidata enrichment
coordinate enrichment, if promoted to supported pipeline step

The coordinate script currently exists but has no root npm wrapper.

Approval Gate 7

Approve whether coordinate enrichment becomes a supported root command.

Phase 8 — Job Queue And Log Viewer
Goal

Move from single rebuild request files to a small JSON job model.

Bead proposal

topcastles-b2-pipeline-jobs

Runtime structure
/data/pipeline/jobs/<job-id>.json
/data/pipeline/logs/<job-id>.log
API
GET /api/admin/pipeline/jobs
GET /api/admin/pipeline/jobs/:id
GET /api/admin/pipeline/jobs/:id/log
UI
job list
status badges
log viewer
retry button only if approved
Non-goals
No live streaming yet
No concurrent execution
Approval Gate 8

Approve whether the system remains single-job-only or supports queued jobs.

Phase 9 — Optional External Worker
Goal

Introduce actual automated execution outside the runtime container.

Bead proposal

topcastles-b2-external-worker

Options
Developer-machine watcher
GitHub Actions workflow
Separate Docker worker on NAS
Manual script only
Recommendation

Prefer option 1 or 2 before any NAS worker.

Approval Gate 9

Architecture approval required before implementation.

Phase 10 — Optional Log Streaming
Goal

Show running pipeline logs in the admin UI.

Bead proposal

topcastles-b2-log-streaming

API options
polling endpoint
Server-Sent Events
Recommendation

Start with polling. SSE only if needed.

Approval Gate 10

Approve transport and retention policy.

Recommended First Beads

Create these first:

topcastles-b2-architecture-boundary
topcastles-b2-pipeline-status
topcastles-b2-pipeline-meta-ledger
topcastles-b2-rebuild-request-handoff

Do not start with castle editing or rebuild execution.

