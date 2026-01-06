# Factory Digital Twin - System Architecture

## Overview

The Factory Digital Twin Dashboard is a full-stack web application that provides real-time monitoring, root cause analysis, and GitOps-based drift detection for factory assets.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                     (React + TypeScript)                        │
├─────────────────────────────────────────────────────────────────┤
│  Live Dashboard  │  Asset Explorer  │  RCA  │  Drift  │  AI    │
└────────┬─────────────────────────────────────────────┬──────────┘
         │                                              │
         │              HTTP/REST API                   │
         │              WebSocket                       │
         │                                              │
┌────────▼──────────────────────────────────────────────▼─────────┐
│                     Backend API Layer                           │
│                   (FastAPI + Python 3.11)                       │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  │  Assets  │  RCA  │  GitOps  │  AI  │  WebSocket  │
│  Endpoints  │  Mgmt    │ Engine│  Drift   │ Agent│  Handler    │
└────────┬────────────────────────────────────────────────────────┘
         │
         │              Neo4j Bolt Protocol (7687)
         │
┌────────▼─────────────────────────────────────────────────────────┐
│                     Graph Database Layer                         │
│                        (Neo4j 5.16)                             │
├──────────────────────────────────────────────────────────────────┤
│  Asset Graph  │  Relationships  │  GitOps Config  │  Drift Data │
└──────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Layer (React)

#### Technology Stack
- **React 18.2** - UI framework
- **TypeScript** - Type safety
- **Material-UI (MUI) v5** - Component library
- **react-force-graph-2d** - Graph visualization
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **WebSockets** - Real-time updates

#### Component Hierarchy
```
App.tsx
├── Navigation
│   └── Tabs (Dashboard, Assets, RCA, Drift, AI)
├── LiveDashboard.tsx
│   ├── MetricsCards
│   ├── ZoneHealthChart
│   └── ActiveIssuesTable
├── AssetExplorer.tsx
│   ├── GraphVisualization.tsx
│   ├── AssetTable.tsx
│   └── AssetCards.tsx
├── RCAAnalysis.tsx
│   ├── AssetSelector
│   ├── AnalysisResults
│   └── TeamContacts
├── GitOpsDriftDashboard.tsx
│   ├── DriftSummary
│   ├── DriftTable
│   ├── DriftDetails
│   └── HistoryChart
└── AIAssistant.tsx
    ├── QueryInput
    ├── QuickQueries
    └── ResponseDisplay
```

### 2. Backend Layer (FastAPI)

#### Technology Stack
- **FastAPI 0.109** - Web framework
- **Uvicorn** - ASGI server
- **Neo4j Driver 5.16** - Database client
- **Pydantic** - Data validation
- **Python 3.11** - Runtime

#### API Architecture
```
main.py (FastAPI Application)
├── CORS Middleware
├── WebSocket Manager
└── API Routes
    ├── /api/stats
    ├── /api/dashboard/*
    ├── /api/assets/*
    ├── /api/graph/*
    ├── /api/rca/*
    ├── /api/gitops/*
    └── /api/ai/*
```

#### Key Functions
- **Graph Queries** - Cypher query execution
- **RCA Engine** - Multi-step root cause analysis
- **Drift Detection** - GitOps vs actual state comparison
- **WebSocket** - Real-time data push
- **Team Lookup** - Ownership and contact info

### 3. Database Layer (Neo4j)

#### Graph Schema

**Node Types:**
```cypher
(:Asset {
  name: String,
  type: String,
  status: String,
  ipAddress: String,
  version: String,
  configChecksum: String,
  securityZone: String,
  location: String,
  team: String
})

(:Space {
  id: String,
  name: String,
  level: String,
  hasVirtualTour: Boolean,
  matterportUrl: String
})

(:Team {
  name: String,
  lead: String,
  contact: String,
  slack: String
})

(:GitOpsConfig {
  assetName: String,
  intendedStatus: String,
  intendedIP: String,
  intendedVersion: String,
  gitRepo: String,
  gitPath: String,
  lastCommit: String
})
```

**Relationship Types:**
```cypher
(:Asset)-[:FEEDS_DATA]->(:Asset)
(:Asset)-[:CONNECTS_TO]->(:Asset)
(:Asset)-[:POWERS]->(:Asset)
(:Asset)-[:LOCATED_IN]->(:Space)
(:Asset)-[:OWNED_BY]->(:Team)
```

## Data Flow

### 1. Asset Visualization Flow
```
User selects view → Frontend fetches /api/graph → Backend queries Neo4j
→ Cypher traversal → Returns nodes/edges → Frontend renders graph
```

### 2. RCA Analysis Flow
```
User selects asset → Frontend calls /api/rca/{asset_name}
→ Backend performs graph traversal
→ Check upstream failures (BFS up to 3 hops)
→ Generate isolated failure analysis
→ Fetch team information
→ Return comprehensive analysis
→ Frontend displays results with thought process
```

