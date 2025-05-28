# VaultCast Launch Directory

This directory contains everything you need to deploy VaultCast to your Docker Desktop Kubernetes cluster.

## Directory Structure

```
launch/
├── main/           # Essential deployment files
│   ├── *.yaml      # Kubernetes manifests
│   ├── deploy.sh   # Main deployment script (Linux/Mac)
│   ├── deploy.ps1  # Main deployment script (Windows)
│   └── build-images.sh # Docker image builder
└── util/           # Utility scripts
    ├── cleanup-k8s.sh      # Clean up deployment
    ├── setup-secrets.sh    # Configure API keys
    ├── monitor-pods.sh     # Monitor deployment
    ├── debug-deployment.sh # Debug issues
    └── find-docker-disk.ps1 # Find Docker storage
```

## Quick Start Guide

### 1. Prerequisites

- **Docker Desktop** with Kubernetes enabled
- **kubectl** configured for docker-desktop context
- Your API keys ready (OpenAI required, others optional)

### 2. Setup API Keys (First Time Only)

```bash
cd launch/util
./setup-secrets.sh
```

### 3. Build Docker Images

```bash
cd launch/main
./build-images.sh
```

### 4. Deploy to Kubernetes

```bash
# Linux/Mac
./deploy.sh

# Windows PowerShell
./deploy.ps1
```

### 5. Access Your Application

- **Website**: http://localhost:30000
- **Content Server**: http://localhost:30001
- **Image Analysis**: http://localhost:30003

## Management Commands

### Monitor Deployment

```bash
cd launch/util
./monitor-pods.sh
```

### Debug Issues

```bash
cd launch/util
./debug-deployment.sh
```

### Clean Up

```bash
cd launch/util
./cleanup-k8s.sh
```

## Docker Desktop Integration

Your setup uses **kubeadm v1.32.2** with Docker Desktop, which provides:

- Single-node Kubernetes cluster
- Integrated container registry
- NodePort services for external access
- Persistent volume support

## Troubleshooting

### Common Issues

1. **Pods stuck in Pending**: Check resource limits in Docker Desktop
2. **Images not found**: Run `build-images.sh` first
3. **Services not accessible**: Verify NodePort configuration
4. **Storage issues**: Use `find-docker-disk.ps1` to check disk space

### Getting Help

- Check pod logs: `kubectl logs -f deployment/<service> -n vaultcast`
- View events: `kubectl get events -n vaultcast`
- Debug deployment: `./launch/util/debug-deployment.sh`

## File Organization

- **`main/`**: Contains only the essential files needed for deployment
- **`util/`**: Contains helpful scripts that enhance the experience but aren't required

This structure keeps your deployment clean while providing powerful utilities when needed.
