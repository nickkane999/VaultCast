#!/bin/bash

echo "=== VaultCast Launch Status ==="
echo "Checking your Docker Desktop Kubernetes setup..."
echo ""

# Check Docker Desktop
if docker info &> /dev/null; then
    echo "✅ Docker Desktop is running"
    docker_version=$(docker --version)
    echo "   Version: $docker_version"
else
    echo "❌ Docker Desktop is not running"
    echo "   Please start Docker Desktop first"
fi

echo ""

# Check Kubernetes
if kubectl cluster-info &> /dev/null; then
    echo "✅ Kubernetes cluster is accessible"
    context=$(kubectl config current-context)
    echo "   Context: $context"
    
    # Check if it's Docker Desktop
    if [[ "$context" == "docker-desktop" ]]; then
        echo "   ✅ Using Docker Desktop Kubernetes"
        
        # Get Kubernetes version
        k8s_version=$(kubectl version --short 2>/dev/null | grep "Server Version" | cut -d' ' -f3)
        echo "   Version: $k8s_version"
    else
        echo "   ⚠️  Not using docker-desktop context"
        echo "   Switch with: kubectl config use-context docker-desktop"
    fi
else
    echo "❌ Kubernetes cluster is not accessible"
    echo "   Enable Kubernetes in Docker Desktop Settings"
fi

echo ""

# Check VaultCast deployment
if kubectl get namespace vaultcast &> /dev/null; then
    echo "✅ VaultCast is deployed"
    
    # Check pod status
    running_pods=$(kubectl get pods -n vaultcast --field-selector=status.phase=Running -o name | wc -l)
    total_pods=$(kubectl get pods -n vaultcast -o name | wc -l)
    
    echo "   Pods: $running_pods/$total_pods running"
    
    if [ "$running_pods" -eq "$total_pods" ] && [ "$total_pods" -gt 0 ]; then
        echo "   🌐 Access URLs:"
        echo "     Website: http://localhost:30000"
        echo "     Content Server: http://localhost:30001"
        echo "     Image Analysis: http://localhost:30003"
    else
        echo "   ⚠️  Some pods are not running"
        echo "   Run: ./util/debug-deployment.sh"
    fi
else
    echo "ℹ️  VaultCast is not deployed"
    echo "   Ready to deploy with: ./main/deploy.sh"
fi

echo ""

# Check Docker images
vaultcast_images=$(docker images | grep vaultcast | wc -l)
if [ "$vaultcast_images" -gt 0 ]; then
    echo "✅ VaultCast Docker images built ($vaultcast_images images)"
else
    echo "ℹ️  VaultCast Docker images not built"
    echo "   Build with: ./main/build-images.sh"
fi

echo ""
echo "=== Next Steps ==="

if ! docker info &> /dev/null; then
    echo "1. Start Docker Desktop"
elif ! kubectl cluster-info &> /dev/null; then
    echo "1. Enable Kubernetes in Docker Desktop"
elif [ "$vaultcast_images" -eq 0 ]; then
    echo "1. Build images: cd main && ./build-images.sh"
    echo "2. Deploy: ./deploy.sh"
elif ! kubectl get namespace vaultcast &> /dev/null; then
    echo "1. Deploy VaultCast: cd main && ./deploy.sh"
else
    echo "🎉 Everything looks good!"
    echo "1. Monitor: ./util/monitor-pods.sh"
    echo "2. Debug: ./util/debug-deployment.sh"
    echo "3. Cleanup: ./util/cleanup-k8s.sh"
fi

echo ""
echo "📚 For detailed instructions, see: ./README.md" 