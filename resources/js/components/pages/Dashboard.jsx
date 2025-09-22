import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCw,
  CalendarIcon,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  Camera,
  MessageSquare
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
  LineChart,
  Line
} from 'recharts';
import { TopAppBar } from '../ui/navigation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import RoutePlanDialog from '../dialogs/RoutePlanDialog';
import { useAuth } from '../../contexts/AuthContext';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, labelFormatter, valueFormatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-lg border border-border/50 rounded-xl p-4 shadow-xl">
        <h4 className="font-semibold text-foreground mb-2">
          {labelFormatter ? labelFormatter(label) : label}
        </h4>
        {payload.map((item, index) => {
          let displayValue = item.value;
          let displayName = item.name;

          if (valueFormatter) {
            const formatted = valueFormatter(item.value, item.name, item);
            if (Array.isArray(formatted)) {
              [displayValue, displayName] = formatted;
            } else {
              displayValue = formatted;
            }
          }

          return (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{displayName}:</span>
              <span className="font-medium text-foreground">
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

// Product Type Color Assignment
const getProductTypeColors = (data) => {
  const colorPalette = [
    '#9CA3AF', // Grey
    '#F472B6', // Pink
    '#FBBF24', // Gold
    // '#92400E'  // Brown
  ];

  return data.map((entry, index) => ({
    ...entry,
    color: colorPalette[index % colorPalette.length]
  }));
};

// Material 3 Stats Card Colors
const getMaterial3StatsColors = (statKey, index) => {
  const material3Colors = {
    'total_promoters': {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      icon: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconText: 'text-white',
      border: 'border-blue-200'
    },
    'promoter_sessions': {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      icon: 'bg-gradient-to-br from-green-500 to-green-600',
      iconText: 'text-white',
      border: 'border-green-200'
    },
    'photos_captured': {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      icon: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconText: 'text-white',
      border: 'border-purple-200'
    },
    'feedback_received': {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      icon: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconText: 'text-white',
      border: 'border-amber-200'
    }
  };

  return material3Colors[statKey] || {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
    icon: 'bg-gradient-to-br from-gray-500 to-gray-600',
    iconText: 'text-white',
    border: 'border-gray-200'
  };
};

// Custom Bar Shape with Gradient
const GradientBar = (props) => {
  const { fill, ...rest } = props;
  return <Bar {...rest} fill={`url(#gradient-${fill.replace('#', '')})`} />;
};const Dashboard = () => {
  const { token, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRoutePlanDialogOpen, setIsRoutePlanDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    stats: {},
    promoter_activity_data: {
      activity_by_status: [],
      top_promoters: [],
      activity_by_state: []
    },
    feedback_data: {
      rating_distribution: [],
      product_satisfaction: [],
      feedback_trends: []
    },
    activity_by_date: [],
    daily_progress: []
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

  // Handle stat card clicks
  const handleStatCardClick = (statKey) => {
    const params = new URLSearchParams();

    // Add date range parameters to maintain consistency
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const queryString = params.toString();

    switch (statKey) {
      case 'total_promoters':
        navigate(`/acl/promoters${queryString ? '?' + queryString : ''}`);
        break;
      case 'promoter_sessions':
        navigate(`/admin/promoter-activity${queryString ? '?' + queryString : ''}`);
        break;
      case 'photos_captured':
        navigate(`/admin/promoter-activity${queryString ? '?' + queryString : ''}`);
        break;
      case 'feedback_received':
        navigate(`/admin/feedback${queryString ? '?' + queryString : ''}`);
        break;
      default:
        console.log('Unknown stat key:', statKey);
    }
  };

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
      'x-circle': XCircle,
      'users': Users,
      'camera': Camera,
      'message-square': MessageSquare
    };
    return icons[iconName] || Activity;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="h-full flex flex-col bg-white">
      <TopAppBar
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">Promoter Activity & Vivo Feedback Insights</p>
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

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-6 space-y-8">
        {/* Custom Date Range */}
        {timeRange === 'custom' && (
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Custom Date Range</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700 min-w-20">Start Date:</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-44 pr-10 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700 min-w-16">End Date:</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-44 pr-10 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <Button
                  onClick={() => fetchAnalytics()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const today = new Date();
                    const end = today.toISOString().split('T')[0];
                    const start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    setStartDate(start);
                    setEndDate(end);
                    setTimeRange('30d');
                  }}
                  className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(analyticsData.stats)
            .filter(([key]) => {
              // Show rejected_activities only to Super Admin
              if (key === 'rejected_activities') {
                return isSuperAdmin();
              }
              return true;
            })
            .map(([key, stat], index) => {
            const IconComponent = getIconComponent(stat.icon);
            const colors = getMaterial3StatsColors(key, index);
            return (
              <Card
                key={key}
                className={`overflow-hidden ${colors.bg} ${colors.border} border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
                onClick={() => handleStatCardClick(key)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">{key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.count?.toLocaleString() || 0}</p>
                    </div>
                    <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center shadow-lg`}>
                      <IconComponent className={`w-6 h-6 ${colors.iconText}`} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 font-medium">{stat.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Daily Progress Chart */}
        <Card className="p-6 bg-white border-gray-200/50 chart-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Daily Progress Overview
              </h3>
              <p className="text-sm text-muted-foreground">Date-wise promoter activity and feedback trends</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <span className="text-muted-foreground">Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-green-500 to-green-600"></div>
                <span className="text-muted-foreground">Photos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-purple-600"></div>
                <span className="text-muted-foreground">Feedback</span>
              </div>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.daily_progress} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="gradient-sessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="gradient-photos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="gradient-feedback" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip
                  content={<CustomTooltip
                    labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                    valueFormatter={(value, name) => [value.toLocaleString(), name]}
                  />}
                />
                <Area
                  type="monotone"
                  dataKey="total_sessions"
                  stroke="#3b82f6"
                  fill="url(#gradient-sessions)"
                  strokeWidth={2}
                  name="Sessions"
                />
                <Line
                  type="monotone"
                  dataKey="photos_captured"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Photos"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="feedback_received"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Feedback"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Promoter Activity Status */}
          <Card className="p-6 bg-white border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Activity Status Distribution
                </h3>
                <p className="text-sm text-muted-foreground">Breakdown of promoter session statuses</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {analyticsData.promoter_activity_data.activity_by_status.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`statusGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={['#10b981', '#f59e0b', '#ef4444', '#6b7280'][index % 4]} stopOpacity={1}/>
                        <stop offset="100%" stopColor={['#059669', '#d97706', '#dc2626', '#4b5563'][index % 4]} stopOpacity={0.8}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={analyticsData.promoter_activity_data.activity_by_status}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    fill={`url(#statusGradient0)`}
                  >
                    {analyticsData.promoter_activity_data.activity_by_status.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#statusGradient${index})`}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Feedback Ratings Distribution */}
          <Card className="p-6 bg-white border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Feedback Ratings
                </h3>
                <p className="text-sm text-muted-foreground">Customer experience ratings distribution</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.feedback_data.rating_distribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="rating"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    fill="url(#ratingGradient)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Active Promoters */}
          <Card className="p-6 bg-white border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Top Active Promoters
                </h3>
                <p className="text-sm text-muted-foreground">Most engaged promoters by session count</p>
              </div>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {analyticsData.promoter_activity_data.top_promoters.map((promoter, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{promoter.promoter_name}</p>
                      <p className="text-sm text-gray-600">{promoter.state}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600">{promoter.sessions} sessions</p>
                    <p className="text-sm text-gray-600">{promoter.photos} photos</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity by State */}
          <Card className="p-6 bg-white border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Activity by State
                </h3>
                <p className="text-sm text-muted-foreground">Geographic distribution of promoter activities</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.promoter_activity_data.activity_by_state} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="stateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#0f766e" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="state"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="activities"
                    fill="url(#stateGradient)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        </div>
      </div>

      <RoutePlanDialog
        isOpen={isRoutePlanDialogOpen}
        onClose={() => setIsRoutePlanDialogOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
