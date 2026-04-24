#!/bin/bash

# Deployment script for Topcastles-New to Synology NAS via Docker Hub
# Run in Git Bash terminal on Windows
# Make sure Docker Desktop is running

set -e

# --autostart <policy>  Docker restart policy: unless-stopped (default), always, no
RESTART_POLICY="unless-stopped"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --autostart)
      RESTART_POLICY="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

# Start ssh-agent and add your key (will prompt for passphrase once)
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

IMAGE_NAME="hobunror/topcastles"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"
NAS_HOST="DS224plus.local"
NAS_USER="robertron"
CONTAINER_NAME="topcastles"
HOST_PORT="8082"
CONTAINER_PORT="3000"
DATA_DIR="/volume1/docker/topcastles/data"
IMAGE_DIR="/volume1/docker/topcastles/images/castles"
IMAGE_MOUNT_TARGET="/data/castle-images"

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
  IMAGE_SOURCE_DIR="$IMAGE_DIR"
  IMAGE_MOUNT_TARGET="$IMAGE_MOUNT_TARGET"

  echo "Preflighting NAS image source..."
  if [ -z "\$IMAGE_SOURCE_DIR" ] || [ "\$IMAGE_SOURCE_DIR" = "/" ]; then
    echo "ERROR: NAS image preflight failed." >&2
    echo "IMAGE_DIR is missing or unsafe: '\$IMAGE_SOURCE_DIR'" >&2
    echo "Set IMAGE_DIR in deploy.sh to the NAS castle image directory that should mount at \$IMAGE_MOUNT_TARGET." >&2
    exit 1
  fi
  if [ ! -e "\$IMAGE_SOURCE_DIR" ]; then
    echo "ERROR: NAS image preflight failed." >&2
    echo "Expected image source directory does not exist: \$IMAGE_SOURCE_DIR" >&2
    echo "Create or mount the NAS image directory before deploying; the container expects it at \$IMAGE_MOUNT_TARGET." >&2
    exit 1
  fi
  if [ ! -d "\$IMAGE_SOURCE_DIR" ]; then
    echo "ERROR: NAS image preflight failed." >&2
    echo "Expected image source is not a directory: \$IMAGE_SOURCE_DIR" >&2
    echo "Set IMAGE_DIR in deploy.sh to the NAS castle image directory that should mount at \$IMAGE_MOUNT_TARGET." >&2
    exit 1
  fi
  if [ ! -r "\$IMAGE_SOURCE_DIR" ] || [ ! -x "\$IMAGE_SOURCE_DIR" ]; then
    echo "ERROR: NAS image preflight failed." >&2
    echo "Expected image source directory is not readable/listable: \$IMAGE_SOURCE_DIR" >&2
    echo "Fix NAS permissions before deploying; the container mounts this path read-only at \$IMAGE_MOUNT_TARGET." >&2
    exit 1
  fi
  if ! find "\$IMAGE_SOURCE_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.gif' \) -print -quit | grep -q .; then
    echo "ERROR: NAS image preflight failed." >&2
    echo "No image files were found under: \$IMAGE_SOURCE_DIR" >&2
    echo "Verify IMAGE_DIR points to the castle image source, not an empty parent or missing mount." >&2
    exit 1
  fi
  echo "NAS image source OK: \$IMAGE_SOURCE_DIR -> \$IMAGE_MOUNT_TARGET"

  echo "Pulling image from Docker Hub..."
  sudo docker pull "$FULL_IMAGE_NAME"

  echo "Stopping existing container if running..."
  sudo docker stop "$CONTAINER_NAME" || true
  sudo docker rm "$CONTAINER_NAME" || true

  echo "Running new container..."
  mkdir -p "$DATA_DIR"
  sudo docker run -d --restart "$RESTART_POLICY" --name "$CONTAINER_NAME" \
    -p ${HOST_PORT}:${CONTAINER_PORT} \
    -v ${DATA_DIR}:/data \
    -v ${IMAGE_DIR}:${IMAGE_MOUNT_TARGET}:ro \
    "$FULL_IMAGE_NAME"

  echo "Deployment complete!"
EOF

echo "Done!"
