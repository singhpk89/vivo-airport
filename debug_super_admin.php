<?php

/**
 * Debug Super Admin permissions specifically
 */

$pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

echo "🔍 **DEBUGGING SUPER ADMIN PERMISSIONS**\n";
echo "======================================\n\n";

// Check what email you're actually using
echo "📧 **Available Admin Users:**\n";
$stmt = $pdo->query("SELECT id, email, name FROM users ORDER BY id");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($users as $user) {
    echo "  - {$user['email']} (ID: {$user['id']}, Name: {$user['name']})\n";
}

echo "\n🔍 **Checking Super Admin Role:**\n";

// Find Super Admin role
$stmt = $pdo->query("SELECT id, name FROM roles WHERE name LIKE '%Super%' OR name LIKE '%admin%'");
$roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Available admin roles:\n";
foreach ($roles as $role) {
    echo "  - {$role['name']} (ID: {$role['id']})\n";

    // Check users with this role
    $stmt2 = $pdo->prepare("
        SELECT u.email, u.name
        FROM users u
        JOIN role_user ru ON u.id = ru.user_id
        WHERE ru.role_id = ?
    ");
    $stmt2->execute([$role['id']]);
    $roleUsers = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    if (empty($roleUsers)) {
        echo "    ❌ No users assigned to this role\n";
    } else {
        echo "    Users with this role:\n";
        foreach ($roleUsers as $roleUser) {
            echo "      - {$roleUser['email']} ({$roleUser['name']})\n";
        }
    }

    // Check permissions for this role
    $stmt3 = $pdo->prepare("
        SELECT p.name
        FROM permissions p
        JOIN permission_role pr ON p.id = pr.permission_id
        WHERE pr.role_id = ? AND p.name LIKE '%user%'
    ");
    $stmt3->execute([$role['id']]);
    $permissions = $stmt3->fetchAll(PDO::FETCH_COLUMN);

    if (empty($permissions)) {
        echo "    ❌ No user-related permissions\n";
    } else {
        echo "    User-related permissions:\n";
        foreach ($permissions as $perm) {
            echo "      - {$perm}\n";
        }
    }
    echo "\n";
}

// Check if there's a user that should be Super Admin
$potentialSuperAdmins = ['admin@li-council.com', 'super@admin.com', 'superadmin@li-council.com'];

echo "🔧 **Fixing Super Admin Assignment:**\n";

foreach ($potentialSuperAdmins as $email) {
    $stmt = $pdo->prepare("SELECT id, email FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "Found user: {$user['email']}\n";

        // Find Super Admin role
        $stmt = $pdo->query("SELECT id FROM roles WHERE name = 'Super Admin' OR name = 'super admin' OR name LIKE '%Super%'");
        $superAdminRole = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($superAdminRole) {
            // Assign Super Admin role
            $stmt = $pdo->prepare("INSERT OR IGNORE INTO role_user (user_id, role_id) VALUES (?, ?)");
            $stmt->execute([$user['id'], $superAdminRole['id']]);
            echo "✅ Assigned Super Admin role to {$user['email']}\n";

            // Ensure Super Admin role has users.view permission
            $stmt = $pdo->query("SELECT id FROM permissions WHERE name = 'users.view'");
            $usersViewPerm = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usersViewPerm) {
                $stmt = $pdo->prepare("INSERT OR IGNORE INTO permission_role (permission_id, role_id) VALUES (?, ?)");
                $stmt->execute([$usersViewPerm['id'], $superAdminRole['id']]);
                echo "✅ Assigned users.view permission to Super Admin role\n";
            }
        }
    }
}

echo "\n🎯 **Final Check - Who Can See Promoter Activity Menu:**\n";
$stmt = $pdo->query("
    SELECT DISTINCT u.email, u.name, r.name as role_name
    FROM users u
    JOIN role_user ru ON u.id = ru.user_id
    JOIN roles r ON ru.role_id = r.id
    JOIN permission_role pr ON r.id = pr.role_id
    JOIN permissions p ON pr.permission_id = p.id
    WHERE p.name = 'users.view'
    ORDER BY u.email
");

$eligibleUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($eligibleUsers)) {
    echo "❌ NO USERS can see the Promoter Activity menu!\n";
    echo "   This explains why it's not visible.\n";
} else {
    echo "✅ Users who CAN see Promoter Activity menu:\n";
    foreach ($eligibleUsers as $user) {
        echo "  - {$user['email']} ({$user['name']}) via {$user['role_name']} role\n";
    }
}

echo "\n📝 **Quick Fix Instructions:**\n";
echo "1. Make sure you're logged in with one of the emails listed above\n";
echo "2. If no users are listed, the permissions need to be fixed\n";
echo "3. Hard refresh your browser (Ctrl+Shift+R)\n";
echo "4. Check browser console for JavaScript errors\n";
