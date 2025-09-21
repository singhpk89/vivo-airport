<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

// Create a test to see what Laravel receives for multipart form data

echo "Testing logo upload data structure...\n";

// Simulate what would be received
$testData = [
    'admin_logo' => 'test-file.jpg',
    'settings' => [
        0 => [
            'key' => 'site_name',
            'value' => 'Test Site',
            'type' => 'string'
        ]
    ]
];

echo "Test data structure:\n";
print_r($testData);

// Test the regex pattern
$testInputs = [
    'settings[0][key]' => 'site_name',
    'settings[0][value]' => 'Test Site',
    'settings[0][type]' => 'string',
    'admin_logo' => 'file-data-here'
];

echo "\nTest inputs:\n";
print_r($testInputs);

echo "\nTesting regex pattern:\n";
$settingsData = [];
foreach ($testInputs as $key => $value) {
    if (preg_match('/^settings\[(\d+)\]\[(\w+)\]$/', $key, $matches)) {
        $index = (int) $matches[1];
        $field = $matches[2];
        $settingsData[$index][$field] = $value;
        echo "Matched: $key -> index: $index, field: $field, value: $value\n";
    } else {
        echo "No match: $key\n";
    }
}

echo "\nParsed settings data:\n";
print_r($settingsData);
