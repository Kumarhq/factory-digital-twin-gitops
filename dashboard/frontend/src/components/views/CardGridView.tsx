import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  Badge,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  ThreeDRotation as ThreeDIcon,
  Link as LinkIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  BugReport as RCAIcon,
  BuildCircle as MCPIcon,
  Article as LogIcon,
  SmartToy as AgentIcon,
  Group as TeamIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Chat as SlackIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import AssetDetailsModal from '../AssetDetailsModal';

interface CardGridViewProps {
  data: { nodes: any[]; links: any[] };
  loading: boolean;
  onCardClick: (node: any) => void;
  onQuickRCA?: (asset: any) => void;
}

const getAssetIcon = (type: string): string => {
  const iconMap: { [key: string]: string } = {
    PLC: '🎛️',
    Robot: '🤖',
    IndustrialRobot: '🦾',
    Cobot: '🤝',
    HMI: '🖥️',
    CNC: '⚙️',
    Server: '🖥️',
    Storage: '💾',
    UPS: '🔋',
    NetworkSwitch: '🔀',
    Router: '📡',
    Firewall: '🛡️',
    Sensor: '📡',
    KafkaBroker: '📊',
    PostgreSQL: '🗄️',
    KubernetesCluster: '☸️',
    Chiller: '❄️',
    AirHandler: '💨',
  };
  return iconMap[type] || '⚫';
};

const getStatusColor = (status: string) => {
  const statusLower = status?.toLowerCase();
  if (['online', 'running', 'operational'].includes(statusLower)) return '#10b981';
  if (['offline', 'error', 'failed'].includes(statusLower)) return '#ef4444';
  if (['warning', 'degraded'].includes(statusLower)) return '#f59e0b';
  return '#94a3b8';
};

const getStatusLabel = (status: string): 'success' | 'error' | 'warning' | 'default' => {
  const statusLower = status?.toLowerCase();
  if (['online', 'running', 'operational'].includes(statusLower)) return 'success';
  if (['offline', 'error', 'failed'].includes(statusLower)) return 'error';
  if (['warning', 'degraded'].includes(statusLower)) return 'warning';
  return 'default';
};

const getCategoryColor = (type: string): string => {
  if (['PLC', 'Robot', 'IndustrialRobot', 'Cobot', 'HMI', 'CNC'].includes(type))
    return '#8b5cf6'; // Purple for manufacturing
  if (['Server', 'Storage', 'UPS', 'Chiller', 'AirHandler', 'BMS'].includes(type))
    return '#3b82f6'; // Blue for infrastructure
  if (['NetworkSwitch', 'Router', 'Firewall', 'Gateway'].includes(type))
    return '#10b981'; // Green for network
  if (['KafkaBroker', 'PostgreSQL', 'Redis', 'KubernetesCluster'].includes(type))
    return '#f59e0b'; // Orange for data
  if (['Sensor', 'IoTDevice', 'Camera', 'RFID'].includes(type))
    return '#ec4899'; // Pink for IoT
  return '#64748b';
};

const getHealthScore = (status: string): number => {
  const statusLower = status?.toLowerCase();
  if (['online', 'running', 'operational'].includes(statusLower)) return 100;
  if (['warning', 'degraded'].includes(statusLower)) return 60;
  if (['offline', 'error', 'failed'].includes(statusLower)) return 20;
  return 50;
};

