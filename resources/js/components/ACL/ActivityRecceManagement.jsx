import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Activity, Plus, Search, Edit, Trash2, Eye, Star, Camera, Phone, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ActivityRecceManagement = () => {
    const [activities, setActivities] = useState([]);
    const [promoters, setPromoters] = useState([]);
    const [routePlans, setRoutePlans] = useState([]);
    const [activityTypes, setActivityTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [promoterFilter, setPromoterFilter] = useState('all');
    const [productTypeFilter, setProductTypeFilter] = useState('all');
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [dashboardStats, setDashboardStats] = useState(null);

    const { apiCall } = useAuth();

    useEffect(() => {
        fetchActivities();
        fetchDashboardStats();
        fetchPromoters();
        fetchRoutePlans();
        fetchActivityTypes();
    }, [currentPage, searchTerm, statusFilter, promoterFilter, productTypeFilter]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(promoterFilter !== 'all' && { promoter_id: promoterFilter }),
                ...(productTypeFilter !== 'all' && { product_type: productTypeFilter })
            });

            const response = await apiCall(`/api/activity-recces?${params}`);
            if (response.success) {
                setActivities(response.data.data);
                setTotalPages(response.data.meta.last_page);
                setError('');
            }
        } catch (err) {
            setError('Failed to fetch activities');
            console.error('Error fetching activities:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const response = await apiCall('/api/activity-recces/dashboard-stats');
            if (response.success) {
                setDashboardStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
        }
    };

    const fetchPromoters = async () => {
        try {
            const response = await apiCall('/api/promoters/filters');
            if (response.success) {
                setPromoters(response.data);
            }
        } catch (err) {
            console.error('Error fetching promoters:', err);
        }
    };

    const fetchRoutePlans = async () => {
        try {
            const response = await apiCall('/api/route-plans/filters');
            if (response.success) {
                setRoutePlans(response.data);
            }
        } catch (err) {
            console.error('Error fetching route plans:', err);
        }
    };

    const fetchActivityTypes = async () => {
        try {
            const response = await apiCall('/api/activity-recces/activity-types');
            if (response.success) {
                setActivityTypes(response.data);
            }
        } catch (err) {
            console.error('Error fetching activity types:', err);
        }
    };

    const handleViewActivity = (activity) => {
        setSelectedActivity(activity);
        setIsViewMode(true);
        setIsDialogOpen(true);
    };

    const handleUpdateStatus = async (activity, newStatus) => {
        try {
            const response = await apiCall(`/api/activity-recces/${activity.id}/update-status`, {
                method: 'POST',
                body: JSON.stringify({ status: newStatus })
            });

            if (response.success) {
                fetchActivities();
                fetchDashboardStats();
                setError('');
            }
        } catch (err) {
            setError('Failed to update activity status');
        }
    };

    const handleDeleteActivity = async (activity) => {
        if (!window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await apiCall(`/api/activity-recces/${activity.id}`, {
                method: 'DELETE'
            });

            if (response.success) {
                fetchActivities();
                fetchDashboardStats();
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete activity');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'warning';
            case 'pending': return 'secondary';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return '✓';
            case 'in_progress': return '⏳';
            case 'pending': return '⏸';
            case 'cancelled': return '✗';
            default: return '?';
        }
    };

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = (activity.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (activity.landmark || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (activity.village || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (activity.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (activity.promoter?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
        const matchesPromoter = promoterFilter === 'all' || activity.promoter_id.toString() === promoterFilter;
        const matchesProductType = productTypeFilter === 'all' || activity.product_type === productTypeFilter;

        return matchesSearch && matchesStatus && matchesPromoter && matchesProductType;
    });

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center">Loading activities...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Activity Recce Management</h1>
                    <p className="text-gray-600">Monitor and manage field activity reconnaissance</p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Dashboard Stats */}
            {dashboardStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.total_activities}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <div className="text-green-600">✓</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{dashboardStats.completed_activities}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Audience Reached</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.total_audience_reached || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {dashboardStats.average_feedback_rating ?
                                    dashboardStats.average_feedback_rating.toFixed(1) : 'N/A'}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Activity Records</CardTitle>
                    <CardDescription>
                        Total: {activities.length} activities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search activities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={promoterFilter} onValueChange={setPromoterFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by promoter" />
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
                        <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by product type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Product Types</SelectItem>
                                <SelectItem value="Motor">Motor</SelectItem>
                                <SelectItem value="Health">Health</SelectItem>
                                <SelectItem value="Crop">Crop</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredActivities.map((activity) => (
                            <Card key={activity.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{activity.village || 'Unknown Village'}</CardTitle>
                                            <CardDescription>{activity.district}, {activity.state}</CardDescription>
                                        </div>
                                        <Badge variant={getStatusColor(activity.status)}>
                                            {getStatusIcon(activity.status)} {activity.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span>{activity.promoter?.name || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span>{activity.route_plan?.name || 'No route plan'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>
                                                {activity.visit_date ?
                                                    new Date(activity.visit_date).toLocaleString() :
                                                    new Date(activity.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {activity.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>{activity.location}</span>
                                            </div>
                                        )}
                                        {activity.landmark && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>Near {activity.landmark}</span>
                                            </div>
                                        )}
                                        {activity.product_type && (
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-gray-400" />
                                                <span>{activity.product_type}</span>
                                            </div>
                                        )}
                                        {activity.images && activity.images.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Camera className="w-4 h-4 text-gray-400" />
                                                <span>{activity.images.length} photos</span>
                                            </div>
                                        )}
                                        {activity.area && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 text-gray-400">📐</div>
                                                <span>{activity.area}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleViewActivity(activity)}
                                            className="flex items-center gap-1"
                                        >
                                            <Eye className="w-3 h-3" />
                                            View
                                        </Button>
                                        {activity.status !== 'completed' && activity.status !== 'cancelled' && (
                                            <Select
                                                value={activity.status}
                                                onValueChange={(newStatus) => handleUpdateStatus(activity, newStatus)}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeleteActivity(activity)}
                                            className="flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredActivities.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No activities found matching your criteria.
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Activity Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Activity Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about the activity recce
                        </DialogDescription>
                    </DialogHeader>

                    {selectedActivity && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">Visit Date & Time</Label>
                                    <p>{selectedActivity.visit_date ? new Date(selectedActivity.visit_date).toLocaleString() : 'Not set'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Status</Label>
                                    <Badge variant={getStatusColor(selectedActivity.status)} className="ml-2">
                                        {getStatusIcon(selectedActivity.status)} {selectedActivity.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">Promoter</Label>
                                    <p>{selectedActivity.promoter?.name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Product Type</Label>
                                    <p>{selectedActivity.product_type || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">Route Plan</Label>
                                    <p>{selectedActivity.route_plan?.name || 'No route plan'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Device ID</Label>
                                    <p>{selectedActivity.device_id || 'Not specified'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Village Code</Label>
                                    <p>{selectedActivity.village_code || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">State</Label>
                                    <p>{selectedActivity.state || 'Not specified'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">District</Label>
                                    <p>{selectedActivity.district || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">Sub District</Label>
                                    <p>{selectedActivity.sub_district || 'Not specified'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Village</Label>
                                    <p>{selectedActivity.village || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">Location</Label>
                                    <p>{selectedActivity.location || 'Not specified'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Landmark</Label>
                                    <p>{selectedActivity.landmark || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">Coordinates</Label>
                                    <p>
                                        {selectedActivity.latitude && selectedActivity.longitude
                                            ? `${selectedActivity.latitude}, ${selectedActivity.longitude}`
                                            : 'Not available'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Dimensions</Label>
                                    <p>
                                        {selectedActivity.width && selectedActivity.height
                                            ? `${selectedActivity.width} × ${selectedActivity.height}`
                                            : 'Not specified'
                                        }
                                    </p>
                                </div>
                            </div>

                            {selectedActivity.remarks && (
                                <div>
                                    <Label className="font-semibold">Remarks</Label>
                                    <p className="whitespace-pre-wrap">{selectedActivity.remarks}</p>
                                </div>
                            )}

                            {/* Photos Section */}
                            {selectedActivity.images && selectedActivity.images.length > 0 && (
                                <div>
                                    <Label className="font-semibold">Photos ({selectedActivity.images.length})</Label>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        {selectedActivity.close_shot1 && (
                                            <div>
                                                <p className="text-sm font-medium mb-1">Close Shot 1</p>
                                                <img
                                                    src={selectedActivity.close_shot1.startsWith('data:')
                                                        ? selectedActivity.close_shot1
                                                        : `/storage/${selectedActivity.close_shot1}`}
                                                    alt="Close Shot 1"
                                                    className="w-full h-32 object-cover rounded border"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {selectedActivity.close_shot_2 && (
                                            <div>
                                                <p className="text-sm font-medium mb-1">Close Shot 2</p>
                                                <img
                                                    src={selectedActivity.close_shot_2.startsWith('data:')
                                                        ? selectedActivity.close_shot_2
                                                        : `/storage/${selectedActivity.close_shot_2}`}
                                                    alt="Close Shot 2"
                                                    className="w-full h-32 object-cover rounded border"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {selectedActivity.long_shot_1 && (
                                            <div>
                                                <p className="text-sm font-medium mb-1">Long Shot 1</p>
                                                <img
                                                    src={selectedActivity.long_shot_1.startsWith('data:')
                                                        ? selectedActivity.long_shot_1
                                                        : `/storage/${selectedActivity.long_shot_1}`}
                                                    alt="Long Shot 1"
                                                    className="w-full h-32 object-cover rounded border"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {selectedActivity.long_shot_2 && (
                                            <div>
                                                <p className="text-sm font-medium mb-1">Long Shot 2</p>
                                                <img
                                                    src={selectedActivity.long_shot_2.startsWith('data:')
                                                        ? selectedActivity.long_shot_2
                                                        : `/storage/${selectedActivity.long_shot_2}`}
                                                    alt="Long Shot 2"
                                                    className="w-full h-32 object-cover rounded border"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <Label className="font-semibold">Created At</Label>
                                    <p>{new Date(selectedActivity.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Updated At</Label>
                                    <p>{new Date(selectedActivity.updated_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ActivityRecceManagement;
