# LI Council API - Postman Collection

This Postman collection provides comprehensive testing capabilities for the LI Council API endpoints.

## Setup Instructions

### 1. Import the Collection

1. Open Postman
2. Click "Import" button
3. Select the `LI_Council_API.postman_collection.json` file
4. Import the environment file `LI_Council_Environment.postman_environment.json`

### 2. Configure Environment Variables

Set up the following environment variables in Postman:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `https://vair.test/api` |
| `mobile_base_url` | Mobile API base URL | `https://vair.test/api/mobile` |
| `auth_token` | Bearer token for authentication | `{{auth_token}}` (auto-set after login) |
| `promoter_id` | Current promoter ID | `{{promoter_id}}` (auto-set after login) |

### 3. Authentication Flow

1. **Login** - Use the "Mobile Auth > Login" request
2. **Token Auto-Storage** - The auth token will be automatically saved to environment variables
3. **Authenticated Requests** - All subsequent requests will use the stored token

## Collection Structure

### 📱 Mobile Endpoints

#### Authentication
- `POST /mobile/auth/login` - Promoter login
- `POST /mobile/auth/logout` - Logout
- `GET /mobile/auth/profile` - Get current promoter profile

#### Activities
- `GET /mobile/activities` - List activities with pagination
- `POST /mobile/activities` - Create new activity
- `GET /mobile/activities/{id}` - Get activity details
- `PUT /mobile/activities/{id}` - Update activity
- `DELETE /mobile/activities/{id}` - Delete activity

#### Route Plans
- `GET /mobile/route-plans` - List route plans
- `GET /mobile/route-plans/{id}` - Get route plan details

### 🔐 Admin Endpoints

#### Authentication
- `POST /auth/login` - Admin login
- `POST /auth/logout` - Admin logout
- `GET /auth/profile` - Get admin profile

#### Promoter Management
- `GET /promoters` - List all promoters
- `POST /promoters` - Create new promoter
- `GET /promoters/{id}` - Get promoter details
- `PUT /promoters/{id}` - Update promoter
- `DELETE /promoters/{id}` - Delete promoter

#### Activity Management
- `GET /activity-recces` - List all activities
- `POST /activity-recces` - Create activity
- `GET /activity-recces/{id}` - Get activity details
- `PUT /activity-recces/{id}` - Update activity
- `DELETE /activity-recces/{id}` - Delete activity

#### Route Plan Management
- `GET /route-plans` - List route plans
- `POST /route-plans` - Create route plan
- `GET /route-plans/{id}` - Get route plan details
- `PUT /route-plans/{id}` - Update route plan
- `DELETE /route-plans/{id}` - Delete route plan
- `POST /route-plans/import` - Import route plans from CSV

## Pre-request Scripts

### Auto-Authentication
```javascript
// This script runs before each request
const token = pm.environment.get("auth_token");
if (token && !pm.request.url.toString().includes('/login')) {
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + token
    });
}
```

### CSRF Token Management
```javascript
// For admin endpoints that require CSRF
const csrfToken = pm.environment.get("csrf_token");
if (csrfToken && pm.request.url.toString().includes('/api/')) {
    pm.request.headers.add({
        key: 'X-CSRF-TOKEN',
        value: csrfToken
    });
}
```

## Test Scripts

### Login Response Handler
```javascript
// Auto-save auth token after successful login
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    
    const responseJson = pm.response.json();
    if (responseJson.success && responseJson.data.token) {
        pm.environment.set("auth_token", responseJson.data.token);
        pm.environment.set("promoter_id", responseJson.data.promoter.id);
        console.log("Auth token saved:", responseJson.data.token);
    }
});
```

### Standard Response Validation
```javascript
// Common response validation
pm.test("Response has success field", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('success');
});

pm.test("Response time is less than 5 seconds", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});
```

