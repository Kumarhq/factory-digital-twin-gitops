# Factory Digital Twin - Repository Structure

Complete directory structure and file organization for the Factory Digital Twin Dashboard.

## Root Directory Structure

```
factory-digital-twin-gitops/
└── dashboard/                          # Main application directory
    ├── README.md                       # Main documentation
    ├── CONTRIBUTING.md                 # Contribution guidelines
    ├── LICENSE                         # MIT License
    ├── QUICKSTART.md                   # Quick deployment guide
    ├── README-DEPLOYMENT.md            # Detailed deployment guide
    ├── SETUP-COMPLETE.md              # Setup completion summary
    ├── REPOSITORY_STRUCTURE.md         # This file
    ├── .gitignore                      # Git ignore rules
    │
    ├── .github/                        # GitHub configuration
    │   ├── workflows/                  # GitHub Actions workflows
    │   │   ├── ci.yml                 # Continuous Integration
    │   │   └── docker-build.yml       # Docker image builds
    │   ├── ISSUE_TEMPLATE/            # Issue templates
    │   │   ├── bug_report.md
    │   │   ├── feature_request.md
    │   │   └── config.yml
    │   └── PULL_REQUEST_TEMPLATE.md   # PR template
    │
    ├── docs/                           # Documentation
    │   ├── architecture/               # Architecture documentation
    │   │   ├── SYSTEM_ARCHITECTURE.md
    │   │   └── GITOPS_DRIFT_DETECTION.md
    │   ├── api/                        # API documentation
    │   │   └── API_REFERENCE.md
    │   ├── deployment/                 # Deployment guides
    │   └── guides/                     # User guides
    │
    ├── images/                         # Images and visual assets
    │   ├── README.md                   # Images documentation
    │   ├── screenshots/                # Application screenshots
    │   │   ├── dashboard/
    │   │   ├── asset-explorer/
    │   │   ├── rca/
    │   │   ├── drift/
    │   │   └── ai-assistant/
    │   ├── diagrams/                   # Architecture diagrams
    │   │   ├── architecture/
    │   │   ├── deployment/
    │   │   └── workflows/
    │   └── logos/                      # Logos and branding
    │
    ├── backend/                        # Backend (FastAPI)
    │   ├── main.py                     # Main application file (3500+ lines)
    │   ├── requirements.txt            # Python dependencies
    │   ├── Dockerfile                  # Backend Docker image
    │   ├── .dockerignore              # Docker ignore rules
    │   └── tests/                      # Backend tests (to be added)
    │       ├── test_api.py
    │       ├── test_rca.py
    │       └── test_drift.py
    │
    ├── frontend/                       # Frontend (React + TypeScript)
    │   ├── package.json                # Node.js dependencies
    │   ├── package-lock.json          # Locked dependencies
    │   ├── tsconfig.json              # TypeScript configuration
    │   ├── vite.config.ts             # Vite build configuration
    │   ├── index.html                 # HTML entry point
    │   ├── nginx.conf                 # Nginx configuration
    │   ├── Dockerfile                 # Frontend Docker image
    │   ├── .dockerignore             # Docker ignore rules
    │   ├── public/                    # Static assets
    │   │   └── favicon.ico
    │   └── src/                       # Source code
    │       ├── main.tsx               # Application entry
    │       ├── App.tsx                # Main App component
    │       ├── components/            # React components
    │       │   ├── LiveDashboard.tsx
    │       │   ├── AssetExplorer.tsx
    │       │   ├── GraphVisualization.tsx
    │       │   ├── RCAAnalysis.tsx
    │       │   ├── GitOpsDriftDashboard.tsx
    │       │   └── AIAssistant.tsx
    │       ├── types/                 # TypeScript types
    │       │   └── index.ts
    │       └── styles/                # CSS styles
    │           └── app.css
    │
    ├── kubernetes/                     # Kubernetes manifests
    │   ├── namespace.yaml             # Namespace definition
    │   ├── configmap.yaml             # Configuration
    │   ├── secret.yaml                # Secrets
    │   ├── neo4j-statefulset.yaml    # Neo4j database
    │   ├── backend-deployment.yaml    # Backend deployment
    │   ├── frontend-deployment.yaml   # Frontend deployment
    │   └── ingress.yaml               # Ingress rules
    │
    ├── docker-compose.yml             # Docker Compose configuration
    ├── build-images.sh                # Build Docker images script
    ├── deploy-k8s.sh                  # Deploy to Kubernetes script
    └── init-database.sh               # Initialize Neo4j database
```

