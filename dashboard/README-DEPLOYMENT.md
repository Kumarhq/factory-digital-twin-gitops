# Factory Digital Twin - Deployment Guide

Complete Docker and Kubernetes deployment guide for the Factory Digital Twin application.

## 📦 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Kubernetes Cluster                     │
│  ┌────────────────────────────────────────────────┐    │
│  │  Namespace: factory-digital-twin               │    │
│  │                                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐            │    │
│  │  │   Frontend   │  │   Backend    │            │    │
│  │  │   (React)    │  │   (FastAPI)  │            │    │
│  │  │  Port: 80    │  │  Port: 8000  │            │    │
│  │  │  Replicas: 2 │  │  Replicas: 3 │            │    │
│  │  └──────┬───────┘  └──────┬───────┘            │    │
│  │         │                  │                     │    │
│  │         │                  │                     │    │
│  │         │          ┌───────▼────────┐           │    │
│  │         │          │     Neo4j      │           │    │
│  │         │          │  StatefulSet   │           │    │
│  │         │          │  Port: 7687    │           │    │
│  │         │          │  Replicas: 1   │           │    │
│  │         │          └────────────────┘           │    │
│  │         │                                        │    │
│  │    ┌────▼────────────────────────────┐          │    │
│  │    │         LoadBalancer            │          │    │
│  │    │    or Ingress Controller        │          │    │
│  │    └─────────────────────────────────┘          │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Local Development with Docker Compose

```bash
# 1. Build images
cd dashboard
./build-images.sh

# 2. Start services
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Neo4j Browser: http://localhost:7474
```

### Option 2: Kubernetes Deployment

```bash
# 1. Build and tag images
./build-images.sh v1.0.0

# 2. (Optional) Push to registry
export DOCKER_REGISTRY="your-registry.io/your-project"
docker push $DOCKER_REGISTRY/factory-backend:v1.0.0
docker push $DOCKER_REGISTRY/factory-frontend:v1.0.0

# 3. Update image references in K8s manifests
# Edit kubernetes/backend-deployment.yaml and kubernetes/frontend-deployment.yaml
# Change: image: factory-backend:latest
# To:     image: your-registry.io/your-project/factory-backend:v1.0.0

# 4. Deploy to Kubernetes
chmod +x deploy-k8s.sh
./deploy-k8s.sh

# 5. Access the application
kubectl port-forward svc/frontend-service 3000:80 -n factory-digital-twin
# Open: http://localhost:3000
```

## 📋 Prerequisites

### For Docker Compose:
- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum

### For Kubernetes:
- Kubernetes cluster 1.24+
- kubectl configured
- 16GB RAM minimum (cluster-wide)
- Persistent volume provisioner (for Neo4j data)
- (Optional) Ingress controller (nginx-ingress recommended)

## 🏗️ Project Structure

```
dashboard/
├── backend/
│   ├── Dockerfile              # Backend container definition
│   ├── requirements.txt        # Python dependencies
│   └── main.py                # FastAPI application
├── frontend/
│   ├── Dockerfile              # Frontend container definition
│   ├── nginx.conf              # Nginx configuration
│   ├── package.json           # Node dependencies
│   └── src/                   # React source code
├── kubernetes/
│   ├── namespace.yaml          # K8s namespace
│   ├── configmap.yaml          # Configuration
│   ├── secret.yaml             # Secrets
│   ├── neo4j-statefulset.yaml # Database
│   ├── backend-deployment.yaml # API deployment
│   ├── frontend-deployment.yaml# Web deployment
│   └── ingress.yaml            # Ingress rules
├── docker-compose.yml          # Local development
├── build-images.sh             # Image build script
└── deploy-k8s.sh               # K8s deployment script
```

## 🔧 Configuration

### Environment Variables

#### Backend:
- `NEO4J_URI`: Neo4j connection URI (default: bolt://neo4j:7687)
- `NEO4J_USER`: Neo4j username (default: neo4j)
- `NEO4J_PASSWORD`: Neo4j password (set in secrets)

#### Frontend:
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)

### Kubernetes Secrets

```bash
# Create production secrets
kubectl create secret generic factory-secrets \
  --from-literal=NEO4J_PASSWORD='your-secure-password' \
  -n factory-digital-twin
```

## 📊 Resource Requirements

