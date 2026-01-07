# Welcome to the Factory Digital Twin Wiki

**Production-Ready Factory Monitoring & GitOps Drift Detection**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)

---

## 🎯 Quick Links

### For Users
- 📖 [**Main README**](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/README.md) - Complete project overview
- 🚀 [**Quick Start Guide**](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/QUICKSTART.md) - Get started in 5 minutes
- 📸 [**Screenshots**](https://github.com/Kumarhq/factory-digital-twin-gitops/tree/main/screenshots) - 32 application screenshots

### For Developers
- 👨‍💻 [**Developer Wiki**](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/DEVELOPER_WIKI.md) - Complete technical guide (2,000+ lines)
- 🏗️ [**System Architecture**](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/docs/architecture/SYSTEM_ARCHITECTURE.md) - Architecture details
- 📡 [**API Reference**](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/docs/api/API_REFERENCE.md) - All 29+ endpoints
- 🤝 [**Contributing Guide**](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/CONTRIBUTING.md) - How to contribute

### For DevOps
- 🔄 [**CI/CD Pipeline**](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/docs/deployment/CICD_PIPELINE.md) - Complete deployment workflow
- 🐳 [**Deployment Guide**](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/README-DEPLOYMENT.md) - Docker & Kubernetes
- 🛡️ [**Security Audit**](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/SECURITY_AUDIT.md) - Security review

---

## 📖 What is Factory Digital Twin?

The Factory Digital Twin Dashboard is a **production-ready**, full-stack web application that provides:

✅ **Real-Time Monitoring** - Live dashboard with system metrics and asset health
✅ **Asset Management** - Interactive graph visualization of factory assets
✅ **Root Cause Analysis** - Automated multi-state RCA with upstream impact tracking
✅ **GitOps Drift Detection** - Compare intended (Git) vs actual (discovered) state
✅ **AI-Powered Assistant** - Natural language queries using graph reasoning

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
git clone https://github.com/Kumarhq/factory-digital-twin-gitops.git
cd factory-digital-twin-gitops/dashboard
docker-compose up -d
./init-database.sh
```

**Access**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Neo4j Browser: http://localhost:7474

### Option 2: Kubernetes

```bash
cd dashboard/kubernetes
kubectl apply -f neo4j-statefulset.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
```

See [Complete Deployment Guide](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/README-DEPLOYMENT.md) for production setup.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                        │
│               (React 18 + TypeScript + MUI)                 │
├─────────────────────────────────────────────────────────────┤
│  Live Dashboard  │  Asset Explorer  │  RCA  │  Drift  │  AI │
└──────┬──────────────────────────────────────────────┬───────┘
       │           HTTP/REST API + WebSocket          │
┌──────▼──────────────────────────────────────────────▼───────┐
│                  Backend API Server                         │
│            FastAPI + Python 3.11 + Uvicorn                  │
├─────────────────────────────────────────────────────────────┤
│  Dashboard  │  Assets  │  RCA   │  GitOps │  AI  │   WS    │
│  Service    │  Service │ Engine │ Service │ Agent│ Manager │
└──────┬──────────────────────────────────────────────────────┘
       │           Neo4j Bolt Protocol (7687)
┌──────▼──────────────────────────────────────────────────────┐
│                 Graph Database Layer                        │
│                  Neo4j 5.16 Community                       │
├─────────────────────────────────────────────────────────────┤
│  Asset Nodes │ Relationships │ GitOps Configs │ Drift Data │
└─────────────────────────────────────────────────────────────┘
```

See [System Architecture](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/docs/architecture/SYSTEM_ARCHITECTURE.md) for complete details.

---

## 🎨 Features

### 1. Live Dashboard
**Real-time factory monitoring**
- System performance metrics (CPU, memory, network)
- Zone health distribution (ISA-95 levels 0-4)
- Active issues and alerts
- Asset status tracking
- Uptime percentage

📸 Screenshots: [8.20.43 AM](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/screenshots/Screenshot%202026-01-07%20at%208.20.43%20AM.png), [8.20.53 AM](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/screenshots/Screenshot%202026-01-07%20at%208.20.53%20AM.png)

### 2. Asset Explorer
**Interactive graph visualization**
- Force-directed graph layout
- Color-coded nodes by status
- Table and card grid views
- Search and filter
- Team ownership

📸 Screenshots: [8.22.07 AM](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/screenshots/Screenshot%202026-01-07%20at%208.22.07%20AM.png), [8.22.26 AM](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/screenshots/Screenshot%202026-01-07%20at%208.22.26%20AM.png)

### 3. Root Cause Analysis
**Automated multi-state RCA**
- 6 state types (offline, error, failed, unreachable, degraded, warning)
- Upstream impact tracking (3-hop graph traversal)
- Team contact information
- Status-specific recommendations

📸 Screenshots: [8.23.33 AM](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/screenshots/Screenshot%202026-01-07%20at%208.23.33%20AM.png), [8.23.40 AM](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/screenshots/Screenshot%202026-01-07%20at%208.23.40%20AM.png)

### 4. GitOps Drift Detection
**5-field drift detection**
- Status, IP, Version, Config Checksum, Security Zone
- GitHub integration with real repo paths
- Automated remediation actions
- Historical trend analysis

📸 Screenshots: [8.24.16 AM](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/screenshots/Screenshot%202026-01-07%20at%208.24.16%20AM.png), [8.24.32 AM](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/screenshots/Screenshot%202026-01-07%20at%208.24.32%20AM.png)

### 5. AI Assistant
**Natural language queries**
- Graph-based reasoning
- Context-aware responses
- Quick query panel
- Team information lookup

📸 Screenshots: [8.25.58 AM](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/screenshots/Screenshot%202026-01-07%20at%208.25.58%20AM.png), [8.26.16 AM](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/screenshots/Screenshot%202026-01-07%20at%208.26.16%20AM.png)

---

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - UI Framework
- **TypeScript** - Type Safety
- **Material-UI (MUI) v5** - Component Library
- **react-force-graph-2d** - Graph Visualization
- **Chart.js** - Data Visualization
- **Vite** - Build Tool

### Backend
- **FastAPI 0.109** - Web Framework
- **Python 3.11** - Runtime
- **Uvicorn** - ASGI Server
- **Neo4j Driver 5.16** - Database Client
- **Pydantic 2.x** - Data Validation
- **WebSockets** - Real-time Updates

### Database
- **Neo4j 5.16 Community** - Graph Database
- **Cypher** - Query Language

### DevOps
- **Docker** 24+ - Containerization
- **Docker Compose** 2.x - Local Development
- **Kubernetes** 1.28+ - Orchestration
- **GitHub Actions** - CI/CD Pipeline
- **Trivy** - Security Scanning

---

## 📊 Project Statistics

- **Total Files**: 80+
- **Total Lines of Code**: 16,550+
- **Backend**: 3,550+ lines (Python)
- **Frontend**: 3,000+ lines (TypeScript/React)
- **Documentation**: 10,000+ lines
- **API Endpoints**: 29+
- **React Components**: 15+
- **Screenshots**: 32 images

---

## 📚 Documentation Index

### Getting Started
1. [README](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/README.md) - Main documentation
2. [Quick Start](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/QUICKSTART.md) - 5-minute setup
3. [Deployment Guide](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/README-DEPLOYMENT.md) - Production deployment

### Development
1. [Developer Wiki](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/DEVELOPER_WIKI.md) - Complete technical guide
2. [Contributing](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/CONTRIBUTING.md) - How to contribute
3. [Repository Structure](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/REPOSITORY_STRUCTURE.md) - File organization

### Architecture
1. [System Architecture](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/docs/architecture/SYSTEM_ARCHITECTURE.md) - System design
2. [GitOps Drift Detection](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/docs/architecture/GITOPS_DRIFT_DETECTION.md) - Drift detection details
3. [API Reference](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/docs/api/API_REFERENCE.md) - Complete API docs

### DevOps
1. [CI/CD Pipeline](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/docs/deployment/CICD_PIPELINE.md) - Deployment workflow
2. [Security Audit](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/SECURITY_AUDIT.md) - Security review
3. [Deployment Workflow](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/DEPLOYMENT_WORKFLOW_SUMMARY.md) - Workflow summary

### Project Management
1. [Completion Summary](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/COMPLETION_SUMMARY.md) - Achievement summary
2. [Final Status Report](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/FINAL_STATUS_REPORT.md) - Complete status
3. [v1.0.0 Release Summary](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/RELEASE_v1.0.0_SUMMARY.md) - Release notes

---

## 🔄 CI/CD Pipeline

### Automated Workflows

**1. Continuous Integration** (`ci.yml`)
- Backend tests (pytest)
- Frontend tests (Jest)
- Code linting (Flake8, ESLint)
- Type checking (mypy, TypeScript)

**2. Docker Build** (`docker-build.yml`)
- Build multi-architecture images
- Push to GitHub Container Registry
- Security scanning with Trivy

**3. Complete Deployment** (`deploy.yml`)
- **7 jobs**: Test → Build → Scan → Release → Deploy
- Auto-deploy to staging
- Manual approval for production
- Multi-architecture support (amd64, arm64)

### Deployment Flow

```
Push to main
    ↓
Test → Build → Scan → Deploy to Staging → Notify

Tag v1.0.0
    ↓
Test → Build → Scan → Create Release
    ↓
[Manual Approval] → Deploy to Production → Notify
```

---

## 🛡️ Security

### Security Features
✅ No sensitive data in repository
✅ Comprehensive .gitignore
✅ Vulnerability scanning (Trivy)
✅ Non-root containers
✅ Multi-stage Docker builds
✅ GitHub Secrets for credentials
✅ Manual approval for production

### Security Audit
**Status**: ✅ PASSED
**Date**: 2026-01-07
**Issues Found**: 0 critical, 0 high, 1 low (resolved)

See [Security Audit Report](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/SECURITY_AUDIT.md)

---

## 📞 Support & Community

### Getting Help
- 📋 [Issues](https://github.com/Kumarhq/factory-digital-twin-gitops/issues) - Report bugs or request features
- 💬 [Discussions](https://github.com/Kumarhq/factory-digital-twin-gitops/discussions) - Ask questions
- 📧 Email: support@example.com

### Contributing
We welcome contributions! See the [Contributing Guide](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/CONTRIBUTING.md) to get started.

### Code of Conduct
Please read our [Code of Conduct](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/CONTRIBUTING.md#code-of-conduct) before contributing.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Kumarhq/factory-digital-twin-gitops/blob/main/dashboard/LICENSE) file for details.

---

## 🎉 Acknowledgments

Built with:
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library
- [Neo4j](https://neo4j.com/) - Graph database
- [Material-UI](https://mui.com/) - React component library
- [Vite](https://vitejs.dev/) - Build tool

---

**Repository**: https://github.com/Kumarhq/factory-digital-twin-gitops
**Version**: 1.0.0
**Status**: 🟢 Production Ready
**Last Updated**: 2026-01-07
