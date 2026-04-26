# Deployment to Synology NAS

This document explains the current deployment flow implemented in `deploy.sh`.
It uses Docker Hub as the image distribution mechanism and deploys the image to a
Synology NAS over SSH.

## Overview

The deployment script performs these steps:

1. Builds the Angular application from `new_app/`
2. Builds a Docker image from the repository root
3. Tags the image as `hobunror/topcastles:latest`
4. Pushes the image to Docker Hub
5. Connects to the Synology NAS over SSH
6. Preflights the NAS castle image source directory
7. Pulls the image from Docker Hub on the NAS
8. Stops and removes the existing container if present
9. Starts a new container from the pulled image

Script location:

```bash
./deploy.sh
```

## How to run the deployment

Open a **Git Bash** terminal (not PowerShell or CMD) in VS Code and run from the repository root:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
bash deploy.sh
```

The `ssh-agent` step caches the SSH key passphrase so the script can connect to the NAS without prompting.

## Prerequisites

### Local machine

- Git Bash terminal (Windows)
- Docker Desktop running
- Node.js and npm installed
- Repository dependencies installed in `new_app/`
- Logged in to Docker Hub: `docker login`
- SSH key added to the agent (see above)
- Local machine can resolve `DS224plus.local`

### Synology NAS

- SSH enabled: DSM → Control Panel → Terminal & SNMP → Terminal → Enable SSH
- SSH key authentication configured for `robertron`
- Docker/Container Manager installed
- `robertron` has passwordless sudo for docker:

```bash
echo "robertron ALL=(ALL) NOPASSWD: /usr/local/bin/docker" | sudo tee /etc/sudoers.d/robertron-docker
```

- Port `8082` available on the NAS
- Castle image source directory exists and is readable/listable:
  `/volume1/docker/topcastles/images/castles`

## Step-by-step behavior

### 1. Build the Angular app

```bash
npm run build
```

Produces browser files in `new_app/dist/new_app/browser/`.

### 2. Build the Docker image

```bash
docker build -t hobunror/topcastles:latest .
```

The `Dockerfile` copies the Angular build output into the Node runtime image.

### 3. Push to Docker Hub

```bash
docker push hobunror/topcastles:latest
```

### 4. Preflight the NAS image source

Before pulling or replacing the running container, `deploy.sh` verifies that
`/volume1/docker/topcastles/images/castles` exists on the NAS, is a readable and
listable directory, and contains image files. The script fails early with an
actionable error if the path is missing, points at the wrong location, or is not
available as expected.

### 5. Pull and redeploy on the NAS

Over SSH, the script runs:

```bash
sudo docker pull hobunror/topcastles:latest
sudo docker stop topcastles || true
sudo docker rm topcastles || true
mkdir -p /volume1/docker/topcastles/data
sudo docker run -d --restart unless-stopped --name topcastles \
  -p 8082:3000 \
  -e ADMIN_TOKEN=<your-secret-token> \
  -v /volume1/docker/topcastles/data:/data \
  -v /volume1/docker/topcastles/images/castles:/data/castle-images:ro \
  hobunror/topcastles:latest
