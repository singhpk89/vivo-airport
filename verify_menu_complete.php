<?php

echo "🎯 **PROMOTER ACTIVITY MENU - FINAL VERIFICATION**\n";
echo "===============================================\n\n";

// Check all components
$checks = [
    'Database Permissions' => false,
    'User Role Assignment' => false,
    'Frontend Built' => false,
    'Menu Code Present' => false,
    'Route Registered' => false
];

$pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

// 1. Check database permissions
$stmt = $pdo->query("SELECT COUNT(*) as count FROM permissions WHERE name = 'users.view'");
$result = $stmt->fetch();
$checks['Database Permissions'] = $result['count'] > 0;

// 2. Check user role assignment
$stmt = $pdo->prepare("
    SELECT COUNT(*) as count
    FROM permissions p
    JOIN permission_role pr ON p.id = pr.permission_id
    JOIN role_user ru ON pr.role_id = ru.role_id
    JOIN users u ON ru.user_id = u.id
    WHERE p.name = 'users.view' AND u.email = 'admin@li-council.com'
");
$stmt->execute();
$result = $stmt->fetch();
$checks['User Role Assignment'] = $result['count'] > 0;

// 3. Check frontend build
$checks['Frontend Built'] = file_exists('public/build/manifest.json');

// 4. Check menu code
$sidebarContent = file_get_contents('resources/js/components/layout/Sidebar.jsx');
$checks['Menu Code Present'] = strpos($sidebarContent, 'Promoter Activity') !== false;

// 5. Check route registration
$adminPanelContent = file_get_contents('resources/js/components/AdminPanel.jsx');
$checks['Route Registered'] = strpos($adminPanelContent, '/admin/promoter-activity') !== false;

// Display results
foreach ($checks as $check => $status) {
    echo ($status ? "✅" : "❌") . " {$check}\n";
}

$allPassed = !in_array(false, $checks);

echo "\n" . str_repeat("=", 50) . "\n";

if ($allPassed) {
    echo "🎉 **ALL CHECKS PASSED!**\n\n";
    echo "The Promoter Activity menu should now be visible.\n\n";
    echo "🔄 **To see the menu:**\n";
    echo "1. Go to: https://vair.test\n";
    echo "2. Login as: admin@li-council.com\n";
    echo "3. **IMPORTANT:** Hard refresh the page (Ctrl+Shift+R or Ctrl+F5)\n";
    echo "4. Look for 'Promoter Activity' in the left sidebar\n";
    echo "5. Click on it to access the dashboard\n\n";

    echo "📱 **If menu still not visible:**\n";
    echo "- Open browser Developer Tools (F12)\n";
    echo "- Check Console tab for JavaScript errors\n";
    echo "- Try logging out and logging back in\n";
    echo "- Try a different browser or incognito mode\n\n";

    echo "📊 **Menu Location:**\n";
    echo "The 'Promoter Activity' menu should appear in the sidebar\n";
    echo "between 'Promoters' and 'Roles' menu items.\n";

} else {
    echo "❌ **SOME CHECKS FAILED**\n\n";
    echo "Please check the failed items above.\n";
}

echo "\n🎯 **Menu Features (Once Visible):**\n";
echo "- View all promoter daily activities\n";
echo "- See login/logout times with GPS coordinates\n";
echo "- Browse activity photo galleries\n";
echo "- Filter by date, promoter, or status\n";
echo "- Export activity reports\n";
echo "- Real-time activity monitoring\n";
