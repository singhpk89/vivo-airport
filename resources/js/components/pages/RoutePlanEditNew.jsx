import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  MapPin,
  Ruler,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '../../contexts/AuthContext';

const RoutePlanEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isCreateMode = !id || id === 'new';
    const { isMenuAccessible } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        state: '',
        district: '',
        sub_district: '',
        village: '',
        village_code: '',
        width: '',
        height: '',
        area: '',
        wall_count: '',
        status: 'pending'
    });

    // Load existing data if in edit mode
    useEffect(() => {
        if (!isCreateMode && id) {
            loadRoutePlan(id);
        }
    }, [id, isCreateMode]);

    const loadRoutePlan = async (planId) => {
        try {
            const response = await fetch(`/api/route-plans/${planId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFormData(data);
            } else {
                setError('Failed to load route plan data');
            }
        } catch (err) {
            setError('Error loading route plan data');
            console.error(err);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Auto-calculate area when width or height changes
        if (field === 'width' || field === 'height') {
            const updatedData = { ...formData, [field]: value };
            if (updatedData.width && updatedData.height) {
                const calculatedArea = parseFloat(updatedData.width) * parseFloat(updatedData.height);
                setFormData(prev => ({
                    ...prev,
                    [field]: value,
                    area: calculatedArea.toFixed(2)
                }));
            }
        }
        
        // Clear error for this field
        if (formErrors[field]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        const requiredFields = ['state', 'district', 'sub_district', 'village', 'village_code'];
        
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors[field] = [`${field.replace('_', ' ')} is required`];
            }
        });

        // Validate numeric fields
        const numericFields = ['width', 'height', 'area', 'wall_count'];
        numericFields.forEach(field => {
            if (formData[field] && isNaN(Number(formData[field]))) {
                errors[field] = [`${field.replace('_', ' ')} must be a valid number`];
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const url = isCreateMode ? '/api/route-plans' : `/api/route-plans/${id}`;
            const method = isCreateMode ? 'POST' : 'PUT';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/route-plans', { 
                    state: { 
                        message: isCreateMode ? 'Route plan created successfully!' : 'Route plan updated successfully!' 
                    }
                });
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setFormErrors(errorData.errors);
                } else {
                    setError(errorData.message || 'An error occurred while saving the route plan');
                }
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
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
                            <h1 className="text-2xl font-bold text-foreground">
                                {isCreateMode ? 'Create New Route Plan' : 'Edit Route Plan'}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={
                            isCreateMode 
                                ? "border-primary text-primary bg-primary/10" 
                                : "border-amber-500 text-amber-700 bg-amber-50"
                        }>
                            {isCreateMode ? 'New Plan' : 'Editing'}
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
                            {/* Location Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        Location Information
                                    </CardTitle>
                                    <CardDescription>
                                        Specify the geographical location details for this route plan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="state">State *</Label>
                                            <Input
                                                id="state"
                                                value={formData.state}
                                                onChange={(e) => handleInputChange('state', e.target.value)}
                                                className={formErrors.state ? 'border-destructive' : ''}
                                                placeholder="Enter state"
                                                required
                                            />
                                            {formErrors.state && (
                                                <p className="text-destructive text-sm mt-1">{formErrors.state[0]}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="district">District *</Label>
                                            <Input
                                                id="district"
                                                value={formData.district}
                                                onChange={(e) => handleInputChange('district', e.target.value)}
                                                className={formErrors.district ? 'border-destructive' : ''}
                                                placeholder="Enter district"
                                                required
                                            />
                                            {formErrors.district && (
                                                <p className="text-destructive text-sm mt-1">{formErrors.district[0]}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="sub_district">Sub District *</Label>
                                            <Input
                                                id="sub_district"
                                                value={formData.sub_district}
                                                onChange={(e) => handleInputChange('sub_district', e.target.value)}
                                                className={formErrors.sub_district ? 'border-destructive' : ''}
                                                placeholder="Enter sub district"
                                                required
                                            />
                                            {formErrors.sub_district && (
                                                <p className="text-destructive text-sm mt-1">{formErrors.sub_district[0]}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="village">Village *</Label>
                                            <Input
                                                id="village"
                                                value={formData.village}
                                                onChange={(e) => handleInputChange('village', e.target.value)}
                                                className={formErrors.village ? 'border-destructive' : ''}
                                                placeholder="Enter village name"
                                                required
                                            />
                                            {formErrors.village && (
                                                <p className="text-destructive text-sm mt-1">{formErrors.village[0]}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="village_code">Village Code *</Label>
                                            <Input
                                                id="village_code"
                                                value={formData.village_code}
                                                onChange={(e) => handleInputChange('village_code', e.target.value)}
                                                className={formErrors.village_code ? 'border-destructive' : ''}
                                                placeholder="Enter unique village code"
                                                required
                                            />
                                            {formErrors.village_code && (
                                                <p className="text-destructive text-sm mt-1">{formErrors.village_code[0]}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="status">Status *</Label>
                                            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                                <SelectTrigger className={formErrors.status ? 'border-destructive' : ''}>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {formErrors.status && (
                                                <p className="text-destructive text-sm mt-1">{formErrors.status[0]}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dimensions and Area */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Ruler className="w-5 h-5 text-primary" />
                                        Dimensions & Area
                                    </CardTitle>
                                    <CardDescription>
                                        Specify the physical dimensions and area details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <Label htmlFor="width">Width (ft)</Label>
                                            <Input
                                                id="width"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.width}
                                                onChange={(e) => handleInputChange('width', e.target.value)}
                                                className={formErrors.width ? 'border-destructive' : ''}
                                                placeholder="Enter width"
                                            />
                                            {formErrors.width && (
                                                <p className="text-destructive text-sm mt-1">{formErrors.width[0]}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="height">Height (ft)</Label>
                                            <Input
                                                id="height"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.height}
                                                onChange={(e) => handleInputChange('height', e.target.value)}
                                                className={formErrors.height ? 'border-destructive' : ''}
                                                placeholder="Enter height"
                                            />
                                            {formErrors.height && (
                                                <p className="text-destructive text-sm mt-1">{formErrors.height[0]}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="area">Area (sq ft)</Label>
                                            <Input
                                                id="area"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.area}
                                                onChange={(e) => handleInputChange('area', e.target.value)}
                                                className={formErrors.area ? 'border-destructive' : ''}
                                                placeholder="Auto-calculated or manual"
                                            />
                                            {formErrors.area && (
                                                <p className="text-destructive text-sm mt-1">{formErrors.area[0]}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="wall_count">Wall Count</Label>
                                            <Input
                                                id="wall_count"
                                                type="number"
                                                min="1"
                                                max="999"
                                                value={formData.wall_count}
                                                onChange={(e) => handleInputChange('wall_count', e.target.value)}
                                                className={formErrors.wall_count ? 'border-destructive' : ''}
                                                placeholder="Number of walls"
                                            />
                                            {formErrors.wall_count && (
                                                <p className="text-destructive text-sm mt-1">{formErrors.wall_count[0]}</p>
                                            )}
                                        </div>
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
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    {isCreateMode ? 'Creating...' : 'Updating...'}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isCreateMode ? 'Create Route Plan' : 'Update Route Plan'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoutePlanEdit;