```

> **`ADMIN_TOKEN`** must be set at runtime — it is not baked into the Docker image.
> If omitted, all `/api/admin/*` routes return 401. The server logs a warning at startup if the token is not configured.

## Resulting deployment topology

| Layer | Detail |
| --- | --- |
| Docker Hub image | `hobunror/topcastles:latest` |
| Container name on NAS | `topcastles` |
| NAS local port | `8082` |
| Container port | `3000` |
| Runtime data mount | `/volume1/docker/topcastles/data` -> `/data` |
| Castle image mount | `/volume1/docker/topcastles/images/castles` -> `/data/castle-images` (read-only) |
| LAN URL | `http://DS224plus.local:8082` |
| HTTPS LAN URL | via Synology Reverse Proxy (see below) |
| Public URL | `https://topcastles.hobunror.synology.me` |

## Network and HTTPS setup

### Synology Reverse Proxy (LAN + public HTTPS)

DSM → Control Panel → Application Portal → Reverse Proxy → Create:

| Field | Value |
| --- | --- |
| Description | topcastles |
| Source protocol | HTTPS |
| Source hostname | `topcastles.hobunror.synology.me` |
| Source port | `443` |
| Destination protocol | HTTP |
| Destination hostname | `localhost` |
| Destination port | `8082` |

Synology's wildcard certificate covers `*.hobunror.synology.me` automatically.

### Router port forwarding

Forward these ports from your router to the NAS local IP:

| External port | Internal port | Protocol |
| --- | --- | --- |
| 80 | 80 | TCP |
| 443 | 443 | TCP |

Find the NAS local IP in DSM → Control Panel → Network → Network Interface.

### DDNS

DSM → Control Panel → External Access → DDNS — verify `hobunror.synology.me` shows a green status and points to your current public IP.

## Troubleshooting

### App does not load after container start

The Dockerfile must copy the Angular browser output into the runtime image. Check
the `COPY --from=build` line in `Dockerfile` and the Node server logs.

### `docker push` fails with authentication errors

```bash
docker login
```

Verify the repository `hobunror/topcastles` exists on Docker Hub and the account has push access.

### NAS image preflight fails

Verify `/volume1/docker/topcastles/images/castles` exists on the NAS, contains
the castle image files, and is readable/listable by the deploy SSH user. The
deployment script will not create this directory automatically because an empty
bind mount would hide image-serving misconfiguration until after rollout.

### Runtime image mount warning

At startup, the Node server logs whether `/data/castle-images` is usable. The
same status is included in `/api/health` under `imageMount` so a missing or
unreadable mount is visible even if the server is otherwise healthy.

### `permission denied` connecting to Docker socket on the NAS

The `robertron` user lacks sudo rights for docker. Add the sudoers entry:

```bash
echo "robertron ALL=(ALL) NOPASSWD: /usr/local/bin/docker" | sudo tee /etc/sudoers.d/robertron-docker
```

### `ssh` cannot resolve `DS224plus.local`

- Use the NAS IP address instead of `DS224plus.local`
- Or ensure mDNS/local hostname resolution is configured on your machine

### SSH passphrase prompt blocks the script

Load the key into the agent before running:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

## Expected `/data` structure

The container expects a single persistent volume mounted at `/data`. The NAS host
path is `/volume1/docker/topcastles/data` (created by `deploy.sh` via `mkdir -p`
before the container starts).

```
/data/
├── users.json          # written on first user registration; absent until then
├── pending/            # created on first upload-enriched call; absent until then
│   ├── castles_enriched.json   # staged upload, consumed by developer machine
│   └── meta.json               # upload metadata (recordCount, uploadedAt)
└── castle-images/      # read-only bind mount (NAS source: images/castles/)
    ├── <code>.jpg          # primary castle photo (e.g. 1.jpg)
    ├── <code>2.jpg         # additional photos (e.g. 12.jpg)
    ├── small/
    │   └── <code>_small.jpg  # thumbnail used in list views
    └── ...
```

**`/data/users.json`** is created lazily — the server does not write it at startup.
The first call to `POST /api/user/register` creates the file. If the file is absent,
`GET /api/user/login` and `GET /api/user/me` behave correctly (no users → 401).

**`/data/castle-images`** is mounted read-only from the NAS. The server checks at
startup whether the mount is available and contains image files. The result is logged
to stdout and included in `GET /api/health` under the `imageMount` key.

### Startup log reference

On a healthy start you will see lines like:

```
TopCastles server listening on port 3000
/castle-images mounted from /data/castle-images
[image-mount] ok: image mount is available (/data/castle-images)
[data-mount] ok: users.json present (/data/users.json)
```

On a fresh deployment (no prior registrations):

```
[data-mount] notice: users.json not yet created — will be written on first registration (/data/users.json)
```

On a missing or empty image mount:

```
[image-mount] warning: image mount is readable but no image files were found (/data/castle-images)
```

## Operational verification

After deployment, run the following checks from a machine that can reach the NAS.

### 1. Health endpoint

```bash
curl -s http://DS224plus.local:8082/api/health | python3 -m json.tool
```

Expected:

```json
{
  "status": "ok",
  "imageMount": {
    "path": "/data/castle-images",
    "available": true,
    "status": "ok",
    "message": "image mount is available"
  }
}
```

### 2. SPA shell

```bash
curl -s -o /dev/null -w "%{http_code}" http://DS224plus.local:8082/
```

Expected: `200`

### 3. API data

```bash
curl -s -o /dev/null -w "%{http_code}" http://DS224plus.local:8082/api/index.json
```

Expected: `200`

### 4. Image serving

```bash
# Replace 1.jpg with a known file in the NAS image directory
curl -I http://DS224plus.local:8082/castle-images/1.jpg
```

Expected: `HTTP/1.1 200 OK` with `Cache-Control: public, max-age=86400`

Missing file returns `404`:

```bash
curl -s -o /dev/null -w "%{http_code}" http://DS224plus.local:8082/castle-images/__nonexistent__.jpg
```

Expected: `404`

### 5. Automated smoke tests

Run the full suite against a live server:

```bash
npm run test:smoke -- http://DS224plus.local:8082
```

Or locally during development:

```bash
npm run dev:server &
npm run test:smoke -- http://localhost:3000
```

The script exits 0 on pass, 1 on any failure. Checks covered:

| Check | Expected |
|---|---|
| `GET /` | 200 |
| `GET /api/health` | 200 + `{ status: "ok" }` |
| `GET /api/index.json` | 200 |
| Unknown route (`/this-route-does-not-exist-xyz`) | 200 + SPA HTML |
| Deep link (`/castle/1`) | 200 |
| Missing image (`/castle-images/__nonexistent__`) | 404 |
| `GET /` with `Accept-Encoding: gzip` | gzip content-encoding |
| `GET /api/admin/health` (no token) | 401 + `{ "error": "Unauthorized" }` |
| `GET /api/admin/health` (valid token) | 200 + `{ "status": "ok", "auth": "admin" }` |
| `GET /api/admin/pending-status` | 200 or 404 (endpoint live) |
| `POST /api/admin/upload-enriched` (no token) | 401 |
| `POST /api/admin/upload-enriched` (wrong Content-Type) | 415 |
| `POST /api/admin/upload-enriched` (empty array) | 400 |
| `POST /api/admin/upload-enriched` (< 500 records) | 400 |
| `POST /api/admin/upload-enriched` (missing `castle_code`) | 400 |
| `POST /api/admin/upload-enriched` (duplicate `castle_code`) | 400 |
| `POST /api/admin/upload-enriched` (invalid lat/lng) | 400 |
| `POST /api/admin/upload-enriched` (unsorted `score_total`) | 400 |
| `POST /api/admin/upload-enriched` (production-size payload) | 200 + `{ recordCount: N }` |
| `GET /api/admin/pending-status` (after upload) | 200 + `{ recordCount: N, uploadedAt }` |

When `ADMIN_TOKEN` is set in the test environment, the suite also runs the upload-enriched
checks using the actual `new_app/src/assets/data/castles_enriched.json` as the payload.

### 6. Admin API authentication

Verify the auth boundary is enforced:

```bash
# Without token → must return 401
curl -s http://DS224plus.local:8082/api/admin/health
```

Expected:

```json
{"error":"Unauthorized"}
```

```bash
# With valid token → must return 200
curl -s -H "Authorization: Bearer <your-secret-token>" \
  http://DS224plus.local:8082/api/admin/health
```

Expected:

```json
{"status":"ok","auth":"admin"}
```

If the first command returns 200 (no auth required), `ADMIN_TOKEN` is not set in the container environment — stop and fix before proceeding.

## Runtime environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server listen port |
| `USERS_FILE` | `/data/users.json` | Path to user data file |
| `CASTLE_IMAGE_PATH` | `/data/castle-images` | Path to castle image directory |
| `DATA_DIR` | `/data` | Root of the runtime data volume; pending uploads are written to `$DATA_DIR/pending/` |
| `ADMIN_TOKEN` | _(not set)_ | Bearer token for `/api/admin/*`. If unset, all admin routes return 401. |

`ADMIN_TOKEN` is never baked into the Docker image. It must be injected at runtime via `-e ADMIN_TOKEN=<value>` or equivalent Synology Container Manager environment settings.

## Service Worker

The production build includes Angular's NGSW service worker (`ngsw-worker.js`). It is
registered automatically via `provideServiceWorker` in `app.config.ts`, enabled only
in production, with a 30-second stable-delay registration strategy.

### What is cached

| Asset group | Strategy | Content |
|---|---|---|
| `app` | Precache on install, update on SW version change | SPA shell, JS/CSS bundles, manifest, favicon |
| `data` | Lazy cache on first use, re-fetch on SW update | `castles.json`, `castles_delta.json` |
| `assets-icons` | Lazy cache | PWA icons (`/icons/*.png`) |
| `assets-fonts` | Lazy cache | Font and SVG files from build output |

### What is never cached by the SW

- **`/castle-images/*`** — NAS-served photos are intentionally excluded from all NGSW
  asset groups. The Node server's `Cache-Control: max-age=86400` header is the correct
  caching mechanism. The service worker does not intercept these requests.
- **`/api/*`** — All runtime API routes are network-only. The SW has no data group
  for API traffic.

### Cache invalidation

The NGSW uses content hashes in `ngsw.json` (generated at build time). When a new
Docker image is deployed with changed assets, the SW detects the updated `ngsw.json`
on the next navigation and re-fetches changed files in the background. The new version
activates on the subsequent navigation — no user action required.

Content-only changes (data pipeline regeneration) do not propagate to browsers until
a full Docker image rebuild and redeployment, consistent with ADR-010.

### Post-deploy verification checklist

Run these checks after each deployment to confirm the service worker and PWA are
working correctly. Use Chrome or Edge (Chromium) for DevTools fidelity; Safari
has independent SW tooling in the Develop menu.

**1. Confirm files are served**

```bash
curl -sI https://topcastles.hobunror.synology.me/ngsw-worker.js | grep -i "content-type\|cache-control"
curl -sI https://topcastles.hobunror.synology.me/ngsw.json      | grep -i "content-type\|cache-control"
curl -sI https://topcastles.hobunror.synology.me/manifest.webmanifest | grep -i "content-type"
```

Expected: `ngsw-worker.js` and `ngsw.json` served as `application/javascript` /
`application/json` with no aggressive long-lived caching (the Node server does not
add `Cache-Control` to these files, so the browser revalidates on each navigation).

**2. Confirm SW registers in DevTools**

Open Chrome → DevTools → Application → Service Workers. After the first visit:

- Status shows **activated and running**
- Source shows `ngsw-worker.js`
- No script errors in the Console

**3. Confirm manifest is linked**

DevTools → Application → Manifest:

- Name: `Top 1000 Medieval Castles`
- 8 icons listed (72 px – 512 px, `maskable`)
- `display: standalone`, `start_url: /`
- No "Add to Home Screen" eligibility errors

**4. Confirm cache groups**

DevTools → Application → Cache Storage — after loading the home page and at
least one castle detail page you should see three populated caches:

| Cache name pattern | Expected content |
|---|---|
| `ngsw:…:assets:app:cache` | SPA shell JS/CSS bundles, manifest, favicon |
| `ngsw:…:assets:data:cache` | `castles.json`, `castles_delta.json` |
| `ngsw:…:assets:assets-icons:cache` | 8 PWA icon PNGs |

The `assets-fonts` group will be empty — there are no font files in the build
output (Material Symbols uses the CDN path, not bundled files).

**5. Confirm castle images are not cached by the SW**

DevTools → Network tab, filter by `/castle-images/`. Images should show `200`
(served from network or browser HTTP cache) but must **not** appear in the NGSW
cache storage. The Node server's `Cache-Control: max-age=86400` header is the
correct caching layer for these files.

**6. Confirm offline navigation fallback**

In DevTools → Application → Service Workers, check **Offline**. Reload any SPA
route (e.g. `/castles`). The page should load from the SW cache. Castle photos
will be blank (expected — they are network-only). Uncheck Offline when done.

### Confirming SW update propagation

NGSW detects a new version when `ngsw.json` changes between navigations. To
verify that a fresh deploy is reaching clients:

1. After deploying, open the site in Chrome with DevTools open.
2. Application → Service Workers — if a **waiting** worker appears alongside
   the active one, the update was detected. The waiting worker activates on the
   next navigation (no `skipWaiting` is configured).
3. Navigate to another route (e.g. `/castles` → `/`) — the waiting worker
   should activate and the status should show **activated and running** for the
   new version only.
4. Verify the page reflects the new build (check bundle filename hash in
   Network, or use the Console: `navigator.serviceWorker.controller.scriptURL`).

### Stale-cache identification and recovery

**Identifying stale-cache reports from users**

A user sees outdated content if their SW is serving a cached version of
`castles.json` that predates the latest deploy. Ask the user:

- Which browser and version?
- Does a hard reload (`Ctrl+Shift+R` / `Cmd+Shift+R`) fix it?
- In DevTools → Application → Service Workers, what is the SW script URL and
  install date?

**Operator recovery steps**

If users consistently report stale content after a deploy:

1. Verify `ngsw.json` on the production host is actually the new version:
   ```bash
   curl -s https://topcastles.hobunror.synology.me/ngsw.json | python3 -m json.tool | grep "timestamp\|appData"
   ```
2. If the old `ngsw.json` is still being served, the Docker image may not have
   been updated — confirm `docker ps` on the NAS shows the expected image digest.
3. If the SW is stuck in **waiting** state for a specific user, ask them to
   close all Topcastles tabs and reopen — this triggers SW activation without
   needing a hard reload.
4. Last resort: ask the user to go to DevTools → Application → Service Workers →
   **Unregister**, then hard-reload. This clears all NGSW caches and forces a
   fresh install of the new SW.
5. If the issue is widespread, increment `appData.version` in `ngsw-config.json`
   (a string like `"2"` → `"3"`) and redeploy — NGSW treats this as a forced
   update even if asset hashes have not changed.

## Admin upload flow (enriched castle data)

The `/api/admin/upload-enriched` endpoint lets an admin stage a refreshed
`castles_enriched.json` on the NAS without modifying any built asset in place.
The developer machine then consumes the staged file and runs the normal pipeline
and deploy.

### When to use

Use this flow when you have a new or corrected `castles_enriched.json` and want
to push it to production without manually copying it to the developer machine
first. Upload it through the API, verify it was staged, then pull it to your
machine and proceed with the standard pipeline.

> **Boundary rule:** The NAS runtime only stores the staged file. It never runs
> `npm run data:regenerate`, `npm run build`, or `./deploy.sh`. All pipeline and
> build work runs on the developer machine.

### Step 1 — Verify the admin token is configured

```bash
curl -s http://DS224plus.local:8082/api/admin/health \
  -H "Authorization: Bearer <your-secret-token>"
```

Expected: `{"status":"ok","auth":"admin"}`. If this returns 401, `ADMIN_TOKEN`
is not set in the running container — fix the container environment before
continuing.

### Step 2 — Upload the enriched file

```bash
curl -s -X POST http://DS224plus.local:8082/api/admin/upload-enriched \
  -H "Authorization: Bearer <your-secret-token>" \
  -H "Content-Type: application/json" \
  -d @new_app/src/assets/data/castles_enriched.json
```

Expected response:

```json
{"recordCount": 1000, "uploadedAt": "2026-04-26T12:00:00.000Z"}
```

The endpoint validates the payload before writing. It rejects uploads that:

- are not a JSON array
- contain fewer than 500 records (guards against accidental subset uploads)
- have a missing or empty `castle_code` on any element
- have duplicate `castle_code` values
- have `latitude` or `longitude` that is neither a number nor `null`
  (some castles legitimately have `null` coordinates)
- are not sorted by `score_total` descending (required by the generation pipeline)

On validation failure the server returns `400` with an error message and writes
nothing to disk.

### Step 3 — Confirm the pending upload

```bash
curl -s http://DS224plus.local:8082/api/admin/pending-status \
  -H "Authorization: Bearer <your-secret-token>"
```

Expected:

```json
{"uploadedAt": "2026-04-26T12:00:00.000Z", "recordCount": 1000, "uploadedBy": "admin"}
```

If this returns `404`, no upload has been staged yet.

### Step 4 — Pull the pending file to the developer machine

Run on the **developer machine** (Git Bash):

```bash
scp robertron@DS224plus.local:/volume1/docker/topcastles/data/pending/castles_enriched.json \
  new_app/src/assets/data/castles_enriched.json
```

This replaces the local `castles_enriched.json` with the staged upload. Inspect
the diff before proceeding if you want to verify the changes:

```bash
git diff new_app/src/assets/data/castles_enriched.json
```

### Step 5 — Run the pipeline on the developer machine

```bash
npm run data:lean
npm run data:api
npm run data:sitemap
npm run data:routes
npm run build
```

Or use the canonical all-in-one command followed by build:

```bash
npm run data:regenerate
npm run build
```

> `data:regenerate` re-runs conversion and enrichment scripts from the XLSX
> source, which will overwrite the uploaded `castles_enriched.json` with a
> freshly enriched version. Use the individual commands above if you want to
> build from the uploaded file exactly as staged.

### Step 6 — Deploy

```bash
bash deploy.sh
```

### Step 7 — Verify

After the new container is running, confirm the content is live:

```bash
# Health check
curl -s http://DS224plus.local:8082/api/health | python3 -m json.tool

# Full smoke suite
npm run test:smoke -- http://DS224plus.local:8082

# Spot-check: record count in the static API matches the upload
curl -s http://DS224plus.local:8082/api/castles.json | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d), 'records')"
```

### Step 8 — Archive or remove the pending file (optional)

Once the deploy is confirmed, the pending file is no longer needed. Remove it
from the NAS to avoid confusion:

```bash
ssh robertron@DS224plus.local \
  "rm /volume1/docker/topcastles/data/pending/castles_enriched.json \
      /volume1/docker/topcastles/data/pending/meta.json"
```

### Rollback procedure

| Scenario | Action |
|---|---|
| Upload staged, pipeline not yet run | Do nothing. The pending file has no effect until pulled and built. |
| Pipeline run, build failed | Fix the source data, re-run the pipeline, rebuild, and redeploy. The live container is untouched. |
| Bad data deployed (new container is live) | `git checkout <previous-commit> -- new_app/src/assets/data/castles_enriched.json`, re-run pipeline, rebuild, and redeploy. |
| Container crash during upload write | The endpoint uses an atomic write (`.tmp` + rename). A crash mid-write leaves a `.tmp` file; the target is not corrupted. The upload can be retried safely. |

To find the previous enriched file:

```bash
git log --oneline new_app/src/assets/data/castles_enriched.json
git checkout <sha> -- new_app/src/assets/data/castles_enriched.json
```

Then re-run the pipeline and deploy.

### Pending file location on the NAS

| File | Path |
|---|---|
| Staged enriched data | `/volume1/docker/topcastles/data/pending/castles_enriched.json` |
| Upload metadata | `/volume1/docker/topcastles/data/pending/meta.json` |

The `pending/` directory is created automatically by the server on the first
upload. It is inside the `/data` volume and is not part of the built image.

## Related documentation

- `README.md` — project overview and local commands
- `docs/setup.md` — stack and deployment target
- `docs/pipeline.md` — build and deployment pipeline
