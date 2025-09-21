# Permission-Based Menu System

## Overview
The admin panel now implements a comprehensive permission-based menu system where menu visibility is controlled by user roles and permissions.

## How It Works

### 1. Menu Visibility Rules
- **Admin & Super Admin**: Can see ALL menus regardless of specific permissions
- **Other Roles**: Only see menus for which they have the required permissions
- **No Permission**: Menu item is hidden completely

### 2. Available Roles & Their Access

#### Super Admin (`super_admin`)
- **Access**: All 47 permissions - Complete system access
- **Menus**: All menu items visible

#### Admin (`admin`) 
- **Access**: All 47 permissions - Complete system access
- **Menus**: All menu items visible

#### Field Manager (`Field Manager`)
- **Access**: 12 permissions - Promoter system focused
- **Permissions**: 
  - Promoters: view, create, edit, assign
  - Route Plans: view, create, edit, statistics
  - Activity Recces: view, edit, status, dashboard
- **Menus**: Only Promoter Management, Route Plans, Activity Recces

#### Promoter Supervisor (`Promoter Supervisor`)
- **Access**: 6 permissions - Limited promoter oversight
- **Permissions**:
  - Promoters: view, edit
  - Route Plans: view, statistics
  - Activity Recces: view, status
- **Menus**: Only Promoter Management, Route Plans, Activity Recces (limited functions)

### 3. Current Menu Structure

#### Core Admin Menus
- **Dashboard** (`dashboard.view`)
- **User Management** (`users.view`)
- **Role Management** (`roles.view`) 
- **Permission Management** (`permissions.view`)

#### Promoter System Menus
- **Promoter Management** (`promoters.view`)
- **Route Plans** (`route_plans.view`)
- **Activity Recces** (`activity_recces.view`)

#### System Menus
- **Analytics** (`analytics.view`)
- **Reports** (`reports.view`)
- **Settings** (`settings.view`)

## Test Accounts

### Full Access Admin
- **Email**: `admin@example.com`
- **Password**: `password`
- **Role**: super_admin
- **Access**: All menus visible

### Limited Access Promoter Manager
- **Email**: `promoter@test.com`
- **Password**: `password` 
- **Role**: Field Manager
- **Access**: Only Promoter, Route Plans, Activity Recces menus

## Technical Implementation

### Backend (AuthController)
```php
// Check if user has admin or super_admin role
$userRoles = $user->roles->pluck('name')->toArray();
$isAdminOrSuperAdmin = in_array('admin', $userRoles) || in_array('super_admin', $userRoles);

// Filter menus based on permissions
$accessibleMenus = array_filter($allMenus, function ($menu) use ($user, $isAdminOrSuperAdmin) {
    // Admin and Super Admin can access all menus
    if ($isAdminOrSuperAdmin) {
        return true;
    }
    
    // Other users need specific permissions
    return $user->hasPermission($menu['permission']);
});
```

### Frontend (AuthContext)
```javascript
// Extract menu keys from backend response
const menuKeys = (menusData.data?.menus || []).map(menu => menu.module);
setAccessibleMenus(menuKeys);

// Check menu accessibility
const isMenuAccessible = (menuKey) => {
    return accessibleMenus.includes(menuKey);
};
```

### Sidebar Filtering
```javascript
// Filter navigation items based on user permissions  
const accessibleNavigation = navigationItems.filter(item => {
    // If no permission required, show to everyone
    if (!item.permission) return true;
    // Check if user has access to this menu
    return isMenuAccessible(item.menuKey);
});
```

## Security Features

1. **Backend Permission Validation**: All menu filtering happens on the server
2. **Route Protection**: Each route requires specific permissions
3. **Role-Based Override**: Admin roles bypass individual permission checks
4. **Dynamic Menu Loading**: Menus are fetched fresh on each login

## Adding New Menus

To add a new menu item:

1. **Add to Backend** (`AuthController::getAccessibleMenus`)
```php
[
    'name' => 'New Feature',
    'href' => '/new-feature',
    'icon' => 'Icon',
    'permission' => 'new_feature.view',
    'module' => 'new_feature'
]
```

2. **Add to Frontend** (`Sidebar.jsx`)
```javascript
{
    name: 'New Feature',
    href: '/new-feature', 
    icon: Icon,
    permission: 'new_feature.view',
    menuKey: 'new_feature'
}
```

3. **Create Route** (`AdminPanel.jsx`)
```javascript
<Route
    path="/new-feature"
    element={
        <ProtectedRoute requiredPermission="new_feature.view">
            <AppLayout>
                <NewFeatureComponent />
            </AppLayout>
        </ProtectedRoute>
    }
/>
```

4. **Create Permission** (Database)
```php
Permission::create(['name' => 'new_feature.view']);
```