### Minimum (Development):
- **Neo4j**: 2GB RAM, 1 CPU, 10GB storage
- **Backend**: 512MB RAM, 0.25 CPU per replica
- **Frontend**: 128MB RAM, 0.1 CPU per replica

### Recommended (Production):
- **Neo4j**: 4GB RAM, 2 CPU, 50GB storage
- **Backend**: 1GB RAM, 1 CPU per replica (3 replicas)
- **Frontend**: 256MB RAM, 0.5 CPU per replica (2 replicas)

## 🔍 Monitoring & Health Checks

### Health Check Endpoints:

```bash
# Backend health
curl http://backend-service:8000/api/stats

# Frontend health
curl http://frontend-service/
```

### Kubernetes Health Probes:

All services include:
- **Liveness probes**: Restart unhealthy containers
- **Readiness probes**: Remove unhealthy pods from service
- **Startup probes**: Allow time for initialization

### View Logs:

```bash
# Backend logs
kubectl logs -f deployment/backend -n factory-digital-twin

# Frontend logs
kubectl logs -f deployment/frontend -n factory-digital-twin

# Neo4j logs
kubectl logs -f statefulset/neo4j -n factory-digital-twin
```

## 🌐 Networking

### Service Types:

1. **frontend-service**: LoadBalancer (external access)
2. **backend-service**: ClusterIP (internal only)
3. **neo4j-service**: Headless (StatefulSet DNS)

### Port Forwarding for Testing:

```bash
# Frontend
kubectl port-forward svc/frontend-service 3000:80 -n factory-digital-twin

# Backend API
kubectl port-forward svc/backend-service 8000:8000 -n factory-digital-twin

# Neo4j Browser
kubectl port-forward svc/neo4j-service 7474:7474 -n factory-digital-twin
```

### Ingress Setup:

If using Ingress:

```bash
# Install nginx-ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Update ingress.yaml with your domain
# Then apply
kubectl apply -f kubernetes/ingress.yaml
```

## 🔐 Security Best Practices

1. **Use Strong Passwords**: Update Neo4j password in secrets
2. **Enable TLS**: Configure TLS certificates in Ingress
3. **Network Policies**: Restrict pod-to-pod communication
4. **RBAC**: Create service accounts with minimal permissions
5. **Image Security**: Scan images with tools like Trivy
6. **Secrets Management**: Use external secrets management (Vault, AWS Secrets Manager)

## 📈 Scaling

### Horizontal Pod Autoscaling:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: factory-digital-twin
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🐛 Troubleshooting

### Common Issues:

1. **Neo4j not starting**:
   ```bash
   kubectl describe pod neo4j-0 -n factory-digital-twin
   kubectl logs neo4j-0 -n factory-digital-twin
   ```

2. **Backend can't connect to Neo4j**:
   ```bash
   kubectl exec -it deployment/backend -n factory-digital-twin -- env | grep NEO4J
   ```

3. **Frontend can't reach backend**:
   - Check VITE_API_URL in configmap
   - Verify nginx.conf proxy settings

4. **Persistent volume issues**:
   ```bash
   kubectl get pvc -n factory-digital-twin
   kubectl describe pvc neo4j-data-neo4j-0 -n factory-digital-twin
   ```

## 🔄 Updates & Rollbacks

### Rolling Update:

```bash
# Update backend
kubectl set image deployment/backend backend=factory-backend:v1.1.0 -n factory-digital-twin

# Check rollout status
kubectl rollout status deployment/backend -n factory-digital-twin
```

### Rollback:

```bash
# Rollback to previous version
kubectl rollout undo deployment/backend -n factory-digital-twin

# Rollback to specific revision
kubectl rollout undo deployment/backend --to-revision=2 -n factory-digital-twin
```

## 🗑️ Cleanup

### Docker Compose:

```bash
docker-compose down -v  # Remove volumes too
```

### Kubernetes:

```bash
# Delete everything in namespace
kubectl delete namespace factory-digital-twin

# Or delete resources individually
kubectl delete -f kubernetes/ -n factory-digital-twin
```

## 📞 Support

For issues or questions:
1. Check logs: `kubectl logs -f deployment/backend -n factory-digital-twin`
2. Check events: `kubectl get events -n factory-digital-twin`
3. Describe resources: `kubectl describe pod <pod-name> -n factory-digital-twin`

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Neo4j Operations Manual](https://neo4j.com/docs/operations-manual/current/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
