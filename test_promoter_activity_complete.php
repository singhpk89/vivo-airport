<?php

/**
 * Comprehensive test script for Promoter Activity Mobile API
 * Tests the complete workflow: login → activity photos → feedback → logout
 */

require_once 'vendor/autoload.php';

// Test configuration
$baseUrl = 'https://vair.test';
$testPromoterId = 1; // Adjust this to a valid promoter ID in your database
$testFeedbackData = [
    'overall_experience' => 'excellent',
    'favorite_section' => 'smartphone_display',
    'preferred_models' => 'V40_5G',
    'souvenir_experience' => 'very_satisfied',
    'suggestions' => 'More interactive displays would be great!',
    'visitor_name' => 'John Test Visitor',
    'visitor_email' => 'test@example.com',
    'visitor_phone' => '+1234567890',
];

// Test coordinates (simulated mobile GPS)
$loginCoords = ['latitude' => 28.6139, 'longitude' => 77.2090]; // Delhi coords
$logoutCoords = ['latitude' => 28.6141, 'longitude' => 77.2092]; // Slightly different

class PromoterActivityTester
{
    private $baseUrl;
    private $promoterId;
    private $activityId;
    private $uploadedPhotos = [];

    public function __construct($baseUrl, $promoterId)
    {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->promoterId = $promoterId;
    }

    /**
     * Test promoter login
     */
    public function testLogin($coordinates)
    {
        echo "🔐 Testing Promoter Login...\n";

        $data = [
            'promoter_id' => $this->promoterId,
            'latitude' => $coordinates['latitude'],
            'longitude' => $coordinates['longitude']
        ];

        $response = $this->makeRequest('/api/mobile/promoter-activity/login', 'POST', $data);

        if ($response['success']) {
            $this->activityId = $response['data']['id'];
            echo "✅ Login successful! Activity ID: {$this->activityId}\n";
            echo "   Status: {$response['data']['status']}\n";
            echo "   Login Time: {$response['data']['login_time']}\n";
            return true;
        } else {
            echo "❌ Login failed: {$response['message']}\n";
            return false;
        }
    }

    /**
     * Test photo upload
     */
    public function testPhotoUpload($photoType, $coordinates, $description = null)
    {
        echo "📸 Testing Photo Upload ({$photoType})...\n";

        // Create a test image
        $testImagePath = $this->createTestImage($photoType);

        $data = [
            'promoter_id' => $this->promoterId,
            'photo_type' => $photoType,
            'latitude' => $coordinates['latitude'],
            'longitude' => $coordinates['longitude'],
            'description' => $description ?? "Test {$photoType} photo captured during mobile testing"
        ];

        $response = $this->makeFileRequest('/api/mobile/promoter-activity/upload-photo', $data, $testImagePath);

        if ($response['success']) {
            $photoId = $response['data']['photo']['id'];
            $this->uploadedPhotos[] = $photoId;
            echo "✅ Photo uploaded successfully! Photo ID: {$photoId}\n";
            echo "   File: {$response['data']['photo']['file_name']}\n";
            echo "   URL: {$response['data']['url']}\n";

            // Clean up test image
            unlink($testImagePath);
            return true;
        } else {
            echo "❌ Photo upload failed: {$response['message']}\n";
            if (isset($response['errors'])) {
                foreach ($response['errors'] as $field => $errors) {
                    echo "   {$field}: " . implode(', ', $errors) . "\n";
                }
            }
            unlink($testImagePath);
            return false;
        }
    }

    /**
     * Test feedback submission with promoter tracking
     */
    public function testFeedbackSubmission($feedbackData)
    {
        echo "💬 Testing Feedback Submission with Promoter Tracking...\n";

        $feedbackData['assisted_by_promoter_id'] = $this->promoterId;

        $response = $this->makeRequest('/api/vivo-experience-feedback', 'POST', $feedbackData);

        if ($response['success']) {
            $feedbackId = $response['data']['id'];
            echo "✅ Feedback submitted successfully! Feedback ID: {$feedbackId}\n";
            echo "   Promoter ID: {$response['data']['assisted_by_promoter_id']}\n";
            echo "   Subject: {$response['data']['subject']}\n";
            return $feedbackId;
        } else {
            echo "❌ Feedback submission failed: {$response['message']}\n";
            return false;
        }
    }

