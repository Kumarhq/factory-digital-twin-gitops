import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TroubleshootOutlined as RCAIcon,
  Whatshot as CascadeIcon,
  Router as NetworkIcon,
  Power as PowerIcon,
  Speed as PerformanceIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import axios from 'axios';
import QuickQueries from './QuickQueries';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface RCAResult {
  targetAsset?: string;
  rootCause?: string;
  rootCauseType?: string;
  failureDepth?: number;
  failureChain?: any[];
  analysis?: string;
  severity?: string;
  recommendation?: string;
}

interface RCAPanelProps {
  assetContext?: any;
}

const RCAPanel: React.FC<RCAPanelProps> = ({ assetContext }) => {
  const [assetName, setAssetName] = useState('');
  const [incidentNumber, setIncidentNumber] = useState('');
  const [incidentTrace, setIncidentTrace] = useState<any>(null);
  const [relatedIncidents, setRelatedIncidents] = useState<any>(null);

  // Auto-populate from asset context
  React.useEffect(() => {
    if (assetContext) {
      const name = assetContext.id || assetContext.name;
      setAssetName(name);
      // Auto-trigger analysis if status indicates a problem
      if (['offline', 'error', 'degraded', 'warning'].includes(assetContext.status?.toLowerCase())) {
        // Clear previous results and auto-start analysis
        setResults({});
        setTimeout(() => {
          // Trigger analysis after state update
          const button = document.querySelector('[data-rca-analyze]') as HTMLButtonElement;
          if (button) button.click();
        }, 100);
      }
    }
  }, [assetContext]);
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<{
    rootCause?: RCAResult;
    cascade?: any;
    network?: any[];
    power?: any[];
    performance?: any[];
    timeBased?: any[];
    drift?: any[];
    criticalPath?: any[];
  }>({});
  const [error, setError] = useState<string | null>(null);

  const runIncidentTrace = async () => {
    if (!incidentNumber.trim()) {
      setError('Please enter an incident number or asset name');
      return;
    }

    setLoading('incidentTrace');
    setError(null);
    setIncidentTrace(null);
    setRelatedIncidents(null);

    try {
      const response = await axios.post(`${API_BASE}/api/rca/incident-trace`, {
        incidentId: incidentNumber.trim(),
        assetName: incidentNumber.trim(),
      });

      setIncidentTrace(response.data);

      // Fetch related incidents for this asset
      try {
        const relatedResponse = await axios.get(
          `${API_BASE}/api/rca/related-incidents/${response.data.assetName}`
        );
        setRelatedIncidents(relatedResponse.data);
      } catch (relErr) {
        console.error('Failed to fetch related incidents:', relErr);
        // Don't fail the whole trace if related incidents fail
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to trace incident');
    } finally {
      setLoading(null);
    }
  };

  const runIncidentTraceForAsset = async (assetName: string) => {
    setIncidentNumber(assetName);
    setLoading('incidentTrace');
    setError(null);
    setIncidentTrace(null);

    try {
      const response = await axios.post(`${API_BASE}/api/rca/incident-trace`, {
        incidentId: assetName,
        assetName: assetName,
      });

      setIncidentTrace(response.data);

      // Fetch related incidents for this asset
      try {
        const relatedResponse = await axios.get(
          `${API_BASE}/api/rca/related-incidents/${assetName}`
        );
        setRelatedIncidents(relatedResponse.data);
      } catch (relErr) {
        console.error('Failed to fetch related incidents:', relErr);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to trace incident');
    } finally {
      setLoading(null);
    }
  };

  const runRootCauseAnalysis = async () => {
    if (!assetName.trim()) {
      setError('Please enter an asset name');
      return;
    }

    setLoading('rootCause');
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/api/rca/root-cause`, {
        assetName: assetName.trim(),
      });

      setResults((prev) => ({ ...prev, rootCause: response.data }));

      // Scroll to results after a brief delay
      setTimeout(() => {
        const resultsSection = document.getElementById('rca-results-section');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to run RCA');
    } finally {
      setLoading(null);
    }
  };

  const runCascadeAnalysis = async () => {
    if (!assetName.trim()) {
      setError('Please enter an asset name');
      return;
    }

    setLoading('cascade');
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/api/rca/cascade-impact`, {
        assetName: assetName.trim(),
      });

      setResults((prev) => ({ ...prev, cascade: response.data }));

      // Scroll to results after a brief delay
      setTimeout(() => {
        const resultsSection = document.getElementById('rca-results-section');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to run cascade analysis');
    } finally {
      setLoading(null);
    }
  };

  const runAllScenarios = async () => {
    setLoading('all');
    setError(null);

    try {
      const [networkRes, powerRes, perfRes, timeRes, driftRes, criticalRes] = await Promise.all([
        axios.get(`${API_BASE}/api/rca/network-path-failure`),
        axios.get(`${API_BASE}/api/rca/power-disruption`),
        axios.get(`${API_BASE}/api/rca/performance-degradation`),
        axios.get(`${API_BASE}/api/rca/time-based-correlation`),
        axios.get(`${API_BASE}/api/rca/configuration-drift`),
        axios.get(`${API_BASE}/api/rca/critical-path-analysis`),
      ]);

      setResults((prev) => ({
        ...prev,
        network: networkRes.data,
        power: powerRes.data,
        performance: perfRes.data,
        timeBased: timeRes.data,
        drift: driftRes.data,
        criticalPath: criticalRes.data,
      }));
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to run analyses');
    } finally {
      setLoading(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <RCAIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold">
            Root Cause Analysis & Triaging
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Advanced diagnostic tools leveraging knowledge graph traversal
        </Typography>

        {/* Asset Context Alert */}
        {assetContext && (
          <Alert
            severity={
              ['offline', 'error'].includes(assetContext.status?.toLowerCase()) ? 'error' :
              ['warning', 'degraded'].includes(assetContext.status?.toLowerCase()) ? 'warning' : 'info'
            }
            sx={{ mb: 3 }}
            icon={<RCAIcon />}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Quick RCA Triggered for: {assetContext.name || assetContext.id}
            </Typography>
            <Typography variant="body2">
              Type: <Chip label={assetContext.type} size="small" sx={{ mx: 0.5 }} />
              Status: <Chip
                label={assetContext.status}
                size="small"
                color={
                  ['offline', 'error'].includes(assetContext.status?.toLowerCase()) ? 'error' :
                  ['warning', 'degraded'].includes(assetContext.status?.toLowerCase()) ? 'warning' : 'success'
                }
                sx={{ mx: 0.5 }}
              />
              {assetContext.location && `• Location: ${assetContext.location}`}
            </Typography>
          </Alert>
        )}

        {/* Quick Knowledge Graph Queries */}
        <Box sx={{ mb: 3 }}>
          <QuickQueries />
        </Box>

        {/* Incident Number Triaging */}
        <Card sx={{ mb: 3, bgcolor: '#fff3e0', border: '2px solid #ff9800' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimelineIcon sx={{ mr: 1, color: '#ff9800' }} />
              <Typography variant="h6" fontWeight="bold">
                Incident Triaging - Step-by-Step Investigation
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter an incident number or asset name to see how the system traces through nodes, logs, and connections
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Incident Number / Asset Name"
                placeholder="e.g., INC-12345 or PLC-001"
                value={incidentNumber}
                onChange={(e) => setIncidentNumber(e.target.value)}
                disabled={loading !== null}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
                startIcon={loading === 'incidentTrace' ? <CircularProgress size={16} /> : <SearchIcon />}
                onClick={runIncidentTrace}
                disabled={loading !== null || !incidentNumber.trim()}
              >
                Trace Incident
              </Button>
            </Box>

            {/* Incident Trace Results */}
            {incidentTrace && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <strong>Trace Completed:</strong> Analyzed {incidentTrace.summary.totalNodesAnalyzed} nodes in {incidentTrace.totalSteps} steps
                </Alert>

                <Stepper activeStep={incidentTrace.totalSteps} orientation="vertical">
                  {incidentTrace.steps.map((step: any, index: number) => (
                    <Step key={index} completed={step.status === 'completed'}>
                      <StepLabel
                        StepIconComponent={() => (
                          <CheckIcon sx={{ color: '#4caf50' }} />
                        )}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {step.title}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        {/* Detailed Actions - Prominent Display */}
                        {step.detailedActions && step.detailedActions.length > 0 && (
                          <Paper
                            sx={{
                              p: 2,
                              mb: 2,
                              bgcolor: '#e8f5e9',
                              border: '2px solid #4caf50',
                              borderLeft: '5px solid #2e7d32'
                            }}
                          >
                            <Typography
                              variant="body2"
                              component="pre"
                              sx={{
                                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                fontSize: '0.85rem',
                                whiteSpace: 'pre-wrap',
                                color: '#1b5e20',
                                m: 0,
                                lineHeight: 1.6
                              }}
                            >
                              {step.detailedActions.join('\n')}
                            </Typography>
                          </Paper>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {step.description}
                        </Typography>

                        {/* GraphRAG-style Thinking Mode Display */}
                        {step.thinking && (
                          <Paper
                            sx={{
                              p: 2,
                              mb: 2,
                              bgcolor: '#f0f4ff',
                              border: '1px solid #90caf9',
                              borderLeft: '4px solid #2196f3'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <TimelineIcon sx={{ mr: 1, color: '#2196f3', fontSize: '1rem' }} />
                              <Typography variant="caption" fontWeight="bold" sx={{ color: '#1976d2' }}>
                                AI Reasoning Process (GraphRAG)
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              component="pre"
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                whiteSpace: 'pre-wrap',
                                color: '#333',
                                m: 0
                              }}
                            >
                              {step.thinking}
                            </Typography>
                          </Paper>
                        )}

                        {/* MCP Tools Used */}
                        {step.mcpTools && step.mcpTools.length > 0 && (
                          <Paper sx={{ p: 1.5, mb: 2, bgcolor: '#fff3e0', border: '1px solid #ffb74d' }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 1, color: '#e65100' }}>
                              MCP Tools Used:
                            </Typography>
                            <List dense sx={{ p: 0 }}>
                              {step.mcpTools.map((tool: any, idx: number) => (
                                <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                                  <Chip
                                    label={tool.tool}
                                    size="small"
                                    sx={{ mr: 1, bgcolor: '#ff9800', color: 'white', fontSize: '0.7rem' }}
                                  />
                                  <Typography variant="caption" sx={{ color: '#5d4037' }}>
                                    {tool.action}
                                  </Typography>
                                  <Typography variant="caption" sx={{ ml: 'auto', color: '#757575', fontSize: '0.65rem' }}>
                                    {new Date(tool.timestamp).toLocaleTimeString()}
                                  </Typography>
                                </ListItem>
                              ))}
                            </List>
                          </Paper>
                        )}

                        {/* Log Entries */}
                        {step.logEntries && step.logEntries.length > 0 && (
                          <Paper sx={{ p: 1.5, mb: 2, bgcolor: '#fce4ec', border: '1px solid #f06292' }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 1, color: '#c2185b' }}>
                              Log Entries:
                            </Typography>
                            <List dense sx={{ p: 0 }}>
                              {step.logEntries.map((log: any, idx: number) => (
                                <ListItem key={idx} sx={{ py: 0.5, px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                                  <Box sx={{ display: 'flex', width: '100%', mb: 0.5 }}>
                                    <Chip
                                      label={log.level}
                                      size="small"
                                      color={log.level === 'ERROR' ? 'error' : log.level === 'WARNING' ? 'warning' : 'info'}
                                      sx={{ mr: 1, fontSize: '0.65rem', height: '20px' }}
                                    />
                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#424242' }}>
                                      {log.source}
                                    </Typography>
                                    <Typography variant="caption" sx={{ ml: 'auto', color: '#757575', fontSize: '0.65rem' }}>
                                      {new Date(log.timestamp).toLocaleString()}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ color: '#212121', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                    {log.message}
                                  </Typography>
                                </ListItem>
                              ))}
                            </List>
                          </Paper>
                        )}

                        {step.findings && (
                          <Alert severity="info" sx={{ mb: 1 }}>
                            {step.findings}
                          </Alert>
                        )}

                        {step.nodesInvolved && step.nodesInvolved.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" fontWeight="bold">
                              Nodes Involved:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {step.nodesInvolved.map((node: string, idx: number) => (
                                <Chip key={idx} label={node} size="small" color="primary" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Node Details - Enhanced Display */}
                        {step.nodeDetails && (
                          <Accordion sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="caption" fontWeight="bold">
                                Node Details & Properties
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Paper sx={{ p: 1, bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>
                                <pre style={{ margin: '4px 0', overflow: 'auto', maxHeight: '200px' }}>
                                  {JSON.stringify(step.nodeDetails, null, 2)}
                                </pre>
                              </Paper>
                            </AccordionDetails>
                          </Accordion>
                        )}

                        {step.data && Object.keys(step.data).length > 0 && !step.nodeDetails && (
                          <Accordion sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="caption" fontWeight="bold">
                                Technical Details
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Paper sx={{ p: 1, bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>
                                <pre style={{ margin: '4px 0', overflow: 'auto', maxHeight: '200px' }}>
                                  {JSON.stringify(step.data, null, 2)}
                                </pre>
                              </Paper>
                            </AccordionDetails>
                          </Accordion>
                        )}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>

                {/* Summary Card */}
                <Card sx={{ mt: 2, bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Investigation Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Root Cause:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {incidentTrace.summary.rootCause}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Nodes Analyzed:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {incidentTrace.summary.totalNodesAnalyzed}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Upstream Failures:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {incidentTrace.summary.upstreamFailures}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Downstream Impact:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {incidentTrace.summary.downstreamImpact}
                        </Typography>
                      </Grid>
                    </Grid>

                    {incidentTrace.summary.recommendations && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          Recommendations:
                        </Typography>
                        <List dense>
                          {incidentTrace.summary.recommendations.map((rec: string, idx: number) => (
                            <ListItem key={idx}>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Related Incidents Section */}
        {relatedIncidents && relatedIncidents.incidents && relatedIncidents.incidents.length > 0 && (
          <Card sx={{ mb: 3, bgcolor: '#fff8e1', border: '2px solid #ffd54f' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SearchIcon sx={{ mr: 1, color: '#f57c00' }} />
                <Typography variant="h6" fontWeight="bold">
                  Related Incidents ({relatedIncidents.totalIncidents})
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Incidents affecting {relatedIncidents.assetName} and connected assets
              </Typography>

              <Grid container spacing={2}>
                {relatedIncidents.incidents.map((incident: any, idx: number) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                          bgcolor: '#fffde7'
                        },
                        border: '1px solid',
                        borderColor: incident.severity === 'critical' ? '#f44336' : incident.severity === 'high' ? '#ff9800' : '#ffc107'
                      }}
                      onClick={() => runIncidentTraceForAsset(incident.assetName)}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Chip
                            label={incident.incidentId}
                            size="small"
                            sx={{
                              bgcolor: incident.severity === 'critical' ? '#f44336' : incident.severity === 'high' ? '#ff9800' : '#ffc107',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.7rem'
                            }}
                          />
                          <Chip
                            label={incident.status}
                            size="small"
                            color={incident.status === 'offline' || incident.status === 'error' ? 'error' : 'warning'}
                            sx={{ fontSize: '0.65rem' }}
                          />
                        </Box>

                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {incident.assetName}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Type: {incident.assetType} • IP: {incident.ipAddress || 'N/A'}
                        </Typography>

                        <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 'medium', display: 'block', mb: 0.5 }}>
                          {incident.failureReason}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          Failed: {new Date(incident.failureTime).toLocaleString()}
                        </Typography>

                        <Box sx={{ mt: 1, textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold', fontSize: '0.7rem' }}>
                            Click to analyze →
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Asset-Specific Analysis */}
        <Card sx={{ mb: 3, bgcolor: '#f8fafc' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Asset-Specific Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter an asset name and click a button below to perform specific analysis. Results will appear at the bottom of the page.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Asset Name"
                placeholder="e.g., PLC-001, NetworkSwitch-05, Robot-03"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                disabled={loading !== null}
                helperText="Try: PLC-001, NetworkSwitch-05, EdgeGateway-02, Robot-03"
              />
            </Box>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={loading === 'rootCause' ? <CircularProgress size={16} color="inherit" /> : <RCAIcon />}
                  onClick={runRootCauseAnalysis}
                  disabled={loading !== null || !assetName.trim()}
                  data-rca-analyze="true"
                >
                  {loading === 'rootCause' ? 'Analyzing...' : 'Find Root Cause'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  startIcon={loading === 'cascade' ? <CircularProgress size={16} color="inherit" /> : <CascadeIcon />}
                  onClick={runCascadeAnalysis}
                  disabled={loading !== null || !assetName.trim()}
                >
                  {loading === 'cascade' ? 'Analyzing...' : 'Cascade Impact'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Factory-Wide Analysis */}
        <Card sx={{ bgcolor: '#f8fafc' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Factory-Wide Analysis
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={loading === 'all' ? <CircularProgress size={16} /> : <SearchIcon />}
              onClick={runAllScenarios}
              disabled={loading !== null}
            >
              Run All Critical Scenarios
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Runs 6 scenarios: Network • Power • Performance • Time-Based • Config Drift • Critical Paths
            </Typography>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Results Section */}
      <Box id="rca-results-section" sx={{ mt: 3 }}>
        {/* Success Message */}
        {(results.rootCause || results.cascade) && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              ✅ Analysis Complete! Results are displayed below.
            </Typography>
          </Alert>
        )}

        {/* Root Cause Analysis Results */}
        {results.rootCause && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <RCAIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Root Cause Analysis</Typography>
                {results.rootCause.failureDepth !== undefined && (
                  <Chip
                    label={`${results.rootCause.failureDepth} hops`}
                    size="small"
                    sx={{ ml: 'auto', mr: 2 }}
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  {results.rootCause.analysis}
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Root Cause:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {results.rootCause.rootCause} ({results.rootCause.rootCauseType})
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Affected Asset:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {results.rootCause.targetAsset}
                  </Typography>
                </Grid>
              </Grid>

              {results.rootCause.failureChain && results.rootCause.failureChain.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Failure Chain:
                  </Typography>
                  <List dense>
                    {results.rootCause.failureChain.map((node: any, index: number) => (
                      <ListItem key={index} sx={{ bgcolor: '#f1f5f9', mb: 0.5, borderRadius: 1 }}>
                        <ListItemText
                          primary={`${index + 1}. ${node.name} (${node.type})`}
                          secondary={`Status: ${node.status}${node.failureReason ? ' - ' + node.failureReason : ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Cascade Impact Results */}
        {results.cascade && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <CascadeIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Cascade Impact Analysis</Typography>
                <Chip
                  label={results.cascade.severity}
                  color={getSeverityColor(results.cascade.severity) as any}
                  size="small"
                  sx={{ ml: 'auto', mr: 2 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  {results.cascade.analysis}
                </Typography>
              </Alert>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error">
                        {results.cascade.currentlyAffected}
                      </Typography>
                      <Typography variant="caption">Currently Affected</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {results.cascade.totalDownstream}
                      </Typography>
                      <Typography variant="caption">Total Downstream</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {results.cascade.impactRadius}
                      </Typography>
                      <Typography variant="caption">Impact Radius</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Chip
                        label={results.cascade.severity}
                        color={getSeverityColor(results.cascade.severity) as any}
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Severity
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {results.cascade.affectedAssets && results.cascade.affectedAssets.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Affected Assets:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {results.cascade.affectedAssets.slice(0, 10).map((asset: any, index: number) => (
                      <Tooltip key={index} title={`Distance: ${asset.distance} hops`}>
                        <Chip
                          label={`${asset.name} (${asset.type})`}
                          size="small"
                          color={asset.isAffected ? 'error' : 'default'}
                          variant={asset.isAffected ? 'filled' : 'outlined'}
                        />
                      </Tooltip>
                    ))}
                    {results.cascade.affectedAssets.length > 10 && (
                      <Chip
                        label={`+${results.cascade.affectedAssets.length - 10} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Network Failures */}
        {results.network && results.network.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <NetworkIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Network Path Failures</Typography>
                <Chip label={`${results.network.length} issues`} size="small" sx={{ ml: 'auto', mr: 2 }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {results.network.map((issue: any, index: number) => (
                  <Card key={index} sx={{ mb: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {issue.failedNetworkDevice} ({issue.deviceType})
                        </Typography>
                        <Chip label={issue.severity} color={getSeverityColor(issue.severity) as any} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {issue.ipAddress && `IP: ${issue.ipAddress} • `}
                        {issue.isolatedCount} devices isolated
                      </Typography>
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        {issue.recommendation}
                      </Alert>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Power Disruptions */}
        {results.power && results.power.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <PowerIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Power Disruptions</Typography>
                <Chip label={`${results.power.length} issues`} size="small" sx={{ ml: 'auto', mr: 2 }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {results.power.map((issue: any, index: number) => (
                  <Card key={index} sx={{ mb: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {issue.powerSource} ({issue.sourceType})
                        </Typography>
                        <Chip label={issue.severity} color={getSeverityColor(issue.severity) as any} size="small" />
                      </Box>
                      <Grid container spacing={1} sx={{ mb: 1 }}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Critical Equipment
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {issue.criticalEquipment}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Total Affected
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {issue.affectedCount}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Risk Score
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="error">
                            {issue.riskScore}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Alert severity={issue.severity === 'critical' ? 'error' : 'warning'}>
                        {issue.recommendation}
                      </Alert>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Performance Degradation */}
        {results.performance && results.performance.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <PerformanceIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Performance Degradation</Typography>
                <Chip label={`${results.performance.length} issues`} size="small" sx={{ ml: 'auto', mr: 2 }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {results.performance.map((issue: any, index: number) => (
                  <Card key={index} sx={{ mb: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {issue.asset} ({issue.type})
                        </Typography>
                        <Chip label={issue.severity} color={getSeverityColor(issue.severity) as any} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Zone: {issue.zone} • Bottleneck Score: {issue.bottleneckScore}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Pattern:</strong> {issue.pattern}
                      </Typography>
                      <Alert severity="info">{issue.recommendation}</Alert>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Time-Based Correlation */}
        {results.timeBased && results.timeBased.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <PerformanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Time-Based Failure Correlation</Typography>
                <Chip label={`${results.timeBased.length} events`} size="small" sx={{ ml: 'auto', mr: 2 }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                Temporal analysis identifies failures that occurred around the same time
              </Alert>
              <List>
                {results.timeBased.map((event: any, index: number) => (
                  <Card key={index} sx={{ mb: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {event.asset} ({event.type})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Zone: {event.zone} • Time: {event.failureTime}
                      </Typography>
                      {event.failureReason && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Reason: {event.failureReason}
                        </Typography>
                      )}
                      <Chip label={event.correlation} size="small" sx={{ mt: 1 }} />
                    </CardContent>
                  </Card>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Configuration Drift */}
        {results.drift && results.drift.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <RCAIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Configuration Drift</Typography>
                <Chip label={`${results.drift.length} drifts`} size="small" color="warning" sx={{ ml: 'auto', mr: 2 }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="warning" sx={{ mb: 2 }}>
                GitOps drift detected - configurations don't match intended state
              </Alert>
              <List>
                {results.drift.map((drift: any, index: number) => (
                  <Card key={index} sx={{ mb: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {drift.asset} ({drift.type})
                        </Typography>
                        <Chip label={drift.severity} color={getSeverityColor(drift.severity) as any} size="small" />
                      </Box>
                      <Grid container spacing={1} sx={{ mb: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Intended</Typography>
                          <Typography variant="body2">{drift.intendedConfig}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Actual</Typography>
                          <Typography variant="body2">{drift.actualConfig}</Typography>
                        </Grid>
                      </Grid>
                      <Chip label={drift.driftType} color="warning" size="small" sx={{ mr: 1 }} />
                      <Alert severity="info" sx={{ mt: 1 }}>
                        {drift.recommendation}
                      </Alert>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Critical Path Analysis */}
        {results.criticalPath && results.criticalPath.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <CascadeIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Critical Path & SPOF Analysis</Typography>
                <Chip label={`${results.criticalPath.length} SPOFs`} size="small" color="error" sx={{ ml: 'auto', mr: 2 }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="error" sx={{ mb: 2 }}>
                Single Points of Failure (SPOF) detected - redundancy recommended
              </Alert>
              <List>
                {results.criticalPath.map((spof: any, index: number) => (
                  <Card key={index} sx={{ mb: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {spof.asset} ({spof.type})
                        </Typography>
                        <Chip label={spof.severity} color={getSeverityColor(spof.severity) as any} size="small" />
                      </Box>
                      <Grid container spacing={1} sx={{ mb: 1 }}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Dependencies</Typography>
                          <Typography variant="h6" color="error">{spof.dependentCount}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Criticality</Typography>
                          <Typography variant="h6" color="warning.main">{spof.criticalityScore}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Status</Typography>
                          <Typography variant="body2">{spof.status}</Typography>
                        </Grid>
                      </Grid>
                      <Alert severity="error">
                        {spof.recommendation}
                      </Alert>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </Box>
  );
};

export default RCAPanel;
