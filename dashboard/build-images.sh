#!/bin/bash

# Build and tag Docker images for Factory Digital Twin
# Usage: ./build-images.sh [version]

VERSION=${1:-latest}
REGISTRY=${DOCKER_REGISTRY:-""}  # Set your registry here, e.g., "gcr.io/your-project"

echo "Building Factory Digital Twin Docker images (version: $VERSION)"

# Build backend
echo "Building backend image..."
cd backend
docker build -t factory-backend:$VERSION -t factory-backend:latest .
if [ ! -z "$REGISTRY" ]; then
  docker tag factory-backend:$VERSION $REGISTRY/factory-backend:$VERSION
  docker tag factory-backend:latest $REGISTRY/factory-backend:latest
fi
cd ..

# Build frontend
echo "Building frontend image..."
cd frontend
docker build -t factory-frontend:$VERSION -t factory-frontend:latest .
if [ ! -z "$REGISTRY" ]; then
  docker tag factory-frontend:$VERSION $REGISTRY/factory-frontend:$VERSION
  docker tag factory-frontend:latest $REGISTRY/factory-frontend:latest
fi
cd ..

echo "✅ Images built successfully!"
echo ""
echo "Local images:"
echo "  - factory-backend:$VERSION"
echo "  - factory-frontend:$VERSION"

if [ ! -z "$REGISTRY" ]; then
  echo ""
  echo "Registry images:"
  echo "  - $REGISTRY/factory-backend:$VERSION"
  echo "  - $REGISTRY/factory-frontend:$VERSION"
  echo ""
  echo "To push to registry, run:"
  echo "  docker push $REGISTRY/factory-backend:$VERSION"
  echo "  docker push $REGISTRY/factory-frontend:$VERSION"
fi

echo ""
echo "To test locally with docker-compose:"
echo "  docker-compose up -d"
