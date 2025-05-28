#!/bin/bash

echo "=== Building VaultCast Docker Images ==="
echo "Building images for Docker Desktop Kubernetes..."
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo "Please start Docker Desktop"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Build website image
echo "🏗️  Building website image..."
cd ../../website
docker build -t vaultcast-website:latest .
if [ $? -ne 0 ]; then
    echo "❌ Failed to build website image"
    exit 1
fi
echo "✅ Website image built successfully"

# Build content-server image
echo "🏗️  Building content-server image..."
cd ../content-server
docker build -t vaultcast-content-server:latest .
if [ $? -ne 0 ]; then
    echo "❌ Failed to build content-server image"
    exit 1
fi
echo "✅ Content-server image built successfully"

"""
# Build image-analysis image
echo "🏗️  Building image-analysis image..."
cd ../image-analysis
docker build -t vaultcast-image-analysis:latest .
if [ $? -ne 0 ]; then
    echo "❌ Failed to build image-analysis image"
    exit 1
fi
echo "✅ Image-analysis image built successfully"
"""

cd ../launch/main

echo ""
echo "✅ All images built successfully!"
echo ""
echo "📋 Built images:"
docker images | grep vaultcast
echo ""
echo "🚀 Ready to deploy with:"
echo "  ./deploy.sh (Linux/Mac)"
echo "  ./deploy.ps1 (Windows PowerShell)" 