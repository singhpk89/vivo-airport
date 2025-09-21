<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Permission;

echo "=== FEEDBACK PERMISSION CHECK ===\n\n";

// Check if feedback.view permission exists
$permission = Permission::where('name', 'feedback.view')->first();
if ($permission) {
    echo "✅ Permission 'feedback.view' exists:\n";
    echo "  ID: " . $permission->id . "\n";
    echo "  Name: " . $permission->name . "\n";
    echo "  Display Name: " . $permission->display_name . "\n";
} else {
    echo "❌ Permission 'feedback.view' does NOT exist\n";
}

echo "\n";

// Check current user permissions
$currentUser = User::where('email', 'admin@li-council.com')->first();
if ($currentUser) {
    echo "Current user: " . $currentUser->email . "\n";
    echo "User role: " . ($currentUser->roles->first()->name ?? 'No role') . "\n";
    echo "\nUser permissions containing 'feedback' or 'view':\n";
    $permissions = $currentUser->getAllPermissions();
    $feedbackPerms = $permissions->filter(function($perm) {
        return strpos($perm->name, 'feedback') !== false;
    });

    if ($feedbackPerms->count() > 0) {
        foreach ($feedbackPerms as $perm) {
            echo "  - " . $perm->name . "\n";
        }
    } else {
        echo "  No feedback permissions found\n";
    }

    echo "\nChecking specific feedback.view permission:\n";
    if ($currentUser->can('feedback.view')) {
        echo "✅ User CAN access feedback.view\n";
    } else {
        echo "❌ User CANNOT access feedback.view\n";
    }
} else {
    echo "❌ Admin user not found\n";
}

echo "\n=== ALL AVAILABLE PERMISSIONS ===\n";
$allPermissions = Permission::orderBy('name')->get();
echo "Total permissions: " . $allPermissions->count() . "\n";
foreach ($allPermissions as $perm) {
    if (strpos($perm->name, 'feedback') !== false || strpos($perm->name, 'view') !== false) {
        echo "  - " . $perm->name . " (" . $perm->display_name . ")\n";
    }
}
