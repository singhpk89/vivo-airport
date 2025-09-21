<?php

require_once 'vendor/autoload.php';

use App\Models\Feedback;

// Get a feedback record to see its structure
$feedback = Feedback::first();

if ($feedback) {
    echo "Feedback fields available:\n";
    echo "=========================\n";

    $fields = $feedback->getAttributes();
    foreach ($fields as $key => $value) {
        echo sprintf("%-25s: %s\n", $key, is_null($value) ? 'NULL' : (is_string($value) ? substr($value, 0, 50) . (strlen($value) > 50 ? '...' : '') : $value));
    }

    echo "\nJSON representation:\n";
    echo "===================\n";
    echo json_encode($feedback->toArray(), JSON_PRETTY_PRINT);

} else {
    echo "No feedback records found.\n";
    echo "Creating test data...\n";

    $feedback = Feedback::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '1234567890',
        'subject' => 'Test Subject',
        'message' => 'Test message content',
        'vivo_q1_rating' => 5,
        'vivo_q2_favorite' => 'Aircraft Display',
        'vivo_q3_model' => 'Boeing 747',
        'vivo_q4_souvenir_rating' => 4,
        'vivo_q5_suggestions' => 'Great experience, would recommend!',
        'category' => 'general',
        'rating' => 5,
        'status' => 'pending'
    ]);

    echo "Test feedback created with ID: " . $feedback->id . "\n";
    echo json_encode($feedback->toArray(), JSON_PRETTY_PRINT);
}

?>
