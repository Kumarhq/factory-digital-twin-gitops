import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Avatar,
  Stack,
  Badge,
  Button,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  ThreeDRotation as ThreeDIcon,
  Link as LinkIcon,
  Warning as WarningIcon,
  CheckCircle as OnlineIcon,
  Error as ErrorIcon,
  BugReport as RCAIcon,
  BuildCircle as MCPIcon,
  Article as LogIcon,
  SmartToy as AgentIcon,
} from '@mui/icons-material';
import AssetDetailsModal from '../AssetDetailsModal';

interface TableViewProps {
  data: { nodes: any[]; links: any[] };
  loading: boolean;
  onRowClick: (node: any) => void;
  onQuickRCA?: (asset: any) => void;
}

type Order = 'asc' | 'desc';

const getAssetIcon = (type: string): string => {
  const iconMap: { [key: string]: string } = {
    PLC: '🎛️',
    Robot: '🤖',
    IndustrialRobot: '🦾',
    Cobot: '🤝',
    HMI: '🖥️',
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
  };
  return iconMap[type] || '⚫';
};

const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
  const statusLower = status?.toLowerCase();
  if (['online', 'running', 'operational'].includes(statusLower)) return 'success';
  if (['offline', 'error', 'failed'].includes(statusLower)) return 'error';
  if (['warning', 'degraded'].includes(statusLower)) return 'warning';
  return 'default';
};

const getStatusIcon = (status: string) => {
  const statusLower = status?.toLowerCase();
  if (['online', 'running', 'operational'].includes(statusLower))
    return <OnlineIcon fontSize="small" sx={{ color: '#10b981' }} />;
  if (['offline', 'error', 'failed'].includes(statusLower))
    return <ErrorIcon fontSize="small" sx={{ color: '#ef4444' }} />;
  if (['warning', 'degraded'].includes(statusLower))
    return <WarningIcon fontSize="small" sx={{ color: '#f59e0b' }} />;
  return null;
};

