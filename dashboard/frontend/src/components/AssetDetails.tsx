import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  OpenInNew as OpenIcon,
  BuildCircle as MCPIcon,
  Article as LogIcon,
  SmartToy as AgentIcon,
  Group as TeamIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Chat as SlackIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AssetDetailsProps {
  assetId: string;
  onClose?: () => void;
}

interface AssetData {
  properties: any;
  relationships: {
    outgoing: Array<{ type: string; target: string }>;
    incoming: Array<{ type: string; source: string }>;
  };
  location: {
    space: string;
    matterportUrl: string;
  };
  zone: {
    name: string;
    level: string;
  };
  teamOwnership?: {
    team: string;
    lead: string;
    contact: string;
    slack: string;
    oncall: string;
  };
  mcpTools: string[];
  logging: string[];
  subAgents: string[];
}

const AssetDetails: React.FC<AssetDetailsProps> = ({ assetId, onClose }) => {
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssetDetails();
  }, [assetId]);

  const fetchAssetDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE}/api/asset/${assetId}`);
      setAsset(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
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

  if (!asset) {
    return null;
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'success' | 'error' | 'warning' | 'default' } = {
      running: 'success',
      online: 'success',
      stopped: 'error',
      error: 'error',
      offline: 'error',
      warning: 'warning',
      degraded: 'warning',
    };
    return colors[status?.toLowerCase()] || 'default';
  };

  return (
    <Paper sx={{ p: 2, maxHeight: '85vh', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            {asset.properties.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={asset.properties.type} size="small" color="primary" />
            {asset.properties.status && (
              <Chip
                label={asset.properties.status}
                size="small"
                color={getStatusColor(asset.properties.status)}
              />
            )}
          </Box>
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Properties */}
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Properties
      </Typography>
      <Box sx={{ mb: 3 }}>
        {Object.entries(asset.properties)
          .filter(([key]) => !['id', 'name', 'type', 'status'].includes(key))
          .map(([key, value]) => (
            <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {key}:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {String(value)}
              </Typography>
            </Box>
          ))}
      </Box>

      {/* Location */}
      {asset.location.space && (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Location
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2">{asset.location.space}</Typography>
            {asset.location.matterportUrl && (
              <Link
                href={asset.location.matterportUrl}
                target="_blank"
                rel="noopener"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, fontSize: '0.875rem' }}
              >
                View 3D Space <OpenIcon fontSize="small" />
              </Link>
            )}
          </Box>
        </>
      )}

      {/* Security Zone */}
      {asset.zone.name && (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Security Zone
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Chip label={asset.zone.level} size="small" sx={{ mr: 1 }} />
            <Typography variant="body2" display="inline">
              {asset.zone.name}
            </Typography>
          </Box>
        </>
      )}

      {/* Team Ownership */}
      {asset.teamOwnership && (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TeamIcon fontSize="small" sx={{ color: '#2563eb' }} />
              <span style={{ color: '#2563eb' }}>Team Ownership</span>
            </Box>
          </Typography>
          <Box sx={{ mb: 3, bgcolor: '#eff6ff', p: 2, borderRadius: 1, border: '1px solid #bfdbfe' }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              {asset.teamOwnership.team}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Lead:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {asset.teamOwnership.lead}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {asset.teamOwnership.contact}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SlackIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Slack:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {asset.teamOwnership.slack}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  On-Call:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {asset.teamOwnership.oncall}
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}

      {/* Capabilities Section */}
      {(asset.mcpTools?.length > 0 || asset.logging?.length > 0 || asset.subAgents?.length > 0) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Capabilities
          </Typography>

          {/* MCP Tools */}
          {asset.mcpTools && asset.mcpTools.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <MCPIcon fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight="medium">
                  MCP Tools ({asset.mcpTools.length})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {asset.mcpTools.map((tool, idx) => (
                  <Chip
                    key={idx}
                    label={tool}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Logging */}
          {asset.logging && asset.logging.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <LogIcon fontSize="small" color="info" />
                <Typography variant="body2" fontWeight="medium">
                  Logging ({asset.logging.length})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {asset.logging.map((log, idx) => (
                  <Chip
                    key={idx}
                    label={log}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Sub-Agents */}
          {asset.subAgents && asset.subAgents.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <AgentIcon fontSize="small" color="secondary" />
                <Typography variant="body2" fontWeight="medium">
                  Sub-Agents ({asset.subAgents.length})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {asset.subAgents.map((agent, idx) => (
                  <Chip
                    key={idx}
                    label={agent}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Outgoing Relationships */}
      {asset.relationships.outgoing.length > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Outgoing Connections
          </Typography>
          <List dense sx={{ mb: 2 }}>
            {asset.relationships.outgoing.map((rel, idx) => (
              <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                <ArrowForwardIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText
                  primary={rel.target}
                  secondary={rel.type}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Incoming Relationships */}
      {asset.relationships.incoming.length > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Incoming Connections
          </Typography>
          <List dense>
            {asset.relationships.incoming.map((rel, idx) => (
              <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                <ArrowBackIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText
                  primary={rel.source}
                  secondary={rel.type}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

export default AssetDetails;
