import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  MapPin,
  Image,
  Settings,
  Calendar,
  DollarSign,
  Users,
  Target,
  AlertCircle,
  Ruler,
  Camera,
  Upload,
  Search,
  ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast, ToastContainer } from '../../components/ui/toast';
import { useAuth } from '../../contexts/AuthContext';

const ActivityRecceCreate = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { toasts, removeToast, showSuccess, showError } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [promoters, setPromoters] = useState([]);
    const [routePlans, setRoutePlans] = useState([]);

    // Route plan search state
    const [routePlanSearch, setRoutePlanSearch] = useState('');
    const [isRoutePlanDropdownOpen, setIsRoutePlanDropdownOpen] = useState(false);
    const [filteredRoutePlans, setFilteredRoutePlans] = useState([]);

    const [formData, setFormData] = useState({
        visit_date: '',
        promoter_id: '',
        plan_id: '',
        device_id: '',
        state: '',
        district: '',
        sub_district: '',
        village: '',
        village_code: '',
        location: '',
        landmark: '',
        latitude: '',
        longitude: '',
        width: '',
        height: '',
        remarks: '',
        status: 'pending',
        product_type: '',
        close_shot1: null,
        close_shot_2: null,
        long_shot_1: null,
        long_shot_2: null
    });

    // Load promoters and route plans
    useEffect(() => {
        fetchPromoters();
        fetchRoutePlans();
    }, []);

    // Filter route plans based on search
    useEffect(() => {
        if (!routePlanSearch.trim()) {
            setFilteredRoutePlans(routePlans);
        } else {
            const filtered = routePlans.filter(plan => {
                const searchTerm = routePlanSearch.toLowerCase();
                return (
                    plan.village?.toLowerCase().includes(searchTerm) ||
                    plan.district?.toLowerCase().includes(searchTerm) ||
                    plan.state?.toLowerCase().includes(searchTerm) ||
                    plan.village_code?.toLowerCase().includes(searchTerm)
                );
            });
            setFilteredRoutePlans(filtered);
        }
    }, [routePlans, routePlanSearch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isRoutePlanDropdownOpen && !event.target.closest('.route-plan-dropdown')) {
                setIsRoutePlanDropdownOpen(false);
                setRoutePlanSearch('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isRoutePlanDropdownOpen]);

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
                const apiResponse = await response.json();
                setPromoters(apiResponse.data || []);
            }
        } catch (error) {
            console.error('Error fetching promoters:', error);
        }
    };

    const fetchRoutePlans = async () => {
        try {
            const response = await fetch('/api/route-plans/filters', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const apiResponse = await response.json();
                setRoutePlans(apiResponse.data || []);
            }
        } catch (error) {
            console.error('Error fetching route plans:', error);
        }
    };

    // Handle plan selection to auto-fill location details
    const handlePlanSelection = (planId) => {
        const selectedPlan = routePlans.find(plan => plan.id === parseInt(planId));
        if (selectedPlan) {
            setFormData(prev => ({
                ...prev,
                plan_id: planId,
                state: selectedPlan.state || '',
                district: selectedPlan.district || '',
                sub_district: selectedPlan.sub_district || '',
                village: selectedPlan.village || '',
                village_code: selectedPlan.village_code || '',
                width: selectedPlan.width || '',
                height: selectedPlan.height || ''
            }));
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleFileChange = (field, file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    [field]: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.visit_date) errors.visit_date = 'Visit date is required';
        if (!formData.promoter_id) errors.promoter_id = 'Promoter is required';
        if (!formData.plan_id) errors.plan_id = 'Route plan is required';
        if (!formData.state) errors.state = 'State is required';
        if (!formData.district) errors.district = 'District is required';
        if (!formData.village) errors.village = 'Village is required';

        if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
            errors.latitude = 'Latitude must be a valid number between -90 and 90';
        }

        if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
            errors.longitude = 'Longitude must be a valid number between -180 and 180';
        }

        if (formData.width && (isNaN(formData.width) || formData.width <= 0)) {
            errors.width = 'Width must be a positive number';
        }

        if (formData.height && (isNaN(formData.height) || formData.height <= 0)) {
            errors.height = 'Height must be a positive number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Please fix the validation errors before submitting.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const submitData = {
                ...formData,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                width: formData.width ? parseFloat(formData.width) : null,
                height: formData.height ? parseFloat(formData.height) : null,
                promoter_id: parseInt(formData.promoter_id),
                plan_id: formData.plan_id ? parseInt(formData.plan_id) : null
            };

            const response = await fetch('/api/activity-recces', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });

            if (response.ok) {
                showSuccess('Activity created successfully!');
                setTimeout(() => {
                    navigate('/admin/activities');
                }, 1500);
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to create activity';
                setError(errorMessage);
                showError(errorMessage);
            }
        } catch (err) {
            const errorMessage = 'Error creating activity';
            setError(errorMessage);
            showError(errorMessage);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/activities');
    };

    return (
        <div className="relative h-full flex flex-col bg-background overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 shrink-0 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="text-foreground hover:bg-muted"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Create New Activity</h1>
                            <p className="text-muted-foreground">Add a new activity reconnaissance record</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-primary text-primary bg-primary/10">
                            New Activity
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-background">
                <div className="p-6 pb-24">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                        <CardDescription>
                            Enter the basic details for the activity
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="visit_date">Visit Date & Time *</Label>
                                <Input
                                    id="visit_date"
                                    type="datetime-local"
                                    value={formData.visit_date}
                                    onChange={(e) => handleInputChange('visit_date', e.target.value)}
                                    className={formErrors.visit_date ? 'border-red-500' : ''}
                                />
                                {formErrors.visit_date && (
                                    <p className="text-sm text-red-500">{formErrors.visit_date}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="promoter_id">Promoter *</Label>
                                <Select
                                    value={formData.promoter_id.toString()}
                                    onValueChange={(value) => handleInputChange('promoter_id', value)}
                                >
                                    <SelectTrigger className={formErrors.promoter_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select promoter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {promoters.map((promoter) => (
                                            <SelectItem key={promoter.id} value={promoter.id.toString()}>
                                                {promoter.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.promoter_id && (
                                    <p className="text-sm text-red-500">{formErrors.promoter_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="plan_id">Route Plan *</Label>
                                <div className="relative route-plan-dropdown">
                                    <div
                                        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${formErrors.plan_id ? 'border-red-500' : ''}`}
                                        onClick={() => setIsRoutePlanDropdownOpen(!isRoutePlanDropdownOpen)}
                                    >
                                        <span className={formData.plan_id ? '' : 'text-muted-foreground'}>
                                            {formData.plan_id
                                                ? routePlans.find(p => p.id.toString() === formData.plan_id.toString())
                                                    ? `${routePlans.find(p => p.id.toString() === formData.plan_id.toString()).village}, ${routePlans.find(p => p.id.toString() === formData.plan_id.toString()).district}, ${routePlans.find(p => p.id.toString() === formData.plan_id.toString()).state} (${routePlans.find(p => p.id.toString() === formData.plan_id.toString()).village_code || 'No Code'})`
                                                    : 'Select route plan (auto-fills location)'
                                                : 'Select route plan (auto-fills location)'
                                            }
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </div>

                                    {isRoutePlanDropdownOpen && (
                                        <div className="absolute z-[9999] w-full mt-1 max-h-80 overflow-hidden rounded-md border bg-white shadow-md">
                                            <div className="p-2 border-b bg-white">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search route plans..."
                                                        value={routePlanSearch}
                                                        onChange={(e) => setRoutePlanSearch(e.target.value)}
                                                        className="pl-8 bg-white"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-60 overflow-auto bg-white">
                                                {filteredRoutePlans.length === 0 ? (
                                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                                        No route plans found
                                                    </div>
                                                ) : (
                                                    filteredRoutePlans.map((plan) => (
                                                        <div
                                                            key={plan.id}
                                                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 text-gray-900"
                                                            onClick={() => {
                                                                handlePlanSelection(plan.id.toString());
                                                                setIsRoutePlanDropdownOpen(false);
                                                                setRoutePlanSearch('');
                                                            }}
                                                        >
                                                            {`${plan.village}, ${plan.district}, ${plan.state} (${plan.village_code || 'No Code'})`}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {formErrors.plan_id && (
                                    <p className="text-sm text-red-500">{formErrors.plan_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product_type">Product Type</Label>
                                <Select
                                    value={formData.product_type}
                                    onValueChange={(value) => handleInputChange('product_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select product type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Motor">Motor</SelectItem>
                                        <SelectItem value="Health">Health</SelectItem>
                                        <SelectItem value="Crop">Crop</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="device_id">Device ID</Label>
                                <Input
                                    id="device_id"
                                    type="text"
                                    placeholder="Enter device ID"
                                    value={formData.device_id}
                                    onChange={(e) => handleInputChange('device_id', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleInputChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                    </SelectContent>
                                </Select>
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
                        <CardDescription>
                            Specify the location details for the activity
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="state">State * (Auto-filled from Route Plan)</Label>
                                <Input
                                    id="state"
                                    type="text"
                                    placeholder="Auto-filled from route plan"
                                    value={formData.state}
                                    readOnly
                                    className="bg-muted/50 cursor-not-allowed"
                                />
                                {formErrors.state && (
                                    <p className="text-sm text-red-500">{formErrors.state}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="district">District * (Auto-filled from Route Plan)</Label>
                                <Input
                                    id="district"
                                    type="text"
                                    placeholder="Auto-filled from route plan"
                                    value={formData.district}
                                    readOnly
                                    className="bg-muted/50 cursor-not-allowed"
                                />
                                {formErrors.district && (
                                    <p className="text-sm text-red-500">{formErrors.district}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sub_district">Sub District (Auto-filled from Route Plan)</Label>
                                <Input
                                    id="sub_district"
                                    type="text"
                                    placeholder="Auto-filled from route plan"
                                    value={formData.sub_district}
                                    readOnly
                                    className="bg-muted/50 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="village">Village * (Auto-filled from Route Plan)</Label>
                                <Input
                                    id="village"
                                    type="text"
                                    placeholder="Auto-filled from route plan"
                                    value={formData.village}
                                    readOnly
                                    className="bg-muted/50 cursor-not-allowed"
                                />
                                {formErrors.village && (
                                    <p className="text-sm text-red-500">{formErrors.village}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="village_code">Village Code (Auto-filled from Route Plan)</Label>
                                <Input
                                    id="village_code"
                                    type="text"
                                    placeholder="Auto-filled from route plan"
                                    value={formData.village_code}
                                    readOnly
                                    className="bg-muted/50 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    type="text"
                                    placeholder="Enter specific location"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="landmark">Landmark</Label>
                                <Input
                                    id="landmark"
                                    type="text"
                                    placeholder="Enter nearby landmark"
                                    value={formData.landmark}
                                    onChange={(e) => handleInputChange('landmark', e.target.value)}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    placeholder="Enter latitude (-90 to 90)"
                                    value={formData.latitude}
                                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                                    className={formErrors.latitude ? 'border-red-500' : ''}
                                />
                                {formErrors.latitude && (
                                    <p className="text-sm text-red-500">{formErrors.latitude}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    placeholder="Enter longitude (-180 to 180)"
                                    value={formData.longitude}
                                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                                    className={formErrors.longitude ? 'border-red-500' : ''}
                                />
                                {formErrors.longitude && (
                                    <p className="text-sm text-red-500">{formErrors.longitude}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dimensions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Ruler className="h-5 w-5" />
                            Dimensions
                        </CardTitle>
                        <CardDescription>
                            Specify the dimensions if applicable
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="width">Width</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    step="any"
                                    placeholder="Enter width"
                                    value={formData.width}
                                    onChange={(e) => handleInputChange('width', e.target.value)}
                                    className={formErrors.width ? 'border-red-500' : ''}
                                />
                                {formErrors.width && (
                                    <p className="text-sm text-red-500">{formErrors.width}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="height">Height</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    step="any"
                                    placeholder="Enter height"
                                    value={formData.height}
                                    onChange={(e) => handleInputChange('height', e.target.value)}
                                    className={formErrors.height ? 'border-red-500' : ''}
                                />
                                {formErrors.height && (
                                    <p className="text-sm text-red-500">{formErrors.height}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Photos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            Photos
                        </CardTitle>
                        <CardDescription>
                            Upload photos for the activity
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="close_shot1">Close Shot 1</Label>
                                <Input
                                    id="close_shot1"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('close_shot1', e.target.files[0])}
                                />
                                {formData.close_shot1 && (
                                    <img
                                        src={formData.close_shot1}
                                        alt="Close Shot 1 Preview"
                                        className="w-full h-32 object-cover rounded border"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="close_shot_2">Close Shot 2</Label>
                                <Input
                                    id="close_shot_2"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('close_shot_2', e.target.files[0])}
                                />
                                {formData.close_shot_2 && (
                                    <img
                                        src={formData.close_shot_2}
                                        alt="Close Shot 2 Preview"
                                        className="w-full h-32 object-cover rounded border"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="long_shot_1">Long Shot 1</Label>
                                <Input
                                    id="long_shot_1"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('long_shot_1', e.target.files[0])}
                                />
                                {formData.long_shot_1 && (
                                    <img
                                        src={formData.long_shot_1}
                                        alt="Long Shot 1 Preview"
                                        className="w-full h-32 object-cover rounded border"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="long_shot_2">Long Shot 2</Label>
                                <Input
                                    id="long_shot_2"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('long_shot_2', e.target.files[0])}
                                />
                                {formData.long_shot_2 && (
                                    <img
                                        src={formData.long_shot_2}
                                        alt="Long Shot 2 Preview"
                                        className="w-full h-32 object-cover rounded border"
                                    />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Additional Information
                        </CardTitle>
                        <CardDescription>
                            Add any additional notes or remarks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                placeholder="Enter any remarks or additional information"
                                value={formData.remarks}
                                onChange={(e) => handleInputChange('remarks', e.target.value)}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>
            </form>
                    </div>
                </div>
            </div>

            {/* Footer Actions - Fixed */}
            <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-4 z-30 shadow-lg backdrop-blur-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        Fields marked with * are required
                    </div>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outlined"
                            size="default"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            variant="success"
                            size="default"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Create Activity
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
};

export default ActivityRecceCreate;
