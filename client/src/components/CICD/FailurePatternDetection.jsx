import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Bug,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';

const FailurePatternDetection = ({ pipeline }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock failure data
  const mockFailureData = {
    '7d': {
      failureTrend: [
        { date: '2024-01-09', failures: 2, total: 8, rate: 25.0 },
        { date: '2024-01-10', failures: 1, total: 7, rate: 14.3 },
        { date: '2024-01-11', failures: 3, total: 9, rate: 33.3 },
        { date: '2024-01-12', failures: 4, total: 10, rate: 40.0 },
        { date: '2024-01-13', failures: 1, total: 8, rate: 12.5 },
        { date: '2024-01-14', failures: 2, total: 7, rate: 28.6 },
        { date: '2024-01-15', failures: 1, total: 8, rate: 12.5 }
      ],
      failurePatterns: [
        {
          id: 'timeout-pattern',
          title: 'Timeout Failures',
          description: 'Jobs failing due to timeout issues',
          frequency: 8,
          severity: 'High',
          trend: 'increasing',
          affectedJobs: ['Build Client', 'Performance Test'],
          commonCauses: ['Resource constraints', 'Network issues', 'Large dependencies'],
          lastOccurrence: '2024-01-15T14:30:00Z',
          confidence: 85
        },
        {
          id: 'dependency-pattern',
          title: 'Dependency Resolution Failures',
          description: 'Package installation and dependency conflicts',
          frequency: 5,
          severity: 'Medium',
          trend: 'stable',
          affectedJobs: ['Lint & Format Check', 'Build Server'],
          commonCauses: ['Version conflicts', 'Network timeouts', 'Registry issues'],
          lastOccurrence: '2024-01-14T09:15:00Z',
          confidence: 92
        },
        {
          id: 'test-pattern',
          title: 'Test Suite Failures',
          description: 'Unit and integration test failures',
          frequency: 3,
          severity: 'Low',
          trend: 'decreasing',
          affectedJobs: ['Integration Test'],
          commonCauses: ['Flaky tests', 'Environment differences', 'Data issues'],
          lastOccurrence: '2024-01-13T16:45:00Z',
          confidence: 78
        }
      ],
      failureReasons: [
        { reason: 'Timeout', count: 8, percentage: 40 },
        { reason: 'Dependency Error', count: 5, percentage: 25 },
        { reason: 'Test Failure', count: 3, percentage: 15 },
        { reason: 'Resource Limit', count: 2, percentage: 10 },
        { reason: 'Network Error', count: 2, percentage: 10 }
      ],
      hourlyFailures: [
        { hour: '00:00', failures: 1 },
        { hour: '02:00', failures: 0 },
        { hour: '04:00', failures: 0 },
        { hour: '06:00', failures: 2 },
        { hour: '08:00', failures: 3 },
        { hour: '10:00', failures: 4 },
        { hour: '12:00', failures: 5 },
        { hour: '14:00', failures: 6 },
        { hour: '16:00', failures: 4 },
        { hour: '18:00', failures: 3 },
        { hour: '20:00', failures: 2 },
        { hour: '22:00', failures: 1 }
      ],
      recentFailures: [
        {
          id: 'fail-001',
          timestamp: '2024-01-15T14:30:00Z',
          job: 'Build Client',
          reason: 'Timeout',
          duration: 300,
          status: 'resolved',
          details: 'Job exceeded maximum execution time of 5 minutes'
        },
        {
          id: 'fail-002',
          timestamp: '2024-01-15T12:15:00Z',
          job: 'Performance Test',
          reason: 'Resource Limit',
          duration: 180,
          status: 'investigating',
          details: 'Insufficient memory allocation for test execution'
        },
        {
          id: 'fail-003',
          timestamp: '2024-01-14T09:15:00Z',
          job: 'Lint & Format Check',
          reason: 'Dependency Error',
          duration: 45,
          status: 'resolved',
          details: 'npm install failed due to package version conflict'
        }
      ]
    },
    '30d': {
      failureTrend: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        failures: Math.floor(Math.random() * 5),
        total: 5 + Math.floor(Math.random() * 10),
        rate: Math.random() * 50
      })),
      failurePatterns: [
        {
          id: 'timeout-pattern',
          title: 'Timeout Failures',
          description: 'Jobs failing due to timeout issues',
          frequency: 25,
          severity: 'High',
          trend: 'increasing',
          affectedJobs: ['Build Client', 'Performance Test', 'Integration Test'],
          commonCauses: ['Resource constraints', 'Network issues', 'Large dependencies'],
          lastOccurrence: '2024-01-15T14:30:00Z',
          confidence: 88
        },
        {
          id: 'dependency-pattern',
          title: 'Dependency Resolution Failures',
          description: 'Package installation and dependency conflicts',
          frequency: 18,
          severity: 'Medium',
          trend: 'stable',
          affectedJobs: ['Lint & Format Check', 'Build Server'],
          commonCauses: ['Version conflicts', 'Network timeouts', 'Registry issues'],
          lastOccurrence: '2024-01-14T09:15:00Z',
          confidence: 95
        },
        {
          id: 'test-pattern',
          title: 'Test Suite Failures',
          description: 'Unit and integration test failures',
          frequency: 12,
          severity: 'Low',
          trend: 'decreasing',
          affectedJobs: ['Integration Test'],
          commonCauses: ['Flaky tests', 'Environment differences', 'Data issues'],
          lastOccurrence: '2024-01-13T16:45:00Z',
          confidence: 82
        },
        {
          id: 'resource-pattern',
          title: 'Resource Exhaustion',
          description: 'Jobs failing due to insufficient resources',
          frequency: 8,
          severity: 'High',
          trend: 'increasing',
          affectedJobs: ['Security Scan', 'Performance Test'],
          commonCauses: ['Memory limits', 'CPU constraints', 'Disk space'],
          lastOccurrence: '2024-01-12T11:20:00Z',
          confidence: 76
        }
      ],
      failureReasons: [
        { reason: 'Timeout', count: 25, percentage: 35 },
        { reason: 'Dependency Error', count: 18, percentage: 25 },
        { reason: 'Resource Limit', count: 12, percentage: 17 },
        { reason: 'Test Failure', count: 10, percentage: 14 },
        { reason: 'Network Error', count: 7, percentage: 9 }
      ],
      hourlyFailures: [
        { hour: '00:00', failures: 5 },
        { hour: '02:00', failures: 3 },
        { hour: '04:00', failures: 2 },
        { hour: '06:00', failures: 8 },
        { hour: '08:00', failures: 15 },
        { hour: '10:00', failures: 22 },
        { hour: '12:00', failures: 28 },
        { hour: '14:00', failures: 32 },
        { hour: '16:00', failures: 25 },
        { hour: '18:00', failures: 18 },
        { hour: '20:00', failures: 12 },
        { hour: '22:00', failures: 8 }
      ],
      recentFailures: Array.from({ length: 20 }, (_, i) => ({
        id: `fail-${String(i + 1).padStart(3, '0')}`,
        timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
        job: ['Build Client', 'Build Server', 'Security Scan', 'Performance Test', 'Integration Test'][Math.floor(Math.random() * 5)],
        reason: ['Timeout', 'Dependency Error', 'Resource Limit', 'Test Failure', 'Network Error'][Math.floor(Math.random() * 5)],
        duration: 60 + Math.random() * 300,
        status: ['resolved', 'investigating', 'open'][Math.floor(Math.random() * 3)],
        details: 'Sample failure description'
      }))
    },
    '90d': {
      failureTrend: Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        failures: Math.floor(Math.random() * 8),
        total: 4 + Math.floor(Math.random() * 15),
        rate: Math.random() * 60
      })),
      failurePatterns: [
        {
          id: 'timeout-pattern',
          title: 'Timeout Failures',
          description: 'Jobs failing due to timeout issues',
          frequency: 68,
          severity: 'High',
          trend: 'increasing',
          affectedJobs: ['Build Client', 'Performance Test', 'Integration Test'],
          commonCauses: ['Resource constraints', 'Network issues', 'Large dependencies'],
          lastOccurrence: '2024-01-15T14:30:00Z',
          confidence: 91
        },
        {
          id: 'dependency-pattern',
          title: 'Dependency Resolution Failures',
          description: 'Package installation and dependency conflicts',
          frequency: 45,
          severity: 'Medium',
          trend: 'stable',
          affectedJobs: ['Lint & Format Check', 'Build Server'],
          commonCauses: ['Version conflicts', 'Network timeouts', 'Registry issues'],
          lastOccurrence: '2024-01-14T09:15:00Z',
          confidence: 96
        },
        {
          id: 'test-pattern',
          title: 'Test Suite Failures',
          description: 'Unit and integration test failures',
          frequency: 32,
          severity: 'Low',
          trend: 'decreasing',
          affectedJobs: ['Integration Test'],
          commonCauses: ['Flaky tests', 'Environment differences', 'Data issues'],
          lastOccurrence: '2024-01-13T16:45:00Z',
          confidence: 85
        },
        {
          id: 'resource-pattern',
          title: 'Resource Exhaustion',
          description: 'Jobs failing due to insufficient resources',
          frequency: 28,
          severity: 'High',
          trend: 'increasing',
          affectedJobs: ['Security Scan', 'Performance Test'],
          commonCauses: ['Memory limits', 'CPU constraints', 'Disk space'],
          lastOccurrence: '2024-01-12T11:20:00Z',
          confidence: 79
        },
        {
          id: 'network-pattern',
          title: 'Network Connectivity Issues',
          description: 'Jobs failing due to network timeouts and connectivity problems',
          frequency: 15,
          severity: 'Medium',
          trend: 'stable',
          affectedJobs: ['Security Scan', 'Dependency Scan'],
          commonCauses: ['DNS issues', 'Proxy problems', 'Rate limiting'],
          lastOccurrence: '2024-01-10T08:30:00Z',
          confidence: 73
        }
      ],
      failureReasons: [
        { reason: 'Timeout', count: 68, percentage: 38 },
        { reason: 'Dependency Error', count: 45, percentage: 25 },
        { reason: 'Resource Limit', count: 28, percentage: 16 },
        { reason: 'Test Failure', count: 32, percentage: 18 },
        { reason: 'Network Error', count: 15, percentage: 8 }
      ],
      hourlyFailures: [
        { hour: '00:00', failures: 12 },
        { hour: '02:00', failures: 8 },
        { hour: '04:00', failures: 6 },
        { hour: '06:00', failures: 22 },
        { hour: '08:00', failures: 45 },
        { hour: '10:00', failures: 68 },
        { hour: '12:00', failures: 85 },
        { hour: '14:00', failures: 92 },
        { hour: '16:00', failures: 75 },
        { hour: '18:00', failures: 52 },
        { hour: '20:00', failures: 35 },
        { hour: '22:00', failures: 18 }
      ],
      recentFailures: Array.from({ length: 50 }, (_, i) => ({
        id: `fail-${String(i + 1).padStart(3, '0')}`,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        job: ['Build Client', 'Build Server', 'Security Scan', 'Performance Test', 'Integration Test'][Math.floor(Math.random() * 5)],
        reason: ['Timeout', 'Dependency Error', 'Resource Limit', 'Test Failure', 'Network Error'][Math.floor(Math.random() * 5)],
        duration: 60 + Math.random() * 300,
        status: ['resolved', 'investigating', 'open'][Math.floor(Math.random() * 3)],
        details: 'Sample failure description'
      }))
    }
  };

  const currentData = mockFailureData[timeRange];
  const totalFailures = currentData.failureTrend.reduce((sum, day) => sum + day.failures, 0);
  const totalBuilds = currentData.failureTrend.reduce((sum, day) => sum + day.total, 0);
  const failureRate = (totalFailures / totalBuilds) * 100;
  const avgFailureRate = currentData.failureTrend.reduce((sum, day) => sum + day.rate, 0) / currentData.failureTrend.length;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'open': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFailures = currentData.recentFailures.filter(failure => 
    filterStatus === 'all' || failure.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Failure Pattern Detection</CardTitle>
              <CardDescription>
                AI-powered analysis of failure patterns and root causes
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
            <CardTitle className="text-sm font-medium">Total Failures</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFailures}</div>
            <p className="text-xs text-muted-foreground">
              In the last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failureRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average: {avgFailureRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patterns Detected</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.failurePatterns.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique patterns identified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentData.failurePatterns.filter(p => p.severity === 'High').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Critical patterns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Failure Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Failure Trend Over Time</CardTitle>
          <CardDescription>
            Daily failure count and rate analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData.failureTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="failures" orientation="left" />
              <YAxis yAxisId="rate" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'failures' ? value : `${value.toFixed(1)}%`,
                  name === 'failures' ? 'Failures' : 'Failure Rate'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                yAxisId="failures"
                type="monotone"
                dataKey="failures"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
              />
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="rate"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Failure Patterns and Reasons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detected Failure Patterns</CardTitle>
            <CardDescription>
              AI-identified patterns with confidence scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.failurePatterns.map((pattern, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPattern?.id === pattern.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPattern(pattern)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{pattern.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(pattern.severity)}>
                        {pattern.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {pattern.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {pattern.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(pattern.trend)}
                        <span className="text-sm capitalize">{pattern.trend}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {pattern.frequency} occurrences
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failure Reasons Distribution</CardTitle>
            <CardDescription>
              Breakdown of failure causes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={currentData.failureReasons}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {currentData.failureReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 72}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {currentData.failureReasons.map((reason, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: `hsl(${index * 72}, 70%, 50%)` }}
                    />
                    <span className="text-sm">{reason.reason}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {reason.count} ({reason.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Failure Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Failure Distribution by Hour</CardTitle>
          <CardDescription>
            When failures are most likely to occur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={currentData.hourlyFailures}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="failures" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Failures */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Failures</CardTitle>
              <CardDescription>
                Latest failure incidents and their status
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('open')}
              >
                Open
              </Button>
              <Button
                variant={filterStatus === 'investigating' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('investigating')}
              >
                Investigating
              </Button>
              <Button
                variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('resolved')}
              >
                Resolved
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredFailures.slice(0, 10).map((failure, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{failure.job}</span>
                  </div>
                  <Badge variant="outline">{failure.reason}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(failure.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">
                    {Math.floor(failure.duration / 60)}m {failure.duration % 60}s
                  </span>
                  <Badge className={getStatusColor(failure.status)}>
                    {failure.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Pattern Details */}
      {selectedPattern && (
        <Card>
          <CardHeader>
            <CardTitle>Pattern Analysis: {selectedPattern.title}</CardTitle>
            <CardDescription>
              Detailed analysis and recommended actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="text-2xl font-bold">{selectedPattern.frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Severity</p>
                  <Badge className={getSeverityColor(selectedPattern.severity)}>
                    {selectedPattern.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(selectedPattern.trend)}
                    <span className="capitalize">{selectedPattern.trend}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-lg font-semibold">{selectedPattern.confidence}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Affected Jobs:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPattern.affectedJobs.map((job, index) => (
                    <Badge key={index} variant="outline">{job}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Common Causes:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {selectedPattern.commonCauses.map((cause, index) => (
                    <li key={index}>{cause}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Recommended Actions:</h4>
                <ul className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                  <li>Increase timeout limits for affected jobs</li>
                  <li>Implement retry logic with exponential backoff</li>
                  <li>Add resource monitoring and alerts</li>
                  <li>Consider parallel execution for independent tasks</li>
                  <li>Review and optimize dependency management</li>
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button>
                  Create Alert Rule
                </Button>
                <Button variant="outline">
                  Generate Fix PR
                </Button>
                <Button variant="outline" onClick={() => setSelectedPattern(null)}>
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

export default FailurePatternDetection;
