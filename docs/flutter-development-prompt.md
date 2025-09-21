# Flutter Mobile App Development Prompt

## Project Overview
You need to develop a Flutter mobile application for the **LI Council** system - a field activity management platform for promoters. The app enables promoters to manage activities, capture location data, upload images, and sync data with the backend API.

## API Documentation References
Use these documentation links with AI MCP tools for automated code generation:
- **Complete API Documentation**: `docs/API_DOCUMENTATION.md`
- **OpenAPI Specification**: `docs/openapi.yaml`
- **Mobile Integration Guide**: `docs/mobile-integration-guide.md`
- **Code Examples**: `docs/api-examples/`
- **Postman Collection**: `docs/postman-collection/`

## App Requirements

### 🎯 Core Features
1. **Authentication System** - Promoter login/logout with secure token storage
2. **Activity Management** - Create, view, edit activities with image capture
3. **Route Plan Access** - View assigned route plans and locations
4. **Offline Support** - Work offline with automatic sync when online
5. **Location Services** - GPS tracking and location-based features
6. **Image Management** - Camera integration for activity documentation

### 📱 App Architecture
```
lib/
├── main.dart
├── models/
│   ├── promoter.dart
│   ├── activity.dart
│   ├── route_plan.dart
│   └── api_response.dart
├── services/
│   ├── api_service.dart
│   ├── auth_service.dart
│   ├── sync_service.dart
│   └── storage_service.dart
├── screens/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── profile_screen.dart
│   ├── activities/
│   │   ├── activity_list_screen.dart
│   │   ├── activity_form_screen.dart
│   │   └── activity_detail_screen.dart
│   ├── route_plans/
│   │   ├── route_plans_screen.dart
│   │   └── route_plan_detail_screen.dart
│   └── dashboard/
│       └── dashboard_screen.dart
├── widgets/
│   ├── common/
│   ├── forms/
│   └── cards/
├── utils/
│   ├── constants.dart
│   ├── validators.dart
│   └── helpers.dart
└── providers/
    ├── auth_provider.dart
    ├── activity_provider.dart
    └── sync_provider.dart
```

## 🔧 Technical Implementation

