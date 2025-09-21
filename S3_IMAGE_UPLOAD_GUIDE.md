# S3 Image Upload Implementation Guide

## Overview
This implementation provides a complete AWS S3-based image upload system for the Li-Council Laravel application, replacing the previous base64 encoding approach. The system includes both standalone image upload endpoints and integrated activity creation with images.

## Architecture Components

### 1. Controllers
- **ImageUploadController**: Handles standalone image upload/delete operations
- **ActivityController**: Manages activity creation with S3 image support  
- **AuthController**: Enhanced with profile image upload capabilities

### 2. API Endpoints

#### Image Upload Endpoints
```
POST /api/mobile/upload-image          - Upload single image
POST /api/mobile/upload-images         - Upload multiple images (max 5)
DELETE /api/mobile/delete-image        - Delete image from S3
```

#### Activity Endpoints
```
GET /api/mobile/activities             - List user activities
POST /api/mobile/activities            - Create activity with S3 URLs
POST /api/mobile/activities/with-images - Create activity with direct image upload
```

#### Profile Endpoints
```
PUT /api/mobile/auth/profile           - Update profile with S3 URL
POST /api/mobile/auth/profile/with-image - Update profile with image upload
```

## Implementation Details

### File Structure
```
app/Http/Controllers/Api/Mobile/
├── ImageUploadController.php      - S3 upload operations
└── ActivityController.php         - Activity management with images

app/Http/Controllers/Auth/
└── AuthController.php             - Enhanced with image upload
```

### Image Upload Flow

#### Option 1: Two-Step Process (Recommended)
1. Frontend uploads image to `/api/mobile/upload-image`
2. Receives S3 URL in response
3. Uses S3 URL in subsequent API calls (activities, profile)

#### Option 2: Single-Step Process
1. Frontend sends multipart form data to specialized endpoints
2. Backend handles both image upload and record creation

### S3 Configuration

#### Required Environment Variables
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
FILESYSTEM_DISK=s3
```

#### S3 Folder Structure
```
your-bucket/
├── activities/2025/08/25/          - Activity images by date
├── profiles/2025/08/25/            - Profile images by date
└── documents/2025/08/25/           - Document uploads by date
```

### Security Features

#### File Validation
- **Image Types**: jpeg, png, jpg, gif only
- **File Size**: 10MB max for activities, 5MB max for profiles  
- **Folder Restrictions**: Only activities, profiles, documents allowed

#### Access Control
- All endpoints require `auth:sanctum` authentication
- Users can only access their own activities
- Automatic cleanup of old profile images on update

## Usage Examples

### Upload Single Image
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('folder', 'activities');

const response = await fetch('/api/mobile/upload-image', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
    },
    body: formData
});

const result = await response.json();
// result.data.url contains the S3 URL
```

### Create Activity with S3 URLs
```javascript
const activityData = {
    plan_id: 1,
    location: "Sample Location",
    latitude: 12.9716,
    longitude: 77.5946,
    close_shot1: "https://bucket.s3.region.amazonaws.com/activities/2025/08/25/image1.jpg",
    close_shot_2: "https://bucket.s3.region.amazonaws.com/activities/2025/08/25/image2.jpg",
    long_shot_1: "https://bucket.s3.region.amazonaws.com/activities/2025/08/25/image3.jpg",
    long_shot_2: "https://bucket.s3.region.amazonaws.com/activities/2025/08/25/image4.jpg"
};

const response = await fetch('/api/mobile/activities', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(activityData)
});
```

### Create Activity with Direct Image Upload
```javascript
const formData = new FormData();
formData.append('plan_id', '1');
formData.append('location', 'Sample Location');
formData.append('latitude', '12.9716');
formData.append('longitude', '77.5946');
formData.append('close_shot1', imageFile1);
formData.append('close_shot_2', imageFile2);
formData.append('long_shot_1', imageFile3);
formData.append('long_shot_2', imageFile4);

const response = await fetch('/api/mobile/activities/with-images', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
    },
    body: formData
});
```

## Error Handling

### Common Error Responses
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "image": ["The image must be an image file."]
    }
}
```

### S3 Upload Failures
```json
{
    "success": false,
    "message": "Failed to upload image: S3 connection error"
}
```

## Performance Benefits

### Compared to Base64 Encoding
- **Reduced API Payload**: 75% smaller request sizes
- **Faster Uploads**: Direct S3 upload bypasses Laravel processing
- **Better Caching**: S3 URLs enable CDN and browser caching
- **Scalability**: Reduces server storage and bandwidth usage

### Image Optimization Recommendations
- Use WebP format when supported
- Implement client-side compression before upload
- Consider progressive JPEG for large images
- Set appropriate S3 cache headers

## Monitoring and Maintenance

### API Logging
All image upload operations are logged via the ApiRequestLogger middleware:
- Upload success/failure rates
- File size distributions
- Error tracking
- Performance monitoring

### S3 Lifecycle Management
Consider implementing S3 lifecycle policies:
- Move old images to cheaper storage classes
- Automatic deletion of orphaned images
- Regular cleanup of failed uploads

## Migration Notes

### From Base64 to S3 URLs
1. Existing base64 fields can coexist with S3 URLs
2. Gradual migration by detecting URL vs base64 format
3. Background job to migrate existing base64 images to S3

### Database Schema
No schema changes required - existing text fields can store S3 URLs directly.

## Testing

### Unit Tests
```bash
php artisan test --filter ImageUploadTest
php artisan test --filter ActivityControllerTest
```

### Manual Testing
```bash
# Test image upload
curl -X POST /api/mobile/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-image.jpg" \
  -F "folder=activities"

# Test activity creation
curl -X POST /api/mobile/activities/with-images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "plan_id=1" \
  -F "location=Test Location" \
  -F "latitude=12.9716" \
  -F "longitude=77.5946" \
  -F "close_shot1=@image1.jpg"
```

## Troubleshooting

### Common Issues
1. **S3 Permissions**: Ensure IAM user has `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` permissions
2. **CORS Configuration**: Configure S3 bucket CORS for direct frontend uploads
3. **File Size Limits**: Check both Laravel and web server upload limits
4. **Memory Usage**: Monitor PHP memory usage during large file uploads

### Debug Mode
Enable detailed S3 error logging in `config/logging.php`:
```php
'channels' => [
    's3' => [
        'driver' => 'single',
        'path' => storage_path('logs/s3.log'),
        'level' => 'debug',
    ],
],
```

This implementation provides a robust, scalable image upload system that significantly improves performance and user experience compared to the previous base64 approach.
