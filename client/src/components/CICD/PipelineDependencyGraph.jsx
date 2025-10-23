import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Settings,
  Download
} from 'lucide-react';

const PipelineDependencyGraph = ({ pipeline }) => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('flow'); // 'flow' or 'timeline'

  // Mock dependency data
  const dependencies = {
    'ci-pipeline': {
      jobs: [
        { id: 'lint', name: 'Lint & Format Check', status: 'success', duration: 45, dependencies: [] },
        { id: 'build-client', name: 'Build Client', status: 'success', duration: 120, dependencies: ['lint'] },
        { id: 'build-server', name: 'Build Server', status: 'success', duration: 90, dependencies: ['lint'] },
        { id: 'security-scan', name: 'Security Scan', status: 'success', duration: 180, dependencies: ['build-client', 'build-server'] },
        { id: 'performance-test', name: 'Performance Test', status: 'success', duration: 300, dependencies: ['build-client', 'build-server'] },
        { id: 'integration-test', name: 'Integration Test', status: 'success', duration: 240, dependencies: ['build-client', 'build-server'] }
      ]
    },
    'cd-pipeline': {
      jobs: [
        { id: 'deploy-staging', name: 'Deploy to Staging', status: 'success', duration: 90, dependencies: ['ci-pipeline'] },
        { id: 'deploy-production', name: 'Deploy to Production', status: 'success', duration: 90, dependencies: ['deploy-staging'] }
      ]
    },
    'security-pipeline': {
      jobs: [
        { id: 'dependency-scan', name: 'Dependency Scan', status: 'running', duration: 0, dependencies: [] },
        { id: 'code-scan', name: 'Code Scan', status: 'pending', duration: 0, dependencies: ['dependency-scan'] },
        { id: 'container-scan', name: 'Container Scan', status: 'pending', duration: 0, dependencies: ['dependency-scan'] },
        { id: 'license-check', name: 'License Check', status: 'pending', duration: 0, dependencies: ['dependency-scan'] }
      ]
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'running':
        return '#3b82f6';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const drawGraph = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const width = 800;
    const height = 600;
    const nodeWidth = 120;
    const nodeHeight = 60;
    const padding = 20;

    svg.innerHTML = '';

    const pipelineData = dependencies[pipeline.id];
    if (!pipelineData) return;

    const jobs = pipelineData.jobs;
    const nodes = [];
    const edges = [];

    // Calculate node positions
    jobs.forEach((job, index) => {
      const x = padding + (index % 3) * (nodeWidth + 100);
      const y = padding + Math.floor(index / 3) * (nodeHeight + 80);
      
      nodes.push({
        ...job,
        x,
        y,
        width: nodeWidth,
        height: nodeHeight
      });
    });

    // Calculate edges
    jobs.forEach((job, index) => {
      job.dependencies.forEach(depId => {
        const sourceIndex = jobs.findIndex(j => j.id === depId);
        if (sourceIndex !== -1) {
          edges.push({
            from: sourceIndex,
            to: index
          });
        }
      });
    });

    // Draw edges
    edges.forEach(edge => {
      const source = nodes[edge.from];
      const target = nodes[edge.to];
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', source.x + source.width / 2);
      line.setAttribute('y1', source.y + source.height);
      line.setAttribute('x2', target.x + target.width / 2);
      line.setAttribute('y2', target.y);
      line.setAttribute('stroke', '#6b7280');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('marker-end', 'url(#arrowhead)');
      svg.appendChild(line);
    });

    // Draw nodes
    nodes.forEach((node, index) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(${node.x}, ${node.y})`);
      group.style.cursor = 'pointer';

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', node.width);
      rect.setAttribute('height', node.height);
      rect.setAttribute('rx', '8');
      rect.setAttribute('fill', getStatusColor(node.status));
      rect.setAttribute('stroke', '#374151');
      rect.setAttribute('stroke-width', '2');
      group.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.width / 2);
      text.setAttribute('y', node.height / 2 - 8);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.textContent = node.name;
      group.appendChild(text);

      const durationText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      durationText.setAttribute('x', node.width / 2);
      durationText.setAttribute('y', node.height / 2 + 8);
      durationText.setAttribute('text-anchor', 'middle');
      durationText.setAttribute('fill', 'white');
      durationText.setAttribute('font-size', '10');
      durationText.textContent = node.duration > 0 ? `${Math.floor(node.duration / 60)}m ${node.duration % 60}s` : 'Running...';
      group.appendChild(durationText);

      group.addEventListener('click', () => setSelectedNode(node));
      svg.appendChild(group);
    });

    // Add arrow marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#6b7280');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
  };

  useEffect(() => {
    drawGraph();
  }, [pipeline, viewMode]);

  const exportGraph = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `${pipeline.name}-dependency-graph.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pipeline Dependency Graph</CardTitle>
              <CardDescription>
                Visual representation of job dependencies and execution flow
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'flow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('flow')}
              >
                Flow View
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('timeline')}
              >
                Timeline View
              </Button>
              <Button variant="outline" size="sm" onClick={exportGraph}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <svg
              ref={svgRef}
              width="100%"
              height="600"
              viewBox="0 0 800 600"
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Success</span>
            </div>
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Running</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Failed</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{selectedNode.name}</h3>
                <Badge className={`${
                  selectedNode.status === 'success' ? 'bg-green-100 text-green-800' :
                  selectedNode.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  selectedNode.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedNode.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {selectedNode.duration > 0 ? `${Math.floor(selectedNode.duration / 60)}m ${selectedNode.duration % 60}s` : 'Running...'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dependencies</p>
                  <p className="font-medium">
                    {selectedNode.dependencies.length} job(s)
                  </p>
                </div>
              </div>

              {selectedNode.dependencies.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Depends on:</p>
                  <div className="space-y-1">
                    {selectedNode.dependencies.map((depId, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <ArrowRight className="h-3 w-3" />
                        <span>{depId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PipelineDependencyGraph;
