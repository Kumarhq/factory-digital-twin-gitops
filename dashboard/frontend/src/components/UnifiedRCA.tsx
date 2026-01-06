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
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Psychology as AIIcon,
  BugReport as RCAIcon,
  TroubleshootOutlined as AnalyzeIcon,
  Whatshot as CascadeIcon,
  Lightbulb as RecommendationIcon,
  Timeline as ChainIcon,
  ExpandMore as ExpandIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UnifiedRCAProps {
  assetContext?: any;
}

const UnifiedRCA: React.FC<UnifiedRCAProps> = ({ assetContext }) => {
  const [assetInput, setAssetInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    rootCause: true,
    cascade: true,
    recommendations: true,
  });

  useEffect(() => {
    if (assetContext) {
      const name = assetContext.id || assetContext.name;
      setAssetInput(name);
      if (['offline', 'error', 'degraded', 'warning'].includes(assetContext.status?.toLowerCase())) {
        runUnifiedAnalysis(name);
      }
    }
  }, [assetContext]);

  const runUnifiedAnalysis = async (assetName?: string) => {
    const targetAsset = assetName || assetInput.trim();
    if (!targetAsset) {
      setError('Please enter an asset name');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setAnalysisStep(0);

    try {
      // Step 1: Root Cause Analysis
      setAnalysisStep(1);
      const rootCauseResponse = await axios.post(`${API_BASE}/api/rca/root-cause`, {
        assetName: targetAsset,
      });

      // Step 2: Cascade Impact Analysis
      setAnalysisStep(2);
      const cascadeResponse = await axios.get(`${API_BASE}/api/rca/failure-cascades`);

      // Find cascade for this asset
      const assetCascade = cascadeResponse.data.cascades?.find(
        (c: any) => c.sourceFailure === targetAsset
      );

      // Step 3: Compile comprehensive analysis
      setAnalysisStep(3);
      setAnalysis({
        asset: targetAsset,
        rootCause: rootCauseResponse.data,
        cascade: assetCascade || { cascadeSize: 0, affectedAssets: [] },
        timestamp: new Date().toISOString(),
      });

      setAnalysisStep(4); // Complete
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Analysis failed');
      setAnalysisStep(0);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'success';
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
              AI-Powered Root Cause Analysis
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Unified diagnostic engine with predictive insights
            </Typography>
          </Box>
        </Stack>

        {assetContext && (
          <Alert
            severity="info"
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              '& .MuiAlert-icon': { color: 'white' },
            }}
          >
            <Typography variant="subtitle2">
              Analyzing: <strong>{assetContext.name}</strong> ({assetContext.type}) • Status: {assetContext.status}
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Input Section */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              label="Asset Name or Incident ID"
              value={assetInput}
              onChange={(e) => setAssetInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && runUnifiedAnalysis()}
              placeholder="e.g., UPS-Main, PLC-001, NetworkSwitch-05"
              disabled={loading}
              InputProps={{
                startAdornment: <RCAIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => runUnifiedAnalysis()}
              disabled={loading || !assetInput.trim()}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AnalyzeIcon />}
              sx={{
                minWidth: 180,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
                },
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Analysis Progress */}
      {loading && (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Stepper activeStep={analysisStep - 1} alternativeLabel>
              <Step>
                <StepLabel>Root Cause Discovery</StepLabel>
              </Step>
              <Step>
                <StepLabel>Cascade Analysis</StepLabel>
              </Step>
              <Step>
                <StepLabel>AI Recommendations</StepLabel>
              </Step>
              <Step>
                <StepLabel>Complete</StepLabel>
              </Step>
            </Stepper>
            <LinearProgress sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analysis Results */}
      {analysis && (
        <Box>
          {/* Root Cause Section */}
          <Card sx={{ mb: 2, borderRadius: 2, border: '2px solid', borderColor: 'error.light' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'error.main', width: 48, height: 48 }}>
                    <ErrorIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Root Cause Identified
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      AI Confidence: {analysis.rootCause?.confidence || 'High'}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => toggleSection('rootCause')} size="small">
                  <ExpandIcon
                    sx={{
                      transform: expandedSections.rootCause ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: '0.3s',
                    }}
                  />
                </IconButton>
              </Stack>

              <Collapse in={expandedSections.rootCause}>
                <Alert
                  severity={getSeverityColor(analysis.rootCause?.severity)}
                  icon={<WarningIcon />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {analysis.rootCause?.rootCause || 'Investigating failure...'}
                  </Typography>
                </Alert>

                {analysis.rootCause?.failureChain && analysis.rootCause.failureChain.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Failure Chain ({analysis.rootCause.failureDepth} levels):
                    </Typography>
                    <List dense>
                      {analysis.rootCause.failureChain.map((item: any, idx: number) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <ArrowIcon color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${item.asset} (${item.type})`}
                            secondary={`Status: ${item.status} • ${item.reason || 'No details'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {analysis.rootCause?.analysis && (
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">{analysis.rootCause.analysis}</Typography>
                  </Paper>
                )}
              </Collapse>
            </CardContent>
          </Card>

          {/* Cascade Impact Section */}
          <Card sx={{ mb: 2, borderRadius: 2, border: '2px solid', borderColor: 'warning.light' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                    <CascadeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Cascade Impact
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {analysis.cascade.cascadeSize || 0} affected system(s)
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => toggleSection('cascade')} size="small">
                  <ExpandIcon
                    sx={{
                      transform: expandedSections.cascade ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: '0.3s',
                    }}
                  />
                </IconButton>
              </Stack>

              <Collapse in={expandedSections.cascade}>
                {analysis.cascade.cascadeSize > 0 ? (
                  <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      This failure is propagating through {analysis.cascade.cascadeSize} downstream system(s)
                    </Alert>
                    <List dense>
                      {analysis.cascade.affectedAssets?.slice(0, 10).map((asset: any, idx: number) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <Chip
                              label={`${asset.distance} hop${asset.distance > 1 ? 's' : ''}`}
                              size="small"
                              color="warning"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${asset.name} (${asset.type})`}
                            secondary={`Status: ${asset.status}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  <Alert severity="success">
                    No cascade detected - failure is isolated
                  </Alert>
                )}
              </Collapse>
            </CardContent>
          </Card>

          {/* AI Recommendations Section */}
          <Card sx={{ mb: 2, borderRadius: 2, border: '2px solid', borderColor: 'success.light' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                    <RecommendationIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      AI Recommendations
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automated resolution steps
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => toggleSection('recommendations')} size="small">
                  <ExpandIcon
                    sx={{
                      transform: expandedSections.recommendations ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: '0.3s',
                    }}
                  />
                </IconButton>
              </Stack>

              <Collapse in={expandedSections.recommendations}>
                {analysis.rootCause?.recommendation ? (
                  <Alert severity="info" icon={<AIIcon />}>
                    {analysis.rootCause.recommendation}
                  </Alert>
                ) : (
                  <List dense>
                    <ListItem>
                      <ListItemIcon><SuccessIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Verify power supply to affected assets" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SuccessIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Check network connectivity and switches" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SuccessIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Review recent configuration changes" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SuccessIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Schedule maintenance for critical dependencies" />
                    </ListItem>
                  </List>
                )}
              </Collapse>
            </CardContent>
          </Card>

          {/* Analysis Metadata */}
          <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Analysis completed: {new Date(analysis.timestamp).toLocaleString()}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label="AI-Powered" size="small" icon={<AIIcon />} />
                <Chip
                  label={`Severity: ${analysis.rootCause?.severity || 'Medium'}`}
                  size="small"
                  color={getSeverityColor(analysis.rootCause?.severity)}
                />
              </Stack>
            </Stack>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default UnifiedRCA;
