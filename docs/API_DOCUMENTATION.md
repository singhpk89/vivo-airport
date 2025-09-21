# LI Council API Documentation

## Overview
The LI Council API provides comprehensive endpoints for managing field activities, promoter data, and route plans. This documentation covers both mobile-specific endpoints and admin panel functionality.

**Base URLs:**
- **Mobile API**: `https://vair.test/api/mobile`
- **Admin API**: `https://vair.test/api`

**Authentication:** Bearer Token (Laravel Sanctum)

## 📱 Mobile Endpoints

### Authentication

#### POST /mobile/auth/login
Authenticate a promoter and receive access token.

**Request:**
```json
{
    "username": "promoter1",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "promoter": {
            "id": 1,
            "name": "John Doe",
            "username": "promoter1",
            "email": "john@example.com",
            "phone": "+91-9876543210",
            "state": "Karnataka",
            "district": "Bangalore Urban",
            "sub_district": "Bangalore North",
            "village": "Hebbal",
            "is_active": true,
            "is_logged_in": true,
            "profile_image": null,
            "last_login_at": "2024-01-15T10:30:00.000000Z",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-15T10:30:00.000000Z"
        },
        "token": "1|eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "token_type": "Bearer"
    },
    "message": "Login successful"
}
```

#### POST /mobile/auth/logout
Logout current promoter and invalidate token.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

#### GET /mobile/auth/profile
Get current promoter profile information.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "username": "promoter1",
        "email": "john@example.com",
        "phone": "+91-9876543210",
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "sub_district": "Bangalore North",
        "village": "Hebbal",
        "is_active": true,
        "is_logged_in": true,
        "profile_image": null,
        "last_login_at": "2024-01-15T10:30:00.000000Z",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z"
    }
}
```

### Activities Management

#### GET /mobile/activities
List activities for authenticated promoter with pagination.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 15)
- `activity_type` (optional): Filter by type (recce, visit, survey)
- `status` (optional): Filter by status (pending, completed, cancelled)
- `search` (optional): Search in location, village, remarks

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "visit_date": "2024-01-15",
            "promoter_id": 1,
            "plan_id": 1,
            "device_id": "DEVICE123",
            "activity_type": "recce",
            "product_type": "Grey",
            "state": "Karnataka",
            "district": "Bangalore Urban",
            "sub_district": "Bangalore North",
            "village": "Hebbal",
            "village_code": "KA001",
            "location": "Near Hebbal Lake",
            "landmark": "Opposite Metro Station",
            "latitude": 13.0358,
            "longitude": 77.5970,
            "remarks": "Good location for survey",
            "close_shot1": "storage/images/close1_123.jpg",
            "close_shot_2": "storage/images/close2_123.jpg",
            "far_shot": "storage/images/far_123.jpg",
            "status": "completed",
            "created_at": "2024-01-15T10:30:00.000000Z",
            "updated_at": "2024-01-15T10:30:00.000000Z",
            "promoter": {
                "id": 1,
                "name": "John Doe",
                "username": "promoter1"
            },
            "route_plan": {
                "id": 1,
                "plan_name": "North Zone Plan",
                "state": "Karnataka"
            }
        }
    ],
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 67
}
```

#### POST /mobile/activities
Create a new activity.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "visit_date": "2024-01-15",
    "plan_id": 1,
    "device_id": "DEVICE123",
    "activity_type": "recce",
    "product_type": "Grey",
    "state": "Karnataka",
    "district": "Bangalore Urban",
    "sub_district": "Bangalore North",
    "village": "Hebbal",
    "village_code": "KA001",
    "location": "Near Hebbal Lake",
    "landmark": "Opposite Metro Station",
    "latitude": 13.0358,
    "longitude": 77.5970,
    "remarks": "Good location for survey",
    "close_shot1": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "close_shot_2": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "far_shot": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response (201):**