## File Descriptions

### Root Files

| File | Purpose | Lines |
|------|---------|-------|
| `README.md` | Main documentation with complete setup instructions | ~700 |
| `CONTRIBUTING.md` | Contribution guidelines and coding standards | ~500 |
| `LICENSE` | MIT License | 21 |
| `QUICKSTART.md` | Quick deployment guide | ~400 |
| `README-DEPLOYMENT.md` | Comprehensive deployment documentation | ~500 |
| `SETUP-COMPLETE.md` | Repository setup summary | ~300 |
| `.gitignore` | Git ignore patterns | ~100 |

### Backend Files

| File | Purpose | Lines |
|------|---------|-------|
| `main.py` | FastAPI application with all endpoints and business logic | ~3550 |
| `requirements.txt` | Python dependencies (FastAPI, Neo4j, etc.) | 8 |
| `Dockerfile` | Multi-stage Docker build for backend | ~40 |
| `.dockerignore` | Files to exclude from Docker build | ~50 |

**Key Backend Features:**
- Dashboard & Statistics (lines 1-500)
- Asset Management (lines 500-1000)
- Graph Visualization (lines 1000-1300)
- Root Cause Analysis (lines 1300-2600)
- GitOps & Drift Detection (lines 3100-3550)
- WebSocket handling (lines 2900-3000)

### Frontend Files

| File | Purpose | Lines |
|------|---------|-------|
| `App.tsx` | Main application component with routing | ~800 |
| `LiveDashboard.tsx` | Real-time dashboard view | ~400 |
| `AssetExplorer.tsx` | Asset management with graph/table/card views | ~600 |
| `GraphVisualization.tsx` | Force-directed graph component | ~300 |
| `RCAAnalysis.tsx` | Root cause analysis interface | ~500 |
| `GitOpsDriftDashboard.tsx` | GitOps drift detection dashboard | ~700 |
| `AIAssistant.tsx` | AI query interface | ~300 |
| `Dockerfile` | Multi-stage build with Nginx | ~46 |
| `nginx.conf` | Nginx reverse proxy configuration | ~40 |

### Kubernetes Manifests

| File | Resources | Purpose |
|------|-----------|---------|
| `namespace.yaml` | Namespace | Create factory-digital-twin namespace |
| `configmap.yaml` | ConfigMap | Environment variables and nginx config |
| `secret.yaml` | Secret | NEO4J_PASSWORD |
| `neo4j-statefulset.yaml` | StatefulSet, Service, PVC | Neo4j database with persistent storage |
| `backend-deployment.yaml` | Deployment, Service | Backend API (3 replicas) |
| `frontend-deployment.yaml` | Deployment, Service | Frontend (2 replicas) |
| `ingress.yaml` | Ingress | External access with routing rules |

### Documentation

| File | Purpose |
|------|---------|
| `docs/architecture/SYSTEM_ARCHITECTURE.md` | Complete system architecture |
| `docs/architecture/GITOPS_DRIFT_DETECTION.md` | Drift detection deep dive |
| `docs/api/API_REFERENCE.md` | Complete API documentation |
| `images/README.md` | Image guidelines and structure |

### Scripts

| File | Purpose | Usage |
|------|---------|-------|
| `build-images.sh` | Build Docker images | `./build-images.sh [version]` |
| `deploy-k8s.sh` | Deploy to Kubernetes | `./deploy-k8s.sh [namespace]` |
| `init-database.sh` | Initialize Neo4j with sample data | `./init-database.sh [environment]` |

## File Sizes (Approximate)

