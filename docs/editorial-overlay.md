# Editorial Overlay

The editorial overlay is a set of editor-owned JSON files that provide editorial voice — notes, quotes, curated picks, and sleeper flags — across the Topcastles public site. These files are **separate from and never written by the data pipeline**.

## Why a separate overlay

The pipeline owns `castles_enriched.json` and regenerates it from the canonical XLSX source. Editorial content — a country's characterising note, an editor's quote about a specific castle, a starred pick for an era — is authored by the editor and must survive enrichment script runs. Mixing editorial voice into pipeline data creates a race condition: every enrichment run would overwrite it.

The overlay solves this by keeping editorial content in its own files. The app merges them with pipeline data at runtime. The pipeline never touches them.

## Runtime location

Editorial overlay files live at `/data/editorial/` inside the container — the same NAS-mounted volume that holds `/data/users.json`:

- Container path: `/data/editorial/`
- NAS path: `/volume1/docker/topcastles/data/editorial/`
- Local dev path: `data/editorial/` (gitignored; mirrors the NAS structure)

These files are **runtime-only** and are **not committed to git**. They must be initialised on first deployment — see Initialisation below.

## Availability and prerendering

Editorial overlay data is served by the Node runtime at `GET /api/editorial/:file`. Angular reads it at runtime after hydration.

**Prerendered pages do not include editorial overlay data.** SSR prerendering runs at build time; the `/data/editorial/` volume is not available during the build. Editorial content supplements the prerendered core castle data and appears after client-side hydration.

Consequence: the admin editorial editor must display a "not yet published to prerendered pages" warning. Changes are live immediately in the client-rendered view; they appear in the prerendered shell only after the next full build and deployment.

## File structure and schema

### countries.json

Keyed by ISO country code (uppercase, e.g. `"FR"`).

```json
{
  "FR": {
    "editorialNote": "The deepest catalogue. Where the castle becomes the château.",
    "definingTradition": "Renaissance · concentric",
    "topEntry": "fr001",
    "editorSleeper": false
  },
  "SY": {
    "editorialNote": "Tiny entry count; outrageously high editorial rank. The fabric is decisive.",
    "definingTradition": "Crusader concentric",
    "topEntry": "sy001",
    "editorSleeper": true
  }
}
```

Fields:

| Field | Type | Description |
|---|---|---|
| `editorialNote` | string | Short prose sentence characterising the country's castle tradition. Displayed in the Top Countries gazetteer table. |
| `definingTradition` | string | Short label (style · period). Displayed as italic metadata in the gazetteer table. |
| `topEntry` | string (castle code) | Castle code for the top editorial entry. Used as the "Top Entry" link in the gazetteer table. |
| `editorSleeper` | boolean | `true` when the country has a high editorial rank and low visitor traffic — triggers the "Editor's Sleeper" badge. |

---

### regions.json

Keyed by region slug (lowercase hyphenated, e.g. `"middle-rhine"`).

```json
{
  "middle-rhine": {
    "description": "The single densest concentration in the index. Editor's first.",
    "editorSleeper": false
  },
  "castilian-frontier": {
    "description": "Frontier fortresses of the Reconquista; severely underrated by visitors.",
    "editorSleeper": true
  }
}
```

Fields:

| Field | Type | Description |
|---|---|---|
| `description` | string | One sentence describing the region's architectural identity. Displayed on the Top Regions atlas card. |
| `editorSleeper` | boolean | `true` when the region has high editorial rank and low visitor traffic — triggers the "Editor's Sleeper" badge. |

---

### castle-quotes.json

Keyed by castle code (matching the `code` field in `castles_enriched.json`, e.g. `"eilean-donan"`).

```json
{
  "eilean-donan": {
    "quote": "Few entries draw their power so completely from setting. The keep itself is a 1930s reconstruction; what cannot be reconstructed is the meeting of three lochs at the foot of Skye. We rank it for where it is — and how rarely the two are confused.",
    "author": "J. Marwick",
    "role": "Contributing Editor",
    "date": "2026-04-21",
    "featuredUntil": "2026-04-28"
  },
  "krak-des-chevaliers": {
    "quote": "The most complete Crusader castle standing. Its concentric plan was copied by Edward I; its condition, given a century of intermittent war, is inexplicable.",
    "author": "R. Rongen",
    "role": "Editor",
    "date": "2026-05-01"
  }
}
```

Fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `quote` | string | yes | Editor's pull-quote. Plain prose, no markdown. Rendered in italic below the Wikipedia extract on the featured entry. |
| `author` | string | yes | Editor's name as it appears in the byline. |
| `role` | string | yes | Editor's role (e.g. `"Contributing Editor"`, `"Editor"`). |
| `date` | string | yes | ISO date the note was written (`YYYY-MM-DD`). |
| `featuredUntil` | string | no | ISO date (`YYYY-MM-DD`). If present and `>= today`, this castle overrides the deterministic daily algorithm as the homepage featured entry. Only one castle should have an active `featuredUntil`; if multiple entries qualify, the one with the latest `featuredUntil` wins. |

---

### period-picks.json

Keyed by era identifier string matching the `era` field in `castles_enriched.json` (e.g. `"9th c."`).

```json
{
  "9th c.": {
    "pick": "Hohensalzburg",
    "castleCode": "at001"
  },
  "12th c.": {
    "pick": "Krak des Chevaliers",
    "castleCode": "sy001"
  }
}
```

Fields:

| Field | Type | Description |
|---|---|---|
| `pick` | string | Castle name in display form. Rendered as `★ Krak des Chevaliers` in italic in the Period table Editor's pick column. |
| `castleCode` | string | Castle code for linking to the detail page. The admin editor should offer autocomplete against castle codes when editing this field. |

---

### browse-bands.json

Keyed by rank band label corresponding to the rank ranges shown on the Top 1000 browse page.

```json
{
  "1-100": {
    "note": "The canonical hundred: the most architecturally significant and best-preserved fortifications in the index."
  },
  "101-500": {
    "note": "The established middle: significant structures that fall just outside the most visited and most cited tier."
  },
  "501-1000": {
    "note": "The long tail: minor structures, fragments, or lesser-known fortifications that round out the thousand."
  }
}
```

Fields:

| Field | Type | Description |
|---|---|---|
| `note` | string | One-line editor's note in atlas register. Displayed above the tile grid for the matching rank band on the browse page. |

Band keys must match the rank ranges the browse page uses for pagination bands. The implementation bead (topcastles-chw) defines the exact key format.

---

## Merge model

The Angular app requests editorial overlay data from the Node server:

```
GET /api/editorial/countries      → /data/editorial/countries.json
GET /api/editorial/regions        → /data/editorial/regions.json
GET /api/editorial/castle-quotes  → /data/editorial/castle-quotes.json
GET /api/editorial/period-picks   → /data/editorial/period-picks.json
GET /api/editorial/browse-bands   → /data/editorial/browse-bands.json
```

If a file does not exist, the server returns `{}` with status 200. Components merge the returned object with computed signals using the relevant key (country code, region slug, castle code, era string, or rank band label).

## Graceful fallback

If a file is missing, a key is absent, the API returns an error, or a field value is an empty string:

- The editorial annotation, column, or badge is **omitted silently**.
- Core castle data renders normally.
- No error is shown to the public user.
- The admin editor shows a warning if no overlay data exists for a given file.

## Backup strategy

The Node server creates a timestamped backup of `/data/editorial/<file>.json` before every write:

```
/data/editorial/backups/<file>-<YYYY-MM-DDTHH-MM-SS>.json
```

Backups are not automatically pruned. Operator is responsible for periodic cleanup of the backups directory.

## Initialisation

On first deployment, create the directory structure and seed empty overlay files on the NAS:

```bash
# Run on NAS via SSH or Synology terminal
mkdir -p /volume1/docker/topcastles/data/editorial/backups
echo '{}' > /volume1/docker/topcastles/data/editorial/countries.json
echo '{}' > /volume1/docker/topcastles/data/editorial/regions.json
echo '{}' > /volume1/docker/topcastles/data/editorial/castle-quotes.json
echo '{}' > /volume1/docker/topcastles/data/editorial/period-picks.json
echo '{}' > /volume1/docker/topcastles/data/editorial/browse-bands.json
```

The admin editorial editor (§15.8) handles all subsequent writes through the API. Do not edit the files directly once the editor is live.

The `deploy.sh` mounts `DATA_DIR=/volume1/docker/topcastles/data` as `/data` in the container. No changes to `deploy.sh` are required — the editorial subdirectory is automatically available at `/data/editorial/` once created on the NAS.

## Ownership boundary

| What | Owner | Rule |
|---|---|---|
| `castles_enriched.json` | Pipeline | Enrichment scripts write it; editor never edits it directly |
| `/data/editorial/*.json` | Editor | Admin editor writes it; enrichment scripts never touch it |
| `/data/users.json` | Runtime | User account state; separate from editorial and pipeline |

This boundary must not be crossed. If enrichment scripts need editorial data (e.g. to generate richer static API output), they should read the overlay files as supplementary input — they must never write to them.