```json
{
    "success": true,
    "data": {
        "id": 15,
        "visit_date": "2024-01-15",
        "promoter_id": 1,
        "plan_id": 1,
        "device_id": "DEVICE123",
        "activity_type": "recce",
        "product_type": "Grey",
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "sub_district": "Bangalore North",
        "village": "Hebbal",
        "village_code": "KA001",
        "location": "Near Hebbal Lake",
        "landmark": "Opposite Metro Station",
        "latitude": 13.0358,
        "longitude": 77.5970,
        "remarks": "Good location for survey",
        "close_shot1": "storage/images/close1_456.jpg",
        "close_shot_2": "storage/images/close2_456.jpg",
        "far_shot": "storage/images/far_456.jpg",
        "status": "pending",
        "created_at": "2024-01-15T14:20:00.000000Z",
        "updated_at": "2024-01-15T14:20:00.000000Z"
    },
    "message": "Activity created successfully"
}
```

#### POST /mobile/activities/bulk
Create multiple activities at once (Bulk Add Recce).

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "activities": [
        {
            "visit_date": "2024-01-15",
            "plan_id": 1,
            "device_id": "DEVICE123",
            "activity_type": "recce",
            "product_type": "Grey",
            "state": "Karnataka",
            "district": "Bangalore Urban",
            "sub_district": "Bangalore North",
            "village": "Hebbal",
            "village_code": "KA001",
            "location": "Near Hebbal Lake",
            "landmark": "Opposite Metro Station",
            "latitude": 13.0358,
            "longitude": 77.5970,
            "remarks": "Location 1",
            "close_shot1": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
            "close_shot_2": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
            "far_shot": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
        },
        {
            "visit_date": "2024-01-15",
            "plan_id": 1,
            "device_id": "DEVICE123",
            "activity_type": "recce",
            "product_type": "Gold",
            "state": "Karnataka",
            "district": "Bangalore Urban",
            "sub_district": "Bangalore North",
            "village": "Banaswadi",
            "village_code": "KA002",
            "location": "Near Bus Stand",
            "landmark": "Opposite Bank",
            "latitude": 13.0150,
            "longitude": 77.6040,
            "remarks": "Location 2",
            "close_shot1": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
            "close_shot_2": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
            "far_shot": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
        }
    ]
}
```

**Response (201):**
```json
{
    "success": true,
    "data": {
        "created_count": 2,
        "failed_count": 0,
        "activities": [
            {
                "id": 16,
                "visit_date": "2024-01-15",
                "promoter_id": 1,
                "activity_type": "recce",
                "product_type": "Grey",
                "location": "Near Hebbal Lake",
                "status": "pending",
                "created_at": "2024-01-15T14:25:00.000000Z"
            },
            {
                "id": 17,
                "visit_date": "2024-01-15",
                "promoter_id": 1,
                "activity_type": "recce",
                "product_type": "Gold",
                "location": "Near Bus Stand",
                "status": "pending",
                "created_at": "2024-01-15T14:25:00.000000Z"
            }
        ],
        "errors": []
    },
    "message": "Bulk activities created successfully"
}
```

#### GET /mobile/activities/{id}
Get specific activity details.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "visit_date": "2024-01-15",
        "promoter_id": 1,
        "plan_id": 1,
        "device_id": "DEVICE123",
        "activity_type": "recce",
        "product_type": "Grey",
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "sub_district": "Bangalore North",
        "village": "Hebbal",
        "village_code": "KA001",
        "location": "Near Hebbal Lake",
        "landmark": "Opposite Metro Station",
        "latitude": 13.0358,
        "longitude": 77.5970,
        "remarks": "Good location for survey",
        "close_shot1": "storage/images/close1_123.jpg",
        "close_shot_2": "storage/images/close2_123.jpg",
        "far_shot": "storage/images/far_123.jpg",
        "status": "completed",
        "created_at": "2024-01-15T10:30:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z",
        "promoter": {
            "id": 1,
            "name": "John Doe",
            "username": "promoter1",
            "email": "john@example.com",
            "phone": "+91-9876543210"
        },
        "route_plan": {
            "id": 1,
            "plan_name": "North Zone Plan",
            "state": "Karnataka",
            "district": "Bangalore Urban",
            "location": "Hebbal Area"
        }
    }
}
```

