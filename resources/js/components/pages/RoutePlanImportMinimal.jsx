import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RoutePlanImportMinimal = () => {
    const navigate = useNavigate();
    const { isMenuAccessible, token } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/route-plans')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to route plans
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Import route plans
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Upload and import route plan data from CSV or Excel files
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            File Upload
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Minimal version working. Token: {token ? 'Present' : 'Missing'}</p>
                        <p>Menu accessible: {isMenuAccessible ? 'Yes' : 'No'}</p>
                        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RoutePlanImportMinimal;
