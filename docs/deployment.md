# Deployment to Synology NAS

This document explains the current deployment flow implemented in `deploy.sh`.
It uses Docker Hub as the image distribution mechanism and deploys the image to a
Synology NAS over SSH.

## Overview

The deployment script performs these steps:

1. Builds the Angular application from `new_app/`
2. Builds a Docker image from the repository root
3. Tags the image as `hobunror/hobunror:latest`
4. Pushes the image to Docker Hub
5. Connects to the Synology NAS over SSH
6. Pulls the image from Docker Hub on the NAS
7. Stops and removes the existing container if present
8. Starts a new container from the pulled image

Script location:

```bash
./deploy.sh
```

## Script contents

Current script:

```bash
#!/bin/bash

# Deployment script for Topcastles-New to Synology NAS via Docker Hub

set -e

IMAGE_NAME="hobunror/hobunror"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"
NAS_HOST="DS224plus.local"
NAS_USER="robertron"
CONTAINER_NAME="topcastles-new"
HOST_PORT="8080"
CONTAINER_PORT="80"

echo "Building Angular application..."
cd new_app
npm run build
cd ..

echo "Building Docker image..."
docker build -t "$FULL_IMAGE_NAME" .

echo "Pushing image to Docker Hub..."
docker push "$FULL_IMAGE_NAME"

echo "Connecting to Synology and deploying..."
ssh "${NAS_USER}@${NAS_HOST}" << EOF
  set -e
  echo "Pulling image from Docker Hub..."
  docker pull "$FULL_IMAGE_NAME"

  echo "Stopping existing container if running..."
  docker stop "$CONTAINER_NAME" || true
  docker rm "$CONTAINER_NAME" || true

  echo "Running new container..."
  docker run -d --restart unless-stopped --name "$CONTAINER_NAME" -p ${HOST_PORT}:${CONTAINER_PORT} "$FULL_IMAGE_NAME"

  echo "Deployment complete!"
EOF

echo "Done!"
```

## Prerequisites

The script assumes all of the following are already configured.

### Local machine

- Bash-compatible shell is available
- Node.js and npm are installed
- Docker Desktop or another working Docker engine is running
- The repository dependencies are installed in `new_app/`
- You are logged in to Docker Hub with permission to push `hobunror/hobunror`
- `ssh` is installed and available in `PATH`
- The local machine can resolve `DS224plus.local`
- The local machine can connect to the NAS over SSH

Docker Hub login command:

```bash
docker login
```

### Synology NAS

- SSH service is enabled
- The user `robertron` can authenticate over SSH
- Docker/Container Manager is installed and usable from the shell
- The NAS has outbound network access to Docker Hub
- The `robertron` user can run `docker pull`, `docker stop`, `docker rm`, and `docker run`
- Port `8080` on the NAS is available

## How to run the deployment

From the repository root:

```bash
bash deploy.sh
```

If the script has execute permission:

```bash
./deploy.sh
```

## Step-by-step behavior

### 1. Build the Angular app

The script enters `new_app/` and runs:

```bash
npm run build
```

This produces the production application build before the Docker image is created.

### 2. Build the Docker image

From the repository root, the script runs:

```bash
docker build -t hobunror/hobunror:latest .
```

This uses the root-level `Dockerfile` and tags the image for Docker Hub.

### 3. Push the image to Docker Hub

After the image is built, the script runs:

```bash
docker push hobunror/hobunror:latest
```

This uploads the image so the Synology NAS can pull it directly.

### 4. Pull the image on the NAS

After connecting over SSH, the NAS runs:

```bash
docker pull hobunror/hobunror:latest
```

This retrieves the latest published image from Docker Hub.

### 5. Replace the running container

The script attempts to stop and remove the existing container, ignoring errors if it does not exist:

```bash
docker stop topcastles-new || true
docker rm topcastles-new || true
```

### 6. Start the new container

The new container is started with:

```bash
docker run -d --restart unless-stopped --name topcastles-new -p 8080:80 hobunror/hobunror:latest
```

This maps:

- NAS port `8080`
- to container port `80`

It also configures the container to restart automatically unless it is explicitly stopped.

## Resulting deployment topology

After a successful run, the expected topology is:

- Image in Docker Hub: `hobunror/hobunror:latest`
- Container name on NAS: `topcastles-new`
- Public binding on NAS: `http://<synology-host>:8080`

## Advantages over tar-based deployment

Compared with the previous `docker save`/`scp`/`docker load` workflow, this approach:

- removes local tar archive creation
- removes manual image copying to the NAS
- reduces local and NAS disk usage during deployment
- aligns with standard registry-based deployment practices
- makes it easier to pull the same image from Synology Container Manager directly

## Operational assumptions

The current script makes several important assumptions:

- The Docker image serves HTTP on container port `80`
- Replacing the container is acceptable downtime
- No persistent named volumes are required for runtime state
- No environment variables are required at startup
- No reverse proxy or TLS setup is handled by this script
- The Docker Hub repository `hobunror/hobunror` exists and is writable from the local machine

## Limitations and risks

The current script works as a simple manual deployment path, but it has several limitations.

### No health check

The script starts the container but does not verify that the application is healthy or reachable.

### No rollback

If the new container starts and fails immediately, the previous container is already removed.

### Fixed image tag

The script always deploys `latest`. This makes rollbacks and release traceability harder than using versioned tags.

### Fixed hostnames, user, and ports

These values are hard-coded:

- `hobunror/hobunror`
- `robertron`
- `DS224plus.local`
- `topcastles-new`
- `8080:80`

That makes the script environment-specific.

## Troubleshooting

### `docker push` fails with authentication or permission errors

Cause:
You are not logged in to Docker Hub, or the account does not have permission to push to `hobunror/hobunror`.

Fix:

```bash
docker login
```

Then verify that the repository name is correct and that the account has push access.

### `docker pull` fails on the NAS

Cause:
The NAS cannot reach Docker Hub, or the image has not been pushed successfully.

Fix:

- Verify internet access from the NAS
- Confirm that `hobunror/hobunror:latest` exists on Docker Hub
- Ensure the image is public, or configure Docker Hub authentication on the NAS if it is private

### `failed to read dockerfile: open Dockerfile: no such file or directory`

Cause:
The build was started from `new_app/` instead of the repository root.

Fix:
Run deployment from the repository root so the root `Dockerfile` is in the build context.

### `ssh` cannot resolve `DS224plus.local`

Cause:
mDNS/local hostname resolution is not working on the local machine.

Fix options:

- Use the NAS IP address instead of `DS224plus.local`
- Add a local hosts entry
- Ensure local name resolution for `.local` addresses is configured

## Recommended future improvements

If this deployment path remains in use, the next improvements should be:

1. Move hard-coded values into environment variables or script arguments
2. Add post-deploy health verification
3. Add rollback support with versioned tags
4. Publish immutable release tags in addition to `latest`
5. Optionally support Synology Container Manager pull-only deployment without SSH

## Related documentation

- `README.md` — project overview and local commands
- `docs/setup.md` — stack and deployment target
- `docs/pipeline.md` — build and deployment pipeline
