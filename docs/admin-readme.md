# Editorial Annex - Admin Guide

The editorial annex is a protected section of the Topcastles site for managing the five editorial overlay files. It is reached at `/admin`.

## Signing In

The passphrase is the value of `ADMIN_TOKEN` in the server's `.env` file. There is no username/password pair; the passphrase is the token.

1. Navigate to `/admin`; you are redirected to `/admin/login`.
2. Enter any name in **Editor handle**. This is stored locally and shown in the utility bar; it is not validated by the server.
3. Paste the `ADMIN_TOKEN` value into **Passphrase**.
4. Check **Trust this device for 7 days** if you want to stay signed in without re-entering the passphrase.
5. Click **Open the annex**.

On success you land on the editorial overview at `/admin/editorial`.

| What you see | Cause |
| --- | --- |
| "Unrecognised handle or passphrase." | Wrong token, or `ADMIN_TOKEN` is not set on the server. |
| "Could not reach the annex server." | Server is down or network error. |

Click **Sign out** in the utility bar to clear your local token immediately.

## Editorial Shell

Once signed in, every admin page shows:

- **Utility bar**: editor handle and sign-out button.
- **Standard masthead and nav**: public site chrome plus an **Editorial** tab.
- **Side navigation**: links to the overview and each overlay file.
- **Prerender notice**: a persistent warning that runtime overlay changes are not baked into prerendered pages until the next build/deploy cycle.

The shell forces dark mode regardless of system preference.

## Editorial Overview

The overview at `/admin/editorial` shows:

- ledger counts for files, recorded keys, country-note coverage, and backups on disk
- one row for each overlay file, linked to its per-file editor
- recent backup entries
- publish/build handoff status added in Gate 5

Rows with no content show an `EMPTY` badge. Rows where the API call failed show `FETCH ERROR`.

## Per-File Editors

Use the protected editors under `/admin/editorial/<file>`.

Each editor:

- loads one complete overlay JSON file
- presents a file-specific form
- validates the full next file state
- saves through `PUT /api/admin/editorial/:file`
- creates a backup of the previous file
- shows unsaved-change and prerender/build handoff warnings

Do not edit the files directly on the NAS volume once the editor is live unless you are doing an emergency repair and can verify the JSON afterwards.

## Overlay Files

All five files live in `/data/editorial/` on the NAS volume (`/volume1/docker/topcastles/data/editorial/`). They are served publicly via `/api/editorial/:file` with no authentication.

| File | Route slug | Purpose |
| --- | --- | --- |
| `countries.json` | `countries` | Editorial notes and defining traditions per country. Marks editorial sleeper countries. |
| `regions.json` | `regions` | One-sentence descriptions of named architectural regions. |
| `castle-quotes.json` | `castle-quotes` | Pull-quotes about specific castles with byline and date. |
| `period-picks.json` | `period-picks` | Editor's pick castle for each century in the period table. |
| `browse-bands.json` | `browse-bands` | Short notes above each rank band on the Top 1000 browse page. |

The pipeline never writes to these files. They are editor-owned. Changes take effect at runtime immediately; the running server serves the updated JSON without a restart. Prerendered output reflects those changes only after the next build.

## Admin API Endpoints

All `/api/admin/*` endpoints require:

```http
Authorization: Bearer <ADMIN_TOKEN>
```

| Endpoint | Description |
| --- | --- |
| `GET /api/admin/health` | Confirms the server is running and the token is valid. |
| `GET /api/admin/backups` | Lists editorial backup files, newest-first. |
| `GET /api/admin/castles/lookup?q=<term>` | Returns castle lookup rows used by editor autocomplete controls. |
| `PUT /api/admin/editorial/:file` | Saves one complete editorial overlay file, validates it, and creates a backup. |
| `GET /api/admin/pending-status` | Shows metadata for any staged `castles_enriched.json` upload. |
| `POST /api/admin/upload-enriched` | Stages a validated castle enrichment file for the next pipeline run. |

Example health check:

```bash
curl -s http://localhost:3000/api/admin/health \
  -H "Authorization: Bearer <your-token>"
```

## Token Storage

The browser stores the admin token at `localStorage` key `topcastles.admin.token`. This is separate from the public-user token (`tc_user_token`).

To sign out manually:

```js
localStorage.removeItem('topcastles.admin.token');
```

Refresh afterwards; you are redirected to `/admin/login`.

## Remaining Work

- Pipeline admin for castle edit/add, enrichment-script execution, introduction text editing, and rebuild trigger remains separate Spec Kit work.
- Rich semantic change summaries in Recent edits remain polish.
- Build timestamp wiring in the prerender notice remains future build-script work.
