# Topcastles Admin Guide

The Topcastles admin area is a protected environment for managing:

- editorial overlay content (B1)
- pipeline staging, rebuild requests, and data overrides (B2)

It is available at:

/admin

---

# Signing In

Authentication is token-based.

- The passphrase is the value of `ADMIN_TOKEN` in the server `.env`.
- There is no username/password system.

Steps:

1. Navigate to `/admin` → redirected to `/admin/login`
2. Enter any **Editor handle** (stored locally, not validated)
3. Paste the `ADMIN_TOKEN` into **Passphrase**
4. Optional: enable **Trust this device for 7 days**
5. Click **Open the annex**

On success you land on:

/admin/editorial

## Common errors

| Message | Cause |
|--------|------|
| Unrecognised handle or passphrase | Invalid or missing `ADMIN_TOKEN` |
| Could not reach the annex server | Server unavailable or network issue |

Use **Sign out** in the utility bar to clear the token.

---

# Admin Shell

All admin pages share a common shell:

- Utility bar with editor handle and sign-out
- Public site masthead and navigation
- Admin side navigation
- Persistent prerender notice
- Forced dark theme

The side navigation is the primary entry point for all admin functionality.

---

# Sections Overview

## 1. Editorial Overlay

Route:

/admin/editorial

This section manages editorial content stored separately from the data pipeline.

### Overview Page

Displays:

- number of overlay files present
- number of keys defined
- coverage (e.g. countries with notes)
- backups on disk
- per-file summary rows

### Per-file Editors

Routes:

/admin/editorial/<file>

Each editor:

- loads one complete JSON file
- validates full file state
- saves via API
- creates a backup
- shows prerender warnings

### Overlay Files

Location:

/data/editorial/

Files:

| File | Purpose |
|------|--------|
| countries.json | Country notes and traditions |
| regions.json | Region descriptions |
| castle-quotes.json | Editorial quotes |
| period-picks.json | Picks per century |
| browse-bands.json | Rank band notes |

Properties:

- runtime-only (not committed)
- served via `/api/editorial/:file`
- applied after client hydration
- pipeline never writes to them

---

## 2. Pipeline Admin

This section controls dataset staging, rebuild requests, and data overrides.

### Pipeline Status

Route:

/admin/pipeline

Displays:

- staged enriched dataset
- pipeline metadata
- rebuild request status
- operator instructions

This page is read-only except for requesting a rebuild.

---

## Rebuild Requests

A rebuild can be requested from the pipeline page.

This creates:

/data/pipeline/rebuild-request.json

The runtime does not execute the rebuild.

To process a request, run on the developer machine:

npm run pipeline:consume

This script:

- copies staged dataset
- runs full pipeline regeneration
- builds the Angular app
- updates metadata
- writes logs

Logs:

/data/pipeline/logs/<timestamp>-rebuild.log

Deployment is a separate manual step.

---

## Pipeline Runtime State

All pipeline admin state is stored under:

/data/pipeline/

Files:

| File | Purpose |
|------|--------|
| meta.json | Pipeline metadata |
| rebuild-request.json | Current request |
| rebuild-history.json | Request history |
| castle-overrides.json | Admin data overrides |
| logs/*.log | Rebuild logs |

---

## 3. Castle Overrides

Route:

/admin/castles

This editor allows correcting or adding castle data without modifying pipeline outputs directly.

### Storage

/data/pipeline/castle-overrides.json

### Key Rules

- Keys are existing `castle_code` values
- Canonical field names must be used
- Only approved fields are editable
- Overrides are long-lived
- Changes require rebuild to take effect

### Editable Fields

Examples:

- castle_name
- country
- latitude / longitude
- place
- region / region_code
- castle_type
- condition
- era
- founder
- description
- website

Not editable:

- scoring fields
- visitor metrics
- Wikipedia/Wikidata fields
- derived or ranking fields

### Behaviour

- overrides replace pipeline values during build
- override always wins in conflicts
- new castles can be created with minimal schema
- rebuild required for visibility

---

# Admin API

All endpoints require:

Authorization: Bearer <ADMIN_TOKEN>

## Core

| Endpoint | Description |
|--------|-------------|
| GET /api/admin/health | Health check |
| GET /api/admin/backups | Editorial backups |

## Editorial

| Endpoint | Description |
|--------|-------------|
| PUT /api/admin/editorial/:file | Save overlay file |

## Pipeline

| Endpoint | Description |
|--------|-------------|
| GET /api/admin/pipeline/status | Pipeline status |
| GET /api/admin/pipeline/rebuild-request | Current request |
| POST /api/admin/pipeline/rebuild-request | Create request |

## Castles

| Endpoint | Description |
|--------|-------------|
| GET /api/admin/castles/lookup | Search castles |
| GET /api/admin/castles/:code | Get data + override |
| PUT /api/admin/castles/:code | Save override |
| POST /api/admin/castles | Create new castle |

## Upload

| Endpoint | Description |
|--------|-------------|
| GET /api/admin/pending-status | Staged dataset metadata |
| POST /api/admin/upload-enriched | Stage enriched dataset |

---

# Runtime vs Build Boundary

The system enforces strict separation:

Runtime responsibilities:
- serve data
- accept uploads
- store metadata
- store overrides
- record rebuild requests

Build responsibilities:
- regenerate data
- apply overrides
- produce API files
- prerender pages

The runtime must never:

- run build scripts
- modify /dist
- modify /public/api
- mutate prerendered output

---

# Typical Workflow

1. Upload enriched dataset
2. Verify in /admin/pipeline
3. Request rebuild
4. Run:

npm run pipeline:consume

5. Deploy manually

---

# Token Storage

Stored in browser:

localStorage['topcastles.admin.token']

To clear:

localStorage.removeItem('topcastles.admin.token')

---

# Notes

- Editorial overlay changes are immediate at runtime
- Pipeline changes require rebuild
- Admin UI does not execute pipeline logic
- Overrides persist across rebuilds
