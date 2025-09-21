import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  MapPin,
  User,
  Mail,
  Phone,
  Building,
  Key,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { useApi } from '../../hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast, ToastContainer } from '../../components/ui/toast';
import { useAuth } from '../../contexts/AuthContext';
import { formatDisplayValue } from '../../utils/textUtils';

const PromoterCreate = () => {
    const navigate = useNavigate();
    const { isMenuAccessible } = useAuth();
    const { toasts, removeToast, showSuccess, showError } = useToast();
    const { apiCall, apiCallJson } = useApi();

    // Load states and districts from route_plans table
    useEffect(() => {
        const loadStatesAndDistricts = async () => {
            try {
                const result = await apiCallJson('/route-plans/locations');
                if (result.success) {
                    setStateOptions(result.data.states || []);
                    setAvailableDistricts(result.data.districts || []);
                }
            } catch (error) {
                console.error('Error loading states and districts:', error);
            }
        };

        loadStatesAndDistricts();
    }, []);

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
    });

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
        const requiredFields = ['name', 'username', 'password', 'password_confirmation'];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors[field] = [`${field.replace('_', ' ')} is required`];
            }
        });

        // Password confirmation validation
        if (formData.password !== formData.password_confirmation) {
            errors.password_confirmation = ['Password confirmation does not match'];
        }

        // Password strength validation
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
            const response = await apiCall('/promoters', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showSuccess('Promoter created successfully!');
        navigate('/acl/promoters');
            } else {
                if (response.status === 422 && result.errors) {
                    setFormErrors(result.errors);
                } else {
                    const errorMessage = result.message || 'Failed to create promoter';
                    setError(errorMessage);
                    showError(errorMessage);
                }
            }
        } catch (err) {
            const errorMessage = 'Error creating promoter';
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
                                    Create New Promoter
                                </h1>
                                <p className="text-body-small text-on-surface-variant">
                                    Add a new promoter to the system
                                </p>
                            </div>
                        </div>
                    </div>
                </div>            {/* Content */}
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
                                                            <Badge className={`${option.color} sentence-case`}>
                                                                {formatDisplayValue(option.label)}
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
                                    Geographic details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="state">State</Label>
                                        <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                                            <SelectTrigger className={formErrors.state ? 'border-red-500' : ''}>
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
                                            <SelectTrigger className={formErrors.district ? 'border-red-500' : ''}>
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
                                    Login credentials and access settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="password">Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                placeholder="Enter password"
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
                                            Password must be at least 8 characters long
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showPasswordConfirmation ? "text" : "password"}
                                                value={formData.password_confirmation}
                                                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                                                placeholder="Confirm password"
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
                            </CardContent>
                        </Card>

                        {/* Form Actions - Remove this section as we're moving to footer */}
                    </form>
                </div>
            </div>

            {/* Fixed Footer */}
            <div className="bg-surface-container border-t border-outline-variant px-6 py-3 shrink-0">
                <div className="flex justify-end gap-4 max-w-4xl mx-auto">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Create Promoter
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PromoterCreate;
