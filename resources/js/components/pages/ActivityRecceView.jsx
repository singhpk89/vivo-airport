import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  Users,
  Target,
  AlertCircle,
  Ruler,
  Camera,
  Loader2,
  Image
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '../../contexts/AuthContext';

const ActivityRecceView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activity, setActivity] = useState(null);

    useEffect(() => {
        if (id) {
            fetchActivity();
        }
    }, [id]);

    const fetchActivity = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/activity-recces/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const apiResponse = await response.json();
                setActivity(apiResponse.data || apiResponse);
            } else {
                setError('Failed to load activity');
            }
        } catch (err) {
            setError('Error loading activity');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        navigate(`/admin/activities/edit/${id}`);
    };

    const handleBack = () => {
        navigate('/admin/activities');
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { variant: 'secondary', label: 'Pending' },
            in_progress: { variant: 'default', label: 'In Progress' },
            completed: { variant: 'success', label: 'Completed' },
            cancelled: { variant: 'destructive', label: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 px-4 max-w-4xl">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading activity...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-6 px-4 max-w-4xl">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="container mx-auto py-6 px-4 max-w-4xl">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Activity not found</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="relative h-full flex flex-col bg-background overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 shrink-0 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="text-foreground hover:bg-muted"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Activity Details</h1>
                            <p className="text-muted-foreground">View activity reconnaissance record</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                            Viewing
                        </Badge>
                        <Button
                            onClick={handleEdit}
                            variant="filled"
                            size="default"
                            className="flex items-center gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Activity
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-background">
                <div className="p-6 pb-24">
                    <div className="max-w-4xl mx-auto space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Visit Date & Time</label>
                                <p className="text-sm">
                                    {activity.visit_date ? new Date(activity.visit_date).toLocaleString() : 'Not specified'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Promoter</label>
                                <p className="text-sm">{activity.promoter?.name || 'Not assigned'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Product Type</label>
                                <p className="text-sm">{activity.product_type || 'Not specified'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Route Plan</label>
                                <p className="text-sm">{activity.route_plan?.name || 'Not assigned'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Device ID</label>
                                <p className="text-sm">{activity.device_id || 'Not specified'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div>{getStatusBadge(activity.status)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Location Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">State</label>
                                <p className="text-sm">{activity.state || 'Not specified'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">District</label>
                                <p className="text-sm">{activity.district || 'Not specified'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Sub District</label>
                                <p className="text-sm">{activity.sub_district || 'Not specified'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Village</label>
                                <p className="text-sm">{activity.village || 'Not specified'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Village Code</label>
                                <p className="text-sm">{activity.village_code || 'Not specified'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Location</label>
                                <p className="text-sm">{activity.location || 'Not specified'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Landmark</label>
                                <p className="text-sm">{activity.landmark || 'Not specified'}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Latitude</label>
                                <p className="text-sm">{activity.latitude || 'Not specified'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Longitude</label>
                                <p className="text-sm">{activity.longitude || 'Not specified'}</p>
                            </div>
                        </div>

                        {(activity.latitude && activity.longitude) && (
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground mb-2">Location Map</p>
                                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                                    <p className="text-muted-foreground">
                                        Map: {activity.latitude}, {activity.longitude}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dimensions */}
                {(activity.width || activity.height) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Ruler className="h-5 w-5" />
                                Dimensions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Width</label>
                                    <p className="text-sm">{activity.width || 'Not specified'}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Height</label>
                                    <p className="text-sm">{activity.height || 'Not specified'}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Area</label>
                                    <p className="text-sm">{activity.area || 'Not calculated'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Photos */}
                {(activity.close_shot1 || activity.close_shot_2 || activity.long_shot_1 || activity.long_shot_2) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Photos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activity.close_shot1 && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Close Shot 1</label>
                                        <img
                                            src={activity.close_shot1}
                                            alt="Close Shot 1"
                                            className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                                            onClick={() => window.open(activity.close_shot1, '_blank')}
                                        />
                                    </div>
                                )}

                                {activity.close_shot_2 && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Close Shot 2</label>
                                        <img
                                            src={activity.close_shot_2}
                                            alt="Close Shot 2"
                                            className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                                            onClick={() => window.open(activity.close_shot_2, '_blank')}
                                        />
                                    </div>
                                )}

                                {activity.long_shot_1 && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Long Shot 1</label>
                                        <img
                                            src={activity.long_shot_1}
                                            alt="Long Shot 1"
                                            className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                                            onClick={() => window.open(activity.long_shot_1, '_blank')}
                                        />
                                    </div>
                                )}

                                {activity.long_shot_2 && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Long Shot 2</label>
                                        <img
                                            src={activity.long_shot_2}
                                            alt="Long Shot 2"
                                            className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                                            onClick={() => window.open(activity.long_shot_2, '_blank')}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Additional Information */}
                {activity.remarks && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Remarks</label>
                                <p className="text-sm whitespace-pre-wrap">{activity.remarks}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Metadata */}
                <Card>
                    <CardHeader>
                        <CardTitle>Record Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                                <p className="text-sm">{activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Not available'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                <p className="text-sm">{activity.updated_at ? new Date(activity.updated_at).toLocaleString() : 'Not available'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityRecceView;
