<?php

/**
 * Test Promoter Activity API endpoint
 */

// Test the promoter activity API endpoint
$url = 'https://vair.test/api/admin/promoter-reports/dashboard';

// Get CSRF token from the application
$mainPageResponse = file_get_contents('https://vair.test');
preg_match('/name="_token" value="([^"]+)"/', $mainPageResponse, $matches);
$csrfToken = $matches[1] ?? '';

// Get the auth token (assuming it's stored in a cookie or session)
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json',
            'X-CSRF-TOKEN: ' . $csrfToken,
            'Cookie: laravel_session=...' // You'll need to get this from browser
        ]
    ]
]);

echo "Testing Promoter Activity Dashboard API...\n";
echo "=========================================\n";

echo "URL: $url\n";
echo "CSRF Token: " . substr($csrfToken, 0, 10) . "...\n\n";

try {
    $response = file_get_contents($url, false, $context);

    if ($response !== false) {
        $data = json_decode($response, true);

        if ($data) {
            echo "✅ API Response received successfully!\n";
            echo "Response structure:\n";
            print_r(array_keys($data));

            if (isset($data['totalActivities'])) {
                echo "\nTotal Activities: " . $data['totalActivities'] . "\n";
            }

            if (isset($data['activities'])) {
                echo "Activities count: " . count($data['activities']) . "\n";
            }
        } else {
            echo "❌ Invalid JSON response\n";
            echo "Raw response: " . substr($response, 0, 200) . "...\n";
        }
    } else {
        echo "❌ Failed to fetch data from API\n";
        $error = error_get_last();
        echo "Error: " . ($error['message'] ?? 'Unknown error') . "\n";
    }

} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}

echo "\nNote: You may need to manually test this in the browser since authentication is required.\n";