### 3. Drift Detection Flow
```
Frontend fetches /api/gitops/drift
→ Backend queries actual state from Neo4j
→ Backend fetches intended state from GitOps configs
→ Compare 5 fields: status, IP, version, checksum, zone
→ Calculate severity (critical/high/medium)
→ Generate remediation actions
→ Return drift records with GitHub metadata
→ Frontend displays drift dashboard with trends
```

### 4. Real-Time Updates Flow
```
Frontend establishes WebSocket connection
→ Backend WebSocket manager maintains connection
→ Backend detects data changes (polling/triggers)
→ Push updates via WebSocket
→ Frontend receives and updates UI reactively
```

## Deployment Architecture

### Docker Compose (Local/Development)
```
┌─────────────────────────────────────────┐
│         Docker Host                      │
│  ┌───────────────────────────────────┐  │
│  │  factory-network (bridge)         │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  neo4j                      │  │  │
│  │  │  Ports: 7474, 7687          │  │  │
│  │  │  Volume: neo4j_data         │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  backend                    │  │  │
│  │  │  Port: 8000                 │  │  │
│  │  │  Env: NEO4J_URI             │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  frontend (nginx)           │  │  │
│  │  │  Port: 3000                 │  │  │
│  │  │  Proxy: /api → backend:8000 │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Kubernetes (Production)
```
┌─────────────────────────────────────────────────────────────┐
│                  Kubernetes Cluster                          │
│  Namespace: factory-digital-twin                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Ingress (nginx)                                    │    │
│  │  - Routes /api → backend-service                    │    │
│  │  - Routes / → frontend-service                      │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Frontend Deployment (2 replicas)                   │    │
│  │  - Image: factory-frontend:latest                   │    │
│  │  - Service: ClusterIP/LoadBalancer                  │    │
│  │  - ConfigMap: nginx.conf                            │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Backend Deployment (3 replicas)                    │    │
│  │  - Image: factory-backend:latest                    │    │
│  │  - Service: ClusterIP                               │    │
│  │  - Secret: NEO4J_PASSWORD                           │    │
│  │  - ConfigMap: Environment variables                 │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Neo4j StatefulSet (1 replica)                      │    │
│  │  - Image: neo4j:5.16.0-community                    │    │
│  │  - Service: Headless (ClusterIP: None)              │    │
│  │  - PVC: neo4j-data (10Gi)                           │    │
│  │  - PVC: neo4j-logs (1Gi)                            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

### Network Security
- **ISA-95 Zones** - Assets categorized by Purdue Model levels (0-4)
- **Network Segmentation** - Kubernetes NetworkPolicies restrict pod communication
- **TLS/HTTPS** - Ingress terminates TLS for external traffic

### Authentication & Authorization
- **Neo4j Auth** - Username/password authentication
- **API Security** - CORS configured for known origins
- **Secrets Management** - Kubernetes Secrets for sensitive data

### Data Security
- **No Hardcoded Secrets** - All credentials via environment variables
- **Input Validation** - Pydantic models validate all API inputs
- **Cypher Injection Prevention** - Parameterized queries only

## Scalability

### Horizontal Scaling
- **Frontend**: 2-10 replicas (stateless, can scale freely)
- **Backend**: 3-20 replicas (stateless, API server)
- **Neo4j**: 1 replica (StatefulSet, can be clustered for HA)

### Performance Optimization
- **Connection Pooling** - Neo4j driver manages connection pool
- **Query Optimization** - Indexed properties, constrained relationships
- **Caching** - Browser caching for static assets
- **CDN** - Serve frontend assets via CDN (production)

## Monitoring & Observability

### Metrics
- **Application Metrics**: Response times, error rates, request counts
- **Database Metrics**: Query performance, connection pool usage
- **Infrastructure Metrics**: CPU, memory, disk, network

### Logging
- **Structured Logs**: JSON format for easy parsing
- **Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Centralized Logging**: Send to ELK/Loki/CloudWatch

### Health Checks
- **Liveness Probe**: Check if application is running
- **Readiness Probe**: Check if application can handle traffic
- **Startup Probe**: Check if application has started

## Disaster Recovery

### Backup Strategy
- **Neo4j Backups**: Automated daily backups to S3/GCS
- **Database Dumps**: Weekly full dumps
- **Configuration Backups**: GitOps repository (version controlled)

### Recovery Procedures
- **Database Restore**: From latest backup (RPO: 24 hours)
- **Configuration Restore**: From Git (RPO: 0 - version controlled)
- **Container Recovery**: Pull latest images, redeploy

## Future Enhancements

### Planned Features
- **Multi-tenancy** - Support multiple factories
- **Advanced Analytics** - Predictive maintenance, anomaly detection
- **3D Visualization** - React-force-graph-3d integration
- **Export Functionality** - PNG, SVG, JSON graph exports
- **Collaborative Features** - Multi-user annotations, comments

### Infrastructure Improvements
- **Service Mesh** - Istio for advanced traffic management
- **Auto-scaling** - HPA based on custom metrics
- **Multi-region** - Geo-distributed deployment
- **Caching Layer** - Redis for frequently accessed data

---

**Document Version**: 1.0
**Last Updated**: 2026-01-06
**Maintained By**: Factory Digital Twin Team
