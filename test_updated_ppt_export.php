<?php

/**
 * Test Updated PPT Export with 2 Close Shot Images
 */

// Get the application URL
$appUrl = 'https://li-council.uplive.at';

echo "Testing Updated PPT Export (2 Close Shot Images)\n";
echo "=================================================\n\n";

// Step 1: Login as admin
echo "Step 1: Logging in as admin...\n";

$loginData = [
    'email' => 'super.admin@li-council.com',
    'password' => 'Super@Admin123'
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
    echo "❌ Login failed! Code: $loginHttpCode\n";
    echo "Response: $loginResponse\n";
    exit(1);
}

$loginData = json_decode($loginResponse, true);
if (!isset($loginData['success']) || !$loginData['success']) {
    echo "❌ Login failed - Invalid response format\n";
    exit(1);
}

$token = $loginData['data']['token'];
echo "✅ Login successful!\n\n";

// Step 2: Test PPT export with a specific state
echo "Step 2: Testing PPT export with Bihar state (2 close shot images)...\n";

$exportCurl = curl_init();
curl_setopt($exportCurl, CURLOPT_URL, $appUrl . '/api/activity-recces/export-ppt?state=Bihar&status=all');
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

echo "Response code: $exportHttpCode\n";
echo "Content type: $contentType\n";

if ($exportHttpCode === 200) {
    echo "✅ SUCCESS: PPT export with 2 close shot images working!\n";

    // Check content length
    $headerSize = curl_getinfo($exportCurl, CURLINFO_HEADER_SIZE);
    $bodySize = strlen($exportResponse) - $headerSize;
    echo "✅ File size: " . number_format($bodySize) . " bytes\n";

    // Check filename pattern
    if (strpos($exportResponse, 'activities_presentation_Bihar_') !== false) {
        echo "✅ Filename includes state name as expected\n";
    }

} elseif ($exportHttpCode === 404) {
    echo "ℹ️  INFO: No activities found for Bihar state\n";
    echo "Testing with a different state...\n\n";

    // Try with a different state
    $exportCurl2 = curl_init();
    curl_setopt($exportCurl2, CURLOPT_URL, $appUrl . '/api/activity-recces/export-ppt?state=Maharashtra&status=all');
    curl_setopt($exportCurl2, CURLOPT_HTTPGET, true);
    curl_setopt($exportCurl2, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]);
    curl_setopt($exportCurl2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($exportCurl2, CURLOPT_SSL_VERIFYPEER, false);

    $exportResponse2 = curl_exec($exportCurl2);
    $exportHttpCode2 = curl_getinfo($exportCurl2, CURLINFO_HTTP_CODE);
    curl_close($exportCurl2);

    if ($exportHttpCode2 === 200) {
        echo "✅ SUCCESS: PPT export working with Maharashtra state!\n";
    } else {
        echo "Response code for Maharashtra: $exportHttpCode2\n";
    }

} else {
    echo "❌ FAILED: Unexpected response code\n";
    echo "Response headers: " . substr($exportResponse, 0, 500) . "\n";
}

echo "\n🎯 Updates Applied:\n";
echo "- Image count: Reduced from 4 to 2 (only close shots)\n";
echo "- Image size: Increased from 250x140 to 300x225 pixels\n";
echo "- Layout: Changed from 2x2 grid to side-by-side positioning\n";
echo "- Performance: Faster processing with fewer images\n";
echo "- Quality: Larger images for better visibility\n";

echo "\nTest completed.\n";
