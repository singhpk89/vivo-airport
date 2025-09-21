# State-Based Data Filtering System

## Overview

The State-Based Data Filtering System allows administrators to assign specific states to users, restricting their access to data only from those assigned states. This is perfect for regional managers who should only see data from their assigned geographical areas.

## Key Features

- **User State Assignment**: Assign one or multiple states to users
- **Automatic Data Filtering**: All data queries automatically filter by user's assigned states
- **Admin Override**: Super admins and admins can access all data regardless of state assignments
- **Role-Based Access**: Integrates seamlessly with the existing permission system
- **API Support**: Full API endpoints for state management
- **UI Management**: Clean interface for managing user state assignments

## How It Works

### 1. Database Structure

**user_states Table:**
- `user_id` - Foreign key to users table
- `state` - The state name assigned to the user
- `is_active` - Whether the assignment is active
- Unique constraint on `user_id + state` to prevent duplicates

### 2. Model Integration

**HasStateFiltering Trait:**
Applied to models with state data (RoutePlan, ActivityRecce, Promoter):

```php
// Automatically filters by user's assigned states
$query->forUserStates();

// Check if user can access specific state
$model->canUserAccessState();
```

**User Model Methods:**
```php
$user->assignState('Bihar');           // Assign state to user
$user->removeState('Bihar');           // Remove state assignment
$user->hasStateAccess('Bihar');        // Check state access
$user->getAssignedStates();           // Get all assigned states
$user->hasAllStateAccess();           // Check if admin/super admin
```

### 3. Controller Integration

All main controllers now apply state filtering:
- **RoutePlanController**: Filters route plans by assigned states
- **ActivityRecceController**: Filters activity records by assigned states  
- **PromoterController**: Filters promoters by assigned states

### 4. API Endpoints

**State Management API:**
```bash
GET    /api/user-states/available-states     # Get all available states
GET    /api/user-states/{user}               # Get user's assigned states
POST   /api/user-states/{user}/assign        # Assign states to user
POST   /api/user-states/{user}/remove        # Remove state from user
```

**Request Examples:**
```json
// Assign states
POST /api/user-states/1/assign
{
    "states": ["Bihar", "Gujarat", "Maharashtra"]
}

// Remove state
POST /api/user-states/1/remove
{
    "state": "Bihar"
}
```

## User Scenarios

### Scenario 1: Bihar Regional Manager

**Setup:**
- User: bihar.manager@company.com
- Assigned States: ["Bihar"]
- Role: Moderator

**Access:**
- ✅ Can view Route Plans in Bihar (18 records)
- ✅ Can view Promoters in Bihar (2 records)
- ✅ Can view Activity Records in Bihar
- ❌ Cannot view data from Gujarat, Maharashtra, etc.
- ❌ Cannot view unassigned state data

### Scenario 2: Multi-State Regional Manager

**Setup:**
- User: north.manager@company.com
- Assigned States: ["Bihar", "Jharkhand", "West Bengal"]
- Role: Moderator

**Access:**
- ✅ Can view data from all three assigned states
- ✅ Can see combined reports across assigned states
- ❌ Cannot view data from other states

### Scenario 3: National Administrator

**Setup:**
- User: admin@company.com
- Assigned States: None (Admin role)
- Role: Admin or Super Admin

**Access:**
- ✅ Can view ALL data regardless of state
- ✅ Admin role overrides state restrictions
- ✅ Can manage other users' state assignments

## Implementation Details

### 1. Frontend UI

**User State Management Component** (`/acl/user-states`):
- View all users and their assigned states
- Search and filter users
- Assign/remove states with visual interface
- Real-time state assignment updates

**Features:**
- Card-based user display
- State badges with remove buttons
- Assign states dialog with checkboxes
- Responsive design for all screen sizes

### 2. Security

**Permission Checks:**
- State assignment requires `users.view` permission
- Data filtering happens at query level
- No client-side filtering (secure)

**Access Control:**
- Super Admin: All data access
- Admin: All data access  
- Other roles: Filtered by assigned states
- No state assignment = no data access (secure default)

### 3. Performance

**Optimizations:**
- Database indexes on `user_id`, `state`, `is_active`
- Query scopes prevent N+1 problems
- Cached state assignments per request
- Efficient joins and filtering

## Testing

### Manual Testing

1. **Create Test User:**
   ```bash
   php test_state_filtering.php
   ```

2. **Assign States:**
   - Navigate to `/acl/user-states`
   - Select user and assign states
   - Verify assignments appear as badges

3. **Test Data Filtering:**
   - Login as state-restricted user
   - Navigate to Route Plans, Promoters, Activity pages
   - Verify only assigned state data appears

### Test Results

**Bihar State Manager Test:**
- Total Route Plans: 325 → User sees: 18 (Bihar only)
- Total Promoters: 42 → User sees: 2 (Bihar only)
- Total Activities: 3 → User sees: 0 (no Bihar activities)

**Admin User Test:**
- Admin sees all data: 325 Route Plans, 42 Promoters, 3 Activities
- No restrictions applied

## Deployment Checklist

- [x] ✅ Migration created and run
- [x] ✅ Models updated with traits
- [x] ✅ Controllers updated with filtering
- [x] ✅ API endpoints created
- [x] ✅ Frontend component built
- [x] ✅ Routes and menu items added
- [x] ✅ Testing completed
- [x] ✅ Documentation created

## Usage Examples

### Example 1: Assign Bihar State to User

```javascript
// Frontend API call
const response = await fetch('/api/user-states/10/assign', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        states: ['Bihar']
    })
});
```

### Example 2: Backend Query with State Filtering

```php
// Automatic state filtering
$routePlans = RoutePlan::forUserStates()->get();

// Returns only data from user's assigned states
// Admin users see all data
```

### Example 3: Check User Access

```php
$user = Auth::user();

if ($user->hasStateAccess('Bihar')) {
    // User can access Bihar data
}

if ($user->hasAllStateAccess()) {
    // User is admin - can access everything
}
```

## Benefits

1. **Security**: Data is automatically filtered at query level
2. **Flexibility**: Support for multiple state assignments per user
3. **Performance**: Efficient database queries with proper indexing
4. **User Experience**: Clean UI for state management
5. **Scalability**: Easy to add new states or modify assignments
6. **Integration**: Works seamlessly with existing permission system

## Future Enhancements

- **District-level filtering**: Extend to district/sub-district levels
- **Date-based assignments**: Temporary state access with expiry
- **Audit logging**: Track state assignment changes
- **Bulk operations**: Assign states to multiple users at once
- **Export/Import**: CSV import for bulk state assignments

---

**System Status**: ✅ **FULLY IMPLEMENTED AND TESTED**

**Test URL**: https://lic.test/acl/user-states

**Test User**: bihar.manager@test.com (Password: password123)
