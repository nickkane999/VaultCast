# PowerShell script to locate Docker virtual disk files
Write-Host "=== Docker Virtual Disk Locator ===" -ForegroundColor Green
Write-Host "Searching for Docker virtual disk files..." -ForegroundColor Yellow
Write-Host ""

# Common locations for Docker virtual disks
$locations = @(
    "$env:USERPROFILE\AppData\Local\Docker\wsl\data\ext4.vhdx",
    "C:\ProgramData\Docker\wsl\data\ext4.vhdx",
    "$env:USERPROFILE\AppData\Local\Docker\wsl\distro\ext4.vhdx",
    "C:\ProgramData\Docker\wsl\distro\ext4.vhdx"
)

$found = $false

foreach ($location in $locations) {
    if (Test-Path $location) {
        $file = Get-Item $location
        Write-Host "FOUND: $location" -ForegroundColor Green
        Write-Host "  Size: $([math]::Round($file.Length / 1GB, 2)) GB" -ForegroundColor Cyan
        Write-Host "  Modified: $($file.LastWriteTime)" -ForegroundColor Cyan
        Write-Host ""
        $found = $true
    }
}

if (-not $found) {
    Write-Host "No Docker virtual disks found in common locations." -ForegroundColor Red
    Write-Host "Searching entire C: drive for Docker-related VHDX files..." -ForegroundColor Yellow
    
    try {
        $allVhdx = Get-ChildItem -Path "C:\" -Recurse -Filter "*.vhdx" -ErrorAction SilentlyContinue | 
                   Where-Object { $_.FullName -like "*docker*" }
        
        if ($allVhdx) {
            Write-Host "Found Docker-related VHDX files:" -ForegroundColor Green
            foreach ($file in $allVhdx) {
                Write-Host "  $($file.FullName)" -ForegroundColor Cyan
                Write-Host "    Size: $([math]::Round($file.Length / 1GB, 2)) GB" -ForegroundColor Gray
            }
        } else {
            Write-Host "No Docker-related VHDX files found on C: drive." -ForegroundColor Red
        }
    } catch {
        Write-Host "Error searching C: drive: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Docker Desktop Information ===" -ForegroundColor Green

# Check Docker Desktop version
try {
    $dockerVersion = docker --version
    Write-Host "Docker Version: $dockerVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Docker command not available" -ForegroundColor Red
}

# Check WSL distributions
Write-Host ""
Write-Host "WSL Distributions:" -ForegroundColor Yellow
try {
    wsl --list --verbose
} catch {
    Write-Host "WSL not available" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host "1. If virtual disk found, use the batch script to move it" -ForegroundColor White
Write-Host "2. If not found, try Docker Desktop Settings > Resources > Advanced" -ForegroundColor White
Write-Host "3. Look for 'Disk image location' or 'Virtual disk limit' settings" -ForegroundColor White 