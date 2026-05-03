# Claude Code prompt — Topcastles Editorial Write API (Gate 2)

This prompt covers the **server-side write path** for the editorial overlay: a single, atomic, backed-up PUT per file, behind admin auth, with strict schema validation. It is the foundation Gate 4 (per-file editors) consumes — there is no UI in this gate.

Source-of-truth context:

- Spec doc: `editorial-overlay.md` (uploaded earlier; treat as authoritative for file shapes).
- Existing read path: `server/routes/editorial.js` (public, whitelisted by filename).
- Existing admin auth: `server/routes/admin.js` (`adminAuth` middleware).
- Sibling prompts: `Topcastles Admin - Implementation Prompt for Claude Code.md` (Gates 1 + 3, already merged) and `Topcastles Admin - Implementation Prompt for Claude Code (Gate 4).md` (UI; depends on this gate).

Where this prompt and the spec disagree, the **spec wins**. This prompt is for the implementation shape; the data contract is the spec's.

---

## Workflow

Follow the Topcastles prompt workflow: **Bead → Graphify → Context → Implementation → Verification → Closure**. Use the fuller Spec Kit flow: bead first, Graphify first, context bundle first, then clarify → plan → tasks → analyze before coding.

Approval gates apply. Do not run past Gate 2 into Gate 4 without stopping and reporting.

| Gate | Bead | Scope of this prompt |
|---|---|---|
| 2 | `topcastles-2wr` | Write endpoints, validation, atomic write, backup write, audit log, admin lookup helper |

Gates 4 and 5 are out of scope.

---

## Prerequisites

- Gate 1 is on `main`. The `adminAuth` middleware is in place and rejects missing/invalid bearer tokens with 401. Reuse it; do not fork it.
- The five overlay files exist (or are absent — both states are valid) under `/data/editorial/`. Filenames are fixed:
  - `countries.json`
  - `regions.json`
  - `castle-quotes.json`
  - `period-picks.json`
  - `browse-bands.json`
- Backup directory is `/data/editorial/backups/`. Create on first write if absent (`mkdir -p` semantics, mode 750).
- The canonical castle list is `data/castles_enriched.json` (or whatever the existing read path uses — do not duplicate it). Period-pick / castle-quote validation reads from this; do not in-line a copy.
- The container's process user must own both `/data/editorial/` and `/data/editorial/backups/`. Note any permission gap in your report; do not paper over it with `chmod 777` or root.

---

## Endpoints

