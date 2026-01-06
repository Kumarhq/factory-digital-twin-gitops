import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Box } from '@mui/material';

interface GraphNode {
  id: string;
  name: string;
  type: string;
  status?: string;
  [key: string]: any;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  [key: string]: any;
}

interface GraphVisualizationProps {
  data: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  onNodeClick?: (nodeId: string) => void;
  height?: number;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  onNodeClick,
  height = 600,
}) => {
  const fgRef = useRef<any>();
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  // Node color based on type and status
  const getNodeColor = (node: GraphNode) => {
    // Status-based colors
    if (node.status === 'error' || node.status === 'offline') return '#ef4444';
    if (node.status === 'running' || node.status === 'online') return '#10b981';
    if (node.status === 'warning' || node.status === 'degraded') return '#f59e0b';

    // Type-based colors
    const typeColors: { [key: string]: string } = {
      PLC: '#3b82f6',
      Sensor: '#8b5cf6',
      Robot: '#ec4899',
      IndustrialRobot: '#ec4899',
      Cobot: '#f472b6',
      Conveyor: '#14b8a6',
      NetworkSwitch: '#06b6d4',
      Router: '#0891b2',
      Firewall: '#dc2626',
      Server: '#64748b',
      Storage: '#475569',
      KubernetesCluster: '#2563eb',
      KubernetesDeployment: '#3b82f6',
      UPS: '#f97316',
      HMI: '#a855f7',
      EdgeGateway: '#0d9488',
      Chiller: '#06b6d4',
      AirHandler: '#0ea5e9',
      BMS: '#0284c7',
    };

    return typeColors[node.type] || '#94a3b8';
  };

  // Node size based on type
  const getNodeSize = (node: GraphNode) => {
    const sizeMap: { [key: string]: number } = {
      PLC: 8,
      KubernetesCluster: 10,
      HyperconvergedCluster: 10,
      Server: 7,
      Sensor: 4,
      NetworkSwitch: 7,
      Router: 7,
    };

    return sizeMap[node.type] || 5;
  };

  // Handle node hover
  const handleNodeHover = (node: GraphNode | null) => {
    if (!node) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }

    // Highlight connected nodes and links
    const adjacentNodes = new Set([node.id]);
    const adjacentLinks = new Set();

    data.links.forEach((link: any) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source?.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target?.id;

      if (sourceId === node.id) {
        adjacentNodes.add(targetId);
        adjacentLinks.add(link);
      }
      if (targetId === node.id) {
        adjacentNodes.add(sourceId);
        adjacentLinks.add(link);
      }
    });

    setHighlightNodes(adjacentNodes);
    setHighlightLinks(adjacentLinks);
  };

  // Draw node with label and status indicator
  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    const nodeSize = getNodeSize(node);

    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.4);

    // Draw node circle with border
    ctx.fillStyle = getNodeColor(node);
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    // Draw status indicator dot
    if (node.status) {
      const dotSize = nodeSize * 0.3;
      const dotX = node.x + nodeSize * 0.6;
      const dotY = node.y - nodeSize * 0.6;

      let statusColor = '#94a3b8'; // default gray
      if (node.status === 'running' || node.status === 'online') statusColor = '#10b981';
      else if (node.status === 'error' || node.status === 'offline') statusColor = '#ef4444';
      else if (node.status === 'warning' || node.status === 'degraded') statusColor = '#f59e0b';

      // Draw white background for dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotSize + 1 / globalScale, 0, 2 * Math.PI);
      ctx.fill();

      // Draw status dot
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotSize, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw highlight ring if hovered
    if (highlightNodes.has(node.id)) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3 / globalScale;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize + 3, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw label with better contrast
    if (globalScale > 0.5) {
      // Draw label background with border
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1 / globalScale;

      const rectX = node.x - bckgDimensions[0] / 2;
      const rectY = node.y + nodeSize + 2;

      ctx.fillRect(rectX, rectY, bckgDimensions[0], bckgDimensions[1]);
      ctx.strokeRect(rectX, rectY, bckgDimensions[0], bckgDimensions[1]);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(label, node.x, node.y + nodeSize + 4);
    }
  };

  // Draw link with arrow and label
  const drawLink = (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHighlighted = highlightLinks.has(link);

    // Draw line
    ctx.strokeStyle = isHighlighted ? '#fbbf24' : '#cbd5e1';
    ctx.lineWidth = isHighlighted ? 2 / globalScale : 1 / globalScale;

    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.stroke();

    // Draw arrow
    const arrowLength = 8 / globalScale;
    const arrowAngle = Math.PI / 6;
    const angle = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x);

    ctx.beginPath();
    ctx.moveTo(link.target.x, link.target.y);
    ctx.lineTo(
      link.target.x - arrowLength * Math.cos(angle - arrowAngle),
      link.target.y - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(link.target.x, link.target.y);
    ctx.lineTo(
      link.target.x - arrowLength * Math.cos(angle + arrowAngle),
      link.target.y - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();

    // Draw relationship label if zoomed in
    if (globalScale > 1.5 && isHighlighted) {
      const label = link.type;
      const fontSize = 10 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;

      const midX = (link.source.x + link.target.x) / 2;
      const midY = (link.source.y + link.target.y) / 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(midX - textWidth / 2 - 2, midY - fontSize / 2 - 2, textWidth + 4, fontSize + 4);

      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, midX, midY);
    }
  };

  // Zoom to fit on data change
  useEffect(() => {
    if (fgRef.current && data.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
      }, 100);
    }
  }, [data]);

  return (
    <Box sx={{ width: '100%', height, border: '1px solid #e2e8f0', borderRadius: 1 }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeId="id"
        nodeLabel={(node: any) => {
          const statusColor = node.status === 'running' || node.status === 'online' ? '#10b981' :
                              node.status === 'error' || node.status === 'offline' ? '#ef4444' :
                              node.status === 'warning' || node.status === 'degraded' ? '#f59e0b' : '#94a3b8';
          return `
          <div style="background: #1e293b; color: #ffffff; padding: 12px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid #334155; max-width: 250px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #60a5fa;">${node.name}</div>
            <div style="font-size: 12px; line-height: 1.6;">
              <div><span style="color: #94a3b8;">Type:</span> <span style="color: #e2e8f0;">${node.type}</span></div>
              ${node.status ? `<div><span style="color: #94a3b8;">Status:</span> <span style="color: ${statusColor}; font-weight: 600;">●</span> <span style="color: #e2e8f0;">${node.status}</span></div>` : ''}
              ${node.ipAddress ? `<div><span style="color: #94a3b8;">IP:</span> <span style="color: #e2e8f0;">${node.ipAddress}</span></div>` : ''}
              ${node.currentValue ? `<div><span style="color: #94a3b8;">Value:</span> <span style="color: #e2e8f0;">${node.currentValue} ${node.unit || ''}</span></div>` : ''}
              ${node.manufacturer ? `<div><span style="color: #94a3b8;">Manufacturer:</span> <span style="color: #e2e8f0;">${node.manufacturer}</span></div>` : ''}
            </div>
          </div>
        `}}
        nodeCanvasObject={drawNode}
        linkCanvasObject={drawLink}
        linkDirectionalArrowLength={0} // We draw custom arrows
        onNodeClick={(node: any) => onNodeClick && onNodeClick(node.id)}
        onNodeHover={handleNodeHover}
        cooldownTicks={100}
        linkHoverPrecision={10}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        backgroundColor="#f8fafc"
      />

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          p: 1.5,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }}
            />
            <span style={{ fontSize: '0.75rem' }}>Online</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }}
            />
            <span style={{ fontSize: '0.75rem' }}>Error</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }}
            />
            <span style={{ fontSize: '0.75rem' }}>Warning</span>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GraphVisualization;
