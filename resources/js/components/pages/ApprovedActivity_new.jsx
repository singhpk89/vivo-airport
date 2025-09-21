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
  Activity,
  Calendar,
  MapPin,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  X,
  ChevronUp,
  Filter
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
import LazyImage from "@/components/ui/LazyImage";
import { formatTableValue, formatStatus, formatDisplayValue, toSentenceCase } from "@/utils/textUtils";
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
import { useToast, ToastContainer } from '../../components/ui/toast';
import { useAuth } from '../../contexts/AuthContext';

const ApprovedActivity = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toasts, removeToast, showError, showSuccess } = useToast();
    const { token } = useAuth();

    // Always set status to 'approved' for this component
    const getInitialStatusFromRoute = () => {
        return 'approved';
    };

    // Status filter is always disabled and set to approved
    const isStatusFilterDisabled = () => {
        return true;
    };

    // State
    const [activities, setActivities] = useState([]);
    const [totalActivities, setTotalActivities] = useState(0);
    const [promoters, setPromoters] = useState([]);
    const [routePlans, setRoutePlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter options derived from route plans
    const [stateOptions, setStateOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [subDistrictOptions, setSubDistrictOptions] = useState([]);
    const [villageOptions, setVillageOptions] = useState([]);

    // Table state
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');
    const [pageSize, setPageSize] = useState(10);

    // Filter state - status is always 'approved'
    const [statusFilter, setStatusFilter] = useState('approved');
    const [stateFilter, setStateFilter] = useState('all');
    const [districtFilter, setDistrictFilter] = useState('all');
    const [subDistrictFilter, setSubDistrictFilter] = useState('all');
    const [villageFilter, setVillageFilter] = useState('all');
    const [promoterFilter, setPromoterFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    // Image zoom dialog states
    const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);
    const [zoomedImage, setZoomedImage] = useState({ src: '', alt: '' });

    // Date range filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

    // Track applied filters state
    const [filtersApplied, setFiltersApplied] = useState(false);

    // Dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [bulkActionOpen, setBulkActionOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    // Handle image zoom
    const handleImageZoom = (src, alt) => {
        setZoomedImage({ src, alt });
        setIsZoomDialogOpen(true);
    };

    // Load data on mount and when URL params change
    useEffect(() => {
        // Handle date range parameters from dashboard navigation
        const urlParams = new URLSearchParams(location.search);
        const urlStartDate = urlParams.get('startDate');
        const urlEndDate = urlParams.get('endDate');

        if (urlStartDate || urlEndDate) {
            setDateFilter('custom');
            setStartDate(urlStartDate || '');
            setEndDate(urlEndDate || '');
            setFiltersApplied(true);
        }

        // Always load data
        fetchData();
    }, [location.search]);

    const fetchData = async () => {
        await Promise.all([
            fetchActivities(true), // Always apply filters for approved
            fetchPromoters(),
            fetchRoutePlans(),
        ]);
    };

    const fetchActivities = async (applyFilters = false) => {
        try {
            setLoading(true);
            setError('');

            // Build query parameters - same as AllActivity
            const params = new URLSearchParams();
            params.append('per_page', '1000'); // Get all data to match dashboard counts

            // Always filter by approved status for this component
            params.append('status', 'approved');

            // Apply other filters if requested
            if (applyFilters) {
                if (globalFilter) params.append('search', globalFilter);
                if (stateFilter !== 'all') params.append('state', stateFilter);
                if (districtFilter !== 'all') params.append('district', districtFilter);
                if (subDistrictFilter !== 'all') params.append('sub_district', subDistrictFilter);
                if (villageFilter !== 'all') params.append('village', villageFilter);
                if (promoterFilter !== 'all') params.append('promoter_id', promoterFilter);
                if (dateFilter !== 'all') {
                    if (dateFilter === 'custom' && (startDate || endDate)) {
                        if (startDate) params.append('start_date', startDate);
                        if (endDate) params.append('end_date', endDate);
                    } else {
                        params.append('date_filter', dateFilter);
                    }
                }
            }

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
                    setTotalActivities(apiResponse.meta?.total || apiResponse.data.total || activitiesData.length);
                } else if (Array.isArray(apiResponse.data)) {
                    activitiesData = apiResponse.data;
                    setTotalActivities(activitiesData.length);
                } else if (Array.isArray(apiResponse)) {
                    activitiesData = apiResponse;
                    setTotalActivities(activitiesData.length);
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

    const fetchPromoters = async () => {
        try {
            const response = await fetch('/api/promoters/filters', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPromoters(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching promoters:', error);
        }
    };

    const fetchRoutePlans = async () => {
        try {
            console.log('Fetching route plan filter options...');
            const response = await fetch('/api/route-plans/filter-options', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Route plan filter options received:', data);

                setRoutePlans(data.data || []);

                // Extract unique filter options
                const plans = data.data || [];
                const states = [...new Set(plans.map(p => p.state).filter(Boolean))];
                const districts = [...new Set(plans.map(p => p.district).filter(Boolean))];
                const subDistricts = [...new Set(plans.map(p => p.sub_district).filter(Boolean))];
                const villages = [...new Set(plans.map(p => p.village).filter(Boolean))];

                setStateOptions(states);
                setDistrictOptions(districts);
                setSubDistrictOptions(subDistricts);
                setVillageOptions(villages);

                console.log('Filter options set:', { states: states.length, districts: districts.length, subDistricts: subDistricts.length, villages: villages.length });
            }
        } catch (error) {
            console.error('Error fetching route plans:', error);
        }
    };

    // Apply filters function
    const handleApplyFilters = async () => {
        console.log('Applying filters with:', {
            statusFilter,
            stateFilter,
            districtFilter,
            subDistrictFilter,
            villageFilter,
            promoterFilter,
            dateFilter,
            startDate,
            endDate,
            globalFilter
        });

        setFiltersApplied(true);

        try {
            await fetchActivities(true); // true = apply filters
        } catch (error) {
            console.error('Error applying filters:', error);
            showError('Failed to apply filters');
        }
    };

    // Reset filters function
    const handleResetFilters = () => {
        setStatusFilter('approved'); // Keep status as approved
        setStateFilter('all');
        setDistrictFilter('all');
        setSubDistrictFilter('all');
        setVillageFilter('all');
        setPromoterFilter('all');
        setDateFilter('all');
        setStartDate('');
        setEndDate('');
        setGlobalFilter('');
        setFiltersApplied(false);

        // Fetch data without filters
        fetchActivities(false);
    };

    // Column definitions - same as AllActivity
    const columns = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")}
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
                    className="h-8 px-2 lg:px-3"
                >
                    ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium">
                    {formatTableValue(row.getValue("id"))}
                </div>
            ),
        },
        {
            accessorKey: "promoter_id",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    <User className="mr-2 h-4 w-4" />
                    Promoter
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const promoter = row.original.promoter;
                return (
                    <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                            {promoter?.name || 'N/A'}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "visit_date",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    Visit Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                        {formatTableValue(row.getValue("visit_date"), 'date')}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "location",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    <MapPin className="mr-2 h-4 w-4" />
                    Location
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center space-x-2 max-w-[200px]">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">
                        {formatTableValue(row.getValue("location"))}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "village",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Village
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="max-w-[150px] truncate">
                    {formatTableValue(row.getValue("village"))}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.getValue("status");
                return (
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {formatStatus(status)}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {formatTableValue(row.getValue("created_at"), 'datetime')}
                </span>
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
                            <DropdownMenuItem onClick={() => navigate(`/admin/activity-recces/${activity.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/activity-recces/${activity.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], [navigate]);

    // Table instance
    const table = useReactTable({
        data: activities,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        initialState: {
            pagination: {
                pageSize: pageSize,
            },
        },
        state: {
            sorting,
            columnFilters,
            rowSelection,
            globalFilter,
        },
    });

    // Effect to update table page size
    useEffect(() => {
        table.setPageSize(pageSize);
    }, [pageSize, table]);

    if (loading) {
        return (
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Approved Activities</span>
                        </CardTitle>
                        <CardDescription>
                            Loading approved activities...
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <span>Approved Activities</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Activities that have been approved ({totalActivities} total)
                    </p>
                </div>
                <Button onClick={() => navigate('/admin/activity-recces/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Activity
                </Button>
            </div>

            {/* Filters Card - Same as PendingActivity but with approved status */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <Filter className="h-5 w-5" />
                            <span>Filters</span>
                            {filtersApplied && (
                                <Badge variant="secondary" className="ml-2">
                                    Applied
                                </Badge>
                            )}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                        >
                            {isFiltersCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardHeader>

                {!isFiltersCollapsed && (
                    <CardContent className="space-y-4">
                        {/* Search */}
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search activities..."
                                value={globalFilter ?? ""}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>

                        {/* Filter Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* Status Filter - Disabled and shown as Approved */}
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value="approved" disabled>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="approved">Approved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* State Filter */}
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Select value={stateFilter} onValueChange={setStateFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All States</SelectItem>
                                        {stateOptions.map((state) => (
                                            <SelectItem key={state} value={state}>
                                                {toSentenceCase(state)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* District Filter */}
                            <div className="space-y-2">
                                <Label>District</Label>
                                <Select value={districtFilter} onValueChange={setDistrictFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select district" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Districts</SelectItem>
                                        {districtOptions.map((district) => (
                                            <SelectItem key={district} value={district}>
                                                {toSentenceCase(district)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sub District Filter */}
                            <div className="space-y-2">
                                <Label>Sub District</Label>
                                <Select value={subDistrictFilter} onValueChange={setSubDistrictFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sub district" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sub Districts</SelectItem>
                                        {subDistrictOptions.map((subDistrict) => (
                                            <SelectItem key={subDistrict} value={subDistrict}>
                                                {toSentenceCase(subDistrict)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Village Filter */}
                            <div className="space-y-2">
                                <Label>Village</Label>
                                <Select value={villageFilter} onValueChange={setVillageFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select village" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Villages</SelectItem>
                                        {villageOptions.map((village) => (
                                            <SelectItem key={village} value={village}>
                                                {toSentenceCase(village)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Promoter Filter */}
                            <div className="space-y-2">
                                <Label>Promoter</Label>
                                <Select value={promoterFilter} onValueChange={setPromoterFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select promoter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Promoters</SelectItem>
                                        {promoters.map((promoter) => (
                                            <SelectItem key={promoter.id} value={promoter.id.toString()}>
                                                {promoter.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Filter */}
                            <div className="space-y-2">
                                <Label>Date Range</Label>
                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select date range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Time</SelectItem>
                                        <SelectItem value="today">Today</SelectItem>
                                        <SelectItem value="week">Last 7 Days</SelectItem>
                                        <SelectItem value="month">Last 30 Days</SelectItem>
                                        <SelectItem value="custom">Custom Range</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Custom Date Range */}
                        {dateFilter === 'custom' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Filter Actions */}
                        <div className="flex items-center space-x-2 pt-4 border-t">
                            <Button onClick={handleApplyFilters}>
                                <Filter className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={handleResetFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Activities Table - Same structure as PendingActivity */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center space-x-2">
                                <Activity className="h-5 w-5" />
                                <span>Activities List</span>
                            </CardTitle>
                            <CardDescription>
                                Showing {table.getFilteredRowModel().rows.length} of {totalActivities} approved activities
                            </CardDescription>
                        </div>

                        {/* Table Controls */}
                        <div className="flex items-center space-x-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Columns3 className="mr-2 h-4 w-4" />
                                        Columns
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                >
                                                    {column.id.replace(/_/g, ' ')}
                                                </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 rows</SelectItem>
                                    <SelectItem value="20">20 rows</SelectItem>
                                    <SelectItem value="50">50 rows</SelectItem>
                                    <SelectItem value="100">100 rows</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
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
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            <div className="flex flex-col items-center space-y-2">
                                                <CheckCircle className="h-8 w-8 text-muted-foreground" />
                                                <span>No approved activities found.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} row(s) selected.
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium">
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Image Zoom Dialog */}
            <Dialog open={isZoomDialogOpen} onOpenChange={setIsZoomDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{zoomedImage.alt}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center">
                        <img
                            src={zoomedImage.src}
                            alt={zoomedImage.alt}
                            className="max-w-full max-h-[70vh] object-contain"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ApprovedActivity;
