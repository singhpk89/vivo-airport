# 📱 Mobile API Documentation

## Overview
This document provides comprehensive API documentation for mobile-specific endpoints including authentication, user feedback, and day activity picture management for the LI Council application.

**Base URL:** `https://vair.test/api/mobile`  
**Authentication:** Bearer Token (Laravel Sanctum)  
**Content Type:** `application/json`

---

## 🔐 Authentication Endpoints

### 1. Mobile Login
Authenticate a promoter and receive access token for mobile app usage.

**Endpoint:** `POST /mobile/auth/login`

**Request Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
    "username": "promoter123",
    "password": "password123",
    "device_id": "android_device_123456789",
    "device_token": "firebase_token_here",
    "app_version": "1.2.0"
}
```

**Field Descriptions:**
- `username`: Promoter's unique username (required)
- `password`: Promoter's password (required)
- `device_id`: Unique device identifier for device binding (recommended)
- `device_token`: Firebase/push notification token (optional)
- `app_version`: Mobile app version (optional)

**Device Binding Rules:**
- **New Promoters**: If `device_id` is null in database, can login on any device
- **Existing Promoters**: Can only login on their registered device
- **Device Binding**: Occurs automatically on first successful login
- **Admin Reset**: Administrators can reset device binding to allow new device

**Response (200 - Success):**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "promoter": {
            "id": 1,
            "name": "John Doe",
            "username": "promoter123",
            "email": "john@example.com",
            "phone": "+91-9876543210",
            "state": "Maharashtra",
            "district": "Mumbai",
            "sub_district": "Andheri",
            "village": "Andheri East",
            "is_active": true,
            "is_logged_in": true,
            "profile_image": "storage/promoters/profile.jpg",
            "last_login_at": "2025-09-21T10:30:00.000000Z",
            "created_at": "2025-08-24T10:30:00.000000Z",
            "updated_at": "2025-09-21T10:30:00.000000Z"
        },
        "token": "1|abcd1234567890xyz...",
        "token_type": "Bearer",
        "expires_at": "2025-09-22T10:30:00.000000Z"
    }
}
```

**Response (401 - Authentication Failed):**
```json
{
    "success": false,
    "message": "Invalid credentials",
    "errors": {
        "username": ["The provided credentials are incorrect."]
    }
}
```

**Response (403 - Account Inactive):**
```json
{
    "success": false,
    "message": "Account is inactive. Please contact administrator.",
    "errors": {
        "account": ["Your account has been deactivated."]
    }
}
```

**Response (403 - Device Binding Error):**
```json
{
    "success": false,
    "message": "This account is already bound to another device. Please use the registered device or contact administrator."
}
```

**Response (403 - Already Logged In):**
```json
{
    "success": false,
    "message": "User already logged in on another device"
}
```

**cURL Example:**
```bash
curl -X POST https://vivo.uplive.at/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "username": "promoter123",
    "password": "password123",
    "device_id": "android_device_123456789",
    "device_token": "firebase_token_abc123",
    "app_version": "1.2.0"
  }'
```

---

### 2. Mobile Logout
Logout current promoter and invalidate the authentication token.

**Endpoint:** `POST /mobile/auth/logout`

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:** *(Empty)*

**Response (200 - Success):**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

**Response (401 - Unauthorized):**
```json
{
    "success": false,
    "message": "Unauthenticated",
    "errors": {
        "token": ["Invalid or expired token"]
    }
}
```

