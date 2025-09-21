import { useState, useEffect } from 'react';
import { Users, Shield, Key, UserCheck, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

const ACLDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    recentActivity: [],
    securityAlerts: []
  });
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalUsers: 45,
        activeUsers: 38,
        totalRoles: 4,
        totalPermissions: 28,
        recentActivity: [
          {
            id: 1,
            user: 'John Doe',
            action: 'Role assigned',
            details: 'Administrator role assigned to John Doe',
            timestamp: '2024-01-15 10:30:00',
            type: 'role_assignment'
          },
          {
            id: 2,
            user: 'Jane Smith',
            action: 'Permission granted',
            details: 'Export Analytics permission granted directly',
            timestamp: '2024-01-15 09:15:00',
            type: 'permission_grant'
          },
          {
            id: 3,
            user: 'Admin',
            action: 'Role created',
            details: 'New role "Content Editor" created',
            timestamp: '2024-01-14 16:45:00',
            type: 'role_creation'
          },
          {
            id: 4,
            user: 'System',
            action: 'Permission modified',
            details: 'User management permissions updated',
            timestamp: '2024-01-14 14:20:00',
            type: 'permission_update'
          }
        ],
        securityAlerts: [
          {
            id: 1,
            title: 'Users without roles',
            description: '3 users have no assigned roles',
            severity: 'warning',
            count: 3
          },
          {
            id: 2,
            title: 'Inactive super admins',
            description: '1 super admin account is inactive',
            severity: 'high',
            count: 1
          },
          {
            id: 3,
            title: 'Orphaned permissions',
            description: '2 permissions are not assigned to any role',
            severity: 'low',
            count: 2
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'role_assignment':
      case 'role_creation':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'permission_grant':
      case 'permission_update':
        return <Key className="h-4 w-4 text-emerald-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      high: 'destructive',
      warning: 'secondary',
      low: 'outline'
    };
    return variants[severity] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading ACL dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ACL Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of roles, permissions, and access control status.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoles}</div>
            <p className="text-xs text-muted-foreground">
              Active role configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPermissions}</div>
            <p className="text-xs text-muted-foreground">
              System permissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              User activity rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent ACL Activity
            </CardTitle>
            <CardDescription>
              Latest changes to roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.details}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Security Alerts
            </CardTitle>
            <CardDescription>
              Issues requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.securityAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <Badge variant={getSeverityBadge(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-900">
                      {alert.count} item{alert.count !== 1 ? 's' : ''}
                    </span>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common ACL management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/users">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
                <span className="text-xs text-gray-500">Assign roles and permissions</span>
              </Button>
            </Link>

            <Link to="/roles">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Shield className="h-6 w-6" />
                <span>Manage Roles</span>
                <span className="text-xs text-gray-500">Create and edit roles</span>
              </Button>
            </Link>

            <Link to="/permissions">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Key className="h-6 w-6" />
                <span>Manage Permissions</span>
                <span className="text-xs text-gray-500">Configure system permissions</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Role Distribution</CardTitle>
          <CardDescription>
            Number of users per role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { role: 'Super Administrator', count: 1, color: 'bg-red-500' },
              { role: 'Administrator', count: 3, color: 'bg-orange-500' },
              { role: 'Moderator', count: 8, color: 'bg-blue-500' },
              { role: 'Regular User', count: 33, color: 'bg-emerald-500' }
            ].map((item) => (
              <div key={item.role} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium">{item.role}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.count} users</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ACLDashboard;
