<?php

use Illuminate\Support\Facades\Artisan;

Artisan::call('tinker', [], new \Symfony\Component\Console\Output\BufferedOutput());

// Simple permission check and creation
$permissions = [
    'promoters.view',
    'promoter_activities.view',
    'promoter_activities.create',
    'promoter_activities.update',
    'promoter_activities.delete'
];

echo "Adding missing permissions...\n";

foreach ($permissions as $permissionName) {
    $permission = \App\Models\Permission::firstOrCreate([
        'name' => $permissionName,
        'guard_name' => 'web'
    ]);

    if ($permission->wasRecentlyCreated) {
        echo "✅ Created: $permissionName\n";
    } else {
        echo "✅ Exists: $permissionName\n";
    }
}

// Assign to Super Admin
$superAdmin = \App\Models\Role::where('name', 'Super Admin')->first();
if ($superAdmin) {
    foreach ($permissions as $permissionName) {
        $permission = \App\Models\Permission::where('name', $permissionName)->first();
        if ($permission && !$superAdmin->hasPermissionTo($permission)) {
            $superAdmin->givePermissionTo($permission);
            echo "✅ Assigned $permissionName to Super Admin\n";
        }
    }
}

// Check current user
$user = \App\Models\User::where('email', 'admin@li-council.com')->first();
if ($user) {
    echo "\nUser: " . $user->email . "\n";
    echo "Roles: " . $user->getRoleNames()->implode(', ') . "\n";
    echo "Has promoters.view: " . ($user->can('promoters.view') ? 'YES' : 'NO') . "\n";
    echo "Has promoter_activities.view: " . ($user->can('promoter_activities.view') ? 'YES' : 'NO') . "\n";
}

echo "\nPermissions setup complete!\n";