**cURL Example:**
```bash
curl -X POST https://vair.test/api/mobile/auth/logout \
  -H "Authorization: Bearer 1|abcd1234567890xyz..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

---

## 💬 Vivo Experience Feedback Endpoints

### 3. Submit Vivo Experience Feedback
Submit feedback from visitors about their Vivo Experience Studio visit. This is a specialized feedback system for Vivo brand experience.

**Endpoint:** `POST /api/vivo-experience-feedback`

**Request Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Note:** This endpoint does not require authentication as it's for public visitor feedback.

**Request Body:**
```json
{
    "overall_experience": "excellent",
    "favorite_section": "macro_photography",
    "preferred_model": "vivo_x200_pro",
    "souvenir_experience": "yes",
    "suggestions": "Would love to see more interactive demos",
    "visitor_name": "John Doe",
    "visitor_email": "john@example.com",
    "visitor_phone": "+1234567890",
    "visit_date": "2024-01-20",
    "assisted_by_promoter_id": "12",
    "is_anonymous": false,
    "allow_marketing_contact": true
}
```

**Field Options:**
- **overall_experience:** `excellent`, `good`, `average`, `poor`
- **favorite_section:** `macro_photography`, `photobooth_zone`, `photo_gallery`, `all_above`
- **preferred_model:** `vivo_x200_pro`, `vivo_x200_fe`, `vivo_x_fold5`, `still_exploring`
- **souvenir_experience:** `yes`, `somewhat`, `no`
- **assisted_by_promoter_id:** Promoter ID who assisted the visitor (use "none" or empty string if no assistance)

**Response (201 - Created):**
```json
{
    "success": true,
    "message": "Vivo Experience feedback submitted successfully",
    "data": {
        "id": 15,
        "form_type": "vivo_experience",
        "category": "experience_feedback",
        "subject": "Xperience Studio by Vivo - Visitor Feedback",
        "overall_experience": "excellent",
        "favorite_section": "macro_photography",
        "preferred_model": "vivo_x200_pro",
        "souvenir_experience": "yes",
        "suggestions": "Would love to see more interactive demos",
        "visitor_name": "John Doe",
        "visitor_email": "john@example.com",
        "visitor_phone": "+1234567890",
        "visit_date": "2024-01-20",
        "assisted_by_promoter_id": "12",
        "is_anonymous": false,
        "allow_marketing_contact": true,
        "status": "open",
        "priority": "medium",
        "created_at": "2024-01-20T10:30:00.000000Z",
        "updated_at": "2024-01-20T10:30:00.000000Z"
    }
}
```

**Response (422 - Validation Error):**
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "visitor_email": ["The visitor email must be a valid email address."]
    }
}
```

**Response (500 - Server Error):**
```json
{
    "success": false,
    "message": "Error submitting Vivo Experience feedback",
    "error": "Database connection failed"
}
```

**cURL Example:**
```bash
curl -X POST https://vair.test/api/vivo-experience-feedback \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "overall_experience": "excellent",
    "favorite_section": "macro_photography",
    "preferred_model": "vivo_x200_pro",
    "souvenir_experience": "yes",
    "suggestions": "Amazing experience!",
    "visitor_name": "Jane Smith",
    "visitor_email": "jane@example.com",
    "visit_date": "2024-01-20",
    "assisted_by_promoter_id": "12"
  }'
```

**Note:** All fields are optional except for proper email format validation if an email is provided. The system automatically sets form_type to "vivo_experience" and appropriate defaults for category, subject, status, and priority.

**cURL Example:**
```bash
curl -X GET "https://vair.test/api/mobile/feedback?page=1&status=open" \
  -H "Authorization: Bearer 1|abcd1234567890xyz..." \
  -H "Accept: application/json"
```

---

## 📸 Day Activity Pictures Endpoints

### 5. Upload Activity Pictures
Upload login, activity, and logout pictures for day activity tracking.

