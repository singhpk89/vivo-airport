import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RoutePlanImportTest = () => {
    const { isAuthenticated, user, token } = useAuth();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Route plan import - Test version</h1>
            <div className="space-y-2">
                <p>Authentication Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
                <p>User: {user?.name || 'None'}</p>
                <p>Token: {token ? 'Present' : 'Missing'}</p>
                <p>This is a simplified test version to verify the component loads.</p>
            </div>
        </div>
    );
};

export default RoutePlanImportTest;
