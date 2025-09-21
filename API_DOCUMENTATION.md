# LI Council API Documentation

## Overview
This API provides endpoints for the LI Council mobile application and admin panel. The API uses Laravel Sanctum for authentication and follows RESTful conventions.

**Base URL:** `https://li-council.uplive.at/api`

## Authentication

### Sanctum Token Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {your-token-here}
```

---

## 📷 Image Upload with AWS S3

### Upload Image to S3
**POST** `/mobile/upload-image`

**Headers:** `Authorization: Bearer {token}`

**Request (multipart/form-data):**
```
image: [image file]
folder: "activities" | "profiles" | "documents"
```

**Response:**
```json
{
    "success": true,
    "message": "Image uploaded successfully",
    "data": {
        "url": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/uuid-filename.jpg",
        "filename": "uuid-filename.jpg",
        "size": 1024576,
        "mime_type": "image/jpeg",
        "uploaded_at": "2025-08-25T10:30:00Z"
    }
}
```

### Upload Multiple Images
**POST** `/mobile/upload-images`

**Headers:** `Authorization: Bearer {token}`

**Request (multipart/form-data):**
```
images[]: [image file 1]
images[]: [image file 2]
images[]: [image file 3]
folder: "activities" | "profiles" | "documents"
```

**Response:**
```json
{
    "success": true,
    "message": "Images uploaded successfully",
    "data": {
        "uploaded_count": 3,
        "failed_count": 0,
        "images": [
            {
                "url": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/uuid-1.jpg",
                "filename": "uuid-1.jpg",
                "size": 1024576,
                "mime_type": "image/jpeg"
            },
            {
                "url": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/uuid-2.jpg",
                "filename": "uuid-2.jpg",
                "size": 2048576,
                "mime_type": "image/jpeg"
            },
            {
                "url": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/uuid-3.jpg",
                "filename": "uuid-3.jpg",
                "size": 1536576,
                "mime_type": "image/jpeg"
            }
        ],
        "errors": []
    }
}
```

### Delete Image from S3
**DELETE** `/mobile/delete-image`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "url": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/uuid-filename.jpg"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Image deleted successfully"
}
```

---

## Mobile App Endpoints

### 🔐 Authentication

#### Login
**POST** `/mobile/auth/login`

**Request:**
```json
{
    "username": "promoter123",
    "password": "password123"
}
```

**Response (Success):**
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
            "created_at": "2025-08-24T10:30:00Z"
        },
        "token": "1|abcd1234567890xyz...",
        "token_type": "Bearer"
    }
}
```

**Response (Error):**
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

#### Get Profile
**GET** `/mobile/auth/profile`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
    "success": true,
    "data": {
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
        "profile_image": "storage/promoters/profile.jpg"
    }
}
```

#### Update Profile
**PUT** `/mobile/auth/profile`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "+91-9876543211",
    "profile_image": "https://your-bucket.s3.amazonaws.com/profiles/2025/08/25/profile-image.jpg"
}
```

#### Update Profile with Image Upload
**POST** `/mobile/auth/profile/with-image`

**Headers:** `Authorization: Bearer {token}`

**Request (multipart/form-data):**
```
name: "John Doe Updated"
email: "john.updated@example.com"
phone: "+91-9876543211"
profile_image: [image file]
```

**Response:**
```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "id": 1,
        "name": "John Doe Updated",
        "email": "john.updated@example.com",
        "phone": "+91-9876543211",
        "profile_image": "https://your-bucket.s3.amazonaws.com/profiles/2025/08/25/profile-image.jpg",
        "updated_at": "2025-08-25T10:30:00Z"
    }
}
```

#### Change Password
**POST** `/mobile/auth/change-password`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "current_password": "oldpassword123",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
}
```

#### Logout
**POST** `/mobile/auth/logout`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

---

### 📍 Route Plans

