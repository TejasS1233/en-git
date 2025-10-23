import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
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
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw
} from 'lucide-react';

const BuildTimeAnalytics = ({ pipeline }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for different time ranges
  const mockData = {
    '7d': {
      buildTimes: [
        { date: '2024-01-09', duration: 420, status: 'success' },
        { date: '2024-01-10', duration: 380, status: 'success' },
        { date: '2024-01-11', duration: 450, status: 'success' },
        { date: '2024-01-12', duration: 520, status: 'failed' },
        { date: '2024-01-13', duration: 410, status: 'success' },
        { date: '2024-01-14', duration: 390, status: 'success' },
        { date: '2024-01-15', duration: 420, status: 'success' }
      ],
      jobBreakdown: [
        { name: 'Lint & Format Check', avgDuration: 45, trend: -5 },
        { name: 'Build Client', avgDuration: 120, trend: 2 },
        { name: 'Build Server', avgDuration: 90, trend: -3 },
        { name: 'Security Scan', avgDuration: 180, trend: 8 },
        { name: 'Performance Test', avgDuration: 300, trend: 1 },
        { name: 'Integration Test', avgDuration: 240, trend: -2 }
      ],
      hourlyDistribution: [
        { hour: '00:00', builds: 2 },
        { hour: '02:00', builds: 1 },
        { hour: '04:00', builds: 0 },
        { hour: '06:00', builds: 3 },
        { hour: '08:00', builds: 8 },
        { hour: '10:00', builds: 12 },
        { hour: '12:00', builds: 15 },
        { hour: '14:00', builds: 18 },
        { hour: '16:00', builds: 14 },
        { hour: '18:00', builds: 9 },
        { hour: '20:00', builds: 6 },
        { hour: '22:00', builds: 4 }
      ],
      statusDistribution: [
        { name: 'Success', value: 85, color: '#10b981' },
        { name: 'Failed', value: 10, color: '#ef4444' },
        { name: 'Cancelled', value: 5, color: '#f59e0b' }
      ]
    },
    '30d': {
      buildTimes: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: 350 + Math.random() * 200,
        status: Math.random() > 0.15 ? 'success' : 'failed'
      })),
      jobBreakdown: [
        { name: 'Lint & Format Check', avgDuration: 42, trend: -8 },
        { name: 'Build Client', avgDuration: 115, trend: -5 },
        { name: 'Build Server', avgDuration: 88, trend: -7 },
        { name: 'Security Scan', avgDuration: 175, trend: 12 },
        { name: 'Performance Test', avgDuration: 295, trend: 3 },
        { name: 'Integration Test', avgDuration: 235, trend: -4 }
      ],
      hourlyDistribution: [
        { hour: '00:00', builds: 15 },
        { hour: '02:00', builds: 8 },
        { hour: '04:00', builds: 5 },
        { hour: '06:00', builds: 25 },
        { hour: '08:00', builds: 45 },
        { hour: '10:00', builds: 65 },
        { hour: '12:00', builds: 78 },
        { hour: '14:00', builds: 85 },
        { hour: '16:00', builds: 72 },
        { hour: '18:00', builds: 48 },
        { hour: '20:00', builds: 32 },
        { hour: '22:00', builds: 18 }
      ],
      statusDistribution: [
        { name: 'Success', value: 88, color: '#10b981' },
        { name: 'Failed', value: 8, color: '#ef4444' },
        { name: 'Cancelled', value: 4, color: '#f59e0b' }
      ]
    },
    '90d': {
      buildTimes: Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: 300 + Math.random() * 300,
        status: Math.random() > 0.12 ? 'success' : 'failed'
      })),
      jobBreakdown: [
        { name: 'Lint & Format Check', avgDuration: 40, trend: -12 },
        { name: 'Build Client', avgDuration: 110, trend: -8 },
        { name: 'Build Server', avgDuration: 85, trend: -10 },
        { name: 'Security Scan', avgDuration: 170, trend: 15 },
        { name: 'Performance Test', avgDuration: 290, trend: 5 },
        { name: 'Integration Test', avgDuration: 230, trend: -6 }
      ],
      hourlyDistribution: [
        { hour: '00:00', builds: 45 },
        { hour: '02:00', builds: 25 },
        { hour: '04:00', builds: 15 },
        { hour: '06:00', builds: 75 },
        { hour: '08:00', builds: 135 },
        { hour: '10:00', builds: 195 },
        { hour: '12:00', builds: 234 },
        { hour: '14:00', builds: 255 },
        { hour: '16:00', builds: 216 },
        { hour: '18:00', builds: 144 },
        { hour: '20:00', builds: 96 },
        { hour: '22:00', builds: 54 }
      ],
      statusDistribution: [
        { name: 'Success', value: 90, color: '#10b981' },
        { name: 'Failed', value: 7, color: '#ef4444' },
        { name: 'Cancelled', value: 3, color: '#f59e0b' }
      ]
    }
  };

  const currentData = mockData[timeRange];
  const avgBuildTime = currentData.buildTimes.reduce((sum, build) => sum + build.duration, 0) / currentData.buildTimes.length;
  const successRate = (currentData.buildTimes.filter(build => build.status === 'success').length / currentData.buildTimes.length) * 100;
  const trend = currentData.buildTimes.length > 1 ? 
    ((currentData.buildTimes[currentData.buildTimes.length - 1].duration - currentData.buildTimes[0].duration) / currentData.buildTimes[0].duration) * 100 : 0;

  const handleTimeRangeChange = (range) => {
    setIsLoading(true);
    setTimeRange(range);
    setTimeout(() => setIsLoading(false), 500);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pipeline.name}-build-analytics-${timeRange}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Build Time Analytics</CardTitle>
              <CardDescription>
                Detailed analysis of build performance and trends
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={timeRange === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeRangeChange('7d')}
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeRangeChange('30d')}
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeRangeChange('90d')}
              >
                90 Days
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
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
            <CardTitle className="text-sm font-medium">Avg Build Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgBuildTime / 60)}m {avgBuildTime % 60}s</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              {Math.abs(trend).toFixed(1)}% vs previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Builds</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.buildTimes.length}</div>
            <p className="text-xs text-muted-foreground">
              In the last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentData.hourlyDistribution.reduce((max, hour) => 
                hour.builds > max.builds ? hour : max
              ).hour}
            </div>
            <p className="text-xs text-muted-foreground">
              Most active time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Build Time Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Build Time Trend</CardTitle>
          <CardDescription>
            Build duration over time with success/failure indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentData.buildTimes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Duration (seconds)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value) => [`${Math.floor(value / 60)}m ${value % 60}s`, 'Duration']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={payload.status === 'success' ? '#10b981' : '#ef4444'}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Job Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Job Performance Breakdown</CardTitle>
          <CardDescription>
            Average duration and performance trends for each job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentData.jobBreakdown.map((job, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{job.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Avg: {Math.floor(job.avgDuration / 60)}m {job.avgDuration % 60}s
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32">
                    <Progress value={(job.avgDuration / 600) * 100} className="h-2" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {job.trend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      job.trend > 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {Math.abs(job.trend)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Distribution and Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Build Distribution by Hour</CardTitle>
            <CardDescription>
              When builds are most frequently triggered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={currentData.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="builds" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Build Status Distribution</CardTitle>
            <CardDescription>
              Success vs failure rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={currentData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {currentData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {currentData.statusDistribution.map((status, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm">{status.name}</span>
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
            AI-powered suggestions to improve build performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
              <h4 className="font-medium text-blue-900">Parallel Job Execution</h4>
              <p className="text-sm text-blue-700 mt-1">
                Consider running "Build Client" and "Build Server" in parallel to reduce total build time by ~30%.
              </p>
            </div>
            <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
              <h4 className="font-medium text-green-900">Cache Optimization</h4>
              <p className="text-sm text-green-700 mt-1">
                Implement npm cache for dependencies to reduce "Lint & Format Check" time by ~40%.
              </p>
            </div>
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
              <h4 className="font-medium text-yellow-900">Peak Hour Optimization</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Consider scheduling non-critical builds during off-peak hours (2-6 AM) to reduce queue times.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuildTimeAnalytics;
