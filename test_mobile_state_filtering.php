<?php

/**
 * Test script to verify mobile API state filtering for promoters
 */

require_once 'vendor/autoload.php';

// Configuration - update these with your environment values
$baseUrl = 'https://lic.test';
$mobileLoginEndpoint = '/api/mobile/auth/login';
$routePlansEndpoint = '/api/mobile/route-plans';
$activitiesEndpoint = '/api/mobile/activities';

echo "🧪 Testing Mobile API State Filtering\n";
echo "=====================================\n\n";

/**
 * Test mobile login and API state filtering
 */
function testMobileStateFiltering($username, $password, $expectedStates) {
    global $baseUrl, $mobileLoginEndpoint, $routePlansEndpoint, $activitiesEndpoint;

    echo "🔐 Testing login for: $username\n";

    // Login
    $loginData = [
        'username' => $username,
        'password' => $password,
        'device_id' => 'TEST_DEVICE_001'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . $mobileLoginEndpoint);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        echo "❌ Login failed with HTTP code: $httpCode\n";
        echo "Response: $response\n\n";
        return;
    }

    $loginResponse = json_decode($response, true);

    if (!$loginResponse['success']) {
        echo "❌ Login failed: " . $loginResponse['message'] . "\n\n";
        return;
    }

    $token = $loginResponse['data']['token'];
    echo "✅ Login successful, token obtained\n";

    // Test Route Plans API
    echo "\n📍 Testing Route Plans API\n";
    testRouteMarginApi($token, $expectedStates);

    // Test Activities API
    echo "\n🎯 Testing Activities API\n";
    testActivitiesApi($token, $expectedStates);

    echo "\n" . str_repeat("-", 50) . "\n\n";
}

function testRouteMarginApi($token, $expectedStates) {
    global $baseUrl, $routePlansEndpoint;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . $routePlansEndpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        echo "❌ Route Plans API failed with HTTP code: $httpCode\n";
        echo "Response: $response\n";
        return;
    }

    $data = json_decode($response, true);

    if (!$data['success']) {
        echo "❌ Route Plans API error: " . $data['message'] . "\n";
        return;
    }

    $routePlans = $data['data'];
    echo "📊 Total route plans returned: " . count($routePlans) . "\n";

    if (empty($routePlans)) {
        echo "⚠️  No route plans found\n";
        return;
    }

    // Check states in returned route plans
    $foundStates = [];
    foreach ($routePlans as $plan) {
        $state = $plan['state'] ?? 'Unknown';
        $foundStates[$state] = ($foundStates[$state] ?? 0) + 1;
    }

    echo "🗺️  States found in route plans:\n";
    foreach ($foundStates as $state => $count) {
        echo "   • $state: $count plans\n";

        // Check if this state should be accessible
        if (!empty($expectedStates) && !in_array($state, $expectedStates)) {
            echo "     ⚠️  WARNING: $state not in expected states list!\n";
        }
    }

    // Verify only expected states are returned
    if (!empty($expectedStates)) {
        $unexpectedStates = array_diff(array_keys($foundStates), $expectedStates);
        if (!empty($unexpectedStates)) {
            echo "❌ FOUND UNAUTHORIZED STATES: " . implode(', ', $unexpectedStates) . "\n";
        } else {
            echo "✅ All returned states are authorized\n";
        }
    }
}

function testActivitiesApi($token, $expectedStates) {
    global $baseUrl, $activitiesEndpoint;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . $activitiesEndpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        echo "❌ Activities API failed with HTTP code: $httpCode\n";
        echo "Response: $response\n";
        return;
    }

    $data = json_decode($response, true);

    if (!$data['success']) {
        echo "❌ Activities API error: " . $data['message'] . "\n";
        return;
    }

    $activities = $data['data'];
    echo "📊 Total activities returned: " . count($activities) . "\n";

    if (empty($activities)) {
        echo "⚠️  No activities found\n";
        return;
    }

    // Check states in returned activities (via route plan)
    $foundStates = [];
    foreach ($activities as $activity) {
        $state = $activity['route_plan']['state'] ?? 'Unknown';
        $foundStates[$state] = ($foundStates[$state] ?? 0) + 1;
    }

    echo "🎯 States found in activities:\n";
    foreach ($foundStates as $state => $count) {
        echo "   • $state: $count activities\n";

        // Check if this state should be accessible
        if (!empty($expectedStates) && !in_array($state, $expectedStates)) {
            echo "     ⚠️  WARNING: $state not in expected states list!\n";
        }
    }

    // Verify only expected states are returned
    if (!empty($expectedStates)) {
        $unexpectedStates = array_diff(array_keys($foundStates), $expectedStates);
        if (!empty($unexpectedStates)) {
            echo "❌ FOUND UNAUTHORIZED STATES IN ACTIVITIES: " . implode(', ', $unexpectedStates) . "\n";
        } else {
            echo "✅ All returned activity states are authorized\n";
        }
    }
}

// Test cases
echo "Running mobile API state filtering tests...\n\n";

// Test user with Bihar state assignment only
testMobileStateFiltering('bihar_test', 'password123', ['Bihar']);

// Test user with Maharashtra state assignment
testMobileStateFiltering('maharashtra_test', 'password123', ['Maharashtra']);

// Test user with access to all states
testMobileStateFiltering('all_access_test', 'password123', []); // Empty array means all states should be accessible

echo "🏁 Mobile API State Filtering Tests Complete!\n";
