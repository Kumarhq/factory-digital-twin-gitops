// =============================================================================
// RCA Test Data - Comprehensive Factory Failure Scenarios
// =============================================================================
// Creates test data for all 8 RCA scenarios with realistic failure patterns
// =============================================================================

// Clean existing test data (optional - comment out if you want to keep existing data)
// MATCH (n) DETACH DELETE n;

// =============================================================================
// SCENARIO 1: Root Cause Analysis - Network Switch Failure Cascade
// =============================================================================

// Root cause: Network switch fails
CREATE (ns1:Asset {
  name: 'NetworkSwitch-05',
  type: 'NetworkSwitch',
  status: 'offline',
  ipAddress: '192.168.1.5',
  failureReason: 'Power supply failure',
  lastFailure: datetime('2026-01-04T14:30:00'),
  zone: 'L3-Control'
});

// Intermediate failure: Edge Gateway depends on switch
CREATE (eg1:Asset {
  name: 'EdgeGateway-02',
  type: 'Gateway',
  status: 'offline',
  ipAddress: '192.168.1.102',
  failureReason: 'Network connectivity lost',
  lastFailure: datetime('2026-01-04T14:31:00')
});

// Final failure: PLC depends on gateway
CREATE (plc1:Asset {
  name: 'PLC-001',
  type: 'PLC',
  status: 'offline',
  ipAddress: '192.168.2.10',
  failureReason: 'Connection timeout',
  lastFailure: datetime('2026-01-04T14:32:00')
});

// Create failure chain
CREATE (ns1)-[:CONNECTS_TO]->(eg1);
CREATE (eg1)-[:CONNECTS_TO]->(plc1);

// =============================================================================
// SCENARIO 2: Cascade Impact - UPS Failure
// =============================================================================

// UPS Main - single point of failure
CREATE (ups1:Asset {
  name: 'UPS-Main',
  type: 'UPS',
  status: 'battery',
  batteryLevel: 45,
  failureReason: 'On battery backup',
  lastFailure: datetime('2026-01-04T15:00:00')
});

// Critical equipment powered by UPS
CREATE (srv1:Asset {name: 'Server-01', type: 'Server', status: 'running'});
CREATE (srv2:Asset {name: 'Server-02', type: 'Server', status: 'running'});
CREATE (plc2:Asset {name: 'PLC-002', type: 'PLC', status: 'running'});
CREATE (plc3:Asset {name: 'PLC-003', type: 'PLC', status: 'running'});
CREATE (robot1:Asset {name: 'Robot-01', type: 'IndustrialRobot', status: 'degraded'});
CREATE (robot2:Asset {name: 'Robot-02', type: 'IndustrialRobot', status: 'offline'});

// Power dependencies
CREATE (ups1)-[:POWERS]->(srv1);
CREATE (ups1)-[:POWERS]->(srv2);
CREATE (ups1)-[:POWERS]->(plc2);
CREATE (ups1)-[:POWERS]->(plc3);
CREATE (ups1)-[:POWERS]->(robot1);
CREATE (ups1)-[:POWERS]->(robot2);

// Secondary dependencies
CREATE (srv1)-[:FEEDS_DATA]->(plc2);
CREATE (srv1)-[:FEEDS_DATA]->(plc3);
CREATE (plc2)-[:CONTROLS]->(robot1);
CREATE (plc3)-[:CONTROLS]->(robot2);

// =============================================================================
// SCENARIO 3: Network Path Failures
// =============================================================================

// Failed core switch
CREATE (core1:Asset {
  name: 'CoreSwitch-Datacenter',
  type: 'NetworkSwitch',
  status: 'offline',
  ipAddress: '192.168.1.1',
  failureReason: 'Hardware failure'
});

// Isolated devices
CREATE (srv3:Asset {name: 'Server-03', type: 'Server', status: 'unreachable', ipAddress: '192.168.10.3'});
CREATE (srv4:Asset {name: 'Server-04', type: 'Server', status: 'unreachable', ipAddress: '192.168.10.4'});
CREATE (plc5:Asset {name: 'PLC-005', type: 'PLC', status: 'offline', ipAddress: '192.168.20.5'});
CREATE (sensor1:Asset {name: 'Sensor-01', type: 'Sensor', status: 'unreachable'});

