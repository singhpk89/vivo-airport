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
  Loader
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
import { formatDisplayValue } from "@/utils/textUtils";

const RoutePlanImport = () => {
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
        'state', 'district', 'sub_district', 'village', 'village_code',
        'width', 'height', 'area', 'wall_count', 'status'
    ];

    const fieldDescriptions = {
        'state': 'State name (e.g., Maharashtra, Delhi)',
        'district': 'District name within the state',
        'sub_district': 'Sub-district or tehsil name',
        'village': 'Village or locality name',
        'village_code': 'Unique code for the village (e.g., MH001)',
        'width': 'Width in meters (numeric value)',
        'height': 'Height in meters (numeric value)',
        'area': 'Area in square meters (calculated: width × height)',
        'wall_count': 'Number of walls (integer value)',
        'status': 'Status: active, planning, completed, or cancelled'
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
        const file = event.dataTransfer.files[0];
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
            }
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const downloadSampleCSV = () => {
        const sampleData = [
            requiredColumns,
            [
                'Maharashtra', 'Mumbai', 'Bandra West', 'Bandra West Village', 'MH001',
                '12.5', '8.3', '103.75', '2', 'active'
            ],
            [
                'Delhi', 'New Delhi', 'Connaught Place', 'CP Central Village', 'DL001',
                '10.0', '6.0', '60.0', '1', 'planning'
            ],
            [
                'Karnataka', 'Bangalore', 'Koramangala', 'Koramangala Village', 'KA001',
                '15.0', '10.0', '150.0', '3', 'completed'
            ]
        ];

        const csvContent = sampleData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'route_plan_sample.csv';
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

            // Debug token
            console.log('RoutePlanImport: Using token for validation:', token ? 'Present' : 'Missing');
            console.log('RoutePlanImport: Token preview:', token ? token.substring(0, 20) + '...' : 'None');
            console.log('RoutePlanImport: CSRF token:', csrfToken ? 'Present' : 'Missing');
            console.log('RoutePlanImport: CSRF token preview:', csrfToken ? csrfToken.substring(0, 20) + '...' : 'None');

            if (!token) {
                console.error('RoutePlanImport: No authentication token found');
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

            const response = await fetch('/api/route-plans/import/validate', {
                method: 'POST',
                headers,
                body: formData
            });

            console.log('RoutePlanImport: Validation response status:', response.status);
            console.log('RoutePlanImport: Validation response headers:', response.headers);

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.ok) {
                const results = await response.json();
                console.log('RoutePlanImport: Validation successful, results:', results);
                setValidationResults(results.data || results);
                setUploadStatus('validated');
                setCurrentStep(2);
                showSuccess('File validation completed successfully!');
            } else {
                const errorData = await response.json();
                console.error('RoutePlanImport: Validation error response:', errorData);
                console.error('RoutePlanImport: Full response:', response);

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
                if (errorData.debug) {
                    console.log('Debug info:', errorData.debug);
                    errorMessage += ` (File: ${errorData.debug.file_name}, Size: ${Math.round(errorData.debug.file_size / 1024)}KB, Type: ${errorData.debug.file_mime})`;
                }

                showError(errorMessage);
                setUploadStatus('error');
            }
        } catch (err) {
            showError('Network error during validation. Please try again.');
            setUploadStatus('error');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const processImport = async () => {
        if (!validationResults || !validationResults.file_path) {
            showError('No validated file found. Please validate the file first.');
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

            // Debug token
            console.log('RoutePlanImport: Using token for import:', token ? 'Present' : 'Missing');

            if (!token) {
                showError('Authentication required. Please login again.');
                setIsUploading(false);
                return;
            }

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            const response = await fetch('/api/route-plans/import', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    file_path: validationResults.file_path
                })
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.ok) {
                const results = await response.json();
                setImportResults(results.data || results);
                setUploadStatus('success');
                setCurrentStep(3);
                showSuccess('Route plans imported successfully!');
            } else {
                const errorData = await response.json();
                showError(errorData.message || 'Import failed');
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

    const handleBackToPlans = () => {
        navigate(-1);
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
                            onClick={handleBackToPlans}
                            className="text-on-surface hover:bg-surface-variant"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </div>
                    {/* Bulk Import badge removed per request */}
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
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-body-medium">
                                            <Upload className="w-5 h-5 text-primary" />
                                            Select File
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Drag & Drop Area */}
                                        <div
                                            className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
                                            onDrop={handleFileDrop}
                                            onDragOver={handleDragOver}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="space-y-3">
                                                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto">
                                                    <Upload className="w-8 h-8 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-title-small font-medium text-on-surface">
                                                        Drop file or click to browse
                                                    </p>
                                                    <p className="text-label-small text-on-surface-variant mt-1">
                                                        CSV / Excel (.xlsx, .xls) — up to 10MB
                                                    </p>
                                                </div>
                                                {selectedFile && (
                                                    <div className="bg-success-container text-success px-4 py-2 rounded-lg inline-flex items-center gap-2">
                                                        <FileSpreadsheet className="w-4 h-4" />
                                                        <span className="text-body-small font-medium">
                                                            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />

                                        {/* Sample Download */}
                                        <div className="bg-info-container border border-info rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <Info className="w-5 h-5 text-info mt-0.5" />
                                                <div className="flex-1">
                                                    <h4 className="text-body-medium font-medium text-info mb-2">
                                                        Need a sample format?
                                                    </h4>
                                                    <p className="text-body-small text-info mb-3">
                                                        Download our sample CSV file to see the exact format and required columns for route plan imports.
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={downloadSampleCSV}
                                                        className="border-info text-info hover:bg-info hover:text-on-info"
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        {formatDisplayValue("Download Sample CSV")}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Required Columns Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Database className="w-5 h-5 text-primary" />
                                            Required Columns
                                        </CardTitle>
                                        <CardDescription>
                                            Your file must include these columns with the exact names
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {requiredColumns.map((column) => (
                                                <div key={column} className="bg-surface-container rounded-lg p-3">
                                                    <div className="flex items-start gap-3">
                                                        <code className="text-label-medium font-mono text-primary bg-primary-container px-2 py-1 rounded">
                                                            {column}
                                                        </code>
                                                        <div className="flex-1">
                                                            <p className="text-body-small text-on-surface-variant">
                                                                {fieldDescriptions[column]}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 p-3 bg-warning-container rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                                                <div className="text-body-small text-warning">
                                                    <p className="font-medium mb-1">Important Notes:</p>
                                                    <ul className="space-y-1 list-disc list-inside text-label-small">
                                                        <li>Column names are case-sensitive and must match exactly</li>
                                                        <li>First row must contain the column headers</li>
                                                        <li>Area will be auto-calculated if width and height are provided</li>
                                                        <li>Empty rows will be skipped during import</li>
                                                        <li>Duplicate village_code will update existing records</li>
                                                    </ul>
                                                </div>
                                            </div>
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
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-primary" />
                                            Validation Results
                                        </CardTitle>
                                        <CardDescription>
                                            Review your data before importing
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Summary Stats */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="bg-surface-container rounded-lg p-3 text-center">
                                                <div className="text-title-large font-bold text-primary">
                                                    {validationResults.total_rows || 0}
                                                </div>
                                                <div className="text-label-small text-on-surface-variant">
                                                    Total
                                                </div>
                                            </div>
                                            <div className="bg-surface-container rounded-lg p-3 text-center">
                                                <div className="text-title-large font-bold text-success">
                                                    {validationResults.valid_rows || 0}
                                                </div>
                                                <div className="text-label-small text-on-surface-variant">
                                                    Valid
                                                </div>
                                            </div>
                                            <div className="bg-surface-container rounded-lg p-3 text-center">
                                                <div className="text-title-large font-bold text-error">
                                                    {validationResults.invalid_rows || 0}
                                                </div>
                                                <div className="text-label-small text-on-surface-variant">
                                                    Invalid
                                                </div>
                                            </div>
                                            <div className="bg-surface-container rounded-lg p-3 text-center">
                                                <div className="text-title-large font-bold text-warning">
                                                    {validationResults.warnings || 0}
                                                </div>
                                                <div className="text-label-small text-on-surface-variant">
                                                    Warnings
                                                </div>
                                            </div>
                                        </div>

                                        {/* Validation Issues */}
                                        {validationResults.errors && validationResults.errors.length > 0 && (
                                            <div className="space-y-3">
                                                <h3 className="text-title-small font-medium text-error">
                                                    Validation Errors ({validationResults.errors.length})
                                                </h3>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {validationResults.errors.map((error, index) => (
                                                        <div key={index} className="bg-error-container border border-error rounded-lg p-3">
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="w-4 h-4 text-error mt-0.5" />
                                                                <div className="text-body-small text-error">
                                                                    <span className="font-medium">Row {error.row}:</span> {error.message}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sample Data Preview */}
                                        {validationResults.sample_data && (
                                            <div className="space-y-3">
                                                <h3 className="text-title-small font-medium text-on-surface">
                                                    Data Preview (First 5 rows)
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border border-outline-variant rounded-lg">
                                                        <thead className="bg-surface-container">
                                                            <tr>
                                                                {Object.keys(validationResults.sample_data[0] || {}).map((column) => (
                                                                    <th key={column} className="px-3 py-2 text-left text-body-small font-medium text-on-surface border-b border-outline-variant">
                                                                        {column}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {validationResults.sample_data.slice(0, 5).map((row, index) => (
                                                                <tr key={index} className="border-b border-outline-variant last:border-b-0">
                                                                    {Object.values(row).map((value, colIndex) => (
                                                                        <td key={colIndex} className="px-3 py-2 text-body-small text-on-surface">
                                                                            {value || '-'}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Step 3: Import Results */}
                        {currentStep === 3 && importResults && (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-body-medium">
                                            <CheckCircle className="w-5 h-5 text-success" />
                                            Import Complete
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Import Summary */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="bg-success-container rounded-md p-3 text-center">
                                                <div className="text-title-large font-bold text-success">
                                                    {importResults.imported || 0}
                                                </div>
                                                <div className="text-label-small text-on-surface-variant">
                                                    Imported
                                                </div>
                                            </div>
                                            <div className="bg-warning-container rounded-md p-3 text-center">
                                                <div className="text-title-large font-bold text-warning">
                                                    {importResults.updated || 0}
                                                </div>
                                                <div className="text-label-small text-on-surface-variant">
                                                    Updated
                                                </div>
                                            </div>
                                            <div className="bg-error-container rounded-md p-3 text-center">
                                                <div className="text-title-large font-bold text-error">
                                                    {importResults.failed || 0}
                                                </div>
                                                <div className="text-label-small text-on-surface-variant">
                                                    Failed
                                                </div>
                                            </div>
                                            <div className="bg-surface-container rounded-md p-3 text-center">
                                                <div className="text-title-large font-bold text-on-surface">
                                                    {(importResults.imported || 0) + (importResults.updated || 0) + (importResults.failed || 0)}
                                                </div>
                                                <div className="text-label-small text-on-surface-variant">
                                                    Total
                                                </div>
                                            </div>
                                        </div>

                                        {/* Success Message */}
                                        <div className="bg-success-container border border-success rounded-md p-3">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-success" />
                                                <div>
                                                    <h3 className="text-body-small font-medium text-success mb-1">
                                                        Import Completed
                                                    </h3>
                                                    <p className="text-label-small text-success">
                                                        {importResults.imported || 0} route plans imported.
                                                    </p>
                                                </div>
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
                                                <span className="text-body-small font-medium">
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
                                        <p className="text-label-small text-on-surface-variant">
                                            {uploadProgress}%
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions - Respects App Layout */}
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
                                        onClick={handleBackToPlans}
                                        className="h-12 px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
                                    >
                                        View route plans
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

export default RoutePlanImport;
