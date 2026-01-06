import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Speed,
  Memory,
  Cloud,
  Factory,
  Settings,
  Refresh,
  Timeline,
  HelpOutline as HelpIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DashboardStats {
  totalAssets: number;
  onlineAssets: number;
  errorAssets: number;
  uptimePercent: number;
  totalRelationships: number;
  assetTypes: string[];
  relationshipTypes: string[];
}

interface ZoneHealth {
  zone: string;
  level: string;
  total: number;
  online: number;
  warning: number;
  offline: number;
  color: string;
}

interface Issue {
  asset: string;
  type: string;
  status: string;
  issue: string;
  since: string;
  severity: 'critical' | 'high' | 'medium';
  location: string;
}

const UnifiedDashboard: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [zones, setZones] = useState<ZoneHealth[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [performance, setPerformance] = useState<any>(null);
  const [networkHealth, setNetworkHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, zonesRes, issuesRes, perfRes, netRes] = await Promise.all([
        axios.get(`${API_BASE}/api/stats`),
        axios.get(`${API_BASE}/api/zones`),
        axios.get(`${API_BASE}/api/executive/issues`),
        axios.get(`${API_BASE}/api/executive/performance`),
        axios.get(`${API_BASE}/api/executive/network-health`),
      ]);

      setStats(statsRes.data);
      setZones(zonesRes.data);
      setIssues(issuesRes.data.slice(0, 5)); // Top 5 issues
      setPerformance(perfRes.data);
      setNetworkHealth(netRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      default: return theme.palette.text.secondary;
    }
  };

  const zoneChartData = {
    labels: zones.map(z => z.level),
    datasets: [
      {
        label: 'Online',
        data: zones.map(z => z.online),
        backgroundColor: alpha(theme.palette.success.main, 0.8),
      },
      {
        label: 'Warning',
        data: zones.map(z => z.warning),
        backgroundColor: alpha(theme.palette.warning.main, 0.8),
      },
      {
        label: 'Offline',
        data: zones.map(z => z.offline),
        backgroundColor: alpha(theme.palette.error.main, 0.8),
      },
    ],
  };

  const performanceData = performance && {
    labels: performance.history?.map((h: any) => new Date(h.timestamp).toLocaleTimeString()) || [],
    datasets: [
      {
        label: 'Overall Equipment Effectiveness (OEE) %',
        data: performance.history?.map((h: any) => h.oee) || [],
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Asset Health Score %',
        data: performance.history?.map((h: any) => h.health) || [],
        borderColor: theme.palette.success.main,
        backgroundColor: alpha(theme.palette.success.main, 0.1),
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Factory Uptime %',
        data: performance.history?.map((h: any) => h.uptime) || [],
        borderColor: theme.palette.info.main,
        backgroundColor: alpha(theme.palette.info.main, 0.1),
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Factory Digital Twin - Live Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time monitoring across all ISA-95 levels
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Asset State Reference">
            <IconButton onClick={() => setHelpDialogOpen(true)} color="info">
              <HelpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchAllData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Top KPI Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Total Assets
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {stats?.totalAssets || 0}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip label={`${stats?.assetTypes.length || 0} Types`} size="small" variant="outlined" />
                  </Stack>
                </Box>
                <Factory sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.3) }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    System Health
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {stats?.uptimePercent.toFixed(1) || 0}%
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main" fontWeight={600}>
                      {stats?.onlineAssets || 0}/{stats?.totalAssets || 0} Online
                    </Typography>
                  </Stack>
                </Box>
                <Speed sx={{ fontSize: 48, color: alpha(theme.palette.success.main, 0.3) }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.error.main, 0.05)})`, border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Active Issues
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="error.main">
                    {stats?.errorAssets || 0}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                    <Warning sx={{ fontSize: 16, color: 'error.main' }} />
                    <Typography variant="caption" color="error.main" fontWeight={600}>
                      {issues.filter(i => i.severity === 'critical').length} Critical
                    </Typography>
                  </Stack>
                </Box>
                <ErrorIcon sx={{ fontSize: 48, color: alpha(theme.palette.error.main, 0.3) }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Network Links
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="info.main">
                    {stats?.totalRelationships || 0}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                    <Cloud sx={{ fontSize: 16, color: 'info.main' }} />
                    <Typography variant="caption" color="info.main" fontWeight={600}>
                      {stats?.relationshipTypes.length || 0} Types
                    </Typography>
                  </Stack>
                </Box>
                <Timeline sx={{ fontSize: 48, color: alpha(theme.palette.info.main, 0.3) }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Zone Health Visualization */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ISA-95 Zone Health Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              {zones.length > 0 && (
                <Bar
                  data={zoneChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { stacked: true },
                      y: { stacked: true, beginAtZero: true },
                    },
                    plugins: {
                      legend: { position: 'top' as const },
                    },
                  }}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Critical Issues */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Critical Issues
            </Typography>
            <Stack spacing={2}>
              {issues.slice(0, 5).map((issue, idx) => (
                <Card key={idx} variant="outlined" sx={{ borderLeft: `4px solid ${getSeverityColor(issue.severity)}` }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {issue.asset}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {issue.issue}
                        </Typography>
                      </Box>
                      <Chip
                        label={issue.severity}
                        size="small"
                        sx={{
                          bgcolor: alpha(getSeverityColor(issue.severity), 0.1),
                          color: getSeverityColor(issue.severity),
                          fontWeight: 600,
                          fontSize: '0.65rem',
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Factory-Wide Performance Trends */}
        {performanceData && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Factory-Wide Performance Trends
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Real-time metrics across all manufacturing assets and production lines
              </Typography>
              <Box sx={{ height: 250 }}>
                <Line
                  data={performanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' as const },
                    },
                    scales: {
                      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Percentage (%)' } },
                    },
                  }}
                />
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  ISA-95 Security Zones Legend
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="caption">
                    <strong>Level 0 (Process):</strong> Field devices, sensors, actuators directly controlling manufacturing processes
                  </Typography>
                  <Typography variant="caption">
                    <strong>Level 1 (Control):</strong> PLCs, industrial robots, CNCs providing real-time control
                  </Typography>
                  <Typography variant="caption">
                    <strong>Level 2 (Supervisory):</strong> SCADA systems, HMI servers, local databases supervising operations
                  </Typography>
                  <Typography variant="caption">
                    <strong>Level 3 (Operations):</strong> MES, manufacturing execution systems managing workflows
                  </Typography>
                  <Typography variant="caption">
                    <strong>Level 4 (Enterprise):</strong> ERP, business systems for planning and logistics
                  </Typography>
                  <Typography variant="caption">
                    <strong>Unassigned:</strong> Assets not yet classified into ISA-95 hierarchy
                  </Typography>
                </Stack>
              </Alert>
            </Paper>
          </Grid>
        )}

        {/* Zone Status Cards */}
        {zones.map((zone) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={zone.zone}>
            <Card sx={{ background: alpha(zone.color || '#666', 0.05), border: `2px solid ${zone.color || '#666'}` }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom display="block">
                  {zone.level}
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: zone.color }}>
                  {zone.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Assets
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(zone.online / zone.total) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      bgcolor: alpha(zone.color || '#666', 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: zone.color,
                      },
                    }}
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip label={`${zone.online} OK`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} color="success" variant="outlined" />
                    {zone.warning > 0 && <Chip label={`${zone.warning} Warn`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} color="warning" variant="outlined" />}
                    {zone.offline > 0 && <Chip label={`${zone.offline} Off`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} color="error" variant="outlined" />}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Asset State Reference Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">Asset State Reference Guide</Typography>
            <IconButton onClick={() => setHelpDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Understanding asset states in the Factory Digital Twin system
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>State</strong></TableCell>
                <TableCell><strong>Color</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Action Required</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Chip label="Online" size="small" color="success" />
                </TableCell>
                <TableCell>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'success.main', borderRadius: 1 }} />
                </TableCell>
                <TableCell>
                  Asset is fully operational and performing normally. All systems are functioning as expected.
                </TableCell>
                <TableCell>None - Continue monitoring</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Chip label="Running" size="small" color="success" />
                </TableCell>
                <TableCell>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'success.main', borderRadius: 1 }} />
                </TableCell>
                <TableCell>
                  Asset is actively running and executing its designated tasks without issues.
                </TableCell>
                <TableCell>None - Normal operation</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Chip label="Warning" size="small" color="warning" />
                </TableCell>
                <TableCell>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'warning.main', borderRadius: 1 }} />
                </TableCell>
                <TableCell>
                  Asset is experiencing minor issues or operating outside optimal parameters. Performance may be degraded.
                </TableCell>
                <TableCell>Monitor closely - May require intervention</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Chip label="Degraded" size="small" color="warning" />
                </TableCell>
                <TableCell>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'warning.main', borderRadius: 1 }} />
                </TableCell>
                <TableCell>
                  Asset is operational but with reduced capacity or performance. Some functionality may be limited.
                </TableCell>
                <TableCell>Schedule maintenance - RCA recommended</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Chip label="Error" size="small" color="error" />
                </TableCell>
                <TableCell>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'error.main', borderRadius: 1 }} />
                </TableCell>
                <TableCell>
                  Asset has encountered a critical error and is not functioning correctly. Immediate attention required.
                </TableCell>
                <TableCell>Urgent - Run RCA analysis immediately</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Chip label="Offline" size="small" color="error" />
                </TableCell>
                <TableCell>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'error.main', borderRadius: 1 }} />
                </TableCell>
                <TableCell>
                  Asset is not responding or has lost connectivity. May be powered down or disconnected.
                </TableCell>
                <TableCell>Critical - Investigate immediately with RCA</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Chip label="Failed" size="small" color="error" />
                </TableCell>
                <TableCell>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'error.main', borderRadius: 1 }} />
                </TableCell>
                <TableCell>
                  Asset has completely failed and requires repair or replacement. System is non-operational.
                </TableCell>
                <TableCell>Critical - RCA + Hardware check required</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> For assets with Warning, Degraded, Error, Offline, or Failed states,
              you can run Root Cause Analysis (RCA) from the Asset Explorer to identify and resolve issues.
            </Typography>
          </Alert>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UnifiedDashboard;
