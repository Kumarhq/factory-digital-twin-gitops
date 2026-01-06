# 🚀 Factory Digital Twin - Quick Start Guide

## 📦 What's Been Created

### Docker Files:
- ✅ `backend/Dockerfile` - FastAPI backend container
- ✅ `backend/requirements.txt` - Python dependencies
- ✅ `frontend/Dockerfile` - React frontend container
- ✅ `frontend/nginx.conf` - Nginx web server config
- ✅ `docker-compose.yml` - Local development orchestration

### Kubernetes Manifests:
- ✅ `kubernetes/namespace.yaml` - Namespace: factory-digital-twin
- ✅ `kubernetes/configmap.yaml` - Configuration values
- ✅ `kubernetes/secret.yaml` - Sensitive data
- ✅ `kubernetes/neo4j-statefulset.yaml` - Database deployment
- ✅ `kubernetes/backend-deployment.yaml` - API deployment (3 replicas)
- ✅ `kubernetes/frontend-deployment.yaml` - Web deployment (2 replicas)
- ✅ `kubernetes/ingress.yaml` - External access rules

### Deployment Scripts:
- ✅ `build-images.sh` - Build Docker images
- ✅ `deploy-k8s.sh` - Deploy to Kubernetes

---

## 🎯 Option 1: Local Development (Docker Compose)

### Step 1: Build Images
```bash
cd /Users/Jinal/factory-digital-twin-gitops/dashboard

# Build both frontend and backend images
./build-images.sh
```

### Step 2: Start Services
```bash
# Start all services (Neo4j, Backend, Frontend)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 3: Access Application
```
Frontend:    http://localhost:3000
Backend API: http://localhost:8000/docs
Neo4j:       http://localhost:7474
```

### Step 4: Stop Services
```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## ☸️ Option 2: Kubernetes Deployment

### Prerequisites
```bash
# Verify kubectl is configured
kubectl cluster-info

# Check available resources
kubectl get nodes
```

### Step 1: Build & Tag Images
```bash
cd /Users/Jinal/factory-digital-twin-gitops/dashboard

# Build images
./build-images.sh v1.0.0
```

### Step 2: (Optional) Push to Registry
```bash
# If using a container registry (GCR, ECR, Docker Hub)
export DOCKER_REGISTRY="your-registry.io/project"

# Tag images
docker tag factory-backend:v1.0.0 $DOCKER_REGISTRY/factory-backend:v1.0.0
docker tag factory-frontend:v1.0.0 $DOCKER_REGISTRY/factory-frontend:v1.0.0

# Push images
docker push $DOCKER_REGISTRY/factory-backend:v1.0.0
docker push $DOCKER_REGISTRY/factory-frontend:v1.0.0

# Update image references in deployment YAMLs
sed -i '' "s|image: factory-backend:latest|image: $DOCKER_REGISTRY/factory-backend:v1.0.0|g" kubernetes/backend-deployment.yaml
sed -i '' "s|image: factory-frontend:latest|image: $DOCKER_REGISTRY/factory-frontend:v1.0.0|g" kubernetes/frontend-deployment.yaml
```

### Step 3: Deploy to Kubernetes
```bash
# Deploy everything
./deploy-k8s.sh

# OR deploy manually step-by-step:

# 1. Create namespace
kubectl apply -f kubernetes/namespace.yaml

# 2. Create configs and secrets
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secret.yaml

# 3. Deploy Neo4j
kubectl apply -f kubernetes/neo4j-statefulset.yaml
kubectl wait --for=condition=ready pod -l app=neo4j -n factory-digital-twin --timeout=300s

# 4. Deploy Backend
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl wait --for=condition=ready pod -l app=backend -n factory-digital-twin --timeout=120s

# 5. Deploy Frontend
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl wait --for=condition=ready pod -l app=frontend -n factory-digital-twin --timeout=120s

# 6. (Optional) Deploy Ingress
kubectl apply -f kubernetes/ingress.yaml
```

### Step 4: Verify Deployment
```bash
# Check all resources
kubectl get all -n factory-digital-twin

# Check pods
kubectl get pods -n factory-digital-twin

# Check services
kubectl get svc -n factory-digital-twin
```

### Step 5: Access Application
```bash
# Method 1: Port forwarding (simplest)
kubectl port-forward svc/frontend-service 3000:80 -n factory-digital-twin &
kubectl port-forward svc/backend-service 8000:8000 -n factory-digital-twin &

# Access at:
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000

# Method 2: LoadBalancer (if available)
kubectl get svc frontend-service -n factory-digital-twin
# Access using EXTERNAL-IP shown

# Method 3: Ingress (if configured)
# Access using the domain configured in ingress.yaml
```

---

## 🔍 Monitoring & Debugging

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/backend -n factory-digital-twin

# Frontend logs
kubectl logs -f deployment/frontend -n factory-digital-twin

# Neo4j logs
kubectl logs -f statefulset/neo4j -n factory-digital-twin

# All logs
kubectl logs -f -l app=backend -n factory-digital-twin --all-containers=true
```

### Debug Pods
```bash
# Describe pod (see events and errors)
kubectl describe pod <pod-name> -n factory-digital-twin

# Execute commands in pod
kubectl exec -it <pod-name> -n factory-digital-twin -- /bin/bash

