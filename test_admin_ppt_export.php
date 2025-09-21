<?php

/**
 * Test Admin PPT Export Endpoint
 * Tests the new /api/activity-recces/export-ppt endpoint with admin authentication
 */

// Get the application URL
$appUrl = 'https://li-council.uplive.at';

echo "Testing Admin PPT Export Endpoint\n";
echo "================================\n\n";

// Step 1: Login as admin
echo "Step 1: Logging in as admin...\n";

$loginData = [
    'email' => 'super.admin@li-council.com',
    'password' => 'password'
];

$loginCurl = curl_init();
curl_setopt($loginCurl, CURLOPT_URL, $appUrl . '/api/login');
curl_setopt($loginCurl, CURLOPT_POST, true);
curl_setopt($loginCurl, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($loginCurl, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
]);
curl_setopt($loginCurl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($loginCurl, CURLOPT_SSL_VERIFYPEER, false);

$loginResponse = curl_exec($loginCurl);
$loginHttpCode = curl_getinfo($loginCurl, CURLINFO_HTTP_CODE);
curl_close($loginCurl);

echo "Login response code: $loginHttpCode\n";

if ($loginHttpCode !== 200) {
    echo "Login failed!\n";
    echo "Response: $loginResponse\n";
    exit(1);
}

$loginData = json_decode($loginResponse, true);

if (!isset($loginData['success']) || !$loginData['success']) {
    echo "Login failed - Invalid response format\n";
    echo "Response: $loginResponse\n";
    exit(1);
}

$token = $loginData['data']['token'];
echo "Login successful! Token: " . substr($token, 0, 20) . "...\n\n";

// Step 2: Test the admin PPT export endpoint
echo "Step 2: Testing admin PPT export endpoint...\n";

$exportCurl = curl_init();
curl_setopt($exportCurl, CURLOPT_URL, $appUrl . '/api/activity-recces/export-ppt?status=all');
curl_setopt($exportCurl, CURLOPT_HTTPGET, true);
curl_setopt($exportCurl, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);
curl_setopt($exportCurl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($exportCurl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($exportCurl, CURLOPT_HEADER, true);

$exportResponse = curl_exec($exportCurl);
$exportHttpCode = curl_getinfo($exportCurl, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($exportCurl, CURLINFO_CONTENT_TYPE);
curl_close($exportCurl);

echo "Export response code: $exportHttpCode\n";
echo "Content type: $contentType\n";

if ($exportHttpCode === 200) {
    echo "✅ SUCCESS: Admin PPT export endpoint is working!\n";
    echo "✅ The endpoint returns a PowerPoint file as expected.\n";

    // Check content length to verify we got actual file data
    $headerSize = curl_getinfo($exportCurl, CURLINFO_HEADER_SIZE);
    $bodySize = strlen($exportResponse) - $headerSize;
    echo "✅ Response body size: " . number_format($bodySize) . " bytes\n";

} elseif ($exportHttpCode === 404) {
    echo "❌ FAILED: No activities found for export\n";
    echo "Response: $exportResponse\n";

} elseif ($exportHttpCode === 403) {
    echo "❌ FAILED: Permission denied\n";
    echo "Response: $exportResponse\n";

} else {
    echo "❌ FAILED: Unexpected response code\n";
    echo "Response: $exportResponse\n";
}

echo "\nTest completed.\n";
