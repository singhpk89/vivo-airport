import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatTableValue, formatStatus, formatDisplayValue, toSentenceCase } from "@/utils/textUtils";
import {
    Plus,
    Search,
    Download,
    Trash2,
    Edit,
    Eye,
    UserCheck,
    Users,
    MapPin,
    Calendar,
    Smartphone,
    Upload,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Settings,
    RefreshCw,
    MoreHorizontal
} from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/toast';

const PromoterManagement = () => {
    const navigate = useNavigate();
    const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [stateFilter, setStateFilter] = useState('all-states');
    const [districtFilter, setDistrictFilter] = useState('all-districts');
    const [statusFilter, setStatusFilter] = useState('all-status');
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState([]);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [uniqueStates, setUniqueStates] = useState([]);
    const [uniqueDistricts, setUniqueDistricts] = useState([]);

    // Sticky columns configuration
    const stickyColumns = ['select', 'name'];

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/promoters?per_page=1000', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
            });
            const result = await response.json();
            if (result.success) {
                setData(result.data);

                // Extract unique states and districts
                const states = [...new Set(result.data.map(item => item.state).filter(Boolean))];
                const districts = [...new Set(result.data.map(item => item.district).filter(Boolean))];
                setUniqueStates(states);
                setUniqueDistricts(districts);
            }
        } catch (error) {
            console.error('Error fetching promoters:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter data based on filters
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesState = stateFilter === 'all-states' || item.state === stateFilter;
            const matchesDistrict = districtFilter === 'all-districts' || item.district === districtFilter;
            const matchesStatus = statusFilter === 'all-status' || item.status === statusFilter;

            return matchesState && matchesDistrict && matchesStatus;
        });
    }, [data, stateFilter, districtFilter, statusFilter]);

    // Table columns
    const columns = useMemo(() => [
        {
            id: 'select',
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
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium sentence-case">{formatDisplayValue(row.getValue('name'))}</div>
            ),
        },
        {
            accessorKey: 'username',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Username
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">{row.getValue('username')}</div>
            ),
        },
        {
            accessorKey: 'state',
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
                <div className="flex items-center gap-1 sentence-case">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {formatDisplayValue(row.getValue('state')) || 'N/A'}
                </div>
            ),
        },
        {
            accessorKey: 'district',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    District
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="text-sm sentence-case">{formatDisplayValue(row.getValue('district')) || 'N/A'}</div>
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.getValue('status');
                const statusColors = {
                    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
                    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    suspended: 'bg-red-100 text-red-800 border-red-200',
                };
                return (
                    <Badge className={`border ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {formatStatus(status)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'is_logged_in',
            header: 'Login Status',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${row.getValue('is_logged_in') ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    {row.getValue('is_logged_in') ? 'Online' : 'Offline'}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    {/* Primary quick actions - always visible */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/acl/promoters/${row.original.id}/view`);
                        }}
                        title="View Details"
                        className="h-8 w-8 p-0"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>

                    {/* More actions dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/acl/promoters/${row.original.id}/edit`);
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Promoter
                            </DropdownMenuItem>

                            {row.original.is_logged_in && (
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleResetLogin(row.original.id, row.original.name);
                                    }}
                                    className="text-blue-600"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reset Login Status
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSingle(row.original.id);
                                }}
                                className="text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Promoter
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ], []);

    const table = useReactTable({
        data: filteredData,
        columns,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const searchableColumns = ['name', 'username', 'state', 'district'];
            return searchableColumns.some(col => {
                const cellValue = row.getValue(col);
                return cellValue && cellValue.toString().toLowerCase().includes(search);
            });
        },
        state: {
            sorting,
            rowSelection,
            globalFilter,
        },
    });

    const handleDeleteSingle = (id) => {
        setItemsToDelete([id]);
        setShowDeleteDialog(true);
    };

    const handleBulkDelete = () => {
        const selectedIds = Object.keys(rowSelection).map(key => filteredData[parseInt(key)]?.id).filter(Boolean);
        setItemsToDelete(selectedIds);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        setDeleteLoading(true);
        try {
            if (itemsToDelete.length === 1) {
                const response = await fetch(`/api/promoters/${itemsToDelete[0]}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Delete failed');
                }

                showSuccess('Promoter deleted successfully');
            } else {
                const response = await fetch('/api/promoters/bulk-delete', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ids: itemsToDelete }),
                });

                if (!response.ok) {
                    throw new Error('Bulk delete failed');
                }

                showSuccess(`${itemsToDelete.length} promoters deleted successfully`);
            }

            setShowDeleteDialog(false);
            setRowSelection({});
            fetchData();
        } catch (error) {
            console.error('Error deleting promoters:', error);
            showError('Failed to delete promoters. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleBulkStatusUpdate = async (newStatus) => {
        const selectedIds = Object.keys(rowSelection).map(key => filteredData[parseInt(key)]?.id).filter(Boolean);
        if (selectedIds.length === 0) return;

        try {
            const response = await fetch('/api/promoters/bulk-update-status', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ids: selectedIds,
                    status: newStatus
                }),
            });

            if (response.ok) {
                showSuccess(`Successfully updated status to ${newStatus} for ${selectedIds.length} promoters`);
                setRowSelection({});
                fetchData();
            } else {
                showError('Failed to update promoter status');
            }
        } catch (error) {
            console.error('Error updating promoter status:', error);
            showError('Failed to update promoter status');
        }
    };

    const handleResetLogin = async (promoterId, promoterName) => {
        if (!confirm(`Are you sure you want to reset login status for ${promoterName}? This will log them out from all devices and allow them to login again.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/promoters/${promoterId}/reset-login`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                showSuccess(`Login status reset successfully for ${promoterName}. They can now login on another device.`);
                fetchData(); // Refresh the data to show updated status
            } else {
                const errorData = await response.json();
                showError(`Failed to reset login status: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error resetting login status:', error);
            showError('Failed to reset login status');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <div className="h-full flex flex-col bg-surface">
            {/* Header */}
            <div className="bg-surface-container border-b border-outline-variant px-6 py-3 shrink-0">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-headline-small font-bold text-on-surface">Promoter Management</h1>
                        <p className="text-body-small text-on-surface-variant">Manage promoters, their assignments, and track their activities</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => navigate('/acl/promoters/import')}>
                            <Upload className="h-4 w-4 mr-2" />
                            {formatDisplayValue("Import")}
                        </Button>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            {formatDisplayValue("Export")}
                        </Button>
                        <Button onClick={() => navigate('/acl/promoters/create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Promoter
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-2xl font-bold">{data.length}</p>
                                <p className="text-sm text-muted-foreground">Total Promoters</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-8 w-8 text-emerald-600" />
                            <div>
                                <p className="text-2xl font-bold">{data.filter(p => p.status === 'active').length}</p>
                                <p className="text-sm text-muted-foreground">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <div className="h-4 w-4 bg-emerald-500 rounded-full" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{data.filter(p => p.is_logged_in).length}</p>
                                <p className="text-sm text-muted-foreground">Online Now</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="text-2xl font-bold">{uniqueStates.length}</p>
                                <p className="text-sm text-muted-foreground">States Covered</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        {/* Global Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search promoters..."
                                value={globalFilter ?? ''}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="pl-10 w-full md:w-[300px]"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2">
                            {/* State Filter */}
                            <Select value={stateFilter} onValueChange={setStateFilter}>
                                <SelectTrigger className="w-[160px] sentence-case">
                                    <SelectValue placeholder="Filter by State" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border border-border shadow-xl z-[100] backdrop-blur-sm">
                                    <SelectItem value="all-states">All States</SelectItem>
                                    {uniqueStates.map(state => (
                                        <SelectItem key={state} value={state} className="sentence-case">{formatDisplayValue(state)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* District Filter */}
                            <Select value={districtFilter} onValueChange={setDistrictFilter}>
                                <SelectTrigger className="w-[160px] sentence-case">
                                    <SelectValue placeholder="Filter by District" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border border-border shadow-xl z-[100] backdrop-blur-sm">
                                    <SelectItem value="all-districts">All Districts</SelectItem>
                                    {uniqueDistricts.map(district => (
                                        <SelectItem key={district} value={district} className="sentence-case">{formatDisplayValue(district)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border border-border shadow-xl z-[100] backdrop-blur-sm">
                                    <SelectItem value="all-status">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedCount > 0 && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 dark:bg-primary/10 shadow-sm rounded-lg">
                    <span className="text-sm font-medium text-foreground">
                        {selectedCount} of{" "}
                        {filteredData.length} row(s) selected
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
                                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('active')}>
                                        Set as Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('inactive')}>
                                        Set as Inactive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('pending')}>
                                        Set as Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('suspended')}>
                                        Set as Suspended
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleBulkDelete} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Selected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRowSelection({})}
                    >
                        Clear Selection
                    </Button>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-card shadow-sm rounded-lg overflow-x-auto">
                <div style={{ minWidth: '1200px' }}>
                    <Table className="table-fixed" style={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-b border-border bg-muted/50 h-10">
                                    {headerGroup.headers.map((header) => {
                                        const key = header.id || header.column.id || header.column.accessorKey;
                                        const isSticky = stickyColumns.includes(key);
                                        const colClass = `col-${key}`;
                                        return (
                                            <TableHead key={header.id} className={`text-muted-foreground font-medium py-2 px-3 h-10 align-top ${isSticky ? 'sticky-header' : ''} ${colClass}`}>
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
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/acl/promoters/${row.original.id}/view`)}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const key = cell.column.id || cell.column.accessorKey;
                                            const isStickyCell = stickyColumns.includes(key);
                                            const colClass = `col-${key}`;
                                            return (
                                                <TableCell key={cell.id} className={`text-foreground align-top py-2 px-3 ${isStickyCell ? 'sticky-cell' : ''} ${colClass}`}>
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
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No promoters found.
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
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
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
                            {[10, 20, 30, 50, 100].map((pageSize) => (
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {itemsToDelete.length} promoter{itemsToDelete.length > 1 ? 's' : ''}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={deleteLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
                </div>
            </div>
            <ToastContainer
                toasts={toasts}
                removeToast={removeToast}
            />
        </div>
    );
};

export default PromoterManagement;
