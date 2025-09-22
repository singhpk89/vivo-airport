import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    MapPin,
    Camera,
    MessageSquare,
    Users,
    Activity,
    TrendingUp,
    Download,
    RefreshCw,
    Filter,
    Eye
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const PromoterActivityDashboard = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        date: new Date().toISOString().split('T')[0],
        promoter_id: 'all',
        status: 'all'
    });
    const [promoters, setPromoters] = useState([]);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);

    useEffect(() => {
        fetchPromoters();
        fetchDashboardData();
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [filters]);

    const fetchPromoters = async () => {
        try {
            const response = await fetch('/api/promoters', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Content-Type': 'application/json',
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

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all') params.append(key, value);
            });

            const response = await fetch(`/api/admin/promoter-reports/dashboard?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setActivities(data.data.activities || []);
                setSummary(data.data.summary || {});
            } else {
                console.error('Failed to fetch dashboard data');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const formatDuration = (minutes) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        return new Date(dateTime).toLocaleString();
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'logged_in': { color: 'bg-green-500', text: 'Active' },
            'logged_out': { color: 'bg-gray-500', text: 'Completed' },
            'active': { color: 'bg-blue-500', text: 'Working' }
        };

        const config = statusConfig[status] || { color: 'bg-gray-500', text: status };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const viewPhotos = (photos, activityId) => {
        setSelectedPhotos(photos);
        setPhotoModalOpen(true);
    };

    const handleViewDetails = (activityId) => {
        navigate(`/admin/promoter-activity/${activityId}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Promoter Activity Dashboard</h1>
                <p className="text-gray-600">Monitor daily promoter activities, login/logout times, and photo captures</p>
            </div>

            {/* Filters */}
            <Card className="p-6 mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-semibold">Filters</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={filters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="promoter">Promoter</Label>
                        <Select value={filters.promoter_id} onValueChange={(value) => handleFilterChange('promoter_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Promoters" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Promoters</SelectItem>
                                {promoters.map((promoter) => (
                                    <SelectItem key={promoter.id} value={promoter.id.toString()}>
                                        {promoter.name} (ID: {promoter.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="logged_in">Active</SelectItem>
                                <SelectItem value="active">Working</SelectItem>
                                <SelectItem value="logged_out">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button onClick={fetchDashboardData} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Promoters</p>
                            <p className="text-2xl font-bold text-gray-900">{summary.total_promoters || 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <Activity className="h-8 w-8 text-green-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Now</p>
                            <p className="text-2xl font-bold text-gray-900">{summary.active_promoters || 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <Camera className="h-8 w-8 text-purple-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Photos Captured</p>
                            <p className="text-2xl font-bold text-gray-900">{summary.total_photos || 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <MessageSquare className="h-8 w-8 text-orange-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Feedback Collected</p>
                            <p className="text-2xl font-bold text-gray-900">{summary.total_feedback || 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center">
                        <Clock className="h-8 w-8 text-red-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                            <p className="text-2xl font-bold text-gray-900">{formatDuration(summary.average_session_duration)}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Activities List */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Promoter Activities</h2>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-600">Loading activities...</span>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No activities found for the selected filters.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity) => (
                            <div key={activity.id} className="border border-gray-200 rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {activity.promoter?.name || 'Unknown Promoter'}
                                                </h3>
                                                <p className="text-sm text-gray-600">ID: {activity.promoter?.id}</p>
                                            </div>
                                            {getStatusBadge(activity.status)}
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    Duration: {formatDuration(activity.duration)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Photos: {activity.total_photos_captured} | Feedback: {activity.total_feedback_captured}
                                                </p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(activity.id)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 text-green-500 mr-2" />
                                            <span className="text-sm">Login: {formatDateTime(activity.login_time)}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 text-red-500 mr-2" />
                                            <span className="text-sm">Logout: {formatDateTime(activity.logout_time)}</span>
                                        </div>

                                        {activity.login_latitude && activity.login_longitude && (
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                                                <span className="text-sm">
                                                    Login Location: {activity.login_latitude}, {activity.login_longitude}
                                                </span>
                                            </div>
                                        )}

                                        {activity.photos && activity.photos.length > 0 && (
                                            <div className="flex items-center">
                                                <Camera className="h-4 w-4 text-purple-500 mr-2" />
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => viewPhotos(activity.photos, activity.id)}
                                                    className="p-0 h-auto"
                                                >
                                                    View {activity.photos.length} Photos
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Photo Modal */}
            {photoModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setPhotoModalOpen(false)}></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Activity Photos</h3>
                                    <Button variant="outline" onClick={() => setPhotoModalOpen(false)}>
                                        Close
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                    {selectedPhotos.map((photo) => (
                                        <div key={photo.id} className="relative">
                                            <img
                                                src={photo.url || (photo.file_path.startsWith('http') ? photo.file_path : `/storage/${photo.file_path}`)}
                                                alt={photo.description || 'Activity photo'}
                                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                            />
                                            <div className="absolute top-2 left-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 shadow">
                                                    {photo.photo_type}
                                                </span>
                                            </div>
                                            {photo.description && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                                                    <p className="text-xs">{photo.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoterActivityDashboard;
