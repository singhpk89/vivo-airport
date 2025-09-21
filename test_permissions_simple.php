<?php

/**
 * Simple permission test script
 */

// Include Laravel's autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Create the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';

// Boot the application
$app->boot();

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;

echo "Permission Check Script\n";
echo "======================\n\n";

try {
    // Get admin user
    $user = User::where('email', 'admin@li-council.com')->first();

    if (!$user) {
        echo "❌ Admin user not found!\n";
        exit(1);
    }

    echo "User: {$user->email}\n";
    echo "User ID: {$user->id}\n";

    // Get user roles
    $roles = $user->getRoleNames();
    echo "Roles: " . $roles->implode(', ') . "\n\n";

    // Check specific permissions
    $permissions = ['promoters.view', 'users.view', 'roles.view'];

    foreach ($permissions as $permission) {
        $hasPermission = $user->can($permission);
        echo sprintf("%-20s: %s\n", $permission, $hasPermission ? '✅ YES' : '❌ NO');
    }

    echo "\n";

    // If user doesn't have promoters.view, try to assign it
    if (!$user->can('promoters.view')) {
        echo "Attempting to fix promoters.view permission...\n";

        // Check if permission exists
        $promoterViewPermission = Permission::where('name', 'promoters.view')->first();

        if (!$promoterViewPermission) {
            // Create the permission
            $promoterViewPermission = Permission::create([
                'name' => 'promoters.view',
                'guard_name' => 'web'
            ]);
            echo "✅ Created promoters.view permission\n";
        } else {
            echo "✅ promoters.view permission exists\n";
        }

        // Get Super Admin role
        $superAdminRole = Role::where('name', 'Super Admin')->first();

        if ($superAdminRole) {
            // Give permission to Super Admin role
            if (!$superAdminRole->hasPermissionTo($promoterViewPermission)) {
                $superAdminRole->givePermissionTo($promoterViewPermission);
                echo "✅ Assigned promoters.view to Super Admin role\n";
            } else {
                echo "✅ Super Admin already has promoters.view permission\n";
            }

            // Check again
            $user->refresh();
            $hasPermissionNow = $user->can('promoters.view');
            echo "promoters.view after fix: " . ($hasPermissionNow ? '✅ YES' : '❌ NO') . "\n";
        }
    }

    echo "\nScript completed successfully!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
