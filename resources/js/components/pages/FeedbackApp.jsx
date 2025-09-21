import React, { useState } from 'react';
import FeedbackManagement from './FeedbackManagement';
import FeedbackDetails from './FeedbackDetails';
import VivoExperienceForm from './VivoExperienceForm';

const FeedbackApp = () => {
    const [currentView, setCurrentView] = useState('management'); // 'management' | 'details' | 'feedback'
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const handleCreateVivoExperience = () => {
        setSelectedFeedback(null);
        setCurrentView('feedback');
    };

    const handleViewFeedback = (feedback) => {
        setSelectedFeedback(feedback);
        setCurrentView('details');
    };

    const handleRespondToFeedback = (feedback) => {
        setSelectedFeedback(feedback);
        setCurrentView('details');
    };

    const handleBackToManagement = () => {
        setSelectedFeedback(null);
        setCurrentView('management');
    };

    const handleFeedbackSuccess = (feedbackData) => {
        // Handle successful creation/update
        console.log('Feedback saved:', feedbackData);
        setCurrentView('management');
        setSelectedFeedback(null);
    };

    switch (currentView) {
        case 'details':
            return (
                <FeedbackDetails
                    feedback={selectedFeedback}
                    onBack={handleBackToManagement}
                />
            );

        case 'feedback':
            return (
                <VivoExperienceForm
                    onBack={handleBackToManagement}
                    onSuccess={handleFeedbackSuccess}
                />
            );

        case 'management':
        default:
            return (
                <FeedbackManagement
                    onViewFeedback={handleViewFeedback}
                    onRespondToFeedback={handleRespondToFeedback}
                    onCreateVivoExperience={handleCreateVivoExperience}
                />
            );
    }
};

export default FeedbackApp;
