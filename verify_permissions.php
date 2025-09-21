<?php

require_once 'vendor/autoload.php';

$app = require 'bootstrap/app.php';

// Use Laravel's container to get the DB instance properly
$db = $app->make('db');

echo "Checking user permissions...\n";
echo "============================\n";

try {
    // Check if admin user has Super Admin role
    $adminUser = $db->table('users')->where('email', 'admin@li-council.com')->first();

    if (!$adminUser) {
        echo "❌ Admin user not found!\n";
        exit(1);
    }

    echo "✅ Found admin user: {$adminUser->email}\n";

    // Check user roles using the correct table name
    $userRoles = $db->table('model_has_roles as mhr')
        ->join('roles as r', 'mhr.role_id', '=', 'r.id')
        ->where('mhr.model_id', $adminUser->id)
        ->where('mhr.model_type', 'App\\Models\\User')
        ->pluck('r.name')
        ->toArray();

    echo "User roles: " . implode(', ', $userRoles) . "\n";

    // Check if Super Admin role has promoters.view permission
    $superAdminRole = $db->table('roles')->where('name', 'Super Admin')->first();

    if ($superAdminRole) {
        $hasPermission = $db->table('role_has_permissions as rhp')
            ->join('permissions as p', 'rhp.permission_id', '=', 'p.id')
            ->where('rhp.role_id', $superAdminRole->id)
            ->where('p.name', 'promoters.view')
            ->exists();

        if ($hasPermission) {
            echo "✅ Super Admin role has promoters.view permission\n";
        } else {
            echo "❌ Super Admin role missing promoters.view permission\n";

            // Get the permission ID
            $permission = $db->table('permissions')->where('name', 'promoters.view')->first();

            if ($permission) {
                // Add permission to Super Admin role
                $db->table('role_has_permissions')->insertOrIgnore([
                    'role_id' => $superAdminRole->id,
                    'permission_id' => $permission->id
                ]);
                echo "✅ Added promoters.view permission to Super Admin role\n";
            }
        }
    }

    echo "\nRefresh your browser to see the changes!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
