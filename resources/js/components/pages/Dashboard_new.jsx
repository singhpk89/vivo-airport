import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowUpIcon,
  ArrowDownIcon,
  Plus,
  RefreshCw,
  CalendarIcon,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TopAppBar } from '../ui/navigation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FloatingActionButton } from '../ui/fab';
import { Input } from '../ui/Input';
import RoutePlanDialog from '../dialogs/RoutePlanDialog';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRoutePlanDialogOpen, setIsRoutePlanDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    stats: {},
    state_wise_data: [],
    activity_by_date: [],
    pie_charts: {
      by_walls: [],
      by_villages: [],
      by_brands: []
    }
  });

  // Date range for filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Initialize date range based on timeRange
  useEffect(() => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start = '';

    switch (timeRange) {
      case '7d':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30d':
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '90d':
        start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'custom':
        // Don't update dates for custom range
        return;
      default:
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    setStartDate(start);
    setEndDate(end);
  }, [timeRange]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`/api/dashboard/analytics?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        setError(data.message || 'Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  }, [startDate, endDate, token]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnalytics().finally(() => setIsRefreshing(false));
  };

  // Get icon component based on icon name
  const getIconComponent = (iconName) => {
    const icons = {
      'activity': Activity,
      'check-circle': CheckCircle,
      'clock': Clock,
      'x-circle': XCircle
    };
    return icons[iconName] || Activity;
  };

  // Get color classes based on color name
  const getColorClasses = (color) => {
    const colors = {
      'success': 'from-green-500 to-green-600 text-white',
      'warning': 'from-yellow-500 to-yellow-600 text-white',
      'error': 'from-red-500 to-red-600 text-white',
      'default': 'from-blue-500 to-blue-600 text-white'
    };
    return colors[color] || colors.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">Route Plan & Activity Insights</p>
            </div>
          </div>
        }
        actions={[
          <Button
            key="refresh"
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>,
          <div key="time-range" className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        ]}
      />

      <div className="p-6 space-y-8">
        {/* Custom Date Range */}
        {timeRange === 'custom' && (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Start Date:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">End Date:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(analyticsData.stats).map(([key, stat]) => {
            const IconComponent = getIconComponent(stat.icon);
            const colorClasses = getColorClasses(stat.color);
            return (
              <Card key={key} className="overflow-hidden">
                <div className={`bg-gradient-to-br ${colorClasses} p-6 rounded-t-xl`}>
                  <div className="flex items-center justify-between text-white">
                    <div className="space-y-1">
                      <p className="text-sm opacity-90">{key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p className="text-3xl font-bold">{stat.count?.toLocaleString() || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-surface rounded-b-xl">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* State Wise Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">State Wise: Planned vs Activity</h3>
              <p className="text-sm text-muted-foreground">Comparison of planned routes and actual activities</p>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.state_wise_data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="planned" fill="#8b5cf6" name="Planned Routes" />
                <Bar dataKey="activity" fill="#10b981" name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity by Date Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Activity by Date</h3>
              <p className="text-sm text-muted-foreground">Daily activity trends with status breakdown</p>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.activity_by_date}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="approved" fill="#10b981" name="Approved" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* By Walls */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">By Walls Status</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.pie_charts.by_walls}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.pie_charts.by_walls.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {analyticsData.pie_charts.by_walls.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-sm">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium">{entry.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* By Villages */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">By Villages</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.pie_charts.by_villages}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.pie_charts.by_villages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
              {analyticsData.pie_charts.by_villages.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-sm truncate">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium">{entry.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* By Brands */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">By Brands</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.pie_charts.by_brands}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.pie_charts.by_brands.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
              {analyticsData.pie_charts.by_brands.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-sm">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium">{entry.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Route Plan Dialog */}
      <RoutePlanDialog
        isOpen={isRoutePlanDialogOpen}
        onClose={() => setIsRoutePlanDialogOpen(false)}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setIsRoutePlanDialogOpen(true)}
        icon={<Plus className="w-6 h-6" />}
        className="fixed bottom-6 right-6"
      />
    </div>
  );
};

export default Dashboard;