#### Get Route Plans
**GET** `/mobile/route-plans`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (int): Page number for pagination
- `per_page` (int): Items per page (default: 15)
- `search` (string): Search in location, village, etc.
- `status` (string): Filter by status (active, inactive, completed)
- `state` (string): Filter by state
- `district` (string): Filter by district

**Response:**
```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": 1,
                "plan_name": "Mumbai Route Plan 1",
                "state": "Maharashtra",
                "district": "Mumbai",
                "sub_district": "Andheri",
                "village": "Andheri East",
                "village_code": "MH001",
                "location": "Near Metro Station",
                "landmark": "Andheri Metro Station",
                "status": "active",
                "created_at": "2025-08-24T10:30:00Z",
                "promoter": {
                    "id": 1,
                    "name": "John Doe",
                    "username": "promoter123"
                }
            }
        ],
        "current_page": 1,
        "last_page": 5,
        "per_page": 15,
        "total": 75
    }
}
```

---

### 🎯 Activities

#### Get Activities
**GET** `/mobile/activities`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (int): Page number
- `per_page` (int): Items per page
- `search` (string): Search term
- `status` (string): pending, completed, cancelled
- `activity_type` (string): recce, visit, survey
- `product_type` (string): Grey, Gold, Pink, Brown
- `start_date` (date): Filter from date (YYYY-MM-DD)
- `end_date` (date): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": 1,
                "visit_date": "2025-08-24",
                "activity_type": "recce",
                "product_type": "Gold",
                "state": "Maharashtra",
                "district": "Mumbai",
                "sub_district": "Andheri",
                "village": "Andheri East",
                "village_code": "MH001",
                "location": "Near Metro Station",
                "landmark": "Metro Station Gate 2",
                "latitude": 19.1075,
                "longitude": 72.8263,
                "remarks": "Good location for activity",
                "close_shot1": "storage/activities/photo1.jpg",
                "close_shot_2": "storage/activities/photo2.jpg",
                "long_shot_1": "storage/activities/photo3.jpg",
                "long_shot_2": "storage/activities/photo4.jpg",
                "status": "completed",
                "created_at": "2025-08-24T10:30:00Z",
                "promoter": {
                    "id": 1,
                    "name": "John Doe"
                },
                "route_plan": {
                    "id": 1,
                    "plan_name": "Mumbai Route Plan 1"
                }
            }
        ],
        "current_page": 1,
        "last_page": 3,
        "per_page": 15,
        "total": 45
    }
}
```

#### Create Activity
**POST** `/mobile/activities`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "local_id": "mobile_activity_001",
    "visit_date": "2025-08-24",
    "plan_id": 1,
    "device_id": "device123",
    "activity_type": "recce",
    "product_type": "Gold",
    "state": "Maharashtra",
    "district": "Mumbai",
    "sub_district": "Andheri",
    "village": "Andheri East",
    "village_code": "MH001",
    "location": "Near Metro Station",
    "landmark": "Metro Station Gate 2",
    "latitude": 19.1075,
    "longitude": 72.8263,
    "remarks": "Good location for activity",
    "close_shot1": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/close-shot-1.jpg",
    "close_shot_2": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/close-shot-2.jpg",
    "long_shot_1": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/long-shot-1.jpg",
    "long_shot_2": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/long-shot-2.jpg"
}
```

**Response (Success):**
```json
{
    "success": true,
    "message": "Activity created successfully",
    "local_id": "mobile_activity_001",
    "server_id": 123,
    "data": {
        "id": 123,
        "visit_date": "2025-08-24",
        "device_id": "device123",
        "activity_type": "recce",
        "product_type": "Gold",
        "state": "Maharashtra",
        "district": "Mumbai",
        "sub_district": "Andheri",
        "village": "Andheri East",
        "location": "Near Metro Station",
        "landmark": "Metro Station Gate 2",
        "status": "pending",
        "close_shot1": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/close-shot-1.jpg",
        "close_shot_2": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/close-shot-2.jpg",
        "long_shot_1": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/long-shot-1.jpg",
        "long_shot_2": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/long-shot-2.jpg",
        "created_at": "2025-08-24T10:30:00Z"
    }
}
```

