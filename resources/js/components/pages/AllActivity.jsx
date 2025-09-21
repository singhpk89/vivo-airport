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

const AllActivity = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toasts, removeToast, showError, showSuccess } = useToast();
    const { token } = useAuth();

    // Determine initial status and if status filter should be disabled based on route
    const getInitialStatusFromRoute = () => {
        const path = location.pathname;
        const searchParams = new URLSearchParams(location.search);

        // Check URL search parameters first (from dashboard navigation)
        const statusParam = searchParams.get('status');
        if (statusParam && ['pending', 'approved', 'rejected'].includes(statusParam)) {
            return statusParam;
        }

        // Then check route path (existing functionality)
        if (path.includes('/pending-activity')) return 'pending';
        if (path.includes('/approved-activity')) return 'approved';
        if (path.includes('/rejected-activity')) return 'rejected';
        return 'all';
    };

    const isStatusFilterDisabled = () => {
        const path = location.pathname;
        const searchParams = new URLSearchParams(location.search);
        const statusParam = searchParams.get('status');

        // Disable if URL has status parameter or if on specific activity routes
        return (statusParam && ['pending', 'approved', 'rejected'].includes(statusParam)) ||
               path.includes('/pending-activity') ||
               path.includes('/approved-activity') ||
               path.includes('/rejected-activity');
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

    // Filter state - initialize status filter based on route
    const [statusFilter, setStatusFilter] = useState(getInitialStatusFromRoute());
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

    // Load data on mount (only if not navigated from dashboard with parameters)
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const hasStatusParam = urlParams.has('status');
        const hasDateParams = urlParams.has('start_date') || urlParams.has('end_date');

        // If no special parameters, load normal data
        if (!hasStatusParam && !hasDateParams) {
            fetchData();
        }
    }, []);

    // Handle route changes to update status filter
    useEffect(() => {
        const newStatus = getInitialStatusFromRoute();
        setStatusFilter(newStatus);

        // Handle date range parameters from dashboard navigation
        const urlParams = new URLSearchParams(location.search);
        const urlStartDate = urlParams.get('start_date');
        const urlEndDate = urlParams.get('end_date');

        if (urlStartDate || urlEndDate) {
            setDateFilter('custom');
            setStartDate(urlStartDate || '');
            setEndDate(urlEndDate || '');
            setFiltersApplied(true);
        }
        // Automatically apply filters when status changes from route or when date parameters are present
        if (newStatus !== 'all' || urlStartDate || urlEndDate) {
            setFiltersApplied(true);
            // Use setTimeout to allow state updates to complete before fetching
            setTimeout(() => {
                fetchData();
            }, 0);
        }
    }, [location.pathname, location.search, token]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Use Promise.allSettled to load data in parallel and handle partial failures gracefully
            const results = await Promise.allSettled([
                fetchActivities(),
                fetchPromoters(),
                fetchRoutePlans()
            ]);

            // Log any failed requests but don't block the UI
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    const apiNames = ['activities', 'promoters', 'route plans'];
                    console.warn(`Failed to load ${apiNames[index]}:`, result.reason);
                }
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async (applyFilters = false) => {
        try {
            // Build query parameters
            const params = new URLSearchParams();

            // Use smaller page size for initial load to improve perceived performance
            const initialPageSize = applyFilters ? 1000 : 50; // Show 50 for quick initial load
            params.append('per_page', initialPageSize.toString());

            // Only apply filters if requested (when Apply Filter button is clicked)
            if (applyFilters) {
                if (globalFilter) params.append('search', globalFilter);
                if (statusFilter !== 'all') params.append('status', statusFilter);
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

            const url = params.toString() ? `/api/activity-recces?${params.toString()}` : `/api/activity-recces?per_page=${initialPageSize}`;
            console.log('Fetching activities with URL:', url);

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
                    // Set total count from pagination metadata
                    setTotalActivities(apiResponse.meta?.total || apiResponse.data.total || activitiesData.length);
                } else if (Array.isArray(apiResponse.data)) {
                    activitiesData = apiResponse.data;
                    setTotalActivities(activitiesData.length);
                } else if (Array.isArray(apiResponse)) {
                    activitiesData = apiResponse;
                    setTotalActivities(activitiesData.length);
                }
                setActivities(activitiesData);
                console.log('Fetched activities:', activitiesData.length, 'Total:', apiResponse.meta?.total || apiResponse.data.total);
            } else {
                throw new Error('Failed to fetch activities');
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            showError('Failed to load activities');
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

            console.log('Filter options response status:', response.status);
            if (response.ok) {
                const apiResponse = await response.json();
                console.log('Filter options response:', apiResponse);

                if (apiResponse.success && apiResponse.data) {
                    const filterData = apiResponse.data;
                    console.log('Filter data:', filterData);

                    setStateOptions(filterData.states || []);
                    setDistrictOptions(filterData.districts || []);
                    setSubDistrictOptions(filterData.sub_districts || []);
                    setVillageOptions(filterData.villages || []);

                    console.log('Set filter options:', {
                        states: filterData.states,
                        districts: filterData.districts,
                        sub_districts: filterData.sub_districts,
                        villages: filterData.villages
                    });
                }
            } else {
                console.error('Failed to fetch filter options:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };

    // Apply Filters Handler
    const handleApplyFilters = async () => {
        setLoading(true);
        try {
            await fetchActivities(true); // true = apply filters
            setFiltersApplied(true); // Mark filters as applied
        } catch (error) {
            console.error('Error applying filters:', error);
        } finally {
            setLoading(false);
        }
    };

    // Clear Filters Handler
    const handleClearFilters = () => {
        setGlobalFilter('');
        setStatusFilter('all');
        setStateFilter('all');
        setDistrictFilter('all');
        setSubDistrictFilter('all');
        setVillageFilter('all');
        setPromoterFilter('all');
        setDateFilter('all');
        setStartDate('');
        setEndDate('');
        setFiltersApplied(false); // Mark filters as not applied
        // Automatically fetch data without filters
        fetchActivities(false);
    };

    // Handlers
    const handleCreateActivity = () => {
        navigate('/admin/activities/create');
    };

    const handleEditActivity = (activity) => {
        navigate(`/admin/activities/edit/${activity.id}`);
    };

    const handleViewActivity = (activity) => {
        navigate(`/admin/activities/view/${activity.id}`);
    };

    const handleDeleteActivity = (activity) => {
        setItemToDelete(activity);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const response = await fetch(`/api/activity-recces/${itemToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setActivities(activities.filter(activity => activity.id !== itemToDelete.id));
                showSuccess('Activity deleted successfully');
            } else {
                throw new Error('Failed to delete activity');
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
            showError('Error deleting activity');
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handleExportPPT = async () => {
        try {
            setLoading(true);

            // Validate that a state is selected for performance optimization
            if (stateFilter === 'all' || !stateFilter) {
                showError('Please select a specific state before exporting PowerPoint presentation. Exporting all states at once is not allowed for performance reasons.');
                setLoading(false);
                return;
            }

            // Construct query parameters based on current filters
            const params = new URLSearchParams();

            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            // State filter is required, so always append it
            params.append('state', stateFilter);
            if (districtFilter !== 'all') {
                params.append('district', districtFilter);
            }
            if (promoterFilter !== 'all') {
                params.append('promoter_id', promoterFilter);
            }

            // Add date filters if needed
            if (dateFilter !== 'all') {
                if (dateFilter === 'custom' && (startDate || endDate)) {
                    if (startDate) params.append('start_date', startDate);
                    if (endDate) params.append('end_date', endDate);
                } else {
                    params.append('date_filter', dateFilter);
                }
            }

            const queryString = params.toString();
            const url = `/api/activity-recces/export-ppt${queryString ? '?' + queryString : ''}`;

            // Create download request
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                },
            });

            if (!response.ok) {
                // Handle backend validation error for state requirement
                if (response.status === 422) {
                    const errorData = await response.json();
                    if (errorData.error_code === 'STATE_REQUIRED') {
                        throw new Error(errorData.message);
                    }
                }
                throw new Error(`Export failed: ${response.statusText}`);
            }

            // Create blob and download
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            // Get filename from response headers or create default
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'activities_presentation.pptx';

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            showSuccess('PowerPoint presentation exported successfully');

        } catch (error) {
            console.error('PPT Export error:', error);
            showError(error.message || 'Failed to export PowerPoint presentation');
        } finally {
            setLoading(false);
        }
    };

    const handleExportActivity = async () => {
        try {
            setLoading(true);

            // Construct query parameters based on current filters
            const params = new URLSearchParams();

            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            if (stateFilter !== 'all') {
                params.append('state', stateFilter);
            }
            if (districtFilter !== 'all') {
                params.append('district', districtFilter);
            }
            if (promoterFilter !== 'all') {
                params.append('promoter_id', promoterFilter);
            }

            // Add date filters if needed
            if (dateFilter !== 'all') {
                if (dateFilter === 'custom' && (startDate || endDate)) {
                    if (startDate) params.append('start_date', startDate);
                    if (endDate) params.append('end_date', endDate);
                } else {
                    params.append('date_filter', dateFilter);
                }
            }

            const queryString = params.toString();
            const url = `/api/activity-recces/export-csv${queryString ? '?' + queryString : ''}`;

            // Create download request
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/csv',
                },
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.statusText}`);
            }

            // Create blob and download
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            // Get filename from response headers or create default
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'activities_export.csv';

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            showSuccess('Activities exported successfully');

        } catch (error) {
            console.error('Export error:', error);
            showError(error.message || 'Failed to export activities');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkStatusUpdate = async (newStatus) => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        if (selectedRows.length === 0) return;

        const selectedIds = selectedRows.map(row => row.original.id);

        // Debug: Check token availability
        console.log('Token available:', !!token);
        console.log('CSRF token available:', !!document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'));
        console.log(`Bulk updating ${selectedIds.length} activities to status: ${newStatus}`);
        console.log('Selected IDs:', selectedIds);

        try {
            const response = await fetch('/api/activity-recces/bulk-update-status', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ids: selectedIds,
                    status: newStatus
                })
            });

            console.log(`Bulk update response:`, response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Bulk update failed:`, errorData);
                throw new Error(`Bulk update failed: ${errorData.message || response.statusText}`);
            }

            const responseData = await response.json();
            console.log('Bulk update successful:', responseData);

            showSuccess(`Updated ${selectedIds.length} activities to ${newStatus}`);

            // Update local state
            setActivities(activities.map(activity =>
                selectedIds.includes(activity.id)
                    ? { ...activity, status: newStatus }
                    : activity
            ));
            setRowSelection({});

        } catch (error) {
            console.error('Error updating activities:', error);
            showError(`Error updating activities: ${error.message}`);
        }
    };    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            pending: { variant: 'secondary', label: formatStatus('pending'), color: 'bg-yellow-100 text-yellow-800' },
            approved: { variant: 'success', label: formatStatus('approved'), color: 'bg-emerald-100 text-emerald-800' },
            rejected: { variant: 'destructive', label: formatStatus('rejected'), color: 'bg-red-100 text-red-800' },
            in_progress: { variant: 'default', label: formatStatus('in_progress'), color: 'bg-blue-100 text-blue-800' },
            completed: { variant: 'success', label: formatStatus('completed'), color: 'bg-emerald-100 text-emerald-800' },
            cancelled: { variant: 'destructive', label: formatStatus('cancelled'), color: 'bg-red-100 text-red-800' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <Badge variant={config.variant} className={config.color}>
                {config.label}
            </Badge>
        );
    };

    // Table columns definition
    const columns = [
        {
            id: "select",
            header: ({ table }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        // Visit Date & Time Column (Fixed)
        {
            accessorKey: "visit_date",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold w-full justify-center"
                >
                    Visit Date & Time
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => {
                const visitDate = row.getValue("visit_date");
                const formatDateTime = (dateStr) => {
                    if (!dateStr) return 'N/A';
                    try {
                        const date = new Date(dateStr);
                        const day = String(date.getUTCDate()).padStart(2, '0');
                        const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
                        const year = String(date.getUTCFullYear()).slice(-2);
                        const hours = String(date.getUTCHours()).padStart(2, '0');
                        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
                        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
                    } catch (error) {
                        return 'Invalid Date';
                    }
                };
                return (
                    <div className="truncate font-medium text-xs">
                        {formatDateTime(visitDate)}
                    </div>
                );
            },
        },
        // Fixed Columns - State, District, Sub District (Required to be sticky)
        {
            accessorKey: "state",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold w-full justify-center"
                >
                    State
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="truncate font-medium sentence-case">
                    {formatDisplayValue(row.getValue("state")) || 'N/A'}
                </div>
            ),
        },
        {
            accessorKey: "district",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold w-full justify-center"
                >
                    District
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="truncate font-medium sentence-case">
                    {formatDisplayValue(row.getValue("district")) || 'N/A'}
                </div>
            ),
        },
        {
            accessorKey: "sub_district",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold w-full justify-center"
                >
                    Sub District
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="truncate font-medium sentence-case">
                    {formatDisplayValue(row.getValue("sub_district")) || 'N/A'}
                </div>
            ),
        },
        {
            accessorKey: "village",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold w-full justify-center"
                >
                    Village
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="truncate font-medium sentence-case">
                    {formatDisplayValue(row.getValue("village")) || 'N/A'}
                </div>
            ),
        },
        // Other Columns (Scrollable)
        {
            accessorKey: "wall_code",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold"
                >
                    Wall Code
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="truncate font-mono text-sm sentence-case">
                    {formatDisplayValue(row.getValue("wall_code")) || 'N/A'}
                </div>
            ),
        },
        {
            accessorKey: "village_code",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold w-full justify-center"
                >
                    Village Code
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="truncate font-mono text-sm sentence-case">
                    {formatDisplayValue(row.getValue("village_code")) || 'N/A'}
                </div>
            ),
        },
        {
            accessorKey: "product_type",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold"
                >
                    Product Type
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="max-w-[110px] truncate sentence-case">
                    {formatDisplayValue(row.getValue("product_type")) || 'N/A'}
                </div>
            ),
        },
        {
            accessorKey: "promoter_id",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold"
                >
                    Promoter name
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => {
                const promoterId = row.getValue("promoter_id");
                const promoter = row.original.promoter || promoters.find(p => p.id === promoterId);
                return (
                    <div className="max-w-[140px] truncate">
                        {promoter ? promoter.name : 'N/A'}
                    </div>
                );
            },
        },
        {
            id: "coordinates",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold"
                >
                    Coordinates
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => {
                const latitude = row.original.latitude;
                const longitude = row.original.longitude;

                if (!latitude || !longitude || latitude === '0' || longitude === '0') {
                    return <div className="text-sm text-gray-500">N/A</div>;
                }

                const lat = parseFloat(latitude).toFixed(6);
                const lng = parseFloat(longitude).toFixed(6);
                const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

                return (
                    <div className="text-sm">
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline cursor-pointer inline-block"
                            title="Click to open in Google Maps"
                        >
                            📍 {lat}, {lng}
                        </a>
                    </div>
                );
            },
            accessorFn: (row) => `${row.latitude || ''}, ${row.longitude || ''}`,
        },
        {
            accessorKey: "location",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold"
                >
                    Location
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="max-w-[170px] truncate sentence-case">
                    {formatDisplayValue(row.getValue("location")) || 'N/A'}
                </div>
            ),
        },
        {
            accessorKey: "landmark",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold"
                >
                    Landmark
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="max-w-[170px] truncate sentence-case">
                    {formatDisplayValue(row.getValue("landmark")) || 'N/A'}
                </div>
            ),
        },
        {
            accessorKey: "close_shot1",
            header: "Close Shot 1",
            cell: ({ row }) => {
                const imageUrl = row.getValue("close_shot1");
                return (
                    <div className="w-16 h-16">
                        {imageUrl ? (
                            <LazyImage
                                src={imageUrl}
                                alt="Close Shot 1"
                                className="w-full h-full rounded border hover:ring-2 hover:ring-blue-300 hover:scale-105 transition-all duration-300 cursor-pointer"
                                onClick={() => handleImageZoom(imageUrl, "Close Shot 1")}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded border flex items-center justify-center">
                                <Camera className="h-6 w-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "close_shot_2",
            header: "Close Shot 2",
            cell: ({ row }) => {
                const imageUrl = row.getValue("close_shot_2");
                return (
                    <div className="w-16 h-16">
                        {imageUrl ? (
                            <LazyImage
                                src={imageUrl}
                                alt="Close Shot 2"
                                className="w-full h-full rounded border hover:ring-2 hover:ring-blue-300 hover:scale-105 transition-all duration-300 cursor-pointer"
                                onClick={() => handleImageZoom(imageUrl, "Close Shot 2")}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded border flex items-center justify-center">
                                <Camera className="h-6 w-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "long_shot_1",
            header: "Long Shot 1",
            cell: ({ row }) => {
                const imageUrl = row.getValue("long_shot_1");
                return (
                    <div className="w-16 h-16">
                        {imageUrl ? (
                            <LazyImage
                                src={imageUrl}
                                alt="Long Shot 1"
                                className="w-full h-full rounded border hover:ring-2 hover:ring-blue-300 hover:scale-105 transition-all duration-300 cursor-pointer"
                                onClick={() => handleImageZoom(imageUrl, "Long Shot 1")}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded border flex items-center justify-center">
                                <Camera className="h-6 w-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "long_shot_2",
            header: "Long Shot 2",
            cell: ({ row }) => {
                const imageUrl = row.getValue("long_shot_2");
                return (
                    <div className="w-16 h-16">
                        {imageUrl ? (
                            <LazyImage
                                src={imageUrl}
                                alt="Long Shot 2"
                                className="w-full h-full rounded border hover:ring-2 hover:ring-blue-300 hover:scale-105 transition-all duration-300 cursor-pointer"
                                onClick={() => handleImageZoom(imageUrl, "Long Shot 2")}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded border flex items-center justify-center">
                                <Camera className="h-6 w-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-6 px-1 text-xs font-semibold"
                >
                    Status
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <StatusBadge status={row.getValue("status")} />
            ),
        },
        {
            id: "actions",
            enableHiding: false,
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
                            <DropdownMenuItem onClick={() => handleViewActivity(activity)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDeleteActivity(activity)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    // Filter data based on all filters
    const filteredData = useMemo(() => {
        return activities.filter(activity => {
            const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
            const matchesState = stateFilter === 'all' || activity.state === stateFilter;
            const matchesDistrict = districtFilter === 'all' || activity.district === districtFilter;
            const matchesSubDistrict = subDistrictFilter === 'all' || activity.sub_district === subDistrictFilter;
            const matchesVillage = villageFilter === 'all' || activity.village === villageFilter;
            const matchesPromoter = promoterFilter === 'all' || activity.promoter_id?.toString() === promoterFilter;

            return matchesStatus && matchesState && matchesDistrict && matchesSubDistrict && matchesVillage && matchesPromoter;
        });
    }, [activities, statusFilter, stateFilter, districtFilter, subDistrictFilter, villageFilter, promoterFilter]);

    // Table setup
    const table = useReactTable({
        data: filteredData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize: pageSize,
            },
        },
    });

    // Error state
    if (error) {
        return (
            <div className="h-full flex items-center justify-center bg-background">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-background">
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

            {/* Header */}
            <div className="px-6 py-2 shrink-0 border-b border-border">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Activity List ({totalActivities})</h1>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleExportPPT}
                            variant="outlined"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <FileText className="h-5 w-5 mr-2" />
                                    {formatDisplayValue("Export PPT")}
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleExportActivity}
                            variant="outlined"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-5 w-5 mr-2" />
                                    {formatDisplayValue("Export")}
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleCreateActivity}
                            variant="filled"
                            size="lg"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Activity
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-background">
                <div className="p-4 space-y-4">

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-muted-foreground">Loading activities...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Enhanced Collapsible Search and Filters Section */}
                            <div className="bg-gradient-to-r from-card via-card/95 to-card shadow-lg rounded-xl border border-border/50 backdrop-blur-sm">
                                {/* Search Section - Always Visible */}
                                <div className="p-6 border-b border-border/30">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 max-w-md">
                                            <div className="relative group">
                                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    className="pl-12 h-12 border-border/50 bg-background/80 backdrop-blur-sm rounded-lg text-base placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                                    placeholder="Search activities, villages, states, districts..."
                                                    value={globalFilter ?? ""}
                                                    onChange={(event) => setGlobalFilter(event.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Filters Toggle Button */}
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                                            className="flex items-center gap-2 h-12 px-4 border-border/50 bg-background/80 hover:bg-primary/5 hover:border-primary/30 transition-all"
                                        >
                                            <SlidersHorizontal className="h-5 w-5" />
                                            <span className="font-medium">Filters</span>
                                            {isFiltersCollapsed ? (
                                                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                            ) : (
                                                <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                                            )}
                                        </Button>

                                        {/* Clear Filter Button */}
                                        {filtersApplied && (
                                            <Button
                                                variant="outline"
                                                onClick={handleClearFilters}
                                                disabled={loading}
                                                className="flex items-center gap-2 h-12 px-4 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                                            >
                                                <X className="h-4 w-4" />
                                                <span className="font-medium">Clear</span>
                                            </Button>
                                        )}

                                        {/* Active Filters Count */}
                                        {(statusFilter !== 'all' || stateFilter !== 'all' || districtFilter !== 'all' ||
                                          subDistrictFilter !== 'all' || villageFilter !== 'all' || promoterFilter !== 'all' ||
                                          dateFilter !== 'all' || startDate || endDate) && (
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                                {[statusFilter, stateFilter, districtFilter, subDistrictFilter, villageFilter, promoterFilter, dateFilter]
                                                    .filter(f => f !== 'all').length + (startDate || endDate ? 1 : 0)} active
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Collapsible Filters Section */}
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                    isFiltersCollapsed ? 'max-h-0' : 'max-h-[1000px]'
                                }`}>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {/* Row 1: Location Filters */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                                                <Select
                                                    value={statusFilter}
                                                    onValueChange={setStatusFilter}
                                                    disabled={isStatusFilterDisabled()}
                                                >
                                                    <SelectTrigger className={`h-11 border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/30 focus:border-primary/50 transition-all ${isStatusFilterDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/50 bg-background/95 backdrop-blur-lg">
                                                        <SelectItem value="all">All Status</SelectItem>
                                                        <SelectItem value="pending" className="sentence-case">{formatStatus('pending')}</SelectItem>
                                                        <SelectItem value="approved" className="sentence-case">{formatStatus('approved')}</SelectItem>
                                                        <SelectItem value="rejected" className="sentence-case">{formatStatus('rejected')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {isStatusFilterDisabled() && (
                                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                                        Status filter is disabled for this view
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">State</label>
                                                <Select value={stateFilter} onValueChange={setStateFilter}>
                                                    <SelectTrigger className="h-11 border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/30 focus:border-primary/50 transition-all">
                                                        <SelectValue placeholder="Select State" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/50 bg-background/95 backdrop-blur-lg">
                                                        <SelectItem value="all">All States</SelectItem>
                                                        {stateOptions.map((state) => (
                                                            <SelectItem key={state} value={state} className="sentence-case">
                                                                {formatDisplayValue(state)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">District</label>
                                                <Select value={districtFilter} onValueChange={setDistrictFilter}>
                                                    <SelectTrigger className="h-11 border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/30 focus:border-primary/50 transition-all">
                                                        <SelectValue placeholder="Select District" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/50 bg-background/95 backdrop-blur-lg">
                                                        <SelectItem value="all">All Districts</SelectItem>
                                                        {districtOptions.map((district) => (
                                                            <SelectItem key={district} value={district} className="sentence-case">
                                                                {formatDisplayValue(district)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sub District</label>
                                                <Select value={subDistrictFilter} onValueChange={setSubDistrictFilter}>
                                                    <SelectTrigger className="h-11 border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/30 focus:border-primary/50 transition-all">
                                                        <SelectValue placeholder="Select Sub District" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/50 bg-background/95 backdrop-blur-lg">
                                                        <SelectItem value="all">All Sub Districts</SelectItem>
                                                        {subDistrictOptions.map((subDistrict) => (
                                                            <SelectItem key={subDistrict} value={subDistrict} className="sentence-case">
                                                                {formatDisplayValue(subDistrict)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Row 2: Additional Filters */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Village</label>
                                                <Select value={villageFilter} onValueChange={setVillageFilter}>
                                                    <SelectTrigger className="h-11 border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/30 focus:border-primary/50 transition-all">
                                                        <SelectValue placeholder="Select Village" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/50 bg-background/95 backdrop-blur-lg">
                                                        <SelectItem value="all">All Villages</SelectItem>
                                                        {villageOptions.map((village) => (
                                                            <SelectItem key={village} value={village} className="sentence-case">
                                                                {formatDisplayValue(village)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Promoter</label>
                                                <Select value={promoterFilter} onValueChange={setPromoterFilter}>
                                                    <SelectTrigger className="h-11 border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/30 focus:border-primary/50 transition-all">
                                                        <SelectValue placeholder="Select Promoter" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/50 bg-background/95 backdrop-blur-lg">
                                                        <SelectItem value="all">All Promoters</SelectItem>
                                                        {promoters.map((promoter) => (
                                                            <SelectItem key={promoter.id} value={promoter.id.toString()} className="sentence-case">
                                                                {formatDisplayValue(promoter.name)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date Range</label>
                                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                                    <SelectTrigger className="h-11 border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/30 focus:border-primary/50 transition-all">
                                                        <SelectValue placeholder="Select Date Range" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/50 bg-background/95 backdrop-blur-lg">
                                                        <SelectItem value="all">All Dates</SelectItem>
                                                        <SelectItem value="today">Today</SelectItem>
                                                        <SelectItem value="week">Last 7 Days</SelectItem>
                                                        <SelectItem value="month">Last 30 Days</SelectItem>
                                                        <SelectItem value="custom">Custom Range</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Apply/Update Filter Button */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Action</label>
                                                <Button
                                                    onClick={handleApplyFilters}
                                                    disabled={loading}
                                                    className="h-11 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all"
                                                >
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    {loading ? 'Applying...' : filtersApplied ? 'Update Filter' : 'Apply Filter'}
                                                </Button>
                                            </div>

                                            {/* Clear Filters Action */}
                                        </div>

                                        {/* Custom Date Range Inputs */}
                                        {dateFilter === 'custom' && (
                                            <div className="mt-6 pt-6 border-t border-border/30">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Start Date</label>
                                                        <Input
                                                            type="date"
                                                            value={startDate}
                                                            onChange={(e) => setStartDate(e.target.value)}
                                                            className="h-11 border-border/50 bg-background/80 backdrop-blur-sm focus:border-primary/50 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">End Date</label>
                                                        <Input
                                                            type="date"
                                                            value={endDate}
                                                            onChange={(e) => setEndDate(e.target.value)}
                                                            className="h-11 border-border/50 bg-background/80 backdrop-blur-sm focus:border-primary/50 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bulk Actions */}
                            {table.getFilteredSelectedRowModel().rows.length > 0 && (
                                <div className="flex items-center gap-2 p-3 bg-primary/5 dark:bg-primary/10 shadow-sm rounded-lg">
                                    <span className="text-sm font-medium text-foreground">
                                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                                        {table.getFilteredRowModel().rows.length} row(s) selected
                                    </span>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Bulk Actions
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent alignOffset={-5}>
                                                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('pending')}>
                                                        Set as Pending
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('approved')}>
                                                        Set as Approved
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('rejected')}>
                                                        Set as Rejected
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}

                            {/* Table Container */}
                            <div className="bg-card shadow-sm rounded-lg overflow-hidden">
                                <div className="overflow-x-auto relative">
                                    <Table className="relative w-full table-fixed min-w-full">
                                        <TableHeader className="sticky top-0 z-30 bg-surface">
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id} className="border-b border-border h-8">
                                                    {headerGroup.headers.map((header) => {
                                                        const colClass = `col-${header.column.id}`;
                                                        const isStickyHeader = ['select', 'visit_date', 'state', 'district', 'sub_district', 'village'].includes(header.column.id);
                                                        return (
                                                            <TableHead
                                                                key={header.id}
                                                                className={`text-foreground bg-surface border-r border-border font-semibold h-8 py-1 ${isStickyHeader ? 'sticky-header' : ''} ${colClass}`}
                                                            >
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                            </TableHead>
                                                        );
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody className="bg-background">
                                            {table.getRowModel().rows?.length ? (
                                                table.getRowModel().rows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        data-state={row.getIsSelected() && "selected"}
                                                        className="border-b border-border hover:bg-muted/30 transition-colors duration-150"
                                                    >
                                                        {row.getVisibleCells().map((cell) => {
                                                            const colClass = `col-${cell.column.id}`;
                                                            const isStickyCell = ['select', 'visit_date', 'state', 'district', 'sub_district', 'village'].includes(cell.column.id);
                                                            return (
                                                                <TableCell key={cell.id} className={`text-foreground bg-background py-1 px-2 ${isStickyCell ? 'sticky-cell' : ''} ${colClass}`}>
                                                                    {flexRender(
                                                                        cell.column.columnDef.cell,
                                                                        cell.getContext()
                                                                    )}
                                                                </TableCell>
                                                            );
                                                        })}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={columns.length}
                                                        className="h-24 text-center text-muted-foreground bg-background"
                                                    >
                                                        No activities found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-2 py-4 shadow-sm bg-card">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected on this page. Total activities: {totalActivities}
                                </div>
                                <div className="flex items-center space-x-6 lg:space-x-8">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium text-foreground">Rows per page</p>
                                        <select
                                            value={table.getState().pagination.pageSize}
                                            onChange={(e) => {
                                                table.setPageSize(Number(e.target.value));
                                            }}
                                            className="h-8 w-[70px] rounded border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                                <option key={pageSize} value={pageSize}>
                                                    {pageSize}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex w-[100px] items-center justify-center text-sm font-medium text-foreground">
                                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outlined"
                                            size="icon-xs"
                                            className="hidden lg:flex"
                                            onClick={() => table.setPageIndex(0)}
                                            disabled={!table.getCanPreviousPage()}
                                        >
                                            <span className="sr-only">Go to first page</span>
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="icon-xs"
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                        >
                                            <span className="sr-only">Go to previous page</span>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="icon-xs"
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                        >
                                            <span className="sr-only">Go to next page</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="icon-xs"
                                            className="hidden lg:flex"
                                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                            disabled={!table.getCanNextPage()}
                                        >
                                            <span className="sr-only">Go to last page</span>
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Activity</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this activity? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3">
                        <Button variant="outlined" size="lg" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="error" size="lg" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Zoom Dialog */}
            <Dialog open={isZoomDialogOpen} onOpenChange={setIsZoomDialogOpen}>
                <DialogContent className="max-w-4xl w-full p-2">
                    <DialogHeader>
                        <DialogTitle>{zoomedImage.alt}</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center items-center p-4">
                        <img
                            src={zoomedImage.src}
                            alt={zoomedImage.alt}
                            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outlined"
                            onClick={() => window.open(zoomedImage.src, '_blank')}
                            className="mr-2"
                        >
                            Open in New Tab
                        </Button>
                        <Button variant="filled" onClick={() => setIsZoomDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AllActivity;
