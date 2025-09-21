<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Promoter;
use App\Models\PromoterActivity;
use App\Models\PromoterActivityPhoto;
use Carbon\Carbon;

class PromoterActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "🚀 Creating dummy promoter activity data...\n";

        // Get existing promoters or create some
        $promoters = Promoter::all();

        if ($promoters->isEmpty()) {
            echo "📝 Creating sample promoters...\n";

            $samplePromoters = [
                ['name' => 'Rajesh Kumar', 'username' => 'rajesh_mumbai', 'state' => 'Maharashtra', 'district' => 'Mumbai'],
                ['name' => 'Priya Sharma', 'username' => 'priya_delhi', 'state' => 'Delhi', 'district' => 'New Delhi'],
                ['name' => 'Amit Singh', 'username' => 'amit_bangalore', 'state' => 'Karnataka', 'district' => 'Bangalore'],
                ['name' => 'Sneha Patel', 'username' => 'sneha_ahmedabad', 'state' => 'Gujarat', 'district' => 'Ahmedabad'],
                ['name' => 'Vikram Gupta', 'username' => 'vikram_pune', 'state' => 'Maharashtra', 'district' => 'Pune'],
                ['name' => 'Kavitha Reddy', 'username' => 'kavitha_hyderabad', 'state' => 'Telangana', 'district' => 'Hyderabad'],
                ['name' => 'Rohit Jain', 'username' => 'rohit_jaipur', 'state' => 'Rajasthan', 'district' => 'Jaipur'],
                ['name' => 'Anita Das', 'username' => 'anita_kolkata', 'state' => 'West Bengal', 'district' => 'Kolkata'],
            ];

            foreach ($samplePromoters as $promoterData) {
                Promoter::create($promoterData);
            }

            $promoters = Promoter::all();
            echo "✅ Created " . $promoters->count() . " promoters\n";
        }

        echo "📊 Found " . $promoters->count() . " promoters\n";

        $activitiesCreated = 0;
        $photosCreated = 0;

        // Create activities for the last 14 days
        foreach ($promoters as $promoter) {
            // Create 5-8 activity days for each promoter
            for ($day = 0; $day < rand(5, 8); $day++) {
                $activityDate = Carbon::now()->subDays($day);

                // Skip some days randomly (not all promoters work every day)
                if (rand(0, 10) < 3) continue;

                // Random login time between 9 AM - 11 AM
                $loginHour = rand(9, 11);
                $loginMinute = rand(0, 59);
                $loginTime = $activityDate->copy()->setHour($loginHour)->setMinute($loginMinute);

                // Random logout time between 5 PM - 8 PM (or null for ongoing activities)
                $logoutTime = null;
                $status = 'logged_in';

                // For past days or 70% chance for today, set logout time
                if ($day > 0 || rand(0, 10) < 7) {
                    $workHours = rand(6, 9);
                    $extraMinutes = rand(0, 59);
                    $logoutTime = $loginTime->copy()->addHours($workHours)->addMinutes($extraMinutes);
                    $status = 'logged_out';
                }

                // Random coordinates for different Indian cities
                $locations = [
                    ['lat' => 19.0760, 'lng' => 72.8777, 'name' => 'Mumbai'],
                    ['lat' => 28.7041, 'lng' => 77.1025, 'name' => 'Delhi'],
                    ['lat' => 12.9716, 'lng' => 77.5946, 'name' => 'Bangalore'],
                    ['lat' => 23.0225, 'lng' => 72.5714, 'name' => 'Ahmedabad'],
                    ['lat' => 18.5204, 'lng' => 73.8567, 'name' => 'Pune'],
                    ['lat' => 17.3850, 'lng' => 78.4867, 'name' => 'Hyderabad'],
                    ['lat' => 26.9124, 'lng' => 75.7873, 'name' => 'Jaipur'],
                    ['lat' => 22.5726, 'lng' => 88.3639, 'name' => 'Kolkata'],
                ];

                $location = $locations[array_rand($locations)];
                $loginLat = $location['lat'] + (rand(-100, 100) / 10000); // Small variation
                $loginLng = $location['lng'] + (rand(-100, 100) / 10000);

                $activity = PromoterActivity::create([
                    'promoter_id' => $promoter->id,
                    'activity_date' => $activityDate->format('Y-m-d'),
                    'login_time' => $loginTime,
                    'logout_time' => $logoutTime,
                    'status' => $status,
                    'login_latitude' => $loginLat,
                    'login_longitude' => $loginLng,
                    'logout_latitude' => $logoutTime ? $loginLat + (rand(-20, 20) / 1000) : null,
                    'logout_longitude' => $logoutTime ? $loginLng + (rand(-20, 20) / 1000) : null,
                    'total_photos_captured' => rand(8, 25),
                    'total_feedback_captured' => rand(3, 12),
                    'activity_notes' => $this->generateActivityNotes($location['name']),
                    'is_synced' => true,
                    'last_sync_time' => $loginTime->copy()->addMinutes(rand(30, 180)),
                ]);

                $activitiesCreated++;

                // Create sample photos for this activity
                $photoCount = rand(6, 15);
                $photoTypes = ['login', 'activity', 'activity', 'activity', 'activity', 'logout'];

                for ($i = 0; $i < $photoCount; $i++) {
                    $photoType = 'activity';
                    if ($i === 0) $photoType = 'login';
                    if ($i === $photoCount - 1 && $logoutTime) $photoType = 'logout';

                    // Random time during the activity
                    $photoTime = $loginTime->copy()->addMinutes(rand(10, $logoutTime ? $logoutTime->diffInMinutes($loginTime) - 10 : 300));

                    PromoterActivityPhoto::create([
                        'promoter_activity_id' => $activity->id,
                        'photo_type' => $photoType,
                        'file_path' => "storage/promoter_photos/dummy/{$activity->id}/photo_{$i}.jpg",
                        'file_name' => "activity_{$activity->id}_photo_{$i}.jpg",
                        'mime_type' => 'image/jpeg',
                        'file_size' => rand(800000, 3500000), // 800KB - 3.5MB
                        'latitude' => $loginLat + (rand(-100, 100) / 10000),
                        'longitude' => $loginLng + (rand(-100, 100) / 10000),
                        'captured_at' => $photoTime,
                        'description' => $this->generatePhotoDescription($photoType, $i + 1),
                        'is_synced' => true,
                        'synced_at' => $photoTime->addMinutes(rand(2, 15)),
                    ]);

                    $photosCreated++;
                }
            }
        }

        echo "\n✅ Successfully created dummy data:\n";
        echo "   📅 Activities: {$activitiesCreated}\n";
        echo "   📸 Photos: {$photosCreated}\n";

        // Show final summary
        $totalActivities = PromoterActivity::count();
        $totalPhotos = PromoterActivityPhoto::count();
        $activePromoters = PromoterActivity::distinct('promoter_id')->count('promoter_id');

        echo "\n📊 Total Database Stats:\n";
        echo "   • Total Activities: {$totalActivities}\n";
        echo "   • Total Photos: {$totalPhotos}\n";
        echo "   • Active Promoters: {$activePromoters}\n";
        echo "\n🎯 Dummy data creation completed!\n";
    }

    private function generateActivityNotes($location): string
    {
        $activities = [
            "Visited multiple retail stores in {$location}",
            "Conducted product demonstrations at {$location} shopping centers",
            "Engaged with customers at various outlets in {$location}",
            "Completed brand activation activities in {$location}",
            "Organized promotional events in {$location} area",
            "Collected customer feedback from {$location} stores",
            "Conducted training sessions for retail staff in {$location}",
        ];

        $details = [
            "Good customer response and engagement.",
            "Successfully demonstrated product features.",
            "Collected valuable customer insights.",
            "Positive feedback from store managers.",
            "Achieved target customer interactions.",
            "Effective brand visibility achieved.",
            "Strong collaboration with retail partners.",
        ];

        return $activities[array_rand($activities)] . " " . $details[array_rand($details)];
    }

    private function generatePhotoDescription($type, $index): string
    {
        switch ($type) {
            case 'login':
                return "Check-in photo at start of day";
            case 'logout':
                return "Check-out photo at end of day";
            default:
                $descriptions = [
                    "Product display setup photo #{$index}",
                    "Customer interaction photo #{$index}",
                    "Store visit documentation #{$index}",
                    "Brand promotional activity #{$index}",
                    "Product demonstration photo #{$index}",
                    "Customer feedback collection #{$index}",
                    "Retail partner meeting #{$index}",
                ];
                return $descriptions[array_rand($descriptions)];
        }
    }
}
