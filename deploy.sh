#!/bin/bash

# Deployment script for Topcastles-New to Synology NAS

set -e

echo "Building Angular application..."
cd new_app
npm run build
cd ..

echo "Building Docker image..."
docker build -t topcastles-new:latest .

echo "Saving Docker image..."
docker save topcastles-new:latest > topcastles-new.tar

echo "Copying image to Synology NAS..."
scp topcastles-new.tar robertron@DS224plus.local:/volume1/docker/

echo "Connecting to Synology and deploying..."
ssh robertron@DS224plus.local << 'EOF'
  cd /volume1/docker/
  echo "Loading Docker image..."
  docker load < topcastles-new.tar

  echo "Stopping existing container if running..."
  docker stop topcastles-new || true
  docker rm topcastles-new || true

  echo "Running new container..."
  docker run -d --name topcastles-new -p 8080:80 topcastles-new:latest

  echo "Cleaning up..."
  rm topcastles-new.tar

  echo "Deployment complete!"
EOF

echo "Local cleanup..."
rm topcastles-new.tar

echo "Done!"