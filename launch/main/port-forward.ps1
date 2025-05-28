# VaultCast Port Forwarding Script for Windows
Write-Host "=== Setting up VaultCast Port Forwarding ===" -ForegroundColor Green
Write-Host "Mapping Kubernetes services to original ports with IPv4 binding..." -ForegroundColor Yellow
Write-Host ""

# Check if kubectl is available
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ kubectl is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if the namespace exists
try {
    kubectl get namespace vaultcast | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Namespace not found"
    }
} catch {
    Write-Host "❌ vaultcast namespace not found" -ForegroundColor Red
    Write-Host "Please deploy the application first with ./deploy.ps1" -ForegroundColor Yellow
    exit 1
}

# Function to kill existing port forwards
function Cleanup-PortForwards {
    Write-Host "🧹 Cleaning up existing port forwards..." -ForegroundColor Yellow
    Get-Process | Where-Object { $_.ProcessName -eq "kubectl" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
}

# Cleanup existing port forwards
Cleanup-PortForwards

Write-Host "🔗 Setting up port forwarding with IPv4 binding..." -ForegroundColor Cyan

# Start port forwarding jobs with IPv4 binding
Write-Host "  📱 Website: http://127.0.0.1:3000" -ForegroundColor White
$websiteJob = Start-Job -ScriptBlock { kubectl port-forward -n vaultcast service/website-service 3000:3000 --address=127.0.0.1 }

Write-Host "  📁 Content Server: http://127.0.0.1:3001" -ForegroundColor White
$contentJob = Start-Job -ScriptBlock { kubectl port-forward -n vaultcast service/content-server-service 3001:3001 --address=127.0.0.1 }

Write-Host "  🖼️  Image Analysis: http://127.0.0.1:3003" -ForegroundColor White
$imageJob = Start-Job -ScriptBlock { kubectl port-forward -n vaultcast service/image-analysis-service 3003:3003 --address=127.0.0.1 }

# Wait a moment for port forwards to establish
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Port forwarding established with IPv4 binding!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Available services:" -ForegroundColor Cyan
Write-Host "  🌐 Website:        http://127.0.0.1:3000" -ForegroundColor White
Write-Host "  📁 Content Server: http://127.0.0.1:3001" -ForegroundColor White
Write-Host "  🖼️  Image Analysis: http://127.0.0.1:3003" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Health checks:" -ForegroundColor Cyan
Write-Host "  Website:        curl http://127.0.0.1:3000" -ForegroundColor Gray
Write-Host "  Content Server: curl http://127.0.0.1:3001/health" -ForegroundColor Gray
Write-Host "  Image Analysis: curl http://127.0.0.1:3003/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Keep this PowerShell window open to maintain port forwarding" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop port forwarding" -ForegroundColor Yellow

# Function to cleanup on exit
function Cleanup {
    Write-Host ""
    Write-Host "🛑 Stopping port forwarding..." -ForegroundColor Yellow
    Stop-Job $websiteJob, $contentJob, $imageJob -ErrorAction SilentlyContinue
    Remove-Job $websiteJob, $contentJob, $imageJob -ErrorAction SilentlyContinue
    Write-Host "✅ Port forwarding stopped" -ForegroundColor Green
}

# Set up signal handlers
Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

try {
    Write-Host "🔄 Port forwarding active... (Press Ctrl+C to stop)" -ForegroundColor Green
    
    # Keep the script running and monitor jobs
    while ($true) {
        # Check if any jobs have failed
        $failedJobs = @($websiteJob, $contentJob, $imageJob) | Where-Object { $_.State -eq "Failed" }
        if ($failedJobs.Count -gt 0) {
            Write-Host "❌ Some port forwarding jobs have failed. Restarting..." -ForegroundColor Red
            Cleanup
            break
        }
        
        Start-Sleep -Seconds 5
    }
} catch {
    Cleanup
} finally {
    Cleanup
} 