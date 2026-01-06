import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Button,
  Skeleton,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Factory as FactoryIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Router as RouterIcon,
  Cloud as CloudIcon,
  Power as PowerIcon,
  Thermostat as ThermostatIcon,
  PrecisionManufacturing as RobotIcon,
  Memory as PLCIcon,
  ViewInAr as VRIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ZoneHealth {
  zone: string;
  level: string;
  total: number;
  online: number;
  warning: number;
  offline: number;
  color: string;
}

interface CriticalIssue {
  asset: string;
  type: string;
  status: string;
  issue: string;
  since: string;
  severity: 'critical' | 'high' | 'medium';
}

interface PerformanceMetrics {
  totalEquipment: number;
  running: number;
  degraded: number;
  failed: number;
  oeeScore: number;
  performancePercent: number;
}

interface NetworkHealth {
  totalDevices: number;
  online: number;
  degraded: number;
  offline: number;
  healthPercent: number;
}

const ExecutiveDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [zones, setZones] = useState<ZoneHealth[]>([]);
  const [issues, setIssues] = useState<CriticalIssue[]>([]);
  const [matterportSpaces, setMatterportSpaces] = useState<any[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [networkHealth, setNetworkHealth] = useState<NetworkHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);

      // Fetch all data in parallel
      const [statsRes, zonesRes, issuesRes, spacesRes, perfRes, netHealthRes] = await Promise.all([
        axios.get(`${API_BASE}/api/stats`),
        axios.get(`${API_BASE}/api/zones`),
        axios.get(`${API_BASE}/api/executive/issues`),
        axios.get(`${API_BASE}/api/spaces`),
        axios.get(`${API_BASE}/api/executive/performance`),
        axios.get(`${API_BASE}/api/executive/network-health`),
      ]);

      setStats(statsRes.data);
      setZones(zonesRes.data);
      setIssues(issuesRes.data);
      setMatterportSpaces(spacesRes.data);
      setPerformance(perfRes.data);
      setNetworkHealth(netHealthRes.data);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'online':
        return '#10b981';
      case 'warning':
      case 'degraded':
        return '#f59e0b';
      case 'error':
      case 'offline':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getAssetIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      PLC: <PLCIcon />,
      Robot: <RobotIcon />,
      IndustrialRobot: <RobotIcon />,
      Sensor: <ThermostatIcon />,
      NetworkSwitch: <RouterIcon />,
      Router: <RouterIcon />,
      KubernetesCluster: <CloudIcon />,
      UPS: <PowerIcon />,
    };
    return iconMap[type] || <FactoryIcon />;
  };

  const healthScore = stats
    ? Math.round((stats.onlineAssets / stats.totalAssets) * 100)
    : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Factory Operations Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time view of all factory systems and zones • Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={fetchDashboardData} disabled={loading} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Overall Health */}
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: healthScore >= 90 ? '#dcfce7' : healthScore >= 70 ? '#fef3c7' : '#fee2e2' }}>
            <CardContent>
              {loading || !stats ? (
                <Box>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={48} />
                  <Skeleton variant="text" width="70%" />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overall Health
                    </Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {healthScore}%
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {healthScore >= 90 ? (
                        <TrendingUpIcon sx={{ color: '#10b981', mr: 0.5 }} fontSize="small" />
                      ) : (
                        <TrendingDownIcon sx={{ color: '#ef4444', mr: 0.5 }} fontSize="small" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {stats?.onlineAssets}/{stats?.totalAssets} Assets Online
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: healthScore >= 90 ? '#10b981' : healthScore >= 70 ? '#f59e0b' : '#ef4444' }}>
                    {healthScore >= 90 ? <CheckCircleIcon /> : <WarningIcon />}
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Active Issues */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              {loading ? (
                <Box>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={48} />
                  <Skeleton variant="text" width="50%" />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Active Issues
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="error">
                      {issues.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {issues.filter(i => i.severity === 'critical').length} Critical
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#fee2e2', color: '#dc2626' }}>
                    <ErrorIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Score */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              {loading || !performance ? (
                <Box>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={48} />
                  <Skeleton variant="text" width="50%" />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Performance
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      {Math.round(performance.performancePercent)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      OEE Score • {performance.running}/{performance.totalEquipment} running
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#dbeafe', color: '#2563eb' }}>
                    <SpeedIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Network Health */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              {loading || !networkHealth ? (
                <Box>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={48} />
                  <Skeleton variant="text" width="50%" />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Network Health
                    </Typography>
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color={networkHealth.healthPercent >= 90 ? 'success.main' : networkHealth.healthPercent >= 70 ? 'warning.main' : 'error.main'}
                    >
                      {Math.round(networkHealth.healthPercent)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {networkHealth.online}/{networkHealth.totalDevices} Devices Online
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#dcfce7', color: '#16a34a' }}>
                    <RouterIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Zone Health Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ISA-95 Zone Health
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Status by security zone level
            </Typography>

            {zones.map((zone, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {zone.level} - {zone.zone}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {zone.online}/{zone.total} assets online
                    </Typography>
                  </Box>
                  <Chip
                    label={`${Math.round((zone.online / zone.total) * 100)}%`}
                    size="small"
                    color={
                      zone.offline > 0 ? 'error' :
                      zone.warning > 0 ? 'warning' : 'success'
                    }
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(zone.online / zone.total) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: '#e5e7eb',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: zone.color || '#10b981',
                    },
                  }}
                />
                {(zone.warning > 0 || zone.offline > 0) && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    {zone.warning > 0 && (
                      <Chip
                        label={`${zone.warning} warnings`}
                        size="small"
                        variant="outlined"
                        color="warning"
                      />
                    )}
                    {zone.offline > 0 && (
                      <Chip
                        label={`${zone.offline} offline`}
                        size="small"
                        variant="outlined"
                        color="error"
                      />
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Critical Issues */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Critical Issues
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Requires immediate attention
            </Typography>

            <List>
              {issues.slice(0, 5).map((issue, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      bgcolor: issue.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: issue.severity === 'critical' ? '#dc2626' : '#f59e0b',
                        }}
                      >
                        {getAssetIcon(issue.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {issue.asset}
                          </Typography>
                          <Chip
                            label={issue.status}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(issue.status),
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {issue.issue}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {issue.since}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>

            {issues.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No critical issues detected
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Virtual Tours */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Virtual Factory Tours
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Explore facilities in 3D
            </Typography>

            <Grid container spacing={2}>
              {matterportSpaces.slice(0, 3).map((space, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#dbeafe', color: '#2563eb', mr: 2 }}>
                          <VRIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {space.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {space.assetCount} assets
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<VRIcon />}
                        href={space.matterportUrl}
                        target="_blank"
                        disabled={!space.matterportUrl}
                      >
                        View in 3D
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExecutiveDashboard;
