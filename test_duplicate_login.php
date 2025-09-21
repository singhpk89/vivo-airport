<?php

require 'vendor/autoload.php';

use App\Http\Controllers\PromoterAuthController;
use App\Models\Promoter;
use Illuminate\Http\Request;

// This script tests the duplicate login prevention functionality

echo "Testing Mobile Login API - Duplicate Login Prevention\n";
echo "=====================================================\n\n";

// Get a test promoter
$promoter = Promoter::where('is_active', 1)->first();

if (! $promoter) {
    echo "❌ No active promoter found for testing\n";
    exit;
}

echo "Test Promoter: {$promoter->username}\n";
echo 'Current login status: '.($promoter->is_logged_in ? 'Logged In' : 'Logged Out')."\n\n";

// If already logged in, reset for clean test
if ($promoter->is_logged_in) {
    $promoter->update(['is_logged_in' => false]);
    echo "🔄 Reset promoter login status for clean test\n\n";
}

// Test 1: First login attempt (should succeed)
echo "Test 1: First login attempt\n";
$loginData = [
    'username' => $promoter->username,
    'password' => 'password123', // Assuming default password
];

$request = new Request($loginData);
$controller = new PromoterAuthController;

try {
    $response = $controller->login($request);
    $responseData = json_decode($response->getContent(), true);

    if ($responseData['success']) {
        echo "✅ First login successful\n";
        echo "   Message: {$responseData['message']}\n";
    } else {
        echo "❌ First login failed unexpectedly\n";
        echo "   Message: {$responseData['message']}\n";
    }
} catch (\Exception $e) {
    echo '❌ Exception during first login: '.$e->getMessage()."\n";
}

echo "\n";

// Check if promoter is now marked as logged in
$promoter->refresh();
echo 'Promoter login status after first login: '.($promoter->is_logged_in ? 'Logged In' : 'Logged Out')."\n\n";

// Test 2: Second login attempt (should fail with 'User already loggedin')
echo "Test 2: Second login attempt (should fail)\n";

try {
    $response = $controller->login($request);
    $responseData = json_decode($response->getContent(), true);

    if (! $responseData['success'] && $responseData['message'] === 'User already loggedin') {
        echo "✅ Second login correctly blocked\n";
        echo "   Message: {$responseData['message']}\n";
        echo '   Status Code: '.$response->getStatusCode()."\n";
    } else {
        echo "❌ Second login should have been blocked\n";
        echo '   Success: '.($responseData['success'] ? 'true' : 'false')."\n";
        echo "   Message: {$responseData['message']}\n";
    }
} catch (\Exception $e) {
    echo '❌ Exception during second login: '.$e->getMessage()."\n";
}

echo "\n";

// Clean up - reset login status
$promoter->update(['is_logged_in' => false]);
echo "🧹 Cleanup: Reset promoter login status\n";

echo "\nTest completed!\n";
