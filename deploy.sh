#!/bin/bash

# Deployment script for Topcastles-New to Synology NAS via Docker Hub
# Run in Git Bash terminal on Windows
# Make sure Docker Desktop is running

set -e

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
  sudo docker pull "$FULL_IMAGE_NAME"

  echo "Stopping existing container if running..."
  sudo docker stop "$CONTAINER_NAME" || true
  sudo docker rm "$CONTAINER_NAME" || true

  echo "Running new container..."
  sudo docker run -d --restart unless-stopped --name "$CONTAINER_NAME" -p ${HOST_PORT}:${CONTAINER_PORT} "$FULL_IMAGE_NAME"

  echo "Deployment complete!"
EOF

echo "Done!"
