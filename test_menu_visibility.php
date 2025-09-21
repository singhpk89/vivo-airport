<?php

require_once 'vendor/autoload.php';

use App\Http\Controllers\Auth\AuthController;
use App\Models\User;

// Start Laravel application
$app = require_once 'bootstrap/app.php';
$app->boot();

echo "=== Testing Menu Visibility ===\n\n";

// Test with Super Admin user
$user = User::where('email', 'super@li-council.com')->first();

if (!$user) {
    echo "❌ Super admin user not found\n";
    exit;
}

echo "✅ Super Admin User Found:\n";
echo "   Email: {$user->email}\n";
echo "   Name: {$user->name}\n\n";

// Check roles
echo "User Roles:\n";
foreach ($user->roles as $role) {
    echo "   - {$role->name}\n";
}
echo "\n";

// Check permissions
echo "User Permissions:\n";
foreach ($user->getAllPermissions() as $permission) {
    echo "   - {$permission->name}\n";
}
echo "\n";

// Test the AuthController getAccessibleMenus method
$controller = new AuthController();

// Use reflection to call the protected method
$reflection = new ReflectionClass($controller);
$method = $reflection->getMethod('getAccessibleMenus');
$method->setAccessible(true);

$accessibleMenus = $method->invoke($controller, $user);

echo "Accessible Menus:\n";
foreach ($accessibleMenus as $menu) {
    echo "   ✓ {$menu['name']} (permission: {$menu['permission']})\n";
}

// Check specifically for Promoter Activity
$promoterActivityMenu = collect($accessibleMenus)->firstWhere('module', 'promoter-activity');

echo "\n";
if ($promoterActivityMenu) {
    echo "✅ Promoter Activity Menu Found:\n";
    echo "   Name: {$promoterActivityMenu['name']}\n";
    echo "   Route: {$promoterActivityMenu['href']}\n";
    echo "   Permission: {$promoterActivityMenu['permission']}\n";
    echo "   Module: {$promoterActivityMenu['module']}\n";
} else {
    echo "❌ Promoter Activity Menu NOT Found\n";
}

?>
