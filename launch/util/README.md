# VaultCast Utility Scripts

This directory contains helpful utility scripts for managing your VaultCast deployment and Docker environment.

## Docker Management

### `find-docker-disk.ps1`

PowerShell script to locate Docker virtual disk files on Windows systems.

```powershell
./find-docker-disk.ps1
```

### `move-docker-to-e-drive.sh`

Bash script to move Docker data to E: drive (useful for space management).

```bash
./move-docker-to-e-drive.sh
```

### `move-docker-modern-fixed.bat`

Windows batch script for moving Docker Desktop data to another drive.

```cmd
move-docker-modern-fixed.bat
```

## Kubernetes Management

### `cleanup-k8s.sh`

Clean up VaultCast Kubernetes resources.

```bash
./cleanup-k8s.sh
```

### `setup-secrets.sh`

Interactive script to set up Kubernetes secrets with your API keys.

```bash
./setup-secrets.sh
```

### `start-kubernetes.sh`

Start and verify Kubernetes cluster status.

```bash
./start-kubernetes.sh
```

## Monitoring & Debugging

### `monitor-pods.sh`

Monitor pod status and logs in real-time.

```bash
./monitor-pods.sh
```

### `debug-deployment.sh`

Debug deployment issues and check resource status.

```bash
./debug-deployment.sh
```

## Usage Tips

1. **Before first deployment**: Run `setup-secrets.sh` to configure your API keys
2. **For space issues**: Use `find-docker-disk.ps1` and `move-docker-*` scripts
3. **For troubleshooting**: Use `debug-deployment.sh` and `monitor-pods.sh`
4. **For cleanup**: Use `cleanup-k8s.sh` to remove all VaultCast resources

## Prerequisites

- Docker Desktop with Kubernetes enabled
- kubectl configured for docker-desktop context
- Bash shell (for .sh scripts) or PowerShell (for .ps1 scripts)
