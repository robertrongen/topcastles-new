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

## Related documentation

- `README.md` — project overview and local commands
- `docs/setup.md` — stack and deployment target
- `docs/pipeline.md` — build and deployment pipeline