#### PUT /mobile/activities/{id}
Update an existing activity.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "remarks": "Updated remarks for this activity",
    "status": "completed",
    "latitude": 13.0360,
    "longitude": 77.5975
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "visit_date": "2024-01-15",
        "promoter_id": 1,
        "plan_id": 1,
        "activity_type": "recce",
        "product_type": "Grey",
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "location": "Near Hebbal Lake",
        "remarks": "Updated remarks for this activity",
        "status": "completed",
        "latitude": 13.0360,
        "longitude": 77.5975,
        "updated_at": "2024-01-15T15:45:00.000000Z"
    },
    "message": "Activity updated successfully"
}
```

#### DELETE /mobile/activities/{id}
Delete an activity.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
    "success": true,
    "message": "Activity deleted successfully"
}
```

### Recce-Specific Endpoints

#### GET /mobile/recces
Get recce activities specifically (alias for activities with recce filter).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (optional): Page number
- `per_page` (optional): Items per page
- `status` (optional): Filter by status
- `product_type` (optional): Filter by product type
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "visit_date": "2024-01-15",
            "activity_type": "recce",
            "product_type": "Grey",
            "location": "Near Hebbal Lake",
            "village": "Hebbal",
            "status": "completed",
            "created_at": "2024-01-15T10:30:00.000000Z"
        }
    ],
    "summary": {
        "total_recces": 25,
        "completed": 18,
        "pending": 7,
        "cancelled": 0
    }
}
```

#### POST /mobile/recces/bulk-quick
Quick bulk creation for recce activities with minimal data.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "visit_date": "2024-01-15",
    "plan_id": 1,
    "device_id": "DEVICE123",
    "locations": [
        {
            "location": "Near Hebbal Lake",
            "village": "Hebbal",
            "village_code": "KA001",
            "latitude": 13.0358,
            "longitude": 77.5970,
            "product_type": "Grey",
            "remarks": "Quick recce location 1"
        },
        {
            "location": "Bus Stand Area",
            "village": "Banaswadi",
            "village_code": "KA002",
            "latitude": 13.0150,
            "longitude": 77.6040,
            "product_type": "Gold",
            "remarks": "Quick recce location 2"
        }
    ]
}
```

**Response (201):**
```json
{
    "success": true,
    "data": {
        "created_count": 2,
        "recce_ids": [18, 19],
        "batch_id": "BATCH_20240115_142530"
    },
    "message": "Quick bulk recces created successfully"
}
```

### Route Plans

#### GET /mobile/route-plans
List route plans assigned to authenticated promoter.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (optional): Page number
- `status` (optional): Filter by status (active, inactive, completed)

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "plan_name": "North Zone Plan",
            "state": "Karnataka",
            "district": "Bangalore Urban",
            "sub_district": "Bangalore North",
            "village": "Hebbal",
            "village_code": "KA001",
            "location": "Hebbal Lake Area",
            "landmark": "Near Metro Station",
            "latitude": 13.0358,
            "longitude": 77.5970,
            "status": "active",
            "promoter_id": 1,
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-15T10:00:00.000000Z"
        }
    ],
    "current_page": 1,
    "last_page": 2,
    "total": 8
}
```

#### GET /mobile/route-plans/{id}
Get specific route plan details.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "plan_name": "North Zone Plan",
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "sub_district": "Bangalore North",
        "village": "Hebbal",
        "village_code": "KA001",
        "location": "Hebbal Lake Area",
        "landmark": "Near Metro Station",
        "latitude": 13.0358,
        "longitude": 77.5970,
        "status": "active",
        "promoter_id": 1,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-15T10:00:00.000000Z",
        "activities_count": 5,
        "completed_activities": 3
    }
}
```

