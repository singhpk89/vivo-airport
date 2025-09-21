<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;

// Initialize Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🧪 Testing Agency Roles and Permissions\n";
echo "=" . str_repeat("=", 50) . "\n\n";

// Test Agency Role
echo "📋 AGENCY ROLE TESTING\n";
echo "-" . str_repeat("-", 30) . "\n";

$agencyUser = User::where('email', 'agency@li-council.com')->first();
if ($agencyUser) {
    echo "✅ Agency User Found: {$agencyUser->name} ({$agencyUser->email})\n";

    $agencyRole = $agencyUser->roles()->where('name', 'agency')->first();
    if ($agencyRole) {
        echo "✅ Agency Role Assigned: {$agencyRole->display_name}\n";
        echo "📝 Description: {$agencyRole->description}\n";

        echo "\n🔑 Agency Permissions:\n";
        $agencyPermissions = $agencyRole->permissions()->orderBy('module')->orderBy('name')->get();
        foreach ($agencyPermissions as $permission) {
            echo "  • {$permission->display_name} ({$permission->name}) - {$permission->module}\n";
        }
        echo "📊 Total Permissions: " . $agencyPermissions->count() . "\n";
    } else {
        echo "❌ Agency Role Not Found\n";
    }
} else {
    echo "❌ Agency User Not Found\n";
}

echo "\n" . str_repeat("=", 60) . "\n\n";

// Test Agency View Role
echo "👁️ AGENCY VIEW ROLE TESTING\n";
echo "-" . str_repeat("-", 30) . "\n";

$agencyViewUser = User::where('email', 'agency.view@li-council.com')->first();
if ($agencyViewUser) {
    echo "✅ Agency View User Found: {$agencyViewUser->name} ({$agencyViewUser->email})\n";

    $agencyViewRole = $agencyViewUser->roles()->where('name', 'agency_view')->first();
    if ($agencyViewRole) {
        echo "✅ Agency View Role Assigned: {$agencyViewRole->display_name}\n";
        echo "📝 Description: {$agencyViewRole->description}\n";

        echo "\n🔑 Agency View Permissions:\n";
        $agencyViewPermissions = $agencyViewRole->permissions()->orderBy('module')->orderBy('name')->get();
        foreach ($agencyViewPermissions as $permission) {
            echo "  • {$permission->display_name} ({$permission->name}) - {$permission->module}\n";
        }
        echo "📊 Total Permissions: " . $agencyViewPermissions->count() . "\n";
    } else {
        echo "❌ Agency View Role Not Found\n";
    }
} else {
    echo "❌ Agency View User Not Found\n";
}

echo "\n" . str_repeat("=", 60) . "\n\n";

// Compare permissions
if ($agencyUser && $agencyViewUser) {
    echo "🔍 PERMISSION COMPARISON\n";
    echo "-" . str_repeat("-", 30) . "\n";

    $agencyPermissionNames = $agencyRole->permissions()->pluck('name')->toArray();
    $agencyViewPermissionNames = $agencyViewRole->permissions()->pluck('name')->toArray();

    $onlyAgency = array_diff($agencyPermissionNames, $agencyViewPermissionNames);
    $common = array_intersect($agencyPermissionNames, $agencyViewPermissionNames);

    echo "🟢 Common Permissions (" . count($common) . "):\n";
    foreach ($common as $perm) {
        echo "  • $perm\n";
    }

    echo "\n🔵 Agency-Only Permissions (" . count($onlyAgency) . "):\n";
    foreach ($onlyAgency as $perm) {
        echo "  • $perm\n";
    }
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "✨ Testing Complete!\n";

// Test specific Activity Management permissions
echo "\n🎯 ACTIVITY MANAGEMENT ACCESS VERIFICATION\n";
echo "-" . str_repeat("-", 40) . "\n";

$activityPermissions = [
    'dashboard.view',
    'promoters.view', 'promoters.create', 'promoters.edit', 'promoters.delete',
    'activity_recces.view', 'activity_recces.create', 'activity_recces.edit', 'activity_recces.delete',
    'feedback.view', 'feedback.create', 'feedback.edit', 'feedback.delete',
    'route_plans.view', 'route_plans.export'
];

echo "Agency User Activity Management Access:\n";
foreach ($activityPermissions as $permission) {
    $hasPermission = $agencyUser->roles()->whereHas('permissions', function($q) use ($permission) {
        $q->where('name', $permission);
    })->exists();
    $status = $hasPermission ? "✅" : "❌";
    echo "  $status $permission\n";
}

echo "\nAgency View User Activity Management Access:\n";
foreach ($activityPermissions as $permission) {
    $hasPermission = $agencyViewUser->roles()->whereHas('permissions', function($q) use ($permission) {
        $q->where('name', $permission);
    })->exists();
    $status = $hasPermission ? "✅" : "❌";
    echo "  $status $permission\n";
}

echo "\n🎉 Agency Roles Setup Complete!\n";
echo "📧 Login Credentials:\n";
echo "   Agency: agency@li-council.com / Agency@123\n";
echo "   Agency View: agency.view@li-council.com / AgencyView@123\n";
