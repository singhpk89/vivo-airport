<?php

/**
 * Test Updated Sync API with AWS S3 Photo URLs
 *
 * This script tests the enhanced sync endpoint that supports:
 * 1. Activity data synchronization
 * 2. AWS S3 photo URLs instead of file uploads
 * 3. Photo metadata including GPS coordinates
 */

require_once 'vendor/autoload.php';

$baseUrl = 'https://vivo.uplive.at/api';

echo "📱 Testing Updated Sync API with AWS S3 Photos\n";
echo "============================================\n\n";

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

// Sample sync data with AWS S3 photos
$syncData = [
    'promoter_id' => 1, // Adjust based on your database
    'activities' => [
        [
            'activity_date' => '2024-01-20',
            'login_time' => '2024-01-20T09:00:00.000Z',
            'logout_time' => '2024-01-20T17:30:00.000Z',
            'status' => 'logged_out',
            'latitude' => 19.0760,
            'longitude' => 72.8777,
            'photos' => [
                [
                    'photo_type' => 'login',
                    's3_url' => 'https://your-s3-bucket.s3.amazonaws.com/promoter-photos/20240120/login_123456.jpg',
                    'file_name' => 'login_photo_20240120.jpg',
                    'mime_type' => 'image/jpeg',
                    'file_size' => 245760,
                    'latitude' => 19.0760,
                    'longitude' => 72.8777,
                    'captured_at' => '2024-01-20T09:00:30.000Z',
                    'description' => 'Login selfie at office location'
                ],
                [
                    'photo_type' => 'activity',
                    's3_url' => 'https://your-s3-bucket.s3.amazonaws.com/promoter-photos/20240120/activity_789012.jpg',
                    'file_name' => 'vivo_demo_photo.jpg',
                    'mime_type' => 'image/jpeg',
                    'file_size' => 512000,
                    'latitude' => 19.0765,
                    'longitude' => 72.8782,
                    'captured_at' => '2024-01-20T14:30:15.000Z',
                    'description' => 'Vivo X200 Pro demonstration to customer'
                ],
                [
                    'photo_type' => 'logout',
                    's3_url' => 'https://your-s3-bucket.s3.amazonaws.com/promoter-photos/20240120/logout_345678.jpg',
                    'file_name' => 'logout_photo_20240120.jpg',
                    'mime_type' => 'image/jpeg',
                    'file_size' => 198432,
                    'latitude' => 19.0760,
                    'longitude' => 72.8777,
                    'captured_at' => '2024-01-20T17:30:45.000Z',
                    'description' => 'End of day logout selfie'
                ]
            ]
        ],
        [
            'activity_date' => '2024-01-21',
            'login_time' => '2024-01-21T08:45:00.000Z',
            'logout_time' => null,
            'status' => 'active',
            'latitude' => 19.0758,
            'longitude' => 72.8775,
            'photos' => [
                [
                    'photo_type' => 'login',
                    's3_url' => 'https://your-s3-bucket.s3.amazonaws.com/promoter-photos/20240121/login_456789.jpg',
                    'file_name' => 'login_photo_20240121.jpg',
                    'mime_type' => 'image/jpeg',
                    'file_size' => 267890,
                    'latitude' => 19.0758,
                    'longitude' => 72.8775,
                    'captured_at' => '2024-01-21T08:45:30.000Z',
                    'description' => 'Morning login at new location'
                ]
            ]
        ]
    ]
];

echo "🔄 Testing Enhanced Sync Endpoint\n";
echo "Endpoint: POST /api/mobile/promoter-activity/sync\n";
echo "Data: Activities with AWS S3 photo URLs\n\n";

$response = makeRequest("$baseUrl/mobile/promoter-activity/sync", $syncData, 'POST');

echo "📊 Response Details:\n";
echo "Status Code: " . $response['status'] . "\n";
echo "Success: " . ($response['body']['success'] ? 'Yes' : 'No') . "\n";
echo "Message: " . $response['body']['message'] . "\n";

if ($response['body']['success']) {
    echo "✅ Sync Results:\n";
    echo "- Synced Activities: " . $response['body']['data']['synced_activities'] . "\n";
    echo "- Synced Photos: " . $response['body']['data']['synced_photos'] . "\n";
} else {
    echo "❌ Error Details:\n";
    if (isset($response['body']['errors'])) {
        foreach ($response['body']['errors'] as $field => $errors) {
            echo "- $field: " . implode(', ', $errors) . "\n";
        }
    }
    if (isset($response['body']['error'])) {
        echo "- Error: " . $response['body']['error'] . "\n";
    }
}

echo "\n📋 Request Structure Summary:\n";
echo "============================\n";
echo "✅ Enhanced Features:\n";
echo "- Support for AWS S3 photo URLs\n";
echo "- Photo metadata (GPS, file info)\n";
echo "- Multiple photo types per activity\n";
echo "- Bulk activity and photo sync\n";
echo "- Duplicate prevention\n\n";

echo "📱 Photo Types Supported:\n";
echo "- login: Check-in selfie\n";
echo "- logout: Check-out selfie\n";
echo "- activity: Work/demo photos\n";
echo "- selfie: General selfies\n";
echo "- location: Location verification photos\n\n";

echo "🔧 Key Improvements:\n";
echo "- S3 URLs stored directly (no file processing)\n";
echo "- GPS coordinates for photos\n";
echo "- Photo capture timestamps\n";
echo "- Automatic photo count updates\n";
echo "- Enhanced validation rules\n\n";

echo "Test completed!\n";
