# GitOps Drift Detection Architecture

## Overview

The GitOps Drift Detection system compares **intended configuration** (stored in Git repositories) with **actual state** (discovered from live factory assets) to identify and remediate configuration drift.

## Conceptual Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitOps Repository                         │
│         (Intended State - Source of Truth)                   │
├─────────────────────────────────────────────────────────────┤
│  catalog-info.yaml files for each asset:                    │
│  - Asset configuration (IP, version, zone)                  │
│  - Team ownership                                            │
│  - Metadata (last commit, repo path)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Git Sync / Webhook
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              GitOps Configuration Store                      │
│                  (In-Memory / Neo4j)                        │
├─────────────────────────────────────────────────────────────┤
│  Intended state for each asset:                            │
│  - name: "PLC-001"                                          │
│  - intendedStatus: "running"                                │
│  - intendedIP: "192.168.1.10"                              │
│  - intendedVersion: "2.5.0"                                 │
│  - intendedChecksum: "a1b2c3d4"                            │
│  - gitRepo: "github.com/factory/plc-configs"               │
│  - gitPath: "plcs/assembly-line-1/plc-001.yaml"           │
│  - lastCommit: "abc123"                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Drift Detection Engine
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Actual State Discovery                         │
│         (From Discovery Agents / Live Assets)               │
├─────────────────────────────────────────────────────────────┤
│  Current state in Neo4j graph database:                    │
│  - name: "PLC-001"                                          │
│  - status: "running" (or "offline", "degraded", etc.)      │
│  - ipAddress: "192.168.1.10" (or different)                │
│  - version: "2.5.0" (or different)                         │
│  - configChecksum: "a1b2c3d4" (or different)               │
│  - securityZone: "Level 1 - Control" (or different)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 5-Field Comparison
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Drift Detection                            │
├─────────────────────────────────────────────────────────────┤
│  Compare each field:                                        │
│  1. Status drift (critical if offline/error/failed)        │
│  2. IP address drift (high severity)                       │
│  3. Version drift (high severity)                          │
│  4. Config checksum drift (medium severity)                │
│  5. Security zone drift (high severity)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Drift Classification
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Drift Severity Assignment                     │
├─────────────────────────────────────────────────────────────┤
│  CRITICAL: Status = offline/error/failed                   │
│  HIGH:     Multiple fields drifted or IP/version/zone      │
│  MEDIUM:   Single field drifted (config checksum)          │
│  IN_SYNC:  No drift detected                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Action Generation
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Remediation Action Generation                   │
├─────────────────────────────────────────────────────────────┤
│  For each drift, generate actions:                         │
│  - investigate_failure (status drift)                      │
│  - sync_version (version drift)                            │
│  - update_ip_config (IP drift)                             │
│  - sync_configuration (checksum drift)                     │
│  - verify_security_zone (zone drift)                       │
│                                                             │
│  Each action includes:                                      │
│  - Title, description                                       │
│  - Priority (critical/high/medium)                         │
│  - Automated flag (can be auto-remediated?)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ UI Display
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           GitOps Drift Detection Dashboard                  │
├─────────────────────────────────────────────────────────────┤
│  Tab 1: Drift Detection                                    │
│  - Summary cards (in-sync, drifted, critical counts)       │
│  - Drift table with GitHub repo paths                      │
│  - Details dialog showing:                                  │
│    * Side-by-side comparison (intended vs actual)          │
│    * Recommended actions with Execute buttons              │
│                                                             │
│  Tab 2: Drift History                                      │
│  - Line chart showing drift trends over time               │
│  - Historical drift records                                │
│                                                             │
│  Tab 3: Statistics                                         │
│  - Drift breakdown by asset type                           │
│  - Drift breakdown by configuration field                  │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### Intended State (GitOps)

