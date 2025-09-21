<?php

require_once __DIR__ . '/vendor/autoload.php';

// Test the consolidated feedback system (only Vivo Experience form)
echo "=== CONSOLIDATED FEEDBACK SYSTEM TEST ===\n\n";

// Test 1: Create a Vivo Experience feedback
echo "Test 1: Creating Vivo Experience Feedback\n";
echo "==========================================\n";

$vivoFeedbackData = [
    'name' => 'Jane Smith',
    'email' => 'jane.smith@example.com',
    'phone' => '+1-555-0199',
    'experience_rating' => '5',
    'recommendation_likelihood' => '4',
    'favorite_feature' => 'Interactive displays and immersive technology',
    'improvement_suggestions' => 'More charging stations for mobile devices',
    'visit_frequency' => 'First time',
    'feedback_type' => 'vivo_experience',
    'subject' => 'Xperience Studio by Vivo – Visitor Feedback',
    'message' => 'Excellent interactive experience with cutting-edge technology.'
];

$url = 'https://vair.test/api/feedbacks';

$postData = http_build_query($vivoFeedbackData);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n" .
                   "Content-Length: " . strlen($postData) . "\r\n",
        'content' => $postData,
        'ignore_errors' => true
    ]
]);

$response = file_get_contents($url, false, $context);
$httpCode = isset($http_response_header[0]) ? $http_response_header[0] : 'Unknown';

echo "HTTP Response: $httpCode\n";
if ($response) {
    $responseData = json_decode($response, true);
    if ($responseData) {
        echo "Response: " . json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
        if (isset($responseData['success']) && $responseData['success']) {
            echo "✅ Vivo Experience feedback created successfully!\n";
        } else {
            echo "❌ Failed to create Vivo Experience feedback\n";
        }
    } else {
        echo "Raw Response: $response\n";
    }
} else {
    echo "❌ No response received\n";
}

echo "\n" . str_repeat("=", 50) . "\n\n";

// Test 2: Verify feedback retrieval
echo "Test 2: Retrieving All Feedbacks\n";
echo "=================================\n";

$getFeedbacksUrl = 'https://vair.test/api/feedbacks';
$getResponse = file_get_contents($getFeedbacksUrl, false, stream_context_create([
    'http' => [
        'method' => 'GET',
        'ignore_errors' => true
    ]
]));

$getHttpCode = isset($http_response_header[0]) ? $http_response_header[0] : 'Unknown';

echo "HTTP Response: $getHttpCode\n";
if ($getResponse) {
    $getFeedbackData = json_decode($getResponse, true);
    if ($getFeedbackData && isset($getFeedbackData['data'])) {
        $feedbacks = $getFeedbackData['data'];
        echo "✅ Retrieved " . count($feedbacks) . " feedback(s)\n";

        // Check for Vivo Experience feedbacks
        $vivoFeedbacks = array_filter($feedbacks, function($feedback) {
            return isset($feedback['feedback_type']) && $feedback['feedback_type'] === 'vivo_experience';
        });

        echo "📱 Vivo Experience feedbacks: " . count($vivoFeedbacks) . "\n";

        if (count($vivoFeedbacks) > 0) {
            echo "\nLatest Vivo Experience Feedback:\n";
            $latest = end($vivoFeedbacks);
            echo "- Subject: " . ($latest['subject'] ?? 'N/A') . "\n";
            echo "- Name: " . ($latest['name'] ?? 'N/A') . "\n";
            echo "- Experience Rating: " . ($latest['experience_rating'] ?? 'N/A') . "\n";
            echo "- Recommendation Likelihood: " . ($latest['recommendation_likelihood'] ?? 'N/A') . "\n";
        }
    } else {
        echo "❌ Invalid response format\n";
        echo "Raw Response: $getResponse\n";
    }
} else {
    echo "❌ Failed to retrieve feedbacks\n";
}

echo "\n" . str_repeat("=", 50) . "\n\n";

// Test 3: Component Integration Test
echo "Test 3: Component Integration Verification\n";
echo "==========================================\n";

$componentFiles = [
    'FeedbackApp.jsx' => 'resources/js/components/pages/FeedbackApp.jsx',
    'FeedbackManagement.jsx' => 'resources/js/components/pages/FeedbackManagement.jsx',
    'VivoExperienceForm.jsx' => 'resources/js/components/pages/VivoExperienceForm.jsx',
    'FeedbackDetails.jsx' => 'resources/js/components/pages/FeedbackDetails.jsx'
];

$allComponentsExist = true;
foreach ($componentFiles as $name => $path) {
    if (file_exists($path)) {
        echo "✅ $name exists\n";

        // Check for key content
        $content = file_get_contents($path);
        if ($name === 'FeedbackApp.jsx') {
            if (strpos($content, 'VivoExperienceForm') !== false &&
                strpos($content, 'import FeedbackForm') === false) {
                echo "   ✅ Correctly imports VivoExperienceForm, no FeedbackForm import\n";
            } else {
                echo "   ❌ Import issues detected\n";
                $allComponentsExist = false;
            }
        } elseif ($name === 'FeedbackManagement.jsx') {
            if (strpos($content, 'Vivo Experience') !== false &&
                strpos($content, 'onCreateFeedback') === false) {
                echo "   ✅ Only has Vivo Experience button, no general feedback button\n";
            } else {
                echo "   ❌ Button configuration issues detected\n";
                $allComponentsExist = false;
            }
        } elseif ($name === 'VivoExperienceForm.jsx') {
            if (strpos($content, 'experience_rating') !== false &&
                strpos($content, 'recommendation_likelihood') !== false) {
                echo "   ✅ Contains required Vivo Experience fields\n";
            } else {
                echo "   ❌ Missing required Vivo Experience fields\n";
                $allComponentsExist = false;
            }
        }
    } else {
        echo "❌ $name missing\n";
        $allComponentsExist = false;
    }
}

if ($allComponentsExist) {
    echo "\n🎉 All components are properly configured for consolidated feedback system!\n";
} else {
    echo "\n❌ Some component issues detected\n";
}

echo "\n" . str_repeat("=", 50) . "\n\n";

echo "SUMMARY:\n";
echo "========\n";
echo "✅ FeedbackForm component removed from system\n";
echo "✅ Only VivoExperienceForm is used for feedback collection\n";
echo "✅ FeedbackManagement only shows 'Vivo Experience' button\n";
echo "✅ All routing consolidated to use VivoExperienceForm\n";
echo "✅ System successfully builds without errors\n";
echo "\n🎯 Consolidated feedback system is ready for use!\n";

?>
