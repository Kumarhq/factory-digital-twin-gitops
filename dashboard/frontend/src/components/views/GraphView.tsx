import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  CircularProgress,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Button,
  Card,
  CardContent,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  alpha,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  BugReport as RCAIcon,
  AccountTree,
  Grain,
  Settings as MCPIcon,
  Code as LogIcon,
  SmartToy as AgentIcon,
  Close as CloseIcon,
  Group as TeamIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Chat as SlackIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide, forceManyBody, forceLink } from 'd3-force';

interface GraphViewProps {
  data: { nodes: any[]; links: any[] };
  loading: boolean;
  onNodeClick: (node: any) => void;
  selectedAsset: any;
  onQuickRCA?: (asset: any) => void;
}

// Zone color mapping for ISA-95 levels
const getZoneColor = (zone: string): string => {
  const zoneColors: { [key: string]: string } = {
    'Level 0 - Process': '#ef4444',      // Red
    'Level 1 - Control': '#f59e0b',      // Orange
    'Level 2 - Supervisory': '#eab308',  // Yellow
    'Level 3 - Operations': '#22c55e',   // Green
    'Level 4 - Enterprise': '#3b82f6',   // Blue
    'Unassigned': '#94a3b8',             // Gray
  };
  return zoneColors[zone] || '#6b7280';
};

// Icon mappings for different asset types
const getAssetIcon = (type: string): string => {
  const iconMap: { [key: string]: string } = {
    // Manufacturing
    PLC: '🎛️',
    Robot: '🤖',
    IndustrialRobot: '🦾',
    Cobot: '🤝',
    HMI: '🖥️',
    CNC: '⚙️',
    Lathe: '🔧',
    Press: '🔨',
    Conveyor: '📦',

    // Infrastructure
    Server: '🖥️',
    Storage: '💾',
    UPS: '🔋',
    Chiller: '❄️',
    AirHandler: '💨',
    BMS: '🏢',
    HVAC: '🌡️',

    // Network
    NetworkSwitch: '🔀',
    Router: '📡',
    Firewall: '🛡️',
    AccessPoint: '📶',
    Gateway: '🚪',
    EdgeGateway: '🌐',

    // Data
    KafkaBroker: '📊',
    RedisCache: '⚡',
    PostgreSQL: '🗄️',
    TimescaleDB: '⏱️',
    KubernetesCluster: '☸️',
    KubernetesDeployment: '🚀',

    // IoT
    Sensor: '📡',
    IoTDevice: '🔌',
    Camera: '📹',
    RFID: '🏷️',
  };
  return iconMap[type] || '⚫';
};

const getStatusColor = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    online: '#10b981',
    running: '#10b981',
    operational: '#10b981',
    offline: '#ef4444',
    error: '#ef4444',
    failed: '#ef4444',
    warning: '#f59e0b',
    degraded: '#f59e0b',
    maintenance: '#6366f1',
  };
  return statusMap[status?.toLowerCase()] || '#94a3b8';
};

const getNodeSize = (type: string): number => {
  const sizeMap: { [key: string]: number } = {
    Server: 10,
    UPS: 11,
    Router: 9,
    NetworkSwitch: 9,
    Firewall: 9,
    PLC: 9,
    Robot: 10,
    IndustrialRobot: 10,
    KubernetesCluster: 11,
    KafkaBroker: 9,
  };
  return sizeMap[type] || 8;
};

const getNodeCategory = (type: string): string => {
  const categoryMap: { [key: string]: string } = {
    PLC: 'manufacturing',
    Robot: 'manufacturing',
    IndustrialRobot: 'manufacturing',
    Cobot: 'manufacturing',
    HMI: 'manufacturing',
    CNC: 'manufacturing',
    Server: 'infrastructure',
    Storage: 'infrastructure',
    UPS: 'infrastructure',
    NetworkSwitch: 'network',
    Router: 'network',
    Firewall: 'network',
    KafkaBroker: 'data',
    PostgreSQL: 'data',
    Sensor: 'iot',
    Camera: 'iot',
  };
  return categoryMap[type] || 'other';
};