```typescript
interface GitOpsConfig {
  name: string;                    // Asset name
  type: string;                    // Asset type
  intendedStatus: string;          // Expected status
  intendedIP: string;              // Expected IP address
  intendedVersion: string;         // Expected software version
  intendedChecksum: string;        // Expected config checksum
  intendedSecurityZone: string;    // Expected ISA-95 zone
  gitRepo: string;                 // GitHub repo URL
  gitPath: string;                 // Path to config file in repo
  lastCommit: string;              // Last commit hash
  lastUpdated: string;             // ISO timestamp
}
```

**Example:**
```json
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
```

### Actual State (Discovered)

```typescript
interface ActualState {
  name: string;          // Asset name
  type: string;          // Asset type
  status: string;        // Current status
  ipAddress: string;     // Current IP address
  version: string;       // Current software version
  configChecksum: string; // Current config checksum
  securityZone: string;  // Current security zone
  lastSeen: string;      // Last discovery timestamp
}
```

### Drift Record

```typescript
interface DriftRecord {
  assetName: string;
  assetType: string;
  driftStatus: "critical" | "high" | "medium" | "in_sync";
  drifts: DriftField[];
  gitRepo: string;
  gitPath: string;
  lastCommit: string;
  actions: RemediationAction[];
}

interface DriftField {
  field: "status" | "ipAddress" | "version" | "configChecksum" | "securityZone";
  intended: string;
  actual: string;
  severity: "critical" | "high" | "medium";
}

interface RemediationAction {
  action: string;                    // Action identifier
  title: string;                     // Human-readable title
  description: string;               // Detailed description
  priority: "critical" | "high" | "medium";
  automated: boolean;                // Can be auto-executed?
}
```

## Drift Detection Algorithm

### Step 1: Fetch Actual State
```python
def get_actual_state():
    query = """
    MATCH (a:Asset)
    RETURN a.name as name,
           a.type as type,
           a.status as status,
           a.ipAddress as ipAddress,
           a.version as version,
           a.configChecksum as configChecksum,
           a.securityZone as securityZone
    """
    return session.run(query)
```

### Step 2: Fetch Intended State
```python
def get_intended_state(asset_name: str, asset_type: str):
    # Currently: Hardcoded configs (demo)
    # Future: Fetch from GitHub API or synced database
    return gitops_configs.get(asset_name, {})
```

### Step 3: Compare Fields
```python
def detect_drift(actual: dict, intended: dict):
    drifts = []

    # Status drift
    if actual.get("status") != intended.get("intendedStatus"):
        severity = "critical" if actual["status"] in ["offline", "error", "failed"] else "high"
        drifts.append({
            "field": "status",
            "intended": intended["intendedStatus"],
            "actual": actual["status"],
            "severity": severity
        })

    # IP address drift
    if actual.get("ipAddress") != intended.get("intendedIP"):
        drifts.append({
            "field": "ipAddress",
            "intended": intended["intendedIP"],
            "actual": actual["ipAddress"],
            "severity": "high"
        })

    # Version drift
    if actual.get("version") != intended.get("intendedVersion"):
        drifts.append({
            "field": "version",
            "intended": intended["intendedVersion"],
            "actual": actual["version"],
            "severity": "high"
        })

    # Config checksum drift
    if actual.get("configChecksum") != intended.get("intendedChecksum"):
        drifts.append({
            "field": "configChecksum",
            "intended": intended["intendedChecksum"],
            "actual": actual["configChecksum"],
            "severity": "medium"
        })

    # Security zone drift
    if actual.get("securityZone") != intended.get("intendedSecurityZone"):
        drifts.append({
            "field": "securityZone",
            "intended": intended["intendedSecurityZone"],
            "actual": actual["securityZone"],
            "severity": "high"
        })

    return drifts
```

### Step 4: Classify Severity
```python
def classify_drift_severity(drifts: list):
    if not drifts:
        return "in_sync"

    severities = [d["severity"] for d in drifts]

    if "critical" in severities:
        return "critical"
    elif len([s for s in severities if s == "high"]) >= 2:
        return "critical"  # Multiple high-severity drifts = critical
    elif "high" in severities:
        return "high"
    else:
        return "medium"
```

