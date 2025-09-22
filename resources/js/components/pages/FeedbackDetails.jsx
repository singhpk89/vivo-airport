import React from 'react';
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    Clock,
    Star,
    Tag,
    AlertCircle,
    MessageSquare,
    TrendingUp,
    Target,
    Smartphone,
    CheckCircle2,
    Users
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/alert';

const FeedbackDetails = ({ feedback, onBack }) => {
    if (!feedback) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div className="text-red-800">
                        <p className="font-medium">Feedback not found</p>
                        <p className="text-sm">The requested feedback could not be loaded.</p>
                    </div>
                </Alert>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatExperienceValue = (value) => {
        if (!value) return 'Not provided';

        // Convert technical values to readable format
        const formatMap = {
            // Q1: Overall Experience
            'excellent': 'Excellent',
            'very_good': 'Very Good',
            'good': 'Good',
            'average': 'Average',
            'poor': 'Poor',
            
            // Q2: Key Drivers of Experience (multi-select)
            'hands_on_demo': 'Hands-on product demo',
            'photography_zones': 'Photography zones (Macro, Photobooth, etc.)',
            'staff_support': 'Staff support & guidance',
            'ambience_design': 'Ambience & design',
            'photo_souvenir': 'Photo souvenir',
            'other': 'Other',
            
            // Q3: Brand Perception Shift
            'significantly_improved': 'Significantly improved',
            'slightly_improved': 'Slightly improved',
            'no_change': 'No change',
            'worsened': 'Worsened',
            
            // Q4: Brand Image (multi-select)
            'innovative_future_ready': 'Innovative & future-ready',
            'premium_aspirational': 'Premium & aspirational',
            'approachable_friendly': 'Approachable & friendly',
            'modern_trendy': 'Modern & trendy',
            'reliable_trustworthy': 'Reliable & trustworthy',
            'no_clear_image': 'No clear brand image / confusing',
            
            // Legacy values for backward compatibility
            'macro_photography': 'Macro Photography',
            'photobooth_zone': 'Photobooth Zone',
            'photo_gallery': 'Photo Gallery',
            'all_above': 'All of the Above',
            'vivo_x200_pro': 'Vivo X200 Pro',
            'vivo_x200_fe': 'Vivo X200 FE',
            'vivo_x_fold5': 'Vivo X Fold5',
            'still_exploring': "I'm still exploring options",
            'yes': 'Yes, very satisfied',
            'somewhat': 'Somewhat satisfied',
            'no': 'Not satisfied'
        };

        return formatMap[value] || value;
    };

    const formatMultiSelectValues = (values) => {
        if (!values || !Array.isArray(values) || values.length === 0) {
            return 'Not provided';
        }
        
        return values.map(value => formatExperienceValue(value)).join(', ');
    };

    const renderVivoExperienceSection = () => {
        const hasVivoData = feedback.overall_experience || feedback.key_drivers ||
                           feedback.brand_perception || feedback.brand_image ||
                           feedback.suggestions || feedback.experience_rating ||
                           // Legacy fields for backward compatibility
                           feedback.favorite_section || feedback.preferred_model || 
                           feedback.souvenir_experience;

        if (!hasVivoData) {
            return (
                <div className="p-8 text-center">
                    <div className="text-gray-500">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No Vivo Experience feedback available</p>
                        <p className="text-sm">This submission doesn't contain Vivo Experience Studio feedback.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-600 rounded-xl">
                        <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Vivo Experience Feedback</h2>
                        <p className="text-gray-600">Visitor experience at the Vivo Experience Studio</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Q1: Overall Experience */}
                    {feedback.overall_experience && (
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Star className="h-5 w-5 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Q1. Overall Experience</h3>
                            </div>
                            <div className="pl-10">
                                <p className="text-sm text-gray-600 mb-2">How would you rate your experience at the Xperience Studio by vivo?</p>
                                <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">
                                    {formatExperienceValue(feedback.overall_experience)}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Q2: Key Drivers of Experience (Multi-select) */}
                    {feedback.key_drivers && feedback.key_drivers.length > 0 && (
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Target className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Q2. Key Drivers of Experience</h3>
                            </div>
                            <div className="pl-10">
                                <p className="text-sm text-gray-600 mb-3">Which aspects influenced your experience the most?</p>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.key_drivers.map((driver, index) => (
                                        <Badge key={index} className="bg-blue-100 text-blue-800 text-sm px-2 py-1">
                                            {formatExperienceValue(driver)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Q3: Brand Perception Shift */}
                    {feedback.brand_perception && (
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Q3. Brand Perception Shift</h3>
                            </div>
                            <div className="pl-10">
                                <p className="text-sm text-gray-600 mb-2">How has your perception of vivo as a brand changed?</p>
                                <Badge className="bg-purple-100 text-purple-800 text-base px-3 py-1">
                                    {formatExperienceValue(feedback.brand_perception)}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Q4: Brand Image (Multi-select) */}
                    {feedback.brand_image && feedback.brand_image.length > 0 && (
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Q4. Brand Image</h3>
                            </div>
                            <div className="pl-10">
                                <p className="text-sm text-gray-600 mb-3">Which best describes brand vivo for you?</p>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.brand_image.map((image, index) => (
                                        <Badge key={index} className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1">
                                            {formatExperienceValue(image)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Q5: Suggestions */}
                    {feedback.suggestions && (
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 md:col-span-2">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Q5. Suggestions</h3>
                            </div>
                            <div className="pl-10">
                                <p className="text-sm text-gray-600 mb-3">Any feedback or ideas to make your experience even better?</p>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                                        {feedback.suggestions}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legacy Questions - For Backward Compatibility */}
                    {feedback.favorite_section && (
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 opacity-75">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Tag className="h-5 w-5 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Favorite Section (Legacy)</h3>
                            </div>
                            <div className="pl-10">
                                <p className="text-gray-700 text-base font-medium">
                                    {formatExperienceValue(feedback.favorite_section)}
                                </p>
                            </div>
                        </div>
                    )}

                    {feedback.preferred_model && (
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 opacity-75">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Smartphone className="h-5 w-5 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Preferred Model (Legacy)</h3>
                            </div>
                            <div className="pl-10">
                                <p className="text-gray-700 text-base font-medium">
                                    {formatExperienceValue(feedback.preferred_model)}
                                </p>
                            </div>
                        </div>
                    )}

                    {feedback.souvenir_experience && (
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 opacity-75">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Star className="h-5 w-5 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Souvenir Experience (Legacy)</h3>
                            </div>
                            <div className="pl-10">
                                <p className="text-gray-700 text-base font-medium">
                                    {formatExperienceValue(feedback.souvenir_experience)}
                                </p>
                            </div>
                        </div>
                    )}

                    {feedback.experience_rating && (
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 md:col-span-2">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Star className="h-5 w-5 text-yellow-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Experience Rating</h3>
                            </div>
                            <div className="pl-10">
                                <div className="flex items-center gap-4">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-6 w-6 ${
                                                    star <= feedback.experience_rating
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-lg font-semibold text-gray-700">
                                        {feedback.experience_rating} out of 5 stars
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onBack}
                                className="flex items-center gap-2 hover:bg-gray-50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Feedback List
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Vivo Experience Studio</h1>
                                <p className="text-gray-600 mt-1">Visitor Feedback - Submission #{feedback.id}</p>
                                {feedback.visit_date && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Visit Date: {new Date(feedback.visit_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge className={getStatusColor(feedback.status)}>
                                {feedback.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                            </Badge>
                            {(feedback.visitor_name || feedback.name) && (
                                <p className="text-sm text-gray-600 mt-2">
                                    Submitted by: {feedback.visitor_name || feedback.name}
                                </p>
                            )}
                            {feedback.assisted_by_promoter && (
                                <p className="text-sm text-blue-600 mt-1">
                                    Assisted by Promoter: {feedback.assisted_by_promoter.name} (ID: {feedback.assisted_by_promoter.id})
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vivo Experience Feedback - Main Content */}
                {renderVivoExperienceSection()}

                {/* Footer with submission timestamp */}
                <div className="text-center text-gray-500 text-sm mt-8">
                    <p>Submitted on {formatDate(feedback.created_at)}</p>
                </div>
            </div>
        </div>
    );
};

export default FeedbackDetails;
