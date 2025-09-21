import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Download,
  Upload,
  FileText,
  ChevronDown,
  SlidersHorizontal,
  Eye,
  Columns3,
  AlertCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Calendar,
  MapPin,
  User,
  Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '../../contexts/AuthContext';

const ApprovedActivity = () => {
  const { hasPermission, user, loading: authLoading, token } = useAuth();
  const location = useLocation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Table state
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('all-categories');
  const [promoterFilter, setPromoterFilter] = useState('all-promoters');
  const [performanceFilter, setPerformanceFilter] = useState('all-performance');
  const [dateRangeFilter, setDateRangeFilter] = useState('all-time');

  // Mock data for approved activities only
  const mockApprovedActivities = [
    {
      id: 1,
      title: 'Product Demo - Corporate Office',
      description: 'Conducted product demonstration for potential corporate clients',
      promoter: 'Priya Sharma',
      location: 'Mumbai, Maharashtra',
      date: '2025-01-15',
      time: '10:30 AM',
      status: 'approved',
      category: 'demo',
      duration: '2 hours',
      participants: 15,
      photos: 5,
      notes: 'Successful demonstration with positive feedback',
      approved_by: 'Sales Manager',
      approved_date: '2025-01-11',
      completion_date: '2025-01-15',
      performance_rating: 4.8,
      roi_score: 85,
      lead_generated: 12,
      conversion_rate: 75
    },
    {
      id: 4,
      title: 'Customer Engagement - Retail Store',
      description: 'Direct customer engagement and product promotion',
      promoter: 'Amit Singh',
      location: 'Bangalore, Karnataka',
      date: '2025-01-12',
      time: '11:00 AM',
      status: 'approved',
      category: 'engagement',
      duration: '5 hours',
      participants: 25,
      photos: 15,
      notes: 'Excellent customer response and engagement',
      approved_by: 'Regional Manager',
      approved_date: '2025-01-10',
      completion_date: '2025-01-12',
      performance_rating: 4.9,
      roi_score: 92,
      lead_generated: 18,
      conversion_rate: 82
    },
    {
      id: 5,
      title: 'Brand Activation - Shopping Mall',
      description: 'Brand activation event at premium shopping destination',
      promoter: 'Kavita Reddy',
      location: 'Hyderabad, Telangana',
      date: '2025-01-11',
      time: '12:00 PM',
      status: 'approved',
      category: 'activation',
      duration: '6 hours',
      participants: 50,
      photos: 20,
      notes: 'High visibility event with great foot traffic',
      approved_by: 'Marketing Director',
      approved_date: '2025-01-09',
      completion_date: '2025-01-11',
      performance_rating: 4.7,
      roi_score: 88,
      lead_generated: 25,
      conversion_rate: 68
    },
    {
      id: 14,
      title: 'Tech Conference Booth Setup',
      description: 'Product showcase at major technology conference',
      promoter: 'Rohit Sharma',
      location: 'Gurgaon, Haryana',
      date: '2025-01-08',
      time: '09:00 AM',
      status: 'approved',
      category: 'conference',
      duration: '8 hours',
      participants: 75,
      photos: 30,
      notes: 'Outstanding response from tech community',
      approved_by: 'CEO',
      approved_date: '2025-01-05',
      completion_date: '2025-01-08',
      performance_rating: 5.0,
      roi_score: 95,
      lead_generated: 35,
      conversion_rate: 89
    },
    {
      id: 15,
      title: 'University Campus Drive',
      description: 'Product awareness campaign at engineering college',
      promoter: 'Meera Patel',
      location: 'Pune, Maharashtra',
      date: '2025-01-07',
      time: '10:30 AM',
      status: 'approved',
      category: 'education',
      duration: '4 hours',
      participants: 120,
      photos: 25,
      notes: 'Great engagement with students and faculty',
      approved_by: 'Marketing Manager',
      approved_date: '2025-01-04',
      completion_date: '2025-01-07',
      performance_rating: 4.6,
      roi_score: 78,
      lead_generated: 28,
      conversion_rate: 65
    }
  ];

  // Fetch approved activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError('');

        // Build query parameters - same as AllActivity
        const params = new URLSearchParams();
        params.append('per_page', '1000'); // Get all data to match dashboard counts
        
        // Always filter by approved status for this component
        params.append('status', 'approved');
        
        // Get date parameters from URL (from dashboard navigation)
        const searchParams = new URLSearchParams(location.search);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const url = `/api/activity-recces?${params.toString()}`;
        console.log('ApprovedActivity fetching with URL:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const apiResponse = await response.json();
          let activitiesData = [];
          if (apiResponse.data && Array.isArray(apiResponse.data.data)) {
            activitiesData = apiResponse.data.data;
          } else if (Array.isArray(apiResponse.data)) {
            activitiesData = apiResponse.data;
          } else if (Array.isArray(apiResponse)) {
            activitiesData = apiResponse;
          }
          setActivities(activitiesData);
          console.log('ApprovedActivity fetched:', activitiesData.length, 'activities');
        } else {
          throw new Error('Failed to fetch approved activities');
        }
      } catch (error) {
        console.error('Error fetching approved activities:', error);
        setError('Failed to load approved activities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchActivities();
    }
  }, [location.search, token]);

  // Table columns definition
  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Activity ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-primary">#{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Activity Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">{row.getValue("title")}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground truncate">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-medium capitalize">
          {row.getValue("category")}
        </Badge>
      ),
    },
    {
      accessorKey: "performance_rating",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Performance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rating = row.getValue("performance_rating");
        return (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "roi_score",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          ROI Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.getValue("roi_score");
        const variant = score >= 90 ? 'default' : score >= 80 ? 'secondary' : 'outline';
        return (
          <Badge variant={variant} className="font-medium">
            {score}%
          </Badge>
        );
      },
    },
    {
      accessorKey: "promoter_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Promoter
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const promoter = row.original.promoter;
        return (
          <div className="font-medium">{promoter ? promoter.name : 'N/A'}</div>
        );
      },
    },
    {
      accessorKey: "lead_generated",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Leads
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.getValue("lead_generated")}</div>
      ),
    },
    {
      accessorKey: "completion_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Completed Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("completion_date")).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const activity = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(activity)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewMetrics(activity)}>
                <TrendingUp className="mr-2 h-4 w-4" />
                View Metrics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleClone(activity)}>
                <FileText className="mr-2 h-4 w-4" />
                Clone Activity
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {activity.performance_rating >= 4.5 && (
                <DropdownMenuItem onClick={() => handleFeature(activity)}>
                  <Award className="mr-2 h-4 w-4" />
                  Feature as Success Story
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleDownloadReport(activity)}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  // Handler functions
  const handleView = (activity) => {
    setSelectedActivity(activity);
    setIsDialogOpen(true);
  };

  const handleViewMetrics = (activity) => {
    setSelectedActivity(activity);
    console.log('View metrics for activity:', activity);
    // Could open a metrics dashboard modal
  };

  const handleClone = (activity) => {
    console.log('Clone activity:', activity);
    // Navigate to create new activity with pre-filled data
  };

  const handleFeature = (activity) => {
    console.log('Feature as success story:', activity);
    // Mark activity as featured success story
  };

  const handleDownloadReport = (activity) => {
    console.log('Download report for activity:', activity);
    // Generate and download activity report
  };

  const handleBulkExport = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      alert('Please select activities to export.');
      return;
    }

    try {
      const selectedIds = selectedRows.map(row => row.original.id);
      // TODO: Implement actual bulk export API call
      console.log('Bulk export activities:', selectedIds);
    } catch (error) {
      console.error('Error exporting activities:', error);
      setError('Failed to export activities. Please try again.');
    }
  };

  // Create table instance
  const table = useReactTable({
    data: activities,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Filter the table data based on filter states
  useEffect(() => {
    const filters = [];

    if (categoryFilter !== 'all-categories') {
      filters.push({
        id: 'category',
        value: categoryFilter,
      });
    }

    if (promoterFilter !== 'all-promoters') {
      filters.push({
        id: 'promoter',
        value: promoterFilter,
      });
    }

    if (performanceFilter !== 'all-performance') {
      // Apply performance filter logic based on rating
      // This would need custom filtering in a real implementation
    }

    setColumnFilters(filters);
  }, [categoryFilter, promoterFilter, performanceFilter]);

  const [hasViewPermission, setHasViewPermission] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(true);

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Super admin bypass
        if (user?.roles && user.roles.some(role => role.name === 'super_admin')) {
          setHasViewPermission(true);
        } else {
          const permissionResult = await hasPermission('activities.view');
          setHasViewPermission(permissionResult);
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasViewPermission(false);
      } finally {
        setPermissionLoading(false);
      }
    };

    if (!authLoading && user) {
      checkPermission();
    } else if (!authLoading && !user) {
      setHasViewPermission(false);
      setPermissionLoading(false);
    }
  }, [hasPermission, user, authLoading]);

  if (authLoading || permissionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Approved Activities
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor successful activities and performance metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button size="sm" variant="default" onClick={handleBulkExport}>
              <FileText className="mr-2 h-4 w-4" />
              Export Selected ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold">
                  {activities.length > 0
                    ? (activities.reduce((sum, a) => sum + a.performance_rating, 0) / activities.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">
                  {activities.reduce((sum, a) => sum + a.lead_generated, 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg ROI Score</p>
                <p className="text-2xl font-bold">
                  {activities.length > 0
                    ? Math.round(activities.reduce((sum, a) => sum + a.roi_score, 0) / activities.length)
                    : '0'
                  }%
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Global Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search approved activities, promoters, locations..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Performance Filter */}
              <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-performance">All Performance</SelectItem>
                  <SelectItem value="excellent">Excellent (4.5+)</SelectItem>
                  <SelectItem value="good">Good (4.0+)</SelectItem>
                  <SelectItem value="average">Average (3.5+)</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="activation">Activation</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>

              {/* Promoter Filter */}
              <Select value={promoterFilter} onValueChange={setPromoterFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Promoter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-promoters">All Promoters</SelectItem>
                  {Array.from(new Set(activities.map(a => a.promoter?.name).filter(Boolean))).map(promoterName => (
                    <SelectItem key={promoterName} value={promoterName}>{promoterName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Column Visibility */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns3 className="mr-2 h-4 w-4" />
                    Columns
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Error Display */}
          {error && (
            <div className="p-4 border-b">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Data Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading approved activities...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center py-6">
                        <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground">No approved activities found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Activities will appear here once they are approved and completed
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4 px-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">
                Rows per page
              </p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Activity Details & Performance
            </DialogTitle>
            <DialogDescription>
              Detailed view of approved activity performance and metrics.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Activity Title</Label>
                <p className="text-sm font-medium">{selectedActivity?.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                <Badge variant="secondary" className="capitalize">
                  {selectedActivity?.category}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Promoter</Label>
                <p className="text-sm">{selectedActivity?.promoter}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <p className="text-sm">{selectedActivity?.location}</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">Performance Metrics</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Performance Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{selectedActivity?.performance_rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">ROI Score</span>
                  <span className="font-bold text-green-600">{selectedActivity?.roi_score}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Leads Generated</span>
                  <span className="font-bold">{selectedActivity?.lead_generated}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="font-bold text-blue-600">{selectedActivity?.conversion_rate}%</span>
                </div>
              </div>
            </div>

            {/* Activity Details */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">Activity Details</Label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Approved By:</span>
                  <span className="ml-2 font-medium">{selectedActivity?.approved_by}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Approval Date:</span>
                  <span className="ml-2 font-medium">
                    {selectedActivity?.approved_date && new Date(selectedActivity.approved_date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Completion Date:</span>
                  <span className="ml-2 font-medium">
                    {selectedActivity?.completion_date && new Date(selectedActivity.completion_date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{selectedActivity?.duration}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Participants:</span>
                  <span className="ml-2 font-medium">{selectedActivity?.participants}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Photos Uploaded:</span>
                  <span className="ml-2 font-medium">{selectedActivity?.photos}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedActivity?.notes && (
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">Notes</Label>
                <p className="text-sm bg-muted p-3 rounded-lg">{selectedActivity.notes}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
            <Button onClick={() => handleDownloadReport(selectedActivity)}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovedActivity;
