import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FileText, Download, Calendar, TrendingUp, Users, ShoppingCart, DollarSign, Filter } from 'lucide-react';

const Reports = () => {
  const reports = [
    { 
      name: 'Sales Report', 
      description: 'Monthly sales performance and trends', 
      lastGenerated: '2024-01-15',
      type: 'sales',
      icon: TrendingUp,
      status: 'ready'
    },
    { 
      name: 'User Activity Report', 
      description: 'User engagement metrics and behavior analytics', 
      lastGenerated: '2024-01-14',
      type: 'users',
      icon: Users,
      status: 'generating'
    },
    { 
      name: 'Inventory Report', 
      description: 'Current stock levels and inventory management', 
      lastGenerated: '2024-01-13',
      type: 'inventory',
      icon: ShoppingCart,
      status: 'ready'
    },
    { 
      name: 'Financial Report', 
      description: 'Revenue, expenses and profit analysis', 
      lastGenerated: '2024-01-12',
      type: 'financial',
      icon: DollarSign,
      status: 'ready'
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default">Ready</Badge>;
      case 'generating':
        return <Badge variant="outline">Generating...</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download various business reports.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Generated this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Total downloads</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Automated reports</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Currently generating</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, index) => {
          const IconComponent = report.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                    </div>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Last generated: {report.lastGenerated}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      className="flex-1" 
                      disabled={report.status === 'generating'}
                    >
                      {report.status === 'generating' ? 'Generating...' : 'Generate Report'}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your latest generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Monthly Sales Summary", date: "2024-01-15", size: "2.4 MB", type: "PDF" },
              { name: "User Engagement Analytics", date: "2024-01-14", size: "1.8 MB", type: "Excel" },
              { name: "Inventory Status Report", date: "2024-01-13", size: "3.1 MB", type: "PDF" },
              { name: "Financial Performance Q4", date: "2024-01-12", size: "4.2 MB", type: "PDF" },
            ].map((recentReport, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{recentReport.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {recentReport.date} • {recentReport.size} • {recentReport.type}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