**Endpoint:** `POST /mobile/promoter-activity/upload-photo`

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
Accept: application/json
```

**Request Body (Form Data):**
```
promoter_id: 1
activity_date: 2025-09-21
photo_type: login
latitude: 19.0760
longitude: 72.8777
address: "Andheri East, Mumbai, Maharashtra"
device_id: "DEVICE123456"
timestamp: 2025-09-21T09:00:00.000000Z
photo: [binary file data]
```

**Field Descriptions:**
- `photo_type`: One of `login`, `activity`, `logout`
- `activity_date`: Date of the activity (YYYY-MM-DD)
- `latitude`/`longitude`: GPS coordinates where photo was taken
- `address`: Human-readable address (optional)
- `device_id`: Unique device identifier
- `timestamp`: When the photo was taken
- `photo`: Image file (JPEG/PNG, max 5MB)

**Response (201 - Success):**
```json
{
    "success": true,
    "message": "Photo uploaded successfully",
    "data": {
        "id": 123,
        "promoter_id": 1,
        "activity_date": "2025-09-21",
        "photo_type": "login",
        "photo_url": "storage/promoter-activities/2025/09/21/login_123_1695292800.jpg",
        "thumbnail_url": "storage/promoter-activities/2025/09/21/thumbnails/login_123_1695292800.jpg",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "address": "Andheri East, Mumbai, Maharashtra",
        "device_id": "DEVICE123456",
        "file_size": 2048576,
        "taken_at": "2025-09-21T09:00:00.000000Z",
        "uploaded_at": "2025-09-21T09:01:15.000000Z"
    }
}
```

**Response (422 - Validation Error):**
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "photo": ["The photo field is required.", "The photo must be an image."],
        "photo_type": ["The selected photo type is invalid."],
        "activity_date": ["The activity date field is required."]
    }
}
```

**Response (413 - File Too Large):**
```json
{
    "success": false,
    "message": "File too large",
    "errors": {
        "photo": ["The photo may not be greater than 5MB."]
    }
}
```

**cURL Example:**
```bash
curl -X POST https://vair.test/api/mobile/promoter-activity/upload-photo \
  -H "Authorization: Bearer 1|abcd1234567890xyz..." \
  -H "Accept: application/json" \
  -F "promoter_id=1" \
  -F "activity_date=2025-09-21" \
  -F "photo_type=login" \
  -F "latitude=19.0760" \
  -F "longitude=72.8777" \
  -F "address=Andheri East, Mumbai, Maharashtra" \
  -F "device_id=DEVICE123456" \
  -F "timestamp=2025-09-21T09:00:00.000000Z" \
  -F "photo=@/path/to/login_photo.jpg"
```

---

### 6. Get Day Activity Summary
Retrieve daily activity summary with uploaded pictures.

**Endpoint:** `GET /mobile/promoter-activity/activity`

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Query Parameters:**
- `date` (optional): Specific date (YYYY-MM-DD, default: today)
- `month` (optional): Get activities for entire month (YYYY-MM)
- `include_photos` (optional): Include photo URLs (true/false, default: true)

**Response (200 - Success):**
```json
{
    "success": true,
    "data": {
        "activity_date": "2025-09-21",
        "promoter": {
            "id": 1,
            "name": "John Doe",
            "username": "promoter123"
        },
        "summary": {
            "total_photos": 15,
            "login_photos": 1,
            "activity_photos": 13,
            "logout_photos": 1,
            "first_activity": "2025-09-21T09:00:00.000000Z",
            "last_activity": "2025-09-21T18:30:00.000000Z",
            "work_duration": "9 hours 30 minutes",
            "locations_visited": 8
        },
        "photos": [
            {
                "id": 123,
                "photo_type": "login",
                "photo_url": "storage/promoter-activities/2025/09/21/login_123_1695292800.jpg",
                "thumbnail_url": "storage/promoter-activities/2025/09/21/thumbnails/login_123_1695292800.jpg",
                "latitude": 19.0760,
                "longitude": 72.8777,
                "address": "Andheri East, Mumbai, Maharashtra",
                "taken_at": "2025-09-21T09:00:00.000000Z"
            },
            {
                "id": 124,
                "photo_type": "activity",
                "photo_url": "storage/promoter-activities/2025/09/21/activity_124_1695296400.jpg",
                "thumbnail_url": "storage/promoter-activities/2025/09/21/thumbnails/activity_124_1695296400.jpg",
                "latitude": 19.0820,
                "longitude": 72.8820,
                "address": "Malad West, Mumbai, Maharashtra",
                "taken_at": "2025-09-21T10:00:00.000000Z"
            },
            {
                "id": 137,
                "photo_type": "logout",
                "photo_url": "storage/promoter-activities/2025/09/21/logout_137_1695325800.jpg",
                "thumbnail_url": "storage/promoter-activities/2025/09/21/thumbnails/logout_137_1695325800.jpg",
                "latitude": 19.0760,
                "longitude": 72.8777,
                "address": "Andheri East, Mumbai, Maharashtra",
                "taken_at": "2025-09-21T18:30:00.000000Z"
            }
        ],
        "route_map": {
            "start_location": {
                "latitude": 19.0760,
                "longitude": 72.8777,
                "address": "Andheri East, Mumbai, Maharashtra"
            },
            "end_location": {
                "latitude": 19.0760,
                "longitude": 72.8777,
                "address": "Andheri East, Mumbai, Maharashtra"
            },
            "waypoints": [
                {"latitude": 19.0820, "longitude": 72.8820, "time": "10:00:00"},
                {"latitude": 19.0950, "longitude": 72.8950, "time": "12:00:00"},
                {"latitude": 19.1100, "longitude": 72.9100, "time": "15:00:00"}
            ]
        }
    }
}
```

