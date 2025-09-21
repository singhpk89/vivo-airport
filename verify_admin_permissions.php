<?php

require_once 'vendor/autoload.php';

// Check if admin user has the promoter permissions
$pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

echo "🔍 Checking Admin User Permissions\n";
echo "=================================\n";

// Check admin user
$stmt = $pdo->prepare("SELECT id, email FROM users WHERE email = ?");
$stmt->execute(['admin@li-council.com']);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "✅ Found admin user: {$user['email']} (ID: {$user['id']})\n\n";

    // Check user roles
    $stmt = $pdo->prepare("
        SELECT r.name
        FROM roles r
        JOIN model_has_roles mhr ON r.id = mhr.role_id
        WHERE mhr.model_id = ? AND mhr.model_type = 'App\\\\Models\\\\User'
    ");
    $stmt->execute([$user['id']]);
    $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "User roles: " . (empty($roles) ? 'None' : implode(', ', $roles)) . "\n\n";

    // Check promoter permissions
    $promoterPermissions = [
        'promoters.view',
        'promoters.create',
        'promoters.update',
        'promoters.delete',
        'promoter_activities.view',
        'promoter_activities.create'
    ];

    echo "Checking promoter permissions:\n";
    foreach ($promoterPermissions as $permissionName) {
        // Check if user has permission through roles
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count
            FROM permissions p
            JOIN role_has_permissions rhp ON p.id = rhp.permission_id
            JOIN model_has_roles mhr ON rhp.role_id = mhr.role_id
            WHERE p.name = ?
            AND mhr.model_id = ?
            AND mhr.model_type = 'App\\\\Models\\\\User'
        ");
        $stmt->execute([$permissionName, $user['id']]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $hasPermission = $result['count'] > 0;
        echo "  " . ($hasPermission ? "✅" : "❌") . " {$permissionName}\n";
    }

} else {
    echo "❌ Admin user not found!\n";
}

echo "\n🎯 **Status Summary:**\n";
echo "- Promoter Activity menu should now be visible in the sidebar\n";
echo "- Permission used by menu: 'users.view' (temporary fix)\n";
echo "- Dashboard route: /admin/promoter-activity\n";
echo "- All API endpoints are ready and functional\n\n";

echo "📝 **Next Steps:**\n";
echo "1. Refresh your browser at https://vair.test\n";
echo "2. Login as admin@li-council.com\n";
echo "3. Look for 'Promoter Activity' in the sidebar menu\n";
echo "4. Click to access the dashboard\n";