# Check environment variables
kubectl exec deployment/backend -n factory-digital-twin -- env | grep NEO4J
```

### Check Resources
```bash
# Resource usage
kubectl top pods -n factory-digital-twin

# Events
kubectl get events -n factory-digital-twin --sort-by='.lastTimestamp'
```

---

## 🔄 Updates & Scaling

### Update Images
```bash
# Backend update
kubectl set image deployment/backend backend=factory-backend:v1.1.0 -n factory-digital-twin

# Frontend update
kubectl set image deployment/frontend frontend=factory-frontend:v1.1.0 -n factory-digital-twin

# Check rollout status
kubectl rollout status deployment/backend -n factory-digital-twin
```

### Scale Services
```bash
# Scale backend replicas
kubectl scale deployment/backend --replicas=5 -n factory-digital-twin

# Scale frontend replicas
kubectl scale deployment/frontend --replicas=3 -n factory-digital-twin
```

### Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/backend -n factory-digital-twin

# View rollout history
kubectl rollout history deployment/backend -n factory-digital-twin
```

---

## 🧹 Cleanup

### Docker Compose
```bash
# Stop and remove containers, networks
docker-compose down

# Remove volumes too
docker-compose down -v

# Remove images
docker rmi factory-backend factory-frontend
```

### Kubernetes
```bash
# Delete entire namespace (removes everything)
kubectl delete namespace factory-digital-twin

# Or delete resources individually
kubectl delete -f kubernetes/ -n factory-digital-twin
```

---

## 🎨 Application Features

Once deployed, you'll have access to:

1. **Live Dashboard** - Real-time factory monitoring
   - System performance metrics
   - Zone health distribution
   - Active issues and alerts

2. **Asset Explorer** - Comprehensive asset management
   - Graph visualization with ISA-95 zones
   - Table view with filtering
   - Card grid view
   - Team ownership information

3. **RCA Analysis** - Root Cause Analysis
   - Multi-step analysis with LangGraph
   - Detailed thought process and evidence
   - Team contact information
   - Recommended actions

4. **GitOps & Drift Detection** - Configuration management
   - GitOps intended state vs actual state
   - Drift detection across all assets
   - Automated remediation actions
   - Historical drift trends
   - GitHub repository integration

5. **AI Assistant** - Intelligent query interface
   - Natural language queries
   - Context-aware responses
   - Quick queries panel

---

## 📊 Resource Requirements

### Minimum (Local Development):
- 8GB RAM
- 4 CPU cores
- 20GB disk space
- Docker 20.10+

### Production (Kubernetes):
- 16GB RAM (cluster-wide)
- 8 CPU cores
- 100GB persistent storage
- Kubernetes 1.24+

---

## 🔐 Security Notes

1. **Change default passwords** in `kubernetes/secret.yaml`
2. **Enable TLS** for production (configure in ingress)
3. **Use secrets management** (Vault, AWS Secrets Manager, etc.)
4. **Enable network policies** to restrict pod communication
5. **Scan images** for vulnerabilities before deployment

---

## 📞 Troubleshooting

### Issue: Backend can't connect to Neo4j
```bash
# Check Neo4j is ready
kubectl get pods -l app=neo4j -n factory-digital-twin

# Check backend environment
kubectl exec deployment/backend -n factory-digital-twin -- env | grep NEO4J

# Test connection
kubectl exec deployment/backend -n factory-digital-twin -- python -c "from neo4j import GraphDatabase; driver = GraphDatabase.driver('bolt://neo4j-service:7687', auth=('neo4j', 'factory_twin_2025')); driver.verify_connectivity(); print('Connected!')"
```

### Issue: Frontend can't reach backend
```bash
# Check nginx config
kubectl exec deployment/frontend -n factory-digital-twin -- cat /etc/nginx/conf.d/default.conf

# Check service endpoints
kubectl get endpoints -n factory-digital-twin

# Test from frontend pod
kubectl exec deployment/frontend -n factory-digital-twin -- wget -O- http://backend-service:8000/api/stats
```

### Issue: Persistent volumes not mounting
```bash
# Check PVCs
kubectl get pvc -n factory-digital-twin

# Describe PVC for issues
kubectl describe pvc neo4j-data-neo4j-0 -n factory-digital-twin

# Check storage class
kubectl get storageclass
```

---

## 🎯 Next Steps

1. **Initialize Neo4j data**:
   - Port-forward Neo4j browser: `kubectl port-forward svc/neo4j-service 7474:7474 -n factory-digital-twin`
   - Access: http://localhost:7474
   - Run initial data setup scripts

2. **Configure Ingress domain**:
   - Edit `kubernetes/ingress.yaml`
   - Update host to your domain
   - Configure DNS to point to ingress IP

3. **Set up monitoring**:
   - Install Prometheus & Grafana
   - Configure service monitors
   - Set up alerting

4. **Enable auto-scaling**:
   - Create HorizontalPodAutoscaler
   - Configure metrics server
   - Define scaling policies

5. **Backup strategy**:
   - Schedule Neo4j backups
   - Store backups in S3/GCS
   - Test restore procedures

---

## 📚 Additional Documentation

- Full deployment guide: `README-DEPLOYMENT.md`
- Architecture diagrams: See deployment guide
- API documentation: http://localhost:8000/docs (when running)

---

**Built with:**
- FastAPI (Backend)
- React + TypeScript (Frontend)
- Neo4j (Database)
- Docker & Kubernetes (Infrastructure)
