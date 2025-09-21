import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Upload,
  FileText,
  ChevronDown,
  Eye,
  AlertCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  SlidersHorizontal,
  X,
  ChevronUp,
  Filter
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import ErrorBoundary from "./ErrorBoundary";
import { useToast, ToastContainer } from "@/components/ui/toast";
import { formatDisplayValue } from "@/utils/textUtils";

const RoutePlanManagement = () => {
    const { isMenuAccessible } = useAuth();
    const { toasts, removeToast, showError, showSuccess, showInfo } = useToast();
    const navigate = useNavigate();
    const [routePlans, setRoutePlans] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination and meta data
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 20,
        total: 0,
        total_records: 0,
        last_page: 1,
        from: 0,
        to: 0,
    });

    // Table state
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    // Hide some columns by default for better visibility
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    // Filter states
    const [stateFilter, setStateFilter] = useState('all-states');
    const [districtFilter, setDistrictFilter] = useState('all-districts');
    const [subDistrictFilter, setSubDistrictFilter] = useState('all-sub-districts');
    const [villageFilter, setVillageFilter] = useState('all-villages');
    const [statusFilter, setStatusFilter] = useState('all-status');

    // Filter UI state
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [filtersApplied, setFiltersApplied] = useState(false);

    // Filter options from server
    const [filterOptions, setFilterOptions] = useState({
        states: [],
        districts: [],
        sub_districts: [],
        villages: [],
    });

    const [error, setError] = useState('');

    // Database-wide selection state
    const [isAllDatabaseSelected, setIsAllDatabaseSelected] = useState(false);
    const [allDatabaseIds, setAllDatabaseIds] = useState([]);

    // Loading states for operations
    const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
    const [selectAllLoading, setSelectAllLoading] = useState(false);

    // Load route plans from API
    useEffect(() => {
        fetchRoutePlans();
        fetchFilterOptions();
    }, []);

    // Server-side filtering - only fetch when filters are applied
    useEffect(() => {
        if (filtersApplied) {
            fetchRoutePlans();
        }
    }, [filtersApplied, stateFilter, districtFilter, subDistrictFilter, villageFilter, statusFilter, globalFilter, pagination.per_page, pagination.current_page]);

    // Clear database-wide selection when filters change
    useEffect(() => {
        if (isAllDatabaseSelected) {
            setIsAllDatabaseSelected(false);
            setAllDatabaseIds([]);
            setRowSelection({});
        }
    }, [stateFilter, districtFilter, subDistrictFilter, villageFilter, statusFilter, globalFilter]);

    const fetchFilterOptions = async () => {
        try {
            const response = await fetch('/api/route-plans/filter-options', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const apiResponse = await response.json();
                if (apiResponse.success && apiResponse.data) {
                    setFilterOptions(apiResponse.data);
                }
            }
        } catch (err) {
            console.error('Error fetching filter options:', err);
        }
    };

    const fetchRoutePlans = async () => {
        try {
            setLoading(true);
            setError('');

            // Build query parameters
            const params = new URLSearchParams({
                page: pagination.current_page,
                per_page: pagination.per_page,
            });

            if (globalFilter) params.append('search', globalFilter);
            if (stateFilter !== 'all-states') params.append('state', stateFilter);
            if (districtFilter !== 'all-districts') params.append('district', districtFilter);
            if (subDistrictFilter !== 'all-sub-districts') params.append('sub_district', subDistrictFilter);
            if (villageFilter !== 'all-villages') params.append('village', villageFilter);

            const response = await fetch(`/api/route-plans?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const apiResponse = await response.json();
                if (apiResponse.success && apiResponse.data) {
                    console.log('Route Plans Data Structure:', apiResponse.data.data);
                    console.log('First Route Plan:', apiResponse.data.data[0]);
                    setRoutePlans(apiResponse.data.data);
                    setPagination({
                        current_page: apiResponse.data.current_page,
                        per_page: apiResponse.data.per_page,
                        total: apiResponse.data.total,
                        total_records: apiResponse.meta.total_records,
                        last_page: apiResponse.data.last_page,
                        from: apiResponse.meta.from || 0,
                        to: apiResponse.meta.to || 0,
                    });
                } else {
                    setError('Failed to load route plans');
                    setRoutePlans([]);
                }
            } else {
                setError('Failed to load route plans');
                setRoutePlans([]);
            }
        } catch (err) {
            setError('Error loading route plans');
            setRoutePlans([]);
            console.error('Error fetching route plans:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all route plan IDs for database-wide selection
    const fetchAllRouteIds = async () => {
        try {
            // Build query parameters for current filters
            const params = new URLSearchParams();

            if (globalFilter) params.append('search', globalFilter);
            if (stateFilter !== 'all-states') params.append('state', stateFilter);
            if (districtFilter !== 'all-districts') params.append('district', districtFilter);
            if (subDistrictFilter !== 'all-sub-districts') params.append('sub_district', subDistrictFilter);
            if (villageFilter !== 'all-villages') params.append('village', villageFilter);

            params.append('ids_only', 'true'); // Special parameter to get only IDs

            const response = await fetch(`/api/route-plans?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const apiResponse = await response.json();
                if (apiResponse.success && apiResponse.data) {
                    return apiResponse.data; // Array of IDs
                }
            }
            return [];
        } catch (err) {
            console.error('Error fetching all route IDs:', err);
            return [];
        }
    };

    // Helper function for status badges - using const to prevent hoisting issues
    const getStatusBadge = (status) => {
        const statusConfig = {
            active: {
                className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                label: 'Active'
            },
            pending: {
                className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                label: 'Pending'
            },
            completed: {
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                label: 'Completed'
            },
            cancelled: {
                className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
                label: 'Cancelled'
            }
        };

        const config = statusConfig[status] || statusConfig.active;
        return (
            <Badge className={`border ${config.className}`}>
                {config.label}
            </Badge>
        );
    };

    // Filter application functions
    const applyFilters = () => {
        setFiltersApplied(true);
        setPagination(prev => ({ ...prev, current_page: 1 })); // Reset to first page
    };

    const clearFilters = () => {
        setStateFilter('all-states');
        setDistrictFilter('all-districts');
        setSubDistrictFilter('all-sub-districts');
        setVillageFilter('all-villages');
        setStatusFilter('all-status');
        setGlobalFilter('');
        setFiltersApplied(false);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const hasActiveFilters = () => {
        return stateFilter !== 'all-states' ||
               districtFilter !== 'all-districts' ||
               subDistrictFilter !== 'all-sub-districts' ||
               villageFilter !== 'all-villages' ||
               statusFilter !== 'all-status' ||
               globalFilter !== '';
    };

    // Handler functions - defined before columns to prevent hoisting issues
    const handleEditRoutePlan = (routePlan) => {
        navigate(`/route-plans/${routePlan.id}/edit`);
    };

    const handleViewRoutePlan = (routePlan) => {
        // Implementation for view details
        console.log('View route plan:', routePlan);
    };

    const handleDeleteRoutePlan = async (id) => {
        if (!confirm('Are you sure you want to delete this route plan?')) return;

        try {
            const response = await fetch(`/api/route-plans/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Refresh the data after successful deletion
                fetchRoutePlans();
                showSuccess('Route plan deleted successfully');
            } else {
                showError('Failed to delete route plan');
            }
        } catch (err) {
            showError('Failed to delete route plan');
            console.error('Delete error:', err);
        }
    };

    // Helper to get a human friendly village label for a given village code
    const getVillageLabel = (code) => {
        if (!code) return code;
        const plan = routePlans.find(p => p.village_code === code);
        if (!plan) return code;
        // Use village name if available, otherwise fall back to village_code
        return plan.village || code;
    };

    // Since we're using server-side filtering, we don't need to filter the data here
    const filteredData = routePlans;

    // Column definitions
    const columns = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                    <Checkbox
                        checked={isAllDatabaseSelected || table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => {
                            if (value) {
                                table.toggleAllPageRowsSelected(true);
                            } else {
                                handleClearAllSelection();
                            }
                        }}
                        aria-label="Select all"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem onClick={() => table.toggleAllPageRowsSelected(true)}>
                                Select page ({table.getRowModel().rows.length})
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleSelectAllFromDatabase}
                                disabled={selectAllLoading}
                            >
                                {selectAllLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Selecting all...
                                    </>
                                ) : (
                                    `Select all from database (${pagination.total_records})`
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleClearAllSelection}>
                                Clear selection
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={isAllDatabaseSelected || row.getIsSelected()}
                        onCheckedChange={(value) => {
                            if (isAllDatabaseSelected && !value) {
                                // If deselecting from database-wide selection, convert to individual selection
                                setIsAllDatabaseSelected(false);
                                const newSelection = {};
                                allDatabaseIds.forEach(id => {
                                    if (id !== row.original.id) {
                                        // Find the row index for this ID in current page
                                        const rowIndex = table.getRowModel().rows.findIndex(r => r.original.id === id);
                                        if (rowIndex !== -1) {
                                            newSelection[rowIndex] = true;
                                        }
                                    }
                                });
                                setRowSelection(newSelection);
                                setAllDatabaseIds([]);
                            } else {
                                row.toggleSelected(!!value);
                            }
                        }}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },

        {
            accessorKey: "state",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    State
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium sentence-case">
                    {formatDisplayValue(row.getValue("state")) || "N/A"}
                </div>
            ),
        },
        {
            accessorKey: "district",
            header: "District",
            cell: ({ row }) => (
                <div className="font-medium sentence-case">
                    {formatDisplayValue(row.getValue("district")) || "N/A"}
                </div>
            ),
        },
        {
            accessorKey: "sub_district",
            header: "Sub District",
            cell: ({ row }) => (
                <div className="font-medium sentence-case">
                    {formatDisplayValue(row.getValue("sub_district")) || "N/A"}
                </div>
            ),
        },
        {
            accessorKey: "village",
            header: "Village",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate sentence-case">
                    {formatDisplayValue(row.getValue("village")) || "N/A"}
                </div>
            ),
        },

        {
            accessorKey: "village_code",
            header: "Village Code",
            cell: ({ row }) => (
                <div className="font-mono text-sm sentence-case">
                    {formatDisplayValue(row.getValue("village_code")) || 'N/A'}
                </div>
            ),
        },
        {
            accessorKey: "width",
            header: "Width (ft)",
            cell: ({ row }) => (
                <div className="text-right">
                    {parseFloat(row.getValue("width")).toFixed(2)}
                </div>
            ),
        },
        {
            accessorKey: "height",
            header: "Height (ft)",
            cell: ({ row }) => (
                <div className="text-right">
                    {parseFloat(row.getValue("height")).toFixed(2)}
                </div>
            ),
        },
        {
            accessorKey: "area",
            header: "Area (sqft)",
            cell: ({ row }) => (
                <div className="text-right font-medium">
                    {parseFloat(row.getValue("area")).toFixed(2)}
                </div>
            ),
        },
        {
            accessorKey: "wall_count",
            header: "Walls",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.getValue("wall_count")}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status");
                return getStatusBadge(status);
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const routePlan = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditRoutePlan(routePlan)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewRoutePlan(routePlan)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDeleteRoutePlan(routePlan.id)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
            enableHiding: false,
        },
    ], [getStatusBadge, handleEditRoutePlan, handleViewRoutePlan, handleDeleteRoutePlan]);

    // Columns that should remain visible when table scrolls horizontally
    const stickyColumns = ["select", "state", "district", "sub_district", "village", "village_code"];

    // NOTE: Column widths and sticky offsets are now driven by CSS classes (see app.css)

    const table = useReactTable({
        data: filteredData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        manualPagination: true, // Server-side pagination
        pageCount: pagination.last_page,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
            pagination: {
                pageIndex: pagination.current_page - 1,
                pageSize: pagination.per_page,
            },
        },
    });

    // Handle pagination changes
    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            current_page: newPage
        }));
    };

    const handlePageSizeChange = (newPageSize) => {
        setPagination(prev => ({
            ...prev,
            per_page: newPageSize,
            current_page: 1 // Reset to first page when changing page size
        }));
    };

    const handleCreateRoutePlan = () => {
        navigate('/route-plans/new');
    };

    // Bulk actions
    const handleBulkDelete = async () => {
        const selectedCount = getSelectedCount();
        if (selectedCount === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedCount} route plans?`)) return;

        try {
            setBulkDeleteLoading(true);
            const selectedIds = getSelectedIds();

            // Make API call to delete records from database
            const response = await fetch('/api/route-plans/bulk-delete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ids: selectedIds
                })
            });

            if (response.ok) {
                const apiResponse = await response.json();
                if (apiResponse.success) {
                    // Update local state to reflect changes
                    setRoutePlans(routePlans.filter(plan => !selectedIds.includes(plan.id)));
                    handleClearAllSelection();
                    showSuccess(`Deleted ${selectedCount} route plans`);
                    // Refresh the data to get updated counts
                    fetchRoutePlans();
                } else {
                    showError('Failed to delete: ' + (apiResponse.message || 'Unknown error'));
                }
            } else {
                showError('Failed to delete route plans');
            }
        } catch (error) {
            console.error('Error deleting route plans:', error);
            showError('Error deleting route plans');
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    const handleBulkStatusUpdate = async (newStatus) => {
        const selectedCount = getSelectedCount();
        if (selectedCount === 0) {
            console.warn('No items selected for bulk status update');
            return;
        }

        try {
            setBulkUpdateLoading(true);
            const selectedIds = getSelectedIds();

            console.log('=== BULK STATUS UPDATE DEBUG ===');
            console.log('Selected IDs:', selectedIds);
            console.log('New Status:', newStatus);
            console.log('Selected Count:', selectedCount);

            // Make API call to update status in database
            const response = await fetch('/api/route-plans/bulk-update-status', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ids: selectedIds,
                    status: newStatus
                })
            });

            console.log('API Response Status:', response.status);
            console.log('API Response Headers:', [...response.headers.entries()]);

            if (response.ok) {
                const apiResponse = await response.json();
                console.log('API Response Data:', apiResponse);

                if (apiResponse.success) {
                    // Update local state to reflect changes
                    setRoutePlans(prev => prev.map(plan =>
                        selectedIds.includes(plan.id) ? { ...plan, status: newStatus } : plan
                    ));
                    handleClearAllSelection();

                    showSuccess(`Successfully updated status to "${newStatus}" for ${selectedCount} route plans`);
                    console.log('✅ Status update successful');
                } else {
                    const errorMsg = 'Failed to update status: ' + (apiResponse.message || 'Unknown error');
                    console.error('❌ API returned error:', apiResponse);
                    showError(errorMsg);
                }
            } else {
                const errorText = await response.text();
                console.error('❌ HTTP Error:', response.status, errorText);
                showError(`Failed to update status (${response.status})`);
            }
        } catch (error) {
            console.error('❌ Network/Exception Error:', error);
            showError('Network error while updating status');
        } finally {
            setBulkUpdateLoading(false);
            console.log('=== END BULK STATUS UPDATE DEBUG ===');
        }
    };

    // Database-wide selection functions
    const handleSelectAllFromDatabase = async () => {
        try {
            setSelectAllLoading(true);
            const allIds = await fetchAllRouteIds();
            setAllDatabaseIds(allIds);
            setIsAllDatabaseSelected(true);

            // Also select all current page rows
            const currentPageRowSelection = {};
            table.getRowModel().rows.forEach((row) => {
                currentPageRowSelection[row.id] = true;
            });
            setRowSelection(currentPageRowSelection);

            showInfo(`Selected all ${allIds.length} route plans from database`);
        } catch (error) {
            showError('Failed to select all route plans from database');
        } finally {
            setSelectAllLoading(false);
        }
    };

    const handleClearAllSelection = () => {
        setIsAllDatabaseSelected(false);
        setAllDatabaseIds([]);
        setRowSelection({});
    };

    const getSelectedCount = () => {
        if (isAllDatabaseSelected) {
            return allDatabaseIds.length;
        }
        return table.getFilteredSelectedRowModel().rows.length;
    };

    const getSelectedIds = () => {
        if (isAllDatabaseSelected) {
            return allDatabaseIds;
        }
        return table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <div className="text-lg">Loading route plans...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="px-6 py-4 shrink-0 border-b border-border">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Route Plans</h1>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleCreateRoutePlan}
                            variant="success"
                            size="default"
                        >
                            <Plus className="h-4 w-4" />
                            {formatDisplayValue("Add Route Plan")}
                        </Button>
                        <Button
                            onClick={() => navigate('/route-plans/import')}
                            variant="filled-tonal"
                            size="default"
                        >
                            <Upload className="h-4 w-4" />
                            {formatDisplayValue("Import Route Plans")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-background">
                <div className="p-6 h-full flex flex-col">
                    <div className="space-y-6 flex-shrink-0">

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-muted-foreground">Loading route plans...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Search and Filters */}
                            <Card className="shadow-sm">
                                <CardContent className="p-6">
                                    {/* Search Row */}
                                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search route plans (state, district, village, etc.)..."
                                                value={globalFilter}
                                                onChange={(e) => setGlobalFilter(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFiltersExpanded(!filtersExpanded)}
                                                className="flex items-center gap-2"
                                            >
                                                <SlidersHorizontal className="h-4 w-4" />
                                                Filters
                                                {filtersExpanded ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                            {hasActiveFilters() && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearFilters}
                                                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Clear Filters
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expandable Filter Section */}
                                    {filtersExpanded && (
                                        <div className="border-t pt-4 space-y-4">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <Label htmlFor="state-filter" className="text-sm font-medium mb-2 block">
                                                        State
                                                    </Label>
                                                    <Select value={stateFilter} onValueChange={setStateFilter}>
                                                        <SelectTrigger id="state-filter" className="sentence-case">
                                                            <SelectValue placeholder="All States" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all-states">All States</SelectItem>
                                                            {filterOptions.states.map(state => (
                                                                <SelectItem key={state} value={state} className="sentence-case">{formatDisplayValue(state)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="district-filter" className="text-sm font-medium mb-2 block">
                                                        District
                                                    </Label>
                                                    <Select value={districtFilter} onValueChange={setDistrictFilter}>
                                                        <SelectTrigger id="district-filter" className="sentence-case">
                                                            <SelectValue placeholder="All Districts" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all-districts">All Districts</SelectItem>
                                                            {filterOptions.districts.map(district => (
                                                                <SelectItem key={district} value={district} className="sentence-case">{formatDisplayValue(district)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="sub-district-filter" className="text-sm font-medium mb-2 block">
                                                        Sub District
                                                    </Label>
                                                    <Select value={subDistrictFilter} onValueChange={setSubDistrictFilter}>
                                                        <SelectTrigger id="sub-district-filter" className="sentence-case">
                                                            <SelectValue placeholder="All Sub Districts" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all-sub-districts">All Sub Districts</SelectItem>
                                                            {filterOptions.sub_districts.map(subDistrict => (
                                                                <SelectItem key={subDistrict} value={subDistrict} className="sentence-case">{formatDisplayValue(subDistrict)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="village-filter" className="text-sm font-medium mb-2 block">
                                                        Village
                                                    </Label>
                                                    <Select value={villageFilter} onValueChange={setVillageFilter}>
                                                        <SelectTrigger id="village-filter" className="sentence-case">
                                                            <SelectValue placeholder="All Villages" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all-villages">All Villages</SelectItem>
                                                            {filterOptions.villages.map(village => (
                                                                <SelectItem key={village} value={village} className="sentence-case">{formatDisplayValue(village)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <Label htmlFor="status-filter" className="text-sm font-medium mb-2 block">
                                                        Status
                                                    </Label>
                                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                        <SelectTrigger id="status-filter">
                                                            <SelectValue placeholder="All Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all-status">All Status</SelectItem>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div></div>
                                                <div></div>
                                                <div className="flex items-end">
                                                    <Button
                                                        onClick={applyFilters}
                                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                                                        size="sm"
                                                    >
                                                        <Filter className="h-4 w-4 mr-2" />
                                                        {filtersApplied ? 'Update Filter' : 'Apply Filter'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
            {/* Bulk Actions */}
            {(getSelectedCount() > 0) && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 dark:bg-primary/10 shadow-sm rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                            {getSelectedCount()} {isAllDatabaseSelected ? 'of all' : 'of ' + table.getFilteredRowModel().rows.length} row(s) selected
                        </span>
                        {isAllDatabaseSelected && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                All from database
                            </Badge>
                        )}
                    </div>

                    {!isAllDatabaseSelected && getSelectedCount() === table.getFilteredRowModel().rows.length && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAllFromDatabase}
                            disabled={selectAllLoading}
                            className="text-xs"
                        >
                            {selectAllLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Selecting...
                                </>
                            ) : (
                                `Select all ${pagination.total_records} from database`
                            )}
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={bulkUpdateLoading || bulkDeleteLoading}
                            >
                                {(bulkUpdateLoading || bulkDeleteLoading) ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Settings className="h-4 w-4 mr-2" />
                                )}
                                Bulk Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger disabled={bulkUpdateLoading || bulkDeleteLoading}>
                                    {bulkUpdateLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Updating Status...
                                        </>
                                    ) : (
                                        'Update Status'
                                    )}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent alignOffset={-5}>
                                    <DropdownMenuItem
                                        onClick={() => handleBulkStatusUpdate('active')}
                                        disabled={bulkUpdateLoading || bulkDeleteLoading}
                                    >
                                        Set as Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleBulkStatusUpdate('pending')}
                                        disabled={bulkUpdateLoading || bulkDeleteLoading}
                                    >
                                        Set as Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleBulkStatusUpdate('completed')}
                                        disabled={bulkUpdateLoading || bulkDeleteLoading}
                                    >
                                        Set as Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleBulkStatusUpdate('cancelled')}
                                        disabled={bulkUpdateLoading || bulkDeleteLoading}
                                    >
                                        Set as Cancelled
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleBulkDelete}
                                className="text-red-600"
                                disabled={bulkUpdateLoading || bulkDeleteLoading}
                            >
                                {bulkDeleteLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                {bulkDeleteLoading ? 'Deleting...' : `Delete Selected (${getSelectedCount()})`}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllSelection}
                    >
                        Clear Selection
                    </Button>
                </div>
            )}

            {/* Data Table with Fixed Footer */}
            <div className="route-plan-table-container bg-card shadow-sm rounded-lg overflow-hidden">
                {/* Table Container with Scrollable Body */}
                <div className="flex-1 overflow-hidden">
                    <div className="overflow-x-auto">
                        <div style={{ minWidth: '1200px' }}>
                            <Table className="table-fixed" style={{ tableLayout: 'fixed', width: '100%' }}>
                                {/* Fixed Header */}
                                <TableHeader className="table-header">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} className="border-b border-border bg-muted/50 h-10 table-row">
                                            {headerGroup.headers.map((header) => {
                                                const key = header.id || header.column.id || header.column.accessorKey;
                                                const isSticky = stickyColumns.includes(key);
                                                const colClass = `col-${key}`;
                                                return (
                                                    <TableHead key={header.id} className={`text-muted-foreground font-medium py-2 px-3 h-10 align-top table-cell ${isSticky ? 'sticky-header' : ''} ${colClass}`}>
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
                            </Table>

                            {/* Scrollable Table Body */}
                            <div className="table-body-scroll">
                                <Table className="table-fixed" style={{ tableLayout: 'fixed', width: '100%' }}>
                                    <TableBody>
                                        {table.getRowModel().rows?.length ? (
                                            table.getRowModel().rows.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    data-state={row.getIsSelected() && "selected"}
                                                    className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer table-row"
                                                    onClick={() => navigate(`/route-plans/${row.original.id}`)}
                                                >
                                                    {row.getVisibleCells().map((cell) => {
                                                        const key = cell.column.id || cell.column.accessorKey;
                                                        const isStickyCell = stickyColumns.includes(key);
                                                        const colClass = `col-${key}`;
                                                        return (
                                                            <TableCell key={cell.id} className={`text-foreground align-top py-2 px-3 table-cell ${isStickyCell ? 'sticky-cell' : ''} ${colClass}`}>
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
                                            <TableRow className="table-row">
                                                <TableCell
                                                    colSpan={columns.length}
                                                    className="h-24 text-center text-muted-foreground table-cell"
                                                >
                                                    No route plans found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Pagination Footer */}
                <div className="flex-shrink-0 border-t border-border bg-card/50 sticky bottom-0 z-10">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex-1 flex items-center justify-between">
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                {/* Total count display like Filament */}
                                <div className="flex items-center gap-2">
                                    <span>
                                        Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} results
                                    </span>
                                    <span className="text-muted-foreground/80">
                                        ({pagination.total_records} total records)
                                    </span>
                                </div>

                                {/* Selected count */}
                                {getSelectedCount() > 0 && (
                                    <span className="text-blue-600 font-medium">
                                        {getSelectedCount()} selected
                                        {isAllDatabaseSelected && (
                                            <span className="text-xs text-blue-500 ml-1">(all from database)</span>
                                        )}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Rows per page */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-foreground">Rows per page</label>
                                    <select
                                        value={pagination.per_page}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        className="h-8 w-[80px] rounded border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Page info */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                        Page {pagination.current_page} of {pagination.last_page}
                                    </span>
                                </div>

                                {/* Pagination buttons */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(1)}
                                        disabled={pagination.current_page <= 1}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        disabled={pagination.current_page <= 1}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                        disabled={pagination.current_page >= pagination.last_page}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.last_page)}
                                        disabled={pagination.current_page >= pagination.last_page}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                        </>
                    )}
                    </div>
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
};

const WrappedRoutePlanManagement = () => (
    <ErrorBoundary>
        <RoutePlanManagement />
    </ErrorBoundary>
);

export default WrappedRoutePlanManagement;
