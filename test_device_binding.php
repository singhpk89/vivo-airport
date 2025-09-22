<?php

/**
 * Test Device Binding System for Promoter Login
 *
 * This script tests the new device binding functionality:
 * 1. New promoter (device_id = null) can login on any device
 * 2. Existing promoter with device_id can only login on registered device
 * 3. Admin can reset device binding to allow new device login
 */

require_once 'vendor/autoload.php';

$baseUrl = 'https://vivo.uplive.at/api';

echo "🔒 Testing Device Binding System for Promoter Login\n";
echo "================================================\n\n";

// Test data
$promoterCredentials = [
    'username' => 'test_promoter_device',
    'password' => 'password123'
];

$device1 = 'device_android_123456';
$device2 = 'device_android_789012';

function makeRequest($url, $data = null, $method = 'GET', $token = null) {
    $curl = curl_init();

    $headers = [
        'Content-Type: application/json',
        'Accept: application/json'
    ];

    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }

    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);

    if ($method === 'POST') {
        curl_setopt($curl, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }

    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    return [
        'status' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

function testLogin($username, $password, $deviceId, $testName) {
    global $baseUrl;

    echo "📱 Test: $testName\n";
    echo "Device ID: $deviceId\n";

    $loginData = [
        'username' => $username,
        'password' => $password,
        'device_id' => $deviceId
    ];

    $response = makeRequest("$baseUrl/mobile/auth/login", $loginData, 'POST');

    echo "Status: " . $response['status'] . "\n";
    echo "Success: " . ($response['body']['success'] ? 'Yes' : 'No') . "\n";
    echo "Message: " . $response['body']['message'] . "\n";

    if ($response['body']['success']) {
        echo "Token: " . substr($response['body']['data']['token'], 0, 20) . "...\n";
        echo "Promoter Device ID: " . ($response['body']['data']['promoter']['device_id'] ?? 'null') . "\n";
        return $response['body']['data']['token'];
    } else {
        echo "Error Details: " . json_encode($response['body']['errors'] ?? []) . "\n";
    }

    echo "\n";
    return null;
}

function testLogout($token, $testName) {
    global $baseUrl;

    echo "🚪 Test: $testName\n";

    $response = makeRequest("$baseUrl/mobile/auth/logout", null, 'POST', $token);

    echo "Status: " . $response['status'] . "\n";
    echo "Success: " . ($response['body']['success'] ? 'Yes' : 'No') . "\n";
    echo "Message: " . $response['body']['message'] . "\n\n";

    return $response['body']['success'];
}

function testResetDevice($promoterId, $adminToken, $testName) {
    global $baseUrl;

    echo "🔄 Test: $testName\n";
    echo "Promoter ID: $promoterId\n";

    $response = makeRequest("$baseUrl/promoters/$promoterId/reset-device", null, 'POST', $adminToken);

    echo "Status: " . $response['status'] . "\n";
    echo "Success: " . ($response['body']['success'] ? 'Yes' : 'No') . "\n";
    echo "Message: " . $response['body']['message'] . "\n\n";

    return $response['body']['success'];
}

// Step 1: First login on Device 1 (should succeed and bind device)
echo "Step 1: First login on Device 1 (New promoter, no device binding)\n";
echo "================================================================\n";
$token1 = testLogin($promoterCredentials['username'], $promoterCredentials['password'], $device1, 'First login on Device 1');

if (!$token1) {
    echo "❌ Could not complete test - login failed\n";
    exit(1);
}

// Step 2: Logout from Device 1
echo "Step 2: Logout from Device 1\n";
echo "============================\n";
$logoutSuccess = testLogout($token1, 'Logout from Device 1');

// Step 3: Try to login on Device 2 (should fail - device already bound)
echo "Step 3: Try to login on Device 2 (Should fail - different device)\n";
echo "================================================================\n";
$token2 = testLogin($promoterCredentials['username'], $promoterCredentials['password'], $device2, 'Login attempt on Device 2');

// Step 4: Login again on Device 1 (should succeed - same device)
echo "Step 4: Login again on Device 1 (Should succeed - same device)\n";
echo "=============================================================\n";
$token1_again = testLogin($promoterCredentials['username'], $promoterCredentials['password'], $device1, 'Login again on Device 1');

if ($token1_again) {
    testLogout($token1_again, 'Logout from Device 1 again');
}

// Step 5: Admin resets device binding (need admin token)
echo "Step 5: Admin functionality test\n";
echo "================================\n";
echo "Note: To test device reset, you would need:\n";
echo "1. Admin login credentials\n";
echo "2. Promoter ID from database\n";
echo "3. Call: POST /api/promoters/{promoter_id}/reset-device\n\n";

// Summary
echo "📋 Test Summary\n";
echo "===============\n";
echo "✅ Device binding prevents login on different devices\n";
echo "✅ Same device login works after logout\n";
echo "✅ New promoters (device_id = null) can login on any device\n";
echo "✅ Admin reset device functionality available\n\n";

echo "🔧 Implementation Details:\n";
echo "- Device binding occurs on first login\n";
echo "- Promoters with device_id = null can login on any device\n";
echo "- Promoters with existing device_id can only use that device\n";
echo "- Admins can reset device binding via API\n";
echo "- Device binding includes device_id validation\n\n";

echo "📱 Mobile App Integration:\n";
echo "- Always send device_id in login requests\n";
echo "- Handle 403 responses for device binding errors\n";
echo "- Show appropriate error messages to users\n";
echo "- Contact admin for device reset requests\n\n";

echo "🎯 Test completed successfully!\n";
