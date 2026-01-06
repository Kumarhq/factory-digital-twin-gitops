import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  LinearProgress,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Badge,
  Avatar,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  GitHub as GitHubIcon,
  Timeline as TimelineIcon,
  Code as CodeIcon,
  CloudSync as CloudSyncIcon,
  CompareArrows as CompareIcon,
  PlayArrow as RunIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DriftRecord {
  assetName: string;
  assetType: string;
  driftStatus: string;
  driftCount: number;
  drifts: Array<{
    field: string;
    intended: any;
    actual: any;
    severity: string;
  }>;
  gitRepo: string;
  gitPath: string;
  lastCommit: string;
  detectedAt: string;
  actions: Array<{
    action: string;
    title: string;
    description: string;
    priority: string;
    automated: boolean;
  }>;
}

const GitOpsDriftDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [driftData, setDriftData] = useState<any>(null);
  const [driftHistory, setDriftHistory] = useState<any>(null);
  const [driftStats, setDriftStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDrift, setSelectedDrift] = useState<DriftRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchDriftData();
    fetchDriftHistory();
    fetchDriftStats();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDriftData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDriftData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/gitops/drift`);
      setDriftData(response.data);
    } catch (error) {
      console.error('Failed to fetch drift data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDriftHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/gitops/drift/history?days=7`);
      setDriftHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch drift history:', error);
    }
  };

  const fetchDriftStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/gitops/drift/stats`);
      setDriftStats(response.data);
    } catch (error) {
      console.error('Failed to fetch drift stats:', error);
    }
  };

  const handleResolveDrift = async (drift: DriftRecord, action: any) => {
    setResolving(true);
    try {
      await axios.post(`${API_BASE}/api/gitops/drift/resolve`, {
        assetName: drift.assetName,
        action: action.action,
        field: drift.drifts[0]?.field,
      });
      setDetailsOpen(false);
      fetchDriftData();
    } catch (error) {
      console.error('Failed to resolve drift:', error);
    } finally {
      setResolving(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ErrorIcon color="error" />;
      case 'high': return <WarningIcon color="warning" />;
      default: return <InfoIcon color="info" />;
    }
  };

  // Drift history chart
  const chartData = driftHistory ? {
    labels: driftHistory.history.map((h: any) => h.date),
    datasets: [
      {
        label: 'Total Drifted Assets',
        data: driftHistory.history.map((h: any) => h.driftedAssets),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Critical Drifts',
        data: driftHistory.history.map((h: any) => h.criticalDrifts),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  if (loading && !driftData) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading drift data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <GitHubIcon fontSize="large" />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight="bold">
              GitOps Configuration & Drift Detection
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
              Monitor configuration drift between intended GitOps state and actual factory deployment
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SyncIcon />}
            onClick={fetchDriftData}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #10b981' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    In Sync
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#10b981">
                    {driftData?.summary.inSyncAssets || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Assets matching GitOps
                  </Typography>
                </Box>
                <CheckIcon sx={{ fontSize: 48, color: '#10b981', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #f59e0b' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Drifted
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#f59e0b">
                    {driftData?.summary.driftedAssets || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {driftData?.summary.driftPercentage}% of total
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 48, color: '#f59e0b', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #ef4444' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Critical Drifts
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#ef4444">
                    {driftData?.summary.criticalDrifts || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Require immediate action
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 48, color: '#ef4444', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #3b82f6' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Assets
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#3b82f6">
                    {driftData?.summary.totalAssets || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monitored by GitOps
                  </Typography>
                </Box>
                <CloudSyncIcon sx={{ fontSize: 48, color: '#3b82f6', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<CompareIcon />} label="Drift Detection" iconPosition="start" />
          <Tab icon={<TimelineIcon />} label="Drift History" iconPosition="start" />
          <Tab icon={<SettingsIcon />} label="Statistics" iconPosition="start" />
        </Tabs>

        {/* Tab 0: Drift Detection */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Active Configuration Drifts
              </Typography>
              <Chip
                icon={<GitHubIcon />}
                label={`github.com/factory-org/factory-digital-twin-gitops`}
                variant="outlined"
                size="small"
              />
            </Stack>

            {driftData?.drifts.length === 0 ? (
              <Alert severity="success" icon={<CheckIcon />}>
                <Typography variant="body1" fontWeight="bold">
                  All Assets in Sync!
                </Typography>
                <Typography variant="body2">
                  All assets match their intended GitOps configuration. No drift detected.
                </Typography>
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.default' }}>
                      <TableCell><strong>Asset</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Drift Severity</strong></TableCell>
                      <TableCell><strong>Drifted Fields</strong></TableCell>
                      <TableCell><strong>Git Path</strong></TableCell>
                      <TableCell><strong>Detected</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {driftData?.drifts.map((drift: DriftRecord, idx: number) => (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {drift.assetName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={drift.assetType} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getSeverityIcon(drift.driftStatus)}
                            label={drift.driftStatus.toUpperCase()}
                            color={getSeverityColor(drift.driftStatus) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge badgeContent={drift.driftCount} color="error">
                            <Chip
                              label={drift.drifts.map(d => d.field).join(', ')}
                              size="small"
                              variant="outlined"
                            />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={drift.gitRepo}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {drift.gitPath}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(drift.detectedAt).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<InfoIcon />}
                            onClick={() => {
                              setSelectedDrift(drift);
                              setDetailsOpen(true);
                            }}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab 1: Drift History */}
        {tabValue === 1 && chartData && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Drift Trend Analysis (Last 7 Days)
            </Typography>
            <Box sx={{ height: 400 }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </Box>
          </Box>
        )}

        {/* Tab 2: Statistics */}
        {tabValue === 2 && driftStats && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Drift by Asset Type
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell><strong>Drifted</strong></TableCell>
                        <TableCell><strong>Drift Rate</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {driftStats.byType.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.total}</TableCell>
                          <TableCell>{item.drifted}</TableCell>
                          <TableCell>
                            <Chip label={`${item.driftRate}%`} size="small" color="warning" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Drift by Configuration Field
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell><strong>Field</strong></TableCell>
                        <TableCell><strong>Count</strong></TableCell>
                        <TableCell><strong>Severity</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {driftStats.byField.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Chip label={item.field} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.severity}
                              size="small"
                              color={getSeverityColor(item.severity) as any}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Drift Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CompareIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Drift Details: {selectedDrift?.assetName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedDrift?.gitPath}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDrift && (
            <Box>
              {/* Drift Comparison */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Configuration Drift Analysis
              </Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.default' }}>
                      <TableCell><strong>Field</strong></TableCell>
                      <TableCell><strong>Intended (GitOps)</strong></TableCell>
                      <TableCell><strong>Actual (Observed)</strong></TableCell>
                      <TableCell><strong>Severity</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDrift.drifts.map((drift, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Chip label={drift.field} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#10b981' }}>
                            {String(drift.intended)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#ef4444' }}>
                            {String(drift.actual)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={drift.severity}
                            size="small"
                            color={getSeverityColor(drift.severity) as any}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />

              {/* Recommended Actions */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Recommended Actions
              </Typography>
              <Stack spacing={2}>
                {selectedDrift.actions.map((action, idx) => (
                  <Card key={idx} variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {action.description}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip
                              label={`Priority: ${action.priority}`}
                              size="small"
                              color={action.priority === 'critical' ? 'error' : 'warning'}
                            />
                            <Chip
                              label={action.automated ? 'Automated' : 'Manual'}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                        <Button
                          variant="contained"
                          startIcon={<RunIcon />}
                          onClick={() => handleResolveDrift(selectedDrift, action)}
                          disabled={resolving}
                        >
                          Execute
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GitOpsDriftDashboard;