### Required Dependencies
Add these to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.2
  
  # HTTP & API
  http: ^1.2.1
  dio: ^5.4.2+1
  
  # Local Storage
  shared_preferences: ^2.2.2
  sqflite: ^2.3.2
  
  # Image & Camera
  image_picker: ^1.0.7
  camera: ^0.10.5+9
  
  # Location Services
  geolocator: ^10.1.0
  permission_handler: ^11.3.0
  
  # Network & Connectivity
  connectivity_plus: ^5.0.2
  
  # UI Components
  cached_network_image: ^3.3.1
  flutter_spinkit: ^5.2.0
  
  # Date & Time
  intl: ^0.19.0
  
  # Background Tasks
  workmanager: ^0.5.2
  
  # File Handling
  path_provider: ^2.1.2
  
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
```

### 1. Data Models

#### Promoter Model
```dart
class Promoter {
  final int id;
  final String name;
  final String username;
  final String email;
  final String phone;
  final String state;
  final String district;
  final String subDistrict;
  final String village;
  final bool isActive;
  final bool isLoggedIn;
  final String? profileImage;
  final DateTime? lastLoginAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  Promoter({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    required this.phone,
    required this.state,
    required this.district,
    required this.subDistrict,
    required this.village,
    required this.isActive,
    required this.isLoggedIn,
    this.profileImage,
    this.lastLoginAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Promoter.fromJson(Map<String, dynamic> json) {
    return Promoter(
      id: json['id'],
      name: json['name'],
      username: json['username'],
      email: json['email'],
      phone: json['phone'],
      state: json['state'],
      district: json['district'],
      subDistrict: json['sub_district'],
      village: json['village'],
      isActive: json['is_active'],
      isLoggedIn: json['is_logged_in'],
      profileImage: json['profile_image'],
      lastLoginAt: json['last_login_at'] != null 
          ? DateTime.parse(json['last_login_at']) 
          : null,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'username': username,
      'email': email,
      'phone': phone,
      'state': state,
      'district': district,
      'sub_district': subDistrict,
      'village': village,
      'is_active': isActive,
      'is_logged_in': isLoggedIn,
      'profile_image': profileImage,
      'last_login_at': lastLoginAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
```

#### Activity Model
```dart
enum ActivityType { recce, visit, survey }
enum ProductType { grey, gold, pink, brown }
enum ActivityStatus { pending, completed, cancelled }

class Activity {
  final int? id;
  final String visitDate;
  final int promoterId;
  final int? planId;
  final String? deviceId;
  final ActivityType activityType;
  final ProductType productType;
  final String state;
  final String district;
  final String subDistrict;
  final String village;
  final String villageCode;
  final String location;
  final String? landmark;
  final double? latitude;
  final double? longitude;
  final String? remarks;
  final String? closeShot1;
  final String? closeShot2;
  final String? farShot;
  final ActivityStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Promoter? promoter;
  final RoutePlan? routePlan;

  Activity({
    this.id,
    required this.visitDate,
    required this.promoterId,
    this.planId,
    this.deviceId,
    required this.activityType,
    required this.productType,
    required this.state,
    required this.district,
    required this.subDistrict,
    required this.village,
    required this.villageCode,
    required this.location,
    this.landmark,
    this.latitude,
    this.longitude,
    this.remarks,
    this.closeShot1,
    this.closeShot2,
    this.farShot,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.promoter,
    this.routePlan,
  });

  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      id: json['id'],
      visitDate: json['visit_date'],
      promoterId: json['promoter_id'],
      planId: json['plan_id'],
      deviceId: json['device_id'],
      activityType: ActivityType.values.firstWhere(
        (e) => e.name == json['activity_type'],
      ),
      productType: ProductType.values.firstWhere(
        (e) => e.name.toLowerCase() == json['product_type'].toLowerCase(),
      ),
      state: json['state'],
      district: json['district'],
      subDistrict: json['sub_district'],
      village: json['village'],
      villageCode: json['village_code'],
      location: json['location'],
      landmark: json['landmark'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      remarks: json['remarks'],
      closeShot1: json['close_shot1'],
      closeShot2: json['close_shot_2'],
      farShot: json['far_shot'],
      status: ActivityStatus.values.firstWhere(
        (e) => e.name == json['status'],
      ),
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      promoter: json['promoter'] != null 
          ? Promoter.fromJson(json['promoter']) 
          : null,
      routePlan: json['route_plan'] != null 
          ? RoutePlan.fromJson(json['route_plan']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'visit_date': visitDate,
      'promoter_id': promoterId,
      if (planId != null) 'plan_id': planId,
      if (deviceId != null) 'device_id': deviceId,
      'activity_type': activityType.name,
      'product_type': productType.name.substring(0, 1).toUpperCase() + 
                     productType.name.substring(1),
      'state': state,
      'district': district,
      'sub_district': subDistrict,
      'village': village,
      'village_code': villageCode,
      'location': location,
      if (landmark != null) 'landmark': landmark,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (remarks != null) 'remarks': remarks,
      if (closeShot1 != null) 'close_shot1': closeShot1,
      if (closeShot2 != null) 'close_shot_2': closeShot2,
      if (farShot != null) 'far_shot': farShot,
      'status': status.name,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
```

#### Route Plan Model
```dart
enum RoutePlanStatus { active, inactive, completed }

class RoutePlan {
  final int id;
  final String planName;
  final String state;
  final String district;
  final String subDistrict;
  final String village;
  final String villageCode;
  final String location;
  final String? landmark;
  final double? latitude;
  final double? longitude;
  final RoutePlanStatus status;
  final int? promoterId;
  final DateTime createdAt;
  final DateTime updatedAt;

  RoutePlan({
    required this.id,
    required this.planName,
    required this.state,
    required this.district,
    required this.subDistrict,
    required this.village,
    required this.villageCode,
    required this.location,
    this.landmark,
    this.latitude,
    this.longitude,
    required this.status,
    this.promoterId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory RoutePlan.fromJson(Map<String, dynamic> json) {
    return RoutePlan(
      id: json['id'],
      planName: json['plan_name'],
      state: json['state'],
      district: json['district'],
      subDistrict: json['sub_district'],
      village: json['village'],
      villageCode: json['village_code'],
      location: json['location'],
      landmark: json['landmark'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      status: RoutePlanStatus.values.firstWhere(
        (e) => e.name == json['status'],
      ),
      promoterId: json['promoter_id'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'plan_name': planName,
      'state': state,
      'district': district,
      'sub_district': subDistrict,
      'village': village,
      'village_code': villageCode,
      'location': location,
      if (landmark != null) 'landmark': landmark,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      'status': status.name,
      if (promoterId != null) 'promoter_id': promoterId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
```

### 2. API Service Implementation

#### Base API Service
```dart
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://vair.test/api';
  static const String mobileBaseUrl = '$baseUrl/mobile';
  
  late Dio _dio;
  String? _token;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: mobileBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _setupInterceptors();
    _loadToken();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        if (_token != null && !options.path.contains('/auth/login')) {
          options.headers['Authorization'] = 'Bearer $_token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          await _handleTokenExpiration();
        }
        handler.next(error);
      },
    ));
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  Future<void> _handleTokenExpiration() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('promoter_data');
    _token = null;
    // Navigate to login screen
  }

  // Authentication Methods
  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'username': username,
      'password': password,
    });

    if (response.data['success'] && response.data['data']['token'] != null) {
      _token = response.data['data']['token'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', _token!);
      await prefs.setString('promoter_data', 
          jsonEncode(response.data['data']['promoter']));
    }

    return response.data;
  }

  Future<Map<String, dynamic>> logout() async {
    final response = await _dio.post('/auth/logout');
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('promoter_data');
    _token = null;

    return response.data;
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dio.get('/auth/profile');
    return response.data;
  }

  // Activity Methods
  Future<Map<String, dynamic>> getActivities({int page = 1}) async {
    final response = await _dio.get('/activities', queryParameters: {
      'page': page,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> createActivity(Activity activity) async {
    final response = await _dio.post('/activities', data: activity.toJson());
    return response.data;
  }

  Future<Map<String, dynamic>> getActivity(int id) async {
    final response = await _dio.get('/activities/$id');
    return response.data;
  }

  Future<Map<String, dynamic>> updateActivity(int id, Activity activity) async {
    final response = await _dio.put('/activities/$id', data: activity.toJson());
    return response.data;
  }

  Future<Map<String, dynamic>> deleteActivity(int id) async {
    final response = await _dio.delete('/activities/$id');
    return response.data;
  }

  // Route Plan Methods
  Future<Map<String, dynamic>> getRoutePlans({int page = 1}) async {
    final response = await _dio.get('/route-plans', queryParameters: {
      'page': page,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> getRoutePlan(int id) async {
    final response = await _dio.get('/route-plans/$id');
    return response.data;
  }
}
```

### 3. Screen Implementations

#### Login Screen
```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Logo and Title
                Icon(
                  Icons.business_center,
                  size: 80,
                  color: Theme.of(context).primaryColor,
                ),
                const SizedBox(height: 24),
                Text(
                  'LI Council',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Field Activity Management',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),

                // Username Field
                TextFormField(
                  controller: _usernameController,
                  decoration: InputDecoration(
                    labelText: 'Username',
                    prefixIcon: Icon(Icons.person),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your username';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Password Field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: Icon(Icons.lock),
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePassword 
                          ? Icons.visibility 
                          : Icons.visibility_off),
                      onPressed: () => setState(() {
                        _obscurePassword = !_obscurePassword;
                      }),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                // Login Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text(
                          'Login',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await context.read<AuthProvider>().login(
        _usernameController.text,
        _passwordController.text,
      );
      
      Navigator.pushReplacementNamed(context, '/dashboard');
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login failed: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
```

#### Activity Form Screen
```dart
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:io';

class ActivityFormScreen extends StatefulWidget {
  final Activity? activity; // For editing existing activity

  const ActivityFormScreen({Key? key, this.activity}) : super(key: key);

  @override
  _ActivityFormScreenState createState() => _ActivityFormScreenState();
}

class _ActivityFormScreenState extends State<ActivityFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _picker = ImagePicker();
  
  // Form controllers
  final _stateController = TextEditingController();
  final _districtController = TextEditingController();
  final _subDistrictController = TextEditingController();
  final _villageController = TextEditingController();
  final _villageCodeController = TextEditingController();
  final _locationController = TextEditingController();
  final _landmarkController = TextEditingController();
  final _remarksController = TextEditingController();
  
  // Form data
  ActivityType _activityType = ActivityType.recce;
  ProductType _productType = ProductType.grey;
  DateTime _visitDate = DateTime.now();
  Position? _currentPosition;
  
  // Images
  File? _closeShotImage1;
  File? _closeShotImage2;
  File? _farShotImage;
  
  bool _isLoading = false;
  bool _isGettingLocation = false;

  @override
  void initState() {
    super.initState();
    if (widget.activity != null) {
      _populateForm(widget.activity!);
    }
    _getCurrentLocation();
  }

  void _populateForm(Activity activity) {
    _stateController.text = activity.state;
    _districtController.text = activity.district;
    _subDistrictController.text = activity.subDistrict;
    _villageController.text = activity.village;
    _villageCodeController.text = activity.villageCode;
    _locationController.text = activity.location;
    _landmarkController.text = activity.landmark ?? '';
    _remarksController.text = activity.remarks ?? '';
    _activityType = activity.activityType;
    _productType = activity.productType;
    _visitDate = DateTime.parse(activity.visitDate);
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isGettingLocation = true);
    
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Location services are disabled');
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }

      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to get location: ${e.toString()}')),
      );
    } finally {
      setState(() => _isGettingLocation = false);
    }
  }

  Future<void> _pickImage(String imageType) async {
    final pickedFile = await _picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 1920,
      maxHeight: 1080,
      imageQuality: 80,
    );
    
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.activity == null ? 'Create Activity' : 'Edit Activity'),
        actions: [
          IconButton(
            icon: Icon(Icons.location_on),
            onPressed: _isGettingLocation ? null : _getCurrentLocation,
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Activity Type & Product Type
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<ActivityType>(
                      value: _activityType,
                      decoration: InputDecoration(
                        labelText: 'Activity Type',
                        border: OutlineInputBorder(),
                      ),
                      items: ActivityType.values.map((type) {
                        return DropdownMenuItem(
                          value: type,
                          child: Text(type.name.toUpperCase()),
                        );
                      }).toList(),
                      onChanged: (value) => setState(() => _activityType = value!),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: DropdownButtonFormField<ProductType>(
                      value: _productType,
                      decoration: InputDecoration(
                        labelText: 'Product Type',
                        border: OutlineInputBorder(),
                      ),
                      items: ProductType.values.map((type) {
                        return DropdownMenuItem(
                          value: type,
                          child: Text(type.name.substring(0, 1).toUpperCase() + 
                                     type.name.substring(1)),
                        );
                      }).toList(),
                      onChanged: (value) => setState(() => _productType = value!),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Visit Date
              InkWell(
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: _visitDate,
                    firstDate: DateTime.now().subtract(Duration(days: 30)),
                    lastDate: DateTime.now().add(Duration(days: 30)),
                  );
                  if (date != null) {
                    setState(() => _visitDate = date);
                  }
                },
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'Visit Date',
                    border: OutlineInputBorder(),
                    suffixIcon: Icon(Icons.calendar_today),
                  ),
                  child: Text(
                    '${_visitDate.day}/${_visitDate.month}/${_visitDate.year}',
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Location Fields
              TextFormField(
                controller: _stateController,
                decoration: InputDecoration(
                  labelText: 'State',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value?.isEmpty == true ? 'Required' : null,
              ),
              
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _districtController,
                decoration: InputDecoration(
                  labelText: 'District',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value?.isEmpty == true ? 'Required' : null,
              ),
              
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _subDistrictController,
                decoration: InputDecoration(
                  labelText: 'Sub District',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value?.isEmpty == true ? 'Required' : null,
              ),
              
              const SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _villageController,
                      decoration: InputDecoration(
                        labelText: 'Village',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value?.isEmpty == true ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _villageCodeController,
                      decoration: InputDecoration(
                        labelText: 'Village Code',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value?.isEmpty == true ? 'Required' : null,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _locationController,
                decoration: InputDecoration(
                  labelText: 'Location',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value?.isEmpty == true ? 'Required' : null,
              ),
              
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _landmarkController,
                decoration: InputDecoration(
                  labelText: 'Landmark (Optional)',
                  border: OutlineInputBorder(),
                ),
              ),
              
              const SizedBox(height: 16),
              
              // GPS Coordinates Display
              if (_currentPosition != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    border: Border.all(color: Colors.green.shade200),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.location_on, color: Colors.green),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'GPS: ${_currentPosition!.latitude.toStringAsFixed(6)}, '
                          '${_currentPosition!.longitude.toStringAsFixed(6)}',
                          style: TextStyle(
                            color: Colors.green.shade700,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _remarksController,
                decoration: InputDecoration(
                  labelText: 'Remarks (Optional)',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              
              const SizedBox(height: 24),
              
              // Image Capture Section
              Text(
                'Photos',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              
              // Image Buttons
              Row(
                children: [
                  Expanded(
                    child: _buildImageButton(
                      'Close Shot 1',
                      'close_shot1',
                      _closeShotImage1,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildImageButton(
                      'Close Shot 2',
                      'close_shot_2',
                      _closeShotImage2,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 8),
              
              _buildImageButton(
                'Far Shot',
                'far_shot',
                _farShotImage,
              ),
              
              const SizedBox(height: 32),
              
              // Submit Button
              ElevatedButton(
                onPressed: _isLoading ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(
                        widget.activity == null ? 'Create Activity' : 'Update Activity',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImageButton(String label, String imageType, File? imageFile) {
    return OutlinedButton.icon(
      onPressed: () => _pickImage(imageType),
      icon: Icon(imageFile != null ? Icons.check_circle : Icons.camera_alt),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        foregroundColor: imageFile != null ? Colors.green : null,
        side: BorderSide(
          color: imageFile != null ? Colors.green : Colors.grey,
        ),
        padding: const EdgeInsets.symmetric(vertical: 12),
      ),
    );
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      // Convert images to base64 if needed
      String? closeShot1Base64;
      String? closeShot2Base64;
      String? farShotBase64;

      if (_closeShotImage1 != null) {
        final bytes = await _closeShotImage1!.readAsBytes();
        closeShot1Base64 = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      }
      
      if (_closeShotImage2 != null) {
        final bytes = await _closeShotImage2!.readAsBytes();
        closeShot2Base64 = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      }
      
      if (_farShotImage != null) {
        final bytes = await _farShotImage!.readAsBytes();
        farShotBase64 = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      }

      final activity = Activity(
        id: widget.activity?.id,
        visitDate: '${_visitDate.year}-${_visitDate.month.toString().padLeft(2, '0')}-${_visitDate.day.toString().padLeft(2, '0')}',
        promoterId: 1, // Get from current user
        activityType: _activityType,
        productType: _productType,
        state: _stateController.text,
        district: _districtController.text,
        subDistrict: _subDistrictController.text,
        village: _villageController.text,
        villageCode: _villageCodeController.text,
        location: _locationController.text,
        landmark: _landmarkController.text.isNotEmpty ? _landmarkController.text : null,
        latitude: _currentPosition?.latitude,
        longitude: _currentPosition?.longitude,
        remarks: _remarksController.text.isNotEmpty ? _remarksController.text : null,
        closeShot1: closeShot1Base64,
        closeShot2: closeShot2Base64,
        farShot: farShotBase64,
        status: ActivityStatus.pending,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      if (widget.activity == null) {
        await context.read<ActivityProvider>().createActivity(activity);
      } else {
        await context.read<ActivityProvider>().updateActivity(activity);
      }

      Navigator.pop(context, true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save activity: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _stateController.dispose();
    _districtController.dispose();
    _subDistrictController.dispose();
    _villageController.dispose();
    _villageCodeController.dispose();
    _locationController.dispose();
    _landmarkController.dispose();
    _remarksController.dispose();
    super.dispose();
  }
}
```

### 4. State Management (Provider)

#### Auth Provider
```dart
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  Promoter? _currentPromoter;
  bool _isAuthenticated = false;
  bool _isLoading = false;

  Promoter? get currentPromoter => _currentPromoter;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  Future<void> checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      final promoterData = prefs.getString('promoter_data');

      if (token != null && promoterData != null) {
        _currentPromoter = Promoter.fromJson(jsonDecode(promoterData));
        _isAuthenticated = true;
      }
    } catch (e) {
      print('Error checking auth status: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.login(username, password);
      
      if (response['success']) {
        _currentPromoter = Promoter.fromJson(response['data']['promoter']);
        _isAuthenticated = true;
      } else {
        throw Exception(response['message'] ?? 'Login failed');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.logout();
    } catch (e) {
      print('Logout error: $e');
    } finally {
      _currentPromoter = null;
      _isAuthenticated = false;
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateProfile() async {
    try {
      final response = await _apiService.getProfile();
      if (response['success']) {
        _currentPromoter = Promoter.fromJson(response['data']);
        notifyListeners();
      }
    } catch (e) {
      print('Error updating profile: $e');
    }
  }
}
```

#### Activity Provider
```dart
import 'package:flutter/foundation.dart';

class ActivityProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Activity> _activities = [];
  bool _isLoading = false;
  bool _hasMore = true;
  int _currentPage = 1;

  List<Activity> get activities => _activities;
  bool get isLoading => _isLoading;
  bool get hasMore => _hasMore;

  Future<void> loadActivities({bool refresh = false}) async {
    if (_isLoading) return;
    
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _activities.clear();
    }

    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.getActivities(page: _currentPage);
      
      if (response['success']) {
        final newActivities = (response['data'] as List)
            .map((json) => Activity.fromJson(json))
            .toList();
        
        if (refresh) {
          _activities = newActivities;
        } else {
          _activities.addAll(newActivities);
        }
        
        _hasMore = response['current_page'] < response['last_page'];
        _currentPage++;
      }
    } catch (e) {
      print('Error loading activities: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createActivity(Activity activity) async {
    try {
      final response = await _apiService.createActivity(activity);
      
      if (response['success']) {
        final newActivity = Activity.fromJson(response['data']);
        _activities.insert(0, newActivity);
        notifyListeners();
      }
    } catch (e) {
      throw Exception('Failed to create activity: $e');
    }
  }

  Future<void> updateActivity(Activity activity) async {
    try {
      final response = await _apiService.updateActivity(activity.id!, activity);
      
      if (response['success']) {
        final updatedActivity = Activity.fromJson(response['data']);
        final index = _activities.indexWhere((a) => a.id == activity.id);
        if (index != -1) {
          _activities[index] = updatedActivity;
          notifyListeners();
        }
      }
    } catch (e) {
      throw Exception('Failed to update activity: $e');
    }
  }

  Future<void> deleteActivity(int id) async {
    try {
      final response = await _apiService.deleteActivity(id);
      
      if (response['success']) {
        _activities.removeWhere((activity) => activity.id == id);
        notifyListeners();
      }
    } catch (e) {
      throw Exception('Failed to delete activity: $e');
    }
  }
}
```

## 🚀 Implementation Steps

### Phase 1: Setup (Week 1)
1. Create new Flutter project with required dependencies
2. Set up project structure and folder organization
3. Configure development environment and testing devices
4. Implement basic navigation and routing

### Phase 2: Core Features (Week 2-3)
1. Implement data models with proper serialization
2. Create API service with authentication and error handling
3. Build authentication screens (login, profile)
4. Set up state management with Provider

### Phase 3: Activity Management (Week 4-5)
1. Create activity list and detail screens
2. Implement activity form with image capture
3. Add location services and GPS tracking
4. Build offline storage and sync capabilities
5. **Implement Recce-specific screens and functionality**
6. **Add Bulk Add Recce feature for multiple location captures**

### Phase 4: Advanced Features (Week 6-7)
1. Implement route plan management
2. Add background sync and notifications
3. Create dashboard and analytics screens
4. Implement search and filtering
5. **Enhance Recce management with batch operations**

## 🎯 Recce-Specific Implementation

### Recce List Screen (`lib/screens/recce/recce_list_screen.dart`)
```dart
import 'package:flutter/material.dart';
import '../../models/activity_models.dart';
import '../../services/activity_service.dart';

class RecceListScreen extends StatefulWidget {
  @override
  _RecceListScreenState createState() => _RecceListScreenState();
}

class _RecceListScreenState extends State<RecceListScreen> {
  final ActivityService _activityService = ActivityService();
  List<Activity> _recces = [];
  bool _isLoading = true;
  String _selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadRecces();
  }

  Future<void> _loadRecces() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _activityService.getRecces(
        status: _selectedFilter == 'all' ? null : _selectedFilter,
      );
      
      if (response.success) {
        setState(() {
          _recces = response.data ?? [];
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading recces: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Recce Activities'),
        backgroundColor: Colors.blue[700],
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              setState(() {
                _selectedFilter = value;
              });
              _loadRecces();
            },
            itemBuilder: (context) => [
              PopupMenuItem(value: 'all', child: Text('All Recces')),
              PopupMenuItem(value: 'pending', child: Text('Pending')),
              PopupMenuItem(value: 'completed', child: Text('Completed')),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadRecces,
              child: _recces.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      itemCount: _recces.length,
                      itemBuilder: (context, index) {
                        final recce = _recces[index];
                        return _buildRecceCard(recce);
                      },
                    ),
            ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton.extended(
            onPressed: () => Navigator.pushNamed(context, '/bulk-recce'),
            heroTag: "bulk",
            label: Text('Bulk Add'),
            icon: Icon(Icons.add_circle_outline),
            backgroundColor: Colors.orange[600],
          ),
          SizedBox(height: 12),
          FloatingActionButton(
            onPressed: () => Navigator.pushNamed(context, '/add-recce'),
            heroTag: "single",
            child: Icon(Icons.add),
            backgroundColor: Colors.blue[700],
          ),
        ],
      ),
    );
  }

  Widget _buildRecceCard(Activity recce) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getStatusColor(recce.status),
          child: Icon(
            Icons.location_on,
            color: Colors.white,
          ),
        ),
        title: Text(
          recce.location ?? 'No location',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${recce.village} • ${recce.productType}'),
            Text(
              'Date: ${recce.visitDate}',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
          ],
        ),
        trailing: Chip(
          label: Text(
            recce.status?.toUpperCase() ?? 'UNKNOWN',
            style: TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
          backgroundColor: _getStatusColor(recce.status),
        ),
        onTap: () => _showRecceDetails(recce),
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'completed':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.location_off,
            size: 80,
            color: Colors.grey[400],
          ),
          SizedBox(height: 16),
          Text(
            'No Recces Found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Start by adding your first recce activity',
            style: TextStyle(color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }

  void _showRecceDetails(Activity recce) {
    Navigator.pushNamed(
      context,
      '/recce-details',
      arguments: recce,
    );
  }
}
```

### Bulk Add Recce Screen (`lib/screens/recce/bulk_add_recce_screen.dart`)
```dart
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../models/activity_models.dart';
import '../../services/activity_service.dart';
import '../../services/location_service.dart';

class BulkAddRecceScreen extends StatefulWidget {
  @override
  _BulkAddRecceScreenState createState() => _BulkAddRecceScreenState();
}

class _BulkAddRecceScreenState extends State<BulkAddRecceScreen> {
  final ActivityService _activityService = ActivityService();
  final LocationService _locationService = LocationService();
  
  final _visitDateController = TextEditingController();
  final _planIdController = TextEditingController();
  final _deviceIdController = TextEditingController();
  
  List<BulkRecceLocation> _locations = [];
  bool _isLoading = false;
  String _selectedProductType = 'Grey';
  
  final List<String> _productTypes = ['Grey', 'Gold', 'Pink', 'Brown'];

  @override
  void initState() {
    super.initState();
    _visitDateController.text = DateTime.now().toString().split(' ')[0];
    _deviceIdController.text = 'DEVICE123'; // Should be device-specific
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Bulk Add Recce'),
        backgroundColor: Colors.orange[600],
        actions: [
          TextButton(
            onPressed: _locations.isNotEmpty ? _submitBulkRecces : null,
            child: Text(
              'SAVE ALL',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Header Form
          Container(
            padding: EdgeInsets.all(16),
            color: Colors.grey[50],
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _visitDateController,
                        decoration: InputDecoration(
                          labelText: 'Visit Date',
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                        readOnly: true,
                        onTap: () => _selectDate(),
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedProductType,
                        decoration: InputDecoration(
                          labelText: 'Product Type',
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                        items: _productTypes.map((type) {
                          return DropdownMenuItem(
                            value: type,
                            child: Text(type),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedProductType = value!;
                          });
                        },
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 12),
                TextFormField(
                  controller: _planIdController,
                  decoration: InputDecoration(
                    labelText: 'Plan ID',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  keyboardType: TextInputType.number,
                ),
              ],
            ),
          ),
          
          // Locations List
          Expanded(
            child: _locations.isEmpty
                ? _buildEmptyLocationsState()
                : ListView.builder(
                    itemCount: _locations.length,
                    itemBuilder: (context, index) {
                      return _buildLocationCard(_locations[index], index);
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addNewLocation,
        label: Text('Add Location'),
        icon: Icon(Icons.add_location),
        backgroundColor: Colors.orange[600],
      ),
    );
  }

  Widget _buildEmptyLocationsState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.add_location_alt,
            size: 80,
            color: Colors.grey[400],
          ),
          SizedBox(height: 16),
          Text(
            'No Locations Added',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Tap the button below to add your first location',
            style: TextStyle(color: Colors.grey[500]),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildLocationCard(BulkRecceLocation location, int index) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Location ${index + 1}',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () => _removeLocation(index),
                  icon: Icon(Icons.delete, color: Colors.red),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text('Location: ${location.location}'),
            Text('Village: ${location.village} (${location.villageCode})'),
            if (location.latitude != null && location.longitude != null)
              Text('GPS: ${location.latitude!.toStringAsFixed(6)}, ${location.longitude!.toStringAsFixed(6)}'),
            if (location.remarks.isNotEmpty)
              Text('Remarks: ${location.remarks}'),
            SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _editLocation(index),
                    icon: Icon(Icons.edit),
                    label: Text('Edit'),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _captureLocationGPS(index),
                    icon: Icon(Icons.gps_fixed),
                    label: Text('Update GPS'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _addNewLocation() async {
    final result = await showDialog<BulkRecceLocation>(
      context: context,
      builder: (context) => _LocationInputDialog(),
    );

    if (result != null) {
      setState(() {
        _locations.add(result);
      });
    }
  }

  void _editLocation(int index) async {
    final result = await showDialog<BulkRecceLocation>(
      context: context,
      builder: (context) => _LocationInputDialog(location: _locations[index]),
    );

    if (result != null) {
      setState(() {
        _locations[index] = result;
      });
    }
  }

  void _removeLocation(int index) {
    setState(() {
      _locations.removeAt(index);
    });
  }

  Future<void> _captureLocationGPS(int index) async {
    try {
      final position = await _locationService.getCurrentPosition();
      setState(() {
        _locations[index] = _locations[index].copyWith(
          latitude: position.latitude,
          longitude: position.longitude,
        );
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('GPS location updated')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error getting GPS: $e')),
      );
    }
  }

  Future<void> _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(Duration(days: 30)),
      lastDate: DateTime.now().add(Duration(days: 30)),
    );

    if (date != null) {
      _visitDateController.text = date.toString().split(' ')[0];
    }
  }

  Future<void> _submitBulkRecces() async {
    if (_locations.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please add at least one location')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final request = BulkRecceRequest(
        visitDate: _visitDateController.text,
        planId: int.tryParse(_planIdController.text) ?? 1,
        deviceId: _deviceIdController.text,
        locations: _locations,
      );

      final response = await _activityService.createBulkRecces(request);
      
      if (response.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${response.data?.createdCount ?? 0} recces created successfully'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      } else {
        throw Exception(response.message ?? 'Failed to create recces');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error creating recces: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _visitDateController.dispose();
    _planIdController.dispose();
    _deviceIdController.dispose();
    super.dispose();
  }
}

// Location Input Dialog
class _LocationInputDialog extends StatefulWidget {
  final BulkRecceLocation? location;

  const _LocationInputDialog({this.location});

  @override
  _LocationInputDialogState createState() => _LocationInputDialogState();
}

class _LocationInputDialogState extends State<_LocationInputDialog> {
  final _formKey = GlobalKey<FormState>();
  final _locationController = TextEditingController();
  final _villageController = TextEditingController();
  final _villageCodeController = TextEditingController();
  final _remarksController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.location != null) {
      _locationController.text = widget.location!.location;
      _villageController.text = widget.location!.village;
      _villageCodeController.text = widget.location!.villageCode;
      _remarksController.text = widget.location!.remarks;
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.location == null ? 'Add Location' : 'Edit Location'),
      content: SizedBox(
        width: double.maxFinite,
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _locationController,
                decoration: InputDecoration(
                  labelText: 'Location',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter location';
                  }
                  return null;
                },
              ),
              SizedBox(height: 12),
              TextFormField(
                controller: _villageController,
                decoration: InputDecoration(
                  labelText: 'Village',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter village';
                  }
                  return null;
                },
              ),
              SizedBox(height: 12),
              TextFormField(
                controller: _villageCodeController,
                decoration: InputDecoration(
                  labelText: 'Village Code',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter village code';
                  }
                  return null;
                },
              ),
              SizedBox(height: 12),
              TextFormField(
                controller: _remarksController,
                decoration: InputDecoration(
                  labelText: 'Remarks',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _saveLocation,
          child: Text('Save'),
        ),
      ],
    );
  }

  void _saveLocation() {
    if (_formKey.currentState!.validate()) {
      final location = BulkRecceLocation(
        location: _locationController.text.trim(),
        village: _villageController.text.trim(),
        villageCode: _villageCodeController.text.trim(),
        remarks: _remarksController.text.trim(),
        latitude: widget.location?.latitude,
        longitude: widget.location?.longitude,
      );
      Navigator.pop(context, location);
    }
  }

  @override
  void dispose() {
    _locationController.dispose();
    _villageController.dispose();
    _villageCodeController.dispose();
    _remarksController.dispose();
    super.dispose();
  }
}

// Bulk Recce Models
class BulkRecceLocation {
  final String location;
  final String village;
  final String villageCode;
  final String remarks;
  final double? latitude;
  final double? longitude;

  BulkRecceLocation({
    required this.location,
    required this.village,
    required this.villageCode,
    required this.remarks,
    this.latitude,
    this.longitude,
  });

  BulkRecceLocation copyWith({
    String? location,
    String? village,
    String? villageCode,
    String? remarks,
    double? latitude,
    double? longitude,
  }) {
    return BulkRecceLocation(
      location: location ?? this.location,
      village: village ?? this.village,
      villageCode: villageCode ?? this.villageCode,
      remarks: remarks ?? this.remarks,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'location': location,
      'village': village,
      'village_code': villageCode,
      'remarks': remarks,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
    };
  }
}

class BulkRecceRequest {
  final String visitDate;
  final int planId;
  final String deviceId;
  final List<BulkRecceLocation> locations;

  BulkRecceRequest({
    required this.visitDate,
    required this.planId,
    required this.deviceId,
    required this.locations,
  });

  Map<String, dynamic> toJson() {
    return {
      'visit_date': visitDate,
      'plan_id': planId,
      'device_id': deviceId,
      'locations': locations.map((l) => l.toJson()).toList(),
    };
  }
}
```

## 🛠️ Enhanced API Service for Recce

### Updated Activity Service (`lib/services/activity_service.dart`)
```dart
// Add these methods to the existing ActivityService class

class ActivityService {
  // ... existing methods ...

  // Get recce activities specifically
  Future<ApiResponse<List<Activity>>> getRecces({
    int page = 1,
    int perPage = 15,
    String? status,
    String? productType,
    String? dateFrom,
    String? dateTo,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'per_page': perPage.toString(),
        if (status != null) 'status': status,
        if (productType != null) 'product_type': productType,
        if (dateFrom != null) 'date_from': dateFrom,
        if (dateTo != null) 'date_to': dateTo,
      };

      final response = await _apiClient.get(
        '/mobile/recces',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        final data = response.data['data'] as List;
        final activities = data.map((json) => Activity.fromJson(json)).toList();
        
        return ApiResponse.success(
          data: activities,
          message: 'Recces loaded successfully',
        );
      } else {
        return ApiResponse.error('Failed to load recces');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  // Create bulk recces
  Future<ApiResponse<BulkRecceResponse>> createBulkRecces(
    BulkRecceRequest request,
  ) async {
    try {
      final response = await _apiClient.post(
        '/mobile/activities/bulk',
        data: {
          'activities': request.locations.map((location) => {
            'visit_date': request.visitDate,
            'plan_id': request.planId,
            'device_id': request.deviceId,
            'activity_type': 'recce',
            'product_type': 'Grey', // Default, can be customized
            'state': 'Karnataka', // Should be set from user profile
            'district': 'Bangalore Urban', // Should be set from user profile
            'sub_district': 'Bangalore North', // Should be set from user profile
            'village': location.village,
            'village_code': location.villageCode,
            'location': location.location,
            'landmark': '', // Optional
            'latitude': location.latitude,
            'longitude': location.longitude,
            'remarks': location.remarks,
            // Images would be added separately if needed
          }).toList(),
        },
      );

      if (response.statusCode == 201) {
        final bulkResponse = BulkRecceResponse.fromJson(response.data['data']);
        return ApiResponse.success(
          data: bulkResponse,
          message: response.data['message'],
        );
      } else {
        return ApiResponse.error('Failed to create bulk recces');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  // Quick bulk recce creation
  Future<ApiResponse<QuickBulkResponse>> createQuickBulkRecces(
    BulkRecceRequest request,
  ) async {
    try {
      final response = await _apiClient.post(
        '/mobile/recces/bulk-quick',
        data: request.toJson(),
      );

      if (response.statusCode == 201) {
        final quickResponse = QuickBulkResponse.fromJson(response.data['data']);
        return ApiResponse.success(
          data: quickResponse,
          message: response.data['message'],
        );
      } else {
        return ApiResponse.error('Failed to create quick bulk recces');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }
}

// Response models for bulk operations
class BulkRecceResponse {
  final int createdCount;
  final int failedCount;
  final List<Activity> activities;
  final List<String> errors;

  BulkRecceResponse({
    required this.createdCount,
    required this.failedCount,
    required this.activities,
    required this.errors,
  });

  factory BulkRecceResponse.fromJson(Map<String, dynamic> json) {
    return BulkRecceResponse(
      createdCount: json['created_count'] ?? 0,
      failedCount: json['failed_count'] ?? 0,
      activities: (json['activities'] as List? ?? [])
          .map((e) => Activity.fromJson(e))
          .toList(),
      errors: List<String>.from(json['errors'] ?? []),
    );
  }
}

class QuickBulkResponse {
  final int createdCount;
  final List<int> recceIds;
  final String batchId;

  QuickBulkResponse({
    required this.createdCount,
    required this.recceIds,
    required this.batchId,
  });

  factory QuickBulkResponse.fromJson(Map<String, dynamic> json) {
    return QuickBulkResponse(
      createdCount: json['created_count'] ?? 0,
      recceIds: List<int>.from(json['recce_ids'] ?? []),
      batchId: json['batch_id'] ?? '',
    );
  }
}
```

### Phase 5: Testing & Polish (Week 8)
1. Comprehensive testing on multiple devices
2. Performance optimization and bug fixes
3. UI/UX improvements and accessibility
4. Final integration testing with API

## 🧪 Testing Strategy

### Unit Tests
- Model serialization/deserialization
- API service methods
- Validation logic
- Business logic functions

### Widget Tests
- Form validation and submission
- Image picker functionality
- Navigation between screens
- State management updates

### Integration Tests
- Complete user flows (login to activity creation)
- Offline sync scenarios
- API error handling
- Location services integration

## 📱 Deployment Considerations

### Android
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 34 (Android 14)
- Required permissions: Camera, Location, Internet, Storage

### iOS
- Minimum iOS: 12.0
- Required permissions: Camera, Location, Internet
- App Store compliance for location and camera usage

### Security
- Secure token storage using keychain/keystore
- Certificate pinning for API requests
- Input validation and sanitization
- Encrypted local database

---

## 📋 Checklist for Implementation

- [ ] Project setup with dependencies
- [ ] Data models implementation
- [ ] API service with authentication
- [ ] Login and authentication screens
- [ ] Activity management screens
- [ ] Image capture and location services
- [ ] Offline sync implementation
- [ ] Route plan management
- [ ] Error handling and validation
- [ ] Testing and quality assurance
- [ ] Performance optimization
- [ ] Security implementation
- [ ] Documentation and deployment

**Use the provided documentation links with AI MCP tools for automated code generation and faster development!**
