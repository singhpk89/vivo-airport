# Error Handling Examples

## Comprehensive Error Handling Patterns

### React Native Error Service
```typescript
interface APIError {
  type: 'network' | 'validation' | 'authentication' | 'server' | 'unknown';
  message: string;
  code?: string | number;
  details?: any;
}

interface ValidationErrors {
  [field: string]: string[];
}

class ErrorService {
  static parseAPIError(error: any, response?: Response): APIError {
    // Network errors
    if (!response || error.name === 'TypeError') {
      return {
        type: 'network',
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }

    // HTTP status based errors
    switch (response.status) {
      case 401:
        return {
          type: 'authentication',
          message: 'Your session has expired. Please login again.',
          code: 401,
        };

      case 403:
        return {
          type: 'authentication',
          message: 'You do not have permission to perform this action.',
          code: 403,
        };

      case 404:
        return {
          type: 'server',
          message: 'The requested resource was not found.',
          code: 404,
        };

      case 422:
        return {
          type: 'validation',
          message: 'Please check your input and try again.',
          code: 422,
          details: error.errors || {},
        };

      case 429:
        return {
          type: 'server',
          message: 'Too many requests. Please try again later.',
          code: 429,
        };

      case 500:
        return {
          type: 'server',
          message: 'Server error. Please try again later.',
          code: 500,
        };

      default:
        return {
          type: 'unknown',
          message: error.message || 'An unexpected error occurred.',
          code: response.status,
        };
    }
  }

  static handleError(error: APIError, showToast: (message: string) => void): void {
    switch (error.type) {
      case 'network':
        showToast('No internet connection. Please check your network.');
        break;

      case 'authentication':
        // Handle logout if needed
        if (error.code === 401) {
          // Redirect to login
        }
        showToast(error.message);
        break;

      case 'validation':
        // Don't show toast for validation errors, let form handle them
        break;

      case 'server':
        showToast('Server error. Please try again later.');
        break;

      default:
        showToast('Something went wrong. Please try again.');
    }
  }

  static formatValidationErrors(errors: ValidationErrors): string {
    const messages: string[] = [];
    
    Object.entries(errors).forEach(([field, fieldErrors]) => {
      fieldErrors.forEach(error => {
        messages.push(`${field}: ${error}`);
      });
    });

    return messages.join('\n');
  }
}

export { ErrorService, APIError, ValidationErrors };
```

### React Native API Client with Error Handling
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorService, APIError } from './ErrorService';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class APIClient {
  private baseURL = 'https://li-council.test/api';
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken(): Promise<void> {
    this.token = await AsyncStorage.getItem('auth_token');
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token && !endpoint.includes('/auth/login')) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: APIResponse<T> = await response.json();

      if (!response.ok) {
        const error = ErrorService.parseAPIError(data, response);
        
        // Handle token expiration
        if (error.code === 401) {
          await this.handleTokenExpiration();
        }
        
        throw error;
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or parsing error
      const apiError = ErrorService.parseAPIError(error);
      throw apiError;
    }
  }

  private async handleTokenExpiration(): Promise<void> {
    // Clear stored credentials
    await AsyncStorage.multiRemove(['auth_token', 'promoter_data']);
    this.token = null;
    
    // Emit event for app-wide logout handling
    // EventEmitter.emit('token_expired');
  }

  // Retry mechanism for network errors
  async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: APIError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.request<T>(endpoint, options);
      } catch (error) {
        lastError = error as APIError;
        
        // Don't retry for certain error types
        if (
          lastError.type === 'authentication' ||
          lastError.type === 'validation' ||
          lastError.code === 404
        ) {
          throw lastError;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
}

export default APIClient;
```

### React Native Form Validation Hook
```typescript
import { useState, useCallback } from 'react';
import { APIError, ValidationErrors } from './ErrorService';

interface UseFormValidationResult {
  errors: ValidationErrors;
  hasErrors: boolean;
  setFieldError: (field: string, error: string) => void;
  setErrors: (errors: ValidationErrors) => void;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  handleAPIError: (error: APIError) => boolean;
}

const useFormValidation = (): UseFormValidationResult => {
  const [errors, setErrorsState] = useState<ValidationErrors>({});

  const setFieldError = useCallback((field: string, error: string) => {
    setErrorsState(prev => ({
      ...prev,
      [field]: [error],
    }));
  }, []);

  const setErrors = useCallback((newErrors: ValidationErrors) => {
    setErrorsState(newErrors);
  }, []);

  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleAPIError = useCallback((error: APIError): boolean => {
    if (error.type === 'validation' && error.details) {
      setErrors(error.details);
      return true;
    }
    return false;
  }, [setErrors]);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    hasErrors,
    setFieldError,
    setErrors,
    clearErrors,
    clearFieldError,
    handleAPIError,
  };
};