**Response (404 - No Activity):**
```json
{
    "success": false,
    "message": "No activity found for the specified date",
    "data": {
        "activity_date": "2025-09-21",
        "summary": {
            "total_photos": 0,
            "login_photos": 0,
            "activity_photos": 0,
            "logout_photos": 0
        }
    }
}
```

**cURL Example:**
```bash
curl -X GET "https://vair.test/api/mobile/promoter-activity/activity?date=2025-09-21&include_photos=true" \
  -H "Authorization: Bearer 1|abcd1234567890xyz..." \
  -H "Accept: application/json"
```

---

### 7. Sync Activities with Photos (Enhanced)
Synchronize activity data and AWS S3 photo URLs when connection is restored. This endpoint now supports bulk syncing of activities with their associated photos stored in AWS S3.

**Endpoint:** `POST /mobile/promoter-activity/sync`

**Request Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Note:** This endpoint does not require authentication for now (as per route definition).

**Request Body:**
```json
{
    "promoter_id": 123,
    "activities": [
        {
            "activity_date": "2024-01-20",
            "login_time": "2024-01-20T09:00:00.000Z",
            "logout_time": "2024-01-20T17:30:00.000Z",
            "status": "logged_out",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "photos": [
                {
                    "photo_type": "login",
                    "s3_url": "https://your-s3-bucket.s3.amazonaws.com/promoter-photos/20240120/login_123456.jpg",
                    "file_name": "login_photo_20240120.jpg",
                    "mime_type": "image/jpeg",
                    "file_size": 245760,
                    "latitude": 19.0760,
                    "longitude": 72.8777,
                    "captured_at": "2024-01-20T09:00:30.000Z",
                    "description": "Login selfie at office location"
                },
                {
                    "photo_type": "activity",
                    "s3_url": "https://your-s3-bucket.s3.amazonaws.com/promoter-photos/20240120/demo_789012.jpg",
                    "file_name": "vivo_demo_photo.jpg",
                    "mime_type": "image/jpeg",
                    "file_size": 512000,
                    "latitude": 19.0765,
                    "longitude": 72.8782,
                    "captured_at": "2024-01-20T14:30:15.000Z",
                    "description": "Vivo X200 Pro demonstration to customer"
                },
                {
                    "photo_type": "logout",
                    "s3_url": "https://your-s3-bucket.s3.amazonaws.com/promoter-photos/20240120/logout_345678.jpg",
                    "file_name": "logout_photo_20240120.jpg",
                    "mime_type": "image/jpeg",
                    "file_size": 198432,
                    "latitude": 19.0760,
                    "longitude": 72.8777,
                    "captured_at": "2024-01-20T17:30:45.000Z",
                    "description": "End of day logout selfie"
                }
            ]
        },
        {
            "activity_date": "2024-01-21",
            "login_time": "2024-01-21T08:45:00.000Z",
            "logout_time": null,
            "status": "active",
            "latitude": 19.0758,
            "longitude": 72.8775,
            "photos": [
                {
                    "photo_type": "login",
                    "s3_url": "https://your-s3-bucket.s3.amazonaws.com/promoter-photos/20240121/login_456789.jpg",
                    "file_name": "login_photo_20240121.jpg",
                    "mime_type": "image/jpeg",
                    "file_size": 267890,
                    "latitude": 19.0758,
                    "longitude": 72.8775,
                    "captured_at": "2024-01-21T08:45:30.000Z",
                    "description": "Morning login at new location"
                }
            ]
        }
    ]
}
```

