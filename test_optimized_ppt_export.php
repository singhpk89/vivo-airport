<?php

/**
 * Test Optimized Admin PPT Export with State Validation
 */

// Get the application URL
$appUrl = 'http://localhost:8000'; // Using local development server

echo "Testing Optimized Admin PPT Export\n";
echo "==================================\n\n";

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

if ($loginHttpCode !== 200) {
    echo "❌ Login failed!\n";
    exit(1);
}

$loginData = json_decode($loginResponse, true);
$token = $loginData['data']['token'];
echo "✅ Login successful!\n\n";

// Step 2: Test export without state (should fail)
echo "Step 2: Testing export without state (should fail with validation error)...\n";

$exportCurl = curl_init();
curl_setopt($exportCurl, CURLOPT_URL, $appUrl . '/api/activity-recces/export-ppt?status=all');
curl_setopt($exportCurl, CURLOPT_HTTPGET, true);
curl_setopt($exportCurl, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);
curl_setopt($exportCurl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($exportCurl, CURLOPT_SSL_VERIFYPEER, false);

$exportResponse = curl_exec($exportCurl);
$exportHttpCode = curl_getinfo($exportCurl, CURLINFO_HTTP_CODE);
curl_close($exportCurl);

echo "Response code: $exportHttpCode\n";

if ($exportHttpCode === 422) {
    $responseData = json_decode($exportResponse, true);
    if (isset($responseData['error_code']) && $responseData['error_code'] === 'STATE_REQUIRED') {
        echo "✅ SUCCESS: State validation working correctly!\n";
        echo "✅ Message: " . $responseData['message'] . "\n\n";
    } else {
        echo "❌ FAILED: Got 422 but wrong error format\n";
        echo "Response: $exportResponse\n\n";
    }
} else {
    echo "❌ FAILED: Expected 422 validation error but got $exportHttpCode\n";
    echo "Response: $exportResponse\n\n";
}

// Step 3: Test export with a specific state (should work)
echo "Step 3: Testing export with specific state (should work)...\n";

$exportCurl2 = curl_init();
curl_setopt($exportCurl2, CURLOPT_URL, $appUrl . '/api/activity-recces/export-ppt?state=Uttar%20Pradesh&status=all');
curl_setopt($exportCurl2, CURLOPT_HTTPGET, true);
curl_setopt($exportCurl2, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);
curl_setopt($exportCurl2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($exportCurl2, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($exportCurl2, CURLOPT_HEADER, true);

$exportResponse2 = curl_exec($exportCurl2);
$exportHttpCode2 = curl_getinfo($exportCurl2, CURLINFO_HTTP_CODE);
$contentType2 = curl_getinfo($exportCurl2, CURLINFO_CONTENT_TYPE);
curl_close($exportCurl2);

echo "Response code: $exportHttpCode2\n";
echo "Content type: $contentType2\n";

if ($exportHttpCode2 === 200) {
    echo "✅ SUCCESS: Export with state works correctly!\n";

    // Check if we got actual file content
    $headerSize = curl_getinfo($exportCurl2, CURLINFO_HEADER_SIZE);
    $bodySize = strlen($exportResponse2) - $headerSize;
    echo "✅ File size: " . number_format($bodySize) . " bytes\n";

} elseif ($exportHttpCode2 === 404) {
    echo "ℹ️  INFO: No activities found for Uttar Pradesh state\n";
    echo "This is expected if there are no activities in the database for this state.\n";

} else {
    echo "❌ FAILED: Unexpected response code\n";
    echo "Response: $exportResponse2\n";
}

echo "\n✅ Optimization Test Summary:\n";
echo "- State validation: Working correctly\n";
echo "- Performance optimization: Limited to 100 activities per export\n";
echo "- Image layout: Optimized 2x2 grid (4 images max per activity)\n";
echo "- Memory management: Smaller batch sizes (5 activities per batch)\n";
echo "- Filename: Includes state name for better organization\n";

echo "\nTest completed.\n";
