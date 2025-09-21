import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  FileSpreadsheet,
  File,
  Info,
  Activity,
  MapPin,
  Database,
  Clock,
  ChevronRight,
  Loader,
  Calendar,
  User,
  Camera
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast, ToastContainer } from "@/components/ui/toast";

const ActivityRecceImport = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { isMenuAccessible, token } = useAuth();
    const { toasts, removeToast, showError, showSuccess, showInfo } = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, validating, processing, success, error
    const [validationResults, setValidationResults] = useState(null);
    const [importResults, setImportResults] = useState(null);

    const steps = [
        {
            id: 1,
            title: 'Select File',
            description: 'Choose your activity recce CSV file to upload',
            icon: FileSpreadsheet,
            status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending'
        },
        {
            id: 2,
            title: 'Validate Data',
            description: 'Review and validate the data before importing',
            icon: CheckCircle,
            status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'
        },
        {
            id: 3,
            title: 'Import Activities',
            description: 'Complete the import process',
            icon: Database,
            status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending'
        }
    ];

    const requiredColumns = [
        { field: 'route_plan_id', label: 'Route Plan ID', type: 'number', description: 'Unique identifier for the route plan' },
        { field: 'activity_date', label: 'Activity Date', type: 'date', description: 'Date when the activity was conducted (YYYY-MM-DD)' },
        { field: 'activity_type', label: 'Activity Type', type: 'text', description: 'Type of activity (e.g., Survey, Inspection, Meeting)' },
        { field: 'village', label: 'Village', type: 'text', description: 'Name of the village where activity was conducted' },
        { field: 'state', label: 'State', type: 'text', description: 'State name' },
        { field: 'district', label: 'District', type: 'text', description: 'District name' },
        { field: 'latitude', label: 'Latitude', type: 'number', description: 'GPS latitude coordinate (decimal degrees)' },
        { field: 'longitude', label: 'Longitude', type: 'number', description: 'GPS longitude coordinate (decimal degrees)' },
        { field: 'status', label: 'Status', type: 'text', description: 'Activity status (pending, in_progress, completed, cancelled)' },
        { field: 'notes', label: 'Notes', type: 'text', description: 'Additional notes about the activity (optional)' },
        { field: 'promoter_id', label: 'Promoter ID', type: 'number', description: 'ID of the promoter who conducted the activity' }
    ];

    const handleBack = () => {
        navigate(-1);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            setSelectedFile(file);
            setUploadStatus('idle');
            setValidationResults(null);
            setImportResults(null);
        } else {
            showError('Please select a valid CSV file');
        }
    };

    const handleFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setUploadStatus('idle');
        setValidationResults(null);
        setImportResults(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateFile = async () => {
        if (!selectedFile) {
            showError('Please select a file first');
            return;
        }

        setIsUploading(true);
        setUploadStatus('validating');
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            const response = await fetch('/api/activity-recces/validate-import', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                },
                body: formData
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.ok) {
                const result = await response.json();
                setValidationResults(result);
                setUploadStatus('validated');
                setCurrentStep(2);

                if (result.errors && result.errors.length > 0) {
                    showError(`Validation found ${result.errors.length} error(s). Please review and fix them.`);
                } else {
                    showSuccess('File validation completed successfully!');
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Validation failed');
            }
        } catch (error) {
            console.error('Validation error:', error);
            setUploadStatus('error');
            showError(error.message || 'Failed to validate file');
        } finally {
            setIsUploading(false);
        }
    };

    const importFile = async () => {
        if (!selectedFile || !validationResults) {
            showError('Please validate the file first');
            return;
        }

        if (validationResults.errors && validationResults.errors.length > 0) {
            showError('Please fix all validation errors before importing');
            return;
        }

        setIsUploading(true);
        setUploadStatus('processing');
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 5, 90));
            }, 200);

            const response = await fetch('/api/activity-recces/import', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                },
                body: formData
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.ok) {
                const result = await response.json();
                setImportResults(result);
                setUploadStatus('success');
                setCurrentStep(3);
                showSuccess(`Successfully imported ${result.imported_count || 0} activity recces!`);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Import failed');
            }
        } catch (error) {
            console.error('Import error:', error);
            setUploadStatus('error');
            showError(error.message || 'Failed to import file');
        } finally {
            setIsUploading(false);
        }
    };

    const downloadSampleCSV = () => {
        const headers = requiredColumns.map(col => col.field);
        const sampleData = [
            [
                '1',
                '2024-01-15',
                'Survey',
                'Sample Village',
                'Maharashtra',
                'Mumbai',
                '19.0760',
                '72.8777',
                'completed',
                'Sample activity notes',
                '1'
            ]
        ];

        const csvContent = [headers, ...sampleData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'activity_recces_sample.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showInfo('Sample CSV file downloaded successfully');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'active':
                return <div className="h-5 w-5 rounded-full border-2 border-blue-500 bg-blue-500" />;
            case 'pending':
            default:
                return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Fixed Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Activity className="h-6 w-6 mr-2 text-blue-600" />
                                Import Activity Recces
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Upload and import activity recce data from CSV files
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={downloadSampleCSV}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download Sample
                    </Button>
                </div>

                {/* Progress Steps */}
                <div className="mt-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center">
                                        {getStatusIcon(step.status)}
                                    </div>
                                    <div className="ml-3">
                                        <p className={`text-sm font-medium ${
                                            step.status === 'active' ? 'text-blue-600' :
                                            step.status === 'completed' ? 'text-emerald-600' : 'text-gray-500'
                                        }`}>
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-gray-500">{step.description}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="flex-1 mx-4">
                                        <div className={`h-0.5 ${
                                            step.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'
                                        }`} />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto p-6">
                    <Tabs value={`step-${currentStep}`} className="w-full">
                        <TabsContent value="step-1" className="space-y-6">
                            {/* File Upload Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileSpreadsheet className="h-5 w-5 mr-2" />
                                        Upload CSV File
                                    </CardTitle>
                                    <CardDescription>
                                        Select a CSV file containing activity recce data to import
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-gray-300 transition-colors">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />

                                        {selectedFile ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <File className="h-8 w-8 text-emerald-500" />
                                                    <div className="text-left">
                                                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={removeFile}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {uploadStatus === 'validating' && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <Loader className="h-4 w-4 animate-spin" />
                                                            <span className="text-sm text-gray-600">Validating file...</span>
                                                        </div>
                                                        <Progress value={uploadProgress} className="w-full" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                                                <div>
                                                    <Button onClick={handleFileUpload} className="mb-2">
                                                        Choose CSV File
                                                    </Button>
                                                    <p className="text-sm text-gray-500">
                                                        or drag and drop your file here
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {selectedFile && uploadStatus !== 'validating' && (
                                        <div className="flex justify-end">
                                            <Button onClick={validateFile} disabled={isUploading}>
                                                {isUploading ? (
                                                    <>
                                                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                                                        Validating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Validate File
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Required Columns Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Info className="h-5 w-5 mr-2" />
                                        Required Columns
                                    </CardTitle>
                                    <CardDescription>
                                        Your CSV file must contain the following columns
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {requiredColumns.map((column) => (
                                            <div key={column.field} className="p-3 border rounded-lg">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-sm">{column.label}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {column.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-600">{column.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="step-2" className="space-y-6">
                            {validationResults && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            Validation Results
                                        </CardTitle>
                                        <CardDescription>
                                            Review the validation results before importing
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Summary */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {validationResults.total_rows || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Total Rows</div>
                                            </div>
                                            <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                                <div className="text-2xl font-bold text-emerald-600">
                                                    {validationResults.valid_rows || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Valid Rows</div>
                                            </div>
                                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {validationResults.errors?.length || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Errors</div>
                                            </div>
                                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                                <div className="text-2xl font-bold text-yellow-600">
                                                    {validationResults.warnings?.length || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Warnings</div>
                                            </div>
                                        </div>

                                        {/* Errors */}
                                        {validationResults.errors && validationResults.errors.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-red-700 mb-2">Errors Found</h4>
                                                <div className="space-y-2">
                                                    {validationResults.errors.map((error, index) => (
                                                        <Alert key={index} variant="destructive">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertDescription>
                                                                Row {error.row}: {error.message}
                                                            </AlertDescription>
                                                        </Alert>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Warnings */}
                                        {validationResults.warnings && validationResults.warnings.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-yellow-700 mb-2">Warnings</h4>
                                                <div className="space-y-2">
                                                    {validationResults.warnings.map((warning, index) => (
                                                        <Alert key={index}>
                                                            <Info className="h-4 w-4" />
                                                            <AlertDescription>
                                                                Row {warning.row}: {warning.message}
                                                            </AlertDescription>
                                                        </Alert>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex justify-between pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentStep(1)}
                                            >
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                Back to Upload
                                            </Button>

                                            <Button
                                                onClick={importFile}
                                                disabled={isUploading || (validationResults.errors && validationResults.errors.length > 0)}
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                                                        Importing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Database className="h-4 w-4 mr-2" />
                                                        Import Data
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="step-3" className="space-y-6">
                            {importResults && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
                                            Import Complete
                                        </CardTitle>
                                        <CardDescription>
                                            Activity recce data has been successfully imported
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Results Summary */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                                <div className="text-3xl font-bold text-emerald-600">
                                                    {importResults.imported_count || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Activities Imported</div>
                                            </div>
                                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                <div className="text-3xl font-bold text-blue-600">
                                                    {importResults.updated_count || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Activities Updated</div>
                                            </div>
                                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                                <div className="text-3xl font-bold text-yellow-600">
                                                    {importResults.skipped_count || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Records Skipped</div>
                                            </div>
                                        </div>

                                        {/* Success Message */}
                                        <Alert>
                                            <CheckCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Import completed successfully! You can now view the imported activities in the All Activities page.
                                            </AlertDescription>
                                        </Alert>

                                        {/* Action Buttons */}
                                        <div className="flex justify-between pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setCurrentStep(1);
                                                    setSelectedFile(null);
                                                    setValidationResults(null);
                                                    setImportResults(null);
                                                    setUploadStatus('idle');
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                            >
                                                Import Another File
                                            </Button>

                                            <Button onClick={() => navigate('/reports/all-activity')}>
                                                <Activity className="h-4 w-4 mr-2" />
                                                View Activities
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Fixed Bottom Progress Bar */}
            {uploadStatus === 'processing' && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center space-x-4">
                            <Loader className="h-5 w-5 animate-spin text-blue-600" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">
                                        Importing activities...
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {uploadProgress}%
                                    </span>
                                </div>
                                <Progress value={uploadProgress} className="w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default ActivityRecceImport;
