<?php

// Test script for PowerPoint export endpoint with authentication
// Usage: php test_ppt_export.php

require_once 'vendor/autoload.php';

$baseUrl = 'https://li-council.uplive.at'; // Correct Herd URL

// Step 1: Login to get authentication token
echo "Step 1: Authenticating...\n";
echo "Login URL: {$baseUrl}/api/mobile/auth/login\n";

// Use test credentials (update these with real credentials)
$loginData = [
    'username' => 'testpromoter',  // Real username from database
    'password' => 'password123'    // Update with real password
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/mobile/auth/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json',
]);

$loginResponse = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$loginError = curl_error($ch);
curl_close($ch);

echo "Login HTTP Status: {$loginHttpCode}\n";

if ($loginError) {
    echo "Login cURL Error: {$loginError}\n";
    exit(1);
}

if ($loginHttpCode !== 200) {
    echo "Login failed!\n";
    echo "Response: {$loginResponse}\n";
    exit(1);
}

$loginData = json_decode($loginResponse, true);
if (!isset($loginData['token'])) {
    echo "No token received from login!\n";
    echo "Response: {$loginResponse}\n";
    exit(1);
}

$token = $loginData['token'];
echo "✅ Login successful! Token obtained.\n\n";

// Step 2: Test PowerPoint export with authentication
echo "Step 2: Testing PowerPoint export...\n";
$endpoint = '/api/mobile/activities/export-ppt';
echo "Export URL: {$baseUrl}{$endpoint}\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . $endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 60); // Longer timeout for PowerPoint generation
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);
curl_close($ch);

echo "Export HTTP Status: {$httpCode}\n";
echo "Content Type: {$contentType}\n";

if ($error) {
    echo "Export cURL Error: {$error}\n";
} else {
    if ($httpCode === 200) {
        if (strpos($contentType, 'application/vnd.openxmlformats-officedocument.presentationml.presentation') !== false) {
            // Save the PowerPoint file
            $filename = 'test_export_' . date('Y-m-d_H-i-s') . '.pptx';
            file_put_contents($filename, $response);
            echo "✅ PowerPoint export successful!\n";
            echo "📁 File saved as: {$filename}\n";
            echo "📊 File size: " . number_format(strlen($response)) . " bytes\n";
        } else {
            echo "✅ Export successful but unexpected content type\n";
            echo "Response: " . substr($response, 0, 500) . "...\n";
        }
    } else {
        echo "Response:\n";
        echo $response . "\n";
    }
}

// Explain status codes
if ($httpCode === 401) {
    echo "\n🔒 Authentication failed - check credentials\n";
} elseif ($httpCode === 404) {
    echo "\n❌ No activities found for export - user may have no activities\n";
} elseif ($httpCode === 422) {
    echo "\n⚠️ Validation error - check request parameters\n";
} elseif ($httpCode === 500) {
    echo "\n💥 Server error - check server logs or memory/timeout issues\n";
} elseif ($httpCode === 200) {
    echo "\n🎉 Export completed successfully!\n";
}

echo "\nDone.\n";
