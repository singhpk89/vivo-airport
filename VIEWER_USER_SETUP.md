# Viewer User Setup Documentation

## Overview
A "Viewer" role has been created for read-only access to the application. Users with this role can view all data but cannot edit, create, or delete anything.

## Viewer Role Details

### Role Information
- **Role Name**: `viewer`
- **Display Name**: `Viewer`
- **Description**: `Can only view data, cannot edit or modify anything`

### Permissions
The viewer role has been assigned the following view-only permissions:

#### Dashboard & Analytics
- `dashboard.view` - View Dashboard
- `analytics.view` - View Analytics

#### User Management
- `users.view` - View Users
- `roles.view` - View Roles
- `permissions.view` - View Permissions

#### Content Management
- `activity_recces.view` - View Activity Recces
- `photos.view` - View Photo Gallery
- `orders.view` - View Orders
- `products.view` - View Products
- `promoters.view` - View Promoters
- `route_plans.view` - View Route Plans

#### System & Reports
- `reports.view` - View Reports
- `settings.view` - View Settings
- `logs.view` - View System Logs

## Test User Credentials

### Viewer User
- **Email**: `viewer@li-council.com`
- **Password**: `password123`
- **Name**: `Test User New`
- **Role**: `Viewer`

## UI Behavior for Viewer Users

### What Viewers CAN Do:
- View all user listings (grid and table view)
- See user roles and permissions
- Access all dashboard sections
- View analytics and reports
- Browse all content areas

### What Viewers CANNOT Do:
- Create new users (Add User button is hidden)
- Edit existing users
- Manage user roles or permissions
- Delete users
- See action dropdown menus on user cards/rows
- Access any create/edit/delete functionality

### UI Changes for Viewer Role:
1. **Header Section**: 
   - "Add User" button is hidden for viewers
   - Page description changes from "Manage users..." to "View users..."

2. **User Cards/Table**:
   - Action dropdown menus (⋮) are completely hidden
   - No edit, delete, or manage role options available

3. **Permissions Check**:
   - Uses `canEdit()`, `canCreate()`, `canDelete()` functions from AuthContext
   - These functions return `false` for viewer role users

## Technical Implementation

### AuthContext Functions Added:
```javascript
// Check if user is viewer (read-only)
const isViewer = () => {
  return hasRole('viewer');
};

// Check if user can edit (not a viewer)
const canEdit = () => {
  return !isViewer();
};

// Check if user can create (not a viewer)
const canCreate = () => {
  return !isViewer();
};

// Check if user can delete (not a viewer)
const canDelete = () => {
  return !isViewer();
};
```

### Component Updates:
- **UserManagement.jsx**: Updated to use permission checks for all interactive elements
- Conditional rendering for buttons and dropdown menus
- Role-based text changes

## Testing Instructions

1. **Login as Viewer**:
   - Go to: https://lic.test/admin/login
   - Email: `viewer@li-council.com`
   - Password: `password123`

2. **Verify Read-Only Access**:
   - Navigate to Users section
   - Confirm "Add User" button is not visible
   - Confirm no action menus (⋮) appear on user cards/rows
   - Verify page shows "View users, roles, and permissions" description

3. **Test Other Sections**:
   - All other admin sections should be viewable but not editable
   - Check that no create/edit/delete buttons appear anywhere

## Future Enhancements

Consider extending viewer restrictions to:
- Other admin components (Activity Management, Route Plans, etc.)
- API endpoint protection (already handled by permission system)
- More granular view permissions if needed

## Security Note

The viewer role is protected at both:
- **Frontend Level**: UI elements are hidden/disabled
- **Backend Level**: API endpoints check permissions via Laravel's permission system

This ensures users cannot bypass frontend restrictions by making direct API calls.
