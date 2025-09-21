<?php

// Simple script to test menu visibility after the fix
use Illuminate\Support\Facades\Auth;

$user = \App\Models\User::where('email', 'super@li-council.com')->first();

if (!$user) {
    echo "❌ Super admin user not found\n";
    exit;
}

echo "✅ Testing with user: {$user->email}\n";

// Manually create the controller and test the method
$controller = new \App\Http\Controllers\Auth\AuthController();

// Use reflection to access the protected method
$reflection = new ReflectionClass($controller);
$method = $reflection->getMethod('getAccessibleMenus');
$method->setAccessible(true);

try {
    $menus = $method->invoke($controller, $user);
    echo "Total menus found: " . count($menus) . "\n\n";

    foreach ($menus as $menu) {
        echo "- {$menu['name']} ({$menu['module']})\n";
    }

    $promoterActivityMenu = collect($menus)->firstWhere('module', 'promoter-activity');

    echo "\n";
    if ($promoterActivityMenu) {
        echo "✅ SUCCESS: Promoter Activity menu is now accessible!\n";
        echo "   Name: {$promoterActivityMenu['name']}\n";
        echo "   Route: {$promoterActivityMenu['href']}\n";
        echo "   Permission: {$promoterActivityMenu['permission']}\n";
    } else {
        echo "❌ FAILED: Promoter Activity menu is still not found\n";
    }

} catch (Exception $e) {
    echo "❌ Error testing menu: " . $e->getMessage() . "\n";
}
