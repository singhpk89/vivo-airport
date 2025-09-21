import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  MapPin,
  User,
  Key,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast, ToastContainer } from '../../components/ui/toast';
import { useAuth } from '../../contexts/AuthContext';
import { formatDisplayValue } from '@/utils/textUtils';

const PromoterEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isMenuAccessible } = useAuth();
    const { toasts, removeToast, showSuccess, showError } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [stateOptions, setStateOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        password_confirmation: '',
        state: '',
        district: '',
        status: 'active',
        is_active: true,
        is_logged_in: false,
    });

    // Load existing promoter data
    useEffect(() => {
        if (id) {
            loadPromoter(id);
        }
    }, [id]);

    // Load states and districts from route_plans table
    useEffect(() => {
        const loadStatesAndDistricts = async () => {
            try {
                const response = await fetch('/api/route-plans/locations', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setStateOptions(result.data.states || []);
                        setAvailableDistricts(result.data.districts || []);

                        // Update district options if promoter state is already loaded
                        if (formData.state) {
                            const stateDistricts = result.data.districts.filter(d => d.state === formData.state);
                            setDistrictOptions(stateDistricts.map(d => d.district));
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading states and districts:', error);
            }
        };

        loadStatesAndDistricts();
    }, [formData.state]);

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
                    setFormData({
                        name: result.data.name || '',
                        username: result.data.username || '',
                        password: '',
                        password_confirmation: '',
                        state: result.data.state || '',
                        district: result.data.district || '',
                        status: result.data.status || 'active',
                        is_active: result.data.is_active ?? true,
                        is_logged_in: result.data.is_logged_in ?? false,
                    });

                    // Set district options based on the loaded state
                    if (result.data.state && availableDistricts.length > 0) {
                        const stateDistricts = availableDistricts.filter(d => d.state === result.data.state);
                        setDistrictOptions(stateDistricts.map(d => d.district));
                    }
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

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field
        if (formErrors[field]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Handle state change to update available districts
        if (field === 'state') {
            const stateDistricts = availableDistricts.filter(d => d.state === value);
            setDistrictOptions(stateDistricts.map(d => d.district));
            // Clear district if it's not available in the new state
            if (formData.district && !stateDistricts.some(d => d.district === formData.district)) {
                setFormData(prev => ({
                    ...prev,
                    district: ''
                }));
            }
        }
    };

    const validateForm = () => {
        const errors = {};
        const requiredFields = ['name', 'username'];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors[field] = [`${field.replace('_', ' ')} is required`];
            }
        });

        // Remove email validation as email field doesn't exist

        // Password confirmation validation (only if password is provided)
        if (formData.password && formData.password !== formData.password_confirmation) {
            errors.password_confirmation = ['Password confirmation does not match'];
        }

        // Password strength validation (only if password is provided)
        if (formData.password && formData.password.length < 6) {
            errors.password = ['Password must be at least 6 characters long'];
        }

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
            // Prepare data for submission
            const submitData = { ...formData };

            // Remove password fields if not updating password
            if (!submitData.password) {
                delete submitData.password;
                delete submitData.password_confirmation;
            }

            const response = await fetch(`/api/promoters/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                },
                body: JSON.stringify(submitData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showSuccess('Promoter updated successfully!');
                navigate('/acl/promoters');
            } else {
                if (response.status === 422 && result.errors) {
                    setFormErrors(result.errors);
                } else {
                    const errorMessage = result.message || 'Failed to update promoter';
                    setError(errorMessage);
                    showError(errorMessage);
                }
            }
        } catch (err) {
            const errorMessage = 'Error updating promoter';
            setError(errorMessage);
            showError(errorMessage);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusOptions = [
        { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
        { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
        { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-800' },
    ];

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
                                    Edit Promoter
                                </h1>
                                <p className="text-body-small text-on-surface-variant">
                                    Update promoter information
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/admin/promoter/${id}/view`)}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                            </Button>
                            <Button variant="outline" onClick={() => navigate(-1)}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Promoter
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-4xl mx-auto">
                    {error && (
                        <Alert className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>
                                    Basic information about the promoter
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter full name"
                                            className={formErrors.name ? 'border-red-500' : ''}
                                        />
                                        {formErrors.name && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.name[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="username">Username *</Label>
                                        <Input
                                            id="username"
                                            value={formData.username}
                                            onChange={(e) => handleInputChange('username', e.target.value)}
                                            placeholder="Enter username"
                                            className={formErrors.username ? 'border-red-500' : ''}
                                        />
                                        {formErrors.username && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.username[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                            <SelectTrigger className={formErrors.status ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={option.color}>
                                                                {option.label}
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.status && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.status[0]}</p>
                                        )}
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
                                    Geographic location details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="state">State</Label>
                                        <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                                            <SelectTrigger className={`sentence-case ${formErrors.state ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder="Select state" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stateOptions.map((state) => (
                                                    <SelectItem key={state} value={state} className="sentence-case">{formatDisplayValue(state)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.state && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.state[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="district">District</Label>
                                        <Select value={formData.district} onValueChange={(value) => handleInputChange('district', value)} disabled={!formData.state}>
                                            <SelectTrigger className={`sentence-case ${formErrors.district ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder={formData.state ? "Select district" : "Select state first"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {districtOptions.map((district) => (
                                                    <SelectItem key={district} value={district} className="sentence-case">{formatDisplayValue(district)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.district && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.district[0]}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Authentication */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Authentication
                                </CardTitle>
                                <CardDescription>
                                    Update password and access settings (leave password blank to keep current)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="password">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                placeholder="Enter new password (leave blank to keep current)"
                                                className={formErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {formErrors.password && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.password[0]}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Leave blank to keep current password
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showPasswordConfirmation ? "text" : "password"}
                                                value={formData.password_confirmation}
                                                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                                                placeholder="Confirm new password"
                                                className={formErrors.password_confirmation ? 'border-red-500 pr-10' : 'pr-10'}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                            >
                                                {showPasswordConfirmation ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {formErrors.password_confirmation && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.password_confirmation[0]}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active" className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4" />
                                        Account is active
                                    </Label>
                                </div>
                                {formErrors.is_active && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.is_active[0]}</p>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_logged_in"
                                        checked={formData.is_logged_in}
                                        onCheckedChange={(checked) => handleInputChange('is_logged_in', checked)}
                                    />
                                    <Label htmlFor="is_logged_in" className="flex items-center gap-2">
                                        <LogIn className="h-4 w-4" />
                                        Currently logged in
                                    </Label>
                                </div>
                                {formErrors.is_logged_in && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.is_logged_in[0]}</p>
                                )}
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>

            {/* Fixed Footer */}
            <div className="bg-surface-container border-t border-outline-variant px-6 py-4 shrink-0">
                <div className="max-w-4xl mx-auto flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        disabled={isSubmitting}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Update Promoter
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PromoterEdit;
