import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
} from '@mui/material';
import {
  Factory as FactoryIcon,
  Router as RouterIcon,
  Cloud as CloudIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Psychology as AIIcon,
  Business as ExecutiveIcon,
  TroubleshootOutlined as RCAIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import axios from 'axios';

import StatsPanel from './components/StatsPanel';
import AIAssistant from './components/AIAssistant';
import UnifiedDashboard from './components/UnifiedDashboard';
import QuickQueries from './components/QuickQueries';
import AssetExplorer from './components/AssetExplorer';
import UnifiedRCAAdvanced from './components/UnifiedRCAAdvanced';
import GitOpsDriftDashboard from './components/GitOpsDriftDashboard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Stats {
  totalAssets: number;
  onlineAssets: number;
  errorAssets: number;
  uptimePercent: number;
  totalRelationships: number;
  assetTypes: string[];
  relationshipTypes: string[];
}

interface GraphData {
  nodes: any[];
  links: any[];
  metadata?: any;
}

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [assetTypes, setAssetTypes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rcaContext, setRcaContext] = useState<any>(null);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
    fetchAssetTypes();
    fetchGraphData('all');

    // Set up WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'stats_update') {
        // Update stats in real-time
        fetchStats();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Ping every 10 seconds
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 10000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchAssetTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/assets/types`);
      const types = response.data.map((t: any) => t.type);
      setAssetTypes(types);
    } catch (err) {
      console.error('Failed to fetch asset types:', err);
    }
  };

  const fetchGraphData = async (view: string) => {
    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      switch (view) {
        case 'manufacturing':
          endpoint = '/api/graph/manufacturing';
          break;
        case 'network':
          endpoint = '/api/graph/network';
          break;
        case 'infrastructure':
          endpoint = '/api/graph/infrastructure';
          break;
        default:
          endpoint = '/api/graph';
      }

      const response = await axios.post(`${API_BASE}${endpoint}`, {
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        search: searchQuery || undefined,
      });

      setGraphData(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedAsset(nodeId);
  };

  const handleApplyFilters = () => {
    const views = ['executive', 'rca', 'all', 'manufacturing', 'network', 'infrastructure', 'data-pipeline', 'ai'];
    const viewName = views[currentTab];
    if (viewName !== 'executive' && viewName !== 'rca' && viewName !== 'ai') {
      fetchGraphData(viewName);
    }
  };

  const handleQuickRCA = (asset: any) => {
    setRcaContext(asset);
    setCurrentTab(2); // Switch to RCA Analysis tab
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: '#1e293b' }}>
        <Toolbar>
          <FactoryIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Factory Digital Twin - Knowledge Graph Visualization
          </Typography>
          {stats && (
            <Chip
              label={`${stats.onlineAssets}/${stats.totalAssets} Assets Online`}
              color={stats.uptimePercent > 90 ? 'success' : 'warning'}
              sx={{ mr: 2 }}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab icon={<DashboardIcon />} label="Live Dashboard" />
          <Tab icon={<FactoryIcon />} label="Asset Explorer" />
          <Tab icon={<RCAIcon />} label="RCA Analysis" />
          <Tab icon={<GitHubIcon />} label="GitOps & Drift" />
          <Tab icon={<AIIcon />} label="AI Assistant" />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Container maxWidth={false} sx={{ flexGrow: 1, py: 2, overflow: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
        {currentTab === 0 ? (
          /* Live Dashboard - Unified Executive + Analytics */
          <UnifiedDashboard />
        ) : currentTab === 1 ? (
          /* Asset Explorer - Unified View with Graph, Table, and Cards */
          <Box sx={{ height: 'calc(100vh - 180px)' }}>
            <AssetExplorer onQuickRCA={handleQuickRCA} />
          </Box>
        ) : currentTab === 2 ? (
          /* Advanced RCA Analysis with LangGraph & GraphRAG */
          <UnifiedRCAAdvanced assetContext={rcaContext} />
        ) : currentTab === 3 ? (
          /* GitOps Configuration & Drift Detection */
          <GitOpsDriftDashboard />
        ) : currentTab === 4 ? (
          /* AI Assistant with Quick Queries Integrated */
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={12} md={3}>
              {stats && <StatsPanel stats={stats} />}
              <Box sx={{ mt: 2 }}>
                <QuickQueries />
              </Box>
            </Grid>
            <Grid item xs={12} md={9} sx={{ height: '85vh' }}>
              <AIAssistant />
            </Grid>
          </Grid>
        ) : null}
      </Container>
    </Box>
  );
}

export default App;
