<?php

require_once 'vendor/autoload.php';

// Quick and dirty check
$pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

echo "Checking permissions...\n";
echo "======================\n";

// Check permissions table
$stmt = $pdo->query("SELECT name FROM permissions WHERE name LIKE '%promoter%'");
$permissions = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (empty($permissions)) {
    echo "❌ No promoter permissions found!\n";

    // Add missing promoters.view permission
    echo "Adding promoters.view permission...\n";
    $stmt = $pdo->prepare("INSERT INTO permissions (name, guard_name, created_at, updated_at) VALUES (?, 'web', datetime('now'), datetime('now'))");
    $stmt->execute(['promoters.view']);
    echo "✅ Added promoters.view permission\n";

} else {
    echo "Found permissions:\n";
    foreach ($permissions as $perm) {
        echo "- $perm\n";
    }
}

// Get admin user ID
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute(['admin@li-council.com']);
$adminUser = $stmt->fetch(PDO::FETCH_ASSOC);

if ($adminUser) {
    echo "\nAdmin user ID: " . $adminUser['id'] . "\n";

    // Get user's roles
    $stmt = $pdo->prepare("
        SELECT r.name
        FROM roles r
        JOIN model_has_roles mhr ON r.id = mhr.role_id
        WHERE mhr.model_id = ? AND mhr.model_type = 'App\\\\Models\\\\User'
    ");
    $stmt->execute([$adminUser['id']]);
    $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "User roles: " . implode(', ', $roles) . "\n";

    // Check if Super Admin role has promoters.view permission
    $stmt = $pdo->query("
        SELECT p.name
        FROM permissions p
        JOIN role_has_permissions rhp ON p.id = rhp.permission_id
        JOIN roles r ON rhp.role_id = r.id
        WHERE r.name = 'Super Admin' AND p.name = 'promoters.view'
    ");
    $hasPermission = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$hasPermission) {
        echo "❌ Super Admin role doesn't have promoters.view permission\n";
        echo "Adding permission to Super Admin role...\n";

        // Get role and permission IDs
        $stmt = $pdo->query("SELECT id FROM roles WHERE name = 'Super Admin'");
        $roleId = $stmt->fetchColumn();

        $stmt = $pdo->query("SELECT id FROM permissions WHERE name = 'promoters.view'");
        $permissionId = $stmt->fetchColumn();

        if ($roleId && $permissionId) {
            $stmt = $pdo->prepare("INSERT OR IGNORE INTO role_has_permissions (role_id, permission_id) VALUES (?, ?)");
            $stmt->execute([$roleId, $permissionId]);
            echo "✅ Added promoters.view to Super Admin role\n";
        }
    } else {
        echo "✅ Super Admin role has promoters.view permission\n";
    }
} else {
    echo "❌ Admin user not found!\n";
}

echo "\nDone!\n";
