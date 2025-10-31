<?php

/**
 * Simple test to verify export endpoints are accessible
 */

echo "=== TESTING EXPORT ENDPOINTS ===\n\n";

// Test the export routes exist in the routes file
$routesContent = file_get_contents('routes/api.php');

if (strpos($routesContent, 'export-csv') !== false) {
    echo "✅ Export CSV route found in routes/api.php\n";
} else {
    echo "❌ Export CSV route NOT found in routes/api.php\n";
}

if (strpos($routesContent, 'export-vivo-csv') !== false) {
    echo "✅ Export Vivo CSV route found in routes/api.php\n";
} else {
    echo "❌ Export Vivo CSV route NOT found in routes/api.php\n";
}

// Test basic API accessibility (without authentication)
echo "\nTesting API endpoint accessibility:\n";

$baseUrl = 'https://vair.test';
$endpoints = [
    '/api/feedbacks/export-csv' => 'All Feedbacks Export',
    '/api/feedbacks/export-vivo-csv' => 'Vivo Experience Export'
];

foreach ($endpoints as $endpoint => $name) {
    $url = $baseUrl . $endpoint;

    // Create context with headers (this will fail without auth, but we can check if route exists)
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => 'Accept: application/json',
            'timeout' => 10
        ]
    ]);

    $response = @file_get_contents($url, false, $context);

    if ($response !== false) {
        echo "✅ {$name} - Endpoint accessible (response received)\n";
    } else {
        // Check if it's a 401/403 (which means route exists but needs auth)
        if (isset($http_response_header)) {
            $statusLine = $http_response_header[0] ?? '';
            if (strpos($statusLine, '401') !== false || strpos($statusLine, '403') !== false) {
                echo "✅ {$name} - Route exists (needs authentication)\n";
            } else {
                echo "⚠️ {$name} - Response: {$statusLine}\n";
            }
        } else {
            echo "❌ {$name} - Endpoint not accessible\n";
        }
    }
}

echo "\n=== FRONTEND DEBUGGING TIPS ===\n";
echo "If the Export button is not visible:\n\n";

echo "1. Check browser developer console for JavaScript errors\n";
echo "2. Verify the button styling is not causing visibility issues\n";
echo "3. Inspect element to see if the button HTML is present but hidden\n";
echo "4. Check if React component is mounting properly\n";
echo "5. Look for any CSS conflicts hiding the button\n\n";

echo "Expected button location: Feedback Management page → Top right → Between 'Analytics' and 'Vivo Experience' buttons\n\n";

echo "Debug steps:\n";
echo "- Open browser dev tools (F12)\n";
echo "- Navigate to Feedback Management\n";
echo "- Check Console tab for errors\n";
echo "- Check Elements tab to inspect button area\n";
echo "- Look for export button with blue background styling\n";

?>