## 🔐 Admin Endpoints

### Authentication

#### POST /auth/login
Admin user authentication.

**Request:**
```json
{
    "email": "admin@example.com",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com",
            "created_at": "2024-01-01T00:00:00.000000Z"
        },
        "token": "1|eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "token_type": "Bearer"
    }
}
```

### Promoter Management

#### GET /promoters
List all promoters with pagination.

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**
- `page` (optional): Page number
- `search` (optional): Search in name, username, email
- `is_active` (optional): Filter by active status
- `state` (optional): Filter by state
- `district` (optional): Filter by district

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "username": "promoter1",
            "email": "john@example.com",
            "phone": "+91-9876543210",
            "state": "Karnataka",
            "district": "Bangalore Urban",
            "sub_district": "Bangalore North",
            "village": "Hebbal",
            "is_active": true,
            "is_logged_in": false,
            "last_login_at": "2024-01-15T10:30:00.000000Z",
            "activities_count": 25,
            "created_at": "2024-01-01T00:00:00.000000Z"
        }
    ],
    "current_page": 1,
    "last_page": 10,
    "total": 150
}
```

#### POST /promoters
Create a new promoter.

**Headers:** `Authorization: Bearer {admin_token}`

**Request:**
```json
{
    "name": "Jane Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "password": "password123",
    "phone": "+91-9876543211",
    "state": "Karnataka",
    "district": "Bangalore Urban",
    "sub_district": "Bangalore South",
    "village": "Jayanagar",
    "is_active": true
}
```

**Response (201):**
```json
{
    "success": true,
    "data": {
        "id": 2,
        "name": "Jane Smith",
        "username": "janesmith",
        "email": "jane@example.com",
        "phone": "+91-9876543211",
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "sub_district": "Bangalore South",
        "village": "Jayanagar",
        "is_active": true,
        "is_logged_in": false,
        "created_at": "2024-01-15T16:00:00.000000Z",
        "updated_at": "2024-01-15T16:00:00.000000Z"
    },
    "message": "Promoter created successfully"
}
```

### Activity Management (Admin)

#### GET /activity-recces
List all activities across all promoters.

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**
- `page` (optional): Page number
- `promoter_id` (optional): Filter by promoter
- `activity_type` (optional): Filter by type
- `status` (optional): Filter by status
- `state` (optional): Filter by state
- `district` (optional): Filter by district
- `date_from` (optional): Filter from date
- `date_to` (optional): Filter to date

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "visit_date": "2024-01-15",
            "promoter_id": 1,
            "activity_type": "recce",
            "product_type": "Grey",
            "location": "Near Hebbal Lake",
            "village": "Hebbal",
            "status": "completed",
            "created_at": "2024-01-15T10:30:00.000000Z",
            "promoter": {
                "id": 1,
                "name": "John Doe",
                "username": "promoter1"
            }
        }
    ],
    "statistics": {
        "total_activities": 250,
        "completed": 180,
        "pending": 65,
        "cancelled": 5,
        "by_type": {
            "recce": 150,
            "visit": 80,
            "survey": 20
        }
    }
}
```

### Route Plan Management (Admin)

#### GET /route-plans
List all route plans.