CREATE (core1)-[:CONNECTS_TO]->(srv3);
CREATE (core1)-[:CONNECTS_TO]->(srv4);
CREATE (core1)-[:CONNECTS_TO]->(plc5);
CREATE (core1)-[:CONNECTS_TO]->(sensor1);

// =============================================================================
// SCENARIO 4: Power Disruptions
// =============================================================================

// UPS Datacenter on battery
CREATE (ups2:Asset {
  name: 'UPS-Datacenter',
  type: 'UPS',
  status: 'battery',
  batteryLevel: 35,
  failureReason: 'Mains power failure'
});

// Critical servers
CREATE (srv5:Asset {name: 'MES-Server', type: 'Server', status: 'running', utilizationPercent: 92});
CREATE (srv6:Asset {name: 'Database-01', type: 'Server', status: 'running'});
CREATE (srv7:Asset {name: 'API-Gateway', type: 'Server', status: 'running'});
CREATE (ns2:Asset {name: 'NetworkSwitch-01', type: 'NetworkSwitch', status: 'running'});
CREATE (plc6:Asset {name: 'PLC-006', type: 'PLC', status: 'running'});

CREATE (ups2)-[:POWERS]->(srv5);
CREATE (ups2)-[:POWERS]->(srv6);
CREATE (ups2)-[:POWERS]->(srv7);
CREATE (ups2)-[:POWERS]->(ns2);
CREATE (ups2)-[:POWERS]->(plc6);

// =============================================================================
// SCENARIO 5: Performance Degradation
// =============================================================================

// Bottleneck server
CREATE (mes:Asset {
  name: 'MES-Server-Main',
  type: 'Server',
  status: 'degraded',
  utilizationPercent: 95,
  responseTime: 1500
});

// Related degraded systems
CREATE (db1:Asset {name: 'Database-Main', type: 'Server', status: 'warning', utilizationPercent: 88});
CREATE (api1:Asset {name: 'API-Gateway-01', type: 'Server', status: 'degraded'});
CREATE (web1:Asset {name: 'WebServer-01', type: 'Server', status: 'degraded'});

// Dependencies (MES is bottleneck)
CREATE (db1)-[:FEEDS_DATA]->(mes);
CREATE (api1)-[:DEPENDS_ON]->(mes);
CREATE (web1)-[:DEPENDS_ON]->(mes);
CREATE (mes)-[:FEEDS_DATA]->(plc2);
CREATE (mes)-[:FEEDS_DATA]->(plc3);

// Zones for correlation
CREATE (zone1:Zone {name: 'L4-Enterprise', isaLevel: 'L4', securityLevel: 'High'});
CREATE (mes)-[:BELONGS_TO_ZONE]->(zone1);
CREATE (db1)-[:BELONGS_TO_ZONE]->(zone1);
CREATE (api1)-[:BELONGS_TO_ZONE]->(zone1);
CREATE (web1)-[:BELONGS_TO_ZONE]->(zone1);

// =============================================================================
// SCENARIO 6: Time-Based Correlation - Multiple Simultaneous Failures
// =============================================================================

// Failures at approximately the same time (15:45)
CREATE (fail1:Asset {
  name: 'Robot-03',
  type: 'IndustrialRobot',
  status: 'error',
  failureReason: 'Communication timeout',
  lastFailure: datetime('2026-01-04T15:45:00')
});

CREATE (fail2:Asset {
  name: 'Robot-04',
  type: 'IndustrialRobot',
  status: 'error',
  failureReason: 'Communication timeout',
  lastFailure: datetime('2026-01-04T15:45:30')
});

CREATE (fail3:Asset {
  name: 'Conveyor-01',
  type: 'Conveyor',
  status: 'offline',
  failureReason: 'Emergency stop activated',
  lastFailure: datetime('2026-01-04T15:46:00')
});

CREATE (zone2:Zone {name: 'L2-Assembly', isaLevel: 'L2', securityLevel: 'Medium'});
CREATE (fail1)-[:BELONGS_TO_ZONE]->(zone2);
CREATE (fail2)-[:BELONGS_TO_ZONE]->(zone2);
CREATE (fail3)-[:BELONGS_TO_ZONE]->(zone2);