```
Total Repository Size: ~15 MB (excluding node_modules)

├── backend/
│   ├── main.py                    ~150 KB
│   └── __pycache__/               ~50 KB
│
├── frontend/
│   ├── src/                       ~500 KB
│   ├── node_modules/              ~300 MB (excluded from Git)
│   └── dist/ (built)              ~2 MB
│
├── docs/                          ~200 KB
├── images/                        ~5 MB (when populated with screenshots)
└── .github/                       ~50 KB
```

## Important Paths for Development

### Running Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Running Frontend
```bash
cd frontend
npm install
npm run dev
```

### Building Docker Images
```bash
./build-images.sh v1.0.0
```

### Deploying to Kubernetes
```bash
./deploy-k8s.sh factory-digital-twin
```

## Git Workflow

### Branching Strategy
```
main                    # Production-ready code
├── develop            # Development branch
└── feature/*          # Feature branches
    ├── fix/*          # Bug fixes
    └── docs/*         # Documentation updates
```

### Typical Workflow
```bash
# Create feature branch
git checkout -b feature/new-dashboard-widget

# Make changes
git add .
git commit -m "feat(dashboard): add new performance widget"

# Push and create PR
git push origin feature/new-dashboard-widget
```

## CI/CD Pipeline

### GitHub Actions Workflows

**ci.yml** - Runs on every push/PR:
1. Backend linting (Flake8, Black)
2. Backend tests (pytest)
3. Frontend linting (ESLint)
4. Frontend tests (Jest)
5. Docker Compose integration test
6. Code coverage upload

**docker-build.yml** - Runs on push to main/tags:
1. Build backend Docker image
2. Build frontend Docker image
3. Push to GitHub Container Registry
4. Security scan with Trivy

## Dependencies

### Backend (Python)
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
neo4j==5.16.0
pydantic==2.5.3
python-multipart==0.0.6
websockets==12.0
PyYAML==6.0.1
```

### Frontend (Node.js)
```
react: ^18.2.0
typescript: ^5.0.0
@mui/material: ^5.14.0
axios: ^1.5.0
react-force-graph-2d: ^1.24.0
chart.js: ^4.4.0
```

### Infrastructure
- Docker 20.10+
- Docker Compose 2.0+
- Kubernetes 1.24+
- Neo4j 5.16.0

## Configuration Files

### Environment Variables

**Backend (.env):**
```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=factory_twin_2025
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:8000
```

### Docker Compose
- Network: `factory-network` (bridge)
- Volumes: `neo4j_data`, `neo4j_logs`
- Services: neo4j, backend, frontend

### Kubernetes
- Namespace: `factory-digital-twin`
- ConfigMap: Environment variables, nginx config
- Secret: NEO4J_PASSWORD
- PVCs: neo4j-data (10Gi), neo4j-logs (1Gi)

## Resource Requirements

### Development (Docker Compose)
- CPU: 4 cores
- RAM: 8GB
- Disk: 20GB

### Production (Kubernetes)
- Neo4j: 2-4GB RAM, 1-2 CPU, 10GB disk
- Backend: 512MB-1GB RAM, 250m-1000m CPU (per pod)
- Frontend: 128MB-256MB RAM, 100m-500m CPU (per pod)
- Total: ~16GB RAM, 8 CPU, 100GB disk

## Security Considerations

### Files to NEVER Commit
- `.env` files with secrets
- `kubernetes/secret.yaml` with real passwords
- `node_modules/`
- `venv/`, `__pycache__/`
- Database dumps with sensitive data
- Private keys, certificates

### Sensitive Paths
- `kubernetes/secret.yaml` - Change default password
- `docker-compose.yml` - Change NEO4J_AUTH
- Backend environment variables

## Backup Strategy

### What to Back Up
1. **Code**: In Git repository
2. **Database**: Neo4j data directory
3. **Configuration**: Kubernetes ConfigMaps/Secrets
4. **Documentation**: All .md files

### Not Needed to Back Up
- `node_modules/` - Recreate with npm install
- `dist/`, `build/` - Recreate with build commands
- `__pycache__/` - Generated by Python
- Docker images - Rebuild from Dockerfile

---

**Repository Version**: 1.0
**Last Updated**: 2026-01-06
**Total Files**: ~100 files
**Total Lines of Code**: ~8,000 lines (excluding node_modules)
