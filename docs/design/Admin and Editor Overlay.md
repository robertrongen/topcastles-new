# Editorial Overlay System
The "editor" layer is a set of JSON files at /data/editorial/ that add curated content on top of the data pipeline output. The pipeline never touches these files.

Docs: [../editorial-overlay.md](../editorial-overlay.md)
Service: new_app/src/app/services/editorial.service.ts

## The Five Editorial Files
File	Purpose
countries.json	Per-country editorial notes, defining traditions, editor picks
regions.json	Regional descriptions, editor sleeper flags
castle-quotes.json	Pull quotes with author/role/date per castle
period-picks.json	One featured castle per historical era
browse-bands.json	Notes per rank band (1-100, 101-500, 501-1000)
Public Read API
server/routes/editorial.js — no auth required:


curl http://localhost:3000/api/editorial/countries
curl http://localhost:3000/api/editorial/castle-quotes
curl http://localhost:3000/api/editorial/period-picks
Returns {} if the file doesn't exist yet. The Angular app fetches these after SSR hydration (not in prerendered HTML).

## How to Edit Content
Right now there's no editor UI — you edit the JSON files directly in /data/editorial/ on the NAS volume (/volume1/docker/topcastles/data/editorial/). The changes are served immediately by the running server; no rebuild needed.

## What's Planned but Not Yet Built
From the roadmap (§15):

Admin UI shell with token login form
Form-based editorial overlay editor (§15.8)
Castle data editor, Wikipedia/Wikidata enrichment triggers, rebuild trigger

## Running the Tests

npm test                          # Angular unit tests (176 specs)
npm run test:smoke                # Server smoke tests
node server/routes/editorial.test.js  # Editorial API tests
The admin token validation and editorial read routes are the two main things you can exercise locally right now. The editor write endpoints (POST /api/admin/editorial/:file) are on the roadmap but not yet implemented.

# Plan and build task
- Goal: develop the Topcastles admin and editorial overlay system step-by-step, with approval gates before each implementation phase.
- Context: editorial overlay files live in `/data/editorial/`, are editor-owned runtime JSON, and must never be written by the data pipeline. Public reads already exist at `/api/editorial/:file`; missing files return `{}`. The admin editor must show the prerender warning because overlay data appears after hydration, not in prerendered HTML. See [../editorial-overlay.md](../editorial-overlay.md).
- Current server reference: `server/routes/editorial.js` already whitelists the five public read endpoints and rejects unknown files. :contentReference[oaicite:1]{index=1}
- Existing admin reference: `server/routes/admin.js` already protects `/api/admin/...` with `adminAuth` and contains staged upload endpoints. Extend this pattern, do not bypass it. :contentReference[oaicite:2]{index=2}

Follow
- Use the Topcastles prompt workflow: Bead → Graphify → Context → Implementation → Verification → Closure. :contentReference[oaicite:3]{index=3}
- Because this is admin API/admin UI work, use the fuller Spec Kit flow: bead first, Graphify first, context bundle first, then clarify → plan → tasks → analyze before coding. :contentReference[oaicite:4]{index=4}

## Approval gates

### Gate 1 — Admin shell foundation
- Claim bead: `topcastles-1tt`
- Implement `/admin/login` and protected `/admin`
- Store admin token under a distinct localStorage key
- Hide admin navigation from regular users
- Verify `/api/admin/...` rejects missing or invalid Bearer tokens
- Stop and report before moving to Gate 2

### Gate 2 — Editorial write API
- Create or claim a bead for the API if needed, or use `topcastles-46h` only if the scope remains reviewable
- Add `POST /api/admin/editorial/:file`
- Allow only: `countries`, `regions`, `castle-quotes`, `period-picks`, `browse-bands`
- Before every write, create `/data/editorial/backups/<file>-<timestamp>.json`
- Write with `json-store.js`
- Validate plain-object shape; reject arrays and unknown file names
- Add focused server tests, following the style of `server/routes/editorial.test.js`. :contentReference[oaicite:5]{index=5}
- Stop and report before moving to Gate 3

### Gate 3 — Editorial editor UI shell
- Claim bead: `topcastles-46h`
- Add protected route `/admin/editorial`
- Add five sections, one per overlay file
- Load existing JSON through public read API or protected admin read if added
- Show warning on all sections: “not yet published to prerendered pages — rebuild required”
- Do not implement complex form editing yet
- Stop and report before moving to Gate 4

### Gate 4 — Form editors
- Implement section-by-section:
  1. Countries editor
  2. Regions editor
  3. Castle quotes editor
  4. Period picks editor
  5. Browse bands editor
- Use castle-code autocomplete where required
- Save per section only
- Show success and error states
- Missing overlay data should show an admin warning, not break the page
- Stop and report before moving to Gate 5

### Gate 5 — Integration polish
- Connect the editor with existing `EditorialService`
- Confirm public pages degrade gracefully when overlay files are missing
- Confirm no pipeline script writes to `/data/editorial/`
- Confirm no runtime mutation of built or prerendered artifacts

## Non-goals
- No rebuild trigger yet
- No Wikipedia/Wikidata enrichment trigger yet
- No castle data editor yet
- No database
- No NgRx
- No changes to pipeline ownership boundaries
- No broad style-system sweep
- No unrelated page redesigns

## Required verification per gate
- `npm test`
- `npm run build`
- `npm run test:smoke`
- `node server/routes/editorial.test.js`
- Add and run new admin/editorial write tests when the write API is implemented
- Manual curl checks:
  - missing/invalid admin token returns 401
  - unknown editorial file returns 404
  - missing public overlay file returns `{}`
  - valid admin write creates a backup and updates the target file

## Closure
- Close only the bead completed in the current gate
- `git pull --rebase`
- `bd dolt push`
- `git push`
- `git status`
- Confirm branch is clean and up to date with origin
