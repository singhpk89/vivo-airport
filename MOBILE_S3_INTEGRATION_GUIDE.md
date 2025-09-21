# Mobile App S3 Integration Guide

## Overview
This guide explains how to integrate the mobile app with the updated S3-based image upload system for activity creation and bulk uploads.

## 🔄 Updated Workflow

### Single Activity Creation

#### Step 1: Upload Images to S3 (Optional)
If the activity has images, upload them first:

```javascript
// Example: Upload image to S3
const uploadImageToS3 = async (imageFile) => {
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
    return result.data.url; // Returns S3 URL
};
```

#### Step 2: Create Activity with S3 URLs
```javascript
const createActivity = async (activityData) => {
    const response = await fetch('/api/mobile/activities', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            local_id: activityData.localId, // Important for tracking
            plan_id: activityData.planId,
            device_id: activityData.deviceId,
            state: activityData.state,
            district: activityData.district,
            sub_district: activityData.subDistrict,
            village: activityData.village,
            product_type: activityData.productType,
            location: activityData.location,
            landmark: activityData.landmark,
            latitude: activityData.latitude,
            longitude: activityData.longitude,
            remarks: activityData.remarks,
            close_shot1: activityData.closeShot1Url, // S3 URL from step 1
            close_shot_2: activityData.closeShot2Url, // S3 URL from step 1
            long_shot_1: activityData.longShot1Url, // S3 URL from step 1
            long_shot_2: activityData.longShot2Url, // S3 URL from step 1
            // ... other fields
        })
    });
    
    const result = await response.json();
    
    if (result.success) {
        // Success: Update local database with server_id
        updateLocalActivity(result.local_id, result.server_id);
    } else {
        // Error: Handle failed creation
        handleActivityError(result.local_id, result.message);
    }
    
    return result;
};
```

### Bulk Activity Creation

#### Step 1: Prepare Activities Array
```javascript
const prepareBulkActivities = async (localActivities) => {
    const activities = [];
    
    for (const activity of localActivities) {
        // Upload images if they exist
        let closeShot1Url = null;
        let closeShot2Url = null;
        let farShotUrl = null;
        let longShot1Url = null;
        let longShot2Url = null;
        
        if (activity.closeShot1File) {
            closeShot1Url = await uploadImageToS3(activity.closeShot1File);
        }
        
        if (activity.closeShot2File) {
            closeShot2Url = await uploadImageToS3(activity.closeShot2File);
        }
        
        if (activity.farShotFile) {
            farShotUrl = await uploadImageToS3(activity.farShotFile);
        }
        
        if (activity.longShot1File) {
            longShot1Url = await uploadImageToS3(activity.longShot1File);
        }
        
        if (activity.longShot2File) {
            longShot2Url = await uploadImageToS3(activity.longShot2File);
        }
        
        activities.push({
            local_id: activity.localId, // Critical for mapping
            plan_id: activity.planId,
            device_id: activity.deviceId,
            state: activity.state,
            district: activity.district,
            sub_district: activity.subDistrict,
            village: activity.village,
            product_type: activity.productType,
            location: activity.location,
            landmark: activity.landmark,
            latitude: activity.latitude,
            longitude: activity.longitude,
            remarks: activity.remarks,
            close_shot1: closeShot1Url,
            close_shot_2: closeShot2Url,
            long_shot_1: longShot1Url,
            long_shot_2: longShot2Url,
            // ... other fields
        });
    }
    
    return activities;
};
```

#### Step 2: Send Bulk Request
```javascript
const createBulkActivities = async (localActivities) => {
    const activities = await prepareBulkActivities(localActivities);
    
    const response = await fetch('/api/mobile/activities/bulk', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activities })
    });
    
    const result = await response.json();
    
    // Process results
    if (result.data && result.data.results) {
        result.data.results.forEach(item => {
            if (item.status === 'success') {
                // Success: Update local database
                updateLocalActivity(item.local_id, item.server_id);
            } else {
                // Error: Log or retry later
                handleActivityError(item.local_id, item.message);
            }
        });
    }
    
    return result;
};
```

## 📱 Mobile App Implementation

### Local Database Schema Updates
Add a `server_id` field to your local activity table:

```sql
ALTER TABLE activities ADD COLUMN server_id INTEGER NULL;
ALTER TABLE activities ADD COLUMN sync_status TEXT DEFAULT 'pending'; -- 'pending', 'synced', 'error'
```

### Sync Status Management
```javascript
const updateLocalActivity = (localId, serverId) => {
    // Update local database
    db.execute(
        'UPDATE activities SET server_id = ?, sync_status = ? WHERE local_id = ?',
        [serverId, 'synced', localId]
    );
};

const handleActivityError = (localId, errorMessage) => {
    // Mark as error for retry later
    db.execute(
        'UPDATE activities SET sync_status = ?, error_message = ? WHERE local_id = ?',
        ['error', errorMessage, localId]
    );
};
```

### Retry Logic for Failed Activities
```javascript
const retryFailedActivities = async () => {
    const failedActivities = await getFailedActivities();
    
    if (failedActivities.length > 0) {
        // Retry in smaller batches
        const batchSize = 10;
        for (let i = 0; i < failedActivities.length; i += batchSize) {
            const batch = failedActivities.slice(i, i + batchSize);
            await createBulkActivities(batch);
        }
    }
};
```

## 🔧 API Response Handling

### Success Response (HTTP 201)
```json
{
    "success": true,
    "message": "Activity created successfully",
    "local_id": "mobile_activity_001",
    "server_id": 123
}
```

### Error Response (HTTP 422/500)
```json
{
    "success": false,
    "message": "Failed to create activity: Validation error",
    "local_id": "mobile_activity_001",
    "server_id": null
}
```

### Bulk Success Response (HTTP 201)
```json
{
    "success": true,
    "message": "All 5 activities created successfully",
    "data": {
        "total_count": 5,
        "success_count": 5,
        "error_count": 0,
        "results": [...]
    }
}
```

### Bulk Partial Success (HTTP 207)
```json
{
    "success": false,
    "message": "3 of 5 activities created successfully, 2 failed",
    "data": {
        "total_count": 5,
        "success_count": 3,
        "error_count": 2,
        "results": [...]
    }
}
```

## 📊 Benefits of This Approach

1. **Reliable Tracking**: `local_id` ensures you can always map server responses to local records
2. **Partial Success Handling**: Bulk operations return detailed status for each item
3. **Retry Logic**: Failed activities can be easily identified and retried
4. **Performance**: Images uploaded once, referenced by URL
5. **Offline Support**: Activities can be queued locally and synced when online

## 🛠️ Implementation Checklist

- [ ] Update local database schema with `server_id` and `sync_status`
- [ ] Implement S3 image upload function
- [ ] Create single activity creation with local_id tracking
- [ ] Implement bulk activity creation
- [ ] Add retry logic for failed uploads
- [ ] Test partial success scenarios
- [ ] Implement sync status reporting in UI

## 🧪 Testing Scenarios

1. **Single Activity Success**: Verify local_id → server_id mapping
2. **Single Activity Failure**: Verify error handling with local_id
3. **Bulk All Success**: Verify all activities get server_ids
4. **Bulk Partial Success**: Verify mixed success/error handling
5. **Network Failure**: Verify retry logic works
6. **Image Upload Failure**: Verify graceful degradation

This implementation ensures robust activity syncing with proper error handling and tracking for mobile app development.
