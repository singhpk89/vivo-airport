<?php

// Test the mobile login API for duplicate login prevention
// This script simulates API calls to test the new functionality

$apiUrl = 'https://li-council.test/api/promoter/login';

// Test data
$loginData = [
    'username' => 'testpromoter',
    'password' => 'password123',
];

function makeLoginRequest($url, $data)
{
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'response' => json_decode($response, true),
        'http_code' => $httpCode,
    ];
}

echo "Testing Mobile Login API - Duplicate Login Prevention\n";
echo "=====================================================\n\n";

// First, reset the promoter's login status for clean testing
echo "Resetting test promoter login status...\n";

// Make first login attempt
echo "\nTest 1: First login attempt (should succeed)\n";
echo "Attempting login for: {$loginData['username']}\n";

$result1 = makeLoginRequest($apiUrl, $loginData);

echo "Response Code: {$result1['http_code']}\n";
echo 'Success: '.($result1['response']['success'] ? 'true' : 'false')."\n";
echo "Message: {$result1['response']['message']}\n";

if ($result1['response']['success']) {
    echo "✅ First login successful - token received\n";
    $token = $result1['response']['data']['token'] ?? 'No token';
    echo 'Token preview: '.substr($token, 0, 20)."...\n";
} else {
    echo "❌ First login failed unexpectedly\n";
    exit;
}

echo "\n".str_repeat('-', 50)."\n";

// Make second login attempt (should fail)
echo "\nTest 2: Second login attempt (should fail with 'User already loggedin')\n";
echo "Attempting login again for: {$loginData['username']}\n";

$result2 = makeLoginRequest($apiUrl, $loginData);

echo "Response Code: {$result2['http_code']}\n";
echo 'Success: '.($result2['response']['success'] ? 'true' : 'false')."\n";
echo "Message: {$result2['response']['message']}\n";

if (! $result2['response']['success'] && $result2['response']['message'] === 'User already loggedin') {
    echo "✅ Second login correctly blocked with proper message\n";
    echo "✅ Duplicate login prevention is working!\n";
} else {
    echo "❌ Second login should have been blocked\n";
    echo "Expected message: 'User already loggedin'\n";
    echo "Actual message: '{$result2['response']['message']}'\n";
}

echo "\n".str_repeat('=', 50)."\n";
echo "Test Summary:\n";
echo '- First login: '.($result1['response']['success'] ? '✅ Success' : '❌ Failed')."\n";
echo '- Second login: '.(! $result2['response']['success'] && $result2['response']['message'] === 'User already loggedin' ? '✅ Correctly blocked' : '❌ Not blocked properly')."\n";

// Note: In a real test environment, you'd also test the logout API to reset the login status
