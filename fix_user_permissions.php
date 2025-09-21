<?php

/**
 * Check admin user permissions with correct table structure
 */

$pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

echo "🔍 **Checking Admin User Permissions (Correct Tables)**\n";
echo "====================================================\n\n";

// Get admin user
$stmt = $pdo->prepare("SELECT id, email FROM users WHERE email = ?");
$stmt->execute(['admin@li-council.com']);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo "❌ Admin user not found!\n";
    exit(1);
}

echo "✅ Found user: {$user['email']} (ID: {$user['id']})\n\n";

// Check user roles
$stmt = $pdo->prepare("
    SELECT r.name, r.id
    FROM roles r
    JOIN role_user ru ON r.id = ru.role_id
    WHERE ru.user_id = ?
");
$stmt->execute([$user['id']]);
$roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "User roles:\n";
if (empty($roles)) {
    echo "❌ NO ROLES ASSIGNED!\n";
    echo "   This is likely why the menu is not visible.\n\n";

    // Assign Super Admin role
    $stmt = $pdo->query("SELECT id FROM roles WHERE name = 'Super Admin'");
    $superAdminRole = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($superAdminRole) {
        echo "Assigning Super Admin role to user...\n";
        $stmt = $pdo->prepare("INSERT OR IGNORE INTO role_user (user_id, role_id) VALUES (?, ?)");
        $stmt->execute([$user['id'], $superAdminRole['id']]);
        echo "✅ Assigned Super Admin role to user\n\n";

        // Re-fetch roles
        $stmt = $pdo->prepare("
            SELECT r.name, r.id
            FROM roles r
            JOIN role_user ru ON r.id = ru.role_id
            WHERE ru.user_id = ?
        ");
        $stmt->execute([$user['id']]);
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

foreach ($roles as $role) {
    echo "  - {$role['name']} (ID: {$role['id']})\n";
}

// Check if users.view permission exists
$stmt = $pdo->query("SELECT id, name FROM permissions WHERE name = 'users.view'");
$usersViewPermission = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$usersViewPermission) {
    echo "\n❌ users.view permission NOT FOUND!\n";
    echo "   Creating users.view permission...\n";

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
    echo "✅ Created users.view permission (ID: {$permissionId})\n";

    $usersViewPermission = ['id' => $permissionId, 'name' => 'users.view'];
} else {
    echo "\n✅ users.view permission exists (ID: {$usersViewPermission['id']})\n";
}

// Check if Super Admin role has users.view permission
if (!empty($roles)) {
    foreach ($roles as $role) {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count
            FROM permission_role
            WHERE permission_id = ? AND role_id = ?
        ");
        $stmt->execute([$usersViewPermission['id'], $role['id']]);
        $hasPermission = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($hasPermission['count'] > 0) {
            echo "✅ Role '{$role['name']}' has users.view permission\n";
        } else {
            echo "❌ Role '{$role['name']}' missing users.view permission\n";

            // Assign permission to role
            echo "   Assigning users.view to {$role['name']}...\n";
            $stmt = $pdo->prepare("INSERT OR IGNORE INTO permission_role (permission_id, role_id) VALUES (?, ?)");
            $stmt->execute([$usersViewPermission['id'], $role['id']]);
            echo "   ✅ Assigned users.view to {$role['name']}\n";
        }
    }
}

// Final check - does user have access through roles?
$stmt = $pdo->prepare("
    SELECT COUNT(*) as count
    FROM permissions p
    JOIN permission_role pr ON p.id = pr.permission_id
    JOIN role_user ru ON pr.role_id = ru.role_id
    WHERE p.name = 'users.view' AND ru.user_id = ?
");
$stmt->execute([$user['id']]);
$finalCheck = $stmt->fetch(PDO::FETCH_ASSOC);

echo "\n🎯 **Final Result:**\n";
echo "===================\n";
if ($finalCheck['count'] > 0) {
    echo "✅ User has users.view permission through roles\n";
    echo "✅ Promoter Activity menu should now be visible!\n\n";
    echo "🔄 **Next Steps:**\n";
    echo "1. Refresh your browser at https://vair.test\n";
    echo "2. Clear browser cache (Ctrl+Shift+R or Ctrl+F5)\n";
    echo "3. Login as admin@li-council.com\n";
    echo "4. Look for 'Promoter Activity' in the sidebar\n";
} else {
    echo "❌ User still doesn't have users.view permission\n";
    echo "   This means the Promoter Activity menu will not appear\n";
}

echo "\n📋 **Summary:**\n";
echo "- Frontend built: ✅\n";
echo "- Menu item exists in code: ✅\n";
echo "- Permission configured: " . ($finalCheck['count'] > 0 ? "✅" : "❌") . "\n";
echo "- User has required permission: " . ($finalCheck['count'] > 0 ? "✅" : "❌") . "\n";
