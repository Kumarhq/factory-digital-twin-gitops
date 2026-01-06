import React from 'react';
import { Paper, Typography, Box, LinearProgress, Chip } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  DeviceHub as HubIcon,
} from '@mui/icons-material';

interface Stats {
  totalAssets: number;
  onlineAssets: number;
  errorAssets: number;
  uptimePercent: number;
  totalRelationships: number;
  assetTypes: string[];
  relationshipTypes: string[];
}

interface StatsPanelProps {
  stats: Stats;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        System Overview
      </Typography>

      {/* Uptime */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            System Uptime
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {stats.uptimePercent}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={stats.uptimePercent}
          color={stats.uptimePercent > 90 ? 'success' : stats.uptimePercent > 70 ? 'warning' : 'error'}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>

      {/* Asset Counts */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HubIcon fontSize="small" color="primary" />
            <Typography variant="body2">Total Assets</Typography>
          </Box>
          <Typography variant="h6">{stats.totalAssets}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon fontSize="small" color="success" />
            <Typography variant="body2">Online</Typography>
          </Box>
          <Typography variant="h6" color="success.main">
            {stats.onlineAssets}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorIcon fontSize="small" color="error" />
            <Typography variant="body2">Errors</Typography>
          </Box>
          <Typography variant="h6" color="error.main">
            {stats.errorAssets}
          </Typography>
        </Box>
      </Box>

      {/* Relationships */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Total Relationships
        </Typography>
        <Typography variant="h6">{stats.totalRelationships}</Typography>
      </Box>

      {/* Asset Types */}
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Asset Types ({stats.assetTypes.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {stats.assetTypes.slice(0, 10).map((type) => (
            <Chip key={type} label={type} size="small" variant="outlined" />
          ))}
          {stats.assetTypes.length > 10 && (
            <Chip label={`+${stats.assetTypes.length - 10} more`} size="small" />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default StatsPanel;
