<?php

/**
 * Verification script for Vivo Feedback Export Button at /admin/feedback
 */

echo "=== VIVO FEEDBACK EXPORT BUTTON VERIFICATION ===\n\n";

// 1. Check Frontend Component Structure
echo "1. Frontend Component Verification:\n";
echo "===================================\n";

$feedbackManagementPath = 'resources/js/components/pages/FeedbackManagement.jsx';
if (file_exists($feedbackManagementPath)) {
    echo "✅ FeedbackManagement.jsx found\n";

    $content = file_get_contents($feedbackManagementPath);

    // Check for export button elements
    $checks = [
        'Download' => 'Download icon import',
        'exportDropdownOpen' => 'Export dropdown state',
        'exportAllFeedbacks' => 'Export all function',
        'exportVivoExperience' => 'Export Vivo function',
        'Export All Feedbacks (CSV)' => 'Export all button text',
        'Export Vivo Experience (CSV)' => 'Export Vivo button text',
        'export-dropdown-container' => 'Export container class'
    ];

    foreach ($checks as $search => $description) {
        if (strpos($content, $search) !== false) {
            echo "✅ {$description} - Found\n";
        } else {
            echo "❌ {$description} - Missing\n";
        }
    }
} else {
    echo "❌ FeedbackManagement.jsx not found\n";
}

echo "\n2. Backend API Verification:\n";
echo "============================\n";

// Check if FeedbackController has export methods
$controllerPath = 'app/Http/Controllers/FeedbackController.php';
if (file_exists($controllerPath)) {
    echo "✅ FeedbackController.php found\n";

    $content = file_get_contents($controllerPath);

    $exportMethods = [
        'exportCsv' => 'Export CSV method',
        'exportVivoExperienceCsv' => 'Export Vivo CSV method'
    ];

    foreach ($exportMethods as $method => $description) {
        if (strpos($content, "function {$method}") !== false) {
            echo "✅ {$description} - Implemented\n";
        } else {
            echo "❌ {$description} - Missing\n";
        }
    }
} else {
    echo "❌ FeedbackController.php not found\n";
}

echo "\n3. Route Configuration Verification:\n";
echo "====================================\n";

// Check API routes
$apiRoutesPath = 'routes/api.php';
if (file_exists($apiRoutesPath)) {
    $content = file_get_contents($apiRoutesPath);

    $routes = [
        'export-csv' => 'Export CSV route',
        'export-vivo-csv' => 'Export Vivo CSV route'
    ];

    foreach ($routes as $route => $description) {
        if (strpos($content, $route) !== false) {
            echo "✅ {$description} - Configured\n";
        } else {
            echo "❌ {$description} - Missing\n";
        }
    }
} else {
    echo "❌ API routes file not found\n";
}

// Check web route (should have catch-all for React)
$webRoutesPath = 'routes/web.php';
if (file_exists($webRoutesPath)) {
    $content = file_get_contents($webRoutesPath);
    if (strpos($content, '{any}') !== false && strpos($content, 'welcome') !== false) {
        echo "✅ React catch-all route - Configured\n";
    } else {
        echo "❌ React catch-all route - Missing\n";
    }
} else {
    echo "❌ Web routes file not found\n";
}

echo "\n4. Admin Panel Route Verification:\n";
echo "==================================\n";

// Check AdminPanel.jsx for /admin/feedback route
$adminPanelPath = 'resources/js/components/AdminPanel.jsx';
if (file_exists($adminPanelPath)) {
    echo "✅ AdminPanel.jsx found\n";

    $content = file_get_contents($adminPanelPath);

    if (strpos($content, '/admin/feedback') !== false) {
        echo "✅ /admin/feedback route - Configured\n";
    } else {
        echo "❌ /admin/feedback route - Missing\n";
    }

    if (strpos($content, 'FeedbackApp') !== false) {
        echo "✅ FeedbackApp component - Referenced\n";
    } else {
        echo "❌ FeedbackApp component - Missing\n";
    }
} else {
    echo "❌ AdminPanel.jsx not found\n";
}

echo "\n5. Build Status Check:\n";
echo "======================\n";

// Check if build files exist
$buildPaths = [
    'public/build/manifest.json' => 'Vite build manifest',
    'public/build' => 'Build directory'
];

foreach ($buildPaths as $path => $description) {
    if (file_exists($path)) {
        echo "✅ {$description} - Present\n";
    } else {
        echo "❌ {$description} - Missing\n";
    }
}

echo "\n=== TROUBLESHOOTING GUIDE ===\n\n";

echo "📍 **Where to find the Export button:**\n";
echo "URL: https://vair.test/admin/feedback\n";
echo "Location: Top-right corner, between 'Analytics' and 'Vivo Experience' buttons\n";
echo "Appearance: Outline button with Download icon and 'Export' text\n\n";

echo "🔍 **If Export button is NOT visible:**\n\n";

echo "**Step 1: Check Browser Console**\n";
echo "- Press F12 to open Developer Tools\n";
echo "- Navigate to /admin/feedback\n";
echo "- Check Console tab for JavaScript errors\n";
echo "- Look for any React component loading errors\n\n";

echo "**Step 2: Check Element Inspection**\n";
echo "- Right-click in the button area (top-right of page)\n";
echo "- Select 'Inspect Element'\n";
echo "- Look for div with class 'export-dropdown-container'\n";
echo "- Check if button HTML is present but hidden by CSS\n\n";

echo "**Step 3: Verify Authentication**\n";
echo "- Ensure you're logged in to the admin panel\n";
echo "- Check that you have proper permissions\n";
echo "- Try refreshing the page\n\n";

echo "**Step 4: Clear Cache & Rebuild**\n";
echo "- Clear browser cache (Ctrl+F5)\n";
echo "- Run 'npm run build' to rebuild frontend\n";
echo "- Check if dev server is running with 'npm run dev'\n\n";

echo "🎯 **Expected Button Behavior:**\n";
echo "1. Click 'Export' button to open dropdown menu\n";
echo "2. Two options should appear:\n";
echo "   - 'Export All Feedbacks (CSV)' - Downloads all feedback data\n";
echo "   - 'Export Vivo Experience (CSV)' - Downloads only Vivo feedback\n";
echo "3. Files download automatically with timestamp in filename\n\n";

echo "✅ **If everything looks correct above, the export functionality should be working!**\n";
echo "\nPlease navigate to https://vair.test/admin/feedback and check for the Export button.\n";

?>
