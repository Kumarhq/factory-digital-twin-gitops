# Factory Digital Twin - Production Dashboard

Complete factory monitoring and GitOps drift detection system with real-time analytics.

![CI](https://github.com/Kumarhq/factory-digital-twin-gitops/workflows/CI/badge.svg)
![Deploy](https://github.com/Kumarhq/factory-digital-twin-gitops/workflows/Build,%20Test,%20and%20Deploy/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-green)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-blue)
![Neo4j](https://img.shields.io/badge/Neo4j-5.16-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![React](https://img.shields.io/badge/React-18.2-blue)

> **📸 See the Dashboard in Action!** Check out the [screenshots folder](../screenshots) with 32 images demonstrating all features.

---

## 📑 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
  - [One-Command Deploy](#one-command-deploy-recommended)
  - [Docker Compose](#option-1-docker-recommended)
  - [Kubernetes](#option-2-kubernetes-deployment)
  - [Local Development](#option-3-local-development)
- [Application Features](#-application-features)
- [API Endpoints](#-api-endpoints)
- [Configuration](#-configuration)
- [Tech Stack](#-tech-stack)
- [Troubleshooting](#-troubleshooting)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎨 Features

### 1. Live Dashboard - Real-Time Factory Monitoring
- **System Performance Metrics** - CPU, memory, network usage
- **Zone Health Distribution** - ISA-95 security zones (Level 0-4)
- **Active Issues & Alerts** - Real-time problem detection
- **Asset Status Tracking** - Online/offline/degraded monitoring
- **Uptime Percentage** - SLA compliance tracking

### 2. Asset Explorer - Comprehensive Asset Management
- **Graph Visualization** - Interactive force-directed layout with ISA-95 color coding
- **Table View** - Sortable, filterable asset grid
- **Card Grid View** - Visual asset cards with key metrics
- **Team Ownership** - Engineering teams and contact information
- **Search & Filter** - Multi-criteria asset discovery

### 3. RCA Analysis - Root Cause Analysis
- **Multi-State Support** - Analysis for offline, error, failed, unreachable, degraded, warning states
- **Multi-Step Analysis** - Detailed thought process with evidence
- **Upstream Impact Tracking** - Graph traversal to find cascading failures
- **Team Contact Info** - Responsible team and escalation paths
- **Actionable Recommendations** - Status-specific remediation steps

### 4. GitOps & Drift Detection - Configuration Management
- **Intended vs Actual State** - Compare Git configuration with discovered state
- **5-Field Drift Detection** - Status, IP, version, config checksum, security zone
- **GitHub Integration** - Real repository paths and commit hashes
- **Automated Remediation** - Execute drift resolution actions
- **Historical Trends** - Drift analytics over time
- **Severity Classification** - Critical/high/medium priority assignment

### 5. AI Assistant - Intelligent Query Interface
- **Natural Language Queries** - Ask questions about factory assets
- **Context-Aware Responses** - Graph-based reasoning with LangGraph
- **Quick Query Panel** - Pre-built common queries
- **Team Information** - Find responsible engineers

### Interactive Graph Visualization
- **Force-directed graph layout** with automatic positioning
- **Color-coded nodes** by status (green=online, red=error, yellow=warning)
- **Type-specific styling** (PLCs, sensors, network devices, etc.)
- **Hover highlighting** - shows connected nodes and relationships
- **Click for details** - view complete asset information
- **Zoom & pan** - explore large graphs easily
- **Auto-zoom to fit** - optimal view on data load

### Multiple Views
1. **All Assets** - Complete knowledge graph
2. **Manufacturing** - PLCs, sensors, robots, conveyors
3. **Network** - Switches, routers, firewalls
4. **Infrastructure** - Nutanix, Kubernetes, storage, UPS
5. **Data Pipeline** - End-to-end sensor-to-storage flow

### Real-Time Updates
- **WebSocket connection** for live data
- **Auto-refresh stats** every 5 seconds
- **Live status indicators** (online/offline assets)
- **Uptime percentage tracking**

### Smart Filtering
- **Search by name** - find specific assets
- **Filter by type** - show only PLCs, sensors, etc.
- **Filter by status** - show only online or error assets
- **Multi-select filtering** - combine multiple filters

### Asset Details Panel
- **Complete properties** - all Neo4j node properties
- **Relationships** - incoming and outgoing connections
- **Physical location** - linked to Matterport 3D spaces
- **Security zone** - ISA-95 level assignment
- **Status indicators** - color-coded chips

### MCP Tools Integration
- **View all AI agents** - Network, Manufacturing, K8s, Nutanix
- **Tool capabilities** - see what each tool can do
- **Risk levels** - LOW, MEDIUM, HIGH, CRITICAL
- **Traversal strategies** - understand graph navigation
- **Asset compatibility** - see which assets can use each tool

---

## 🚀 Quick Start

### One-Command Deploy (Recommended)

```bash
# From the dashboard directory
cd /Users/Jinal/factory-digital-twin-gitops/dashboard

# Start all services (Neo4j + Backend + Frontend)
docker-compose up -d

# Initialize database with sample data
./init-database.sh

# Access the application
open http://localhost:3000
```

**That's it!** The application is now running with:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **Neo4j Browser**: http://localhost:7474 (Login: neo4j / factory_twin_2025)

**Stop Services:**
```bash
docker-compose down
```

---

### Option 1: Docker Compose (Local Development)

Perfect for local development and testing.

```bash
# Build images
./build-images.sh

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

**Ports:**
- Frontend: 3000
- Backend: 8000
- Neo4j HTTP: 7474
- Neo4j Bolt: 7687

---

### Option 2: Kubernetes Deployment

Production-ready deployment on Kubernetes cluster.

#### Prerequisites
```bash
# Verify kubectl is configured
kubectl cluster-info

# Check available nodes
kubectl get nodes
```

#### Quick Deploy
```bash
# Build and tag images
./build-images.sh v1.0.0

# Deploy to Kubernetes
./deploy-k8s.sh

# Verify deployment
kubectl get all -n factory-digital-twin

# Access via port-forward
kubectl port-forward svc/frontend-service 3000:80 -n factory-digital-twin
kubectl port-forward svc/backend-service 8000:8000 -n factory-digital-twin
```

**For detailed Kubernetes deployment instructions, see [QUICKSTART.md](./QUICKSTART.md)**

---

### Option 3: Local Development (Without Docker)

#### Backend (Terminal 1)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python main.py
# Or with uvicorn:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on http://localhost:8000

#### Frontend (Terminal 2)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on http://localhost:3000

---

## 📊 API Endpoints

### Dashboard & Statistics
- `GET /api/stats` - Overall system statistics
- `GET /api/zones` - ISA-95 security zones
- `GET /api/dashboard/metrics` - Real-time performance metrics
- `GET /api/dashboard/zone-health` - Zone health distribution
- `GET /api/dashboard/active-issues` - Current alerts and issues

### Asset Management
- `GET /api/asset/{asset_id}` - Detailed asset information
- `GET /api/assets` - List all assets with pagination
- `GET /api/assets/types` - List all asset types
- `GET /api/search/{query}` - Search assets by name/type
- `GET /api/assets/by-team/{team}` - Assets by ownership team
- `GET /api/assets/by-zone/{zone}` - Assets by security zone
- `POST /api/graph` - Get graph data with filters
- `GET /api/graph/manufacturing` - Manufacturing subgraph
- `GET /api/graph/network` - Network topology
- `GET /api/graph/infrastructure` - K8s/Nutanix infrastructure
- `GET /api/data-pipeline` - End-to-end data flow

### Root Cause Analysis (RCA)
- `GET /api/rca/{asset_name}` - Perform RCA for problematic asset
- `GET /api/rca/related-incidents/{asset_name}` - Find similar past incidents
- `GET /api/rca/upstream-impact/{asset_name}` - Analyze upstream failures
- `GET /api/teams/{team_name}` - Get team contact information

### GitOps & Drift Detection
- `GET /api/gitops/config` - Get intended GitOps configurations
- `GET /api/gitops/actual` - Get actual observed state
- `GET /api/gitops/drift` - Calculate configuration drift
- `GET /api/gitops/drift/history` - Historical drift trends
- `GET /api/gitops/drift/stats` - Drift analytics and statistics
- `POST /api/gitops/drift/resolve` - Execute drift remediation action

### AI Assistant
- `POST /api/ai/query` - Natural language query interface
- `GET /api/ai/suggestions` - Get query suggestions

### MCP Tools
- `GET /api/mcp-tools` - List all MCP agents and tools
- `POST /api/mcp-tools/{tool_id}/execute` - Execute tool (demo mode)

### Real-Time
- `WS /ws` - WebSocket for live updates

**Full Interactive API Documentation:** http://localhost:8000/docs

---

## 🎯 Usage Guide

### Viewing the Graph

1. **Start the services** (Docker or local)
2. **Open browser** to http://localhost:3000
3. **Select a view** from the tabs:
   - All Assets (default)
   - Manufacturing
   - Network
   - Infrastructure
   - Data Pipeline

### Filtering Assets

1. **Search**: Type asset name in search box
2. **Filter by type**: Select from dropdown (can select multiple)
3. **Click "Apply Filters"** to refresh graph

### Exploring Relationships

1. **Hover over a node** → highlights connected nodes
2. **Click on a node** → shows details panel on right
3. **View relationships** → incoming/outgoing connections
4. **Click Matterport link** → view 3D location (if available)

### Understanding Colors

**Status Colors:**
- 🟢 **Green** - Online/Running
- 🔴 **Red** - Error/Offline
- 🟡 **Yellow** - Warning/Degraded
- ⚪ **Gray** - Unknown status

**Type Colors:**
- 🔵 **Blue** - PLCs, Network devices
- 🟣 **Purple** - Sensors, HMIs
- 🔴 **Pink** - Robots, Industrial equipment
- 🟢 **Teal** - Conveyors, Edge gateways
- 🟠 **Orange** - UPS, Power infrastructure

### Zoom & Navigation

- **Scroll** - Zoom in/out
- **Click & drag** - Pan around
- **Click node** - Center on node
- **Auto-fit** - Graph auto-fits on data load

---

## 🔧 Configuration

### Backend Environment Variables

```bash
# .env file in backend/
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=factory_twin_2025
```

### Frontend Environment Variables

```bash
# .env file in frontend/
VITE_API_URL=http://localhost:8000
```

---

## 📦 Tech Stack

### Frontend
- **React 18.2** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Material-UI (MUI)** - Component library
- **react-force-graph** - Graph visualization
- **Axios** - HTTP client
- **WebSockets** - Real-time updates

### Backend
- **FastAPI** - Python web framework
- **Neo4j Python Driver** - Database client
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **WebSockets** - Real-time communication

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Neo4j 5.x** - Graph database

---

## 🎨 Customization

### Adding Custom Views

Edit `frontend/src/App.tsx`:

```typescript
// Add new tab
<Tab icon={<CustomIcon />} label="Custom View" />

// Add new fetch function
const fetchCustomData = async () => {
  const response = await axios.get(`${API_BASE}/api/custom-endpoint`);
  setGraphData(response.data);
};
```

### Changing Node Colors

Edit `frontend/src/components/GraphVisualization.tsx`:

```typescript
const typeColors: { [key: string]: string } = {
  CustomType: '#your-color-hex',
  // Add more types...
};
```

### Adding New API Endpoints

Edit `backend/main.py`:

```python
@app.get("/api/custom-endpoint")
def get_custom_data():
    with driver.session() as session:
        result = session.run("YOUR CYPHER QUERY")
        return [dict(record) for record in result]
```

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

**Issue:** CORS errors in browser console

**Fix:**
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    # ...
)
```

---

### Graph not loading

**Issue:** "Failed to fetch graph data"

**Checks:**
1. Backend is running: `curl http://localhost:8000/api/stats`
2. Neo4j is accessible: `docker ps | grep neo4j`
3. Network is correct: Check docker-compose.yml network name
4. Check backend logs: `docker logs factory-dashboard-api`

---

### WebSocket connection failed

**Issue:** Real-time updates not working

**Fix:**
```typescript
// frontend/src/App.tsx
const ws = new WebSocket('ws://localhost:8000/ws');
// Make sure URL matches your backend
```

---

### Docker build fails

**Issue:** "Cannot find module" or build errors

**Fix:**
```bash
# Clean and rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 📈 Performance Tips

### For Large Graphs (500+ nodes)

1. **Use filtering** - Don't load all assets at once
2. **Use specific views** - Manufacturing, Network, etc.
3. **Limit graph depth** - Modify backend queries to limit traversal depth
4. **Increase physics cooldown** - Edit `GraphVisualization.tsx`:

```typescript
<ForceGraph2D
  cooldownTicks={200}  // Increase for larger graphs
  d3AlphaDecay={0.05}  // Faster layout convergence
/>
```

---

## 🔐 Security

### Production Security Checklist

Before deploying to production:

- [ ] **Change default passwords** in `kubernetes/secret.yaml` and `docker-compose.yml`
- [ ] **Enable TLS/HTTPS** for all external endpoints (configure in Ingress)
- [ ] **Use secrets management** (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault)
- [ ] **Enable network policies** to restrict pod-to-pod communication
- [ ] **Scan Docker images** for vulnerabilities (`docker scan` or Trivy)
- [ ] **Enable authentication** on Neo4j (already configured, but change password)
- [ ] **Configure CORS** properly in backend (restrict to known origins)
- [ ] **Enable rate limiting** on API endpoints
- [ ] **Set up monitoring** with Prometheus/Grafana
- [ ] **Configure backups** for Neo4j persistent volumes
- [ ] **Review IAM roles** and service account permissions

### Environment Variables

Never commit these to Git:
- `NEO4J_PASSWORD` - Use secrets management
- API keys for external services
- GitHub tokens for GitOps integration
- Database connection strings with credentials

### Reporting Security Issues

If you discover a security vulnerability, please email: security@example.com
**Do not open a public issue.**

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Quick Contribution Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/factory-digital-twin-gitops.git
   cd factory-digital-twin-gitops/dashboard
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - **Backend**: Edit `backend/main.py`
   - **Frontend**: Edit files in `frontend/src/`
   - **Docker**: Update `Dockerfile` or `docker-compose.yml`
   - **Kubernetes**: Update manifests in `kubernetes/`

4. **Test locally**
   ```bash
   # Backend tests
   cd backend && pytest

   # Frontend tests
   cd frontend && npm test

   # Integration test
   docker-compose up -d
   ```

5. **Build and verify**
   ```bash
   ./build-images.sh
   docker-compose up -d
   ```

6. **Commit with meaningful messages**
   ```bash
   git add .
   git commit -m "feat: add drift detection for configuration checksums"
   ```

7. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Development Guidelines

- **Code Style**: Follow PEP 8 for Python, ESLint for TypeScript
- **Commits**: Use conventional commits (feat, fix, docs, chore, etc.)
- **Tests**: Add tests for new features
- **Documentation**: Update README and docstrings
- **No Breaking Changes**: Without discussion first

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 📚 Additional Resources

- **Deployment Guide**: [QUICKSTART.md](./QUICKSTART.md)
- **Detailed Deployment**: [README-DEPLOYMENT.md](./README-DEPLOYMENT.md)
- **Neo4j Cypher Manual**: https://neo4j.com/docs/cypher-manual/
- **React Force Graph**: https://github.com/vasturiano/react-force-graph
- **Material-UI**: https://mui.com/
- **FastAPI**: https://fastapi.tiangolo.com/
- **Kubernetes**: https://kubernetes.io/docs/

---

## 🚀 Next Steps After Deployment

1. **Initialize Neo4j Database**
   ```bash
   # Port-forward Neo4j browser (if using Kubernetes)
   kubectl port-forward svc/neo4j-service 7474:7474 -n factory-digital-twin

   # Run initialization script
   ./init-database.sh

   # Or access browser at http://localhost:7474
   # Login: neo4j / factory_twin_2025
   # Run Cypher from /tmp/init-factory-data.cypher
   ```

2. **Configure Ingress Domain** (Kubernetes only)
   - Edit `kubernetes/ingress.yaml`
   - Update `host` to your domain
   - Configure DNS to point to Ingress IP
   - Add TLS certificate

3. **Set Up Monitoring**
   - Install Prometheus Operator
   - Deploy Grafana
   - Configure ServiceMonitors
   - Import dashboards from `monitoring/` (if available)

4. **Enable Auto-Scaling**
   ```bash
   # Create HorizontalPodAutoscaler for backend
   kubectl autoscale deployment backend \
     --cpu-percent=70 \
     --min=3 --max=10 \
     -n factory-digital-twin
   ```

5. **Configure Backups**
   - Schedule Neo4j backups using CronJob
   - Store backups in S3/GCS/Azure Blob
   - Test restore procedures

6. **GitOps Integration**
   - Configure GitHub webhook for drift detection
   - Set up automated drift remediation
   - Configure catalog-info.yaml parsing

---

## 🎯 Roadmap

### Planned Features
- [ ] **Graph algorithms visualization** (shortest path, centrality)
- [ ] **Time-travel** (view historical states)
- [ ] **3D graph mode** (react-force-graph-3d)
- [ ] **Export graphs** (PNG, SVG, JSON)
- [ ] **Advanced drift detection** (behavioral drift, performance drift)
- [ ] **MCP tool execution** (with Guardian approval workflow)
- [ ] **Collaborative features** (multi-user annotations, comments)
- [ ] **Advanced analytics** (predictive maintenance scores, anomaly detection)
- [ ] **Mobile responsive** UI improvements
- [ ] **Multi-tenancy** support for multiple factories

---

## 📚 Additional Resources

- **Neo4j Cypher**: https://neo4j.com/docs/cypher-manual/
- **React Force Graph**: https://github.com/vasturiano/react-force-graph
- **Material-UI**: https://mui.com/
- **FastAPI**: https://fastapi.tiangolo.com/

---

## ✅ Verification Checklist

After deployment, verify:

```bash
# 1. Backend health
curl http://localhost:8000/

# 2. Get stats
curl http://localhost:8000/api/stats

# 3. Frontend accessible
open http://localhost:3000

# 4. Check containers
docker ps | grep factory-dashboard

# 5. Check logs
docker logs factory-dashboard-api
docker logs factory-dashboard-frontend
```

---

**Built with ❤️ for Factory Digital Twin**

Questions? Check the main README: `/Users/Jinal/factory-digital-twin-gitops/README.md`