**Response (Error):**
```json
{
    "success": false,
    "message": "Failed to create activity: Validation error",
    "local_id": "mobile_activity_001",
    "server_id": null
}
```

#### Bulk Create Activities
**POST** `/mobile/activities/bulk`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "activities": [
        {
            "local_id": "mobile_activity_001",
            "plan_id": 1,
            "device_id": "device123",
            "state": "Maharashtra",
            "district": "Mumbai",
            "sub_district": "Andheri",
            "village": "Andheri East",
            "product_type": "Gold",
            "location": "Location 1",
            "landmark": "Near Station",
            "latitude": 19.1075,
            "longitude": 72.8263,
            "remarks": "Good location",
            "close_shot1": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/close1.jpg",
            "long_shot_1": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/long1.jpg"
        },
        {
            "local_id": "mobile_activity_002",
            "plan_id": 1,
            "device_id": "device123",
            "state": "Maharashtra",
            "district": "Mumbai",
            "sub_district": "Andheri",
            "village": "Andheri West",
            "product_type": "Silver",
            "location": "Location 2",
            "latitude": 19.1076,
            "longitude": 72.8264,
            "close_shot1": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/close2.jpg",
            "long_shot_2": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/long2.jpg"
        }
    ]
}
```

**Response (All Success - HTTP 201):**
```json
{
    "success": true,
    "message": "All 2 activities created successfully",
    "data": {
        "total_count": 2,
        "success_count": 2,
        "error_count": 0,
        "results": [
            {
                "local_id": "mobile_activity_001",
                "server_id": 123,
                "index": 0,
                "status": "success",
                "message": "Activity created successfully"
            },
            {
                "local_id": "mobile_activity_002",
                "server_id": 124,
                "index": 1,
                "status": "success",
                "message": "Activity created successfully"
            }
        ]
    }
}
```

**Response (Partial Success - HTTP 207):**
```json
{
    "success": false,
    "message": "1 of 2 activities created successfully, 1 failed",
    "data": {
        "total_count": 2,
        "success_count": 1,
        "error_count": 1,
        "results": [
            {
                "local_id": "mobile_activity_001",
                "server_id": 123,
                "index": 0,
                "status": "success",
                "message": "Activity created successfully"
            },
            {
                "local_id": "mobile_activity_002",
                "server_id": null,
                "index": 1,
                "status": "error",
                "message": "Failed to create activity: Plan not found"
            }
        ]
    }
}
```

#### Create Activity with Bulk Images
**POST** `/mobile/activities/with-images`

**Headers:** `Authorization: Bearer {token}`

**Request (multipart/form-data):**
```
visit_date: "2025-08-24"
plan_id: 1
device_id: "device123"
activity_type: "recce"
product_type: "Gold"
state: "Maharashtra"
district: "Mumbai"
sub_district: "Andheri"
village: "Andheri East"
village_code: "MH001"
location: "Near Metro Station"
landmark: "Metro Station Gate 2"
latitude: 19.1075
longitude: 72.8263
remarks: "Good location for activity"
close_shot1: [image file]
close_shot_2: [image file]
long_shot_1: [image file]
long_shot_2: [image file]
```

**Response:**
```json
{
    "success": true,
    "message": "Activity created successfully with images",
    "data": {
        "activity": {
            "id": 123,
            "visit_date": "2025-08-24",
            "activity_type": "recce",
            "product_type": "Gold",
            "location": "Near Metro Station",
            "status": "pending",
            "close_shot1": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/close-shot-1.jpg",
            "close_shot_2": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/close-shot-2.jpg",
            "long_shot_1": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/long-shot-1.jpg",
            "long_shot_2": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/long-shot-2.jpg",
            "created_at": "2025-08-24T10:30:00Z"
        },
        "uploaded_images": {
            "close_shot1": {
                "url": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/close-shot-1.jpg",
                "size": 1024576
            },
            "close_shot_2": {
                "url": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/close-shot-2.jpg",
                "size": 1536576
            },
            "long_shot_1": {
                "url": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/long-shot-1.jpg",
                "size": 2048576
            },
            "long_shot_2": {
                "url": "https://your-bucket.s3.amazonaws.com/activities/2025/08/25/long-shot-2.jpg",
                "size": 1800576
            }
        }
    }
}
```

---

## Admin Panel Endpoints

### 🔐 Admin Authentication

#### Admin Login
**POST** `/auth/login`

**Request:**
```json
{
    "email": "admin@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com",
            "roles": ["admin"],
            "permissions": ["users.view", "users.create", "activities.view"]
        },
        "token": "2|xyz9876543210abc...",
        "token_type": "Bearer"
    }
}
```

#### Get User Profile
**GET** `/auth/profile`

**Headers:** `Authorization: Bearer {token}`

#### Check Permission
**POST** `/auth/check-permission`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "permission": "users.create"
}
```

