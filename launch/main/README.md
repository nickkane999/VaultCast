# VaultCast Kubernetes Deployment

This directory contains the Kubernetes deployment configuration for VaultCast, a secure file sharing and streaming platform.

## 🚀 Quick Start

### Option 1: One-Command Setup (Recommended)

```bash
./start-vaultcast.sh
```

This script will:

- Build all Docker images
- Deploy to Kubernetes
- Set up port forwarding
- Run health checks
- Keep services running

### Option 2: Manual Setup

```bash
# 1. Build images
./build-images.sh

# 2. Deploy to Kubernetes
./deploy.sh

# 3. Set up port forwarding
./port-forward.sh
```

## 📋 Services

After deployment, the following services will be available:

- **Website**: http://localhost:3000
- **Content Server**: http://localhost:3001
- **Image Analysis**: http://localhost:3003

## 🔧 Architecture

### Internal Communication (Kubernetes)

Services communicate internally using Kubernetes service names:

- `website-service:3000`
- `content-server-service:3001`
- `image-analysis-service:3003`

### External Access (Your Browser)

Port forwarding maps internal services to localhost:

- `localhost:3000` → `website-service:3000`
- `localhost:3001` → `content-server-service:3001`
- `localhost:3003` → `image-analysis-service:3003`

## 🐛 Troubleshooting

### Connection Refused Errors

If you see `ECONNREFUSED` errors:

1. **Check if port forwarding is running:**

   ```bash
   ps aux | grep "kubectl port-forward"
   ```

2. **Restart port forwarding:**

   ```bash
   ./port-forward.sh
   ```

3. **Check pod status:**
   ```bash
   kubectl get pods -n vaultcast
   ```

### IPv6 vs IPv4 Issues

The deployment is configured to use IPv4 (`127.0.0.1`) to avoid IPv6 connection issues. If you still have problems:

1. **Use explicit IPv4 addresses:**

   - http://127.0.0.1:3000 instead of http://localhost:3000

2. **Check your system's localhost resolution:**
   ```bash
   ping localhost
   ```

### Pod Restart Issues

If pods keep restarting:

1. **Check logs:**

   ```bash
   kubectl logs -f deployment/website -n vaultcast
   kubectl logs -f deployment/content-server -n vaultcast
   kubectl logs -f deployment/image-analysis -n vaultcast
   ```

2. **Check resource usage:**
   ```bash
   kubectl top pods -n vaultcast
   ```

## 📁 Files

- `build-images.sh` - Builds all Docker images
- `deploy.sh` - Deploys to Kubernetes
- `port-forward.sh` - Sets up port forwarding (Linux/Mac/Git Bash)
- `port-forward.ps1` - Sets up port forwarding (Windows PowerShell)
- `start-vaultcast.sh` - Complete setup script
- `website-deployment.yaml` - Website service configuration
- `content-server-deployment.yaml` - Content server configuration
- `image-analysis-deployment.yaml` - Image analysis service configuration
- `secrets.yaml` - Kubernetes secrets
- `configmap.yaml` - Configuration map
- `persistent-volumes.yaml` - Storage configuration

## 🔒 Security

- Services run with non-root users
- Resource limits are enforced
- CORS is properly configured
- Secrets are stored in Kubernetes secrets

## 🛠️ Development

To make changes:

1. **Update source code** in the respective directories
2. **Rebuild images:** `./build-images.sh`
3. **Redeploy:** `kubectl rollout restart deployment/<service-name> -n vaultcast`
4. **Check status:** `kubectl rollout status deployment/<service-name> -n vaultcast`

## 🧹 Cleanup

To remove everything:

```bash
kubectl delete namespace vaultcast
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify Docker Desktop is running with Kubernetes enabled
3. Ensure all required ports (3000, 3001, 3003) are available
4. Check the logs for specific error messages
