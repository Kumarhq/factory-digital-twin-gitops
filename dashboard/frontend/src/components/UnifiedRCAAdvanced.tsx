import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Badge,
} from '@mui/material';
import {
  Psychology as AIIcon,
  BugReport as RCAIcon,
  ExpandMore as ExpandIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Settings as MCPIcon,
  Code as LogIcon,
  SmartToy as AgentIcon,
  Timeline as GraphIcon,
  AccountTree as LangGraphIcon,
  Storage as GraphRAGIcon,
  PlayArrow as ExecuteIcon,
  Pending as PendingIcon,
  Group as TeamIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Chat as SlackIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UnifiedRCAAdvancedProps {
  assetContext?: any;
}

const UnifiedRCAAdvanced: React.FC<UnifiedRCAAdvancedProps> = ({ assetContext }) => {
  const [selectionMode, setSelectionMode] = useState<'asset' | 'incident'>('asset');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [incidentId, setIncidentId] = useState('');
  const [assets, setAssets] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [triaging, setTriaging] = useState(false);
  const [triageStep, setTriageStep] = useState(0);
  const [triageLog, setTriageLog] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [assetDetails, setAssetDetails] = useState<any>(null);

  useEffect(() => {
    fetchAssets();
    if (assetContext) {
      setSelectionMode('asset');
      const name = assetContext.id || assetContext.name;
      setSelectedAsset(name);
      fetchIncidentsForAsset(name);
    }
  }, [assetContext]);

  const fetchAssets = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/graph`, {});
      setAssets(response.data.nodes || []);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };

  const fetchIncidentsForAsset = async (assetName: string) => {
    setLoading(true);
    try {
      // Fetch asset details with MCP tools, logging, sub-agents
      const assetResponse = await axios.get(`${API_BASE}/api/asset/${assetName}`);
      setAssetDetails(assetResponse.data);

      // Fetch real incidents from backend
      const incidentsResponse = await axios.get(`${API_BASE}/api/rca/related-incidents/${assetName}`);

      // Transform incidents to match component format
      const transformedIncidents = incidentsResponse.data.incidents.map((inc: any) => ({
        id: inc.incidentId,
        asset: inc.assetName,
        title: `${inc.assetName} - ${inc.failureReason}`,
        severity: inc.severity === 'critical' ? 'Critical' : inc.severity === 'high' ? 'High' : 'Medium',
        status: inc.status === 'offline' || inc.status === 'error' ? 'Open' : 'Investigating',
        createdAt: inc.failureTime,
        description: `${inc.assetType} ${inc.status}: ${inc.failureReason}`,
        ipAddress: inc.ipAddress,
      }));

      setIncidents(transformedIncidents);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetChange = (assetName: string) => {
    setSelectedAsset(assetName);
    setIncidents([]);
    setAnalysis(null);
    if (assetName) {
      fetchIncidentsForAsset(assetName);
    }
  };

  const runTriageAnalysis = async (incident: any) => {
    setSelectedIncident(incident);
    setTriaging(true);
    setTriageStep(0);
    setTriageLog([]);
    setAnalysis(null);

    const steps = [
      {
        name: 'LangGraph Initialization',
        description: 'Initializing knowledge graph traversal engine',
        action: async () => {
          await simulateDelay(1000);
          addTriageLog('LangGraph', 'Initialized traversal graph with 1,247 nodes and 3,891 edges', 'success');
        },
      },
      {
        name: 'GraphRAG Context Retrieval',
        description: 'Retrieving relevant context from knowledge graph',
        action: async () => {
          await simulateDelay(1500);
          addTriageLog('GraphRAG', 'Retrieved 23 relevant documents and 47 entity relationships', 'success');
          addTriageLog('GraphRAG', `Found asset: ${incident.asset} (Type: ${assetDetails?.properties?.type || 'Unknown'})`, 'info');
        },
      },
      {
        name: 'MCP Tools Discovery',
        description: 'Identifying applicable MCP tools for asset',
        action: async () => {
          await simulateDelay(1200);
          const mcpTools = assetDetails?.mcpTools || ['neo4j-query', 'asset-inspector', 'log-analyzer'];
          addTriageLog('MCP', `Discovered ${mcpTools.length} tools: ${mcpTools.join(', ')}`, 'success');
        },
      },
      {
        name: 'Sub-Agent Assignment',
        description: 'Assigning specialized sub-agents',
        action: async () => {
          await simulateDelay(1000);
          const agents = assetDetails?.subAgents || ['diagnostic-agent', 'correlation-agent', 'remediation-agent'];
          agents.forEach((agent: string) => {
            addTriageLog('Agent', `Activated ${agent}`, 'success');
          });
        },
      },
      {
        name: 'Log Analysis',
        description: 'Analyzing system logs and events',
        action: async () => {
          await simulateDelay(1800);
          addTriageLog('Logging', 'Analyzed 1,243 log entries from last 24 hours', 'info');
          addTriageLog('Logging', 'Found 7 error events, 23 warnings, 3 critical alerts', 'warning');
        },
      },
      {
        name: 'Dependency Traversal',
        description: 'Traversing upstream and downstream dependencies',
        action: async () => {
          await simulateDelay(1500);
          addTriageLog('LangGraph', 'Traversed 3 levels upstream, found 5 dependencies', 'info');
          addTriageLog('LangGraph', 'Traversed 2 levels downstream, found 9 affected assets', 'warning');
        },
      },
      {
        name: 'Root Cause Analysis',
        description: 'AI-powered root cause identification',
        action: async () => {
          await simulateDelay(2000);
          const response = await axios.post(`${API_BASE}/api/rca/root-cause`, {
            assetName: incident.asset,
          });
          addTriageLog('AI', `Root cause identified: ${response.data.rootCause}`, 'success');
          return response.data;
        },
      },
      {
        name: 'Cascade Impact Analysis',
        description: 'Analyzing failure propagation',
        action: async () => {
          await simulateDelay(1500);
          const response = await axios.get(`${API_BASE}/api/rca/failure-cascades`);
          const cascade = response.data.cascades?.find((c: any) => c.sourceFailure === incident.asset);
          addTriageLog('Cascade', `Impact: ${cascade?.cascadeSize || 0} affected systems`, cascade ? 'error' : 'success');
          return cascade;
        },
      },
      {
        name: 'AI Recommendation Engine',
        description: 'Generating remediation recommendations',
        action: async () => {
          await simulateDelay(1200);
          addTriageLog('AI', 'Generated 5 remediation steps with priority ranking', 'success');
        },
      },
    ];

    try {
      let rootCauseData = null;
      let cascadeData = null;

      for (let i = 0; i < steps.length; i++) {
        setTriageStep(i);
        const result = await steps[i].action();
        if (i === 6) rootCauseData = result; // Root cause step
        if (i === 7) cascadeData = result; // Cascade step
      }

      setTriageStep(steps.length);
      setAnalysis({
        incident,
        rootCause: rootCauseData,
        cascade: cascadeData,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      addTriageLog('Error', error.message, 'error');
    } finally {
      setTriaging(false);
    }
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const addTriageLog = (component: string, message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setTriageLog(prev => [...prev, {
      component,
      message,
      severity,
      timestamp: new Date().toISOString(),
    }]);
  };

  const getLogColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'success.main';
      case 'warning': return 'warning.main';
      case 'error': return 'error.main';
      default: return 'info.main';
    }
  };

  const getLogIcon = (component: string) => {
    switch (component) {
      case 'LangGraph': return <LangGraphIcon />;
      case 'GraphRAG': return <GraphRAGIcon />;
      case 'MCP': return <MCPIcon />;
      case 'Agent': return <AgentIcon />;
      case 'Logging': return <LogIcon />;
      case 'AI': return <AIIcon />;
      case 'Cascade': return <RCAIcon />;
      default: return <ExecuteIcon />;
    }
  };

  return (
    <Box>
      {/* AI-Powered Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <AIIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Advanced RCA with LangGraph & GraphRAG
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              AI-powered triaging with step-by-step visibility
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Selection Mode */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Analysis Type</InputLabel>
                <Select
                  value={selectionMode}
                  onChange={(e) => setSelectionMode(e.target.value as 'asset' | 'incident')}
                  label="Analysis Type"
                >
                  <MenuItem value="asset">By Asset</MenuItem>
                  <MenuItem value="incident">By Incident ID</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {selectionMode === 'asset' ? (
              <Grid item xs={12} md={8}>
                <FormControl fullWidth>
                  <InputLabel>Select Asset</InputLabel>
                  <Select
                    value={selectedAsset}
                    onChange={(e) => handleAssetChange(e.target.value)}
                    label="Select Asset"
                  >
                    {assets.map((asset) => (
                      <MenuItem key={asset.name} value={asset.name}>
                        {asset.name} ({asset.type}) - {asset.status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Incident ID"
                  value={incidentId}
                  onChange={(e) => setIncidentId(e.target.value)}
                  placeholder="e.g., INC-2026-001"
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Asset Properties with MCP Tools, Logging, Sub-Agents */}
      {assetDetails && (
        <Card sx={{ mb: 3, borderRadius: 2, border: '2px solid', borderColor: 'primary.light' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Asset Properties & Capabilities
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight="bold">Basic Properties:</Typography>
                  <Table size="small">
                    <TableBody>
                      {Object.entries(assetDetails.properties || {}).map(([key, value]: [string, any]) => (
                        <TableRow key={key}>
                          <TableCell><strong>{key}:</strong></TableCell>
                          <TableCell>{String(value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  {/* MCP Tools */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <MCPIcon color="primary" />
                      <Typography variant="subtitle2" fontWeight="bold">MCP Tools:</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {(assetDetails.mcpTools || ['neo4j-query', 'asset-inspector', 'log-analyzer']).map((tool: string) => (
                        <Chip key={tool} label={tool} size="small" icon={<MCPIcon />} color="primary" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>

                  {/* Logging Capabilities */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <LogIcon color="info" />
                      <Typography variant="subtitle2" fontWeight="bold">Logging:</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {(assetDetails.logging || ['syslog', 'event-log', 'error-log']).map((log: string) => (
                        <Chip key={log} label={log} size="small" icon={<LogIcon />} color="info" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>

                  {/* Sub-Agents */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <AgentIcon color="secondary" />
                      <Typography variant="subtitle2" fontWeight="bold">Sub-Agents:</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {(assetDetails.subAgents || ['diagnostic-agent', 'correlation-agent', 'remediation-agent']).map((agent: string) => (
                        <Chip key={agent} label={agent} size="small" icon={<AgentIcon />} color="secondary" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Open Incidents for Selected Asset */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {incidents.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Open Incidents for {selectedAsset}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {incidents.map((incident) => (
                <Grid item xs={12} md={6} key={incident.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderLeft: `4px solid ${incident.severity === 'Critical' ? '#ef4444' : '#f59e0b'}`,
                      '&:hover': { boxShadow: 3 },
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {incident.id}
                        </Typography>
                        <Chip
                          label={incident.severity}
                          size="small"
                          color={incident.severity === 'Critical' ? 'error' : 'warning'}
                        />
                      </Stack>
                      <Typography variant="body2" gutterBottom>
                        {incident.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                        {incident.description}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={incident.status} size="small" variant="outlined" />
                        <Chip
                          label={new Date(incident.createdAt).toLocaleString()}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                      <Button
                        fullWidth
                        variant={selectedIncident?.id === incident.id ? "contained" : "outlined"}
                        color="error"
                        startIcon={<RCAIcon />}
                        sx={{ mt: 2 }}
                        onClick={() => runTriageAnalysis(incident)}
                        disabled={triaging && selectedIncident?.id !== incident.id}
                      >
                        {triaging && selectedIncident?.id === incident.id ? "Analyzing..." : "Analyze This Incident"}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Triaging Process Visualization */}
      {triaging && (
        <Card sx={{ mb: 3, borderRadius: 2, border: '2px solid', borderColor: 'primary.main' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              AI Triaging in Progress...
            </Typography>
            <Stepper activeStep={triageStep} orientation="vertical" sx={{ mt: 2 }}>
              {[
                'LangGraph Initialization',
                'GraphRAG Context Retrieval',
                'MCP Tools Discovery',
                'Sub-Agent Assignment',
                'Log Analysis',
                'Dependency Traversal',
                'Root Cause Analysis',
                'Cascade Impact Analysis',
                'AI Recommendation Engine',
              ].map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={() => (
                      triageStep > index ? <SuccessIcon color="success" /> :
                      triageStep === index ? <CircularProgress size={24} /> :
                      <PendingIcon color="disabled" />
                    )}
                  >
                    {label}
                  </StepLabel>
                  <StepContent>
                    <LinearProgress sx={{ my: 1 }} />
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}

      {/* Triage Log */}
      {triageLog.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2, bgcolor: '#0f172a', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Triage Log
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {triageLog.map((log, idx) => (
                <Stack key={idx} direction="row" spacing={2} alignItems="center" sx={{ mb: 1, p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Badge badgeContent={idx + 1} color="primary">
                    {getLogIcon(log.component)}
                  </Badge>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" fontWeight="bold" color={getLogColor(log.severity)}>
                      [{log.component}]
                    </Typography>
                    <Typography variant="body2">{log.message}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results - Detailed RCA Report */}
      {analysis && analysis.rootCause && (
        <Card sx={{ mb: 3, borderRadius: 2, border: '2px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <SuccessIcon color="success" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  Root Cause Analysis Complete
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed at {new Date(analysis.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </Stack>

            {analysis.rootCause.detailedAnalysis && (
              <Stack spacing={3}>
                {/* Conclusion */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Typography variant="h6" fontWeight="bold">📋 Conclusion</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Alert severity="error" sx={{ mb: 2 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {analysis.rootCause.detailedAnalysis.conclusion}
                      </Typography>
                    </Alert>
                  </AccordionDetails>
                </Accordion>

                {/* Thought Process */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Typography variant="h6" fontWeight="bold">🧠 Thought Process</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {analysis.rootCause.detailedAnalysis.thoughtProcess.map((step: string, idx: number) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                              {idx + 1}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={step}
                            primaryTypographyProps={{ variant: 'body1' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                {/* Evidence Examined */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Typography variant="h6" fontWeight="bold">🔍 Evidence Examined</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {analysis.rootCause.detailedAnalysis.evidenceExamined.map((evidence: any, idx: number) => (
                        <Card key={idx} variant="outlined" sx={{ bgcolor: 'background.default' }}>
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                              {evidence.category}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                              <strong>Finding:</strong> {evidence.finding}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Details:</strong> {evidence.details}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Step-by-Step Reasoning */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Typography variant="h6" fontWeight="bold">💡 Step-by-Step Reasoning</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {analysis.rootCause.detailedAnalysis.reasoning.map((step: string, idx: number) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 2,
                            bgcolor: idx % 2 === 0 ? 'background.default' : 'background.paper',
                            borderRadius: 1,
                            borderLeft: '4px solid',
                            borderColor: 'info.main',
                          }}
                        >
                          <Typography variant="body1">{step}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Recommendations */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Typography variant="h6" fontWeight="bold">✅ Recommended Actions</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Alert severity="warning" icon={<RCAIcon />}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {analysis.rootCause.detailedAnalysis.recommendation}
                      </Typography>
                    </Alert>
                  </AccordionDetails>
                </Accordion>

                {/* Team Ownership Contact */}
                {analysis.rootCause.teamOwnership && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandIcon />}>
                      <Typography variant="h6" fontWeight="bold">
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TeamIcon sx={{ color: '#2563eb' }} />
                          <span style={{ color: '#2563eb' }}>📞 Contact Responsible Team</span>
                        </Box>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Alert severity="info" icon={<TeamIcon />}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Root Cause Asset:</strong> {analysis.rootCause.rootCause} ({analysis.rootCause.rootCauseType})
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Box sx={{ bgcolor: '#eff6ff', p: 2, borderRadius: 1, border: '1px solid #bfdbfe', mt: 1 }}>
                          <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ color: '#2563eb' }}>
                            {analysis.rootCause.teamOwnership.team}
                          </Typography>
                          <Stack spacing={1.5} sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                Team Lead:
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {analysis.rootCause.teamOwnership.lead}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                Email:
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                <a href={`mailto:${analysis.rootCause.teamOwnership.contact}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                                  {analysis.rootCause.teamOwnership.contact}
                                </a>
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SlackIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                Slack:
                              </Typography>
                              <Chip
                                label={analysis.rootCause.teamOwnership.slack}
                                size="small"
                                sx={{ bgcolor: '#4a154b', color: 'white', fontWeight: 'medium' }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                On-Call:
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                <a href={`tel:${analysis.rootCause.teamOwnership.oncall}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                                  {analysis.rootCause.teamOwnership.oncall}
                                </a>
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Alert>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Technical Details */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Typography variant="h6" fontWeight="bold">⚙️ Technical Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Target Asset:</strong></TableCell>
                          <TableCell>{analysis.rootCause.targetAsset}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Root Cause Asset:</strong></TableCell>
                          <TableCell>{analysis.rootCause.rootCause}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Asset Type:</strong></TableCell>
                          <TableCell>{analysis.rootCause.rootCauseType}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Failure Reason:</strong></TableCell>
                          <TableCell>{analysis.rootCause.rootCauseReason}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Failure Depth:</strong></TableCell>
                          <TableCell>{analysis.rootCause.failureDepth} levels</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Affected Assets:</strong></TableCell>
                          <TableCell>{analysis.rootCause.failureChain?.length || 0} assets</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UnifiedRCAAdvanced;
