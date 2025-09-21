<?php

require_once 'vendor/autoload.php';

// Initialize Laravel
$app = require_once 'bootstrap/app.php';
$app->boot();

use App\Models\Feedback;
use App\Models\User;

echo "Testing Feedback Details Display\n";
echo "================================\n\n";

// Get or create an admin user for testing
$admin = User::where('email', 'admin@li-council.com')->first();
if (!$admin) {
    echo "Creating admin user...\n";
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@li-council.com',
        'password' => bcrypt('password123'),
        'role' => 'admin'
    ]);
}

// Create a comprehensive feedback test record
echo "Creating comprehensive feedback record...\n";

$feedback = Feedback::create([
    // Contact information
    'visitor_name' => 'John Smith',
    'visitor_email' => 'john.smith@example.com',
    'visitor_phone' => '+1-555-123-4567',
    'visit_date' => '2025-09-20',
    'is_anonymous' => false,
    'allow_marketing_contact' => true,

    // Basic feedback
    'subject' => 'Amazing Vivo Experience Studio Visit',
    'message' => 'I had an incredible time at the Vivo Experience Studio! The technology was impressive and the staff was very helpful.',
    'category' => 'general',
    'priority' => 'medium',
    'status' => 'open',
    'form_type' => 'vivo_experience',

    // Vivo Experience specific fields
    'overall_experience' => 'excellent',
    'favorite_section' => 'macro_photography',
    'preferred_model' => 'vivo_x200_pro',
    'souvenir_experience' => 'yes',
    'suggestions' => 'The experience was fantastic! Maybe add more interactive displays.',

    // Ratings
    'experience_rating' => 5,
    'recommendation_likelihood' => 5,

    // Additional fields
    'visit_frequency' => 'first_time',
    'feedback_type' => 'positive',
    'improvement_suggestions' => 'Consider expanding the photography section.',
    'favorite_feature' => 'The macro photography capabilities were outstanding!'
]);

echo "✅ Feedback record created with ID: {$feedback->id}\n\n";

// Display the feedback data as it would appear in the API
echo "Feedback data structure:\n";
echo "=======================\n";
echo json_encode($feedback->toArray(), JSON_PRETTY_PRINT);

echo "\n\n=== Key Fields for Display ===\n";
echo "Contact Information:\n";
echo "- Name: {$feedback->visitor_name}\n";
echo "- Email: {$feedback->visitor_email}\n";
echo "- Phone: {$feedback->visitor_phone}\n";
echo "- Visit Date: {$feedback->visit_date}\n";

echo "\nVivo Experience Details:\n";
echo "- Overall Experience: {$feedback->overall_experience}\n";
echo "- Favorite Section: {$feedback->favorite_section}\n";
echo "- Preferred Model: {$feedback->preferred_model}\n";
echo "- Souvenir Experience: {$feedback->souvenir_experience}\n";
echo "- Experience Rating: {$feedback->experience_rating}/5\n";
echo "- Recommendation Likelihood: {$feedback->recommendation_likelihood}/5\n";

echo "\nAdditional Information:\n";
echo "- Form Type: {$feedback->form_type}\n";
echo "- Category: {$feedback->category}\n";
echo "- Priority: {$feedback->priority}\n";
echo "- Status: {$feedback->status}\n";
echo "- Anonymous: " . ($feedback->is_anonymous ? 'Yes' : 'No') . "\n";
echo "- Marketing Contact: " . ($feedback->allow_marketing_contact ? 'Allowed' : 'Not Allowed') . "\n";

echo "\n✅ Test feedback record created successfully!\n";
echo "✅ All fields should now be visible in the admin panel.\n";

?>
