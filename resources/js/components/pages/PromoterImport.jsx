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
  Users,
  MapPin,
  Database,
  Clock,
  ChevronRight,
  Loader,
  UserCheck
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

const PromoterImport = () => {
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
            description: 'Choose your CSV or Excel file',
            icon: FileText
        },
        {
            id: 2,
            title: 'Validate Data',
            description: 'Review and validate the data',
            icon: CheckCircle
        },
        {
            id: 3,
            title: 'Import Complete',
            description: 'View import results',
            icon: Database
        }
    ];

    const requiredColumns = [
        'name', 'username', 'password', 'state', 'district', 'status', 'is_active', 'is_logged_in'
    ];

    const fieldDescriptions = {
        'name': 'Full name of the promoter (e.g., John Doe)',
        'username': 'Unique username for login (e.g., john.doe)',
        'password': 'Password for the promoter account (minimum 6 characters)',
        'state': 'State name (e.g., Maharashtra, Delhi)',
        'district': 'District name within the state',
        'status': 'Promoter status (active, inactive, pending, suspended)',
        'is_active': 'Whether the promoter is active (true/false or 1/0)',
        'is_logged_in': 'Whether the promoter is currently logged in (true/false or 1/0)'
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = [
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if (allowedTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                setSelectedFile(file);
            } else {
                showError('Please select a valid CSV or Excel file (.csv, .xlsx, .xls)');
                setSelectedFile(null);
            }
        }
    };

    const handleFileDrop = (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect({ target: { files } });
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const downloadSampleCSV = () => {
        const sampleData = [
            requiredColumns,
            [
                'John Doe', 'john.doe', 'password123', 'Maharashtra', 'Mumbai', 'active', 'true', 'false'
            ],
            [
                'Jane Smith', 'jane.smith', 'password456', 'Delhi', 'New Delhi', 'active', 'true', 'false'
            ],
            [
                'Mike Johnson', 'mike.johnson', 'password789', 'Karnataka', 'Bangalore', 'pending', 'true', 'false'
            ]
        ];

        const csvContent = sampleData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'promoter_sample.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const validateFile = async () => {
        if (!selectedFile) {
            showError('Please select a file first');
            return;
        }

        // Client-side validation
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (selectedFile.size > maxSize) {
            showError(`File size too large. Maximum allowed size is 10MB. Your file is ${Math.round(selectedFile.size / 1024 / 1024)}MB.`);
            return;
        }

        const allowedExtensions = ['.csv', '.xlsx', '.xls'];
        const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

        const hasValidExtension = allowedExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
        const hasValidMime = allowedMimes.includes(selectedFile.type);

        if (!hasValidExtension && !hasValidMime) {
            showError(`Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls). Your file type: ${selectedFile.type || 'unknown'}`);
            return;
        }

        setIsUploading(true);
        setUploadStatus('validating');
        setUploadProgress(20);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('validate_only', 'true');

            // Simulate file validation progress
            let progress = 20;
            const progressInterval = setInterval(() => {
                progress += 10;
                setUploadProgress(Math.min(progress, 80));
            }, 200);

            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            console.log('PromoterImport: Using token for validation:', token ? 'Present' : 'Missing');

            if (!token) {
                console.error('PromoterImport: No authentication token found');
                showError('Authentication required. Please login again.');
                setIsUploading(false);
                return;
            }

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            };

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            const response = await fetch('/api/promoters/import/validate', {
                method: 'POST',
                headers,
                body: formData
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.ok) {
                const results = await response.json();
                console.log('PromoterImport: Validation successful, results:', results);
                setValidationResults(results.data || results);
                setUploadStatus('validated');
                setCurrentStep(2);
                showSuccess('File validation completed successfully!');
            } else {
                const errorData = await response.json();
                console.error('PromoterImport: Validation error response:', errorData);

                let errorMessage = 'Validation failed';
                if (response.status === 401) {
                    errorMessage = 'Authentication failed. Please check your login status.';
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
                if (errorData.errors) {
                    const firstError = Object.values(errorData.errors)[0];
                    if (firstError && firstError[0]) {
                        errorMessage += ': ' + firstError[0];
                    }
                }

                showError(errorMessage);
                setUploadStatus('error');
            }
        } catch (err) {
            showError('Network error during validation. Please try again.');
            setUploadStatus('error');
            console.error('PromoterImport: Validation error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const processImport = async () => {
        if (!validationResults) {
            showError('Please validate the file first');
            return;
        }

        setIsUploading(true);
        setUploadStatus('processing');
        setUploadProgress(0);

        try {
            // Simulate import progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 5;
                setUploadProgress(Math.min(progress, 90));
            }, 100);

            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            if (!token) {
                showError('Authentication required. Please login again.');
                setIsUploading(false);
                return;
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            };

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            const response = await fetch('/api/promoters/import', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    file_path: validationResults.file_path,
                    skip_duplicates: true
                })
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.ok) {
                const results = await response.json();
                setImportResults(results.data || results);
                setUploadStatus('success');
                setCurrentStep(3);
                showSuccess(`Import completed! ${results.data?.imported || 0} promoters imported successfully.`);
            } else {
                const errorData = await response.json();
                let errorMessage = 'Import failed';
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
                showError(errorMessage);
                setUploadStatus('error');
            }
        } catch (err) {
            showError('Network error during import. Please try again.');
            setUploadStatus('error');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const resetImport = () => {
        setCurrentStep(1);
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
        setValidationResults(null);
        setImportResults(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'text-success bg-success-container';
            case 'error': return 'text-error bg-error-container';
            case 'processing':
            case 'validating':
            case 'uploading': return 'text-warning bg-warning-container';
            default: return 'text-on-surface-variant bg-surface-variant';
        }
    };

    return (
        <div className="relative flex flex-col bg-surface h-full overflow-hidden">
            {/* Header (compact: only back button) */}
            <div className="px-4 py-2 shrink-0" style={{ background: 'transparent', boxShadow: 'none' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="text-on-surface hover:bg-surface-variant"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content - Scrollable (more compact spacing) */}
            <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                <div className="p-4">
                    <div className="max-w-4xl mx-auto space-y-4">

                        {/* Step 1: File Selection */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                {/* File Upload Area */}
                                <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
                                    <CardContent className="p-8">
                                        <div
                                            className="text-center cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                            onDrop={handleFileDrop}
                                            onDragOver={handleDragOver}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".csv,.xlsx,.xls"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />

                                            {selectedFile ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-center">
                                                        <div className="p-4 bg-primary/10 rounded-full">
                                                            <FileSpreadsheet className="w-12 h-12 text-primary" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-on-surface mb-2">
                                                            File Selected
                                                        </h3>
                                                        <div className="bg-surface-variant rounded-lg p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <File className="w-5 h-5 text-on-surface-variant" />
                                                                    <div className="text-left">
                                                                        <p className="font-medium text-on-surface">{selectedFile.name}</p>
                                                                        <p className="text-sm text-on-surface-variant">
                                                                            {Math.round(selectedFile.size / 1024)} KB
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedFile(null);
                                                                        if (fileInputRef.current) {
                                                                            fileInputRef.current.value = '';
                                                                        }
                                                                    }}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-center">
                                                        <div className="p-4 bg-primary/10 rounded-full">
                                                            <Upload className="w-12 h-12 text-primary" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-on-surface mb-2">
                                                            Drop your file here or click to browse
                                                        </h3>
                                                        <p className="text-sm text-on-surface-variant">
                                                            Supports CSV, Excel (.xlsx, .xls) files up to 10MB
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Instructions */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <Info className="w-5 h-5 text-primary" />
                                            <CardTitle className="text-lg">File Requirements</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-medium text-on-surface mb-2">Required Columns</h4>
                                                <div className="space-y-1">
                                                    {requiredColumns.map((column) => (
                                                        <div key={column} className="flex items-center gap-2">
                                                            <CheckCircle className="w-4 h-4 text-success" />
                                                            <code className="text-sm bg-surface-variant px-2 py-1 rounded">
                                                                {column}
                                                            </code>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-on-surface mb-2">Field Descriptions</h4>
                                                <div className="space-y-2 text-sm text-on-surface-variant">
                                                    {Object.entries(fieldDescriptions).slice(0, 4).map(([field, desc]) => (
                                                        <div key={field}>
                                                            <strong>{field}:</strong> {desc}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-outline-variant">
                                            <Button variant="outline" onClick={downloadSampleCSV} className="w-full sm:w-auto">
                                                <Download className="w-4 h-4 mr-2" />
                                                Download Sample CSV
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Step 2: Validation Results */}
                        {currentStep === 2 && validationResults && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-success" />
                                            <CardTitle className="text-lg">Validation Results</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-success-container rounded-lg">
                                                <div className="text-2xl font-bold text-success">
                                                    {validationResults.valid_rows || 0}
                                                </div>
                                                <div className="text-sm text-success">Valid Records</div>
                                            </div>
                                            <div className="text-center p-4 bg-error-container rounded-lg">
                                                <div className="text-2xl font-bold text-error">
                                                    {validationResults.invalid_rows || 0}
                                                </div>
                                                <div className="text-sm text-error">Invalid Records</div>
                                            </div>
                                            <div className="text-center p-4 bg-surface-variant rounded-lg">
                                                <div className="text-2xl font-bold text-on-surface">
                                                    {validationResults.total_rows || 0}
                                                </div>
                                                <div className="text-sm text-on-surface-variant">Total Records</div>
                                            </div>
                                        </div>

                                        {validationResults.errors && validationResults.errors.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="font-medium text-error mb-3">Validation Errors</h4>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {validationResults.errors.map((error, index) => (
                                                        <div key={index} className="p-3 bg-error-container rounded text-sm">
                                                            <span className="font-medium">Row {error.row}:</span> {error.message}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Step 3: Import Complete */}
                        {currentStep === 3 && importResults && (
                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center space-y-4">
                                            <div className="flex items-center justify-center">
                                                <div className="p-4 bg-success-container rounded-full">
                                                    <CheckCircle className="w-12 h-12 text-success" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-success mb-1">
                                                    Import Completed
                                                </h3>
                                                <p className="text-sm text-success">
                                                    {importResults.imported || 0} promoters imported.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Upload Progress */}
                        {isUploading && (
                            <Card>
                                <CardContent className="pt-4 pb-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Loader className="w-4 h-4 animate-spin text-primary" />
                                                <span className="text-sm font-medium">
                                                    {uploadStatus === 'validating' ? 'Validating...' :
                                                     uploadStatus === 'processing' ? 'Processing...' :
                                                     'Uploading...'}
                                                </span>
                                            </div>
                                            <Badge className={getStatusColor(uploadStatus)}>
                                                {uploadStatus}
                                            </Badge>
                                        </div>
                                        <Progress value={uploadProgress} className="w-full" />
                                        <p className="text-xs text-on-surface-variant">
                                            {uploadProgress}%
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions - Fixed Bottom like Route Plan */}
            <div className="sticky bottom-0 z-20 bg-gradient-to-r from-background via-background to-background border-t border-border shadow-lg backdrop-blur-sm mt-auto">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            {currentStep > 1 && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    disabled={isUploading}
                                    className="h-12 px-6 text-base font-medium border-2 hover:scale-105 transition-all duration-200"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Previous
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-4">
                            {currentStep === 1 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={resetImport}
                                        disabled={isUploading}
                                        className="h-12 px-6 text-base font-medium border-2 hover:scale-105 transition-all duration-200"
                                    >
                                        <X className="w-5 h-5 mr-2" />
                                        Clear
                                    </Button>
                                    <Button
                                        size="lg"
                                        onClick={validateFile}
                                        disabled={!selectedFile || isUploading}
                                        className="h-12 px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                                Validating...
                                            </>
                                        ) : (
                                            <>
                                                Validate File
                                                <ChevronRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                            {currentStep === 2 && (
                                <Button
                                    size="lg"
                                    onClick={processImport}
                                    disabled={isUploading || (validationResults?.invalid_rows > 0)}
                                    className="h-12 px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 mr-2" />
                                            Import Data
                                        </>
                                    )}
                                </Button>
                            )}
                            {currentStep === 3 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={resetImport}
                                        className="h-12 px-6 text-base font-medium border-2 hover:scale-105 transition-all duration-200"
                                    >
                                        <Upload className="w-5 h-5 mr-2" />
                                        Import More
                                    </Button>
                                    <Button
                                        size="lg"
                                        onClick={() => navigate('/acl/promoters')}
                                        className="h-12 px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
                                    >
                                        View Promoters
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
};

export default PromoterImport;