**Field Descriptions:**

**Activity Fields:**
- `promoter_id` (required): Valid promoter ID
- `activity_date` (required): Date in YYYY-MM-DD format
- `login_time` (optional): ISO 8601 datetime
- `logout_time` (optional): ISO 8601 datetime
- `status` (required): One of `logged_in`, `logged_out`, `active`
- `latitude` (optional): GPS latitude (-90 to 90)
- `longitude` (optional): GPS longitude (-180 to 180)

**Photo Fields:**
- `photo_type` (required): One of `login`, `logout`, `activity`, `selfie`, `location`
- `s3_url` (required): Full AWS S3 URL of the uploaded photo
- `file_name` (optional): Original filename
- `mime_type` (optional): MIME type (defaults to image/jpeg)
- `file_size` (optional): File size in bytes
- `latitude` (optional): Photo GPS latitude
- `longitude` (optional): Photo GPS longitude  
- `captured_at` (optional): When photo was taken (ISO 8601)
- `description` (optional): Photo description (max 500 chars)

**Response (200 - Success):**
```json
{
    "success": true,
    "message": "Synced 2 activity records and 4 photos successfully",
    "data": {
        "synced_activities": 2,
        "synced_photos": 4
    }
}
```

**Response (422 - Validation Error):**
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "promoter_id": ["The promoter id field is required."],
        "activities.0.activity_date": ["The activities.0.activity_date field is required."],
        "activities.0.photos.0.s3_url": ["The activities.0.photos.0.s3_url must be a valid URL."]
    }
}
```

**Key Features:**
- ✅ **Bulk Operations**: Sync multiple activities and photos in one request
- ✅ **S3 Integration**: Direct S3 URL storage (no file processing)
- ✅ **GPS Support**: Full location data for activities and photos
- ✅ **Duplicate Prevention**: Smart deduplication based on URL and timestamp
- ✅ **Photo Metadata**: Comprehensive photo information storage
- ✅ **Auto Counting**: Automatic photo count updates per activity

**cURL Example:**
```bash
curl -X POST https://vivo.uplive.at/api/mobile/promoter-activity/sync \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "promoter_id": 123,
    "activities": [
        {
            "activity_date": "2024-01-20",
            "login_time": "2024-01-20T09:00:00.000Z",
            "logout_time": "2024-01-20T17:30:00.000Z",
            "status": "logged_out",
            "photos": [
                {
                    "photo_type": "login",
                    "s3_url": "https://your-s3-bucket.s3.amazonaws.com/promoter-photos/login_123456.jpg",
                    "captured_at": "2024-01-20T09:00:30.000Z"
                }
            ]
        }
    ]
  }'
```
        }
    ]
}
```