export default useFormValidation;
```

### React Native Activity Form with Error Handling
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import APIClient from './APIClient';
import useFormValidation from './useFormValidation';
import { ErrorService } from './ErrorService';

const ActivityFormWithErrorHandling: React.FC = () => {
  const [formData, setFormData] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    activity_type: 'recce',
    product_type: 'Grey',
    state: '',
    district: '',
    location: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, setFieldError, clearErrors, handleAPIError } = useFormValidation();
  const apiClient = new APIClient();

  const validateForm = (): boolean => {
    clearErrors();
    let isValid = true;

    if (!formData.state.trim()) {
      setFieldError('state', 'State is required');
      isValid = false;
    }

    if (!formData.district.trim()) {
      setFieldError('district', 'District is required');
      isValid = false;
    }

    if (!formData.location.trim()) {
      setFieldError('location', 'Location is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiClient.requestWithRetry('/mobile/activities', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      Alert.alert('Success', 'Activity created successfully');
      // Reset form or navigate
    } catch (error) {
      const apiError = error as APIError;
      
      // Handle validation errors
      if (!handleAPIError(apiError)) {
        // Handle other errors
        ErrorService.handleError(apiError, (message) => {
          Alert.alert('Error', message);
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldError = (field: string): JSX.Element | null => {
    if (errors[field]) {
      return (
        <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
          {errors[field][0]}
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Create Activity</Text>
      
      <View style={{ marginBottom: 16 }}>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: errors.state ? 'red' : '#ccc',
            padding: 10,
            borderRadius: 4,
          }}
          placeholder="State"
          value={formData.state}
          onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
        />
        {renderFieldError('state')}
      </View>
      
      <View style={{ marginBottom: 16 }}>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: errors.district ? 'red' : '#ccc',
            padding: 10,
            borderRadius: 4,
          }}
          placeholder="District"
          value={formData.district}
          onChangeText={(text) => setFormData(prev => ({ ...prev, district: text }))}
        />
        {renderFieldError('district')}
      </View>
      
      <View style={{ marginBottom: 16 }}>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: errors.location ? 'red' : '#ccc',
            padding: 10,
            borderRadius: 4,
          }}
          placeholder="Location"
          value={formData.location}
          onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
        />
        {renderFieldError('location')}
      </View>
      
      <TouchableOpacity
        style={{
          backgroundColor: isSubmitting ? '#ccc' : '#007bff',
          padding: 15,
          borderRadius: 4,
          opacity: isSubmitting ? 0.6 : 1,
        }}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {isSubmitting ? 'Creating...' : 'Create Activity'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActivityFormWithErrorHandling;
```

