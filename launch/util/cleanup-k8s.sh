#!/bin/bash

echo "=== VaultCast Cleanup ==="
echo "Cleaning up VaultCast Kubernetes deployment..."
echo ""

# Check if namespace exists
if kubectl get namespace vaultcast &> /dev/null; then
    echo "🗑️  Deleting VaultCast namespace and all resources..."
    kubectl delete namespace vaultcast
    
    echo "⏳ Waiting for cleanup to complete..."
    kubectl wait --for=delete namespace/vaultcast --timeout=60s
    
    echo "✅ Cleanup complete!"
else
    echo "ℹ️  VaultCast namespace not found - nothing to clean up"
fi

echo ""
echo "🧹 All VaultCast resources have been removed from Kubernetes."
echo ""
echo "💡 To redeploy, run:"
echo "  cd ../main && ./deploy.sh" 