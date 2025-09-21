import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Clock,
  CheckCircle,
  XCircle,
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

const PendingActivity = () => {
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
  const [priorityFilter, setPriorityFilter] = useState('all-priority');

  // Mock data for pending activities only
  const mockPendingActivities = [
    {
      id: 2,
      title: 'Product Launch Event - Tech Conference',
      description: 'Showcase new product line at major technology conference',
      promoter: 'Rahul Kumar',
      location: 'Delhi, India',
      date: '2025-01-20',
      time: '09:00 AM',
      status: 'pending',
      category: 'launch',
      duration: '8 hours',
      participants: 100,
      photos: 0,
      notes: 'Waiting for venue confirmation and final approval',
      priority: 'high',
      submitted_at: '2025-01-17'
    },
    {
      id: 3,
      title: 'Customer Survey - Shopping Mall',
      description: 'Conduct customer satisfaction survey',
      promoter: 'Sunita Patel',
      location: 'Mumbai, Maharashtra',
      date: '2025-01-18',
      time: '02:00 PM',
      status: 'pending',
      category: 'survey',
      duration: '4 hours',
      participants: 30,
      photos: 0,
      notes: 'Survey questionnaire ready, pending final approval',
      priority: 'medium',
      submitted_at: '2025-01-16'
    },
    {
      id: 8,
      title: 'Corporate Partnership Event',
      description: 'Joint marketing event with corporate partner',
      promoter: 'Arjun Mehta',
      location: 'Pune, Maharashtra',
      date: '2025-01-22',
      time: '11:00 AM',
      status: 'pending',
      category: 'partnership',
      duration: '6 hours',
      participants: 75,
      photos: 0,
      notes: 'Partnership agreement signed, waiting for event approval',
      priority: 'high',
      submitted_at: '2025-01-18'
    },
    {
      id: 9,
      title: 'University Campus Drive',
      description: 'Brand awareness campaign at engineering college',
      promoter: 'Pooja Singh',
      location: 'Jaipur, Rajasthan',
      date: '2025-01-25',
      time: '09:30 AM',
      status: 'pending',
      category: 'education',
      duration: '5 hours',
      participants: 150,
      photos: 0,
      notes: 'College administration approval pending',
      priority: 'medium',
      submitted_at: '2025-01-19'
    },
    {
      id: 10,
      title: 'Trade Show Participation',
      description: 'Participate in industry trade show with product display',
      promoter: 'Deepak Sharma',
      location: 'Gurgaon, Haryana',
      date: '2025-01-28',
      time: '08:00 AM',
      status: 'pending',
      category: 'trade_show',
      duration: '10 hours',
      participants: 200,
      photos: 0,
      notes: 'Booth booking confirmed, waiting for budget approval',
      priority: 'high',
      submitted_at: '2025-01-20'
    }
  ];

  // Fetch pending activities from API using same logic as AllActivity
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError('');

        // Build query parameters - same as AllActivity
        const params = new URLSearchParams();
        params.append('per_page', '1000'); // Get all data to match dashboard counts
        
        // Always filter by pending status for this component
        params.append('status', 'pending');
        
        // Get date parameters from URL (from dashboard navigation)
        const searchParams = new URLSearchParams(location.search);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const url = `/api/activity-recces?${params.toString()}`;
        console.log('PendingActivity fetching with URL:', url);

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
          console.log('PendingActivity fetched:', activitiesData.length, 'activities');
        } else {
          throw new Error('Failed to fetch pending activities');
        }
      } catch (error) {
        console.error('Error fetching pending activities:', error);
        setError('Failed to load pending activities. Please try again.');
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
      accessorKey: "priority",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const priority = row.getValue("priority");
        const variant =
          priority === 'high' ? 'destructive' :
          priority === 'medium' ? 'default' :
          priority === 'low' ? 'secondary' : 'outline';

        return (
          <Badge variant={variant} className="font-medium capitalize">
            {priority}
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
      accessorKey: "submitted_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("submitted_at")).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-left p-0 h-auto font-semibold hover:bg-transparent"
        >
          Scheduled Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("date")).toLocaleDateString()}
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
              <DropdownMenuItem onClick={() => handleApprove(activity)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Activity
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleReject(activity)}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject Activity
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(activity)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Activity
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
    console.log('View activity:', activity);
  };

  const handleEdit = (activity) => {
    setSelectedActivity(activity);
    setIsDialogOpen(true);
  };

  const handleApprove = async (activity) => {
    if (window.confirm('Are you sure you want to approve this activity?')) {
      try {
        // TODO: Implement actual approve API call
        setActivities(prev => prev.filter(a => a.id !== activity.id));
        console.log('Approved activity:', activity.id);
      } catch (error) {
        console.error('Error approving activity:', error);
        setError('Failed to approve activity. Please try again.');
      }
    }
  };

  const handleReject = async (activity) => {
    if (window.confirm('Are you sure you want to reject this activity?')) {
      try {
        // TODO: Implement actual reject API call
        setActivities(prev => prev.filter(a => a.id !== activity.id));
        console.log('Rejected activity:', activity.id);
      } catch (error) {
        console.error('Error rejecting activity:', error);
        setError('Failed to reject activity. Please try again.');
      }
    }
  };

  const handleBulkApprove = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      alert('Please select activities to approve.');
      return;
    }

    if (window.confirm(`Are you sure you want to approve ${selectedRows.length} selected activities?`)) {
      try {
        const selectedIds = selectedRows.map(row => row.original.id);
        // TODO: Implement actual bulk approve API call
        setActivities(prev => prev.filter(a => !selectedIds.includes(a.id)));
        setRowSelection({});
        console.log('Bulk approved activities:', selectedIds);
      } catch (error) {
        console.error('Error bulk approving activities:', error);
        setError('Failed to approve activities. Please try again.');
      }
    }
  };

  const handleBulkReject = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      alert('Please select activities to reject.');
      return;
    }

    if (window.confirm(`Are you sure you want to reject ${selectedRows.length} selected activities?`)) {
      try {
        const selectedIds = selectedRows.map(row => row.original.id);
        // TODO: Implement actual bulk reject API call
        setActivities(prev => prev.filter(a => !selectedIds.includes(a.id)));
        setRowSelection({});
        console.log('Bulk rejected activities:', selectedIds);
      } catch (error) {
        console.error('Error bulk rejecting activities:', error);
        setError('Failed to reject activities. Please try again.');
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      // TODO: Implement actual API calls
      setActivities(prev => prev.map(a =>
        a.id === selectedActivity.id ? { ...a, ...formData } : a
      ));
      setIsDialogOpen(false);
      setSelectedActivity(null);
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

    if (priorityFilter !== 'all-priority') {
      filters.push({
        id: 'priority',
        value: priorityFilter,
      });
    }

    setColumnFilters(filters);
  }, [categoryFilter, promoterFilter, priorityFilter]);

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
          <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Pending Activities
            </h1>
            <p className="text-sm text-muted-foreground">
              Review and manage activities awaiting approval
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
              <Button size="sm" variant="default" onClick={handleBulkApprove}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Selected ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkReject}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject Selected ({table.getFilteredSelectedRowModel().rows.length})
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
                  placeholder="Search pending activities, promoters, locations..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-priority">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
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
                        <span className="ml-2">Loading pending activities...</span>
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
                        <Clock className="h-12 w-12 text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground">No pending activities found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          All activities have been reviewed
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

      {/* Activity Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Review Pending Activity</DialogTitle>
            <DialogDescription>
              Review and update the activity information before approval.
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
              <Label htmlFor="notes" className="text-right">
                Review Notes
              </Label>
              <Input
                id="notes"
                defaultValue={selectedActivity?.notes || ''}
                className="col-span-3"
                placeholder="Add review notes"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select defaultValue={selectedActivity?.priority || 'medium'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
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
                  Updating...
                </>
              ) : (
                'Update Activity'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingActivity;
