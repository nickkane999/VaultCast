#!/bin/bash

echo "=== VaultCast Pod Monitor ==="
echo "Monitoring VaultCast pods in real-time..."
echo "Press Ctrl+C to exit"
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

# Function to show pod status
show_status() {
    echo "=== Pod Status ==="
    kubectl get pods -n vaultcast -o wide
    echo ""
    
    echo "=== Service Status ==="
    kubectl get services -n vaultcast
    echo ""
    
    echo "=== Recent Events ==="
    kubectl get events -n vaultcast --sort-by='.lastTimestamp' | tail -5
    echo ""
}

# Show initial status
show_status

# Monitor in real-time
echo "🔄 Monitoring pods (updates every 10 seconds)..."
echo ""

while true; do
    sleep 10
    clear
    echo "=== VaultCast Pod Monitor === $(date)"
    echo ""
    show_status
done 