**Response (200 - Success):**
```json
{
    "success": true,
    "message": "Data synchronized successfully",
    "data": {
        "sync_summary": {
            "total_items": 2,
            "successful": 2,
            "failed": 0,
            "duplicate": 0
        },
        "synced_activities": [
            {
                "local_id": "offline_1",
                "server_id": 156,
                "status": "synced",
                "photo_url": "storage/promoter-activities/2025/09/21/activity_156_1695296400.jpg"
            },
            {
                "local_id": "offline_2",
                "server_id": 157,
                "status": "synced",
                "photo_url": "storage/promoter-activities/2025/09/21/activity_157_1695308100.jpg"
            }
        ],
        "failed_items": [],
        "sync_completed_at": "2025-09-21T20:01:30.000000Z"
    }
}
```

**Response (422 - Partial Sync):**
```json
{
    "success": true,
    "message": "Partial synchronization completed",
    "data": {
        "sync_summary": {
            "total_items": 2,
            "successful": 1,
            "failed": 1,
            "duplicate": 0
        },
        "synced_activities": [
            {
                "local_id": "offline_1",
                "server_id": 156,
                "status": "synced",
                "photo_url": "storage/promoter-activities/2025/09/21/activity_156_1695296400.jpg"
            }
        ],
        "failed_items": [
            {
                "local_id": "offline_2",
                "error": "Image file corrupted or invalid format",
                "status": "failed"
            }
        ],
        "sync_completed_at": "2025-09-21T20:01:30.000000Z"
    }
}
```

**cURL Example:**
```bash
curl -X POST https://vair.test/api/mobile/promoter-activity/sync \
  -H "Authorization: Bearer 1|abcd1234567890xyz..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "device_id": "DEVICE123456",
    "sync_timestamp": "2025-09-21T20:00:00.000000Z",
    "activities": [...]
  }'
```

---

## 🔄 Error Handling

### Common Error Responses

**401 - Unauthorized:**
```json
{
    "success": false,
    "message": "Unauthenticated",
    "errors": {
        "token": ["Invalid or expired token"]
    }
}
```

**403 - Forbidden:**
```json
{
    "success": false,
    "message": "This action is unauthorized",
    "errors": {
        "permission": ["Insufficient permissions"]
    }
}
```

**422 - Validation Error:**
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "field_name": ["Field specific error message"]
    }
}
```

**500 - Server Error:**
```json
{
    "success": false,
    "message": "Internal server error",
    "errors": {
        "server": ["An unexpected error occurred"]
    }
}
```

---

## 📚 SDK Examples

### React Native Implementation

```javascript
class MobileAPIService {
  constructor(baseURL = 'https://vair.test/api/mobile') {
    this.baseURL = baseURL;
    this.token = null;
  }

  async login(username, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    if (data.success) {
      this.token = data.data.token;
      await AsyncStorage.setItem('auth_token', this.token);
    }
    return data;
  }

  async submitVivoFeedback(feedbackData) {
    return this.request('/vivo-experience-feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
      skipAuth: true // This endpoint doesn't require authentication
    });
  }

  async uploadActivityPhoto(photoData) {
    const formData = new FormData();
    Object.keys(photoData).forEach(key => {
      formData.append(key, photoData[key]);
    });

    return this.request('/promoter-activity/upload-photo', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Skip authentication for certain endpoints
    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    };
    
    if (!options.skipAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response.json();
  }
}

// Usage Example for Vivo Experience Feedback:
const api = new MobileAPI();

const vivoFeedback = {
  overall_experience: 'excellent',
  favorite_section: 'macro_photography',
  preferred_model: 'vivo_x200_pro',
  souvenir_experience: 'yes',
  suggestions: 'Amazing interactive experience!',
  visitor_name: 'Jane Smith',
  visitor_email: 'jane@example.com',
  visit_date: '2024-01-20',
  assisted_by_promoter_id: '12'
};

const result = await api.submitVivoFeedback(vivoFeedback);
console.log('Feedback submitted:', result.success);
```

### Flutter Implementation

```dart
class MobileAPIService {
  final String baseURL;
  String? token;
  
