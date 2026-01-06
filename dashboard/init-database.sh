#!/bin/bash

# Initialize Neo4j database with sample Factory Digital Twin data
# Usage: ./init-database.sh [environment]
# environment: docker (default) or k8s

ENV=${1:-docker}

echo "Initializing Neo4j database for Factory Digital Twin..."
echo "Environment: $ENV"

if [ "$ENV" = "k8s" ]; then
  # Kubernetes environment
  NEO4J_HOST="localhost"
  NEO4J_PORT="7687"
  echo "Make sure Neo4j port-forward is running:"
  echo "kubectl port-forward svc/neo4j-service 7687:7687 -n factory-digital-twin &"
  sleep 2
else
  # Docker Compose environment
  NEO4J_HOST="localhost"
  NEO4J_PORT="7687"
fi

NEO4J_USER="neo4j"
NEO4J_PASSWORD="factory_twin_2025"

# Check if Neo4j is accessible
echo "Checking Neo4j connection..."
if ! curl -s http://localhost:7474 > /dev/null; then
  echo "❌ Error: Neo4j is not accessible at http://localhost:7474"
  echo "Please start Neo4j first:"
  if [ "$ENV" = "k8s" ]; then
    echo "  kubectl port-forward svc/neo4j-service 7474:7474 7687:7687 -n factory-digital-twin"
  else
    echo "  docker-compose up -d neo4j"
  fi
  exit 1
fi

echo "✅ Neo4j is accessible"
echo ""
echo "Initializing schema and sample data..."
echo "This will create:"
echo "  - Asset nodes (PLCs, Robots, Switches, etc.)"
echo "  - Relationships (POWERS, CONNECTS_TO, FEEDS_DATA)"
echo "  - ISA-95 security zones"
echo "  - Team ownership data"
echo ""

# Use cypher-shell or HTTP API
# For simplicity, we'll use the backend API endpoints that create sample data

echo "You can initialize data in two ways:"
echo ""
echo "1. Via Backend API (Recommended):"
echo "   Once backend is running, it will auto-populate sample data"
echo "   Access: http://localhost:8000/docs"
echo ""
echo "2. Manual Cypher Scripts:"
echo "   Access Neo4j Browser: http://localhost:7474"
echo "   Login: neo4j / factory_twin_2025"
echo ""

# Create a sample Cypher script file
cat > /tmp/init-factory-data.cypher << 'CYPHER_EOF'
// Factory Digital Twin - Initial Data Setup

// 1. Create Constraints
CREATE CONSTRAINT asset_name IF NOT EXISTS FOR (a:Asset) REQUIRE a.name IS UNIQUE;
CREATE CONSTRAINT space_id IF NOT EXISTS FOR (s:Space) REQUIRE s.id IS UNIQUE;

// 2. Create Indexes
CREATE INDEX asset_type IF NOT EXISTS FOR (a:Asset) ON (a.type);
CREATE INDEX asset_status IF NOT EXISTS FOR (a:Asset) ON (a.status);
CREATE INDEX asset_zone IF NOT EXISTS FOR (a:Asset) ON (a.securityZone);

// 3. Create Sample Assets - Level 0 (Process)
CREATE (s1:Asset {
  name: 'TempSensor-001',
  type: 'Sensor',
  status: 'online',
  ipAddress: '192.168.0.101',
  version: '1.2.0',
  securityZone: 'Level 0 - Process',
  location: 'Assembly Line 1',
  lastSeen: datetime()
});

CREATE (s2:Asset {
  name: 'PressureSensor-002',
  type: 'Sensor',
  status: 'online',
  ipAddress: '192.168.0.102',
  version: '1.2.0',
  securityZone: 'Level 0 - Process',
  location: 'Assembly Line 1',
  lastSeen: datetime()
});

// Level 1 (Control)
CREATE (plc1:Asset {
  name: 'PLC-001',
  type: 'PLC',
  status: 'running',
  ipAddress: '192.168.1.10',
  version: '2.5.0',
  configChecksum: 'a1b2c3d4',
  securityZone: 'Level 1 - Control',
  location: 'Assembly Line 1',
  port: 502,
  lastSeen: datetime()
});

CREATE (robot1:Asset {
  name: 'Robot-Arm-101',
  type: 'IndustrialRobot',
  status: 'running',
  ipAddress: '192.168.2.15',
  version: '7.2.1',
  configChecksum: 'i9j0k1l2',
  securityZone: 'Level 1 - Control',
  location: 'Assembly Line 2',
  maxPayload: 50,
  reach: 1800,
  lastSeen: datetime()
});

