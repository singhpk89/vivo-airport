<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Authentication API...\n";

// Test the login directly
$email = 'admin@example.com';
$password = 'password';

$user = \App\Models\User::where('email', $email)->first();

if (!$user) {
    echo "❌ User not found: $email\n";
    exit;
}

if (!\Illuminate\Support\Facades\Hash::check($password, $user->password)) {
    echo "❌ Password mismatch for user: $email\n";
    exit;
}

echo "✅ User authentication successful\n";
echo "User: {$user->name} ({$user->email})\n";

// Test token creation
$token = $user->createToken('test-token')->plainTextToken;
echo "✅ Token created: " . substr($token, 0, 20) . "...\n";

echo "\nNow test in browser:\n";
echo "URL: https://lic.test\n";
echo "Email: $email\n";
echo "Password: $password\n";
