# Authentication Examples

## Login Examples

### React Native Login Component
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginResponse {
  success: boolean;
  data?: {
    promoter: Promoter;
    token: string;
    token_type: string;
  };
  message?: string;
}

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://vair.test/api/mobile/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // Store token securely
        await AsyncStorage.setItem('auth_token', data.data.token);
        await AsyncStorage.setItem('promoter_data', JSON.stringify(data.data.promoter));
        
        // Navigate to dashboard
        // navigation.navigate('Dashboard');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={{ 
          backgroundColor: loading ? '#ccc' : '#007bff',
          padding: 15,
          borderRadius: 5,
        }}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
```

### Flutter Login Widget
```dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login() async {
    if (_usernameController.text.isEmpty || _passwordController.text.isEmpty) {
      _showError('Please enter username and password');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await http.post(
        Uri.parse('https://vair.test/api/mobile/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': _usernameController.text,
          'password': _passwordController.text,
        }),
      );

      final data = jsonDecode(response.body);

      if (data['success']) {
        // Store token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', data['data']['token']);
        await prefs.setString('promoter_data', jsonEncode(data['data']['promoter']));
        
        // Navigate to dashboard
        Navigator.pushReplacementNamed(context, '/dashboard');
      } else {
        _showError(data['message'] ?? 'Login failed');
      }
    } catch (e) {
      _showError('Network error. Please try again.');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: _usernameController,
              decoration: InputDecoration(
                labelText: 'Username',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(
                labelText: 'Password',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
            ),
            SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _login,
                child: _isLoading
                    ? CircularProgressIndicator()
                    : Text('Login'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## Activity Creation Examples

### React Native Activity Form
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CreateActivityRequest {
  visit_date: string;
  activity_type: 'recce' | 'visit' | 'survey';
  product_type: 'Grey' | 'Gold' | 'Pink' | 'Brown';
  state: string;
  district: string;
  sub_district: string;
  village: string;
  village_code: string;
  location: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  remarks?: string;
  close_shot1?: string;
  close_shot_2?: string;
  far_shot?: string;
}

const ActivityForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateActivityRequest>({
    visit_date: new Date().toISOString().split('T')[0],
    activity_type: 'recce',
    product_type: 'Grey',
    state: '',
    district: '',
    sub_district: '',
    village: '',
    village_code: '',
    location: '',
  });
  
  const [images, setImages] = useState<{
    close_shot1?: string;
    close_shot_2?: string;
    far_shot?: string;
  }>({});

  const pickImage = (imageType: 'close_shot1' | 'close_shot_2' | 'far_shot') => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.assets && response.assets[0]) {
        setImages(prev => ({
          ...prev,
          [imageType]: response.assets![0].uri
        }));
      }
    });
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const submitActivity = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      // Convert images to base64
      const processedData = { ...formData };
      if (images.close_shot1) {
        processedData.close_shot1 = await convertImageToBase64(images.close_shot1);
      }
      if (images.close_shot_2) {
        processedData.close_shot_2 = await convertImageToBase64(images.close_shot_2);
      }
      if (images.far_shot) {
        processedData.far_shot = await convertImageToBase64(images.far_shot);
      }

      const response = await fetch('https://vair.test/api/mobile/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert('Success', 'Activity created successfully');
        // Reset form or navigate back
      } else {
        Alert.alert('Error', result.message || 'Failed to create activity');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Create Activity</Text>
      
      {/* Location Fields */}
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder="State"
        value={formData.state}
        onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
      />
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder="District"
        value={formData.district}
        onChangeText={(text) => setFormData(prev => ({ ...prev, district: text }))}
      />
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder="Sub District"
        value={formData.sub_district}
        onChangeText={(text) => setFormData(prev => ({ ...prev, sub_district: text }))}
      />
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder="Village"
        value={formData.village}
        onChangeText={(text) => setFormData(prev => ({ ...prev, village: text }))}
      />
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder="Village Code"
        value={formData.village_code}
        onChangeText={(text) => setFormData(prev => ({ ...prev, village_code: text }))}
      />
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder="Location"
        value={formData.location}
        onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
      />
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
        placeholder="Remarks"
        value={formData.remarks || ''}
        onChangeText={(text) => setFormData(prev => ({ ...prev, remarks: text }))}
        multiline
        numberOfLines={3}
      />
      
      {/* Image Capture Buttons */}
      <TouchableOpacity
        style={{ backgroundColor: '#007bff', padding: 10, marginBottom: 10, borderRadius: 5 }}
        onPress={() => pickImage('close_shot1')}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {images.close_shot1 ? 'Close Shot 1 ✓' : 'Take Close Shot 1'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{ backgroundColor: '#007bff', padding: 10, marginBottom: 10, borderRadius: 5 }}
        onPress={() => pickImage('close_shot_2')}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {images.close_shot_2 ? 'Close Shot 2 ✓' : 'Take Close Shot 2'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{ backgroundColor: '#007bff', padding: 10, marginBottom: 20, borderRadius: 5 }}
        onPress={() => pickImage('far_shot')}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {images.far_shot ? 'Far Shot ✓' : 'Take Far Shot'}
        </Text>
      </TouchableOpacity>
      
      {/* Submit Button */}
      <TouchableOpacity
        style={{ backgroundColor: '#28a745', padding: 15, borderRadius: 5 }}
        onPress={submitActivity}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          Submit Activity
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActivityForm;
```

### Flutter Activity Creation
```dart
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'package:shared_preferences/shared_preferences.dart';

class ActivityForm extends StatefulWidget {
  @override
  _ActivityFormState createState() => _ActivityFormState();
}

class _ActivityFormState extends State<ActivityForm> {
  final _formKey = GlobalKey<FormState>();
  final _picker = ImagePicker();
  
  // Form controllers
  final _stateController = TextEditingController();
  final _districtController = TextEditingController();
  final _subDistrictController = TextEditingController();
  final _villageController = TextEditingController();
  final _villageCodeController = TextEditingController();
  final _locationController = TextEditingController();
  final _remarksController = TextEditingController();
  
  // Selected values
  String _activityType = 'recce';
  String _productType = 'Grey';
  
  // Images
  File? _closeShotImage1;
  File? _closeShotImage2;
  File? _farShotImage;

  Future<void> _pickImage(String imageType) async {
    final pickedFile = await _picker.pickImage(source: ImageSource.camera);
    
    if (pickedFile != null) {
      setState(() {
        switch (imageType) {
          case 'close_shot1':
            _closeShotImage1 = File(pickedFile.path);
            break;
          case 'close_shot_2':
            _closeShotImage2 = File(pickedFile.path);
            break;
          case 'far_shot':
            _farShotImage = File(pickedFile.path);
            break;
        }
      });
    }
  }

  Future<String> _convertImageToBase64(File imageFile) async {
    final bytes = await imageFile.readAsBytes();
    return base64Encode(bytes);
  }

  Future<void> _submitActivity() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');

      Map<String, dynamic> activityData = {
        'visit_date': DateTime.now().toIso8601String().split('T')[0],
        'activity_type': _activityType,
        'product_type': _productType,
        'state': _stateController.text,
        'district': _districtController.text,
        'sub_district': _subDistrictController.text,
        'village': _villageController.text,
        'village_code': _villageCodeController.text,
        'location': _locationController.text,
        'remarks': _remarksController.text,
      };

      // Convert images to base64
      if (_closeShotImage1 != null) {
        activityData['close_shot1'] = await _convertImageToBase64(_closeShotImage1!);
      }
      if (_closeShotImage2 != null) {
        activityData['close_shot_2'] = await _convertImageToBase64(_closeShotImage2!);
      }
      if (_farShotImage != null) {
        activityData['far_shot'] = await _convertImageToBase64(_farShotImage!);
      }

      final response = await http.post(
        Uri.parse('https://vair.test/api/mobile/activities'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(activityData),
      );

      final result = jsonDecode(response.body);

      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Activity created successfully')),
        );
        Navigator.pop(context);
      } else {
        throw Exception(result['message'] ?? 'Failed to create activity');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
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
          child: SingleChildScrollView(
            child: Column(
              children: [
                // Activity Type Dropdown
                DropdownButtonFormField<String>(
                  value: _activityType,
                  decoration: InputDecoration(labelText: 'Activity Type'),
                  items: ['recce', 'visit', 'survey']
                      .map((type) => DropdownMenuItem(
                            value: type,
                            child: Text(type.toUpperCase()),
                          ))
                      .toList(),
                  onChanged: (value) => setState(() => _activityType = value!),
                ),
                
                SizedBox(height: 16),
                
                // Product Type Dropdown
                DropdownButtonFormField<String>(
                  value: _productType,
                  decoration: InputDecoration(labelText: 'Product Type'),
                  items: ['Grey', 'Gold', 'Pink', 'Brown']
                      .map((type) => DropdownMenuItem(
                            value: type,
                            child: Text(type),
                          ))
                      .toList(),
                  onChanged: (value) => setState(() => _productType = value!),
                ),
                
                SizedBox(height: 16),
                
                // Location Fields
                TextFormField(
                  controller: _stateController,
                  decoration: InputDecoration(labelText: 'State'),
                  validator: (value) => value?.isEmpty == true ? 'Required' : null,
                ),
                
                SizedBox(height: 16),
                
                TextFormField(
                  controller: _districtController,
                  decoration: InputDecoration(labelText: 'District'),
                  validator: (value) => value?.isEmpty == true ? 'Required' : null,
                ),
                
                SizedBox(height: 16),
                
                TextFormField(
                  controller: _subDistrictController,
                  decoration: InputDecoration(labelText: 'Sub District'),
                  validator: (value) => value?.isEmpty == true ? 'Required' : null,
                ),
                
                SizedBox(height: 16),
                
                TextFormField(
                  controller: _villageController,
                  decoration: InputDecoration(labelText: 'Village'),
                  validator: (value) => value?.isEmpty == true ? 'Required' : null,
                ),
                
                SizedBox(height: 16),
                
                TextFormField(
                  controller: _villageCodeController,
                  decoration: InputDecoration(labelText: 'Village Code'),
                  validator: (value) => value?.isEmpty == true ? 'Required' : null,
                ),
                
                SizedBox(height: 16),
                
                TextFormField(
                  controller: _locationController,
                  decoration: InputDecoration(labelText: 'Location'),
                  validator: (value) => value?.isEmpty == true ? 'Required' : null,
                ),
                
                SizedBox(height: 16),
                
                TextFormField(
                  controller: _remarksController,
                  decoration: InputDecoration(labelText: 'Remarks'),
                  maxLines: 3,
                ),
                
                SizedBox(height: 24),
                
                // Image Capture Buttons
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _pickImage('close_shot1'),
                        icon: Icon(_closeShotImage1 != null ? Icons.check : Icons.camera_alt),
                        label: Text('Close Shot 1'),
                      ),
                    ),
                    SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _pickImage('close_shot_2'),
                        icon: Icon(_closeShotImage2 != null ? Icons.check : Icons.camera_alt),
                        label: Text('Close Shot 2'),
                      ),
                    ),
                  ],
                ),
                
                SizedBox(height: 8),
                
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _pickImage('far_shot'),
                    icon: Icon(_farShotImage != null ? Icons.check : Icons.camera_alt),
                    label: Text('Far Shot'),
                  ),
                ),
                
                SizedBox(height: 24),
                
                // Submit Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _submitActivity,
                    child: Text('Submit Activity'),
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.all(16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

## API Service Implementation

### Complete API Service for React Native
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class APIService {
  private baseURL = 'https://vair.test/api';
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken(): Promise<void> {
    this.token = await AsyncStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
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

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear storage
        await AsyncStorage.multiRemove(['auth_token', 'promoter_data']);
        this.token = null;
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // Authentication
  async login(username: string, password: string): Promise<APIResponse> {
    const response = await this.request('/mobile/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      await AsyncStorage.setItem('auth_token', this.token);
      await AsyncStorage.setItem('promoter_data', JSON.stringify(response.data.promoter));
    }

    return response;
  }

  async logout(): Promise<APIResponse> {
    const response = await this.request('/mobile/auth/logout', {
      method: 'POST',
    });

    // Clear local storage regardless of API response
    await AsyncStorage.multiRemove(['auth_token', 'promoter_data']);
    this.token = null;

    return response;
  }

  async getProfile(): Promise<APIResponse> {
    return this.request('/mobile/auth/profile');
  }

  // Activities
  async getActivities(page: number = 1): Promise<APIResponse> {
    return this.request(`/mobile/activities?page=${page}`);
  }

  async createActivity(data: CreateActivityRequest): Promise<APIResponse> {
    return this.request('/mobile/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getActivity(id: number): Promise<APIResponse> {
    return this.request(`/mobile/activities/${id}`);
  }

  async updateActivity(id: number, data: Partial<CreateActivityRequest>): Promise<APIResponse> {
    return this.request(`/mobile/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteActivity(id: number): Promise<APIResponse> {
    return this.request(`/mobile/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // Route Plans
  async getRoutePlans(page: number = 1): Promise<APIResponse> {
    return this.request(`/mobile/route-plans?page=${page}`);
  }

  async getRoutePlan(id: number): Promise<APIResponse> {
    return this.request(`/mobile/route-plans/${id}`);
  }
}

export default new APIService();
```

### Flutter API Service
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class APIService {
  static const String baseURL = 'https://vair.test/api';
  String? _token;

  APIService() {
    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  Future<Map<String, dynamic>> _request(
    String endpoint, {
    String method = 'GET',
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    final uri = Uri.parse('$baseURL$endpoint');
    
    final requestHeaders = <String, String>{
      'Content-Type': 'application/json',
      ...?headers,
    };

    if (_token != null && !endpoint.contains('/auth/login')) {
      requestHeaders['Authorization'] = 'Bearer $_token';
    }

    http.Response response;

    switch (method) {
      case 'POST':
        response = await http.post(
          uri,
          headers: requestHeaders,
          body: body != null ? jsonEncode(body) : null,
        );
        break;
      case 'PUT':
        response = await http.put(
          uri,
          headers: requestHeaders,
          body: body != null ? jsonEncode(body) : null,
        );
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: requestHeaders);
        break;
      default:
        response = await http.get(uri, headers: requestHeaders);
    }

    final data = jsonDecode(response.body);

    if (response.statusCode == 401) {
      // Token expired
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('promoter_data');
      _token = null;
    }

    if (response.statusCode >= 400) {
      throw Exception(data['message'] ?? 'Request failed');
    }

    return data;
  }

  // Authentication
  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await _request('/mobile/auth/login', 
      method: 'POST',
      body: {'username': username, 'password': password},
    );

    if (response['success'] && response['data'] != null) {
      _token = response['data']['token'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', _token!);
      await prefs.setString('promoter_data', jsonEncode(response['data']['promoter']));
    }

    return response;
  }

  Future<Map<String, dynamic>> logout() async {
    final response = await _request('/mobile/auth/logout', method: 'POST');
    
    // Clear local storage
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('promoter_data');
    _token = null;

    return response;
  }

  Future<Map<String, dynamic>> getProfile() async {
    return _request('/mobile/auth/profile');
  }

  // Activities
  Future<Map<String, dynamic>> getActivities({int page = 1}) async {
    return _request('/mobile/activities?page=$page');
  }

  Future<Map<String, dynamic>> createActivity(Map<String, dynamic> data) async {
    return _request('/mobile/activities', method: 'POST', body: data);
  }

  Future<Map<String, dynamic>> getActivity(int id) async {
    return _request('/mobile/activities/$id');
  }

  Future<Map<String, dynamic>> updateActivity(int id, Map<String, dynamic> data) async {
    return _request('/mobile/activities/$id', method: 'PUT', body: data);
  }

  Future<Map<String, dynamic>> deleteActivity(int id) async {
    return _request('/mobile/activities/$id', method: 'DELETE');
  }

  // Route Plans
  Future<Map<String, dynamic>> getRoutePlans({int page = 1}) async {
    return _request('/mobile/route-plans?page=$page');
  }

  Future<Map<String, dynamic>> getRoutePlan(int id) async {
    return _request('/mobile/route-plans/$id');
  }
}
```
