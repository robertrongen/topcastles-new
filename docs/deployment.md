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
  -v /volume1/docker/topcastles/data:/data \
  -v /volume1/docker/topcastles/images/castles:/data/castle-images:ro \
  hobunror/topcastles:latest
```

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

## Related documentation

- `README.md` — project overview and local commands
- `docs/setup.md` — stack and deployment target
- `docs/pipeline.md` — build and deployment pipeline
