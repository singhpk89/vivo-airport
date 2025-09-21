import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Separator } from '../ui/separator';
import { Label } from '../ui/Label';
import {
    ArrowLeft,
    Edit,
    MapPin,
    Calendar,
    User,
    Building,
    Ruler,
    Hash,
    Activity,
    Target,
    AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { formatDisplayValue, formatStatus } from '../../utils/textUtils';

const RoutePlanDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [routePlan, setRoutePlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRoutePlan = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch(`/api/route-plans/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        setRoutePlan(result.data);
                    } else {
                        setError('Invalid response format');
                    }
                } else if (response.status === 404) {
                    setError('Route plan not found');
                } else {
                    setError('Failed to load route plan details');
                }
            } catch (err) {
                console.error('Error fetching route plan:', err);
                setError('Failed to load route plan details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRoutePlan();
        }
    }, [id]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: {
                className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
            },
            pending: {
                className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            },
            completed: {
                className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            },
            cancelled: {
                className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
            }
        };

        const config = statusConfig[status] || statusConfig.active;
        return (
            <Badge className={`border ${config.className}`}>
                {formatStatus(status)}
            </Badge>
        );
    };

    const handleEdit = () => {
        navigate(`/route-plans/${id}/edit`);
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading route plan details...</p>
                </div>
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
                <div className="mt-4">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    if (!routePlan) {
        return (
            <div className="p-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Route plan not found</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-background overflow-y-auto">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Route Plan Details</h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {getStatusBadge(routePlan.status)}
                        <Button onClick={handleEdit}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Plan
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-muted-foreground">Loading route plan...</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <CardTitle>Location Information</CardTitle>
                        </div>
                        <CardDescription>
                            Geographic details and location information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">State</Label>
                                <p className="text-base font-medium text-foreground sentence-case">{formatDisplayValue(routePlan.state)}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">District</Label>
                                <p className="text-base font-medium text-foreground sentence-case">{formatDisplayValue(routePlan.district)}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Sub District</Label>
                                <p className="text-base font-medium text-foreground sentence-case">{formatDisplayValue(routePlan.sub_district)}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Village</Label>
                                <p className="text-base font-medium text-foreground sentence-case">{formatDisplayValue(routePlan.village)}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Village Code</Label>
                                <p className="text-base font-mono text-foreground">{routePlan.village_code}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                <div>{getStatusBadge(routePlan.status)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dimensions and Area */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Ruler className="h-5 w-5 text-primary" />
                            <CardTitle>Dimensions & Area</CardTitle>
                        </div>
                        <CardDescription>
                            Wall dimensions and area calculations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Width</Label>
                                <p className="text-base font-medium text-foreground">{routePlan.width} ft</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Height</Label>
                                <p className="text-base font-medium text-foreground">{routePlan.height} ft</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Total Area</Label>
                                <p className="text-base font-bold text-primary">{routePlan.area} sq ft</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Wall Count</Label>
                                <p className="text-base font-medium text-foreground">{routePlan.wall_count}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <CardTitle>Status & Timeline</CardTitle>
                        </div>
                        <CardDescription>
                            Current status and important dates
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                                <p className="text-base font-medium text-foreground">
                                    {new Date(routePlan.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                                <p className="text-base font-medium text-foreground">
                                    {new Date(routePlan.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoutePlanDetails;
