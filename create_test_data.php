<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Creating test data...\n";

// Get first promoter
$promoter = \App\Models\Promoter::first();
if ($promoter) {
    echo 'Using Promoter: '.$promoter->name."\n";

    // Create multiple activity recces with correct schema
    $activities = [
        [
            'visit_date' => now()->addDays(1)->format('Y-m-d'),
            'visit_time' => '10:30:00',
            'promoter_id' => $promoter->id,
            'state' => 'Maharashtra',
            'district' => 'Mumbai',
            'sub_district' => 'Andheri',
            'village' => 'Andheri East',
            'village_code' => 'MH_MUM_AND_001',
            'location' => 'Shopping Mall - Andheri East',
            'latitude' => 19.1136,
            'longitude' => 72.8697,
            'promoter_remarks' => 'Market survey for new product launch',
            'status' => 'pending',
        ],
        [
            'visit_date' => now()->addDays(2)->format('Y-m-d'),
            'visit_time' => '14:00:00',
            'promoter_id' => $promoter->id,
            'state' => 'Maharashtra',
            'district' => 'Mumbai',
            'sub_district' => 'Bandra',
            'village' => 'Bandra West',
            'village_code' => 'MH_MUM_BAN_001',
            'location' => 'Retail Store - Linking Road',
            'latitude' => 19.0544,
            'longitude' => 72.8186,
            'promoter_remarks' => 'Brand activation activity',
            'status' => 'approved',
        ],
    ];

    foreach ($activities as $index => $activityData) {
        $activity = \App\Models\ActivityRecce::create($activityData);
        echo 'Activity Recce '.($index + 1).' created: ID '.$activity->id."\n";
    }

    echo "Test data created successfully!\n";
} else {
    echo "No promoter found!\n";
}

echo "Test data created successfully!\n";