const TableView: React.FC<TableViewProps> = ({ data, loading, onRowClick, onQuickRCA }) => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const handleViewDetails = (asset: any, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedAssetId(asset.id || asset.name);
    setDetailsModalOpen(true);
  };

  const handleOpen3D = (node: any, event: React.MouseEvent) => {
    event.stopPropagation();
    const matterportId = node.matterportSpaceId || node.properties?.matterportSpaceId;
    if (matterportId) {
      window.open(`https://my.matterport.com/show/?m=${matterportId}`, '_blank');
    }
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Calculate connection counts for each asset
  const connectionCounts = useMemo(() => {
    const counts: { [key: string]: { incoming: number; outgoing: number } } = {};

    data.nodes?.forEach((node) => {
      const key = node.id || node.name;
      counts[key] = { incoming: 0, outgoing: 0 };
    });

    data.links?.forEach((link) => {
      const sourceKey = typeof link.source === 'object' ? (link.source.id || link.source.name) : link.source;
      const targetKey = typeof link.target === 'object' ? (link.target.id || link.target.name) : link.target;

      if (counts[sourceKey]) counts[sourceKey].outgoing++;
      if (counts[targetKey]) counts[targetKey].incoming++;
    });

    return counts;
  }, [data]);

  const sortedNodes = useMemo(() => {
    const nodes = [...(data.nodes || [])];

    return nodes.sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      // Special handling for connections
      if (orderBy === 'connections') {
        const aKey = a.id || a.name;
        const bKey = b.id || b.name;
        aValue = (connectionCounts[aKey]?.incoming || 0) + (connectionCounts[aKey]?.outgoing || 0);
        bValue = (connectionCounts[bKey]?.incoming || 0) + (connectionCounts[bKey]?.outgoing || 0);
      }

      if (typeof aValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [data.nodes, order, orderBy, connectionCounts]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ height: '100%', overflow: 'auto' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                onClick={() => handleRequestSort('name')}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Asset Name
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'type'}
                direction={orderBy === 'type' ? order : 'asc'}
                onClick={() => handleRequestSort('type')}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Type
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'status'}
                direction={orderBy === 'status' ? order : 'asc'}
                onClick={() => handleRequestSort('status')}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Status
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Location
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Security Zone
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Team Owner
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <MCPIcon fontSize="small" />
                  <span>MCP Tools</span>
                </Stack>
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LogIcon fontSize="small" />
                  <span>Logging</span>
                </Stack>
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <AgentIcon fontSize="small" />
                  <span>Sub-Agents</span>
                </Stack>
              </Typography>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'connections'}
                direction={orderBy === 'connections' ? order : 'asc'}
                onClick={() => handleRequestSort('connections')}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Connections
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Actions
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedNodes.map((node) => {
            const nodeKey = node.id || node.name;
            const connections = connectionCounts[nodeKey] || { incoming: 0, outgoing: 0 };
            const totalConnections = connections.incoming + connections.outgoing;

            return (
              <TableRow
                key={node.id}
                hover
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => onRowClick(node)}
              >
                <TableCell padding="checkbox">
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: getStatusColor(node.status) === 'success' ? '#10b981' :
                               getStatusColor(node.status) === 'error' ? '#ef4444' :
                               getStatusColor(node.status) === 'warning' ? '#f59e0b' : '#94a3b8',
                      fontSize: '1.2rem',
                    }}
                  >
                    {getAssetIcon(node.type)}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {node.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {node.id}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={node.type} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getStatusIcon(node.status)}
                    <Chip
                      label={node.status}
                      size="small"
                      color={getStatusColor(node.status)}
                    />
                  </Stack>
                </TableCell>
                <TableCell>
                  {node.location || node.properties?.location ? (
                    <Typography variant="body2">📍 {node.location || node.properties?.location}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {node.securityZone || node.properties?.securityZone ? (
                    <Chip
                      label={node.securityZone || node.properties?.securityZone}
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {node.teamOwnership ? (
                    <Tooltip title={`Lead: ${node.teamOwnership.lead} | Contact: ${node.teamOwnership.contact}`}>
                      <Chip
                        label={node.teamOwnership.team}
                        size="small"
                        color="primary"
                        sx={{ fontSize: '0.7rem', maxWidth: 180 }}
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {node.mcpTools && node.mcpTools.length > 0 ? (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {node.mcpTools.slice(0, 2).map((tool: string, idx: number) => (
                        <Chip
                          key={idx}
                          label={tool}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      ))}
                      {node.mcpTools.length > 2 && (
                        <Tooltip title={node.mcpTools.slice(2).join(', ')}>
                          <Chip
                            label={`+${node.mcpTools.length - 2}`}
                            size="small"
                            color="primary"
                            sx={{ fontSize: '0.65rem', height: 20 }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {node.logging && node.logging.length > 0 ? (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {node.logging.slice(0, 2).map((log: string, idx: number) => (
                        <Chip
                          key={idx}
                          label={log}
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      ))}
                      {node.logging.length > 2 && (
                        <Tooltip title={node.logging.slice(2).join(', ')}>
                          <Chip
                            label={`+${node.logging.length - 2}`}
                            size="small"
                            color="info"
                            sx={{ fontSize: '0.65rem', height: 20 }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {node.subAgents && node.subAgents.length > 0 ? (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {node.subAgents.slice(0, 2).map((agent: string, idx: number) => (
                        <Chip
                          key={idx}
                          label={agent}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      ))}
                      {node.subAgents.length > 2 && (
                        <Tooltip title={node.subAgents.slice(2).join(', ')}>
                          <Chip
                            label={`+${node.subAgents.length - 2}`}
                            size="small"
                            color="secondary"
                            sx={{ fontSize: '0.65rem', height: 20 }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title={`${connections.incoming} incoming`}>
                      <Chip
                        label={`↓ ${connections.incoming}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Tooltip>
                    <Tooltip title={`${connections.outgoing} outgoing`}>
                      <Chip
                        label={`↑ ${connections.outgoing}`}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={(e) => handleViewDetails(node, e)}
                        color="primary"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {(node.matterportSpaceId || node.properties?.matterportSpaceId) && (
                      <Tooltip title="View in 3D">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpen3D(node, e)}
                          color="secondary"
                        >
                          <ThreeDIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={`${totalConnections} connection(s) - ${connections.incoming} in, ${connections.outgoing} out`}>
                      <IconButton size="small" onClick={(e) => handleViewDetails(node, e)}>
                        <Badge badgeContent={totalConnections} color="primary">
                          <LinkIcon fontSize="small" />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                    {onQuickRCA && node.status && !['running', 'online', 'available'].includes(node.status.toLowerCase()) && (
                      <Tooltip title="Quick RCA Analysis">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickRCA(node);
                          }}
                          color="error"
                        >
                          <RCAIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {sortedNodes.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
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
    </TableContainer>
  );
};

export default TableView;
