<?php

/**
 * Add Promoter Activity permissions to the system
 */

require_once 'vendor/autoload.php';

// Bootstrap Laravel application
$app = require 'bootstrap/app.php';
$app->boot();

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

echo "Adding Promoter Activity Permissions...\n";
echo "======================================\n\n";

// Define promoter activity permissions
$permissions = [
    [
        'name' => 'promoter_activities.view',
        'guard_name' => 'web',
        'description' => 'View promoter daily activities and reports'
    ],
    [
        'name' => 'promoter_activities.create',
        'guard_name' => 'web',
        'description' => 'Create promoter activity records'
    ],
    [
        'name' => 'promoter_activities.update',
        'guard_name' => 'web',
        'description' => 'Update promoter activity records'
    ],
    [
        'name' => 'promoter_activities.delete',
        'guard_name' => 'web',
        'description' => 'Delete promoter activity records'
    ],
    [
        'name' => 'promoter_activity_photos.view',
        'guard_name' => 'web',
        'description' => 'View promoter activity photos'
    ],
    [
        'name' => 'promoter_activity_photos.upload',
        'guard_name' => 'web',
        'description' => 'Upload promoter activity photos'
    ],
    [
        'name' => 'promoter_activity_photos.delete',
        'guard_name' => 'web',
        'description' => 'Delete promoter activity photos'
    ]
];

// Create permissions
foreach ($permissions as $permissionData) {
    $permission = Permission::firstOrCreate(
        ['name' => $permissionData['name'], 'guard_name' => $permissionData['guard_name']],
        $permissionData
    );

    if ($permission->wasRecentlyCreated) {
        echo "✅ Created permission: {$permissionData['name']}\n";
    } else {
        echo "✅ Permission exists: {$permissionData['name']}\n";
    }
}

echo "\nAssigning permissions to roles...\n";
echo "=================================\n";

// Assign permissions to roles
try {
    // Super Admin gets all permissions
    $superAdminRole = Role::where('name', 'Super Admin')->first();
    if ($superAdminRole) {
        foreach ($permissions as $permissionData) {
            $permission = Permission::where('name', $permissionData['name'])->first();
            if ($permission && !$superAdminRole->hasPermissionTo($permission)) {
                $superAdminRole->givePermissionTo($permission);
                echo "✅ Assigned {$permissionData['name']} to Super Admin\n";
            }
        }
    }

    // Admin gets view and create permissions
    $adminRole = Role::where('name', 'Admin')->first();
    if ($adminRole) {
        $adminPermissions = [
            'promoter_activities.view',
            'promoter_activities.create',
            'promoter_activity_photos.view',
            'promoter_activity_photos.upload'
        ];

        foreach ($adminPermissions as $permissionName) {
            $permission = Permission::where('name', $permissionName)->first();
            if ($permission && !$adminRole->hasPermissionTo($permission)) {
                $adminRole->givePermissionTo($permission);
                echo "✅ Assigned {$permissionName} to Admin\n";
            }
        }
    }

    // Moderator gets view permissions
    $moderatorRole = Role::where('name', 'Moderator')->first();
    if ($moderatorRole) {
        $moderatorPermissions = [
            'promoter_activities.view',
            'promoter_activity_photos.view'
        ];

        foreach ($moderatorPermissions as $permissionName) {
            $permission = Permission::where('name', $permissionName)->first();
            if ($permission && !$moderatorRole->hasPermissionTo($permission)) {
                $moderatorRole->givePermissionTo($permission);
                echo "✅ Assigned {$permissionName} to Moderator\n";
            }
        }
    }

    // Viewer gets only view permissions
    $viewerRole = Role::where('name', 'Viewer')->first();
    if ($viewerRole) {
        $viewerPermissions = [
            'promoter_activities.view',
            'promoter_activity_photos.view'
        ];

        foreach ($viewerPermissions as $permissionName) {
            $permission = Permission::where('name', $permissionName)->first();
            if ($permission && !$viewerRole->hasPermissionTo($permission)) {
                $viewerRole->givePermissionTo($permission);
                echo "✅ Assigned {$permissionName} to Viewer\n";
            }
        }
    }

} catch (Exception $e) {
    echo "❌ Error assigning permissions: " . $e->getMessage() . "\n";
}

echo "\nChecking current user permissions...\n";
echo "====================================\n";

// Check if current authenticated user has the permissions
try {
    $user = DB::table('users')->where('email', 'admin@li-council.com')->first();
    if ($user) {
        $userModel = App\Models\User::find($user->id);
        $roles = $userModel->getRoleNames()->toArray();
        echo "User: {$user->email}\n";
        echo "Roles: " . implode(', ', $roles) . "\n";

        // Check specific permission
        $hasPermission = $userModel->can('promoter_activities.view');
        echo "Has promoter_activities.view: " . ($hasPermission ? 'YES' : 'NO') . "\n";

        // Also check promoters.view permission
        $hasPromoterView = $userModel->can('promoters.view');
        echo "Has promoters.view: " . ($hasPromoterView ? 'YES' : 'NO') . "\n";
    }
} catch (Exception $e) {
    echo "❌ Error checking user permissions: " . $e->getMessage() . "\n";
}

echo "\nPermission setup complete!\n";
echo "=========================\n";
echo "You may need to refresh your browser or re-login to see the changes.\n";
