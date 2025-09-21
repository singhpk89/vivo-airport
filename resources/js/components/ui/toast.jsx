import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export const Toast = ({
    message,
    type = 'error',
    isVisible,
    onClose,
    duration = 5000,
    position = 'top-right'
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);

            // Auto-hide after duration
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-white" />;
            case 'info':
                return <Info className="w-5 h-5 text-white" />;
            case 'error':
            default:
                return <AlertCircle className="w-5 h-5 text-white" />;
        }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-emerald-600 border-emerald-700 text-white shadow-lg shadow-emerald-600/30';
            case 'info':
                return 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-600/30';
            case 'error':
            default:
                return 'bg-red-600 border-red-700 text-white shadow-lg shadow-red-600/30';
        }
    };

    const getPositionStyles = () => {
        switch (position) {
            case 'top-left':
                return 'top-4 left-4';
            case 'top-center':
                return 'top-4 left-1/2 transform -translate-x-1/2';
            case 'top-right':
            default:
                return 'top-4 right-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'bottom-center':
                return 'bottom-4 left-1/2 transform -translate-x-1/2';
            case 'bottom-right':
                return 'bottom-4 right-4';
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={`fixed z-50 min-w-80 max-w-md transition-all duration-300 ease-in-out ${getPositionStyles()} ${
                isAnimating
                    ? 'translate-x-0 opacity-100'
                    : position.includes('right')
                        ? 'translate-x-full opacity-0'
                        : position.includes('left')
                            ? '-translate-x-full opacity-0'
                            : 'translate-y-full opacity-0'
            }`}
        >
            <div className={`rounded-lg border p-4 shadow-xl ${getTypeStyles()}`}>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-relaxed text-white">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ToastContainer = ({ toasts, onRemoveToast }) => {
    return (
        <div className="pointer-events-none">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={() => onRemoveToast(toast.id)}
                    duration={toast.duration}
                    position={toast.position}
                />
            ))}
        </div>
    );
};

// Hook for managing toasts
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'error', duration = 5000, position = 'top-right') => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            message,
            type,
            duration,
            position,
            isVisible: true
        };

        setToasts(prev => [...prev, newToast]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const showError = (message, duration = 5000) => {
        addToast(message, 'error', duration);
    };

    const showSuccess = (message, duration = 5000) => {
        addToast(message, 'success', duration);
    };

    const showInfo = (message, duration = 4000) => {
        addToast(message, 'info', duration);
    };

    return {
        toasts,
        addToast,
        removeToast,
        showError,
        showSuccess,
        showInfo
    };
};
