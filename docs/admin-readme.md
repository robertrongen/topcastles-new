# Editorial Annex — Admin Guide

The editorial annex is a protected section of the Topcastles site for managing the five editorial overlay files. It is reached at `/admin`.

---

## Signing in

### What you need

The passphrase is the value of `ADMIN_TOKEN` in the server's `.env` file. There is no username/password pair — the passphrase is the token.

```
ADMIN_TOKEN=cZzwZla3ODH/09SHmGGPmM928rzbUqkUNqJVRvtf3IbFJ0jfv9uv8Th8ciW++YZ0
```

### Steps

1. Navigate to `/admin` — you are redirected to `/admin/login`.
2. Enter any name in **Editor handle** (this is stored locally and shown in the utility bar; it is not validated by the server).
3. Paste the `ADMIN_TOKEN` value into **Passphrase**.
4. Check **Trust this device for 7 days** if you want to stay signed in without re-entering the passphrase.
5. Click **Open the annex**.

On success you land on the Editorial overview at `/admin/editorial`.

### Errors

| What you see | Cause |
|---|---|
| "Unrecognised handle or passphrase." | Wrong token, or `ADMIN_TOKEN` is not set on the server. |
| "Could not reach the annex server." | Server is down or network error. |

### Signing out

Click **Sign out** in the narrow utility bar at the top of every admin page. This clears your local token immediately.

---

## The editorial annex shell

Once signed in, every admin page shows three persistent elements:

- **Utility bar** (dark strip above the masthead) — shows your editor handle and sign-out button.
- **Standard masthead and nav** — identical to the public site, with an additional **Editorial** tab that links back to the overview.
- **Side navigation** (220 px left column) — links to each overlay file and to reference pages.

The shell forces dark mode regardless of your system preference.

---

## The Editorial tab

The **Editorial** tab appears in the olive navigation band only when you are signed in. It disappears completely from the DOM when you are signed out — it is not merely hidden.

---

## Editorial overview (`/admin/editorial`)

The overview page shows:

### Prerender notice

A persistent red-ruled callout that appears on every editorial page. It reminds you that overlay changes take effect immediately at runtime but are **not** reflected in prerendered pages until the next full build and deployment. It cannot be dismissed.

### Ledger strip

Four summary cells:

| Cell | What it shows |
|---|---|
| Files | How many of the five overlay files contain at least one key |
| Keys recorded | Total count of keys across all five files |
| Coverage | What percentage of catalogued countries have editorial notes |
| Backups on disk | Count of backup files in `/data/editorial/backups/` |

### Files table

A table of the five overlay files. Each row shows:

- The file name (links to the per-file editor — coming in Gate 4)
- The file's editorial purpose
- How many keys are recorded
- When the file was last edited (derived from the most recent backup)
- An **Open →** link

Rows with no content show an `EMPTY` badge. Rows where the API call failed show `FETCH ERROR` in the keys cell.

Clicking anywhere on a row navigates to the per-file editor page.

### Recent edits

The six most recent backup entries. Each row shows when the backup was created and which file it belongs to. The "verb phrase" field currently shows "wrote backup of" as a placeholder — detailed change summaries are planned for Gate 4.

If no backups exist yet, this section shows: *"No editorial edits yet. Open a file to begin."*

---

## The five overlay files

All five files live in `/data/editorial/` on the NAS volume (`/volume1/docker/topcastles/data/editorial/`). They are served publicly via `/api/editorial/:file` with no authentication.

| File | Route slug | Purpose |
|---|---|---|
| `countries.json` | `countries` | Editorial notes and defining traditions per country. Marks editorial sleeper countries. |
| `regions.json` | `regions` | One-sentence descriptions of named architectural regions. |
| `castle-quotes.json` | `castle-quotes` | Pull-quotes about specific castles with byline and date. |
| `period-picks.json` | `period-picks` | Editor's pick castle for each century in the period table. |
| `browse-bands.json` | `browse-bands` | Short notes above each rank band on the Top 1000 browse page. |

### Key rule

The pipeline never writes to these files. They are editor-owned. Changes take effect at runtime immediately — the running server serves the updated JSON without a restart.

### Editing content (current method — Gate 2/4 pending)

Until the form editors ship (Gate 4), edit the JSON files directly on the NAS volume and the server picks up the changes immediately.

```bash
# SSH to NAS, then:
nano /volume1/docker/topcastles/data/editorial/countries.json
```

Alternatively, use `POST /api/admin/editorial/:file` once the write API ships in Gate 2.

---

## Admin API endpoints

All `/api/admin/*` endpoints require the header:

```
Authorization: Bearer <ADMIN_TOKEN>
```

A missing or incorrect token returns `401 Unauthorized`.

| Endpoint | Description |
|---|---|
| `GET /api/admin/health` | Confirms the server is running and the token is valid. Returns `{ status: "ok", auth: "admin" }`. |
| `GET /api/admin/backups` | Lists editorial backup files, newest-first. Returns an array of `{ file, timestamp, filename }` objects. |
| `GET /api/admin/pending-status` | Shows metadata for any staged `castles_enriched.json` upload. |
| `POST /api/admin/upload-enriched` | Stages a validated castle enrichment file for the next pipeline run. |

### Example: verify your token

```bash
curl -s http://localhost:3000/api/admin/health \
  -H "Authorization: Bearer <your-token>"
# → {"status":"ok","auth":"admin"}
```

### Example: list backups

```bash
curl -s http://localhost:3000/api/admin/backups \
  -H "Authorization: Bearer <your-token>"
# → [{"file":"countries","timestamp":1746274027000,"filename":"countries-1746274027000.json"},…]
```

---

## Token storage

The browser stores the admin token at `localStorage` key `topcastles.admin.token`. This is separate from the public-user token (`tc_user_token`). To sign out manually, open browser DevTools and run:

```js
localStorage.removeItem('topcastles.admin.token');
```

Then refresh — you are redirected to `/admin/login`.

---

## What is not yet built (Gate 4+)

- Per-file form editors (Gate 4)
- Write API: `POST /api/admin/editorial/:file` (Gate 2)
- Detailed change summaries in Recent edits (Gate 4)
- Live key counts in the side navigation (Gate 4)
- Build timestamp in the prerender notice (requires build-script wiring)
