<?php

// Create test feedback via direct database insertion
$pdo = new PDO('sqlite:database/database.sqlite');

$sql = "INSERT INTO feedback (
    visitor_name, visitor_email, visitor_phone, visit_date, is_anonymous, allow_marketing_contact,
    subject, message, category, priority, status, form_type,
    overall_experience, favorite_section, preferred_model, souvenir_experience, suggestions,
    experience_rating, recommendation_likelihood, visit_frequency, feedback_type,
    improvement_suggestions, favorite_feature, created_at, updated_at
) VALUES (
    'John Smith', 'john.smith@example.com', '+1-555-123-4567', '2025-09-20', 0, 1,
    'Amazing Vivo Experience Studio Visit', 'I had an incredible time at the Vivo Experience Studio! The technology was impressive and the staff was very helpful.',
    'general', 'medium', 'open', 'vivo_experience',
    'excellent', 'macro_photography', 'vivo_x200_pro', 'yes', 'The experience was fantastic! Maybe add more interactive displays.',
    5, 5, 'first_time', 'positive',
    'Consider expanding the photography section.', 'The macro photography capabilities were outstanding!',
    datetime('now'), datetime('now')
)";

$result = $pdo->exec($sql);

if ($result) {
    $lastId = $pdo->lastInsertId();
    echo "✅ Test feedback created successfully with ID: $lastId\n";

    // Fetch and display the created record
    $stmt = $pdo->prepare("SELECT * FROM feedback WHERE id = ?");
    $stmt->execute([$lastId]);
    $feedback = $stmt->fetch(PDO::FETCH_ASSOC);

    echo "\n=== Created Feedback Record ===\n";
    echo "Contact Information:\n";
    echo "- Name: " . $feedback['visitor_name'] . "\n";
    echo "- Email: " . $feedback['visitor_email'] . "\n";
    echo "- Phone: " . $feedback['visitor_phone'] . "\n";
    echo "- Visit Date: " . $feedback['visit_date'] . "\n";

    echo "\nVivo Experience Details:\n";
    echo "- Overall Experience: " . $feedback['overall_experience'] . "\n";
    echo "- Favorite Section: " . $feedback['favorite_section'] . "\n";
    echo "- Preferred Model: " . $feedback['preferred_model'] . "\n";
    echo "- Souvenir Experience: " . $feedback['souvenir_experience'] . "\n";
    echo "- Experience Rating: " . $feedback['experience_rating'] . "/5\n";
    echo "- Recommendation Likelihood: " . $feedback['recommendation_likelihood'] . "/5\n";

    echo "\nFeedback Content:\n";
    echo "- Subject: " . $feedback['subject'] . "\n";
    echo "- Message: " . substr($feedback['message'], 0, 100) . "...\n";
    echo "- Suggestions: " . $feedback['suggestions'] . "\n";

    echo "\n✅ All fields are populated and should be visible in the admin panel!\n";
} else {
    echo "❌ Failed to create test feedback\n";
    print_r($pdo->errorInfo());
}

?>
