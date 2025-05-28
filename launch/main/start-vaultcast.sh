#!/bin/bash

echo "=== VaultCast Startup Script ==="
echo "This script will deploy and set up port forwarding for VaultCast"
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo "Please start Docker Desktop"
    exit 1
fi

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Build images
echo "🏗️  Building Docker images..."
./build-images.sh
if [ $? -ne 0 ]; then
    echo "❌ Failed to build images"
    exit 1
fi

echo ""

# Deploy to Kubernetes
echo "🚀 Deploying to Kubernetes..."
./deploy.sh
if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy"
    exit 1
fi

echo ""

# Wait for deployments to be ready
echo "⏳ Waiting for all deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/website -n vaultcast
kubectl wait --for=condition=available --timeout=300s deployment/content-server -n vaultcast
kubectl wait --for=condition=available --timeout=300s deployment/image-analysis -n vaultcast

echo ""

# Kill any existing port forwards
echo "🧹 Cleaning up existing port forwards..."
taskkill //F //IM kubectl.exe 2>/dev/null || true
pkill -f "kubectl port-forward" 2>/dev/null || true
sleep 3

# Set up port forwarding
echo "🔗 Setting up port forwarding..."
echo "  📱 Website: http://localhost:3000"
kubectl port-forward -n vaultcast service/website-service 3000:3000 --address=0.0.0.0 > /dev/null 2>&1 &
WEBSITE_PID=$!

echo "  📁 Content Server: http://localhost:3001"
kubectl port-forward -n vaultcast service/content-server-service 3001:3001 --address=0.0.0.0 > /dev/null 2>&1 &
CONTENT_PID=$!

echo "  🖼️  Image Analysis: http://localhost:3003"
kubectl port-forward -n vaultcast service/image-analysis-service 3003:3003 --address=0.0.0.0 > /dev/null 2>&1 &
IMAGE_PID=$!

# Wait for port forwards to establish
sleep 5

echo ""
echo "✅ VaultCast is ready!"
echo ""
echo "📋 Available services:"
echo "  🌐 Website:        http://localhost:3000"
echo "  📁 Content Server: http://localhost:3001"
echo "  🖼️  Image Analysis: http://localhost:3003"
echo ""
echo "🔍 Health checks:"
curl -s http://localhost:3000 > /dev/null && echo "  ✅ Website: OK" || echo "  ❌ Website: Failed"
curl -s http://localhost:3001/health > /dev/null && echo "  ✅ Content Server: OK" || echo "  ❌ Content Server: Failed"
curl -s http://localhost:3003/api/health > /dev/null && echo "  ✅ Image Analysis: OK" || echo "  ❌ Image Analysis: Failed"

echo ""
echo "🎉 VaultCast is running! Open http://localhost:3000 in your browser"
echo ""
echo "⚠️  Keep this terminal open to maintain port forwarding"
echo "   Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping VaultCast..."
    kill $WEBSITE_PID $CONTENT_PID $IMAGE_PID 2>/dev/null || true
    taskkill //F //IM kubectl.exe 2>/dev/null || true
    echo "✅ VaultCast stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "🔄 VaultCast active... (Press Ctrl+C to stop)"
wait 