  MobileAPIService({this.baseURL = 'https://vair.test/api/mobile'});

  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseURL/auth/login'),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({
        'username': username,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);
    if (data['success']) {
      token = data['data']['token'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token!);
    }
    return data;
  }

  Future<Map<String, dynamic>> submitVivoFeedback(Map<String, dynamic> feedbackData) async {
    return _request('/vivo-experience-feedback', method: 'POST', body: feedbackData, skipAuth: true);
  }

  Future<Map<String, dynamic>> uploadActivityPhoto(File photoFile, Map<String, String> metadata) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseURL/promoter-activity/upload-photo'),
    );
    
    request.headers.addAll({
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    });
    
    request.files.add(await http.MultipartFile.fromPath('photo', photoFile.path));
    metadata.forEach((key, value) {
      request.fields[key] = value;
    });

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return jsonDecode(response.body);
  }
}
```

---

## 📋 Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **Feedback endpoints**: 10 requests per minute per user
- **Photo upload endpoints**: 30 requests per minute per user
- **General endpoints**: 100 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1695292800
```

---

## 🔒 Security Notes

1. **HTTPS Only**: All API calls must use HTTPS in production
2. **Token Storage**: Store tokens securely using platform-specific secure storage
3. **Token Expiration**: Tokens expire after 24 hours of inactivity
4. **File Validation**: Only JPEG/PNG images up to 5MB are accepted
5. **Location Privacy**: GPS coordinates are stored securely and used only for work tracking
6. **Data Encryption**: All sensitive data is encrypted at rest and in transit

---

## 📱 Device Binding System

### Overview
The mobile app implements a device binding system to ensure security and prevent unauthorized access. Each promoter can only be logged in on one registered device at a time.

### How Device Binding Works

1. **First Login**: When a promoter logs in for the first time (device_id = null in database), their device is automatically registered
2. **Subsequent Logins**: Promoter can only login on their registered device
3. **Device Validation**: Every login attempt validates the device_id against the stored device_id
4. **Admin Override**: Administrators can reset device binding to allow login on a new device

### Implementation Guidelines

**For Mobile App Developers:**
```javascript
// Always include device_id in login requests
const deviceId = await getUniqueDeviceId(); // Platform-specific implementation

const loginData = {
    username: 'promoter123',
    password: 'password123',
    device_id: deviceId,
    device_token: await getFirebaseToken(),
    app_version: '1.2.0'
};
```

**Error Handling:**
```javascript
const response = await fetch('/api/mobile/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
});

const result = await response.json();

if (!result.success && response.status === 403) {
    if (result.message.includes('bound to another device')) {
        // Show device binding error message
        showError('This account is registered to another device. Please contact administrator to reset device binding.');
    } else if (result.message.includes('already logged in')) {
        // Show already logged in error
        showError('Account is already logged in on another device.');
    }
}
```

### Admin Reset Device Binding

**Endpoint:** `POST /api/promoters/{promoter_id}/reset-device`

**Purpose**: Allows administrators to reset a promoter's device binding, enabling them to login on a new device.

**Request Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
Accept: application/json
```

**Response (200 - Success):**
```json
{
    "success": true,
    "message": "Device binding reset successfully. Promoter can now login on a new device.",
    "data": {
        "promoter_id": 123,
        "promoter_name": "John Doe",
        "reset_at": "2024-01-20T10:30:00.000000Z"
    }
}
```

### Best Practices

1. **Generate Unique Device IDs**: Use platform-specific methods to generate truly unique device identifiers
2. **Store Device ID Locally**: Cache the device ID to ensure consistency across app sessions
3. **Handle Binding Errors Gracefully**: Provide clear error messages and contact information for users
4. **Admin Workflow**: Establish a process for handling device reset requests from users
5. **Security Logging**: Log device binding events for security auditing

---

## 📞 Support

For API support and technical issues:
- **Email**: api-support@li-council.com
- **Phone**: +91-9876543210
- **Documentation**: https://vair.test/api/docs
- **Status Page**: https://status.li-council.com

---

*Last Updated: September 21, 2025*
*API Version: v1.0*
