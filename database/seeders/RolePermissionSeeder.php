<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Permissions
        $permissions = [
            // User Management
            ['name' => 'users.view', 'display_name' => 'View Users', 'description' => 'Can view user listings', 'module' => 'users'],
            ['name' => 'users.create', 'display_name' => 'Create Users', 'description' => 'Can create new users', 'module' => 'users'],
            ['name' => 'users.edit', 'display_name' => 'Edit Users', 'description' => 'Can edit user information', 'module' => 'users'],
            ['name' => 'users.delete', 'display_name' => 'Delete Users', 'description' => 'Can delete users', 'module' => 'users'],

            // Role Management
            ['name' => 'roles.view', 'display_name' => 'View Roles', 'description' => 'Can view role listings', 'module' => 'roles'],
            ['name' => 'roles.create', 'display_name' => 'Create Roles', 'description' => 'Can create new roles', 'module' => 'roles'],
            ['name' => 'roles.edit', 'display_name' => 'Edit Roles', 'description' => 'Can edit role information', 'module' => 'roles'],
            ['name' => 'roles.delete', 'display_name' => 'Delete Roles', 'description' => 'Can delete roles', 'module' => 'roles'],

            // Permission Management
            ['name' => 'permissions.view', 'display_name' => 'View Permissions', 'description' => 'Can view permission listings', 'module' => 'permissions'],
            ['name' => 'permissions.create', 'display_name' => 'Create Permissions', 'description' => 'Can create new permissions', 'module' => 'permissions'],
            ['name' => 'permissions.edit', 'display_name' => 'Edit Permissions', 'description' => 'Can edit permission information', 'module' => 'permissions'],
            ['name' => 'permissions.delete', 'display_name' => 'Delete Permissions', 'description' => 'Can delete permissions', 'module' => 'permissions'],

            // Dashboard
            ['name' => 'dashboard.view', 'display_name' => 'View Dashboard', 'description' => 'Can access dashboard', 'module' => 'dashboard'],

            // Analytics
            ['name' => 'analytics.view', 'display_name' => 'View Analytics', 'description' => 'Can view analytics reports', 'module' => 'analytics'],
            ['name' => 'analytics.export', 'display_name' => 'Export Analytics', 'description' => 'Can export analytics data', 'module' => 'analytics'],

            // Orders
            ['name' => 'orders.view', 'display_name' => 'View Orders', 'description' => 'Can view order listings', 'module' => 'orders'],
            ['name' => 'orders.create', 'display_name' => 'Create Orders', 'description' => 'Can create new orders', 'module' => 'orders'],
            ['name' => 'orders.edit', 'display_name' => 'Edit Orders', 'description' => 'Can edit order information', 'module' => 'orders'],
            ['name' => 'orders.delete', 'display_name' => 'Delete Orders', 'description' => 'Can delete orders', 'module' => 'orders'],

            // Products
            ['name' => 'products.view', 'display_name' => 'View Products', 'description' => 'Can view product listings', 'module' => 'products'],
            ['name' => 'products.create', 'display_name' => 'Create Products', 'description' => 'Can create new products', 'module' => 'products'],
            ['name' => 'products.edit', 'display_name' => 'Edit Products', 'description' => 'Can edit product information', 'module' => 'products'],
            ['name' => 'products.delete', 'display_name' => 'Delete Products', 'description' => 'Can delete products', 'module' => 'products'],

            // Reports
            ['name' => 'reports.view', 'display_name' => 'View Reports', 'description' => 'Can view reports', 'module' => 'reports'],
            ['name' => 'reports.create', 'display_name' => 'Create Reports', 'description' => 'Can create new reports', 'module' => 'reports'],
            ['name' => 'reports.export', 'display_name' => 'Export Reports', 'description' => 'Can export report data', 'module' => 'reports'],

            // Route Plans
            ['name' => 'route_plans.view', 'display_name' => 'View Route Plans', 'description' => 'Can view route plan listings', 'module' => 'route_plans'],
            ['name' => 'route_plans.create', 'display_name' => 'Create Route Plans', 'description' => 'Can create new route plans', 'module' => 'route_plans'],
            ['name' => 'route_plans.edit', 'display_name' => 'Edit Route Plans', 'description' => 'Can edit route plan information', 'module' => 'route_plans'],
            ['name' => 'route_plans.delete', 'display_name' => 'Delete Route Plans', 'description' => 'Can delete route plans', 'module' => 'route_plans'],
            ['name' => 'route_plans.import', 'display_name' => 'Import Route Plans', 'description' => 'Can import route plans from files', 'module' => 'route_plans'],
            ['name' => 'route_plans.export', 'display_name' => 'Export Route Plans', 'description' => 'Can export route plan data', 'module' => 'route_plans'],

            // Promoters
            ['name' => 'promoters.view', 'display_name' => 'View Promoters', 'description' => 'Can view promoter listings', 'module' => 'promoters'],
            ['name' => 'promoters.create', 'display_name' => 'Create Promoters', 'description' => 'Can create new promoters', 'module' => 'promoters'],
            ['name' => 'promoters.edit', 'display_name' => 'Edit Promoters', 'description' => 'Can edit promoter information', 'module' => 'promoters'],
            ['name' => 'promoters.delete', 'display_name' => 'Delete Promoters', 'description' => 'Can delete promoters', 'module' => 'promoters'],
            ['name' => 'promoters.assign', 'display_name' => 'Assign Promoters', 'description' => 'Can assign promoters to locations', 'module' => 'promoters'],

            // Activity Recces
            ['name' => 'activity_recces.view', 'display_name' => 'View Activity Recces', 'description' => 'Can view activity recce listings', 'module' => 'activity_recces'],
            ['name' => 'activity_recces.create', 'display_name' => 'Create Activity Recces', 'description' => 'Can create new activity recces', 'module' => 'activity_recces'],
            ['name' => 'activity_recces.edit', 'display_name' => 'Edit Activity Recces', 'description' => 'Can edit activity recce information', 'module' => 'activity_recces'],
            ['name' => 'activity_recces.delete', 'display_name' => 'Delete Activity Recces', 'description' => 'Can delete activity recces', 'module' => 'activity_recces'],
            ['name' => 'activity_recces.approve', 'display_name' => 'Approve Activity Recces', 'description' => 'Can approve or reject activity recces', 'module' => 'activity_recces'],

            // Settings
            ['name' => 'settings.view', 'display_name' => 'View Settings', 'description' => 'Can view system settings', 'module' => 'settings'],
            ['name' => 'settings.edit', 'display_name' => 'Edit Settings', 'description' => 'Can modify system settings', 'module' => 'settings'],

            // System Logs
            ['name' => 'logs.view', 'display_name' => 'View System Logs', 'description' => 'Can view system logs', 'module' => 'logs'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission['name']], $permission);
        }

        // Create Roles
        $superAdminRole = Role::firstOrCreate([
            'name' => 'super_admin'
        ], [
            'display_name' => 'Super Administrator',
            'description' => 'Full system access with all permissions'
        ]);

        $adminRole = Role::firstOrCreate([
            'name' => 'admin'
        ], [
            'display_name' => 'Administrator',
            'description' => 'Administrative access with most permissions'
        ]);

        $moderatorRole = Role::firstOrCreate([
            'name' => 'moderator'
        ], [
            'display_name' => 'Moderator',
            'description' => 'Content moderation and limited administrative access'
        ]);

        $userRole = Role::firstOrCreate([
            'name' => 'user'
        ], [
            'display_name' => 'Regular User',
            'description' => 'Basic user access with limited permissions'
        ]);

        // Assign permissions to roles

        // Super Admin gets all permissions
        $superAdminRole->permissions()->sync(Permission::all());

        // Admin gets most permissions (excluding super admin specific ones)
        $adminPermissions = Permission::whereNotIn('name', [
            'roles.delete',
            'permissions.delete',
            'settings.edit'
        ])->pluck('id');
        $adminRole->permissions()->sync($adminPermissions);

        // Moderator gets content management permissions
        $moderatorPermissions = Permission::whereIn('name', [
            'dashboard.view',
            'users.view',
            'users.edit',
            'orders.view',
            'orders.edit',
            'products.view',
            'products.edit',
            'reports.view',
            'analytics.view',
            'route_plans.view',
            'route_plans.edit',
            'promoters.view',
            'promoters.edit',
            'activity_recces.view',
            'activity_recces.edit',
            'activity_recces.approve'
        ])->pluck('id');
        $moderatorRole->permissions()->sync($moderatorPermissions);

        // Regular user gets basic permissions
        $userPermissions = Permission::whereIn('name', [
            'dashboard.view',
            'orders.view',
            'products.view',
            'route_plans.view',
            'promoters.view',
            'activity_recces.view'
        ])->pluck('id');
        $userRole->permissions()->sync($userPermissions);
    }
}
