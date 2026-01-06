import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface MCPTool {
  id: string;
  name: string;
  capability: string;
  riskLevel: string;
  traversalStrategy: string;
  assetCount: number;
}

interface MCPServer {
  server: string;
  tools: MCPTool[];
}

const MCPToolsPanel: React.FC = () => {
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMCPTools();
  }, []);

  const fetchMCPTools = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/mcp-tools`);
      setMcpServers(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string): 'success' | 'warning' | 'error' | 'default' => {
    const colors: { [key: string]: 'success' | 'warning' | 'error' } = {
      LOW: 'success',
      MEDIUM: 'warning',
      HIGH: 'error',
      CRITICAL: 'error',
    };
    return colors[risk] || 'default';
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        MCP AI Agents
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Model Context Protocol tools for root cause analysis
      </Typography>

      {mcpServers.map((server) => (
        <Accordion key={server.server} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
              <Typography variant="subtitle2">{server.server}</Typography>
              <Chip label={`${server.tools.length} tools`} size="small" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {server.tools.map((tool) => (
                <Box key={tool.id} sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {tool.name}
                    </Typography>
                    <Chip
                      label={tool.riskLevel}
                      size="small"
                      color={getRiskColor(tool.riskLevel)}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {tool.capability}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Strategy: ${tool.traversalStrategy}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={`${tool.assetCount} assets`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PlayIcon />}
                    fullWidth
                    disabled
                    sx={{ mt: 1 }}
                  >
                    Execute (Demo Mode)
                  </Button>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Alert severity="info" sx={{ mt: 2 }}>
        Click on a node in the graph to see tool execution options for that asset.
      </Alert>
    </Paper>
  );
};

export default MCPToolsPanel;