**Headers:** `Authorization: Bearer {admin_token}`

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "plan_name": "North Zone Plan",
            "state": "Karnataka",
            "district": "Bangalore Urban",
            "status": "active",
            "promoter_id": 1,
            "promoter": {
                "name": "John Doe",
                "username": "promoter1"
            },
            "activities_count": 5,
            "created_at": "2024-01-01T00:00:00.000000Z"
        }
    ]
}
```

#### POST /route-plans/import
Import route plans from CSV file.

**Headers:** `Authorization: Bearer {admin_token}`

**Request (multipart/form-data):**
- `csv_file`: CSV file with route plan data

**CSV Format:**
```csv
plan_name,state,district,sub_district,village,village_code,location,landmark,latitude,longitude,promoter_id
North Zone Plan,Karnataka,Bangalore Urban,Bangalore North,Hebbal,KA001,Hebbal Lake Area,Near Metro,13.0358,77.5970,1
South Zone Plan,Karnataka,Bangalore Urban,Bangalore South,Jayanagar,KA002,Jayanagar 4th Block,Near Mall,12.9279,77.5937,2
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "imported_count": 2,
        "failed_count": 0,
        "errors": []
    },
    "message": "Route plans imported successfully"
}
```

## 📊 Data Models

### Activity
```json
{
    "id": 1,
    "visit_date": "2024-01-15",
    "promoter_id": 1,
    "plan_id": 1,
    "device_id": "DEVICE123",
    "activity_type": "recce|visit|survey",
    "product_type": "Grey|Gold|Pink|Brown",
    "state": "Karnataka",
    "district": "Bangalore Urban",
    "sub_district": "Bangalore North",
    "village": "Hebbal",
    "village_code": "KA001",
    "location": "Near Hebbal Lake",
    "landmark": "Opposite Metro Station",
    "latitude": 13.0358,
    "longitude": 77.5970,
    "remarks": "Good location for survey",
    "close_shot1": "storage/images/close1_123.jpg",
    "close_shot_2": "storage/images/close2_123.jpg",
    "far_shot": "storage/images/far_123.jpg",
    "status": "pending|completed|cancelled",
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
}
```

### Promoter
```json
{
    "id": 1,
    "name": "John Doe",
    "username": "promoter1",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "state": "Karnataka",
    "district": "Bangalore Urban",
    "sub_district": "Bangalore North",
    "village": "Hebbal",
    "is_active": true,
    "is_logged_in": false,
    "profile_image": null,
    "last_login_at": "2024-01-15T10:30:00.000000Z",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
}
```

### Route Plan
```json
{
    "id": 1,
    "plan_name": "North Zone Plan",
    "state": "Karnataka",
    "district": "Bangalore Urban",
    "sub_district": "Bangalore North",
    "village": "Hebbal",
    "village_code": "KA001",
    "location": "Hebbal Lake Area",
    "landmark": "Near Metro Station",
    "latitude": 13.0358,
    "longitude": 77.5970,
    "status": "active|inactive|completed",
    "promoter_id": 1,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-15T10:00:00.000000Z"
}
```

## 🚨 Error Responses

### Authentication Error (401)
```json
{
    "success": false,
    "message": "Unauthenticated."
}
```

### Validation Error (422)
```json
{
    "success": false,
    "message": "The given data was invalid.",
    "errors": {
        "state": ["The state field is required."],
        "district": ["The district field is required."],
        "location": ["The location field is required."]
    }
}
```

### Not Found Error (404)
```json
{
    "success": false,
    "message": "Activity not found."
}
```

### Server Error (500)
```json
{
    "success": false,
    "message": "Server Error"
}
```

## 🔧 Rate Limiting

- **Mobile endpoints**: 100 requests per minute per user
- **Admin endpoints**: 200 requests per minute per user
- **Bulk operations**: 10 requests per minute per user

## 📱 Mobile App Integration Notes

### Image Upload
- Images should be sent as base64 encoded strings
- Maximum file size: 5MB per image
- Supported formats: JPEG, PNG
- Recommended resolution: 1920x1080 or lower

### Location Data
- GPS coordinates are stored as decimal degrees
- Precision: 6 decimal places
- Location capture should be done when creating activities

### Offline Support
- Activities can be created offline and synced later
- Use device_id to prevent duplicate submissions
- Implement retry mechanism for failed uploads

### Authentication
- Tokens expire after 24 hours of inactivity
- Implement token refresh mechanism
- Store tokens securely using keychain/keystore

---

*For complete integration examples and mobile app development guide, see [Mobile Integration Guide](mobile-integration-guide.md)*