**Response:**
```json
{
    "success": true,
    "has_permission": true
}
```

#### Get Accessible Menus
**GET** `/auth/accessible-menus`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
    "success": true,
    "menus": [
        {
            "name": "Dashboard",
            "path": "/dashboard",
            "icon": "dashboard",
            "permissions": ["dashboard.view"]
        },
        {
            "name": "Users",
            "path": "/users",
            "icon": "users",
            "permissions": ["users.view"]
        }
    ]
}
```

---

### 👥 Promoter Management

#### Get Promoters
**GET** `/promoters`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (int): Page number
- `search` (string): Search term
- `status` (string): active, inactive
- `state` (string): Filter by state
- `district` (string): Filter by district

#### Create Promoter
**POST** `/promoters`

**Request:**
```json
{
    "name": "New Promoter",
    "username": "newpromoter",
    "email": "promoter@example.com",
    "phone": "+91-9876543210",
    "password": "password123",
    "state": "Maharashtra",
    "district": "Mumbai",
    "sub_district": "Andheri",
    "village": "Andheri East",
    "is_active": true
}
```

#### Import Promoters
**POST** `/promoters/import`

**Request (multipart/form-data):**
```
file: promoters.csv
```

#### Export Promoters
**GET** `/promoters/export`

**Query Parameters:**
- `format` (string): csv, excel
- `filters` (object): Export filters

---

### 📋 Activity Management

#### Get Activities
**GET** `/activity-recces`

**Headers:** `Authorization: Bearer {token}`

#### Create Activity
**POST** `/activity-recces`

#### Get Dashboard Stats
**GET** `/activity-recces/dashboard-stats`

**Response:**
```json
{
    "success": true,
    "data": {
        "total_activities": 150,
        "pending_activities": 25,
        "completed_activities": 120,
        "cancelled_activities": 5,
        "activities_this_month": 45,
        "activities_by_status": {
            "pending": 25,
            "completed": 120,
            "cancelled": 5
        },
        "activities_by_type": {
            "recce": 80,
            "visit": 50,
            "survey": 20
        }
    }
}
```

---

### 🗺️ Route Plan Management

#### Get Route Plans
**GET** `/route-plans`

#### Create Route Plan
**POST** `/route-plans`

#### Get Filter Options
**GET** `/route-plans/filter-options`

**Response:**
```json
{
    "success": true,
    "data": {
        "states": ["Maharashtra", "Gujarat", "Karnataka"],
        "districts": ["Mumbai", "Pune", "Ahmedabad"],
        "statuses": ["active", "inactive", "completed"]
    }
}
```

#### Import Route Plans
**POST** `/route-plans/import`

---

### 👑 Role & Permission Management

#### Get Roles
**GET** `/roles`

#### Create Role
**POST** `/roles`

**Request:**
```json
{
    "name": "Content Manager",
    "description": "Manages content and activities",
    "permissions": [1, 2, 3, 4]
}
```

#### Get Permissions
**GET** `/permissions`

#### Get Permissions by Module
**GET** `/permissions-by-module`

**Response:**
```json
{
    "success": true,
    "data": {
        "users": [
            {"id": 1, "name": "users.view", "description": "View users"},
            {"id": 2, "name": "users.create", "description": "Create users"}
        ],
        "activities": [
            {"id": 3, "name": "activities.view", "description": "View activities"},
            {"id": 4, "name": "activities.create", "description": "Create activities"}
        ]
    }
}
```

---

## Error Responses

### Validation Errors (422)
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

### Authentication Errors (401)
```json
{
    "success": false,
    "message": "Unauthenticated"
}
```

### Authorization Errors (403)
```json
{
    "success": false,
    "message": "This action is unauthorized"
}
```

### Not Found Errors (404)
```json
{
    "success": false,
    "message": "Resource not found"
}
```

### Server Errors (500)
```json
{
    "success": false,
    "message": "An error occurred while processing your request"
}
```

---

## Data Models

### Promoter Model
```json
{
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
    "is_logged_in": false,
    "last_login_at": "2025-08-24T10:30:00Z",
    "profile_image": "storage/promoters/profile.jpg",
    "created_at": "2025-08-24T10:30:00Z",
    "updated_at": "2025-08-24T10:30:00Z"
}
```

### Activity Model
```json
{
    "id": 1,
    "visit_date": "2025-08-24",
    "promoter_id": 1,
    "plan_id": 1,
    "device_id": "device123",
    "activity_type": "recce",
    "product_type": "Gold",
    "state": "Maharashtra",
    "district": "Mumbai",
    "sub_district": "Andheri",
    "village": "Andheri East",
    "village_code": "MH001",
    "location": "Near Metro Station",
    "landmark": "Metro Station Gate 2",
    "latitude": 19.1075,
    "longitude": 72.8263,
    "remarks": "Good location for activity",
    "close_shot1": "storage/activities/photo1.jpg",
    "close_shot_2": "storage/activities/photo2.jpg",
    "long_shot_1": "storage/activities/photo3.jpg",
    "long_shot_2": "storage/activities/photo4.jpg",
    "status": "completed",
    "created_at": "2025-08-24T10:30:00Z",
    "updated_at": "2025-08-24T10:30:00Z"
}
```

### Route Plan Model
```json
{
    "id": 1,
    "plan_name": "Mumbai Route Plan 1",
    "state": "Maharashtra",
    "district": "Mumbai",
    "sub_district": "Andheri",
    "village": "Andheri East",
    "village_code": "MH001",
    "location": "Near Metro Station",
    "landmark": "Metro Station Gate 2",
    "latitude": 19.1075,
    "longitude": 72.8263,
    "status": "active",
    "promoter_id": 1,
    "created_at": "2025-08-24T10:30:00Z",
    "updated_at": "2025-08-24T10:30:00Z"
}
```

---

## Rate Limiting

API endpoints are rate limited:
- **Mobile endpoints**: 60 requests per minute
- **Admin endpoints**: 100 requests per minute

---

## File Upload Guidelines

### Image Upload (Base64)
For mobile apps, images should be sent as base64 encoded strings:

```json
{
    "close_shot1": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
}
```

### Supported Image Formats
- JPEG
- PNG
- WebP
- Maximum file size: 5MB per image

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Current page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)

**Response Structure:**
```json
{
    "data": [...],
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75,
    "from": 1,
    "to": 15
}
```

---

## Testing

### Test Endpoint
**GET** `/test`

**Response:**
```json
{
    "message": "API is working",
    "timestamp": "2025-08-24T10:30:00Z"
}
```

---

## Contact & Support

For API support and questions:
- **Environment**: Production API available at `https://vair.test/api`
- **Documentation Updates**: This documentation is updated with each API version
- **Version**: v1.0.0

---

*Last Updated: August 24, 2025*
