import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Clock, Camera, MessageSquare, User, Calendar, Navigation, LogIn, Activity, LogOut } from 'lucide-react';

const PromoterActivityDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activity, setActivity] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('login');
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    useEffect(() => {
        fetchActivityDetails();
    }, [id]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!photoModalOpen) return;

            switch (event.key) {
                case 'Escape':
                    closePhotoModal();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
                    setSelectedPhoto(photos[prevIndex]);
                    setSelectedPhotoIndex(prevIndex);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    const currentIdx = photos.findIndex(p => p.id === selectedPhoto.id);
                    const nextIndex = currentIdx < photos.length - 1 ? currentIdx + 1 : 0;
                    setSelectedPhoto(photos[nextIndex]);
                    setSelectedPhotoIndex(nextIndex);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [photoModalOpen, selectedPhoto, photos]);

    const fetchActivityDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/promoter-reports/activity/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setActivity(data.data);
                setPhotos(data.data.photos || []);
            } else {
                console.error('Failed to fetch activity details');
            }
        } catch (error) {
            console.error('Error fetching activity details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'logged_in': return 'bg-green-100 text-green-800';
            case 'logged_out': return 'bg-gray-100 text-gray-800';
            case 'active': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'logged_in': return 'Active';
            case 'logged_out': return 'Completed';
            case 'active': return 'Working';
            default: return status;
        }
    };

    const getPhotoTypeIcon = (type) => {
        switch (type) {
            case 'login': return '�';
            case 'logout': return '🚪';
            case 'activity': return '�';
            default: return '📷';
        }
    };

    const formatCoordinate = (lat, lng) => {
        if (!lat || !lng) return 'N/A';
        return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
    };

    const formatTime = (time) => {
        if (!time) return 'N/A';
        return new Date(time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateDuration = () => {
        if (!activity?.login_time || !activity?.logout_time) return 'Ongoing';

        const login = new Date(activity.login_time);
        const logout = new Date(activity.logout_time);
        const diffMs = logout - login;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${diffHrs}h ${diffMins}m`;
    };

    // Organize photos by type
    const organizePhotosByType = () => {
        const loginPhotos = photos.filter(photo => photo.photo_type === 'login');
        const activityPhotos = photos.filter(photo => photo.photo_type === 'activity');
        const logoutPhotos = photos.filter(photo => photo.photo_type === 'logout');

        return {
            login: loginPhotos,
            activity: activityPhotos,
            logout: logoutPhotos
        };
    };

    const photosByType = organizePhotosByType();

    const getTabIcon = (type) => {
        switch (type) {
            case 'login': return <LogIn className="h-4 w-4" />;
            case 'activity': return <Activity className="h-4 w-4" />;
            case 'logout': return <LogOut className="h-4 w-4" />;
            default: return <Camera className="h-4 w-4" />;
        }
    };

    const openPhotoModal = (photo) => {
        setSelectedPhoto(photo);
        setPhotoModalOpen(true);
        setSelectedPhotoIndex(photos.findIndex(p => p.id === photo.id));
    };

    const closePhotoModal = () => {
        setPhotoModalOpen(false);
        setSelectedPhoto(null);
    };

    const renderPhotoGrid = (photoList, tabType) => {
        if (photoList.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No {tabType} photos available</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photoList.map((photo, index) => (
                    <div
                        key={photo.id}
                        className="relative group cursor-pointer transform transition-transform hover:scale-105"
                        onClick={() => openPhotoModal(photo)}
                    >
                        <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                            {photo.url || photo.file_path ? (
                                <img
                                    src={photo.url || `/storage/${photo.file_path}`}
                                    alt={photo.description || `${photo.photo_type} photo`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            {/* Fallback when image fails to load */}
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400" style={{ display: photo.url || photo.file_path ? 'none' : 'flex' }}>
                                <div className="text-4xl mb-2">
                                    {getPhotoTypeIcon(photo.photo_type)}
                                </div>
                                <div className="text-sm font-medium capitalize">{photo.photo_type}</div>
                            </div>
                        </div>

                        {/* Photo overlay with info */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-opacity flex items-end">
                            <div className="w-full p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                                <div className="bg-black bg-opacity-75 rounded-md p-2">
                                    <div className="font-medium capitalize text-sm">{photo.photo_type}</div>
                                    <div className="text-xs opacity-90">
                                        {new Date(photo.captured_at).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    {photo.description && (
                                        <div className="text-xs mt-1 opacity-90 truncate">
                                            {photo.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Photo type badge */}
                        <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 shadow-sm">
                                {getPhotoTypeIcon(photo.photo_type)} {photo.photo_type}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Loading Activity Details...</h1>
                </div>
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold text-red-600">Activity Not Found</h1>
                </div>
                <p className="text-gray-600">The requested promoter activity could not be found.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Activity Details</h1>
                    <p className="text-gray-600">
                        {activity.promoter?.name} • {formatDate(activity.activity_date)}
                    </p>
                </div>
                <Badge className={getStatusColor(activity.status)}>
                    {getStatusText(activity.status)}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Activity Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Promoter & Timing Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Promoter Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Name</label>
                                    <p className="text-lg font-semibold">{activity.promoter?.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">State</label>
                                    <p className="text-lg">{activity.promoter?.state}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">District</label>
                                    <p className="text-lg">{activity.promoter?.district}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Status</label>
                                    <Badge className={getStatusColor(activity.status)}>
                                        {getStatusText(activity.status)}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timing Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Timing Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Login Time</label>
                                    <p className="text-lg font-mono">{formatTime(activity.login_time)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Logout Time</label>
                                    <p className="text-lg font-mono">{formatTime(activity.logout_time)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Duration</label>
                                    <p className="text-lg font-semibold">{calculateDuration()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Location Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Login Location</label>
                                    <p className="text-sm font-mono text-blue-600">
                                        {formatCoordinate(activity.login_latitude, activity.login_longitude)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Logout Location</label>
                                    <p className="text-sm font-mono text-blue-600">
                                        {formatCoordinate(activity.logout_latitude, activity.logout_longitude)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Notes */}
                    {activity.activity_notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Activity Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-wrap">{activity.activity_notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Photo Gallery with Tabs */}
                    {photos.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="h-5 w-5" />
                                    Activity Photos ({photos.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="login" className="flex items-center gap-2">
                                            {getTabIcon('login')}
                                            Login ({photosByType.login.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="activity" className="flex items-center gap-2">
                                            {getTabIcon('activity')}
                                            Activity ({photosByType.activity.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="logout" className="flex items-center gap-2">
                                            {getTabIcon('logout')}
                                            Logout ({photosByType.logout.length})
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="login" className="mt-4">
                                        <div className="max-h-[600px] overflow-y-auto">
                                            {renderPhotoGrid(photosByType.login, 'login')}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="activity" className="mt-4">
                                        <div className="max-h-[600px] overflow-y-auto">
                                            {renderPhotoGrid(photosByType.activity, 'activity')}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="logout" className="mt-4">
                                        <div className="max-h-[600px] overflow-y-auto">
                                            {renderPhotoGrid(photosByType.logout, 'logout')}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Selected Photo Details */}
                                {photos[selectedPhotoIndex] && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-sm mb-2">
                                            Photo #{selectedPhotoIndex + 1} Details
                                        </h4>
                                        <div className="text-xs space-y-1">
                                            <div><strong>Type:</strong> {photos[selectedPhotoIndex].photo_type}</div>
                                            <div><strong>Captured:</strong> {new Date(photos[selectedPhotoIndex].captured_at).toLocaleString()}</div>
                                            <div><strong>Location:</strong> {formatCoordinate(photos[selectedPhotoIndex].latitude, photos[selectedPhotoIndex].longitude)}</div>
                                            {photos[selectedPhotoIndex].description && (
                                                <div><strong>Description:</strong> {photos[selectedPhotoIndex].description}</div>
                                            )}
                                            <div><strong>File:</strong> {photos[selectedPhotoIndex].file_name}</div>
                                            <div><strong>Size:</strong> {(photos[selectedPhotoIndex].file_size / 1024 / 1024).toFixed(2)} MB</div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Stats & Photos */}
                <div className="space-y-6">
                    {/* Activity Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Camera className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm">Photos Captured</span>
                                </div>
                                <span className="font-semibold text-blue-600">{activity.total_photos_captured}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">Feedback Collected</span>
                                </div>
                                <span className="font-semibold text-green-600">{activity.total_feedback_captured}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm">Activity Date</span>
                                </div>
                                <span className="font-semibold text-purple-600">
                                    {new Date(activity.activity_date).toLocaleDateString()}
                                </span>
                            </div>
                            {activity.last_sync_time && (
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Navigation className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm">Last Sync</span>
                                    </div>
                                    <span className="font-semibold text-gray-600">
                                        {formatTime(activity.last_sync_time)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Photo Modal */}
            {photoModalOpen && selectedPhoto && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl max-h-[90vh] w-full">
                        {/* Close button */}
                        <button
                            onClick={closePhotoModal}
                            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Image container */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                            <div className="aspect-auto max-h-[70vh] bg-gray-100 flex items-center justify-center">
                                {selectedPhoto.url || selectedPhoto.file_path ? (
                                    <img
                                        src={selectedPhoto.url || `/storage/${selectedPhoto.file_path}`}
                                        alt={selectedPhoto.description || `${selectedPhoto.photo_type} photo`}
                                        className="max-w-full max-h-full object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                {/* Fallback when image fails to load */}
                                <div className="flex flex-col items-center justify-center text-gray-400 p-8" style={{ display: selectedPhoto.url || selectedPhoto.file_path ? 'none' : 'flex' }}>
                                    <div className="text-6xl mb-4">
                                        {getPhotoTypeIcon(selectedPhoto.photo_type)}
                                    </div>
                                    <div className="text-xl font-medium capitalize">{selectedPhoto.photo_type} Photo</div>
                                    <div className="text-sm text-gray-500">Image not available</div>
                                </div>
                            </div>

                            {/* Photo details */}
                            <div className="p-6 bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold capitalize text-gray-900">
                                        {getPhotoTypeIcon(selectedPhoto.photo_type)} {selectedPhoto.photo_type} Photo
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                        Photo #{photos.findIndex(p => p.id === selectedPhoto.id) + 1} of {photos.length}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <label className="font-medium text-gray-600">Captured Date & Time</label>
                                        <p className="text-gray-900">{new Date(selectedPhoto.captured_at).toLocaleString()}</p>
                                    </div>

                                    <div>
                                        <label className="font-medium text-gray-600">Location</label>
                                        <p className="text-gray-900">{formatCoordinate(selectedPhoto.latitude, selectedPhoto.longitude)}</p>
                                    </div>

                                    {selectedPhoto.description && (
                                        <div className="md:col-span-2">
                                            <label className="font-medium text-gray-600">Description</label>
                                            <p className="text-gray-900">{selectedPhoto.description}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="font-medium text-gray-600">File Name</label>
                                        <p className="text-gray-900 font-mono text-xs">{selectedPhoto.file_name}</p>
                                    </div>

                                    <div>
                                        <label className="font-medium text-gray-600">File Size</label>
                                        <p className="text-gray-900">{(selectedPhoto.file_size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>

                                {/* Navigation buttons */}
                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
                                            const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
                                            setSelectedPhoto(photos[prevIndex]);
                                            setSelectedPhotoIndex(prevIndex);
                                        }}
                                        disabled={photos.length <= 1}
                                    >
                                        ← Previous
                                    </Button>

                                    <span className="text-sm text-gray-500">
                                        {photos.findIndex(p => p.id === selectedPhoto.id) + 1} of {photos.length}
                                    </span>

                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
                                            const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
                                            setSelectedPhoto(photos[nextIndex]);
                                            setSelectedPhotoIndex(nextIndex);
                                        }}
                                        disabled={photos.length <= 1}
                                    >
                                        Next →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoterActivityDetails;
