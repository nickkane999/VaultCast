#!/bin/bash

echo "=== Setting up VaultCast Port Forwarding ==="
echo "Mapping Kubernetes services to original ports with IPv4 binding..."
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if the namespace exists
if ! kubectl get namespace vaultcast &> /dev/null; then
    echo "❌ vaultcast namespace not found"
    echo "Please deploy the application first with ./deploy.sh"
    exit 1
fi

# Function to kill existing port forwards
cleanup_port_forwards() {
    echo "🧹 Cleaning up existing port forwards..."
    # Kill kubectl processes on Windows
    taskkill /F /IM kubectl.exe 2>/dev/null || true
    # Kill kubectl processes on Linux/Mac
    pkill -f "kubectl port-forward" 2>/dev/null || true
    sleep 3
}

# Cleanup existing port forwards
cleanup_port_forwards

echo "🔗 Setting up port forwarding with IPv4 binding..."

# Port forward website service (3000 -> 3000) with IPv4 binding
echo "  📱 Website: http://127.0.0.1:3000"
kubectl port-forward -n vaultcast service/website-service 3000:3000 --address=127.0.0.1 > /dev/null 2>&1 &
WEBSITE_PID=$!

# Port forward content-server service (3001 -> 3001) with IPv4 binding
echo "  📁 Content Server: http://127.0.0.1:3001"
kubectl port-forward -n vaultcast service/content-server-service 3001:3001 --address=127.0.0.1 > /dev/null 2>&1 &
CONTENT_PID=$!

# Port forward image-analysis service (3003 -> 3003) with IPv4 binding
echo "  🖼️  Image Analysis: http://127.0.0.1:3003"
kubectl port-forward -n vaultcast service/image-analysis-service 3003:3003 --address=127.0.0.1 > /dev/null 2>&1 &
IMAGE_PID=$!

# Wait a moment for port forwards to establish
sleep 5

echo ""
echo "✅ Port forwarding established with IPv4 binding!"
echo ""
echo "📋 Available services:"
echo "  🌐 Website:        http://127.0.0.1:3000"
echo "  📁 Content Server: http://127.0.0.1:3001"
echo "  🖼️  Image Analysis: http://127.0.0.1:3003"
echo ""
echo "🔍 Health checks:"
echo "  Website:        curl http://127.0.0.1:3000"
echo "  Content Server: curl http://127.0.0.1:3001/health"
echo "  Image Analysis: curl http://127.0.0.1:3003/api/health"
echo ""
echo "⚠️  Keep this terminal open to maintain port forwarding"
echo "   Press Ctrl+C to stop port forwarding"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping port forwarding..."
    kill $WEBSITE_PID $CONTENT_PID $IMAGE_PID 2>/dev/null || true
    taskkill /F /IM kubectl.exe 2>/dev/null || true
    echo "✅ Port forwarding stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "🔄 Port forwarding active... (Press Ctrl+C to stop)"
wait 