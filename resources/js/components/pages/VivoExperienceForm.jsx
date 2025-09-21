import React, { useState, useCallback, useEffect } from 'react';
import {
    ArrowLeft,
    Send,
    CheckCircle,
    AlertCircle,
    Camera,
    Smartphone,
    ImageIcon,
    Users,
    Star,
    MessageSquare,
    User,
    Mail,
    Phone
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/Badge';

const VivoExperienceForm = ({ onBack }) => {
    const [formData, setFormData] = useState({
        // Main survey questions
        overall_experience: '',
        favorite_section: '',
        preferred_model: '',
        souvenir_experience: '',
        suggestions: '',

        // Contact information
        visitor_name: '',
        visitor_email: '',
        visitor_phone: '',
        visit_date: new Date().toISOString().split('T')[0],

        // Promoter assistance
        assisted_by_promoter_id: 'none',

        // Additional metadata
        is_anonymous: false,
        allow_marketing_contact: false,
    });

    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [errors, setErrors] = useState({});
    const [promoters, setPromoters] = useState([]);
    const [loadingPromoters, setLoadingPromoters] = useState(true);

    const experienceOptions = [
        { value: 'excellent', label: 'Excellent' },
        { value: 'good', label: 'Good' },
        { value: 'average', label: 'Average' },
        { value: 'poor', label: 'Poor' }
    ];

    const sectionOptions = [
        { value: 'macro_photography', label: 'Macro Photography' },
        { value: 'photobooth_zone', label: 'Photobooth Zone' },
        { value: 'photo_gallery', label: 'Photo Gallery' },
        { value: 'all_above', label: 'All of the Above' }
    ];

    const modelOptions = [
        { value: 'vivo_x200_pro', label: 'Vivo X200 Pro' },
        { value: 'vivo_x200_fe', label: 'Vivo X200 FE' },
        { value: 'vivo_x_fold5', label: 'Vivo X Fold5' },
        { value: 'still_exploring', label: "I'm still exploring options" }
    ];

    const souvenirOptions = [
        { value: 'yes', label: 'Yes' },
        { value: 'somewhat', label: 'Somewhat' },
        { value: 'no', label: 'No' }
    ];

    // Load promoters on component mount
    useEffect(() => {
        const fetchPromoters = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch('/api/promoters', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setPromoters(data.data || data);
                } else {
                    console.error('Failed to load promoters');
                }
            } catch (error) {
                console.error('Error loading promoters:', error);
            } finally {
                setLoadingPromoters(false);
            }
        };

        fetchPromoters();
    }, []);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user makes a selection
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    }, [errors]);

    const validateForm = () => {
        const newErrors = {};

        // Only validate email format if email is provided
        if (formData.visitor_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.visitor_email)) {
            newErrors.visitor_email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setSubmitStatus(null);

        try {
            const token = localStorage.getItem('token');
            const submissionData = {
                ...formData,
                assisted_by_promoter_id: formData.assisted_by_promoter_id === 'none' ? '' : formData.assisted_by_promoter_id,
                form_type: 'vivo_experience',
                category: 'experience_feedback',
                subject: 'Xperience Studio by Vivo - Visitor Feedback',
                priority: 'medium'
            };

            const response = await fetch('/api/vivo-experience-feedback', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            if (response.ok) {
                setSubmitStatus('success');

                // Reset form
                setFormData({
                    overall_experience: '',
                    favorite_section: '',
                    preferred_model: '',
                    souvenir_experience: '',
                    suggestions: '',
                    visitor_name: '',
                    visitor_email: '',
                    visitor_phone: '',
                    visit_date: new Date().toISOString().split('T')[0],
                    is_anonymous: false,
                    allow_marketing_contact: false,
                });

                // Auto-redirect after success
                setTimeout(() => {
                    if (onBack) onBack();
                }, 3000);
            } else {
                const errorData = await response.json();
                setSubmitStatus('error');
                setErrors(errorData.errors || { general: 'Failed to submit feedback' });
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setSubmitStatus('error');
            setErrors({ general: 'Network error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const renderSimpleOptions = (options, selectedValue, fieldName) => {
        return (
            <div className="space-y-3">
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => handleInputChange(fieldName, option.value)}
                        className={`
                            flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50
                            ${selectedValue === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white'
                            }
                        `}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                            ${selectedValue === option.value
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}
                        >
                            {selectedValue === option.value && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                        </div>
                        <span className="text-gray-900 font-medium">{option.label}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    {onBack && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onBack}
                            className="absolute left-6 top-6"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    )}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg">
                        <h1 className="text-2xl font-bold">Xperience Studio by Vivo</h1>
                        <p className="text-blue-100">Visitor Feedback Form</p>
                    </div>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Help us enhance your experience by sharing your thoughts about your visit to the Xperience Studio by Vivo. All questions and contact information are optional.
                </p>
            </div>

            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="text-green-800">
                        <p className="font-medium">Thank you for your feedback!</p>
                        <p className="text-sm">Your experience feedback has been submitted successfully. We appreciate your time!</p>
                    </div>
                </Alert>
            )}

            {submitStatus === 'error' && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div className="text-red-800">
                        <p className="font-medium">Error submitting feedback</p>
                        <p className="text-sm">{errors.general || 'Please check your information and try again.'}</p>
                    </div>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Question 1: Overall Experience */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Question 1: Overall Experience (Optional)
                            </h2>
                            <p className="text-gray-600 mb-4">
                                How would you rate your overall experience at the Xperience Studio by Vivo?
                            </p>
                        </div>

                        {renderSimpleOptions(experienceOptions, formData.overall_experience, 'overall_experience')}

                        {errors.overall_experience && (
                            <p className="text-red-600 text-sm mt-2">{errors.overall_experience}</p>
                        )}
                    </div>
                </Card>

                {/* Question 2: Favorite Section */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Question 2: Favorite Section (Optional)
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Which section did you enjoy the most?
                            </p>
                        </div>

                        {renderSimpleOptions(sectionOptions, formData.favorite_section, 'favorite_section')}

                        {errors.favorite_section && (
                            <p className="text-red-600 text-sm mt-2">{errors.favorite_section}</p>
                        )}
                    </div>
                </Card>

                {/* Question 3: Vivo Model Preference */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Question 3: Vivo Model Preference (Optional)
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Which of these Vivo flagship models excites you the most as a potential next smartphone?
                            </p>
                        </div>

                        {renderSimpleOptions(modelOptions, formData.preferred_model, 'preferred_model')}

                        {errors.preferred_model && (
                            <p className="text-red-600 text-sm mt-2">{errors.preferred_model}</p>
                        )}
                    </div>
                </Card>

                {/* Question 4: Souvenir Experience */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Question 4: Souvenir Experience (Optional)
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Did you find the photo souvenir experience engaging and memorable?
                            </p>
                        </div>

                        {renderSimpleOptions(souvenirOptions, formData.souvenir_experience, 'souvenir_experience')}

                        {errors.souvenir_experience && (
                            <p className="text-red-600 text-sm mt-2">{errors.souvenir_experience}</p>
                        )}
                    </div>
                </Card>

                {/* Question 5: Suggestions */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Question 5: Feedback & Suggestions (Optional)
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Any suggestions or feedback to improve the experience?
                            </p>
                        </div>

                        <Textarea
                            value={formData.suggestions}
                            onChange={(e) => handleInputChange('suggestions', e.target.value)}
                            placeholder="Please share your thoughts, suggestions, or any other feedback..."
                            rows={4}
                            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </Card>

                {/* Promoter Assistance */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Promoter Assistance</h2>

                        <div>
                            <Label htmlFor="assisted_by_promoter_id">Which promoter assisted you today? (Optional)</Label>
                            <Select
                                value={formData.assisted_by_promoter_id}
                                onValueChange={(value) => handleInputChange('assisted_by_promoter_id', value)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={loadingPromoters ? "Loading promoters..." : "Select a promoter"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No promoter assistance</SelectItem>
                                    {promoters.map((promoter) => (
                                        <SelectItem key={promoter.id} value={promoter.id.toString()}>
                                            {promoter.name} (ID: {promoter.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-gray-500 mt-1">
                                Help us recognize our team members who provided assistance during your visit.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Contact Information */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information (All Optional)</h2>

                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="is_anonymous"
                                checked={formData.is_anonymous}
                                onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="is_anonymous">Submit feedback anonymously</Label>
                        </div>

                        {!formData.is_anonymous && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="visitor_name">Your Name (Optional)</Label>
                                        <Input
                                            id="visitor_name"
                                            type="text"
                                            value={formData.visitor_name}
                                            onChange={(e) => handleInputChange('visitor_name', e.target.value)}
                                            placeholder="Your full name"
                                            className={errors.visitor_name ? 'border-red-500' : ''}
                                        />
                                        {errors.visitor_name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.visitor_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="visitor_email">Email Address (Optional)</Label>
                                        <Input
                                            id="visitor_email"
                                            type="email"
                                            value={formData.visitor_email}
                                            onChange={(e) => handleInputChange('visitor_email', e.target.value)}
                                            placeholder="your.email@example.com"
                                            className={errors.visitor_email ? 'border-red-500' : ''}
                                        />
                                        {errors.visitor_email && (
                                            <p className="text-red-600 text-sm mt-1">{errors.visitor_email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="visitor_phone">Phone Number (Optional)</Label>
                                        <Input
                                            id="visitor_phone"
                                            type="tel"
                                            value={formData.visitor_phone}
                                            onChange={(e) => handleInputChange('visitor_phone', e.target.value)}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="visit_date">Visit Date</Label>
                                        <Input
                                            id="visit_date"
                                            type="date"
                                            value={formData.visit_date}
                                            onChange={(e) => handleInputChange('visit_date', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="allow_marketing_contact"
                                        checked={formData.allow_marketing_contact}
                                        onChange={(e) => handleInputChange('allow_marketing_contact', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="allow_marketing_contact" className="text-sm">
                                        I'd like to receive updates about new Vivo products and experiences
                                    </Label>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-center gap-4">
                    {onBack && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            disabled={loading}
                            className="px-8"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </div>
            </form>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t">
                <p className="text-sm text-gray-500">
                    Thank you for visiting the Xperience Studio by Vivo! Your feedback helps us create amazing experiences.
                </p>
            </div>
        </div>
    );
};

export default VivoExperienceForm;
