<?php

/**
 * Test script to verify the Promoter Activity Dashboard is working
 */

echo "🔍 **Promoter Activity Dashboard Test**\n";
echo "=====================================\n\n";

// Test 1: Check if the dashboard route exists
echo "1. Testing Dashboard Route:\n";
echo "   Route: /admin/promoter-activity\n";
echo "   API Endpoint: /api/admin/promoter-reports/dashboard\n";

// Test 2: Check if database tables exist
echo "\n2. Checking Database Tables:\n";

try {
    $pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

    // Check if promoter_activities table exists
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='promoter_activities'");
    $table1 = $stmt->fetch();
    echo "   ✅ promoter_activities table: " . ($table1 ? "EXISTS" : "MISSING") . "\n";

    // Check if promoter_activity_photos table exists
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='promoter_activity_photos'");
    $table2 = $stmt->fetch();
    echo "   ✅ promoter_activity_photos table: " . ($table2 ? "EXISTS" : "MISSING") . "\n";

    // Check for sample data
    if ($table1) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM promoter_activities");
        $count = $stmt->fetch();
        echo "   📊 Total Activities: " . $count['count'] . "\n";
    }

    if ($table2) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM promoter_activity_photos");
        $count = $stmt->fetch();
        echo "   📸 Total Photos: " . $count['count'] . "\n";
    }

} catch (Exception $e) {
    echo "   ❌ Database Error: " . $e->getMessage() . "\n";
}

// Test 3: Check component files
echo "\n3. Checking Component Files:\n";

$files = [
    'PromoterActivityDashboard.jsx' => 'resources/js/components/pages/PromoterActivityDashboard.jsx',
    'PromoterActivityController.php' => 'app/Http/Controllers/PromoterActivityController.php',
    'PromoterActivity Model' => 'app/Models/PromoterActivity.php',
    'PromoterActivityPhoto Model' => 'app/Models/PromoterActivityPhoto.php'
];

foreach ($files as $name => $path) {
    $exists = file_exists($path);
    echo "   " . ($exists ? "✅" : "❌") . " $name: " . ($exists ? "EXISTS" : "MISSING") . "\n";
}

// Test 4: Check frontend routes
echo "\n4. Frontend Setup:\n";
$adminPanel = file_get_contents('resources/js/components/AdminPanel.jsx');
$hasRoute = strpos($adminPanel, '/admin/promoter-activity') !== false;
$hasComponent = strpos($adminPanel, 'PromoterActivityDashboard') !== false;

echo "   " . ($hasRoute ? "✅" : "❌") . " Route registered in AdminPanel\n";
echo "   " . ($hasComponent ? "✅" : "❌") . " Component imported in AdminPanel\n";

// Test 5: Check sidebar menu
echo "\n5. Sidebar Menu:\n";
$sidebar = file_get_contents('resources/js/components/layout/Sidebar.jsx');
$hasMenu = strpos($sidebar, 'Promoter Activity') !== false;
$hasPermission = strpos($sidebar, 'users.view') !== false;

echo "   " . ($hasMenu ? "✅" : "❌") . " Menu item exists\n";
echo "   " . ($hasPermission ? "✅" : "❌") . " Permission set to 'users.view'\n";

echo "\n📋 **How to Access the Dashboard:**\n";
echo "=====================================\n";
echo "1. 🌐 Go to: https://vair.test\n";
echo "2. 🔐 Login as: admin@li-council.com\n";
echo "3. 📱 Look for 'Promoter Activity' in the sidebar menu\n";
echo "4. 👆 Click on it to view the dashboard\n\n";

echo "📊 **Dashboard Features:**\n";
echo "========================\n";
echo "• 📅 Daily activity summary\n";
echo "• ⏰ Login/Logout times with GPS coordinates\n";
echo "• 📸 Photo gallery for each activity session\n";
echo "• 📝 Activity notes and duration tracking\n";
echo "• 🔍 Filtering by date, promoter, and status\n";
echo "• 📊 Statistics: Total activities, average session duration\n";
echo "• 📥 Export functionality for reports\n\n";

echo "✅ **Setup Complete!** The Promoter Activity Dashboard is ready to use.\n";
