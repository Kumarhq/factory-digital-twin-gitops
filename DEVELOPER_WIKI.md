# Factory Digital Twin - Developer Wiki

**Complete Developer Guide for the Factory Digital Twin Dashboard**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![Neo4j](https://img.shields.io/badge/Neo4j-5.16-blue)
![Python](https://img.shields.io/badge/Python-3.11-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#-architecture)
3. [Technology Stack](#-technology-stack)
4. [Features with Screenshots](#-features-with-screenshots)
5. [Development Setup](#-development-setup)
6. [Project Structure](#-project-structure)
7. [Backend Deep Dive](#-backend-deep-dive)
8. [Frontend Deep Dive](#-frontend-deep-dive)
9. [Database Schema](#-database-schema)
10. [API Documentation](#-api-documentation)
11. [Real-Time Features](#-real-time-features)
12. [CI/CD Pipeline](#-cicd-pipeline)
13. [Deployment](#-deployment)
14. [Development Workflow](#-development-workflow)
15. [Testing](#-testing)
16. [Troubleshooting](#-troubleshooting)
17. [Contributing](#-contributing)

---

## 📖 Project Overview

### What is Factory Digital Twin?

The Factory Digital Twin Dashboard is a **production-ready**, full-stack web application that provides real-time monitoring, root cause analysis (RCA), and GitOps-based drift detection for industrial factory assets.

### Key Capabilities

- **Real-Time Monitoring** - Live dashboard with system metrics and asset health
- **Asset Management** - Interactive graph visualization of factory assets
- **Root Cause Analysis** - Automated multi-state RCA with upstream impact tracking
- **GitOps Drift Detection** - Compare intended (Git) vs actual (discovered) state
- **AI-Powered Assistant** - Natural language queries using graph reasoning

### Business Value

- **Reduce Downtime** - Proactive issue detection and automated root cause analysis
- **Improve Compliance** - GitOps-based configuration management with drift detection
- **Enhance Visibility** - Real-time factory asset monitoring across all ISA-95 levels
- **Accelerate Troubleshooting** - Multi-hop graph traversal to identify cascading failures
- **Enable Self-Service** - AI assistant for engineers to query asset information

### Repository

- **GitHub**: https://github.com/Kumarhq/factory-digital-twin-gitops
- **License**: MIT
- **Version**: 1.0.0

---

## 🏗️ Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Browser / Client                          │
│                    (React 18 + TypeScript + MUI)                    │
├─────────────────────────────────────────────────────────────────────┤
│   Live      │   Asset    │    RCA      │   GitOps   │     AI       │
│  Dashboard  │  Explorer  │  Analysis   │   Drift    │  Assistant   │
└──────┬──────────────────────────────────────────────────────┬───────┘
       │                                                       │
       │           HTTP/REST API (Port 8000)                  │
       │           WebSocket (/ws)                            │
       │                                                       │
┌──────▼───────────────────────────────────────────────────────▼──────┐
│                        Backend API Server                           │
│                  FastAPI + Python 3.11 + Uvicorn                    │
├──────────────────────────────────────────────────────────────────────┤
│  Dashboard  │  Assets   │   RCA     │  GitOps  │   AI    │   WS    │
│  Service    │  Service  │  Engine   │  Service │  Agent  │ Manager │
└──────┬───────────────────────────────────────────────────────────────┘
       │
       │           Neo4j Bolt Protocol (Port 7687)
       │
┌──────▼───────────────────────────────────────────────────────────────┐
│                      Graph Database Layer                            │
│                         Neo4j 5.16 Community                         │
├──────────────────────────────────────────────────────────────────────┤
│  Asset       │  Relationships │  GitOps      │  Drift    │  Issue   │
│  Nodes       │  (CONNECTS_TO, │  Configs     │  Events   │  Tracking│
│  (PLC, HMI,  │   OWNS, etc)   │  (Intended   │  (Actual  │          │
│   Sensor)    │                │   State)     │   State)  │          │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Layer

```
src/
├── App.tsx                         # Main application component
├── components/
│   ├── LiveDashboard.tsx           # Real-time metrics and alerts
│   ├── AssetExplorer.tsx           # Graph visualization
│   ├── RCAAnalysis.tsx             # Root cause analysis
│   ├── GitOpsDriftDashboard.tsx    # Drift detection
│   └── AIAssistant.tsx             # Natural language queries
├── services/
│   └── api.ts                      # Axios HTTP client
└── types/
    └── index.ts                    # TypeScript interfaces
```

#### Backend Layer

```
backend/
├── main.py                         # FastAPI application entry
├── routers/
│   ├── dashboard.py                # Dashboard endpoints
│   ├── assets.py                   # Asset management
│   ├── rca.py                      # Root cause analysis
│   ├── gitops.py                   # Drift detection
│   └── ai.py                       # AI assistant
├── services/
│   ├── neo4j_service.py            # Database connection
│   ├── rca_engine.py               # RCA logic
│   └── drift_detector.py           # Drift detection logic
└── models/
    └── schemas.py                  # Pydantic models
```

### Data Flow Architecture

#### 1. Real-Time Monitoring Flow

```
User Browser
    ↓ (WebSocket Connection)
WebSocket Manager (Backend)
    ↓ (Query every 5s)
Neo4j Database
    ↓ (Asset status, metrics)
WebSocket Manager
    ↓ (Push updates)
Live Dashboard (Frontend)
    ↓ (Re-render)
User sees real-time updates
```

#### 2. Root Cause Analysis Flow

```
User selects problematic asset
    ↓ (HTTP POST /api/rca/analyze)
RCA Engine (Backend)
    ↓ (1. Get asset details)
    ↓ (2. Find upstream dependencies - 3 hops)
    ↓ (3. Identify root causes)
    ↓ (4. Generate recommendations)
Neo4j Graph Traversal
    ↓ (Cypher queries with MATCH patterns)
RCA Results
    ↓ (JSON response)
Frontend displays analysis
```

#### 3. GitOps Drift Detection Flow

```
GitOps Repository (Source of Truth)
    ↓ (catalog-info.yaml files)
Intended State
    ↓ (Load into Neo4j)
            ╱         ╲
           ╱           ╲
    Intended        Actual
     State          State
       ↓              ↓
       └──── Compare ────┘
              ↓
        Drift Detection
         (5 fields)
              ↓
    Status | IP | Version | Config | Zone
              ↓
        Drift Events
              ↓
    User sees drift dashboard
```

### Deployment Architecture

#### Docker Compose (Development)

```
┌─────────────────────────────────────────────────────┐
│              Docker Host (localhost)                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐  ┌─────────────────┐         │
│  │    Frontend     │  │    Backend      │         │
│  │   (React:5173)  │  │ (FastAPI:8000)  │         │
│  │   nginx:alpine  │  │  python:3.11    │         │
│  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                   │
│           └────────┬───────────┘                   │
│                    │                               │
│           ┌────────▼────────┐                      │
│           │     Neo4j       │                      │
│           │  (Port 7474,    │                      │
│           │   7687)         │                      │
│           │  neo4j:5.16     │                      │
│           └─────────────────┘                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Kubernetes (Production)

```
┌─────────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Ingress Controller                 │   │
│  │         (NGINX or Traefik)                      │   │
│  └───────┬──────────────────────────┬──────────────┘   │
│          │                          │                   │
│   ┌──────▼──────────┐      ┌───────▼────────┐         │
│   │   Frontend      │      │    Backend     │         │
│   │   Deployment    │      │   Deployment   │         │
│   │   (3 replicas)  │      │   (3 replicas) │         │
│   │   LoadBalancer  │      │   ClusterIP    │         │
│   └─────────────────┘      └───────┬────────┘         │
│                                    │                   │
│                           ┌────────▼────────┐          │
│                           │   Neo4j         │          │
│                           │   StatefulSet   │          │
│                           │   (1 replica)   │          │
│                           │   PVC Storage   │          │
│                           └─────────────────┘          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Security Layers                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Network Layer                                       │
│     ├── TLS/HTTPS (Ingress)                            │
│     ├── Network Policies (K8s)                         │
│     └── Firewall Rules                                 │
│                                                         │
│  2. Application Layer                                   │
│     ├── CORS Configuration                             │
│     ├── Input Validation (Pydantic)                    │
│     └── SQL Injection Prevention (Parameterized)       │
│                                                         │
│  3. Container Layer                                     │
│     ├── Non-root Users                                 │
│     ├── Minimal Base Images (Alpine/Slim)              │
│     └── Multi-stage Builds                             │
│                                                         │
│  4. CI/CD Layer                                         │
│     ├── Vulnerability Scanning (Trivy)                 │
│     ├── Security Alerts (GitHub Security)              │
│     ├── SARIF Upload                                   │
│     └── Manual Approval (Production)                   │
│                                                         │
│  5. Secret Management                                   │
│     ├── Environment Variables                          │
│     ├── Kubernetes Secrets                             │
│     └── GitHub Secrets                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2 | UI Framework |
| **TypeScript** | 5.x | Type Safety |
| **Material-UI (MUI)** | 5.x | Component Library |
| **react-force-graph-2d** | 1.x | Graph Visualization |
| **Chart.js** | 4.x | Charts & Analytics |
| **Axios** | 1.x | HTTP Client |
| **Vite** | 5.x | Build Tool |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.109 | Web Framework |
| **Python** | 3.11 | Runtime |
| **Uvicorn** | 0.27 | ASGI Server |
| **Neo4j Driver** | 5.16 | Database Client |
| **Pydantic** | 2.x | Data Validation |
| **WebSockets** | - | Real-time Updates |

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **Neo4j** | 5.16 Community | Graph Database |
| **Cypher** | - | Query Language |

### DevOps

| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | 24+ | Containerization |
| **Docker Compose** | 2.x | Local Development |
| **Kubernetes** | 1.28+ | Orchestration |
| **GitHub Actions** | - | CI/CD Pipeline |
| **Trivy** | Latest | Security Scanning |

### Monitoring & Visualization

| Technology | Purpose |
|------------|---------|
| **WebSocket** | Real-time data push |
| **Force-directed Graph** | Asset relationship visualization |
| **Chart.js** | Metrics and analytics |

---

## 📸 Features with Screenshots

### 1. Live Dashboard - Real-Time Factory Monitoring

**Purpose**: Monitor factory-wide health, performance metrics, and active issues in real-time.

**Key Features**:
- System performance metrics (CPU, memory, network)
- Zone health distribution (ISA-95 levels 0-4)
- Active issues and alerts
- Asset status tracking (online/offline/degraded)
- Uptime percentage tracking

**Screenshots**:
- See: `screenshots/Screenshot 2026-01-07 at 8.20.43 AM.png` - Live Dashboard main view
- See: `screenshots/Screenshot 2026-01-07 at 8.20.53 AM.png` - Metrics cards

**Technical Implementation**:
```typescript
// LiveDashboard.tsx
const LiveDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // Initial load
    fetchDashboardStats();

    // WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStats(data);
    };

    return () => ws.close();
  }, []);

  return (
    <Grid container spacing={3}>
      <MetricsCards stats={stats} />
      <ZoneHealthChart zones={stats?.zones} />
      <ActiveIssuesTable issues={stats?.active_issues} />
    </Grid>
  );
};
```

**Backend Endpoint**:
```python
# dashboard.py
@router.get("/api/stats")
async def get_dashboard_stats():
    query = """
    MATCH (a:Asset)
    RETURN
      count(a) as total_assets,
      count(CASE WHEN a.status = 'online' THEN 1 END) as online_assets,
      count(CASE WHEN a.status IN ['error', 'failed'] THEN 1 END) as error_assets
    """
    result = await neo4j_service.execute_query(query)
    return result
```

---

### 2. Asset Explorer - Interactive Graph Visualization

**Purpose**: Explore factory assets through interactive graph, table, and card views.

**Key Features**:
- Force-directed graph layout with automatic positioning
- Color-coded nodes by status (green=online, red=error, yellow=warning)
- Type-specific styling (PLCs, sensors, network devices)
- Hover highlighting with connected nodes
- Click for asset details
- Multiple view modes (graph, table, cards)
- Search and filter capabilities

**Screenshots**:
- See: `screenshots/Screenshot 2026-01-07 at 8.22.07 AM.png` - Graph visualization
- See: `screenshots/Screenshot 2026-01-07 at 8.22.26 AM.png` - Table view
- See: `screenshots/Screenshot 2026-01-07 at 8.23.11 AM.png` - Card grid view

**Technical Implementation**:
```typescript
// AssetExplorer.tsx
import ForceGraph2D from 'react-force-graph-2d';

const AssetExplorer = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  const nodeColor = (node: any) => {
    if (node.status === 'online') return '#4caf50';
    if (node.status === 'error') return '#f44336';
    if (node.status === 'warning') return '#ff9800';
    return '#9e9e9e';
  };

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="name"
      nodeColor={nodeColor}
      linkDirectionalArrowLength={3.5}
      onNodeClick={handleNodeClick}
      onNodeHover={handleNodeHover}
    />
  );
};
```

**Graph Query**:
```python
# assets.py
@router.get("/api/graph/all")
async def get_asset_graph():
    query = """
    MATCH (a:Asset)
    OPTIONAL MATCH (a)-[r]->(b:Asset)
    RETURN
      collect(DISTINCT {
        id: id(a),
        name: a.name,
        type: a.type,
        status: a.status,
        zone: a.zone
      }) as nodes,
      collect({
        source: id(a),
        target: id(b),
        type: type(r)
      }) as links
    """
    return await neo4j_service.execute_query(query)
```

---

### 3. RCA Analysis - Root Cause Analysis

**Purpose**: Automated root cause analysis with multi-state support and upstream impact tracking.

**Key Features**:
- Multi-state support (offline, error, failed, unreachable, degraded, warning)
- Detailed analysis with thought process and evidence
- Upstream impact tracking (3-hop graph traversal)
- Team contact information and escalation paths
- Status-specific recommendations
- Cascading failure detection

**Screenshots**:
- See: `screenshots/Screenshot 2026-01-07 at 8.23.33 AM.png` - RCA analysis interface
- See: `screenshots/Screenshot 2026-01-07 at 8.23.40 AM.png` - Root cause results
- See: `screenshots/Screenshot 2026-01-07 at 8.23.50 AM.png` - Upstream impact

**Technical Implementation**:
```python
# rca_engine.py
class RCAEngine:
    async def analyze(self, asset_id: str, status: str):
        # Step 1: Get asset details
        asset = await self.get_asset_details(asset_id)

        # Step 2: Find upstream dependencies (3 hops)
        upstream_query = """
        MATCH path = (a:Asset {id: $asset_id})<-[:CONNECTS_TO|DEPENDS_ON*1..3]-(upstream)
        WHERE upstream.status IN ['error', 'failed', 'offline']
        RETURN upstream, length(path) as hops
        ORDER BY hops ASC
        """
        upstream_assets = await self.execute_query(upstream_query, {"asset_id": asset_id})

        # Step 3: Identify root causes
        root_causes = self.identify_root_causes(upstream_assets)

        # Step 4: Generate recommendations
        recommendations = self.generate_recommendations(asset, status, root_causes)

        return {
            "asset": asset,
            "status": status,
            "root_causes": root_causes,
            "upstream_impact": upstream_assets,
            "recommendations": recommendations,
            "team": await self.get_responsible_team(asset)
        }
```

**RCA Algorithm**:
```
1. Get problematic asset details
   ├── Name, type, status, zone
   └── Current configuration

2. Graph traversal (upstream)
   ├── Follow incoming edges (CONNECTS_TO, DEPENDS_ON)
   ├── Traverse up to 3 hops
   └── Filter for error/failed/offline status

3. Root cause identification
   ├── Check if upstream assets are failing
   ├── Identify the closest failing upstream
   └── Determine if it's cascading failure

4. Generate recommendations
   ├── Status-specific actions
   ├── Escalation paths
   └── Team contacts
```

---

### 4. GitOps Drift Detection - Configuration Management

**Purpose**: Detect and remediate drift between intended (Git) and actual (discovered) state.

**Key Features**:
- 5-field drift detection (Status, IP, Version, Config Checksum, Security Zone)
- Severity classification (Critical, High, Medium)
- GitHub integration with real repository paths and commit hashes
- Automated remediation actions
- Historical trend analysis
- Drift analytics over time

**Screenshots**:
- See: `screenshots/Screenshot 2026-01-07 at 8.24.16 AM.png` - Drift dashboard
- See: `screenshots/Screenshot 2026-01-07 at 8.24.32 AM.png` - Drift details
- See: `screenshots/Screenshot 2026-01-07 at 8.24.38 AM.png` - Remediation actions

**Technical Implementation**:
```python
# drift_detector.py
class DriftDetector:
    DRIFT_FIELDS = [
        ("status", "critical"),      # Status changes are critical
        ("ip_address", "high"),      # IP changes are high priority
        ("version", "high"),         # Version drift is high priority
        ("config_checksum", "medium"),  # Config drift is medium
        ("security_zone", "high")    # Zone changes are high priority
    ]

    async def detect_drift(self, asset_id: str):
        query = """
        MATCH (intended:GitOpsConfig {asset_id: $asset_id})
        MATCH (actual:Asset {id: $asset_id})
        RETURN
          intended.status as intended_status,
          actual.status as actual_status,
          intended.ip_address as intended_ip,
          actual.ip_address as actual_ip,
          intended.version as intended_version,
          actual.version as actual_version,
          intended.config_checksum as intended_checksum,
          actual.config_checksum as actual_checksum,
          intended.security_zone as intended_zone,
          actual.security_zone as actual_zone,
          intended.git_repo as git_repo,
          intended.git_commit as git_commit
        """

        result = await self.execute_query(query, {"asset_id": asset_id})

        drifts = []
        for field, severity in self.DRIFT_FIELDS:
            intended_value = result[f"intended_{field}"]
            actual_value = result[f"actual_{field}"]

            if intended_value != actual_value:
                drifts.append({
                    "field": field,
                    "intended": intended_value,
                    "actual": actual_value,
                    "severity": severity,
                    "git_repo": result["git_repo"],
                    "git_commit": result["git_commit"]
                })

        return drifts
```

**Drift Detection Flow**:
```
GitOps Repository
    ↓
catalog-info.yaml
    ↓
Parse YAML → Intended State
    ↓
Load into Neo4j (GitOpsConfig nodes)
    ↓
Compare with Actual State (Asset nodes)
    ↓
    For each field:
      - status
      - ip_address
      - version
      - config_checksum
      - security_zone
    ↓
    If intended ≠ actual:
      ↓
      Create DriftEvent with:
        - field name
        - intended value
        - actual value
        - severity (critical/high/medium)
        - timestamp
        - git_repo path
        - git_commit hash
    ↓
Display in Drift Dashboard
```

---

### 5. AI Assistant - Natural Language Queries

**Purpose**: Enable engineers to query asset information using natural language.

**Key Features**:
- Natural language processing
- Graph-based reasoning
- Context-aware responses
- Quick query panel with common questions
- Team information lookup
- Asset discovery by name, type, or status

**Screenshots**:
- See: `screenshots/Screenshot 2026-01-07 at 8.25.58 AM.png` - AI Assistant interface
- See: `screenshots/Screenshot 2026-01-07 at 8.26.16 AM.png` - Query results

**Technical Implementation**:
```python
# ai.py
@router.post("/api/ai/query")
async def ai_query(request: AIQueryRequest):
    # Parse natural language query
    intent = parse_intent(request.query)

    if intent == "find_asset":
        asset_name = extract_asset_name(request.query)
        query = """
        MATCH (a:Asset)
        WHERE a.name CONTAINS $name
        RETURN a
        """
        result = await neo4j_service.execute_query(query, {"name": asset_name})

    elif intent == "check_status":
        query = """
        MATCH (a:Asset {name: $name})
        RETURN a.status as status, a.last_seen as last_seen
        """
        result = await neo4j_service.execute_query(query, {"name": asset_name})

    elif intent == "find_team":
        query = """
        MATCH (a:Asset {name: $name})-[:OWNED_BY]->(t:Team)
        RETURN t.name as team, t.contact as contact
        """
        result = await neo4j_service.execute_query(query, {"name": asset_name})

    return {
        "query": request.query,
        "intent": intent,
        "result": result
    }
```

---

## 🚀 Development Setup

### Prerequisites

- **Docker** 24+ and Docker Compose 2.x
- **Python** 3.11+
- **Node.js** 20+
- **Git**

### Quick Start (Docker Compose)

**1. Clone the repository**:
```bash
git clone https://github.com/Kumarhq/factory-digital-twin-gitops.git
cd factory-digital-twin-gitops/dashboard
```

**2. Start all services**:
```bash
docker-compose up -d
```

**3. Initialize the database**:
```bash
./init-database.sh
```

**4. Access the application**:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Neo4j Browser**: http://localhost:7474

### Local Development Setup

#### Backend Setup

**1. Create virtual environment**:
```bash
cd dashboard/backend
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**2. Install dependencies**:
```bash
pip install -r requirements.txt
```

**3. Configure environment**:
```bash
cp .env.example .env
# Edit .env with your Neo4j credentials
```

**4. Run the backend**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

**1. Install dependencies**:
```bash
cd dashboard/frontend
npm install
```

**2. Configure API URL**:
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env
```

**3. Run the frontend**:
```bash
npm run dev
```

#### Neo4j Setup

**Option 1: Docker**:
```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password123 \
  neo4j:5.16-community
```

**Option 2: Local Installation**:
```bash
# macOS
brew install neo4j
neo4j start

# Linux
sudo apt-get install neo4j
sudo systemctl start neo4j
```

---

## 📁 Project Structure

```
factory-digital-twin-gitops/
├── dashboard/                          # Main dashboard application
│   ├── backend/                        # FastAPI backend (3,550+ lines)
│   │   ├── main.py                     # FastAPI app entry point
│   │   ├── routers/                    # API route handlers
│   │   │   ├── dashboard.py            # Dashboard endpoints (13 endpoints)
│   │   │   ├── assets.py               # Asset management (8 endpoints)
│   │   │   ├── rca.py                  # Root cause analysis (3 endpoints)
│   │   │   ├── gitops.py               # Drift detection (5 endpoints)
│   │   │   └── ai.py                   # AI assistant (2 endpoints)
│   │   ├── services/                   # Business logic
│   │   │   ├── neo4j_service.py        # Database connection pool
│   │   │   ├── rca_engine.py           # RCA algorithm
│   │   │   └── drift_detector.py       # Drift detection logic
│   │   ├── models/                     # Data models
│   │   │   └── schemas.py              # Pydantic models
│   │   ├── requirements.txt            # Python dependencies
│   │   └── Dockerfile                  # Backend container
│   │
│   ├── frontend/                       # React frontend (3,000+ lines)
│   │   ├── src/
│   │   │   ├── App.tsx                 # Main component
│   │   │   ├── components/             # React components (15 files)
│   │   │   │   ├── LiveDashboard.tsx   # Real-time monitoring
│   │   │   │   ├── AssetExplorer.tsx   # Graph visualization
│   │   │   │   ├── RCAAnalysis.tsx     # Root cause analysis
│   │   │   │   ├── GitOpsDriftDashboard.tsx  # Drift detection
│   │   │   │   └── AIAssistant.tsx     # AI queries
│   │   │   ├── services/
│   │   │   │   └── api.ts              # Axios client
│   │   │   └── types/
│   │   │       └── index.ts            # TypeScript types
│   │   ├── package.json                # Node dependencies
│   │   ├── tsconfig.json               # TypeScript config
│   │   ├── vite.config.ts              # Vite build config
│   │   └── Dockerfile                  # Frontend container
│   │
│   ├── kubernetes/                     # K8s manifests
│   │   ├── backend-deployment.yaml     # Backend deployment (3 replicas)
│   │   ├── frontend-deployment.yaml    # Frontend deployment (3 replicas)
│   │   ├── neo4j-statefulset.yaml      # Neo4j stateful set
│   │   ├── ingress.yaml                # Ingress rules
│   │   └── configmap.yaml              # Configuration
│   │
│   ├── docs/                           # Documentation (10,000+ lines)
│   │   ├── architecture/
│   │   │   ├── SYSTEM_ARCHITECTURE.md  # System architecture
│   │   │   └── GITOPS_DRIFT_DETECTION.md  # Drift detection details
│   │   ├── api/
│   │   │   └── API_REFERENCE.md        # Complete API docs (29+ endpoints)
│   │   └── deployment/
│   │       └── CICD_PIPELINE.md        # CI/CD documentation
│   │
│   ├── .github/workflows/              # CI/CD workflows
│   │   ├── ci.yml                      # Continuous Integration
│   │   ├── docker-build.yml            # Docker image builds
│   │   └── deploy.yml                  # Complete deployment (7 jobs)
│   │
│   ├── docker-compose.yml              # Local development
│   ├── init-database.sh                # Database initialization
│   ├── README.md                       # Main documentation
│   ├── QUICKSTART.md                   # Quick start guide
│   ├── CONTRIBUTING.md                 # Contributing guidelines
│   └── LICENSE                         # MIT License
│
├── screenshots/                        # Application screenshots (32 images)
│   ├── README.md                       # Screenshot gallery index
│   └── *.png                           # PNG screenshots (~15 MB)
│
└── DEVELOPER_WIKI.md                   # This file

Total Files: 80+
Total Lines: 16,550+
Documentation: 10,000+ lines
```

### Key Directories

#### Backend (`dashboard/backend/`)
- **`main.py`**: FastAPI application, CORS, WebSocket manager, route registration
- **`routers/`**: API endpoints organized by feature (dashboard, assets, RCA, GitOps, AI)
- **`services/`**: Business logic (Neo4j connection, RCA engine, drift detector)
- **`models/`**: Pydantic models for request/response validation

#### Frontend (`dashboard/frontend/`)
- **`src/App.tsx`**: Main application with navigation tabs
- **`src/components/`**: React components for each feature
- **`src/services/api.ts`**: Axios HTTP client with base configuration
- **`src/types/`**: TypeScript interfaces and types

#### Kubernetes (`dashboard/kubernetes/`)
- **Deployments**: Backend (3 replicas), Frontend (3 replicas)
- **StatefulSet**: Neo4j with persistent storage
- **Services**: ClusterIP, LoadBalancer
- **Ingress**: HTTP routing rules

#### Documentation (`dashboard/docs/`)
- **Architecture**: System design, component details, data flow
- **API**: Complete endpoint reference with examples
- **Deployment**: CI/CD pipeline, Docker, Kubernetes guides

---

## 🔧 Backend Deep Dive

### FastAPI Application Structure

#### main.py - Application Entry Point

```python
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from routers import dashboard, assets, rca, gitops, ai
import asyncio

# Initialize FastAPI app
app = FastAPI(
    title="Factory Digital Twin API",
    version="1.0.0",
    description="Real-time factory monitoring with GitOps drift detection"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(assets.router, prefix="/api", tags=["Assets"])
app.include_router(rca.router, prefix="/api", tags=["RCA"])
app.include_router(gitops.router, prefix="/api", tags=["GitOps"])
app.include_router(ai.router, prefix="/api", tags=["AI"])

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Send stats every 5 seconds
            stats = await get_dashboard_stats()
            await manager.broadcast(stats)
            await asyncio.sleep(5)
    except Exception as e:
        self.active_connections.remove(websocket)

@app.get("/")
async def root():
    return {"message": "Factory Digital Twin API", "version": "1.0.0"}
```

### Neo4j Integration

#### neo4j_service.py - Database Connection

```python
from neo4j import AsyncGraphDatabase
import os

class Neo4jService:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password123")
        self.driver = None

    async def connect(self):
        self.driver = AsyncGraphDatabase.driver(
            self.uri,
            auth=(self.user, self.password)
        )

    async def close(self):
        if self.driver:
            await self.driver.close()

    async def execute_query(self, query: str, parameters: dict = None):
        async with self.driver.session() as session:
            result = await session.run(query, parameters or {})
            records = await result.data()
            return records

    async def execute_write(self, query: str, parameters: dict = None):
        async with self.driver.session() as session:
            result = await session.run(query, parameters or {})
            await result.consume()
            return True

# Singleton instance
neo4j_service = Neo4jService()
```

### API Endpoints

#### Dashboard Endpoints (dashboard.py)

```python
from fastapi import APIRouter, HTTPException
from services.neo4j_service import neo4j_service

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    """Get real-time dashboard statistics"""
    query = """
    MATCH (a:Asset)
    WITH
      count(a) as total,
      sum(CASE WHEN a.status = 'online' THEN 1 ELSE 0 END) as online,
      sum(CASE WHEN a.status IN ['error', 'failed'] THEN 1 ELSE 0 END) as errors
    RETURN {
      total_assets: total,
      online_assets: online,
      error_assets: errors,
      uptime_percentage: (online * 100.0 / total)
    } as stats
    """
    result = await neo4j_service.execute_query(query)
    return result[0]["stats"]

@router.get("/zones")
async def get_zone_health():
    """Get asset distribution by ISA-95 security zone"""
    query = """
    MATCH (a:Asset)
    RETURN
      a.zone as zone,
      count(a) as count,
      sum(CASE WHEN a.status = 'online' THEN 1 ELSE 0 END) as healthy
    ORDER BY a.zone
    """
    result = await neo4j_service.execute_query(query)
    return result

@router.get("/active-issues")
async def get_active_issues():
    """Get current active issues"""
    query = """
    MATCH (a:Asset)
    WHERE a.status IN ['error', 'failed', 'degraded']
    MATCH (a)-[:OWNED_BY]->(t:Team)
    RETURN {
      asset: a.name,
      type: a.type,
      status: a.status,
      zone: a.zone,
      team: t.name,
      last_seen: a.last_seen
    } as issue
    ORDER BY a.last_seen DESC
    LIMIT 10
    """
    result = await neo4j_service.execute_query(query)
    return [r["issue"] for r in result]
```

#### RCA Endpoints (rca.py)

```python
from fastapi import APIRouter
from services.rca_engine import RCAEngine

router = APIRouter()
rca_engine = RCAEngine()

@router.post("/rca/analyze")
async def analyze_root_cause(asset_id: str, status: str):
    """
    Perform root cause analysis for a problematic asset.

    Algorithm:
    1. Get asset details
    2. Find upstream dependencies (3 hops)
    3. Identify root causes
    4. Generate recommendations
    """
    analysis = await rca_engine.analyze(asset_id, status)
    return analysis

@router.get("/rca/problematic-assets")
async def get_problematic_assets():
    """Get all assets with error/failed/degraded status"""
    query = """
    MATCH (a:Asset)
    WHERE a.status IN ['error', 'failed', 'offline', 'degraded', 'warning', 'unreachable']
    RETURN a
    ORDER BY a.status
    """
    result = await neo4j_service.execute_query(query)
    return result
```

### RCA Engine Implementation

```python
# rca_engine.py
class RCAEngine:
    def __init__(self):
        self.neo4j = neo4j_service

    async def analyze(self, asset_id: str, status: str):
        # Step 1: Get asset details
        asset = await self.get_asset_details(asset_id)

        # Step 2: Find upstream dependencies
        upstream_assets = await self.find_upstream_dependencies(asset_id)

        # Step 3: Identify root causes
        root_causes = self.identify_root_causes(upstream_assets, status)

        # Step 4: Get team information
        team = await self.get_responsible_team(asset_id)

        # Step 5: Generate recommendations
        recommendations = self.generate_recommendations(asset, status, root_causes)

        return {
            "asset": asset,
            "status": status,
            "thought_process": self.explain_reasoning(asset, upstream_assets, root_causes),
            "evidence": self.gather_evidence(upstream_assets),
            "root_causes": root_causes,
            "upstream_impact": upstream_assets,
            "team": team,
            "recommendations": recommendations
        }

    async def find_upstream_dependencies(self, asset_id: str):
        """Find upstream assets that this asset depends on (3 hops)"""
        query = """
        MATCH path = (a:Asset {id: $asset_id})<-[:CONNECTS_TO|DEPENDS_ON*1..3]-(upstream)
        RETURN
          upstream,
          length(path) as hops,
          [rel in relationships(path) | type(rel)] as relationship_types
        ORDER BY hops ASC
        """
        result = await self.neo4j.execute_query(query, {"asset_id": asset_id})
        return result

    def identify_root_causes(self, upstream_assets, current_status):
        """Identify potential root causes from upstream assets"""
        root_causes = []

        for asset in upstream_assets:
            if asset["upstream"]["status"] in ["error", "failed", "offline"]:
                root_causes.append({
                    "asset": asset["upstream"]["name"],
                    "status": asset["upstream"]["status"],
                    "hops": asset["hops"],
                    "relationship": asset["relationship_types"],
                    "confidence": self.calculate_confidence(asset, current_status)
                })

        # Sort by confidence (hops + status severity)
        root_causes.sort(key=lambda x: (x["hops"], self.status_severity(x["status"])))
        return root_causes

    def generate_recommendations(self, asset, status, root_causes):
        """Generate status-specific recommendations"""
        recommendations = []

        if status == "offline":
            recommendations.append("Check physical connectivity and power supply")
            recommendations.append("Verify network connectivity (ping test)")
            if root_causes:
                recommendations.append(f"Investigate upstream asset: {root_causes[0]['asset']}")

        elif status == "error":
            recommendations.append("Check application logs for error messages")
            recommendations.append("Verify configuration settings")
            recommendations.append("Restart the asset if safe to do so")

        elif status == "degraded":
            recommendations.append("Monitor performance metrics")
            recommendations.append("Check resource utilization (CPU, memory)")
            recommendations.append("Consider scaling if under heavy load")

        return recommendations
```

### GitOps Drift Detection

```python
# drift_detector.py
class DriftDetector:
    DRIFT_FIELDS = [
        ("status", "critical"),
        ("ip_address", "high"),
        ("version", "high"),
        ("config_checksum", "medium"),
        ("security_zone", "high")
    ]

    async def detect_all_drifts(self):
        """Detect drift for all assets"""
        query = """
        MATCH (intended:GitOpsConfig)
        MATCH (actual:Asset {id: intended.asset_id})
        RETURN
          intended,
          actual,
          CASE
            WHEN intended.status <> actual.status THEN 'status'
            WHEN intended.ip_address <> actual.ip_address THEN 'ip_address'
            WHEN intended.version <> actual.version THEN 'version'
            WHEN intended.config_checksum <> actual.config_checksum THEN 'config'
            WHEN intended.security_zone <> actual.security_zone THEN 'zone'
          END as drift_field
        """
        result = await neo4j_service.execute_query(query)

        drifts = []
        for record in result:
            if record["drift_field"]:
                drifts.append(self.create_drift_event(record))

        return drifts

    def create_drift_event(self, record):
        """Create drift event with all details"""
        field = record["drift_field"]
        intended = record["intended"]
        actual = record["actual"]

        severity = self.get_severity(field)

        return {
            "asset_id": actual["id"],
            "asset_name": actual["name"],
            "field": field,
            "intended_value": intended[field],
            "actual_value": actual[field],
            "severity": severity,
            "git_repo": intended["git_repo"],
            "git_commit": intended["git_commit"],
            "detected_at": datetime.now().isoformat()
        }
```

---

## 🎨 Frontend Deep Dive

### React Application Structure

#### App.tsx - Main Component

```typescript
import React, { useState } from 'react';
import { Container, Tabs, Tab, Box } from '@mui/material';
import LiveDashboard from './components/LiveDashboard';
import AssetExplorer from './components/AssetExplorer';
import RCAAnalysis from './components/RCAAnalysis';
import GitOpsDriftDashboard from './components/GitOpsDriftDashboard';
import AIAssistant from './components/AIAssistant';

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Live Dashboard" />
          <Tab label="Asset Explorer" />
          <Tab label="RCA Analysis" />
          <Tab label="GitOps Drift" />
          <Tab label="AI Assistant" />
        </Tabs>
      </Box>

      {activeTab === 0 && <LiveDashboard />}
      {activeTab === 1 && <AssetExplorer />}
      {activeTab === 2 && <RCAAnalysis />}
      {activeTab === 3 && <GitOpsDriftDashboard />}
      {activeTab === 4 && <AIAssistant />}
    </Container>
  );
}

export default App;
```

### API Client (services/api.ts)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const api = {
  // Dashboard
  getDashboardStats: () => apiClient.get('/api/stats'),
  getZoneHealth: () => apiClient.get('/api/zones'),
  getActiveIssues: () => apiClient.get('/api/active-issues'),

  // Assets
  getAllAssets: () => apiClient.get('/api/assets'),
  getAssetGraph: () => apiClient.get('/api/graph/all'),
  getAssetDetails: (id: string) => apiClient.get(`/api/assets/${id}`),

  // RCA
  analyzeRootCause: (assetId: string, status: string) =>
    apiClient.post('/api/rca/analyze', { asset_id: assetId, status }),
  getProblematicAssets: () => apiClient.get('/api/rca/problematic-assets'),

  // GitOps Drift
  getAllDrifts: () => apiClient.get('/api/gitops/drifts'),
  getDriftDetails: (assetId: string) => apiClient.get(`/api/gitops/drift/${assetId}`),
  remediateDrift: (assetId: string) => apiClient.post(`/api/gitops/remediate/${assetId}`),

  // AI Assistant
  queryAI: (query: string) => apiClient.post('/api/ai/query', { query }),
};

export default api;
```

### TypeScript Types (types/index.ts)

```typescript
// Asset Types
export interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error' | 'warning' | 'degraded' | 'unreachable';
  zone: string;
  ip_address?: string;
  version?: string;
  last_seen?: string;
}

// Graph Types
export interface GraphNode {
  id: string;
  name: string;
  type: string;
  status: string;
  zone: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Dashboard Types
export interface DashboardStats {
  total_assets: number;
  online_assets: number;
  error_assets: number;
  uptime_percentage: number;
}

export interface ZoneHealth {
  zone: string;
  count: number;
  healthy: number;
}

export interface ActiveIssue {
  asset: string;
  type: string;
  status: string;
  zone: string;
  team: string;
  last_seen: string;
}

// RCA Types
export interface RCAResult {
  asset: Asset;
  status: string;
  thought_process: string;
  evidence: string[];
  root_causes: RootCause[];
  upstream_impact: UpstreamAsset[];
  team: Team;
  recommendations: string[];
}

export interface RootCause {
  asset: string;
  status: string;
  hops: number;
  confidence: number;
}

export interface UpstreamAsset {
  name: string;
  type: string;
  status: string;
  hops: number;
}

export interface Team {
  name: string;
  contact: string;
  escalation: string;
}

// Drift Types
export interface DriftEvent {
  asset_id: string;
  asset_name: string;
  field: 'status' | 'ip_address' | 'version' | 'config_checksum' | 'security_zone';
  intended_value: string;
  actual_value: string;
  severity: 'critical' | 'high' | 'medium';
  git_repo: string;
  git_commit: string;
  detected_at: string;
}
```

### Component Examples

#### LiveDashboard.tsx - Real-Time Monitoring

```typescript
import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { api } from '../services/api';
import { DashboardStats, ZoneHealth, ActiveIssue } from '../types';

const LiveDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [zones, setZones] = useState<ZoneHealth[]>([]);
  const [issues, setIssues] = useState<ActiveIssue[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Initial data load
    loadDashboardData();

    // WebSocket connection for real-time updates
    const websocket = new WebSocket('ws://localhost:8000/ws');

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStats(data.stats);
      setZones(data.zones);
      setIssues(data.active_issues);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, zonesRes, issuesRes] = await Promise.all([
        api.getDashboardStats(),
        api.getZoneHealth(),
        api.getActiveIssues(),
      ]);

      setStats(statsRes.data);
      setZones(zonesRes.data);
      setIssues(issuesRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Metrics Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Assets</Typography>
            <Typography variant="h3">{stats?.total_assets || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Online</Typography>
            <Typography variant="h3" color="success.main">
              {stats?.online_assets || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Errors</Typography>
            <Typography variant="h3" color="error.main">
              {stats?.error_assets || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Uptime</Typography>
            <Typography variant="h3" color="primary.main">
              {stats?.uptime_percentage.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Zone Health Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Zone Health Distribution
            </Typography>
            {/* Chart implementation */}
          </CardContent>
        </Card>
      </Grid>

      {/* Active Issues Table */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Issues
            </Typography>
            {/* Table implementation */}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LiveDashboard;
```

---

## 💾 Database Schema

### Neo4j Graph Model

#### Node Labels

**1. Asset** - Factory assets (PLCs, sensors, machines, etc.)
```cypher
CREATE (a:Asset {
  id: "plc-001",
  name: "PLC-PackagingLine1",
  type: "PLC",
  status: "online",
  zone: "Level 2",
  ip_address: "192.168.1.100",
  version: "v2.4.1",
  config_checksum: "abc123",
  last_seen: datetime(),
  created_at: datetime()
})
```

**2. Team** - Engineering teams responsible for assets
```cypher
CREATE (t:Team {
  name: "Production Engineering",
  contact: "prod-eng@example.com",
  escalation: "escalation@example.com",
  slack_channel: "#prod-eng"
})
```

**3. GitOpsConfig** - Intended state from Git repository
```cypher
CREATE (g:GitOpsConfig {
  asset_id: "plc-001",
  status: "online",
  ip_address: "192.168.1.100",
  version: "v2.4.1",
  config_checksum: "abc123",
  security_zone: "Level 2",
  git_repo: "https://github.com/company/configs",
  git_commit: "a1b2c3d4",
  updated_at: datetime()
})
```

**4. DriftEvent** - Detected configuration drift
```cypher
CREATE (d:DriftEvent {
  asset_id: "plc-001",
  field: "version",
  intended_value: "v2.4.1",
  actual_value: "v2.3.0",
  severity: "high",
  detected_at: datetime(),
  resolved: false
})
```

#### Relationships

**1. CONNECTS_TO** - Network/physical connections
```cypher
MATCH (a:Asset {name: "Sensor-Temp-01"})
MATCH (b:Asset {name: "PLC-PackagingLine1"})
CREATE (a)-[:CONNECTS_TO {port: "Port1", protocol: "Modbus"}]->(b)
```

**2. DEPENDS_ON** - Logical dependencies
```cypher
MATCH (a:Asset {name: "HMI-Dashboard"})
MATCH (b:Asset {name: "DatabaseServer"})
CREATE (a)-[:DEPENDS_ON {criticality: "high"}]->(b)
```

**3. OWNED_BY** - Team ownership
```cypher
MATCH (a:Asset {name: "PLC-PackagingLine1"})
MATCH (t:Team {name: "Production Engineering"})
CREATE (a)-[:OWNED_BY]->(t)
```

**4. HAS_DRIFT** - Asset drift events
```cypher
MATCH (a:Asset {id: "plc-001"})
MATCH (d:DriftEvent {asset_id: "plc-001"})
CREATE (a)-[:HAS_DRIFT]->(d)
```

### Sample Cypher Queries

#### 1. Find All Assets in a Zone
```cypher
MATCH (a:Asset {zone: "Level 2"})
RETURN a.name, a.type, a.status
ORDER BY a.name
```

#### 2. Find Upstream Dependencies (3 hops)
```cypher
MATCH path = (a:Asset {name: "HMI-Dashboard"})<-[:CONNECTS_TO|DEPENDS_ON*1..3]-(upstream)
RETURN upstream.name, length(path) as hops
ORDER BY hops
```

#### 3. Find Root Causes for Offline Asset
```cypher
MATCH (a:Asset {name: "Sensor-Temp-01", status: "offline"})
MATCH path = (a)<-[:CONNECTS_TO*1..3]-(upstream)
WHERE upstream.status IN ['error', 'failed', 'offline']
RETURN
  upstream.name as root_cause,
  upstream.status as status,
  length(path) as hops,
  [rel in relationships(path) | type(rel)] as path_types
ORDER BY hops
```

#### 4. Detect Configuration Drift
```cypher
MATCH (intended:GitOpsConfig)
MATCH (actual:Asset {id: intended.asset_id})
WHERE intended.version <> actual.version
RETURN
  actual.name as asset,
  intended.version as intended_version,
  actual.version as actual_version,
  intended.git_commit as source_commit
```

#### 5. Find Team Responsible for Asset
```cypher
MATCH (a:Asset {name: "PLC-PackagingLine1"})-[:OWNED_BY]->(t:Team)
RETURN
  t.name as team,
  t.contact as email,
  t.slack_channel as slack
```

---

## 📡 API Documentation

### Complete Endpoint Reference

#### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get dashboard statistics |
| GET | `/api/zones` | Get zone health distribution |
| GET | `/api/active-issues` | Get current active issues |

#### Asset Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets` | Get all assets |
| GET | `/api/assets/{id}` | Get asset by ID |
| GET | `/api/graph/all` | Get complete asset graph |
| GET | `/api/graph/manufacturing` | Get manufacturing assets |
| GET | `/api/graph/network` | Get network infrastructure |

#### RCA Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rca/analyze` | Analyze root cause |
| GET | `/api/rca/problematic-assets` | Get problematic assets |

#### GitOps Drift Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gitops/drifts` | Get all drift events |
| GET | `/api/gitops/drift/{asset_id}` | Get drift for asset |
| POST | `/api/gitops/remediate/{asset_id}` | Execute remediation |
| GET | `/api/gitops/history` | Get drift history |

#### AI Assistant Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/query` | Submit natural language query |

#### WebSocket Endpoint

| Protocol | Endpoint | Description |
|----------|----------|-------------|
| WebSocket | `/ws` | Real-time dashboard updates |

### API Examples

See `dashboard/docs/api/API_REFERENCE.md` for complete examples.

---

## ⚡ Real-Time Features

### WebSocket Implementation

The dashboard uses WebSocket for real-time updates:

**Backend (main.py)**:
```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            stats = await get_dashboard_stats()
            await manager.broadcast(stats)
            await asyncio.sleep(5)  # Update every 5 seconds
    except Exception:
        manager.disconnect(websocket)
```

**Frontend (LiveDashboard.tsx)**:
```typescript
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8000/ws');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setStats(data);
  };

  return () => ws.close();
}, []);
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### 1. CI Workflow (`ci.yml`)
- Backend tests (pytest)
- Frontend tests (Jest)
- Linting (Flake8, ESLint)
- Type checking (mypy, TypeScript)

#### 2. Docker Build (`docker-build.yml`)
- Build backend image
- Build frontend image
- Security scanning (Trivy)
- Push to GHCR

#### 3. Complete Deployment (`deploy.yml`)
- 7 jobs: Test → Build → Scan → Release → Deploy
- Multi-architecture (amd64, arm64)
- Auto-deploy to staging
- Manual approval for production

See `dashboard/docs/deployment/CICD_PIPELINE.md` for details.

---

## 🚀 Deployment

### Docker Compose (Development)

```bash
cd dashboard
docker-compose up -d
./init-database.sh
```

### Kubernetes (Production)

```bash
cd dashboard/kubernetes
kubectl apply -f neo4j-statefulset.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
```

See `dashboard/QUICKSTART.md` for complete deployment guide.

---

## 🧪 Testing

### Backend Tests

```bash
cd dashboard/backend
pytest tests/ -v --cov=.
```

### Frontend Tests

```bash
cd dashboard/frontend
npm test
```

### Integration Tests

```bash
docker-compose up -d
# Wait for services to start
curl http://localhost:8000/api/stats
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Neo4j Connection Failed**
```
Error: Unable to connect to Neo4j at bolt://localhost:7687
```
**Solution**: Check Neo4j is running:
```bash
docker ps | grep neo4j
```

**2. WebSocket Connection Closed**
```
WebSocket connection closed unexpectedly
```
**Solution**: Check CORS configuration in `main.py`

**3. Frontend Not Loading**
```
Failed to fetch from http://localhost:8000
```
**Solution**: Verify backend is running:
```bash
curl http://localhost:8000/
```

See `dashboard/README.md` for complete troubleshooting guide.

---

## 👥 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow coding standards
4. **Run tests**: Ensure all tests pass
5. **Commit**: Use conventional commits
6. **Push**: `git push origin feature/amazing-feature`
7. **Create Pull Request**: Describe your changes

### Coding Standards

**Python**:
- Follow PEP 8
- Use type hints
- Add docstrings
- Max line length: 100

**TypeScript**:
- Follow ESLint rules
- Use strong typing
- Add JSDoc comments
- Max line length: 100

See `dashboard/CONTRIBUTING.md` for complete guidelines.

---

## 📚 Additional Resources

### Documentation Files

- **Main README**: `dashboard/README.md`
- **Quick Start**: `dashboard/QUICKSTART.md`
- **System Architecture**: `dashboard/docs/architecture/SYSTEM_ARCHITECTURE.md`
- **GitOps Drift**: `dashboard/docs/architecture/GITOPS_DRIFT_DETECTION.md`
- **API Reference**: `dashboard/docs/api/API_REFERENCE.md`
- **CI/CD Pipeline**: `dashboard/docs/deployment/CICD_PIPELINE.md`
- **Contributing**: `dashboard/CONTRIBUTING.md`
- **Security Audit**: `dashboard/SECURITY_AUDIT.md`

### External Links

- **Repository**: https://github.com/Kumarhq/factory-digital-twin-gitops
- **Neo4j Documentation**: https://neo4j.com/docs/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **React Documentation**: https://react.dev/

---

## 📞 Support

### Getting Help

- **Issues**: https://github.com/Kumarhq/factory-digital-twin-gitops/issues
- **Discussions**: https://github.com/Kumarhq/factory-digital-twin-gitops/discussions
- **Email**: support@example.com

---

**Developer Wiki Version**: 1.0.0
**Last Updated**: 2026-01-07
**Status**: ✅ Production Ready
**License**: MIT