### Step 5: Generate Actions
```python
def generate_drift_actions(drifts: list, asset_name: str):
    actions = []

    for drift in drifts:
        field = drift["field"]

        if field == "status":
            actions.append({
                "action": "investigate_failure",
                "title": "Investigate Asset Failure",
                "description": f"Asset status drifted to {drift['actual']}. Run RCA to identify root cause.",
                "priority": "critical",
                "automated": False
            })

        elif field == "version":
            actions.append({
                "action": "sync_version",
                "title": "Update to Intended Version",
                "description": f"Upgrade/downgrade from {drift['actual']} to {drift['intended']}",
                "priority": "high",
                "automated": True
            })

        # ... similar for other fields

    return actions
```

## API Endpoints

### GET /api/gitops/config
Fetch intended GitOps configurations for all assets.

**Response:**
```json
{
  "configs": [
    {
      "name": "PLC-001",
      "intendedStatus": "running",
      "intendedIP": "192.168.1.10",
      "gitRepo": "github.com/factory/plc-configs",
      "gitPath": "plcs/assembly-line-1/plc-001.yaml"
    }
  ]
}
```

### GET /api/gitops/actual
Fetch actual state from discovery agents.

**Response:**
```json
{
  "assets": [
    {
      "name": "PLC-001",
      "status": "running",
      "ipAddress": "192.168.1.10",
      "version": "2.5.0"
    }
  ]
}
```

### GET /api/gitops/drift
Calculate and return drift across all assets.

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
      "actions": [
        {
          "action": "sync_version",
          "title": "Update to Intended Version",
          "priority": "high",
          "automated": true
        }
      ]
    }
  ]
}
```

### POST /api/gitops/drift/resolve
Execute a drift remediation action.

**Request:**
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
  "executionId": "exec-12345"
}
```

## Integration with GitHub

### Future: GitHub Webhook Integration
```
GitHub Repo → Webhook on push → Backend endpoint
→ Parse catalog-info.yaml → Update GitOps configs in Neo4j
→ Trigger drift detection → Push updates via WebSocket
```

### Future: catalog-info.yaml Format
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: plc-001
  description: PLC for Assembly Line 1
spec:
  type: plc
  owner: automation-team
  system: assembly-line-1
  config:
    ipAddress: 192.168.1.10
    version: 2.5.0
    configChecksum: a1b2c3d4
    securityZone: Level 1 - Control
    status: running
```

## UI Components

### Drift Dashboard Features
1. **Summary Cards**
   - Assets matching GitOps (green)
   - Drifted assets (orange)
   - Critical drifts (red)
   - Total assets

2. **Drift Table**
   - Asset name
   - Drift status (color-coded chip)
   - Drifted fields
   - GitHub repo path (monospace font)
   - Actions button

3. **Drift Details Dialog**
   - Side-by-side comparison table
   - Intended (green) vs Actual (red)
   - Recommended actions with Execute buttons
   - GitHub file link

4. **Drift History Chart**
   - Line chart (Chart.js)
   - X-axis: Time
   - Y-axis: Number of drifted assets
   - Color-coded by severity

5. **Statistics View**
   - Table: Drift count by asset type
   - Table: Drift count by field

## Remediation Workflow

### Manual Remediation
1. User views drift in dashboard
2. Clicks "View Details"
3. Reviews intended vs actual comparison
4. Clicks "Execute" on recommended action
5. Backend initiates remediation (API call, script, etc.)
6. User monitors progress
7. Drift resolved, status updates to "in_sync"

### Automated Remediation
1. Drift detected automatically
2. Backend evaluates if action can be automated
3. If yes, executes action automatically
4. Logs action in audit trail
5. Notifies team via Slack/email
6. Updates drift status

## Benefits

1. **Proactive Drift Detection** - Catch configuration drift before it causes issues
2. **Audit Trail** - Track all configuration changes via Git history
3. **Automated Remediation** - Reduce manual toil for routine drift
4. **Team Accountability** - GitOps ownership tied to teams
5. **Compliance** - Ensure factory meets configuration standards

---

**Document Version**: 1.0
**Last Updated**: 2026-01-06