All under `/api/admin/editorial/`, all behind `adminAuth`. JSON in, JSON out. No multipart, no query-string mutation.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/admin/editorial/:file` | Read current file (admin equivalent of public read; included so the editor never crosses public/admin boundary). |
| `PUT` | `/api/admin/editorial/:file` | Replace the entire file. Whole-file write, not per-key patch. |
| `GET` | `/api/admin/editorial/:file/backups` | List timestamped backups for a file. |
| `GET` | `/api/admin/editorial/:file/backups/:stamp` | Read one backup by timestamp slug. |
| `GET` | `/api/admin/castles/lookup?q=…&limit=20` | Castle-code autocomplete used by Gate 4. Returns `{ code, name, country, rank }[]`. |

**`:file` is whitelisted.** Reject any other value with 404 `unknown editorial file`. The whitelist lives next to the public read whitelist — share the constant; do not duplicate.

**`:stamp` is whitelisted by regex** to the exact format the writer produces (see Backup format below). Anything else → 404.

---

## PUT contract — the only mutation in this gate

### Request

```
PUT /api/admin/editorial/countries.json
Authorization: Bearer <admin-token>
Content-Type: application/json
If-Match: "<sha256-of-current-file>"     // optional but supported
Body: <full file contents as JSON>
```

- The body is the **entire file**. Server does not merge. The client (Gate 4) is responsible for sending the complete next state.
- `If-Match` carries the SHA-256 hex digest of the **current on-disk file at read time**, computed by the client from the `GET` response. If present and stale, the server rejects with 412 `precondition failed` and includes the current digest in the response so the client can re-read and merge.
- If `If-Match` is absent, the server proceeds (last-write-wins). Gate 4 always sends it; this is here for non-UI clients (curl, scripts).

### Validation

Two layers, in order:

1. **Schema validation** per file (see "Per-file schemas" below). Use a single AJV instance loaded at boot with all five schemas precompiled. On failure → `422` with `{ errors: [{ keyPath, code, message }] }` — `keyPath` is dot-and-bracket notation pointing at the offending value (e.g. `France.editorialNote`, `12th c..castleCode`, `1-100.note`).
2. **Cross-reference validation** — only after schema passes. Castle codes referenced in `castle-quotes.json` and `period-picks.json` (and `topEntry.castleCode` in `countries.json`, if the spec defines it) must resolve in `castles_enriched.json`. On failure → `422` with `{ errors: [{ keyPath, code: "unknown_castle_code", message: "<code> not found in canonical index" }] }`. Do not silently accept; do not auto-strip.

422 carries every error, not just the first. Gate 4 displays them per field.

### Write order (must be atomic)

1. Acquire a lock on `<file>.lock` (advisory file lock, e.g. `proper-lockfile` or `flock`). Hold for the duration of the write. Reject conflicting writes with 423 `locked` after a 500 ms wait.
2. Read current file. If it exists, copy it to `<file>-<timestamp>.json` in `/data/editorial/backups/`. **Backup first, write second.** If the copy fails, abort with 500 and do not touch the live file.
3. Compute SHA-256 of the new bytes.
4. Write the new bytes to `<file>.tmp` in the same directory. `fsync` the file. Rename to the live filename (POSIX rename is atomic on the same filesystem).
5. Append an audit-log entry (see "Audit log" below).
6. Release the lock.
7. Respond with the success envelope.

If any step after step 2 fails, leave the backup in place and surface a 500 with `{ error: "write_failed", phase: "<step>" }`. Do not attempt rollback magic; the backup is the rollback.

### Response (200)

```json
{
  "ok": true,
  "file": "countries.json",
  "etag": "<sha256-hex>",
  "backup": "countries-2026-05-02T14-47-12.json",
  "savedAt": "2026-05-02T14:47:12.318Z",
  "savedBy": "r.rongen"
}
```

### Error responses

| Status | Code | When |
|---|---|---|
| 401 | (handled by `adminAuth`) | missing / invalid bearer |
| 404 | `unknown_file` | `:file` not in whitelist |
| 412 | `stale_etag` | `If-Match` present and does not match current digest. Body: `{ error, currentEtag }` |
| 413 | `too_large` | body > 256 KiB (configurable; default cap covers all five files comfortably) |
| 415 | `unsupported_media_type` | non-JSON `Content-Type` |
| 422 | `validation_failed` | schema or cross-reference errors. Body: `{ errors: [...] }` |
| 423 | `locked` | competing write held the lock past 500 ms |
| 500 | `write_failed` | filesystem error after backup. Body: `{ error, phase }` |

Every error response is JSON, never HTML. Gate 4 expects to parse `error` and (for 422) `errors`.

---

## Per-file schemas

Use the spec doc as the source of truth. Precompile all five at boot. The shapes the editor consumes (Gate 4) are:

### `countries.json`

Map of `<countryNameOrISO>` → object:

```json
{
  "editorialNote":    "string, 1..220 chars, no leading/trailing whitespace",
  "definingTradition":"string, 1..80 chars",
  "topEntry": { "castleCode": "string matching /^[a-z]{2,8}\\d{3,5}$/" },   // optional, but if present castleCode is required and must resolve
  "editorSleeper":    "boolean (default false; absence treated as false)"
}
```

- All keys other than `editorialNote`, `definingTradition`, `topEntry`, `editorSleeper` are rejected (`additionalProperties: false`).
- The map's keys are not constrained at schema level; cross-reference validation is on `topEntry.castleCode` only.

### `regions.json`

Map of `<region-slug>` → object:

```json
{
  "description":   "string, 1..200 chars",
  "editorSleeper": "boolean"
}
```

`additionalProperties: false`. Slug keys are free-form (the spec lists examples; keys are not whitelisted).

### `castle-quotes.json`

Map of `<castle-code>` → object:

```json
{
  "quote":         "string, 1..480 chars",
  "author":        "string, 1..80 chars",
  "role":          "string, 1..40 chars",
  "date":          "ISO-8601 date YYYY-MM-DD",
  "featuredUntil": "ISO-8601 date YYYY-MM-DD"     // optional
}
```

- The map's **key** is the castle code and is itself cross-reference-validated against `castles_enriched.json`. A key that does not resolve is a `unknown_castle_code` error with `keyPath: "<code>"`.
- `date` and `featuredUntil` are calendar dates, not datetimes. Reject `2026-05-01T00:00:00Z`.
- `additionalProperties: false`.

### `period-picks.json`

Map of `<era-label>` → object:

```json
{
  "pick":       "string, 1..80 chars (display name)",
  "castleCode": "string, /^[a-z]{2,8}\\d{3,5}$/, must resolve"
}
```

- Era labels are free-form strings (spec uses `"9th c."` etc.). No constraint at schema level.
- `additionalProperties: false`.

### `browse-bands.json`

Map of `<rank-band>` → object. Bands are not constrained at schema level (Gate 4 sends only the three configured bands; the API will accept others without complaint, which matches the spec):

```json
{
  "note": "string, 1..240 chars"
}
```

`additionalProperties: false`.

If the spec lists fields this prompt omits, **add them and follow the spec**. If the spec contradicts a constraint here, follow the spec and note the deviation in your report.

---

## Backup format

- Directory: `/data/editorial/backups/`
- Filename: `<basename>-<stamp>.json` where `<basename>` is the file's basename without `.json` and `<stamp>` is `YYYY-MM-DDTHH-mm-ss` in UTC. Example: `countries-2026-05-02T14-47-12.json`.
- The colon-free time format is intentional — keep filenames safe on every filesystem.
- Backups are **byte-for-byte copies of the file as it was before the write that produced them**. They are not pretty-printed copies of the new bytes; they are the previous version.
- No pruning in this gate. The overview's "Backups on disk" cell counts entries; pruning is a Gate 5 chore.

### Backup listing endpoint

`GET /api/admin/editorial/:file/backups` returns:

```json
{
  "file": "countries.json",
  "backups": [
    { "stamp": "2026-05-02T14-47-12", "size": 814,  "savedAt": "2026-05-02T14:47:12.000Z", "savedBy": "r.rongen" },
    { "stamp": "2026-05-02T14-42-08", "size": 798,  "savedAt": "2026-05-02T14:42:08.000Z", "savedBy": "r.rongen" }
  ]
}
```

- `savedBy` is read from the audit log (see below). If the audit log has no entry for a given backup file (e.g. created before audit logging shipped), set `savedBy: null`. Do not invent a value.
- Sort newest first. No pagination in this gate; the volume is small.

`GET /api/admin/editorial/:file/backups/:stamp` returns the backup contents as JSON with `Content-Type: application/json`. 404 if the backup does not exist.

---

## Audit log

A single append-only file at `/data/editorial/audit.log`, JSON-lines (one object per line, `\n` terminated). Each successful PUT appends one line:

```json
{"ts":"2026-05-02T14:47:12.318Z","actor":"r.rongen","file":"countries.json","etag":"<sha256-hex>","backup":"countries-2026-05-02T14-47-12.json","bytes":814}
```

- `actor` is taken from the bearer token's claims (the editor handle). If the token format does not carry it, take it from a request header set by `adminAuth` and surface the gap in your report — do not write `"unknown"`.
- Append with `O_APPEND`; do not read-modify-write. Concurrent appends are safe with `O_APPEND` on POSIX.
- Failed writes do not produce an audit entry. (The backup-then-write order means a failed write never has a successful backup either.)
- This log is not exposed via API in this gate. Reads come later when "Recent edits" gets a real source (Gate 4 currently fakes them from backup filenames).

---

## Castle lookup helper

`GET /api/admin/castles/lookup?q=<text>&limit=20`

- Token-required; same `adminAuth`.
- Searches `castles_enriched.json` by code (prefix match) and by name (case-insensitive substring). Score code-prefix matches above name-substring matches; break ties by rank (lower rank wins).
- `q` is required, ≥ 1 character. Empty → 400. Do not return all 1,000 entries for an empty query.
- `limit` is bounded `1..50`, default `20`.
- Response:

```json
{
  "results": [
    { "code": "sy001", "name": "Krak des Chevaliers", "country": "Syria", "rank": 4 },
    { "code": "il004", "name": "Krak des Moabites",   "country": "Jordan","rank": 412 }
  ]
}
```

- The `castles_enriched.json` file should be loaded once at boot and indexed in memory. Do not read from disk per request.
- `country` is the display country name, not the ISO code (Gate 4 displays it directly; matches the public Top Countries gazetteer).

If the public site has an existing search index for the catalogue, **reuse it.** Do not write a parallel one for admin.

---

## Concurrency, locking, transactions

- One advisory lock per file: `<file>.lock` next to the file itself. Use `proper-lockfile` or equivalent — do not roll your own.
- Lock scope: the **PUT** path only. Reads do not lock. Backups are written under the same lock as the PUT they belong to.
- Lock wait: `retries: { retries: 3, factor: 2, minTimeout: 100, maxTimeout: 200 }` — total ~500 ms before 423.
- No global lock across files. Two editors saving Countries and Regions in parallel must not block each other.

---

## Security

- Path traversal: `:file` is whitelisted; reject anything else before touching the filesystem. Do not `path.join(dir, req.params.file)` without first checking the whitelist.
- `:stamp` is whitelisted by regex `/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/`. Anything else → 404.
- Body size cap (413). Reject before parsing JSON when possible (Express body-parser `limit: '256kb'`).
- Content-Type must be `application/json`. Reject anything else with 415.
- No CORS for `/api/admin/*`. Same-origin only. If the existing admin routes already allow specific origins, follow that.
- Audit log is mode 640; backup directory is mode 750. Live files are mode 640.
- The bearer token is opaque to this gate; auth is `adminAuth`'s problem. Do not log the token, ever — not even on error.

---

## Logging

- Every PUT logs (server logger, not the audit log) one structured line at info: actor, file, status, latency_ms, bytes.
- 4xx logs at warn; 5xx at error.
- The audit log is *separate* from the application log. Do not conflate them.

---

## Tests (required before closing the gate)

Sit alongside the existing `server/routes/editorial.test.js`. New file: `server/routes/admin-editorial.test.js`. Cover at minimum:

1. **Auth** — PUT without bearer → 401. With invalid bearer → 401.
2. **Whitelist** — PUT to `/api/admin/editorial/secrets.json` → 404.
3. **Schema fail** — PUT `countries.json` with `editorialNote: ""` → 422 with `keyPath: "France.editorialNote"`.
4. **Cross-ref fail** — PUT `castle-quotes.json` with key `xx999` → 422 `unknown_castle_code`.
5. **Happy path** — PUT valid `countries.json` → 200, response carries `etag` + `backup`. Subsequent GET returns the new content. Backup file exists on disk and equals the previous content. Audit log has exactly one new line with matching `etag`.
6. **Stale etag** — Two concurrent PUTs with stale `If-Match` → first wins 200, second gets 412 with current `currentEtag`.
7. **Lock contention** — Force the lock to be held > 500 ms; concurrent PUT returns 423.
8. **Backup-first invariant** — Inject a write failure after the backup step; assert the live file is untouched and the backup exists.
9. **Empty file** — PUT `{}` → 200; reading back yields `{}`.
10. **Castles lookup** — empty `q` → 400; `q=krak` returns Krak des Chevaliers as result 0.

Use real disk in a temp dir per test (`mkdtemp`); do not mock `fs`. The whole point of this gate is filesystem correctness.

---

## Verification per gate

Per the spec:

- `npm test`
- `npm run build`
- `npm run test:smoke`
- `node server/routes/admin-editorial.test.js` (new)
- `node server/routes/editorial.test.js` (still green)

Manual curl checks:

```bash
# 1. unauthenticated PUT → 401
curl -X PUT -H 'content-type: application/json' \
  -d '{}' http://localhost:3000/api/admin/editorial/countries.json -i

# 2. authenticated happy path → 200, etag in response
TOKEN=...
curl -X PUT -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"France":{"editorialNote":"x","definingTradition":"y"}}' \
  http://localhost:3000/api/admin/editorial/countries.json -i

# 3. unresolved castle code → 422
curl -X PUT -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"xx999":{"quote":"q","author":"a","role":"r","date":"2026-05-01"}}' \
  http://localhost:3000/api/admin/editorial/castle-quotes.json -i

# 4. backups list
curl -H "authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/editorial/countries.json/backups

# 5. castles lookup
curl -H "authorization: Bearer $TOKEN" \
  'http://localhost:3000/api/admin/castles/lookup?q=krak'
```

After (2), confirm on disk:

- `/data/editorial/countries.json` has the new contents.
- `/data/editorial/backups/countries-<stamp>.json` exists and equals the prior contents (or `{}` if the file did not previously exist — in that case no backup is written; note that case clearly in the response: `backup: null`).
- `/data/editorial/audit.log` has one new line with `actor`, `file`, `etag`, `backup`, `bytes`.

---

## Anti-patterns — do not introduce

- ❌ No per-key PUT/PATCH endpoints. Whole-file or nothing.
- ❌ No "save and merge" semantics on the server. Merging is the client's problem.
- ❌ No optimistic write that bypasses the backup step.
- ❌ No write-then-backup; always backup-then-write.
- ❌ No global lock across files.
- ❌ No reading `castles_enriched.json` per request — load once.
- ❌ No new ORM, no new validation library beyond AJV (already in tree, presumably). If AJV is not in tree, propose adding it in the bead notes; do not silently introduce a different one.
- ❌ No HTML error responses. JSON only.
- ❌ Do not modify any pipeline script.
- ❌ Do not log bearer tokens or full request bodies at info level.

---

## Closure

- Close only the bead completed in this gate (`topcastles-2wr`).
- `git pull --rebase`
- `bd dolt push`
- `git push`
- `git status`
- Confirm the working branch is clean and up to date with origin.
- **Stop and report** before opening Gate 4 (per-file editors). Gate 4 lands as its own bead and PR.

---

## Reading list (what to load into your context bundle)

- `editorial-overlay.md` — the data spec.
- `server/routes/editorial.js` — read path, whitelist, file path resolution.
- `server/routes/admin.js` — `adminAuth` shape, claim layout.
- The Gate 1+3 prompt (already merged) for tone and verification rhythm.
- The Gate 4 prompt — read the "Save behaviour" and "Per-file specifications" sections so the API you build matches the request/response shapes the editor expects. If you find a mismatch, **resolve it in this gate** by aligning the API to the editor's expectations, not the other way around. The editor is closer to the user.

# Summary

- **Bead topcastles-2wr** — Gate 2 only; carves out Gates 4 and 5.
- **Five endpoints** under */api/admin/editorial/* and one helper at /api/admin/castles/lookup for the autocomplete.
- **Whole-file PUT** — no per-key patches. Optional If-Match ETag for stale-write detection (412 with currentEtag in the body).
- **Two-layer validation** — AJV schemas first, then cross-reference castle codes against castles_enriched.json. 422 carries every error keyed by keyPath so Gate 4 can surface them per field.
- **Backup-first invariant** — copy current → write new (atomic via tmp + rename) → audit log. Backup filename is <basename>-YYYY-MM-DDTHH-mm-ss.json (colon-free, UTC).
- **Audit log** — JSON-lines, append-only with O_APPEND, separate from the application log. Gives Gate 4's "Recent edits" a real source.
- **Per-file schemas** — explicit shapes for all five overlay files matching the spec.
- **Locking** — advisory per-file lock with ~500 ms wait, 423 on contention. No global lock.
- **Castle lookup** — code-prefix beats name-substring, in-memory index loaded once at boot.
- **10 required tests** — auth, whitelist, schema fail, cross-ref fail, happy path with on-disk verification, stale etag race, lock contention, backup-first invariant, empty file, lookup.
- **Five curl checks** for manual verification.
- **Anti-patterns** — no per-key endpoints, no write-then-backup, no global lock, no per-request reads of the catalogue.
- **Closure** — Gate 2 closes as its own PR; do not roll into Gate 4.

There's also a deliberate cross-reference at the end: if Claude Code finds a mismatch between Gate 2's response shapes and Gate 4's expectations, align Gate 2 to the editor, not the reverse. The editor is closer to the user.

That completes the trio: Gate 1+3, Gate 2, Gate 4. Ready to hand to Claude Code in dependency order — Gate 2 first (no UI), then Gate 4 (consumes Gate 2), with Gate 1+3 already merged.