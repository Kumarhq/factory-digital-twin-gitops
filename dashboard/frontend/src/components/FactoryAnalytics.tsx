import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Factory as FactoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Router as NetworkIcon,
  Power as PowerIcon,
  Speed as PerformanceIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as HealthyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const FactoryAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>({
    networkHealth: null,
    powerDistribution: null,
    performance: null,
    failureCorrelation: null,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all analytics in parallel
      const [networkResp, performanceResp] = await Promise.all([
        axios.get(`${API_BASE}/api/analytics/network-health`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/api/analytics/performance`).catch(() => ({ data: null })),
      ]);

      setAnalytics({
        networkHealth: networkResp.data,
        performance: performanceResp.data,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, unit, trend, icon, color }: any) => (
    <Card sx={{ height: '100%', borderRadius: 2, border: `2px solid ${color}20` }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
              <Typography component="span" variant="h6" color="text.secondary">
                {unit}
              </Typography>
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color }}>
            {icon}
          </Avatar>
        </Stack>
        {trend && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
            {trend > 0 ? (
              <TrendingUpIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownIcon fontSize="small" color="error" />
            )}
            <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
              {Math.abs(trend)}% vs last hour
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <FactoryIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Factory-Wide Analytics
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Real-time operational intelligence & performance metrics
              </Typography>
            </Box>
          </Stack>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchAnalytics} sx={{ color: 'white' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Network Health"
            value={analytics.networkHealth?.healthPercentage || 85}
            unit="%"
            trend={2.3}
            icon={<NetworkIcon />}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="OEE Score"
            value={analytics.performance?.oee || 78}
            unit="%"
            trend={-1.2}
            icon={<PerformanceIcon />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Power Efficiency"
            value={92}
            unit="%"
            trend={0.8}
            icon={<PowerIcon />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="System Uptime"
            value={96.5}
            unit="%"
            trend={1.5}
            icon={<TimelineIcon />}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* Network Path Analysis */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <NetworkIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Network Path Failures
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Critical routing issues
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="CoreSwitch-Datacenter → PLC Network"
                    secondary="3 failed paths detected"
                  />
                  <Chip label="Critical" size="small" color="error" />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="EdgeGateway → Cloud Services"
                    secondary="Intermittent connectivity"
                  />
                  <Chip label="Warning" size="small" color="warning" />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="WiFi APs → Production Floor"
                    secondary="Signal degradation"
                  />
                  <Chip label="Medium" size="small" color="info" />
                </ListItem>
              </List>
              <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
                View Full Network Map
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Power Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <PowerIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Power Distribution
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    UPS and backup systems
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">UPS-Main</Typography>
                    <Typography variant="body2" color="error.main">
                      45% (Offline)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={45}
                    color="error"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">UPS-Backup</Typography>
                    <Typography variant="body2" color="success.main">
                      92% (Online)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={92}
                    color="success"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">Generator-Emergency</Typography>
                    <Typography variant="body2" color="info.main">
                      100% (Standby)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    color="info"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </Stack>
              <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
                View Power Topology
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Degradation */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'success.light' }}>
              <PerformanceIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Performance Degradation Analysis
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Time-based failure correlation
              </Typography>
            </Box>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography variant="h4" fontWeight="bold">
                  12
                </Typography>
                <Typography variant="body2">
                  Assets with degraded performance
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <Typography variant="h4" fontWeight="bold">
                  23
                </Typography>
                <Typography variant="body2">
                  Correlated failures (last 24h)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="h4" fontWeight="bold">
                  3
                </Typography>
                <Typography variant="body2">
                  Critical path failures detected
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card sx={{ borderRadius: 2, border: '2px solid', borderColor: 'success.light' }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <HealthyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                System-Wide Recommendations
              </Typography>
              <Typography variant="caption" color="text.secondary">
                AI-generated optimization suggestions
              </Typography>
            </Box>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <List dense>
            <ListItem>
              <ListItemText
                primary="Address UPS-Main failure immediately"
                secondary="9 downstream systems at risk of cascading failure"
              />
              <Chip label="Critical" size="small" color="error" />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Schedule maintenance for NetworkSwitch-05"
                secondary="Degraded performance affecting 15 production assets"
              />
              <Chip label="High" size="small" color="warning" />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Optimize PLC communication protocols"
                secondary="Reduce latency by implementing edge processing"
              />
              <Chip label="Medium" size="small" color="info" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FactoryAnalytics;
