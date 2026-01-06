import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Typography,
  IconButton,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Stack,
  Badge,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  ViewModule as CardViewIcon,
  TableChart as TableViewIcon,
  AccountTree as GraphViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
  ViewInAr as ThreeDIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';
import GraphView from './views/GraphView';
import TableView from './views/TableView';
import CardGridView from './views/CardGridView';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Asset {
  id: string;
  name: string;
  type: string;
  status: string;
  location?: string;
  securityZone?: string;
  properties?: { [key: string]: any };
  matterportSpaceId?: string;
}

interface GraphData {
  nodes: any[];
  links: any[];
  assets?: Asset[];
}

type ViewMode = 'graph' | 'table' | 'cards';

interface AssetExplorerProps {
  onQuickRCA?: (asset: any) => void;
}

const AssetExplorer: React.FC<AssetExplorerProps> = ({ onQuickRCA }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  // Asset categories for filtering
  const categories = [
    { id: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
    { id: 'infrastructure', label: 'Infrastructure', icon: '🏢' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'data', label: 'Data Pipeline', icon: '📊' },
    { id: 'iot', label: 'IoT/Sensors', icon: '📡' },
  ];

  const statuses = ['online', 'offline', 'warning', 'degraded', 'error'];
  const zones = ['Level 0 - Process', 'Level 1 - Control', 'Level 2 - Supervisory', 'Level 3 - Operations', 'Level 4 - Enterprise'];

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/graph`, {
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        search: searchQuery || undefined,
      });

      setGraphData(response.data);

      // Extract unique asset types for filter
      const types = new Set<string>();
      response.data.nodes?.forEach((node: any) => {
        if (node.type) types.add(node.type);
      });
      setAvailableTypes(Array.from(types).sort());
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchGraphData();
    setFilterDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedCategories([]);
    setSelectedZones([]);
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    return (
      selectedTypes.length +
      selectedStatuses.length +
      selectedCategories.length +
      selectedZones.length +
      (searchQuery ? 1 : 0)
    );
  };

  const getCategoryAssetTypes = (categoryId: string): string[] => {
    const categoryMap: { [key: string]: string[] } = {
      manufacturing: ['PLC', 'Robot', 'IndustrialRobot', 'Cobot', 'HMI', 'CNC', 'Lathe', 'Press', 'Conveyor'],
      infrastructure: ['Server', 'Storage', 'UPS', 'Chiller', 'AirHandler', 'BMS', 'HVAC'],
      network: ['NetworkSwitch', 'Router', 'Firewall', 'AccessPoint', 'Gateway'],
      data: ['KafkaBroker', 'RedisCache', 'PostgreSQL', 'TimescaleDB', 'KubernetesCluster', 'KubernetesDeployment'],
      iot: ['Sensor', 'EdgeGateway', 'IoTDevice', 'Camera', 'RFID'],
    };
    return categoryMap[categoryId] || [];
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Remove category
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId));
      const typesToRemove = getCategoryAssetTypes(categoryId);
      setSelectedTypes(selectedTypes.filter(t => !typesToRemove.includes(t)));
    } else {
      // Add category
      setSelectedCategories([...selectedCategories, categoryId]);
      const typesToAdd = getCategoryAssetTypes(categoryId);
      setSelectedTypes([...new Set([...selectedTypes, ...typesToAdd])]);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/graph/export`, {
        types: selectedTypes,
        search: searchQuery,
      }, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assets-export-${new Date().toISOString()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Toolbar */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {/* Search */}
          <TextField
            placeholder="Search assets by name, ID, or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchGraphData()}
            size="small"
            sx={{ minWidth: 300, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="graph">
              <Tooltip title="Graph View">
                <GraphViewIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="cards">
              <Tooltip title="Card View">
                <CardViewIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="table">
              <Tooltip title="Table View">
                <TableViewIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Filter Button */}
          <Tooltip title="Filters">
            <IconButton onClick={() => setFilterDrawerOpen(true)} color="primary">
              <Badge badgeContent={getActiveFilterCount()} color="error">
                <FilterIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Refresh Button */}
          <Tooltip title="Refresh">
            <IconButton onClick={fetchGraphData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {/* Export Button */}
          <Tooltip title="Export Data">
            <IconButton onClick={handleExport}>
              <ExportIcon />
            </IconButton>
          </Tooltip>

          {/* 3D View Link */}
          <Tooltip title="Open 3D Factory Tour">
            <IconButton color="secondary">
              <ThreeDIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Active Filter Chips */}
        {getActiveFilterCount() > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
            {searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                onDelete={() => setSearchQuery('')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {selectedCategories.map((cat) => {
              const category = categories.find(c => c.id === cat);
              return (
                <Chip
                  key={cat}
                  label={`${category?.icon} ${category?.label}`}
                  onDelete={() => handleCategoryToggle(cat)}
                  size="small"
                  color="secondary"
                />
              );
            })}
            {selectedStatuses.map((status) => (
              <Chip
                key={status}
                label={`Status: ${status}`}
                onDelete={() => setSelectedStatuses(selectedStatuses.filter(s => s !== status))}
                size="small"
                color="info"
              />
            ))}
            <Button
              size="small"
              onClick={handleClearFilters}
              sx={{ ml: 1 }}
            >
              Clear All
            </Button>
          </Stack>
        )}
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {viewMode === 'graph' && (
          <GraphView
            data={graphData}
            loading={loading}
            onNodeClick={setSelectedAsset}
            selectedAsset={selectedAsset}
            onQuickRCA={onQuickRCA}
          />
        )}
        {viewMode === 'table' && (
          <TableView
            data={graphData}
            loading={loading}
            onRowClick={setSelectedAsset}
            onQuickRCA={onQuickRCA}
          />
        )}
        {viewMode === 'cards' && (
          <CardGridView
            data={graphData}
            loading={loading}
            onCardClick={setSelectedAsset}
            onQuickRCA={onQuickRCA}
          />
        )}
      </Box>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 360, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Category Filters */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Asset Categories
          </Typography>
          <Stack spacing={1} sx={{ mb: 3 }}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={`${category.icon} ${category.label}`}
                onClick={() => handleCategoryToggle(category.id)}
                color={selectedCategories.includes(category.id) ? 'primary' : 'default'}
                variant={selectedCategories.includes(category.id) ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>

          {/* Asset Type Filter */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Asset Types</InputLabel>
            <Select
              multiple
              value={selectedTypes}
              onChange={(e) => setSelectedTypes(e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  <Checkbox checked={selectedTypes.indexOf(type) > -1} />
                  <ListItemText primary={type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              value={selectedStatuses}
              onChange={(e) => setSelectedStatuses(e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  <Checkbox checked={selectedStatuses.indexOf(status) > -1} />
                  <ListItemText primary={status} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ISA-95 Zone Filter */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Security Zone (ISA-95)</InputLabel>
            <Select
              multiple
              value={selectedZones}
              onChange={(e) => setSelectedZones(e.target.value as string[])}
              renderValue={(selected) => `${selected.length} zone(s) selected`}
            >
              {zones.map((zone) => (
                <MenuItem key={zone} value={zone}>
                  <Checkbox checked={selectedZones.indexOf(zone) > -1} />
                  <ListItemText primary={zone} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Action Buttons */}
          <Stack spacing={2}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              fullWidth
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              fullWidth
            >
              Clear All Filters
            </Button>
          </Stack>

          {/* Filter Summary */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="caption">
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
            </Typography>
          </Alert>
        </Box>
      </Drawer>
    </Box>
  );
};

export default AssetExplorer;
