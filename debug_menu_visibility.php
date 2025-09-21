<?php

/**
 * Check current user permissions for Promoter Activity menu
 */

require_once 'vendor/autoload.php';

echo "🔍 **Checking Promoter Activity Menu Visibility**\n";
echo "==============================================\n\n";

// Check database directly
$pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

// Get admin user
$stmt = $pdo->prepare("SELECT id, email FROM users WHERE email = ?");
$stmt->execute(['admin@li-council.com']);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo "❌ Admin user not found!\n";
    exit(1);
}

echo "✅ Found user: {$user['email']} (ID: {$user['id']})\n\n";

// Check if users.view permission exists
$stmt = $pdo->query("SELECT id, name, description FROM permissions WHERE name = 'users.view'");
$usersViewPermission = $stmt->fetch(PDO::FETCH_ASSOC);

if ($usersViewPermission) {
    echo "✅ users.view permission exists:\n";
    echo "   ID: {$usersViewPermission['id']}\n";
    echo "   Name: {$usersViewPermission['name']}\n";
    echo "   Description: {$usersViewPermission['description']}\n\n";
} else {
    echo "❌ users.view permission NOT FOUND!\n";
    echo "   This is why the Promoter Activity menu is not visible.\n\n";

    // Create the missing permission
    echo "Creating users.view permission...\n";
    $stmt = $pdo->prepare("
        INSERT INTO permissions (name, description, module, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $now = date('Y-m-d H:i:s');
    $stmt->execute([
        'users.view',
        'View users and user management',
        'users',
        1,
        $now,
        $now
    ]);

    $permissionId = $pdo->lastInsertId();
    echo "✅ Created users.view permission (ID: {$permissionId})\n\n";

    // Assign to Super Admin role
    $stmt = $pdo->query("SELECT id FROM roles WHERE name = 'Super Admin'");
    $superAdminRole = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($superAdminRole) {
        // Check if assignment already exists
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count FROM role_has_permissions
            WHERE role_id = ? AND permission_id = ?
        ");
        $stmt->execute([$superAdminRole['id'], $permissionId]);
        $exists = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($exists['count'] == 0) {
            $stmt = $pdo->prepare("
                INSERT INTO role_has_permissions (role_id, permission_id)
                VALUES (?, ?)
            ");
            $stmt->execute([$superAdminRole['id'], $permissionId]);
            echo "✅ Assigned users.view to Super Admin role\n";
        }
    }
}

// Check if current user has users.view through their roles
$stmt = $pdo->prepare("
    SELECT COUNT(*) as count
    FROM permissions p
    JOIN role_has_permissions rhp ON p.id = rhp.permission_id
    JOIN model_has_roles mhr ON rhp.role_id = mhr.role_id
    WHERE p.name = 'users.view'
    AND mhr.model_id = ?
    AND mhr.model_type = 'App\\\\Models\\\\User'
");
$stmt->execute([$user['id']]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);

$hasPermission = $result['count'] > 0;

echo "\n📋 **Permission Check Results:**\n";
echo "==============================\n";
echo "User has users.view permission: " . ($hasPermission ? "✅ YES" : "❌ NO") . "\n";

if ($hasPermission) {
    echo "\n🎉 **Promoter Activity menu should now be visible!**\n";
    echo "   1. Refresh your browser at https://vair.test\n";
    echo "   2. Clear browser cache if needed (Ctrl+F5)\n";
    echo "   3. Login as admin@li-council.com\n";
    echo "   4. Look for 'Promoter Activity' in the sidebar\n";
} else {
    echo "\n❌ **Menu will NOT be visible** because user lacks users.view permission\n";
    echo "   The user needs to be assigned to a role that has users.view permission\n";
}

echo "\n🔧 **Troubleshooting Steps:**\n";
echo "1. Clear browser cache (Ctrl+F5)\n";
echo "2. Check browser console for JavaScript errors\n";
echo "3. Verify user is logged in as admin@li-council.com\n";
echo "4. Ensure the frontend build completed successfully\n";