### Flutter Error Service
```dart
enum ErrorType { network, validation, authentication, server, unknown }

class APIError implements Exception {
  final ErrorType type;
  final String message;
  final dynamic code;
  final Map<String, dynamic>? details;

  APIError({
    required this.type,
    required this.message,
    this.code,
    this.details,
  });

  @override
  String toString() => 'APIError: $message';
}

class ErrorService {
  static APIError parseAPIError(dynamic error, {http.Response? response}) {
    // Network errors
    if (response == null || error is SocketException) {
      return APIError(
        type: ErrorType.network,
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      );
    }

    // Parse response body
    Map<String, dynamic>? responseData;
    try {
      responseData = jsonDecode(response.body);
    } catch (e) {
      responseData = null;
    }

    final message = responseData?['message'] ?? 'An error occurred';

    // HTTP status based errors
    switch (response.statusCode) {
      case 401:
        return APIError(
          type: ErrorType.authentication,
          message: 'Your session has expired. Please login again.',
          code: 401,
        );

      case 403:
        return APIError(
          type: ErrorType.authentication,
          message: 'You do not have permission to perform this action.',
          code: 403,
        );

      case 404:
        return APIError(
          type: ErrorType.server,
          message: 'The requested resource was not found.',
          code: 404,
        );

      case 422:
        return APIError(
          type: ErrorType.validation,
          message: 'Please check your input and try again.',
          code: 422,
          details: responseData?['errors'] ?? {},
        );

      case 429:
        return APIError(
          type: ErrorType.server,
          message: 'Too many requests. Please try again later.',
          code: 429,
        );

      case 500:
        return APIError(
          type: ErrorType.server,
          message: 'Server error. Please try again later.',
          code: 500,
        );

      default:
        return APIError(
          type: ErrorType.unknown,
          message: message,
          code: response.statusCode,
        );
    }
  }

  static void handleError(APIError error, Function(String) showSnackBar) {
    switch (error.type) {
      case ErrorType.network:
        showSnackBar('No internet connection. Please check your network.');
        break;

      case ErrorType.authentication:
        showSnackBar(error.message);
        break;

      case ErrorType.server:
        showSnackBar('Server error. Please try again later.');
        break;

      default:
        showSnackBar('Something went wrong. Please try again.');
    }
  }

  static String formatValidationErrors(Map<String, dynamic> errors) {
    final messages = <String>[];
    
    errors.forEach((field, fieldErrors) {
      if (fieldErrors is List) {
        for (final error in fieldErrors) {
          messages.add('$field: $error');
        }
      }
    });

    return messages.join('\n');
  }
}
```

### Flutter Form Validation Mixin
```dart
mixin FormValidationMixin<T extends StatefulWidget> on State<T> {
  Map<String, List<String>> _errors = {};

  Map<String, List<String>> get errors => _errors;
  
  bool get hasErrors => _errors.isNotEmpty;

  void setFieldError(String field, String error) {
    setState(() {
      _errors[field] = [error];
    });
  }

  void setErrors(Map<String, dynamic> errors) {
    setState(() {
      _errors = errors.map((key, value) =>
          MapEntry(key, List<String>.from(value)));
    });
  }

  void clearErrors() {
    setState(() {
      _errors.clear();
    });
  }

  void clearFieldError(String field) {
    setState(() {
      _errors.remove(field);
    });
  }

  bool handleAPIError(APIError error) {
    if (error.type == ErrorType.validation && error.details != null) {
      setErrors(error.details!);
      return true;
    }
    return false;
  }

  Widget? buildFieldError(String field) {
    if (_errors[field] != null && _errors[field]!.isNotEmpty) {
      return Padding(
        padding: EdgeInsets.only(top: 4),
        child: Text(
          _errors[field]!.first,
          style: TextStyle(color: Colors.red, fontSize: 12),
        ),
      );
    }
    return null;
  }

  InputDecoration buildInputDecoration(String label, String field) {
    return InputDecoration(
      labelText: label,
      border: OutlineInputBorder(),
      errorBorder: OutlineInputBorder(
        borderSide: BorderSide(color: Colors.red),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderSide: BorderSide(color: Colors.red),
      ),
      errorText: _errors[field]?.first,
    );
  }
}
```