// =============================================================================
// SCENARIO 7: Configuration Drift
// =============================================================================

// Assets with configuration drift
CREATE (drift1:Asset {
  name: 'PLC-007',
  type: 'PLC',
  status: 'running',
  intendedConfig: 'v2.3.1-production',
  actualConfig: 'v2.2.8-dev',
  lastConfigSync: datetime('2025-12-15T10:00:00')
});

CREATE (drift2:Asset {
  name: 'Robot-05',
  type: 'IndustrialRobot',
  status: 'running',
  expectedVersion: 'firmware-v4.5.0',
  actualVersion: 'firmware-v4.4.2',
  lastConfigSync: datetime('2025-12-20T14:30:00')
});

CREATE (drift3:Asset {
  name: 'NetworkSwitch-10',
  type: 'NetworkSwitch',
  status: 'running',
  intendedConfig: 'vlan-config-v3',
  actualConfig: 'vlan-config-v2',
  lastConfigSync: datetime('2026-01-01T08:00:00')
});

// =============================================================================
// SCENARIO 8: Critical Path / Single Points of Failure
// =============================================================================

// Core router - SPOF
CREATE (router1:Asset {
  name: 'CoreRouter-Main',
  type: 'Router',
  status: 'running',
  ipAddress: '192.168.0.1'
});

// Many dependencies
CREATE (dep1:Asset {name: 'Switch-01', type: 'NetworkSwitch', status: 'running'});
CREATE (dep2:Asset {name: 'Switch-02', type: 'NetworkSwitch', status: 'running'});
CREATE (dep3:Asset {name: 'Switch-03', type: 'NetworkSwitch', status: 'running'});
CREATE (dep4:Asset {name: 'Firewall-01', type: 'Firewall', status: 'running'});
CREATE (dep5:Asset {name: 'Gateway-01', type: 'Gateway', status: 'running'});
CREATE (dep6:Asset {name: 'AccessPoint-01', type: 'AccessPoint', status: 'running'});

CREATE (router1)-[:CONNECTS_TO]->(dep1);
CREATE (router1)-[:CONNECTS_TO]->(dep2);
CREATE (router1)-[:CONNECTS_TO]->(dep3);
CREATE (router1)-[:CONNECTS_TO]->(dep4);
CREATE (router1)-[:CONNECTS_TO]->(dep5);
CREATE (router1)-[:CONNECTS_TO]->(dep6);

// Secondary dependencies
CREATE (dep7:Asset {name: 'Server-10', type: 'Server', status: 'running'});
CREATE (dep8:Asset {name: 'Server-11', type: 'Server', status: 'running'});
CREATE (dep9:Asset {name: 'PLC-010', type: 'PLC', status: 'running'});
CREATE (dep10:Asset {name: 'PLC-011', type: 'PLC', status: 'running'});

CREATE (dep1)-[:CONNECTS_TO]->(dep7);
CREATE (dep2)-[:CONNECTS_TO]->(dep8);
CREATE (dep3)-[:CONNECTS_TO]->(dep9);
CREATE (dep3)-[:CONNECTS_TO]->(dep10);

// =============================================================================
// Additional Realistic Data
// =============================================================================

// Healthy assets for contrast
CREATE (healthy1:Asset {name: 'PLC-100', type: 'PLC', status: 'running'});
CREATE (healthy2:Asset {name: 'Robot-100', type: 'IndustrialRobot', status: 'running'});
CREATE (healthy3:Asset {name: 'Server-100', type: 'Server', status: 'running'});

// Create indexes for performance
CREATE INDEX asset_status IF NOT EXISTS FOR (a:Asset) ON (a.status);
CREATE INDEX asset_type IF NOT EXISTS FOR (a:Asset) ON (a.type);
CREATE INDEX asset_name IF NOT EXISTS FOR (a:Asset) ON (a.name);

// =============================================================================
// Summary
// =============================================================================

RETURN 'Test data created successfully!' as message,
       'Total nodes: ' + toString(count{MATCH (n) RETURN n}) as nodes,
       'Total relationships: ' + toString(count{MATCH ()-[r]->() RETURN r}) as relationships;
