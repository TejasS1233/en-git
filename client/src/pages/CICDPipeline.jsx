import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Settings,
  Download,
  Zap
} from 'lucide-react';
import PipelineDependencyGraph from '../components/CICD/PipelineDependencyGraph';
import BuildTimeAnalytics from '../components/CICD/BuildTimeAnalytics';
import CostOptimization from '../components/CICD/CostOptimization';
import FailurePatternDetection from '../components/CICD/FailurePatternDetection';
import WorkflowTemplateGenerator from '../components/CICD/WorkflowTemplateGenerator';

const CICDPipeline = () => {
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, this would come from API
  const mockPipelines = [
    {
      id: 'ci-pipeline',
      name: 'CI Pipeline',
      status: 'success',
      lastRun: '2024-01-15T10:30:00Z',
      duration: 420, // seconds
      cost: 2.45,
      successRate: 95.2,
      jobs: [
        { name: 'Lint & Format Check', status: 'success', duration: 45 },
        { name: 'Build Client', status: 'success', duration: 120 },
        { name: 'Build Server', status: 'success', duration: 90 },
        { name: 'Security Scan', status: 'success', duration: 180 },
        { name: 'Performance Test', status: 'success', duration: 300 },
        { name: 'Integration Test', status: 'success', duration: 240 }
      ]
    },
    {
      id: 'cd-pipeline',
      name: 'CD Pipeline',
      status: 'success',
      lastRun: '2024-01-15T11:15:00Z',
      duration: 180,
      cost: 1.20,
      successRate: 98.1,
      jobs: [
        { name: 'Deploy to Staging', status: 'success', duration: 90 },
        { name: 'Deploy to Production', status: 'success', duration: 90 }
      ]
    },
    {
      id: 'security-pipeline',
      name: 'Security Scan',
      status: 'running',
      lastRun: '2024-01-15T12:00:00Z',
      duration: 0,
      cost: 0.80,
      successRate: 92.3,
      jobs: [
        { name: 'Dependency Scan', status: 'running', duration: 0 },
        { name: 'Code Scan', status: 'pending', duration: 0 },
        { name: 'Container Scan', status: 'pending', duration: 0 },
        { name: 'License Check', status: 'pending', duration: 0 }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPipelines(mockPipelines);
      setSelectedPipeline(mockPipelines[0]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds) => {
    if (seconds === 0) return 'Running...';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const totalCost = pipelines.reduce((sum, pipeline) => sum + pipeline.cost, 0);
  const averageSuccessRate = pipelines.reduce((sum, pipeline) => sum + pipeline.successRate, 0) / pipelines.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading pipeline data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CI/CD Pipeline Management</h1>
          <p className="text-muted-foreground mt-2">
            Visualize, optimize, and manage your GitHub Actions workflows
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipelines</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelines.length}</div>
            <p className="text-xs text-muted-foreground">
              Active workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across all pipelines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(pipelines.reduce((sum, p) => sum + p.duration, 0) / pipelines.length / 60)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Average build time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline List */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Status</CardTitle>
          <CardDescription>
            Current status of all your CI/CD pipelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelines.map((pipeline) => (
              <div
                key={pipeline.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPipeline?.id === pipeline.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPipeline(pipeline)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(pipeline.status)}
                    <div>
                      <h3 className="font-semibold">{pipeline.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last run: {new Date(pipeline.lastRun).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(pipeline.status)}>
                      {pipeline.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDuration(pipeline.duration)}</p>
                      <p className="text-xs text-muted-foreground">${pipeline.cost}</p>
                    </div>
                  </div>
                </div>
                
                {/* Job Progress */}
                <div className="mt-3 space-y-2">
                  {pipeline.jobs.map((job, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        <span>{job.name}</span>
                      </span>
                      <span className="text-muted-foreground">
                        {job.duration > 0 ? `${Math.floor(job.duration / 60)}m ${job.duration % 60}s` : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      {selectedPipeline && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="cost">Cost</TabsTrigger>
            <TabsTrigger value="failures">Failures</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pipeline Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedPipeline.status)}>
                        {selectedPipeline.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{selectedPipeline.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Duration:</span>
                      <span className="font-medium">{formatDuration(selectedPipeline.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span className="font-medium">${selectedPipeline.cost}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Runs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>Run #{i}</span>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-800">Success</Badge>
                          <span className="text-muted-foreground">2m 30s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dependencies">
            <PipelineDependencyGraph pipeline={selectedPipeline} />
          </TabsContent>

          <TabsContent value="analytics">
            <BuildTimeAnalytics pipeline={selectedPipeline} />
          </TabsContent>

          <TabsContent value="cost">
            <CostOptimization pipeline={selectedPipeline} />
          </TabsContent>

          <TabsContent value="failures">
            <FailurePatternDetection pipeline={selectedPipeline} />
          </TabsContent>

          <TabsContent value="templates">
            <WorkflowTemplateGenerator pipeline={selectedPipeline} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CICDPipeline;