const CardGridView: React.FC<CardGridViewProps> = ({ data, loading, onCardClick, onQuickRCA }) => {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const handleViewDetails = (asset: any, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setSelectedAssetId(asset.id || asset.name);
    setDetailsModalOpen(true);
  };

  const handleOpen3D = (asset: any, event: React.MouseEvent) => {
    event.stopPropagation();
    const matterportId = asset.matterportSpaceId || asset.properties?.matterportSpaceId;
    if (matterportId) {
      window.open(`https://my.matterport.com/show/?m=${matterportId}`, '_blank');
    }
  };

  // Calculate connection counts for each asset
  const assetData = useMemo(() => {
    const connectionCounts: { [key: string]: { incoming: number; outgoing: number } } = {};

    data.nodes?.forEach((node) => {
      const key = node.id || node.name;
      connectionCounts[key] = { incoming: 0, outgoing: 0 };
    });

    data.links?.forEach((link) => {
      const sourceKey = typeof link.source === 'object' ? (link.source.id || link.source.name) : link.source;
      const targetKey = typeof link.target === 'object' ? (link.target.id || link.target.name) : link.target;

      if (connectionCounts[sourceKey]) connectionCounts[sourceKey].outgoing++;
      if (connectionCounts[targetKey]) connectionCounts[targetKey].incoming++;
    });

    return data.nodes?.map((node) => {
      const key = node.id || node.name;
      return {
        ...node,
        connections: connectionCounts[key] || { incoming: 0, outgoing: 0 },
        totalConnections:
          (connectionCounts[key]?.incoming || 0) + (connectionCounts[key]?.outgoing || 0),
      };
    });
  }, [data]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      <Grid container spacing={2}>
        {assetData?.map((asset) => {
          const healthScore = getHealthScore(asset.status);

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: `4px solid ${getCategoryColor(asset.type)}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleViewDetails(asset)}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  {/* Header with Icon and Status */}
                  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: getStatusColor(asset.status),
                        fontSize: '2rem',
                      }}
                    >
                      {getAssetIcon(asset.type)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 600 }}>
                        {asset.name}
                      </Typography>
                      <Chip
                        label={asset.status}
                        size="small"
                        color={getStatusLabel(asset.status)}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Stack>

                  {/* Asset Type Badge */}
                  <Chip
                    label={asset.type}
                    size="small"
                    sx={{
                      bgcolor: getCategoryColor(asset.type),
                      color: '#fff',
                      fontWeight: 500,
                      mb: 2,
                    }}
                  />

                  {/* Health Score */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Health Score
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {healthScore}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={healthScore}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        bgcolor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getStatusColor(asset.status),
                        },
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Details */}
                  <Stack spacing={1}>
                    {(asset.location || asset.properties?.location) && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {asset.location || asset.properties?.location}
                        </Typography>
                      </Stack>
                    )}
                    {(asset.securityZone || asset.properties?.securityZone) && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SecurityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {asset.securityZone || asset.properties?.securityZone}
                        </Typography>
                      </Stack>
                    )}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LinkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {asset.connections.incoming} in • {asset.connections.outgoing} out
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Capabilities: MCP Tools, Logging, Sub-Agents */}
                  <Stack spacing={1}>
                    {/* MCP Tools */}
                    {asset.mcpTools && asset.mcpTools.length > 0 && (
                      <Box>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                          <MCPIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            MCP Tools ({asset.mcpTools.length})
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {asset.mcpTools.slice(0, 2).map((tool: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={tool}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 18 }}
                            />
                          ))}
                          {asset.mcpTools.length > 2 && (
                            <Tooltip title={asset.mcpTools.slice(2).join(', ')}>
                              <Chip
                                label={`+${asset.mcpTools.length - 2}`}
                                size="small"
                                color="primary"
                                sx={{ fontSize: '0.6rem', height: 18 }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Logging */}
                    {asset.logging && asset.logging.length > 0 && (
                      <Box>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                          <LogIcon sx={{ fontSize: 14, color: 'info.main' }} />
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Logging ({asset.logging.length})
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {asset.logging.slice(0, 2).map((log: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={log}
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 18 }}
                            />
                          ))}
                          {asset.logging.length > 2 && (
                            <Tooltip title={asset.logging.slice(2).join(', ')}>
                              <Chip
                                label={`+${asset.logging.length - 2}`}
                                size="small"
                                color="info"
                                sx={{ fontSize: '0.6rem', height: 18 }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Sub-Agents */}
                    {asset.subAgents && asset.subAgents.length > 0 && (
                      <Box>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                          <AgentIcon sx={{ fontSize: 14, color: 'secondary.main' }} />
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Sub-Agents ({asset.subAgents.length})
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {asset.subAgents.slice(0, 2).map((agent: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={agent}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 18 }}
                            />
                          ))}
                          {asset.subAgents.length > 2 && (
                            <Tooltip title={asset.subAgents.slice(2).join(', ')}>
                              <Chip
                                label={`+${asset.subAgents.length - 2}`}
                                size="small"
                                color="secondary"
                                sx={{ fontSize: '0.6rem', height: 18 }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    )}
                  </Stack>

                  {/* Team Ownership */}
                  {asset.teamOwnership && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                          <TeamIcon sx={{ fontSize: 14, color: '#2563eb' }} />
                          <Typography variant="caption" fontWeight="bold" color="#2563eb">
                            Team Ownership
                          </Typography>
                        </Stack>
                        <Box sx={{ bgcolor: '#eff6ff', p: 1, borderRadius: 1, border: '1px solid #bfdbfe' }}>
                          <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                            {asset.teamOwnership.team}
                          </Typography>
                          <Stack spacing={0.3}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <PersonIcon sx={{ fontSize: 12 }} />
                              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                                {asset.teamOwnership.lead}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <EmailIcon sx={{ fontSize: 12 }} />
                              <Typography variant="caption" sx={{ fontSize: '0.65rem' }} noWrap>
                                {asset.teamOwnership.contact}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <SlackIcon sx={{ fontSize: 12 }} />
                              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                                {asset.teamOwnership.slack}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <PhoneIcon sx={{ fontSize: 12 }} />
                              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                                {asset.teamOwnership.oncall}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => handleViewDetails(asset, e)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {onQuickRCA && asset.status && !['running', 'online', 'available'].includes(asset.status.toLowerCase()) && (
                      <Tooltip title="Quick RCA">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickRCA(asset);
                          }}
                        >
                          <RCAIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={0.5}>
                    {(asset.matterportSpaceId || asset.properties?.matterportSpaceId) && (
                      <Tooltip title="View in 3D">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={(e) => handleOpen3D(asset, e)}
                        >
                          <ThreeDIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={`${asset.totalConnections} connection(s) - ${asset.connections.incoming} in, ${asset.connections.outgoing} out`}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleViewDetails(asset, e)}
                      >
                        <Badge badgeContent={asset.totalConnections} color="primary" max={99}>
                          <LinkIcon fontSize="small" />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {assetData?.length === 0 && (
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No assets found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or search query
          </Typography>
        </Box>
      )}

      {/* Asset Details Modal */}
      <AssetDetailsModal
        open={detailsModalOpen}
        assetId={selectedAssetId}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedAssetId(null);
        }}
      />
    </Box>
  );
};

export default CardGridView;
