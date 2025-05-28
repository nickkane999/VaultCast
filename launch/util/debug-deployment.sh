#!/bin/bash

echo "=== VaultCast Deployment Debugger ==="
echo "Checking VaultCast deployment status and common issues..."
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace vaultcast &> /dev/null; then
    echo "❌ VaultCast namespace not found"
    echo "Deploy VaultCast first with: cd ../main && ./deploy.sh"
    exit 1
fi

echo "✅ VaultCast namespace exists"
echo ""

# Check pods
echo "=== Pod Status ==="
kubectl get pods -n vaultcast
echo ""

# Check for failed pods
failed_pods=$(kubectl get pods -n vaultcast --field-selector=status.phase=Failed -o name)
if [ ! -z "$failed_pods" ]; then
    echo "❌ Failed pods found:"
    echo "$failed_pods"
    echo ""
fi

# Check for pending pods
pending_pods=$(kubectl get pods -n vaultcast --field-selector=status.phase=Pending -o name)
if [ ! -z "$pending_pods" ]; then
    echo "⚠️  Pending pods found:"
    echo "$pending_pods"
    echo ""
    
    echo "Describing pending pods:"
    for pod in $pending_pods; do
        echo "--- $pod ---"
        kubectl describe $pod -n vaultcast | grep -A 10 "Events:"
        echo ""
    done
fi

# Check services
echo "=== Service Status ==="
kubectl get services -n vaultcast
echo ""

# Check persistent volumes
echo "=== Persistent Volume Status ==="
kubectl get pv | grep vaultcast
echo ""

# Check persistent volume claims
echo "=== Persistent Volume Claims ==="
kubectl get pvc -n vaultcast
echo ""

# Check recent events
echo "=== Recent Events ==="
kubectl get events -n vaultcast --sort-by='.lastTimestamp' | tail -10
echo ""

# Check resource usage
echo "=== Resource Usage ==="
kubectl top pods -n vaultcast 2>/dev/null || echo "Metrics server not available"
echo ""

# Check if images exist
echo "=== Docker Images ==="
docker images | grep vaultcast || echo "No VaultCast images found - run build-images.sh first"
echo ""

echo "=== Troubleshooting Tips ==="
echo "1. If pods are pending: Check resource limits and node capacity"
echo "2. If pods are failing: Check logs with 'kubectl logs <pod-name> -n vaultcast'"
echo "3. If images not found: Run '../main/build-images.sh' first"
echo "4. If services not accessible: Check NodePort configuration"
echo ""
echo "🔍 For detailed pod logs, run:"
echo "  kubectl logs -f deployment/website -n vaultcast"
echo "  kubectl logs -f deployment/content-server -n vaultcast"
echo "  kubectl logs -f deployment/image-analysis -n vaultcast" 