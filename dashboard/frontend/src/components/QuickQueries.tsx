import React, { useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Collapse,
  Button,
  Card,
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  AccountTree as DependencyIcon,
  Error as FailureIcon,
  Timeline as PathIcon,
  Psychology as InsightIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Query {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  cypher?: string;
}

const quickQueries: Query[] = [
  {
    id: 'all-dependencies',
    title: 'Show All Asset Dependencies',
    description: 'View complete dependency graph with POWERS, CONNECTS_TO, FEEDS_DATA relationships',
    icon: <DependencyIcon />,
    category: 'Dependencies',
    cypher: 'MATCH (a:Asset)-[r:POWERS|CONNECTS_TO|FEEDS_DATA]->(b:Asset) RETURN a, r, b LIMIT 50'
  },
  {
    id: 'critical-paths',
    title: 'Find Critical Dependency Paths',
    description: 'Identify assets with high downstream impact (many dependent systems)',
    icon: <PathIcon />,
    category: 'Dependencies',
  },
  {
    id: 'failure-cascade',
    title: 'Trace Failure Cascades',
    description: 'Show how failures propagate through connected systems',
    icon: <FailureIcon />,
    category: 'Failures',
  },
  {
    id: 'upstream-analysis',
    title: 'Upstream Dependency Analysis',
    description: 'For any failing asset, show all upstream dependencies that could be the root cause',
    icon: <DependencyIcon />,
    category: 'Analysis',
  },
  {
    id: 'impact-radius',
    title: 'Calculate Blast Radius',
    description: 'Determine how many systems would be affected if a critical asset fails',
    icon: <InsightIcon />,
    category: 'Analysis',
  },
];

const QuickQueries: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  const setupCascadingFailures = async () => {
    setLoading('setup');
    try {
      // Step 1: Create graph relationships first
      await axios.post(`${API_BASE}/api/setup/graph-relationships`);

      // Step 2: Create cascading failure scenarios
      const response = await axios.post(`${API_BASE}/api/setup/cascading-failures`);

      setSetupMessage(
        `✅ Setup complete! Created ${response.data.totalAffectedAssets || 0} cascading failures across ${response.data.scenarios.length} scenarios. ` +
        `Try querying: ${response.data.testAssets.UPS_CASCADE}`
      );
      setTimeout(() => setSetupMessage(null), 10000);
    } catch (err) {
      setSetupMessage('Failed to setup scenarios - check backend logs');
    } finally {
      setLoading(null);
    }
  };

  const renderPlainEnglishResult = (queryId: string, data: any) => {
    switch (queryId) {
      case 'all-dependencies':
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Found <strong>{data.totalDependencies}</strong> dependency relationships in the system
            </Alert>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Dependency Breakdown:
            </Typography>
            {data.dependencies?.slice(0, 10).map((dep: any, idx: number) => (
              <Card key={idx} sx={{ mb: 1, p: 1, bgcolor: '#fff' }}>
                <Typography variant="caption" display="block">
                  <strong>{dep.source}</strong> ({dep.sourceType}) <Chip label={dep.relationship} size="small" sx={{ mx: 0.5 }} /> <strong>{dep.target}</strong> ({dep.targetType})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Status: {dep.sourceStatus} → {dep.targetStatus}
                </Typography>
              </Card>
            ))}
            {data.dependencies?.length > 10 && (
              <Typography variant="caption" color="text.secondary">
                ... and {data.dependencies.length - 10} more dependencies
              </Typography>
            )}
          </Box>
        );

      case 'critical-paths':
        return (
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Found <strong>{data.totalCriticalAssets}</strong> assets with downstream dependencies
            </Alert>
            <Typography variant="body2" gutterBottom>
              {data.insight}
            </Typography>
            {data.criticalAssets?.map((asset: any, idx: number) => (
              <Card key={idx} sx={{ mb: 1, p: 1.5, border: '1px solid', borderColor: asset.criticality === 'CRITICAL' ? 'error.main' : asset.criticality === 'HIGH' ? 'warning.main' : 'info.main' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {asset.asset} <Chip label={asset.type} size="small" sx={{ ml: 0.5 }} />
                  </Typography>
                  <Chip label={asset.criticality} size="small" color={asset.criticality === 'CRITICAL' ? 'error' : asset.criticality === 'HIGH' ? 'warning' : 'info'} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {asset.downstreamCount} downstream system(s) depend on this asset • Status: {asset.status}
                </Typography>
              </Card>
            ))}
          </Box>
        );

      case 'failure-cascade':
        return (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              Found <strong>{data.totalCascades}</strong> active failure cascade(s)
            </Alert>
            <Typography variant="body2" gutterBottom>
              {data.insight}
            </Typography>
            {data.cascades?.map((cascade: any, idx: number) => (
              <Card key={idx} sx={{ mb: 2, p: 2, bgcolor: '#ffebee', border: '2px solid #ef5350' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                  🔥 {cascade.sourceFailure} ({cascade.sourceType})
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  Reason: {cascade.sourceReason}
                </Typography>
                <Typography variant="caption" display="block" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Cascade Size: {cascade.cascadeSize} affected system(s)
                </Typography>
                {cascade.affectedAssets?.slice(0, 5).map((asset: any, i: number) => (
                  <Typography key={i} variant="caption" display="block" sx={{ ml: 2 }}>
                    • {asset.name} ({asset.type}) - {asset.distance} hop(s) away - {asset.status}
                  </Typography>
                ))}
                {cascade.affectedAssets?.length > 5 && (
                  <Typography variant="caption" display="block" sx={{ ml: 2 }}>
                    ... and {cascade.affectedAssets.length - 5} more
                  </Typography>
                )}
              </Card>
            ))}
          </Box>
        );

      case 'upstream-analysis':
        return (
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Found <strong>{data.totalFailingAssets}</strong> failing asset(s) with upstream dependencies
            </Alert>
            <Typography variant="body2" gutterBottom>
              {data.insight}
            </Typography>
            {data.analyses?.map((analysis: any, idx: number) => (
              <Card key={idx} sx={{ mb: 2, p: 1.5, border: '1px solid', borderColor: 'warning.main' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {analysis.asset} <Chip label={analysis.assetType} size="small" sx={{ ml: 0.5 }} />
                  </Typography>
                  <Chip label={analysis.status} size="small" color="error" />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  {analysis.failureReason || 'No failure reason specified'}
                </Typography>
                <Typography variant="caption" display="block" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {analysis.upstreamCount} upstream dependenc{analysis.upstreamCount === 1 ? 'y' : 'ies'}:
                </Typography>
                {analysis.upstreamAssets?.slice(0, 3).map((upstream: any, i: number) => (
                  <Typography key={i} variant="caption" display="block" sx={{ ml: 2 }}>
                    • {upstream.name} ({upstream.type}) - Status: {upstream.status} - {upstream.distance} hop(s) away
                  </Typography>
                ))}
                {analysis.upstreamAssets?.length > 3 && (
                  <Typography variant="caption" display="block" sx={{ ml: 2 }}>
                    ... and {analysis.upstreamAssets.length - 3} more
                  </Typography>
                )}
              </Card>
            ))}
          </Box>
        );

      case 'impact-radius':
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Calculated blast radius for <strong>{data.totalCriticalAssets}</strong> critical asset(s)
            </Alert>
            <Typography variant="body2" gutterBottom>
              {data.insight}
            </Typography>
            {data.blastRadii?.map((radius: any, idx: number) => (
              <Card key={idx} sx={{ mb: 2, p: 1.5, border: '2px solid', borderColor:
                radius.riskLevel === 'CRITICAL' ? 'error.main' :
                radius.riskLevel === 'HIGH' ? 'warning.main' :
                radius.riskLevel === 'MEDIUM' ? 'info.main' : 'success.main'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {radius.criticalAsset} <Chip label={radius.assetType} size="small" sx={{ ml: 0.5 }} />
                  </Typography>
                  <Chip
                    label={radius.riskLevel}
                    size="small"
                    color={
                      radius.riskLevel === 'CRITICAL' ? 'error' :
                      radius.riskLevel === 'HIGH' ? 'warning' :
                      radius.riskLevel === 'MEDIUM' ? 'info' : 'success'
                    }
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Current Status: {radius.currentStatus}
                </Typography>
                <Typography variant="caption" display="block" fontWeight="bold" sx={{ mb: 0.5 }}>
                  💥 Blast Radius: {radius.blastRadius} system(s) would be affected if this asset fails
                </Typography>
                {radius.affectedSystems?.slice(0, 5).map((system: any, i: number) => (
                  <Typography key={i} variant="caption" display="block" sx={{ ml: 2 }}>
                    • {system.name} ({system.type}) - {system.distance} hop(s) downstream
                  </Typography>
                ))}
                {radius.affectedSystems?.length > 5 && (
                  <Typography variant="caption" display="block" sx={{ ml: 2 }}>
                    ... and {radius.affectedSystems.length - 5} more
                  </Typography>
                )}
              </Card>
            ))}
          </Box>
        );

      default:
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Query completed successfully
            </Alert>
            <pre style={{ fontSize: '0.7rem', overflow: 'auto', maxHeight: '200px' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </Box>
        );
    }
  };

  const runQuery = async (queryId: string) => {
    setLoading(queryId);
    setExpanded(queryId);

    try {
      let response;
      switch (queryId) {
        case 'all-dependencies':
          response = await axios.get(`${API_BASE}/api/graph/dependencies`);
          break;
        case 'critical-paths':
          response = await axios.get(`${API_BASE}/api/graph/critical-paths`);
          break;
        case 'failure-cascade':
          response = await axios.get(`${API_BASE}/api/rca/failure-cascades`);
          break;
        case 'upstream-analysis':
          response = await axios.get(`${API_BASE}/api/rca/upstream-analysis-all`);
          break;
        case 'impact-radius':
          response = await axios.get(`${API_BASE}/api/rca/blast-radius-all`);
          break;
        default:
          response = { data: { message: 'Query not implemented' } };
      }

      setResults((prev) => ({ ...prev, [queryId]: response.data }));
    } catch (err) {
      console.error('Query failed:', err);
      setResults((prev) => ({ ...prev, [queryId]: { error: 'Query failed' } }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            🚀 Quick Knowledge Graph Queries
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Common queries to understand dependencies, failures, and system relationships
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={setupCascadingFailures}
          disabled={loading !== null}
          startIcon={loading === 'setup' ? <CircularProgress size={16} /> : null}
        >
          {loading === 'setup' ? 'Setting up...' : 'Setup Test Scenarios'}
        </Button>
      </Box>

      {setupMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSetupMessage(null)}>
          {setupMessage}
        </Alert>
      )}

      <List dense>
        {quickQueries.map((query) => (
          <Box key={query.id} sx={{ mb: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => runQuery(query.id)}
                disabled={loading !== null}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon>
                  {loading === query.id ? (
                    <CircularProgress size={24} />
                  ) : (
                    query.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={query.title}
                  secondary={query.description}
                  primaryTypographyProps={{ fontWeight: 'medium', fontSize: '0.9rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
                <Chip label={query.category} size="small" sx={{ ml: 1 }} />
              </ListItemButton>
            </ListItem>

            <Collapse in={expanded === query.id} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 1, ml: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                {results[query.id] ? (
                  results[query.id].error ? (
                    <Alert severity="error">{results[query.id].error}</Alert>
                  ) : (
                    <Box>
                      {renderPlainEnglishResult(query.id, results[query.id])}
                    </Box>
                  )
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Click to run query
                  </Typography>
                )}

                {query.cypher && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                      Cypher Query Used:
                    </Typography>
                    <Paper sx={{ p: 1, bgcolor: '#263238' }}>
                      <code style={{ color: '#aed581', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                        {query.cypher}
                      </code>
                    </Paper>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        ))}
      </List>
    </Paper>
  );
};

export default QuickQueries;