### Flutter Activity Form with Error Handling
```dart
import 'package:flutter/material.dart';
import 'api_client.dart';
import 'error_service.dart';

class ActivityFormWithErrorHandling extends StatefulWidget {
  @override
  _ActivityFormWithErrorHandlingState createState() =>
      _ActivityFormWithErrorHandlingState();
}

class _ActivityFormWithErrorHandlingState extends State<ActivityFormWithErrorHandling>
    with FormValidationMixin {
  final _formKey = GlobalKey<FormState>();
  final _apiClient = APIClient();
  
  // Form controllers
  final _stateController = TextEditingController();
  final _districtController = TextEditingController();
  final _locationController = TextEditingController();
  
  String _activityType = 'recce';
  String _productType = 'Grey';
  bool _isSubmitting = false;

  bool _validateForm() {
    clearErrors();
    bool isValid = true;

    if (_stateController.text.trim().isEmpty) {
      setFieldError('state', 'State is required');
      isValid = false;
    }

    if (_districtController.text.trim().isEmpty) {
      setFieldError('district', 'District is required');
      isValid = false;
    }

    if (_locationController.text.trim().isEmpty) {
      setFieldError('location', 'Location is required');
      isValid = false;
    }

    return isValid;
  }

  Future<void> _handleSubmit() async {
    if (!_validateForm()) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      final data = {
        'visit_date': DateTime.now().toIso8601String().split('T')[0],
        'activity_type': _activityType,
        'product_type': _productType,
        'state': _stateController.text,
        'district': _districtController.text,
        'location': _locationController.text,
      };

      await _apiClient.requestWithRetry('/mobile/activities',
          method: 'POST', body: data);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Activity created successfully')),
      );
      
      Navigator.pop(context);
    } catch (e) {
      final apiError = e as APIError;
      
      if (!handleAPIError(apiError)) {
        ErrorService.handleError(apiError, (message) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(message)),
          );
        });
      }
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Create Activity')),
      body: Form(
        key: _formKey,
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            children: [
              // Activity Type Dropdown
              DropdownButtonFormField<String>(
                value: _activityType,
                decoration: InputDecoration(
                  labelText: 'Activity Type',
                  border: OutlineInputBorder(),
                ),
                items: ['recce', 'visit', 'survey']
                    .map((type) => DropdownMenuItem(
                          value: type,
                          child: Text(type.toUpperCase()),
                        ))
                    .toList(),
                onChanged: (value) => setState(() => _activityType = value!),
              ),
              
              SizedBox(height: 16),
              
              // State Field
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    controller: _stateController,
                    decoration: buildInputDecoration('State', 'state'),
                  ),
                  if (buildFieldError('state') != null) buildFieldError('state')!,
                ],
              ),
              
              SizedBox(height: 16),
              
              // District Field
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    controller: _districtController,
                    decoration: buildInputDecoration('District', 'district'),
                  ),
                  if (buildFieldError('district') != null) buildFieldError('district')!,
                ],
              ),
              
              SizedBox(height: 16),
              
              // Location Field
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    controller: _locationController,
                    decoration: buildInputDecoration('Location', 'location'),
                  ),
                  if (buildFieldError('location') != null) buildFieldError('location')!,
                ],
              ),
              
              SizedBox(height: 24),
              
              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  child: _isSubmitting
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                            SizedBox(width: 8),
                            Text('Creating...'),
                          ],
                        )
                      : Text('Create Activity'),
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.all(16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

## Global Error Handler

### React Native Global Error Boundary
```typescript
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught an error:', error, errorInfo);
    // Log to crash reporting service
    // crashlytics().recordError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 20, color: '#666' }}>
            We're sorry, but something unexpected happened. Please try again.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#007bff', padding: 15, borderRadius: 5 }}
            onPress={() => this.setState({ hasError: false, error: undefined })}
          >
            <Text style={{ color: 'white' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```