### Activity Creation Test
```javascript
pm.test("Activity created successfully", function () {
    pm.response.to.have.status(201);
    
    const responseJson = pm.response.json();
    pm.expect(responseJson.success).to.be.true;
    pm.expect(responseJson.data).to.have.property('id');
    
    // Save activity ID for subsequent tests
    pm.environment.set("last_activity_id", responseJson.data.id);
});
```

## Sample Request Bodies

### Mobile Login
```json
{
    "username": "promoter1",
    "password": "password123"
}
```

### Create Activity
```json
{
    "visit_date": "2024-01-15",
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

### Create Promoter (Admin)
```json
{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+91-9876543210",
    "state": "Karnataka",
    "district": "Bangalore Urban",
    "sub_district": "Bangalore North",
    "village": "Hebbal",
    "is_active": true
}
```

### Route Plan Import
```csv
plan_name,state,district,sub_district,village,village_code,location,landmark,latitude,longitude
"North Zone Plan","Karnataka","Bangalore Urban","Bangalore North","Hebbal","KA001","Hebbal Lake Area","Near Metro",13.0358,77.5970
"South Zone Plan","Karnataka","Bangalore Urban","Bangalore South","Jayanagar","KA002","Jayanagar 4th Block","Near Mall",12.9279,77.5937
```

## Error Handling Examples

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

### Server Error (500)
```json
{
    "success": false,
    "message": "Server Error"
}
```

## Testing Workflows

### 1. Mobile App Flow
1. **Login** as promoter
2. **Get Profile** to verify authentication
3. **List Activities** to see existing data
4. **Create Activity** with all required fields
5. **Get Activity** details to verify creation
6. **Update Activity** to test modification
7. **List Route Plans** to see available plans

### 2. Admin Panel Flow
1. **Login** as admin
2. **List Promoters** to see all users
3. **Create Promoter** with valid data
4. **List Activities** to see all activities
5. **Import Route Plans** from CSV
6. **Assign Route Plan** to promoter

### 3. Data Validation Flow
1. **Invalid Login** - test with wrong credentials
2. **Missing Fields** - test activity creation without required fields
3. **Invalid Data Types** - test with wrong data formats
4. **Unauthorized Access** - test endpoints without authentication

## Performance Testing

### Load Testing Scenarios
- **Concurrent Logins** - Multiple promoters logging in simultaneously
- **Bulk Activity Creation** - Creating multiple activities in sequence
- **Large Image Uploads** - Testing with high-resolution images
- **Pagination Stress** - Loading large datasets with pagination

### Monitoring Points
- Response times under 2 seconds for standard requests
- Response times under 10 seconds for image uploads
- Successful handling of 100+ concurrent requests
- Proper error responses under high load

## Security Testing

### Authentication Tests
- **Token Expiry** - Test with expired tokens
- **Invalid Tokens** - Test with malformed tokens
- **Cross-User Access** - Attempt to access other users' data
- **Rate Limiting** - Test API rate limits

### Data Validation Tests
- **SQL Injection** - Test with SQL injection patterns
- **XSS Prevention** - Test with script injection
- **File Upload Security** - Test with malicious files
- **Input Sanitization** - Test with special characters

---

## Quick Start Commands

### Using Newman (Postman CLI)
```bash
# Install Newman
npm install -g newman

# Run the collection
newman run LI_Council_API.postman_collection.json \
  -e LI_Council_Environment.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export results.html

# Run with specific folder
newman run LI_Council_API.postman_collection.json \
  -e LI_Council_Environment.postman_environment.json \
  --folder "Mobile Endpoints"
```

### Environment Setup
```bash
# Set environment variables
export BASE_URL="https://vair.test/api"
export MOBILE_BASE_URL="https://vair.test/api/mobile"

# Run tests with environment
newman run collection.json \
  --env-var "base_url=$BASE_URL" \
  --env-var "mobile_base_url=$MOBILE_BASE_URL"
```

---

*This collection is maintained alongside the API documentation. For the latest updates, refer to the [API Documentation](../API_DOCUMENTATION.md) and [OpenAPI Specification](../openapi.yaml).*
