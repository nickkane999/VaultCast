# VaultCast Kubernetes Deployment Script for Windows
Write-Host "=== VaultCast Kubernetes Deployment ===" -ForegroundColor Green
Write-Host "Deploying to Docker Desktop Kubernetes cluster..." -ForegroundColor Yellow
Write-Host ""

# Check if kubectl is available
try {
    kubectl version --client --short | Out-Null
    Write-Host "✅ kubectl is available" -ForegroundColor Green
} catch {
    Write-Host "❌ kubectl is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install kubectl or ensure it's in your PATH" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Desktop Kubernetes is running
try {
    kubectl cluster-info | Out-Null
    Write-Host "✅ Kubernetes cluster is accessible" -ForegroundColor Green
    $context = kubectl config current-context
    Write-Host "Current context: $context" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Kubernetes cluster is not accessible" -ForegroundColor Red
    Write-Host "Please ensure Docker Desktop is running with Kubernetes enabled" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Apply configurations in order
Write-Host "📦 Creating namespace..." -ForegroundColor Blue
kubectl apply -f namespace.yaml

Write-Host "🔐 Creating secrets..." -ForegroundColor Blue
kubectl apply -f secrets.yaml

Write-Host "⚙️  Creating configmap..." -ForegroundColor Blue
kubectl apply -f configmap.yaml

Write-Host "💾 Creating persistent volumes..." -ForegroundColor Blue
kubectl apply -f persistent-volumes.yaml

Write-Host "🚀 Deploying services..." -ForegroundColor Blue
kubectl apply -f website-deployment.yaml
kubectl apply -f content-server-deployment.yaml
kubectl apply -f image-analysis-deployment.yaml

Write-Host ""
Write-Host "⏳ Waiting for deployments to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/website -n vaultcast
kubectl wait --for=condition=available --timeout=300s deployment/content-server -n vaultcast
kubectl wait --for=condition=available --timeout=300s deployment/image-analysis -n vaultcast

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "  Website: http://localhost:30000" -ForegroundColor White
Write-Host "  Content Server: http://localhost:30001" -ForegroundColor White
Write-Host "  Image Analysis: http://localhost:30003" -ForegroundColor White
Write-Host ""
Write-Host "📊 Check status with:" -ForegroundColor Cyan
Write-Host "  kubectl get pods -n vaultcast" -ForegroundColor Gray
Write-Host "  kubectl get services -n vaultcast" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 View logs with:" -ForegroundColor Cyan
Write-Host "  kubectl logs -f deployment/website -n vaultcast" -ForegroundColor Gray
Write-Host "  kubectl logs -f deployment/content-server -n vaultcast" -ForegroundColor Gray
Write-Host "  kubectl logs -f deployment/image-analysis -n vaultcast" -ForegroundColor Gray 