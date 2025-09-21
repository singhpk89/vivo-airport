<?php

require_once 'vendor/autoload.php';

// Test the bulk update status API endpoint with viewer credentials
$baseUrl = 'https://li-council.test';

// Login as viewer to get token
$loginResponse = file_get_contents($baseUrl . '/api/auth/login', false, stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        'content' => json_encode([
            'email' => 'viewer@li-council.com',
            'password' => 'password123'
        ])
    ]
]));

$loginData = json_decode($loginResponse, true);

if (!$loginData['success']) {
    echo "Login failed: " . $loginData['message'] . "\n";
    exit(1);
}

$token = $loginData['data']['token'];
echo "Logged in as viewer, token: " . substr($token, 0, 20) . "...\n";

// Test bulk update status endpoint
$bulkUpdateResponse = file_get_contents($baseUrl . '/api/activity-recces/bulk-update-status', false, stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $token
        ],
        'content' => json_encode([
            'ids' => [1, 2, 3],
            'status' => 'approved'
        ])
    ]
]));

$bulkUpdateData = json_decode($bulkUpdateResponse, true);

echo "Bulk update response:\n";
print_r($bulkUpdateData);

if (isset($bulkUpdateData['success']) && !$bulkUpdateData['success'] &&
    strpos($bulkUpdateData['message'], 'permission') !== false) {
    echo "\n✅ SUCCESS: Viewer correctly blocked from bulk update status\n";
} else {
    echo "\n❌ FAILURE: Viewer can still access bulk update status\n";
}
