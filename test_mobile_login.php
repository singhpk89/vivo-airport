<?php

// Test mobile promoter login API
echo "Testing Mobile Promoter Login API\n";
echo "================================\n\n";

// Test data
$credentials = [
    'username' => 'testpromoter',
    'password' => 'password123'
];

echo "Testing with credentials:\n";
echo "Username: {$credentials['username']}\n";
echo "Password: {$credentials['password']}\n\n";

// Make API call using cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://lic.test/api/mobile/auth/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($credentials));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For local development

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Response Code: {$httpCode}\n";
echo "Response Body:\n";
echo $response . "\n\n";

// Parse JSON response
$data = json_decode($response, true);
if ($data) {
    if (isset($data['success']) && $data['success']) {
        echo "✅ Login successful!\n";
        echo "Token: " . substr($data['data']['token'], 0, 20) . "...\n";
        echo "Promoter: {$data['data']['promoter']['name']}\n";
        echo "Accessible routes: " . count($data['data']['accessible_routes']) . "\n";
    } else {
        echo "❌ Login failed: {$data['message']}\n";
        if (isset($data['error'])) {
            echo "Error: {$data['error']}\n";
        }
    }
} else {
    echo "❌ Invalid JSON response\n";
}
