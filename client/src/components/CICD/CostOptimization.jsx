import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Download,
  Settings,
  Target,
  Clock,
  Cpu,
  HardDrive
} from 'lucide-react';

const CostOptimization = ({ pipeline }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOptimization, setSelectedOptimization] = useState(null);

  // Mock cost data
  const mockCostData = {
    '7d': {
      dailyCosts: [
        { date: '2024-01-09', cost: 2.45, builds: 8, minutes: 420 },
        { date: '2024-01-10', cost: 2.20, builds: 7, minutes: 380 },
        { date: '2024-01-11', cost: 2.80, builds: 9, minutes: 450 },
        { date: '2024-01-12', cost: 3.20, builds: 10, minutes: 520 },
        { date: '2024-01-13', cost: 2.60, builds: 8, minutes: 410 },
        { date: '2024-01-14', cost: 2.30, builds: 7, minutes: 390 },
        { date: '2024-01-15', cost: 2.45, builds: 8, minutes: 420 }
      ],
      costBreakdown: [
        { category: 'Compute (Linux)', cost: 8.50, percentage: 45 },
        { category: 'Compute (Windows)', cost: 6.20, percentage: 33 },
        { category: 'Storage', cost: 2.80, percentage: 15 },
        { category: 'Network', cost: 1.20, percentage: 7 }
      ],
      jobCosts: [
        { name: 'Lint & Format Check', cost: 0.45, duration: 45, efficiency: 85 },
        { name: 'Build Client', cost: 1.20, duration: 120, efficiency: 78 },
        { name: 'Build Server', cost: 0.90, duration: 90, efficiency: 82 },
        { name: 'Security Scan', cost: 1.80, duration: 180, efficiency: 65 },
        { name: 'Performance Test', cost: 3.00, duration: 300, efficiency: 70 },
        { name: 'Integration Test', cost: 2.40, duration: 240, efficiency: 75 }
      ],
      optimizations: [
        {
          id: 'parallel-jobs',
          title: 'Parallel Job Execution',
          description: 'Run independent jobs in parallel to reduce total execution time',
          potentialSavings: 1.20,
          implementationEffort: 'Low',
          impact: 'High',
          status: 'available'
        },
        {
          id: 'cache-optimization',
          title: 'Enhanced Caching Strategy',
          description: 'Implement multi-level caching for dependencies and build artifacts',
          potentialSavings: 0.80,
          implementationEffort: 'Medium',
          impact: 'Medium',
          status: 'available'
        },
        {
          id: 'resource-rightsizing',
          title: 'Resource Right-sizing',
          description: 'Optimize runner specifications based on actual resource usage',
          potentialSavings: 1.50,
          implementationEffort: 'Low',
          impact: 'High',
          status: 'available'
        },
        {
          id: 'scheduled-builds',
          title: 'Scheduled Build Optimization',
          description: 'Move non-critical builds to off-peak hours for better pricing',
          potentialSavings: 0.60,
          implementationEffort: 'Low',
          impact: 'Medium',
          status: 'in-progress'
        },
        {
          id: 'conditional-execution',
          title: 'Conditional Job Execution',
          description: 'Skip jobs when no relevant changes are detected',
          potentialSavings: 2.10,
          implementationEffort: 'High',
          impact: 'High',
          status: 'available'
        }
      ]
    },
    '30d': {
      dailyCosts: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cost: 1.5 + Math.random() * 2,
        builds: 5 + Math.floor(Math.random() * 10),
        minutes: 200 + Math.random() * 400
      })),
      costBreakdown: [
        { category: 'Compute (Linux)', cost: 45.20, percentage: 48 },
        { category: 'Compute (Windows)', cost: 32.80, percentage: 35 },
        { category: 'Storage', cost: 12.40, percentage: 13 },
        { category: 'Network', cost: 3.60, percentage: 4 }
      ],
      jobCosts: [
        { name: 'Lint & Format Check', cost: 8.50, duration: 45, efficiency: 85 },
        { name: 'Build Client', cost: 22.40, duration: 120, efficiency: 78 },
        { name: 'Build Server', cost: 16.80, duration: 90, efficiency: 82 },
        { name: 'Security Scan', cost: 33.60, duration: 180, efficiency: 65 },
        { name: 'Performance Test', cost: 56.00, duration: 300, efficiency: 70 },
        { name: 'Integration Test', cost: 44.80, duration: 240, efficiency: 75 }
      ],
      optimizations: [
        {
          id: 'parallel-jobs',
          title: 'Parallel Job Execution',
          description: 'Run independent jobs in parallel to reduce total execution time',
          potentialSavings: 15.20,
          implementationEffort: 'Low',
          impact: 'High',
          status: 'available'
        },
        {
          id: 'cache-optimization',
          title: 'Enhanced Caching Strategy',
          description: 'Implement multi-level caching for dependencies and build artifacts',
          potentialSavings: 9.80,
          implementationEffort: 'Medium',
          impact: 'Medium',
          status: 'available'
        },
        {
          id: 'resource-rightsizing',
          title: 'Resource Right-sizing',
          description: 'Optimize runner specifications based on actual resource usage',
          potentialSavings: 18.50,
          implementationEffort: 'Low',
          impact: 'High',
          status: 'available'
        },
        {
          id: 'scheduled-builds',
          title: 'Scheduled Build Optimization',
          description: 'Move non-critical builds to off-peak hours for better pricing',
          potentialSavings: 7.60,
          implementationEffort: 'Low',
          impact: 'Medium',
          status: 'in-progress'
        },
        {
          id: 'conditional-execution',
          title: 'Conditional Job Execution',
          description: 'Skip jobs when no relevant changes are detected',
          potentialSavings: 25.10,
          implementationEffort: 'High',
          impact: 'High',
          status: 'available'
        }
      ]
    },
    '90d': {
      dailyCosts: Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cost: 1.2 + Math.random() * 2.5,
        builds: 4 + Math.floor(Math.random() * 12),
        minutes: 150 + Math.random() * 500
      })),
      costBreakdown: [
        { category: 'Compute (Linux)', cost: 128.50, percentage: 50 },
        { category: 'Compute (Windows)', cost: 89.20, percentage: 35 },
        { category: 'Storage', cost: 25.60, percentage: 10 },
        { category: 'Network', cost: 12.80, percentage: 5 }
      ],
      jobCosts: [
        { name: 'Lint & Format Check', cost: 24.50, duration: 45, efficiency: 85 },
        { name: 'Build Client', cost: 64.80, duration: 120, efficiency: 78 },
        { name: 'Build Server', cost: 48.60, duration: 90, efficiency: 82 },
        { name: 'Security Scan', cost: 97.20, duration: 180, efficiency: 65 },
        { name: 'Performance Test', cost: 162.00, duration: 300, efficiency: 70 },
        { name: 'Integration Test', cost: 129.60, duration: 240, efficiency: 75 }
      ],
      optimizations: [
        {
          id: 'parallel-jobs',
          title: 'Parallel Job Execution',
          description: 'Run independent jobs in parallel to reduce total execution time',
          potentialSavings: 45.20,
          implementationEffort: 'Low',
          impact: 'High',
          status: 'available'
        },
        {
          id: 'cache-optimization',
          title: 'Enhanced Caching Strategy',
          description: 'Implement multi-level caching for dependencies and build artifacts',
          potentialSavings: 28.80,
          implementationEffort: 'Medium',
          impact: 'Medium',
          status: 'available'
        },
        {
          id: 'resource-rightsizing',
          title: 'Resource Right-sizing',
          description: 'Optimize runner specifications based on actual resource usage',
          potentialSavings: 52.50,
          implementationEffort: 'Low',
          impact: 'High',
          status: 'available'
        },
        {
          id: 'scheduled-builds',
          title: 'Scheduled Build Optimization',
          description: 'Move non-critical builds to off-peak hours for better pricing',
          potentialSavings: 21.60,
          implementationEffort: 'Low',
          impact: 'Medium',
          status: 'in-progress'
        },
        {
          id: 'conditional-execution',
          title: 'Conditional Job Execution',
          description: 'Skip jobs when no relevant changes are detected',
          potentialSavings: 72.10,
          implementationEffort: 'High',
          impact: 'High',
          status: 'available'
        }
      ]
    }
  };

  const currentData = mockCostData[timeRange];
  const totalCost = currentData.dailyCosts.reduce((sum, day) => sum + day.cost, 0);
  const avgDailyCost = totalCost / currentData.dailyCosts.length;
  const totalPotentialSavings = currentData.optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0);
  const costTrend = currentData.dailyCosts.length > 1 ? 
    ((currentData.dailyCosts[currentData.dailyCosts.length - 1].cost - currentData.dailyCosts[0].cost) / currentData.dailyCosts[0].cost) * 100 : 0;

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOptimizationSelect = (optimization) => {
    setSelectedOptimization(optimization);
  };

  const applyOptimization = (optimizationId) => {
    // In a real app, this would trigger the optimization
    console.log(`Applying optimization: ${optimizationId}`);
    // Update the optimization status
    setSelectedOptimization(null);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cost Optimization Analysis</CardTitle>
              <CardDescription>
                Detailed cost analysis and optimization recommendations
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={timeRange === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('7d')}
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('30d')}
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('90d')}
              >
                90 Days
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {costTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              {Math.abs(costTrend).toFixed(1)}% vs previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily Cost</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgDailyCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per day average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPotentialSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              With optimizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Potential</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalPotentialSavings / totalCost) * 100).toFixed(1)}%
            </div>
            <Progress value={(totalPotentialSavings / totalCost) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Cost Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Trend Over Time</CardTitle>
          <CardDescription>
            Daily cost breakdown with build count and duration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={currentData.dailyCosts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="cost" orientation="left" />
              <YAxis yAxisId="builds" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'cost' ? `$${value.toFixed(2)}` : value,
                  name === 'cost' ? 'Cost' : 'Builds'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                yAxisId="cost"
                type="monotone"
                dataKey="cost"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Breakdown and Job Costs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown by Category</CardTitle>
            <CardDescription>
              Distribution of costs across different resource types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={currentData.costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="cost"
                >
                  {currentData.costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {currentData.costBreakdown.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: `hsl(${index * 90}, 70%, 50%)` }}
                    />
                    <span className="text-sm">{category.category}</span>
                  </div>
                  <div className="text-sm font-medium">
                    ${category.cost.toFixed(2)} ({category.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Cost Analysis</CardTitle>
            <CardDescription>
              Cost and efficiency for each pipeline job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.jobCosts.map((job, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{job.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">${job.cost.toFixed(2)}</Badge>
                      <Badge className={job.efficiency > 80 ? 'bg-green-100 text-green-800' : 
                                     job.efficiency > 60 ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-red-100 text-red-800'}>
                        {job.efficiency}% efficient
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Duration: {Math.floor(job.duration / 60)}m {job.duration % 60}s</span>
                      <span>Cost per minute: ${(job.cost / (job.duration / 60)).toFixed(3)}</span>
                    </div>
                    <Progress value={job.efficiency} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
          <CardDescription>
            AI-powered cost optimization suggestions with potential savings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentData.optimizations.map((optimization, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOptimization?.id === optimization.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleOptimizationSelect(optimization)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{optimization.title}</h4>
                      <Badge className={getStatusColor(optimization.status)}>
                        {optimization.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {optimization.description}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          Save ${optimization.potentialSavings.toFixed(2)}
                        </span>
                      </div>
                      <Badge className={getEffortColor(optimization.implementationEffort)}>
                        {optimization.implementationEffort} effort
                      </Badge>
                      <Badge className={getImpactColor(optimization.impact)}>
                        {optimization.impact} impact
                      </Badge>
                    </div>
                  </div>
                  {optimization.status === 'available' && (
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        applyOptimization(optimization.id);
                      }}
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Optimization Details */}
      {selectedOptimization && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Details</CardTitle>
            <CardDescription>
              Detailed implementation guide for {selectedOptimization.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedOptimization.potentialSavings.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Implementation Effort</p>
                  <p className="text-lg font-semibold">{selectedOptimization.implementationEffort}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impact Level</p>
                  <p className="text-lg font-semibold">{selectedOptimization.impact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedOptimization.status)}>
                    {selectedOptimization.status}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Implementation Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Analyze current resource usage patterns</li>
                  <li>Configure parallel execution in workflow files</li>
                  <li>Update job dependencies and conditions</li>
                  <li>Test optimization in staging environment</li>
                  <li>Monitor performance and cost impact</li>
                </ol>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => applyOptimization(selectedOptimization.id)}>
                  Apply Optimization
                </Button>
                <Button variant="outline" onClick={() => setSelectedOptimization(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CostOptimization;