// Level 2 (Supervisory)
CREATE (scada1:Asset {
  name: 'SCADA-HMI-01',
  type: 'HMI',
  status: 'running',
  ipAddress: '192.168.3.20',
  version: '12.4.0',
  configChecksum: 'm3n4o5p6',
  securityZone: 'Level 2 - Supervisory',
  location: 'Control Room',
  screens: 3,
  resolution: '1920x1080',
  lastSeen: datetime()
});

CREATE (switch1:Asset {
  name: 'NetworkSwitch-01',
  type: 'NetworkSwitch',
  status: 'running',
  ipAddress: '192.168.0.5',
  version: '16.9.3',
  configChecksum: 'e5f6g7h8',
  securityZone: 'Level 2 - Supervisory',
  location: 'Network Closet A',
  ports: 48,
  lastSeen: datetime()
});

// Level 3 (Operations)
CREATE (mes1:Asset {
  name: 'MES-Server-01',
  type: 'Server',
  status: 'online',
  ipAddress: '192.168.4.10',
  version: '5.1.2',
  securityZone: 'Level 3 - Operations',
  location: 'Data Center',
  lastSeen: datetime()
});

// Level 4 (Enterprise)
CREATE (erp1:Asset {
  name: 'ERP-System',
  type: 'Server',
  status: 'online',
  ipAddress: '192.168.5.20',
  version: '12.0.1',
  securityZone: 'Level 4 - Enterprise',
  location: 'Cloud',
  lastSeen: datetime()
});

// 4. Create Relationships
MATCH (s1:Asset {name: 'TempSensor-001'})
MATCH (plc1:Asset {name: 'PLC-001'})
CREATE (s1)-[:FEEDS_DATA]->(plc1);

MATCH (s2:Asset {name: 'PressureSensor-002'})
MATCH (plc1:Asset {name: 'PLC-001'})
CREATE (s2)-[:FEEDS_DATA]->(plc1);

MATCH (plc1:Asset {name: 'PLC-001'})
MATCH (scada1:Asset {name: 'SCADA-HMI-01'})
CREATE (plc1)-[:CONNECTS_TO]->(scada1);

MATCH (robot1:Asset {name: 'Robot-Arm-101'})
MATCH (scada1:Asset {name: 'SCADA-HMI-01'})
CREATE (robot1)-[:CONNECTS_TO]->(scada1);

MATCH (scada1:Asset {name: 'SCADA-HMI-01'})
MATCH (mes1:Asset {name: 'MES-Server-01'})
CREATE (scada1)-[:FEEDS_DATA]->(mes1);

MATCH (mes1:Asset {name: 'MES-Server-01'})
MATCH (erp1:Asset {name: 'ERP-System'})
CREATE (mes1)-[:FEEDS_DATA]->(erp1);

MATCH (switch1:Asset {name: 'NetworkSwitch-01'})
MATCH (plc1:Asset {name: 'PLC-001'})
CREATE (switch1)-[:CONNECTS_TO]->(plc1);

MATCH (switch1:Asset {name: 'NetworkSwitch-01'})
MATCH (scada1:Asset {name: 'SCADA-HMI-01'})
CREATE (switch1)-[:CONNECTS_TO]->(scada1);

// 5. Create Spaces
CREATE (space1:Space {
  id: 'assembly-line-1',
  name: 'Assembly Line 1',
  level: 'Production Floor',
  hasVirtualTour: false
});

CREATE (space2:Space {
  id: 'control-room',
  name: 'Control Room',
  level: 'Level 2',
  hasVirtualTour: true,
  matterportUrl: 'https://my.matterport.com/show/?m=example123'
});

// Link assets to spaces
MATCH (plc1:Asset {name: 'PLC-001'})
MATCH (space1:Space {id: 'assembly-line-1'})
CREATE (plc1)-[:LOCATED_IN]->(space1);

MATCH (scada1:Asset {name: 'SCADA-HMI-01'})
MATCH (space2:Space {id: 'control-room'})
CREATE (scada1)-[:LOCATED_IN]->(space2);

CYPHER_EOF

echo "Cypher initialization script created at: /tmp/init-factory-data.cypher"
echo ""
echo "To apply it:"
echo "  1. Open Neo4j Browser: http://localhost:7474"
echo "  2. Login with: neo4j / factory_twin_2025"
echo "  3. Copy and paste the script from /tmp/init-factory-data.cypher"
echo "  4. Run the script"
echo ""
echo "Or use cypher-shell (if installed):"
echo "  cat /tmp/init-factory-data.cypher | cypher-shell -u neo4j -p factory_twin_2025"
echo ""
echo "✅ Initialization script ready!"
