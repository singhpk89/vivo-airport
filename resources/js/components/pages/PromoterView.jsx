import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  X,
  MapPin,
  User,
  Calendar,
  UserCheck,
  AlertCircle,
  Clock,
  Shield,
  Smartphone,
  Activity
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast, ToastContainer } from '../../components/ui/toast';
import { useAuth } from '../../contexts/AuthContext';
import { formatDisplayValue } from '@/utils/textUtils';

const PromoterView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isMenuAccessible } = useAuth();
    const { toasts, removeToast, showSuccess, showError } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [promoter, setPromoter] = useState(null);

    // Load promoter data
    useEffect(() => {
        if (id) {
            loadPromoter(id);
        }
    }, [id]);

    const loadPromoter = async (promoterId) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/promoters/${promoterId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setPromoter(result.data);
                } else {
                    const errorMessage = 'Invalid response format';
                    setError(errorMessage);
                    showError(errorMessage);
                }
            } else {
                const errorMessage = 'Failed to load promoter data';
                setError(errorMessage);
                showError(errorMessage);
            }
        } catch (err) {
            const errorMessage = 'Error loading promoter data';
            setError(errorMessage);
            showError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-emerald-100 text-emerald-800',
            inactive: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
            suspended: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-on-surface">Loading promoter...</span>
                </div>
            </div>
        );
    }

    if (error || !promoter) {
        return (
            <div className="min-h-screen bg-surface">
                <ToastContainer toasts={toasts} removeToast={removeToast} />

                <div className="bg-surface-container border-b border-outline-variant">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(-1)}
                                className="p-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <h1 className="text-headline-small font-bold text-on-surface">
                                Promoter Not Found
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-6">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {error || 'Promoter not found or you do not have permission to view this promoter.'}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-surface">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="bg-surface-container border-b border-outline-variant px-6 py-3 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="p-2"
                        >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-headline-small font-bold text-on-surface">
                                    {promoter.name}
                                </h1>
                                <p className="text-body-small text-on-surface-variant">
                                    Promoter Details
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(promoter.status)}>
                                {promoter.status}
                            </Badge>
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/admin/promoter/${id}/edit`)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button variant="outline" onClick={() => navigate(-1)}>
                                <X className="h-4 w-4 mr-2" />
                                Close
                            </Button>
                        </div>
                    </div>
                </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${promoter.is_logged_in ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                        <Activity className={`h-5 w-5 ${promoter.is_logged_in ? 'text-emerald-600' : 'text-gray-600'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Login Status</p>
                                        <p className="text-xs text-muted-foreground">
                                            {promoter.is_logged_in ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <UserCheck className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Account Status</p>
                                        <p className="text-xs text-muted-foreground">
                                            {promoter.is_active ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-purple-100">
                                        <MapPin className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Location</p>
                                        <p className="text-xs text-muted-foreground sentence-case">
                                            {formatDisplayValue(promoter.district)}, {formatDisplayValue(promoter.state)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-orange-100">
                                        <Calendar className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Joined</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(promoter.created_at).split(',')[0]}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Full Name</p>
                                            <p className="text-sm text-muted-foreground">{promoter.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Username</p>
                                            <p className="text-sm text-muted-foreground">{promoter.username}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location & Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Location & Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">State</p>
                                        <p className="text-sm text-muted-foreground sentence-case">{formatDisplayValue(promoter.state) || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">District</p>
                                        <p className="text-sm text-muted-foreground sentence-case">{formatDisplayValue(promoter.district) || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCheck className="h-5 w-5" />
                                    Account Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Status</span>
                                        <Badge className={getStatusColor(promoter.status)}>
                                            {promoter.status}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Account Active</span>
                                        <Badge className={promoter.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                                            {promoter.is_active ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Currently Logged In</span>
                                        <Badge className={promoter.is_logged_in ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {promoter.is_logged_in ? 'Online' : 'Offline'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Device & Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Smartphone className="h-5 w-5" />
                                    Device & Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Device ID</p>
                                        <p className="text-sm text-muted-foreground font-mono">
                                            {promoter.device_id || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">App Version</p>
                                        <p className="text-sm text-muted-foreground">
                                            {promoter.app_version || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">Last Active</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(promoter.last_active)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">Device Token</p>
                                        <p className="text-sm text-muted-foreground font-mono break-all">
                                            {promoter.device_token ?
                                                `${promoter.device_token.substring(0, 20)}...` :
                                                'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Timestamps */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Timestamps
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Created At</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(promoter.created_at)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium">Last Updated</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(promoter.updated_at)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PromoterView;
