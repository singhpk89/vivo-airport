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
  XCircle,
  CheckCircle,
  RefreshCw,
  Calendar,
  MapPin,
  User
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

const RejectedActivity = () => {
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
  const [reasonFilter, setReasonFilter] = useState('all-reasons');

  // Mock data for rejected activities only
  const mockRejectedActivities = [
    {
      id: 6,
      title: 'Mall Kiosk Setup - Weekend Event',
      description: 'Setup promotional kiosk at shopping mall during weekend',
      promoter: 'Neha Gupta',
      location: 'Chennai, Tamil Nadu',
      date: '2025-01-14',
      time: '10:00 AM',
      status: 'rejected',
      category: 'promotion',
      duration: '6 hours',
      participants: 20,
      photos: 0,
      notes: 'Rejected due to insufficient foot traffic projections',
      rejection_reason: 'Low expected ROI and foot traffic concerns',
      rejection_date: '2025-01-12',
      rejected_by: 'Marketing Manager',
      can_resubmit: true
    },
    {
      id: 7,
      title: 'Street Campaign - Local Market',
      description: 'Direct marketing campaign in local market area',
      promoter: 'Vikash Yadav',
      location: 'Kolkata, West Bengal',
      date: '2025-01-16',
      time: '08:00 AM',
      status: 'rejected',
      category: 'campaign',
      duration: '4 hours',
      participants: 8,
      photos: 0,
      notes: 'Rejected due to lack of proper permits',
      rejection_reason: 'Missing required permits and regulatory approvals',
      rejection_date: '2025-01-14',
      rejected_by: 'Compliance Officer',
      can_resubmit: true
    },
    {
      id: 11,
      title: 'Outdoor Event - Music Festival',
      description: 'Brand promotion at outdoor music festival',
      promoter: 'Ravi Kumar',
      location: 'Goa, India',
      date: '2025-01-20',
      time: '06:00 PM',
      status: 'rejected',
      category: 'event',
      duration: '8 hours',
      participants: 50,
      photos: 0,
      notes: 'Weather concerns and high cost per lead',
      rejection_reason: 'Weather risks and cost effectiveness',
      rejection_date: '2025-01-15',
      rejected_by: 'Event Manager',
      can_resubmit: false
    },
    {
      id: 12,
      title: 'Social Media Campaign - Influencer',
      description: 'Collaboration with social media influencers',
      promoter: 'Priya Agarwal',
      location: 'Online/Digital',
      date: '2025-01-17',
      time: '12:00 PM',
      status: 'rejected',
      category: 'digital',
      duration: '2 hours',
      participants: 3,
      photos: 0,
      notes: 'Budget constraints and unclear ROI projections',
      rejection_reason: 'Budget limitations and ROI concerns',
      rejection_date: '2025-01-13',
      rejected_by: 'Finance Team',
      can_resubmit: true
    },
    {
      id: 13,
      title: 'Cold Calling Campaign',
      description: 'Direct sales approach through telephone outreach',
      promoter: 'Mohit Singh',
      location: 'Remote/Phone',
      date: '2025-01-19',
      time: '09:00 AM',
      status: 'rejected',
      category: 'sales',
      duration: '6 hours',
      participants: 5,
      photos: 0,
      notes: 'Strategy not aligned with current market approach',
      rejection_reason: 'Strategy mismatch with market requirements',
      rejection_date: '2025-01-16',
      rejected_by: 'Sales Director',
      can_resubmit: true
    }
  ];

  // Fetch rejected activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError('');

        // Build query parameters - same as AllActivity
        const params = new URLSearchParams();
        params.append('per_page', '1000'); // Get all data to match dashboard counts
        
        // Always filter by rejected status for this component
        params.append('status', 'rejected');
        
        // Get date parameters from URL (from dashboard navigation)
        const searchParams = new URLSearchParams(location.search);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const url = `/api/activity-recces?${params.toString()}`;
        console.log('RejectedActivity fetching with URL:', url);

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
          console.log('RejectedActivity fetched:', activitiesData.length, 'activities');
        } else {
          throw new Error('Failed to fetch rejected activities');
        }
      } catch (error) {
        console.error('Error fetching rejected activities:', error);
        setError('Failed to load rejected activities. Please try again.');
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
      accessorKey: "rejection_reason",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Rejection Reason
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="destructive" className="font-medium">
          {row.getValue("rejection_reason")}
        </Badge>
      ),
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
      accessorKey: "rejected_by",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Rejected By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("rejected_by")}</div>
      ),
    },
    {
      accessorKey: "rejection_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Rejection Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("rejection_date")).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "can_resubmit",
      header: "Can Resubmit",
      cell: ({ row }) => {
        const canResubmit = row.getValue("can_resubmit");
        return (
          <Badge variant={canResubmit ? "default" : "secondary"} className="font-medium">
            {canResubmit ? 'Yes' : 'No'}
          </Badge>
        );
      },
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
              {activity.can_resubmit && (
                <>
                  <DropdownMenuItem onClick={() => handleResubmit(activity)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resubmit for Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(activity)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit & Resubmit
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(activity)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Activity
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
    // Could open a view-only modal or navigate to detail page
    console.log('View rejected activity:', activity);
  };

  const handleEdit = (activity) => {
    setSelectedActivity(activity);
    setIsDialogOpen(true);
  };

  const handleResubmit = async (activity) => {
    if (window.confirm('Are you sure you want to resubmit this activity for review?')) {
      try {
        // TODO: Implement actual resubmit API call
        setActivities(prev => prev.filter(a => a.id !== activity.id));
        console.log('Resubmitted activity:', activity.id);
      } catch (error) {
        console.error('Error resubmitting activity:', error);
        setError('Failed to resubmit activity. Please try again.');
      }
    }
  };

  const handleDelete = async (activity) => {
    if (window.confirm('Are you sure you want to permanently delete this activity?')) {
      try {
        // TODO: Implement actual delete API call
        setActivities(prev => prev.filter(a => a.id !== activity.id));
        console.log('Deleted activity:', activity.id);
      } catch (error) {
        console.error('Error deleting activity:', error);
        setError('Failed to delete activity. Please try again.');
      }
    }
  };

  const handleBulkResubmit = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.filter(row => row.original.can_resubmit);
    if (selectedRows.length === 0) {
      alert('Please select activities that can be resubmitted.');
      return;
    }

    if (window.confirm(`Are you sure you want to resubmit ${selectedRows.length} selected activities?`)) {
      try {
        const selectedIds = selectedRows.map(row => row.original.id);
        // TODO: Implement actual bulk resubmit API call
        setActivities(prev => prev.filter(a => !selectedIds.includes(a.id)));
        setRowSelection({});
        console.log('Bulk resubmitted activities:', selectedIds);
      } catch (error) {
        console.error('Error bulk resubmitting activities:', error);
        setError('Failed to resubmit activities. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      alert('Please select activities to delete.');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete ${selectedRows.length} selected activities?`)) {
      try {
        const selectedIds = selectedRows.map(row => row.original.id);
        // TODO: Implement actual bulk delete API call
        setActivities(prev => prev.filter(a => !selectedIds.includes(a.id)));
        setRowSelection({});
        console.log('Bulk deleted activities:', selectedIds);
      } catch (error) {
        console.error('Error bulk deleting activities:', error);
        setError('Failed to delete activities. Please try again.');
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      // TODO: Implement actual API calls to update and resubmit
      setActivities(prev => prev.filter(a => a.id !== selectedActivity.id));
      setIsDialogOpen(false);
      setSelectedActivity(null);
      console.log('Updated and resubmitted activity:', selectedActivity.id);
    } catch (error) {
      console.error('Error saving activity:', error);
      setError('Failed to save activity. Please try again.');
    } finally {
      setIsSubmitting(false);
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

    if (reasonFilter !== 'all-reasons') {
      filters.push({
        id: 'rejection_reason',
        value: reasonFilter,
      });
    }

    setColumnFilters(filters);
  }, [categoryFilter, promoterFilter, reasonFilter]);

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
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Rejected Activities
            </h1>
            <p className="text-sm text-muted-foreground">
              Review rejected activities and manage resubmissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <>
              {table.getFilteredSelectedRowModel().rows.some(row => row.original.can_resubmit) && (
                <Button size="sm" variant="default" onClick={handleBulkResubmit}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resubmit Selected ({table.getFilteredSelectedRowModel().rows.filter(row => row.original.can_resubmit).length})
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
            </>
          )}
        </div>
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
                  placeholder="Search rejected activities, promoters, reasons..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Rejection Reason Filter */}
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-reasons">All Reasons</SelectItem>
                  <SelectItem value="Insufficient documentation">Documentation</SelectItem>
                  <SelectItem value="Permit issues">Permit Issues</SelectItem>
                  <SelectItem value="Budget constraints">Budget</SelectItem>
                  <SelectItem value="Strategy mismatch">Strategy</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
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
                        <span className="ml-2">Loading rejected activities...</span>
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
                        <p className="text-muted-foreground">No rejected activities found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          All submissions have been approved or are pending review
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

      {/* Activity Edit & Resubmit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit & Resubmit Activity</DialogTitle>
            <DialogDescription>
              Update the activity information to address rejection reasons and resubmit for review.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                defaultValue={selectedActivity?.title || ''}
                className="col-span-3"
                placeholder="Activity title"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                defaultValue={selectedActivity?.description || ''}
                className="col-span-3"
                placeholder="Updated activity description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rejection-reason" className="text-right">
                Previous Rejection
              </Label>
              <div className="col-span-3">
                <Badge variant="destructive" className="mb-2">
                  {selectedActivity?.rejection_reason}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {selectedActivity?.notes}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="improvements" className="text-right">
                Improvements Made
              </Label>
              <Textarea
                id="improvements"
                className="col-span-3"
                placeholder="Describe what changes you've made to address the rejection reasons..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select defaultValue={selectedActivity?.category || ''}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit({})}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Resubmitting...
                </>
              ) : (
                'Update & Resubmit'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RejectedActivity;
