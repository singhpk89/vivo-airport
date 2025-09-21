import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Log the error to console for debugging
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error info:', info);
        // You can log the error to an error reporting service here
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6">
                    <h2 className="text-lg font-bold">Something went wrong.</h2>
                    <p className="text-sm text-muted-foreground">Please refresh the page or contact support if the problem persists.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
