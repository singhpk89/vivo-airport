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

const PendingActivity = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toasts, removeToast, showError, showSuccess } = useToast();
    const { token } = useAuth();

    // Always set status to 'pending' for this component
    const getInitialStatusFromRoute = () => {
        return 'pending';
    };

    // Status filter is always disabled and set to pending
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

    // Filter state - status is always 'pending'
    const [statusFilter, setStatusFilter] = useState('pending');
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

    // Export states
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingPPT, setIsExportingPPT] = useState(false);

    // Fix N/A values state
    const [isFixingNAValues, setIsFixingNAValues] = useState(false);

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
            fetchActivities(filtersApplied), // Only apply filters if they've been explicitly applied
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

            // Use smaller page size for initial load to improve perceived performance
            const initialPageSize = applyFilters ? 1000 : 50; // Show 50 for quick initial load
            params.append('per_page', initialPageSize.toString());

            // Always filter by pending status for this component
            params.append('status', 'pending');

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

            const url = params.toString() ? `/api/activity-recces?${params.toString()}` : `/api/activity-recces?per_page=${initialPageSize}`;
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
                    setTotalActivities(apiResponse.meta?.total || apiResponse.data.total || activitiesData.length);
                } else if (Array.isArray(apiResponse.data)) {
                    activitiesData = apiResponse.data;
                    setTotalActivities(activitiesData.length);
                } else if (Array.isArray(apiResponse)) {
                    activitiesData = apiResponse;
                    setTotalActivities(activitiesData.length);
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
                const apiResponse = await response.json();
                console.log('Route plan filter options received:', apiResponse);

                // The API returns pre-calculated filter options
                if (apiResponse.success && apiResponse.data) {
                    const { states, districts, sub_districts, villages } = apiResponse.data;

                    setStateOptions(states || []);
                    setDistrictOptions(districts || []);
                    setSubDistrictOptions(sub_districts || []);
                    setVillageOptions(villages || []);

                    console.log('Filter options set:', {
                        states: (states || []).length,
                        districts: (districts || []).length,
                        subDistricts: (sub_districts || []).length,
                        villages: (villages || []).length
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching route plans:', error);
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
    };

    // Edit activity function
    const handleEditActivity = (activity) => {
        navigate(`/admin/activities/edit/${activity.id}`);
    };

    // Export PPT function
    const handleExportPPT = async () => {
        if (!stateFilter || stateFilter === 'all') {
            showError('Please select a specific state before exporting PowerPoint presentation. Exporting all states at once is not allowed for performance reasons.');
            return;
        }

        setIsExportingPPT(true);
        try {
            // Build query string from current filters
            const params = new URLSearchParams();
            params.append('status', 'pending'); // Always pending for this component
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

            const queryString = params.toString();
            const url = `/api/activity-recces/export-ppt${queryString ? '?' + queryString : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                }
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.statusText}`);
            }

            // Create blob and download
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;

            // Get filename from Content-Disposition header or use default
            let filename = 'pending_activities_presentation.pptx';
            const contentDisposition = response.headers.get('Content-Disposition');
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            showSuccess('PowerPoint presentation exported successfully');
        } catch (error) {
            console.error('PPT Export error:', error);
            showError(error.message || 'Failed to export PowerPoint presentation');
        } finally {
            setIsExportingPPT(false);
        }
    };

    // Export CSV function
    const handleExportActivity = async () => {
        setIsExporting(true);
        try {
            // Build query string from current filters
            const params = new URLSearchParams();
            params.append('status', 'pending'); // Always pending for this component
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

            const queryString = params.toString();
            const url = `/api/activity-recces/export-csv${queryString ? '?' + queryString : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'text/csv',
                }
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.statusText}`);
            }

            // Create blob and download
            const blob = await response.blob();
            const url_obj = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url_obj;

            let filename = 'pending_activities_export.csv';
            const contentDisposition = response.headers.get('Content-Disposition');
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url_obj);
            document.body.removeChild(a);

            showSuccess('Activities exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            showError(error.message || 'Failed to export activities');
        } finally {
            setIsExporting(false);
        }
    };

    // Fix N/A values function
    const handleFixNAValues = async () => {
        setIsFixingNAValues(true);
        try {
            const response = await fetch('/api/activity-recces/fix-na-values', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Fix operation failed: ${response.statusText}`);
            }

            const result = await response.json();
            showSuccess(`Successfully updated ${result.updated_count || 0} records with correct village codes`);

            // Refresh the activities data to show updated records
            await fetchActivities(true);
        } catch (error) {
            console.error('Fix N/A values error:', error);
            showError(error.message || 'Failed to fix N/A values');
        } finally {
            setIsFixingNAValues(false);
        }
    };

    // Status badge component
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
        setStatusFilter('pending'); // Keep status as pending
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

    // Table columns definition - matching AllActivity exactly
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
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Change Status</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleStatusChange(activity, 'approved')}>
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                        Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(activity, 'rejected')}>
                                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                        Reject
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }
    ];

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
                            <Clock className="h-5 w-5 text-orange-500" />
                            <span>Pending Activities</span>
                        </CardTitle>
                        <CardDescription>
                            Loading pending activities...
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
        <div className="h-full flex flex-col bg-background">
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

            {/* Header */}
            <div className="px-6 py-2 shrink-0 border-b border-border">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
                            <Clock className="h-6 w-6 text-orange-500" />
                            <span>Pending Activities ({totalActivities})</span>
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleFixNAValues}
                            variant="outline"
                            size="lg"
                            disabled={isFixingNAValues}
                        >
                            <Settings className="h-5 w-5 mr-2" />
                            {isFixingNAValues ? 'Fixing...' : 'Fix N/A Values'}
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/activity-recces/create')}
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
                                        onClick={handleResetFilters}
                                        disabled={loading}
                                        className="flex items-center gap-2 h-12 px-4 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="font-medium">Clear</span>
                                    </Button>
                                )}

                                {/* Active Filters Count */}
                                {(stateFilter !== 'all' || districtFilter !== 'all' ||
                                  subDistrictFilter !== 'all' || villageFilter !== 'all' || promoterFilter !== 'all' ||
                                  dateFilter !== 'all' || startDate || endDate) && (
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                        {[stateFilter, districtFilter, subDistrictFilter, villageFilter, promoterFilter, dateFilter]
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

                            {/* Status Filter - Disabled and shown as Pending */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                                <Select value="pending" disabled>
                                    <SelectTrigger className="h-11 border-border/50 bg-background/80 backdrop-blur-sm opacity-50 cursor-not-allowed">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                    Status filter is disabled for this view
                                </p>
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

                            {/* Apply Filter Button */}
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

                    {/* Table Section */}
                    <div className="bg-card shadow-md rounded-lg border border-border">
                        <div className="px-6 py-4 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                                        <Activity className="h-5 w-5" />
                                        <span>Activities List</span>
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Showing {table.getFilteredRowModel().rows.length} of {totalActivities} pending activities
                                    </p>
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
                        </div>

                        {/* Export Actions */}
                        <div className="flex items-center gap-2 p-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportPPT}
                                disabled={isExportingPPT}
                                className="h-8"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                {isExportingPPT ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        {formatDisplayValue("Export PPT")}
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportActivity}
                                disabled={isExporting}
                                className="h-8"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                {isExporting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        {formatDisplayValue("Export")}
                                    </>
                                )}
                            </Button>
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
                                                    No pending activities found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between space-x-2 py-4 px-6">
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
                    </div>
                </div>
            </div>

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

export default PendingActivity;