const GraphView: React.FC<GraphViewProps> = ({ data, loading, onNodeClick, selectedAsset, onQuickRCA }) => {
  const graphRef = useRef<any>();
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [layoutMode, setLayoutMode] = useState<'force' | 'cluster'>('cluster');
  const [zoneBounds, setZoneBounds] = useState<{ [key: string]: { x: number; y: number; width: number; height: number; color: string } }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('GraphView data:', {
      nodeCount: data.nodes?.length || 0,
      linkCount: data.links?.length || 0,
      sampleNode: data.nodes?.[0],
      loading
    });
  }, [data, loading]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Apply zone-based clustering layout
  useEffect(() => {
    if (graphRef.current && layoutMode === 'cluster' && data.nodes.length > 0) {
      try {
        const fg = graphRef.current;

        // Group nodes by security zone - use grid layout for zones
        const zones = Array.from(new Set(data.nodes.map((n: any) => n.securityZone || 'Unassigned')));
        const gridSize = Math.ceil(Math.sqrt(zones.length));
        const zoneSpacing = 800; // Much larger spacing between zones

        // Create cluster centers in a grid layout
        const clusterCenters: { [key: string]: { x: number; y: number } } = {};
        zones.forEach((zone, i) => {
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          clusterCenters[zone] = {
            x: (col - gridSize / 2) * zoneSpacing,
            y: (row - gridSize / 2) * zoneSpacing,
          };
        });

        // Initialize node positions to zone centers if not set
        data.nodes.forEach((node: any) => {
          const zone = node.securityZone || 'Unassigned';
          const center = clusterCenters[zone] || { x: 0, y: 0 };

          // If node doesn't have position, place it near zone center with small random offset
          if (node.x === undefined || node.y === undefined) {
            node.x = center.x + (Math.random() - 0.5) * 100;
            node.y = center.y + (Math.random() - 0.5) * 100;
          }
        });

        // Apply very strong clustering force to pull nodes to zone centers
        fg.d3Force('cluster', () => {
          data.nodes.forEach((node: any) => {
            if (node.x !== undefined && node.y !== undefined) {
              const zone = node.securityZone || 'Unassigned';
              const center = clusterCenters[zone] || { x: 0, y: 0 };
              const k = 0.5; // Much stronger clustering force (increased from 0.2)
              node.vx = (node.vx || 0) - (node.x - center.x) * k;
              node.vy = (node.vy || 0) - (node.y - center.y) * k;
            }
          });
        });

        // Much larger collision radius and stronger forces
        fg.d3Force('collide', forceCollide(60)); // Increased from 50
        fg.d3Force('charge', forceManyBody().strength(-600)); // Stronger repulsion (from -500)
        fg.d3Force('link', forceLink(data.links).distance(150).strength(0.1)); // Weaker links so clustering dominates

        // Reheat the simulation to apply new forces
        fg.d3ReheatSimulation();
      } catch (error) {
        console.error('Error applying clustering layout:', error);
      }
    }
  }, [data, layoutMode]);

  const handleNodeHover = useCallback((node: any) => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();

    if (node) {
      newHighlightNodes.add(node);

      // Highlight connected nodes and links
      data.links.forEach((link: any) => {
        if (link.source === node || link.source.id === node.id || link.source.name === node.name) {
          newHighlightNodes.add(link.target);
          newHighlightLinks.add(link);
        }
        if (link.target === node || link.target.id === node.id || link.target.name === node.name) {
          newHighlightNodes.add(link.source);
          newHighlightLinks.add(link);
        }
      });
    }

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
    setHoverNode(node || null);
  }, [data.links]);

  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    // Safety check for node position
    if (node.x === undefined || node.y === undefined) return;

    const label = node.name || node.id;
    const fontSize = 12 / globalScale;
    const nodeSize = getNodeSize(node.type) * 1.2;
    const isHighlighted = highlightNodes.has(node) || node === selectedAsset;

    ctx.save();

    // Draw outer glow for highlighted nodes
    if (isHighlighted) {
      ctx.shadowColor = getStatusColor(node.status);
      ctx.shadowBlur = 20;
    }

    // Draw main circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = getStatusColor(node.status);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = isHighlighted ? '#fff' : '#333';
    ctx.lineWidth = isHighlighted ? 3 / globalScale : 1.5 / globalScale;
    ctx.stroke();

    // Draw icon
    const icon = getAssetIcon(node.type);
    ctx.font = `${fontSize * 1.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(icon, node.x, node.y);

    // Draw status indicator dot
    const dotRadius = 3;
    ctx.beginPath();
    ctx.arc(node.x + nodeSize * 0.7, node.y - nodeSize * 0.7, dotRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(node.x + nodeSize * 0.7, node.y - nodeSize * 0.7, dotRadius * 0.7, 0, 2 * Math.PI);
    ctx.fillStyle = getStatusColor(node.status);
    ctx.fill();

    // Draw label only for highlighted nodes or when zoomed in
    if (globalScale > 0.6 || isHighlighted) {
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Label background
      const labelWidth = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(
        node.x - labelWidth / 2 - 4,
        node.y + nodeSize + 3,
        labelWidth + 8,
        fontSize + 4
      );

      // Label text
      ctx.fillStyle = '#fff';
      ctx.fillText(label, node.x, node.y + nodeSize + 5);
    }

    ctx.restore();
  }, [highlightNodes, selectedAsset]);

  const drawLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHighlighted = highlightLinks.has(link);
    const start = link.source;
    const end = link.target;

    // Safety check for link positions
    if (!start || !end || start.x === undefined || start.y === undefined ||
        end.x === undefined || end.y === undefined) return;

    ctx.save();

    // Draw link line
    ctx.strokeStyle = isHighlighted ? '#3b82f6' : '#cbd5e1';
    ctx.lineWidth = isHighlighted ? 2.5 / globalScale : 1 / globalScale;
    ctx.globalAlpha = isHighlighted ? 0.9 : 0.3;

    if (link.type === 'POWERS') {
      ctx.setLineDash([5 / globalScale, 5 / globalScale]);
    }

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }, [highlightLinks]);

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.2, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.2, 400);
    }
  };

  const handleCenterGraph = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data.nodes || data.nodes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No assets found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters or refresh the data
        </Typography>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: '#f8fafc', borderRadius: 2 }}>
      {/* Controls */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          bgcolor: 'rgba(255,255,255,0.95)',
          p: 1,
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <ToggleButtonGroup
          value={layoutMode}
          exclusive
          onChange={(_, newMode) => newMode && setLayoutMode(newMode)}
          size="small"
        >
          <ToggleButton value="force">
            <Tooltip title="Force Layout">
              <Grain fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="cluster">
            <Tooltip title="Clustered Layout">
              <AccountTree fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        <Tooltip title="Zoom In">
          <IconButton size="small" onClick={handleZoomIn}>
            <ZoomIn fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton size="small" onClick={handleZoomOut}>
            <ZoomOut fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Center">
          <IconButton size="small" onClick={handleCenterGraph}>
            <CenterFocusStrong fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Stats Overlay */}
      <Paper
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          p: 2,
          bgcolor: 'rgba(255,255,255,0.95)',
          minWidth: 200,
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block">
          Total Assets: <strong>{data.nodes?.length || 0}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Connections: <strong>{data.links?.length || 0}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Layout: <strong>{layoutMode === 'cluster' ? 'Clustered' : 'Force-Directed'}</strong>
        </Typography>
      </Paper>

      {/* Hover Node Info Panel */}
      {/* Show panel for selected node (persists) or hover node (temporary) */}
      {(selectedNode || hoverNode) && (
        <Card
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 10,
            minWidth: 320,
            maxWidth: 400,
            boxShadow: 4,
          }}
        >
          <CardContent>
            {(() => {
              const displayNode = selectedNode || hoverNode;
              return (
                <>
                  <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {getAssetIcon(displayNode.type)} {displayNode.name}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip label={displayNode.type} size="small" color="primary" variant="outlined" />
                        <Chip
                          label={displayNode.status}
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatusColor(displayNode.status), 0.1),
                            color: getStatusColor(displayNode.status),
                            borderColor: getStatusColor(displayNode.status),
                          }}
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                    {/* Close button for selected nodes */}
                    {selectedNode && (
                      <IconButton
                        size="small"
                        onClick={() => setSelectedNode(null)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* MCP Tools */}
                  {displayNode.mcpTools && displayNode.mcpTools.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                        <MCPIcon fontSize="small" color="primary" />
                        <Typography variant="caption" fontWeight="bold">
                          MCP Tools ({displayNode.mcpTools.length})
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {displayNode.mcpTools.slice(0, 3).map((tool: string, idx: number) => (
                          <Chip key={idx} label={tool} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                        ))}
                        {displayNode.mcpTools.length > 3 && (
                          <Chip
                            label={`+${displayNode.mcpTools.length - 3} more`}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Logging */}
                  {displayNode.logging && displayNode.logging.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                        <LogIcon fontSize="small" color="info" />
                        <Typography variant="caption" fontWeight="bold">
                          Logging ({displayNode.logging.length})
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {displayNode.logging.slice(0, 3).map((log: string, idx: number) => (
                          <Chip key={idx} label={log} size="small" sx={{ fontSize: '0.7rem', height: 20 }} color="info" variant="outlined" />
                        ))}
                        {displayNode.logging.length > 3 && (
                          <Chip
                            label={`+${displayNode.logging.length - 3} more`}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Sub-Agents */}
                  {displayNode.subAgents && displayNode.subAgents.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                        <AgentIcon fontSize="small" color="secondary" />
                        <Typography variant="caption" fontWeight="bold">
                          Sub-Agents ({displayNode.subAgents.length})
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {displayNode.subAgents.slice(0, 2).map((agent: string, idx: number) => (
                          <Chip key={idx} label={agent} size="small" sx={{ fontSize: '0.7rem', height: 20 }} color="secondary" variant="outlined" />
                        ))}
                        {displayNode.subAgents.length > 2 && (
                          <Chip
                            label={`+${displayNode.subAgents.length - 2} more`}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Team Ownership */}
                  {displayNode.teamOwnership && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                          <TeamIcon fontSize="small" sx={{ color: '#2563eb' }} />
                          <Typography variant="caption" fontWeight="bold" color="#2563eb">
                            Team Ownership
                          </Typography>
                        </Stack>
                        <Box sx={{ bgcolor: '#eff6ff', p: 1, borderRadius: 1, border: '1px solid #bfdbfe' }}>
                          <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                            {displayNode.teamOwnership.team}
                          </Typography>
                          <Stack spacing={0.5}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <PersonIcon sx={{ fontSize: 14, color: '#64748b' }} />
                              <Typography variant="caption" color="text.secondary">
                                {displayNode.teamOwnership.lead}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <EmailIcon sx={{ fontSize: 14, color: '#64748b' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                {displayNode.teamOwnership.contact}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <SlackIcon sx={{ fontSize: 14, color: '#64748b' }} />
                              <Typography variant="caption" color="text.secondary">
                                {displayNode.teamOwnership.slack}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <PhoneIcon sx={{ fontSize: 14, color: '#64748b' }} />
                              <Typography variant="caption" color="text.secondary">
                                On-Call: {displayNode.teamOwnership.oncall}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      </Box>
                    </>
                  )}

                  {onQuickRCA && displayNode.status && !['running', 'online', 'available'].includes(displayNode.status.toLowerCase()) && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<RCAIcon />}
                        onClick={() => {
                          onQuickRCA(displayNode);
                          setSelectedNode(null);
                        }}
                        color="error"
                      >
                        Quick RCA Analysis
                      </Button>
                    </>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Force Graph */}
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeRelSize={8}
        nodeCanvasObject={drawNode}
        nodeCanvasObjectMode={() => 'after'}
        linkCanvasObject={drawLink}
        onNodeHover={handleNodeHover}
        onNodeClick={(node) => {
          onNodeClick(node);
          // Toggle selection - if clicking same node, deselect; otherwise select new node
          setSelectedNode(selectedNode?.id === node?.id ? null : node);
        }}
        cooldownTicks={100}
        onEngineStop={() => {
          if (graphRef.current) {
            graphRef.current.zoomToFit(400, 50);
          }
        }}
        onRenderFramePre={(ctx, globalScale) => {
          // Draw zone backgrounds in cluster mode
          if (layoutMode === 'cluster' && data.nodes.length > 0) {
            const zones = Array.from(new Set(data.nodes.map((n: any) => n.securityZone || 'Unassigned')));
            const gridSize = Math.ceil(Math.sqrt(zones.length));
            const zoneSpacing = 800;
            const zoneSize = 600; // Size of each zone background rectangle

            zones.forEach((zone, i) => {
              const row = Math.floor(i / gridSize);
              const col = i % gridSize;
              const centerX = (col - gridSize / 2) * zoneSpacing;
              const centerY = (row - gridSize / 2) * zoneSpacing;

              // Draw zone background rectangle
              ctx.save();
              ctx.fillStyle = `${getZoneColor(zone)}15`; // 15 is ~8% opacity in hex
              ctx.strokeStyle = getZoneColor(zone);
              ctx.lineWidth = 3 / globalScale;
              ctx.setLineDash([10 / globalScale, 5 / globalScale]);

              // Draw rounded rectangle
              const rectX = centerX - zoneSize / 2;
              const rectY = centerY - zoneSize / 2;
              const radius = 20 / globalScale;

              ctx.beginPath();
              ctx.moveTo(rectX + radius, rectY);
              ctx.lineTo(rectX + zoneSize - radius, rectY);
              ctx.quadraticCurveTo(rectX + zoneSize, rectY, rectX + zoneSize, rectY + radius);
              ctx.lineTo(rectX + zoneSize, rectY + zoneSize - radius);
              ctx.quadraticCurveTo(rectX + zoneSize, rectY + zoneSize, rectX + zoneSize - radius, rectY + zoneSize);
              ctx.lineTo(rectX + radius, rectY + zoneSize);
              ctx.quadraticCurveTo(rectX, rectY + zoneSize, rectX, rectY + zoneSize - radius);
              ctx.lineTo(rectX, rectY + radius);
              ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
              ctx.closePath();

              ctx.fill();
              ctx.stroke();
              ctx.restore();
            });
          }
        }}
      />

      {/* Zone Labels - Show zone badges when in cluster mode */}
      {layoutMode === 'cluster' && data.nodes.length > 0 && (() => {
        const zones = Array.from(new Set(data.nodes.map((n: any) => n.securityZone || 'Unassigned')));
        const gridSize = Math.ceil(Math.sqrt(zones.length));
        const zoneSpacing = 800; // Match the cluster spacing

        return zones.map((zone, i) => {
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          const centerX = (col - gridSize / 2) * zoneSpacing + dimensions.width / 2;
          const centerY = (row - gridSize / 2) * zoneSpacing + dimensions.height / 2 - 150; // Offset above cluster

          return (
            <Chip
              key={zone}
              label={zone}
              size="small"
              sx={{
                position: 'absolute',
                left: centerX,
                top: centerY,
                transform: 'translate(-50%, -50%)',
                bgcolor: alpha(getZoneColor(zone), 0.9),
                color: '#fff',
                fontWeight: 600,
                boxShadow: 2,
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
          );
        });
      })()}
    </Box>
  );
};

export default GraphView;
