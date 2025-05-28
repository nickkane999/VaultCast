#!/bin/bash

echo "=== VaultCast Kubernetes Deployment ==="
echo "Deploying to Docker Desktop Kubernetes cluster..."
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if Docker Desktop Kubernetes is running
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Kubernetes cluster is not accessible"
    echo "Please ensure Docker Desktop is running with Kubernetes enabled"
    exit 1
fi

echo "✅ Kubernetes cluster is accessible"
echo "Current context: $(kubectl config current-context)"
echo ""

# Apply configurations in order
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

echo "🔐 Creating secrets..."
kubectl apply -f secrets.yaml

echo "⚙️  Creating configmap..."
kubectl apply -f configmap.yaml

echo "💾 Creating persistent volumes..."
kubectl apply -f persistent-volumes.yaml

echo "🚀 Deploying services..."
kubectl apply -f website-deployment.yaml
kubectl apply -f content-server-deployment.yaml
kubectl apply -f image-analysis-deployment.yaml

echo ""
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/website -n vaultcast
kubectl wait --for=condition=available --timeout=300s deployment/content-server -n vaultcast
kubectl wait --for=condition=available --timeout=300s deployment/image-analysis -n vaultcast

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access URLs:"
echo "  Website: http://localhost:30000"
echo "  Content Server: http://localhost:30001"
echo "  Image Analysis: http://localhost:30003"
echo ""
echo "📊 Check status with:"
echo "  kubectl get pods -n vaultcast"
echo "  kubectl get services -n vaultcast"
echo ""
echo "🔍 View logs with:"
echo "  kubectl logs -f deployment/website -n vaultcast"
echo "  kubectl logs -f deployment/content-server -n vaultcast"
echo "  kubectl logs -f deployment/image-analysis -n vaultcast" 