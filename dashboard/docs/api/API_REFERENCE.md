# Factory Digital Twin - API Reference

Complete API documentation for the Factory Digital Twin Dashboard backend.

**Base URL**: `http://localhost:8000` (development) or `https://your-domain.com` (production)

**API Documentation**: http://localhost:8000/docs (Swagger UI)

---

## Table of Contents

- [Dashboard & Statistics](#dashboard--statistics)
- [Asset Management](#asset-management)
- [Graph Visualization](#graph-visualization)
- [Root Cause Analysis](#root-cause-analysis)
- [GitOps & Drift Detection](#gitops--drift-detection)
- [AI Assistant](#ai-assistant)
- [Teams & Ownership](#teams--ownership)
- [WebSocket](#websocket)
- [Error Handling](#error-handling)

---

## Dashboard & Statistics

### GET /api/stats
Get overall system statistics.

**Response:**
```json
{
  "totalAssets": 45,
  "onlineAssets": 38,
  "offlineAssets": 7,
  "uptimePercentage": 84.4,
  "assetsByType": {
    "PLC": 5,
    "Sensor": 15,
    "Robot": 3,
    "HMI": 2,
    "NetworkSwitch": 4
  },
  "assetsByZone": {
    "Level 0 - Process": 15,
    "Level 1 - Control": 12,
    "Level 2 - Supervisory": 10,
    "Level 3 - Operations": 5,
    "Level 4 - Enterprise": 3
  }
}
```

### GET /api/zones
Get ISA-95 security zones.

**Response:**
```json
{
  "zones": [
    {
      "name": "Level 0 - Process",
      "description": "Physical process equipment",
      "assetCount": 15,
      "color": "#ef4444"
    },
    {
      "name": "Level 1 - Control",
      "description": "Control systems (PLCs, DCS)",
      "assetCount": 12,
      "color": "#f97316"
    }
  ]
}
```

### GET /api/dashboard/metrics
Get real-time performance metrics.

**Response:**
```json
{
  "cpu": 45.2,
  "memory": 62.8,
  "network": 128.5,
  "timestamp": "2026-01-06T10:30:00Z"
}
```

### GET /api/dashboard/zone-health
Get zone health distribution.

**Response:**
```json
{
  "zones": [
    {
      "zone": "Level 0 - Process",
      "healthy": 12,
      "degraded": 2,
      "offline": 1
    }
  ]
}
```

### GET /api/dashboard/active-issues
Get active issues and alerts.

**Response:**
```json
{
  "issues": [
    {
      "assetName": "PLC-001",
      "type": "offline",
      "severity": "critical",
      "timestamp": "2026-01-06T10:25:00Z",
      "message": "Asset unreachable"
    }
  ]
}
```

---

## Asset Management

### GET /api/assets
List all assets with pagination.

**Query Parameters:**
- `skip` (int): Number of records to skip (default: 0)
- `limit` (int): Maximum records to return (default: 100)

**Response:**
```json
{
  "total": 45,
  "skip": 0,
  "limit": 100,
  "assets": [
    {
      "name": "PLC-001",
      "type": "PLC",
      "status": "running",
      "ipAddress": "192.168.1.10",
      "version": "2.5.0",
      "securityZone": "Level 1 - Control",
      "location": "Assembly Line 1",
      "team": "Automation Team"
    }
  ]
}
```

### GET /api/asset/{asset_name}
Get detailed information for a specific asset.

**Path Parameters:**
- `asset_name` (string): Name of the asset

**Response:**
```json
{
  "name": "PLC-001",
  "type": "PLC",
  "status": "running",
  "ipAddress": "192.168.1.10",
  "version": "2.5.0",
  "configChecksum": "a1b2c3d4",
  "securityZone": "Level 1 - Control",
  "location": "Assembly Line 1",
  "team": "Automation Team",
  "port": 502,
  "lastSeen": "2026-01-06T10:30:00Z",
  "relationships": {
    "incoming": [
      {
        "source": "TempSensor-001",
        "relationship": "FEEDS_DATA"
      }
    ],
    "outgoing": [
      {
        "target": "SCADA-HMI-01",
        "relationship": "CONNECTS_TO"
      }
    ]
  },
  "space": {
    "id": "assembly-line-1",
    "name": "Assembly Line 1",
    "hasVirtualTour": false
  }
}
```

### GET /api/assets/types
Get list of all asset types.

**Response:**
```json
{
  "types": [
    "PLC",
    "Sensor",
    "IndustrialRobot",
    "HMI",
    "NetworkSwitch",
    "Server"
  ]
}
```

### GET /api/search/{query}
Search assets by name or type.

**Path Parameters:**
- `query` (string): Search query

**Response:**
```json
{
  "results": [
    {
      "name": "PLC-001",
      "type": "PLC",
      "status": "running",
      "location": "Assembly Line 1"
    }
  ],
  "count": 1
}
```

### GET /api/assets/by-team/{team_name}
Get assets owned by a specific team.

**Path Parameters:**
- `team_name` (string): Team name

**Response:**
```json
{
  "team": "Automation Team",
  "assets": [
    {
      "name": "PLC-001",
      "type": "PLC",
      "status": "running"
    }
  ],
  "count": 5
}
```

### GET /api/assets/by-zone/{zone}
Get assets in a specific security zone.

**Path Parameters:**
- `zone` (string): Security zone name

**Response:**
```json
{
  "zone": "Level 1 - Control",
  "assets": [
    {
      "name": "PLC-001",
      "type": "PLC",
      "status": "running"
    }
  ],
  "count": 12
}
```

---

## Graph Visualization

### POST /api/graph
Get graph data with optional filters.

**Request Body:**
```json
{
  "filters": {
    "types": ["PLC", "Sensor"],
    "statuses": ["running", "online"],
    "zones": ["Level 1 - Control"]
  }
}
```

**Response:**
```json
{
  "nodes": [
    {
      "id": "PLC-001",
      "name": "PLC-001",
      "type": "PLC",
      "status": "running",
      "zone": "Level 1 - Control",
      "team": "Automation Team"
    }
  ],
  "links": [
    {
      "source": "TempSensor-001",
      "target": "PLC-001",
      "type": "FEEDS_DATA"
    }
  ]
}
```

### GET /api/graph/manufacturing
Get manufacturing assets subgraph.

**Response:** Same format as `/api/graph`

### GET /api/graph/network
Get network topology subgraph.

**Response:** Same format as `/api/graph`

### GET /api/graph/infrastructure
Get infrastructure (K8s, Nutanix) subgraph.

**Response:** Same format as `/api/graph`

### GET /api/data-pipeline
Get end-to-end data pipeline graph.

**Response:** Same format as `/api/graph`

---

## Root Cause Analysis

### GET /api/rca/{asset_name}
Perform root cause analysis for an asset.

**Path Parameters:**
- `asset_name` (string): Name of the problematic asset

**Response:**
```json
{
  "assetName": "PLC-001",
  "assetType": "PLC",
  "status": "offline",
  "zone": "Level 1 - Control",
  "team": {
    "name": "Automation Team",
    "lead": "John Smith",
    "contact": "john.smith@factory.com",
    "slack": "#automation-team"
  },
  "analysis": {
    "rootCause": "upstream",
    "upstreamFailures": [
      {
        "assetName": "NetworkSwitch-01",
        "distance": 1,
        "path": "NetworkSwitch-01 -> PLC-001",
        "failedAt": "2026-01-06T10:20:00Z"
      }
    ],
    "thoughtProcess": [
      "1. Analyzing PLC-001 status: offline",
      "2. Checking upstream dependencies...",
      "3. Found upstream failure: NetworkSwitch-01",
      "4. NetworkSwitch-01 is offline, causing downstream impact",
      "5. Root cause identified: Network infrastructure failure"
    ],
    "evidenceExamined": {
      "assetStatus": "offline",
      "upstreamAssets": ["NetworkSwitch-01"],
      "failureTimeline": "NetworkSwitch-01 failed first at 10:20, PLC-001 went offline at 10:21",
      "impactScope": "2 downstream assets affected"
    },
    "reasoning": [
      "NetworkSwitch-01 provides network connectivity to PLC-001",
      "Switch failure occurred 1 minute before PLC became unreachable",
      "No other failures detected in the path",
      "Temporal correlation confirms causal relationship"
    ],
    "conclusion": "ROOT CAUSE: NetworkSwitch-01 failure causing PLC-001 to become unreachable",
    "recommendation": "ACTIONS:\n1. Verify NetworkSwitch-01 power and connectivity\n2. Restart NetworkSwitch-01\n3. Check switch configuration\n4. Monitor PLC-001 recovery\n5. Contact Network Team if issue persists"
  }
}
```

### GET /api/rca/related-incidents/{asset_name}
Find similar past incidents.

**Response:**
```json
{
  "incidents": [
    {
      "assetName": "PLC-002",
      "type": "PLC",
      "status": "offline",
      "lastFailure": "2026-01-05T08:15:00Z",
      "similarity": "Same asset type and status"
    }
  ],
  "count": 3
}
```

### GET /api/rca/upstream-impact/{asset_name}
Analyze upstream impact for an asset.

**Response:**
```json
{
  "assetName": "PLC-001",
  "upstreamAssets": [
    {
      "name": "NetworkSwitch-01",
      "distance": 1,
      "status": "offline",
      "impact": "direct"
    }
  ],
  "totalUpstream": 3
}
```

---

## GitOps & Drift Detection

### GET /api/gitops/config
Get intended GitOps configurations.

**Response:**
```json
{
  "configs": [
    {
      "name": "PLC-001",
      "type": "PLC",
      "intendedStatus": "running",
      "intendedIP": "192.168.1.10",
      "intendedVersion": "2.5.0",
      "intendedChecksum": "a1b2c3d4",
      "intendedSecurityZone": "Level 1 - Control",
      "gitRepo": "github.com/factory/plc-configs",
      "gitPath": "plcs/assembly-line-1/plc-001.yaml",
      "lastCommit": "abc123def456",
      "lastUpdated": "2026-01-05T10:30:00Z"
    }
  ]
}
```

### GET /api/gitops/actual
Get actual observed state.

**Response:**
```json
{
  "assets": [
    {
      "name": "PLC-001",
      "type": "PLC",
      "status": "running",
      "ipAddress": "192.168.1.10",
      "version": "2.5.0",
      "configChecksum": "a1b2c3d4",
      "securityZone": "Level 1 - Control",
      "lastSeen": "2026-01-06T10:30:00Z"
    }
  ]
}
```

### GET /api/gitops/drift
Calculate configuration drift.

**Query Parameters:**
- `severity` (string, optional): Filter by severity (critical, high, medium)
- `asset` (string, optional): Filter by asset name

**Response:**
```json
{
  "summary": {
    "totalAssets": 10,
    "inSyncAssets": 7,
    "driftedAssets": 3,
    "criticalDrifts": 1
  },
  "drifts": [
    {
      "assetName": "PLC-001",
      "assetType": "PLC",
      "driftStatus": "high",
      "drifts": [
        {
          "field": "version",
          "intended": "2.5.0",
          "actual": "2.4.0",
          "severity": "high"
        }
      ],
      "gitRepo": "github.com/factory/plc-configs",
      "gitPath": "plcs/assembly-line-1/plc-001.yaml",
      "lastCommit": "abc123def456",
      "actions": [
        {
          "action": "sync_version",
          "title": "Update to Intended Version",
          "description": "Upgrade from 2.4.0 to 2.5.0",
          "priority": "high",
          "automated": true
        }
      ]
    }
  ]
}
```

### GET /api/gitops/drift/history
Get drift history trends.

**Query Parameters:**
- `days` (int, optional): Number of days to include (default: 7)

**Response:**
```json
{
  "history": [
    {
      "date": "2026-01-06",
      "driftedAssets": 3,
      "criticalDrifts": 1,
      "highDrifts": 2
    },
    {
      "date": "2026-01-05",
      "driftedAssets": 2,
      "criticalDrifts": 0,
      "highDrifts": 2
    }
  ]
}
```

### GET /api/gitops/drift/stats
Get drift analytics and statistics.

**Response:**
```json
{
  "byAssetType": {
    "PLC": { "total": 5, "drifted": 1 },
    "Sensor": { "total": 15, "drifted": 0 },
    "Robot": { "total": 3, "drifted": 2 }
  },
  "byField": {
    "status": 1,
    "version": 2,
    "ipAddress": 0,
    "configChecksum": 1,
    "securityZone": 0
  },
  "bySeverity": {
    "critical": 1,
    "high": 2,
    "medium": 0
  }
}
```

### POST /api/gitops/drift/resolve
Execute drift remediation action.

**Request Body:**
```json
{
  "assetName": "PLC-001",
  "action": "sync_version",
  "dryRun": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Version sync initiated for PLC-001",
  "executionId": "exec-abc123",
  "timestamp": "2026-01-06T10:30:00Z"
}
```

---

## AI Assistant

### POST /api/ai/query
Submit natural language query.

**Request Body:**
```json
{
  "query": "Which PLCs are offline in Assembly Line 1?"
}
```

**Response:**
```json
{
  "query": "Which PLCs are offline in Assembly Line 1?",
  "response": "There is 1 PLC offline in Assembly Line 1: PLC-001. It went offline at 10:21 AM today.",
  "assets": ["PLC-001"],
  "confidence": 0.95,
  "timestamp": "2026-01-06T10:30:00Z"
}
```

### GET /api/ai/suggestions
Get query suggestions.

**Response:**
```json
{
  "suggestions": [
    "Show me all offline assets",
    "Which team owns PLC-001?",
    "What is the status of Assembly Line 1?",
    "Show drift for critical assets"
  ]
}
```

---

## Teams & Ownership

### GET /api/teams/{team_name}
Get team contact information.

**Path Parameters:**
- `team_name` (string): Team name

**Response:**
```json
{
  "name": "Automation Team",
  "lead": "John Smith",
  "contact": "john.smith@factory.com",
  "slack": "#automation-team",
  "phone": "+1-555-0123",
  "escalation": "jane.doe@factory.com",
  "assets": 12
}
```

### GET /api/teams
Get all teams.

**Response:**
```json
{
  "teams": [
    {
      "name": "Automation Team",
      "lead": "John Smith",
      "assetCount": 12
    }
  ]
}
```

---

## WebSocket

### WS /ws
Real-time updates via WebSocket.

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

**Message Format:**
```json
{
  "type": "asset_update",
  "data": {
    "assetName": "PLC-001",
    "field": "status",
    "oldValue": "running",
    "newValue": "offline",
    "timestamp": "2026-01-06T10:30:00Z"
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ASSET_NOT_FOUND",
    "message": "Asset 'PLC-999' not found",
    "details": {
      "assetName": "PLC-999"
    },
    "timestamp": "2026-01-06T10:30:00Z"
  }
}
```

### HTTP Status Codes
- **200 OK** - Successful request
- **201 Created** - Resource created
- **400 Bad Request** - Invalid request parameters
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error
- **503 Service Unavailable** - Service temporarily unavailable

---

**API Version**: 1.0
**Last Updated**: 2026-01-06
**Interactive Documentation**: http://localhost:8000/docs
