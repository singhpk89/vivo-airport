# Admin User Credentials

This document contains the default admin user credentials for the Li-Council application.

## Admin Users

### Super Administrator
- **Email**: `super.admin@li-council.com`
- **Password**: `Super@Admin123`
- **Role**: Super Administrator
- **Permissions**: Full system access with all permissions
- **Description**: Primary super admin account with complete system control

### System Administrator  
- **Email**: `system@li-council.com`
- **Password**: `System@123`
- **Role**: Super Administrator
- **Permissions**: Full system access with all permissions
- **Description**: Secondary super admin account for system administration

### Administrator
- **Email**: `admin@li-council.com`
- **Password**: `Admin@123`
- **Role**: Administrator
- **Permissions**: Administrative access with most permissions (excluding super admin specific ones)
- **Description**: Standard admin account for day-to-day administration

### Test User (Local/Testing Only)
- **Email**: `test@example.com`
- **Password**: Auto-generated
- **Role**: Administrator
- **Permissions**: Administrative access
- **Description**: Test user created only in local/testing environments

## Available Roles & Permissions

### Super Administrator Role
- All system permissions (45 permissions)
- Can manage all users, roles, and permissions
- Full access to all modules including system settings

### Administrator Role
- Most permissions except:
  - `roles.delete`
  - `permissions.delete` 
  - `settings.edit`
- Can manage users and content but cannot delete core system roles/permissions

### Moderator Role
- Content management permissions for:
  - Dashboard access
  - User viewing and editing
  - Route plans viewing and editing
  - Promoters management
  - Activity recces management and approval
  - Reports and analytics viewing

### Regular User Role
- Basic read-only permissions:
  - Dashboard access
  - View orders, products, route plans, promoters, activity recces

## Permission Modules

The system includes permissions for the following modules:
- **Users**: User management (view, create, edit, delete)
- **Roles**: Role management (view, create, edit, delete)
- **Permissions**: Permission management (view, create, edit, delete)
- **Dashboard**: Dashboard access
- **Analytics**: Analytics viewing and export
- **Orders**: Order management (view, create, edit, delete)
- **Products**: Product management (view, create, edit, delete)
- **Reports**: Report generation and export
- **Route Plans**: Route plan management including import/export
- **Promoters**: Promoter management and assignment
- **Activity Recces**: Activity recce management and approval
- **Settings**: System settings management
- **Logs**: System log viewing

## Security Notes

⚠️ **Important Security Information**:

1. **Change Default Passwords**: These are default passwords and should be changed immediately after first login
2. **Environment Specific**: Test users are only created in local/testing environments
3. **Production Setup**: For production, disable test user creation and use strong, unique passwords
4. **Regular Updates**: Regularly review and update user permissions based on role requirements

## Seeding Commands

To re-seed admin users and permissions:

```bash
# Seed all (includes roles, permissions, and admin users)
php artisan db:seed

# Seed only admin users
php artisan db:seed --class=AdminUserSeeder

# Seed only roles and permissions
php artisan db:seed --class=RolePermissionSeeder
```

## First Login Steps

1. Login with super admin credentials
2. Change the default password
3. Review and adjust user permissions as needed
4. Create additional admin users as required
5. Disable or remove test accounts in production

---

**Last Updated**: August 22, 2025
