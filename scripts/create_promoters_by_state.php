<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

/**
 * Generate promoter username based on state name
 * Pattern: GIC{State 2 Char if 2 words First letter from each word}{01/02}
 */
function generatePromoterUsername($stateName, $number) {
    // Clean up state name
    $stateName = trim($stateName);

    // Handle special cases and generate 2-character code
    $stateCode = '';

    switch (strtoupper($stateName)) {
        case 'ASSAM':
            $stateCode = 'AS';
            break;
        case 'HARYANA':
            $stateCode = 'HR';
            break;
        case 'JHARKHAND':
            $stateCode = 'JH';
            break;
        case 'MADHYA PRADESH':
            $stateCode = 'MP'; // First letter from each word
            break;
        case 'MAHARASHTRA':
            $stateCode = 'MH';
            break;
        case 'ODISHA':
            $stateCode = 'OD';
            break;
        case 'PUNJAB':
            $stateCode = 'PB';
            break;
        case 'RAJASTHAN':
            $stateCode = 'RJ';
            break;
        case 'SIKKIM':
            $stateCode = 'SK';
            break;
        case 'U.P':
        case 'UTTAR PRADESH':
            $stateCode = 'UP';
            break;
        case 'UTTRAKHAND':
        case 'UTTARAKHAND':
            $stateCode = 'UK';
            break;
        default:
            // For any other state, try to extract 2 characters
            $words = explode(' ', strtoupper($stateName));
            if (count($words) >= 2) {
                // First letter from each word
                $stateCode = substr($words[0], 0, 1) . substr($words[1], 0, 1);
            } else {
                // Take first 2 characters
                $stateCode = substr(strtoupper($stateName), 0, 2);
            }
            break;
    }

    return 'GIC' . $stateCode . sprintf('%02d', $number);
}

/**
 * Main script execution
 */
try {
    echo "Starting promoter creation script...\n\n";

    // Get unique states from route_plans
    $states = DB::table('route_plans')
        ->select('state')
        ->distinct()
        ->whereNotNull('state')
        ->get()
        ->pluck('state')
        ->toArray();

    if (empty($states)) {
        echo "No states found in route_plans table.\n";
        exit(1);
    }

    echo "Found " . count($states) . " states:\n";
    foreach ($states as $state) {
        echo "- $state\n";
    }
    echo "\n";

    $createdCount = 0;
    $skippedCount = 0;

    // Create 2 promoters for each state
    foreach ($states as $state) {
        echo "Creating promoters for state: $state\n";

        for ($i = 1; $i <= 2; $i++) {
            $username = generatePromoterUsername($state, $i);
            $name = "Promoter " . $username;

            // Check if promoter already exists
            $existingPromoter = DB::table('promoters')->where('username', $username)->first();
            if ($existingPromoter) {
                echo "  - Skipped $username (already exists)\n";
                $skippedCount++;
                continue;
            }

            // Create promoter
            $promoterId = DB::table('promoters')->insertGetId([
                'name' => $name,
                'username' => $username,
                'password' => Hash::make('12345678'),
                'state' => $state,
                'district' => null,
                'is_active' => true,
                'is_logged_in' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            echo "  ✓ Created $username (ID: $promoterId, Name: $name)\n";
            $createdCount++;
        }
        echo "\n";
    }

    echo "Script completed successfully!\n";
    echo "Created: $createdCount promoters\n";
    echo "Skipped: $skippedCount promoters (already existed)\n";
    echo "\nPromoter Details:\n";
    echo "- Password: 12345678\n";
    echo "- Default active: true\n";
    echo "- Is logged in: false\n";
    echo "- District: null\n";
    echo "- Status: active\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    exit(1);
}