    /**
     * Test promoter logout
     */
    public function testLogout($coordinates, $activityNotes = null)
    {
        echo "🚪 Testing Promoter Logout...\n";

        $data = [
            'promoter_id' => $this->promoterId,
            'latitude' => $coordinates['latitude'],
            'longitude' => $coordinates['longitude'],
            'activity_notes' => $activityNotes ?? 'Completed mobile API testing session. All workflows tested successfully.'
        ];

        $response = $this->makeRequest('/api/mobile/promoter-activity/logout', 'POST', $data);

        if ($response['success']) {
            echo "✅ Logout successful!\n";
            echo "   Status: {$response['data']['status']}\n";
            echo "   Session Duration: " . $this->calculateDuration($response['data']) . "\n";
            echo "   Photos Captured: {$response['data']['total_photos_captured']}\n";
            echo "   Feedback Captured: {$response['data']['total_feedback_captured']}\n";
            return true;
        } else {
            echo "❌ Logout failed: {$response['message']}\n";
            return false;
        }
    }

    /**
     * Test getting activity details
     */
    public function testGetActivity($date = null)
    {
        echo "📊 Testing Get Activity Details...\n";

        $params = ['promoter_id' => $this->promoterId];
        if ($date) {
            $params['date'] = $date;
        }

        $url = '/api/mobile/promoter-activity/activity?' . http_build_query($params);
        $response = $this->makeRequest($url, 'GET');

        if ($response['success']) {
            $activity = $response['data'];
            echo "✅ Activity details retrieved successfully!\n";
            echo "   Activity Date: {$activity['activity_date']}\n";
            echo "   Status: {$activity['status']}\n";
            echo "   Login Time: {$activity['login_time']}\n";
            echo "   Logout Time: {$activity['logout_time']}\n";
            echo "   Total Photos: {$activity['total_photos_captured']}\n";
            echo "   Total Feedback: {$activity['total_feedback_captured']}\n";
            echo "   Photos in API: " . count($activity['photos']) . "\n";
            return true;
        } else {
            echo "❌ Failed to get activity details: {$response['message']}\n";
            return false;
        }
    }

    /**
     * Test admin dashboard API
     */
    public function testAdminDashboard()
    {
        echo "📈 Testing Admin Dashboard API...\n";

        // Note: This would require authentication in real scenario
        $response = $this->makeRequest('/api/admin/promoter-reports/dashboard', 'GET');

        if ($response['success']) {
            $summary = $response['data']['summary'];
            echo "✅ Dashboard data retrieved successfully!\n";
            echo "   Total Promoters: {$summary['total_promoters']}\n";
            echo "   Active Promoters: {$summary['active_promoters']}\n";
            echo "   Total Photos: {$summary['total_photos']}\n";
            echo "   Total Feedback: {$summary['total_feedback']}\n";
            return true;
        } else {
            echo "❌ Dashboard API failed: {$response['message']}\n";
            echo "   Note: This might require authentication in production\n";
            return false;
        }
    }

    /**
     * Create a test image file
     */
    private function createTestImage($type)
    {
        $width = 800;
        $height = 600;
        $image = imagecreate($width, $height);

        // Create colors
        $bg_color = imagecolorallocate($image, 135, 206, 235); // Sky blue
        $text_color = imagecolorallocate($image, 255, 255, 255); // White
        $border_color = imagecolorallocate($image, 0, 0, 0); // Black

        // Fill background
        imagefill($image, 0, 0, $bg_color);

        // Add border
        imagerectangle($image, 0, 0, $width-1, $height-1, $border_color);

        // Add text
        $text = "Test {$type} Photo";
        $timestamp = date('Y-m-d H:i:s');

        imagestring($image, 5, 20, 20, $text, $text_color);
        imagestring($image, 3, 20, 60, "Timestamp: {$timestamp}", $text_color);
        imagestring($image, 3, 20, 90, "Type: {$type}", $text_color);
        imagestring($image, 3, 20, 120, "Promoter ID: {$this->promoterId}", $text_color);

        // Save image
        $filename = "test_{$type}_" . time() . ".jpg";
        $filepath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $filename;
        imagejpeg($image, $filepath, 90);
        imagedestroy($image);

        return $filepath;
    }

