# Back2Trade Kubernetes Deployment

Production-ready Kubernetes deployment for the Back2Trade trading application using Helm charts.

## Architecture

- **Frontend**: Next.js application (Port 3000)
- **Backend**: NestJS API server (Port 3001)  
- **Database**: PostgreSQL (Port 5432)

## Prerequisites

- Kubernetes cluster (Minikube, Docker Desktop, or cloud)
- Helm 3.x
- kubectl configured
- Docker (for custom builds)

## Quick Deployment

```bash
# Clone repository
git clone <repository-url>
cd back-2-trade

# Deploy with Helm
helm install back2trade k8s/back-2-trade-chart

# Check status
kubectl get pods -l app.kubernetes.io/instance=back2trade

# Access applications
kubectl port-forward deployment/back2trade-frontend 3000:3000
kubectl port-forward deployment/back2trade-backend 3001:3001
```

## Project Structure

```
back-2-trade/
├── back2trade/
│   ├── api/app_api/          # NestJS Backend source
│   └── web2/back2trade/      # Next.js Frontend source
├── k8s/
│   ├── backend/Dockerfile    # Backend container
│   ├── frontend/Dockerfile   # Frontend container
│   └── back-2-trade-chart/   # Helm chart
│       ├── values.yaml       # Configuration
│       └── templates/        # K8s manifests
└── README.md
```

## Configuration

### Default Settings (values.yaml)

```yaml
# Replicas
replicaCount: 2

# Backend
backend:
  image:
    repository: YOUR_REGISTRY/back2trade-backend
    tag: latest
  env:
    NODE_ENV: production
    DATABASE_URL: "postgresql://back2trade:password@back2trade-database:5432/back2trade"

# Frontend  
frontend:
  image:
    repository: YOUR_REGISTRY/back2trade-frontend
    tag: latest
  env:
    NODE_ENV: development
    NEXT_PUBLIC_API_URL: "http://back2trade-backend:3001/api"

# Database
database:
  env:
    POSTGRES_DB: "back2trade"
    POSTGRES_USER: "back2trade"
    POSTGRES_PASSWORD: "password"
  persistence:
    size: 1Gi
```

### Environment Overrides

```bash
# Development
helm upgrade back2trade k8s/back-2-trade-chart \
  --set frontend.env.NODE_ENV=development

# Production
helm upgrade back2trade k8s/back-2-trade-chart \
  --set frontend.env.NODE_ENV=production \
  --set database.persistence.size=10Gi
```

## Registry Configuration

Before deployment, configure your Docker registry:

```bash
# Option 1: Use environment variable
export DOCKER_REGISTRY=your-registry.com

# Option 2: Update values.yaml directly
sed -i 's/YOUR_REGISTRY/your-registry.com/g' k8s/back-2-trade-chart/values.yaml

# Option 3: Override during deployment
helm upgrade back2trade k8s/back-2-trade-chart \
  --set backend.image.repository=your-registry.com/back2trade-backend \
  --set frontend.image.repository=your-registry.com/back2trade-frontend
```

## Operations

### Deployment Commands

```bash
# Install
helm install back2trade k8s/back-2-trade-chart

# Upgrade
helm upgrade back2trade k8s/back-2-trade-chart

# Uninstall
helm uninstall back2trade

# Rollback
helm rollback back2trade 1
```

### Monitoring

```bash
# Pod status
kubectl get pods -l app.kubernetes.io/instance=back2trade

# Logs
kubectl logs -l app.kubernetes.io/component=backend -f
kubectl logs -l app.kubernetes.io/component=frontend -f

# Resource usage
kubectl top pods -l app.kubernetes.io/instance=back2trade

# Detailed pod info
kubectl describe pod <pod-name>
```

### Scaling

```bash
# Scale replicas
helm upgrade back2trade k8s/back-2-trade-chart --set replicaCount=3

# Or directly
kubectl scale deployment back2trade-backend --replicas=3
```

## Docker Images

### Pre-built Images
- Backend: `YOUR_REGISTRY/back2trade-backend:latest`
- Frontend: `YOUR_REGISTRY/back2trade-frontend:latest`
- Database: `postgres:15-alpine`

### Custom Builds

```bash
# Backend
cd k8s/backend
docker build -t your-registry/back2trade-backend:latest -f Dockerfile ../../
docker push your-registry/back2trade-backend:latest

# Frontend
cd k8s/frontend
docker build -t your-registry/back2trade-frontend:latest -f Dockerfile ../../
docker push your-registry/back2trade-frontend:latest

# Update deployment
helm upgrade back2trade k8s/back-2-trade-chart \
  --set backend.image.repository=your-registry/back2trade-backend \
  --set frontend.image.repository=your-registry/back2trade-frontend
```

## Troubleshooting

### Common Issues

**Frontend pods not ready**
- Symptoms: `0/1 Ready`, readiness probe failures
- Cause: Next.js dev server listening on localhost only
- Solution: See `FRONTEND_TROUBLESHOOTING.md`

**Backend database connection errors**
```bash
kubectl logs <backend-pod> | grep -i database
kubectl get pvc  # Check persistent volume
```

**Image pull errors**
```bash
# Verify images exist
docker pull YOUR_REGISTRY/back2trade-backend:latest

# Force pull
helm upgrade back2trade k8s/back-2-trade-chart \
  --set backend.image.pullPolicy=Always
```

**Database pod stuck pending**
```bash
# Check storage (Minikube needs smaller size)
helm upgrade back2trade k8s/back-2-trade-chart \
  --set database.persistence.size=1Gi
```

### Health Checks

```bash
# Quick status
kubectl get pods,svc,pvc -l app.kubernetes.io/instance=back2trade

# Application health
curl http://localhost:3001/health  # Backend via port-forward
curl http://localhost:3000         # Frontend via port-forward
```

## Security

### Default Credentials
- Database: `back2trade:password`

### Production Checklist
- Change default database password
- Use Kubernetes secrets for sensitive data
- Set resource limits
- Enable network policies
- Use non-root containers

## Services

- Frontend: `back2trade-frontend:3000`
- Backend: `back2trade-backend:3001`
- Database: `back2trade-database:5432`

## Known Issues

1. **Frontend readiness probes failing** - Application works but pods show not ready
2. **Mixed dev/prod configuration** - Frontend uses development mode, backend uses production

See `FRONTEND_TROUBLESHOOTING.md` and `DEPLOYMENT_STATUS.md` for detailed solutions.

## CI/CD Example

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Deploy
        run: |
          docker build -t registry/backend:${{ github.sha }} k8s/backend
          docker push registry/backend:${{ github.sha }}
          helm upgrade back2trade k8s/back-2-trade-chart \
            --set backend.image.tag=${{ github.sha }}
```

## Support

1. Check `DEPLOYMENT_STATUS.md` for current issues
2. Review pod logs and events
3. Consult troubleshooting guides
4. Contact DevOps team with deployment details

---

Last Updated: September 2025
Kubernetes: 1.24+
Helm: 3.x