    /**
     * Make HTTP request
     */
    private function makeRequest($endpoint, $method = 'GET', $data = null)
    {
        $url = $this->baseUrl . $endpoint;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/json',
                    'Accept: application/json'
                ]);
            }
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_error($ch)) {
            echo "❌ cURL Error: " . curl_error($ch) . "\n";
            curl_close($ch);
            return ['success' => false, 'message' => 'Network error'];
        }

        curl_close($ch);

        $decodedResponse = json_decode($response, true);

        if ($httpCode >= 400) {
            echo "❌ HTTP Error {$httpCode}: {$response}\n";
        }

        return $decodedResponse ?: ['success' => false, 'message' => 'Invalid response'];
    }

    /**
     * Make file upload request
     */
    private function makeFileRequest($endpoint, $data, $filePath)
    {
        $url = $this->baseUrl . $endpoint;

        $postData = $data;
        $postData['photo'] = new CURLFile($filePath, 'image/jpeg', basename($filePath));

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_error($ch)) {
            echo "❌ cURL Error: " . curl_error($ch) . "\n";
            curl_close($ch);
            return ['success' => false, 'message' => 'Network error'];
        }

        curl_close($ch);

        $decodedResponse = json_decode($response, true);

        if ($httpCode >= 400) {
            echo "❌ HTTP Error {$httpCode}: {$response}\n";
        }

        return $decodedResponse ?: ['success' => false, 'message' => 'Invalid response'];
    }

    /**
     * Calculate session duration
     */
    private function calculateDuration($activity)
    {
        if (empty($activity['login_time']) || empty($activity['logout_time'])) {
            return 'N/A';
        }

        $login = new DateTime($activity['login_time']);
        $logout = new DateTime($activity['logout_time']);
        $diff = $logout->diff($login);

        return $diff->format('%h hours %i minutes');
    }

    /**
     * Run complete test suite
     */
    public function runCompleteTest($loginCoords, $logoutCoords, $feedbackData)
    {
        echo "\n🚀 Starting Complete Promoter Activity Mobile API Test\n";
        echo "=" . str_repeat("=", 60) . "\n\n";

        $testsPassed = 0;
        $totalTests = 7;

        // Test 1: Login
        if ($this->testLogin($loginCoords)) {
            $testsPassed++;
        }
        echo "\n";

        // Test 2: Upload login photo
        if ($this->testPhotoUpload('login', $loginCoords, 'Promoter starting work session')) {
            $testsPassed++;
        }
        echo "\n";

        // Test 3: Upload activity photos
        if ($this->testPhotoUpload('activity', $loginCoords, 'Engaging with visitors at Vivo Experience Studio')) {
            $testsPassed++;
        }
        echo "\n";

        // Test 4: Submit feedback with promoter tracking
        $feedbackId = $this->testFeedbackSubmission($feedbackData);
        if ($feedbackId) {
            $testsPassed++;
        }
        echo "\n";

        // Test 5: Upload logout photo
        if ($this->testPhotoUpload('logout', $logoutCoords, 'Completing work session')) {
            $testsPassed++;
        }
        echo "\n";

        // Test 6: Logout
        if ($this->testLogout($logoutCoords)) {
            $testsPassed++;
        }
        echo "\n";

        // Test 7: Get activity details
        if ($this->testGetActivity()) {
            $testsPassed++;
        }
        echo "\n";

        // Optional: Test admin dashboard (might fail due to auth)
        $this->testAdminDashboard();
        echo "\n";

        // Summary
        echo "🏁 Test Summary\n";
        echo "=" . str_repeat("=", 30) . "\n";
        echo "Tests Passed: {$testsPassed}/{$totalTests}\n";
        echo "Success Rate: " . round(($testsPassed / $totalTests) * 100, 1) . "%\n";

        if ($testsPassed === $totalTests) {
            echo "🎉 All tests passed! Mobile API is working correctly.\n";
        } else {
            echo "⚠️  Some tests failed. Please check the output above for details.\n";
        }

        return $testsPassed === $totalTests;
    }
}

// Run the tests
echo "Promoter Activity Mobile API Test Suite\n";
echo "======================================\n\n";

$tester = new PromoterActivityTester($baseUrl, $testPromoterId);
$success = $tester->runCompleteTest($loginCoords, $logoutCoords, $testFeedbackData);

exit($success ? 0 : 1);
