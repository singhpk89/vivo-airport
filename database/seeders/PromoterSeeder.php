<?php

namespace Database\Seeders;

use App\Models\ActivityRecce;
use App\Models\Promoter;
use App\Models\RoutePlan;
use Illuminate\Database\Seeder;

class PromoterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample promoters
        $promoters = [
            [
                'name' => 'John Doe',
                'username' => 'john_doe',
                'email' => 'john@promoter.com',
                'phone' => '1234567890',
                'password' => bcrypt('password'),
                'employee_id' => 'EMP001',
                'state' => 'Maharashtra',
                'district' => 'Mumbai',
                'address' => '123 Main St, Mumbai',
                'status' => 'active',
                'is_active' => true,
            ],
            [
                'name' => 'Jane Smith',
                'username' => 'jane_smith',
                'email' => 'jane@promoter.com',
                'phone' => '0987654321',
                'password' => bcrypt('password'),
                'employee_id' => 'EMP002',
                'state' => 'Gujarat',
                'district' => 'Ahmedabad',
                'address' => '456 Oak Ave, Ahmedabad',
                'status' => 'active',
                'is_active' => true,
            ],
            [
                'name' => 'Mike Johnson',
                'username' => 'mike_johnson',
                'email' => 'mike@promoter.com',
                'phone' => '5555555555',
                'password' => bcrypt('password'),
                'employee_id' => 'EMP003',
                'state' => 'Karnataka',
                'district' => 'Bangalore',
                'address' => '789 Pine Rd, Bangalore',
                'status' => 'inactive',
                'is_active' => false,
            ],
            [
                'name' => 'Sarah Wilson',
                'username' => 'sarah_wilson',
                'email' => 'sarah@promoter.com',
                'phone' => '7777777777',
                'password' => bcrypt('password'),
                'employee_id' => 'EMP004',
                'state' => 'Tamil Nadu',
                'district' => 'Chennai',
                'address' => '101 Beach Rd, Chennai',
                'status' => 'pending',
                'is_active' => true,
                'app_version' => '1.2.0',
                'is_logged_in' => true,
                'last_active' => now()->subHours(2),
            ],
            [
                'name' => 'David Brown',
                'username' => 'david_brown',
                'email' => 'david@promoter.com',
                'phone' => '8888888888',
                'password' => bcrypt('password'),
                'employee_id' => 'EMP005',
                'state' => 'Rajasthan',
                'district' => 'Jaipur',
                'address' => '202 Palace St, Jaipur',
                'status' => 'suspended',
                'is_active' => false,
                'app_version' => '1.0.0',
                'last_active' => now()->subDays(5),
            ],
        ];

        foreach ($promoters as $promoterData) {
            Promoter::create($promoterData);
        }

        // Create sample route plans
        $routePlans = [
            [
                'state' => 'Maharashtra',
                'district' => 'Mumbai',
                'sub_district' => 'Andheri',
                'village' => 'Andheri East',
                'village_code' => 'MH_MUM_AND_001',
                'description' => 'Covers central Mumbai area including commercial districts',
                'latitude' => 19.1136,
                'longitude' => 72.8697,
                'is_active' => true,
            ],
            [
                'state' => 'Delhi',
                'district' => 'New Delhi',
                'sub_district' => 'Connaught Place',
                'village' => 'CP Block',
                'village_code' => 'DL_ND_CP_001',
                'description' => 'National Capital Region including commercial areas',
                'latitude' => 28.6315,
                'longitude' => 77.2167,
                'is_active' => true,
            ],
            [
                'state' => 'Karnataka',
                'district' => 'Bangalore Urban',
                'sub_district' => 'Whitefield',
                'village' => 'ITPL',
                'village_code' => 'KA_BLR_WF_001',
                'description' => 'Technology corridor and startup hubs',
                'latitude' => 12.9698,
                'longitude' => 77.7500,
                'is_active' => true,
            ],
        ];

        foreach ($routePlans as $routeData) {
            RoutePlan::create($routeData);
        }

        // Create sample activity recces
        $promoters = Promoter::all();
        $activityTypes = ['Product Launch', 'Brand Activation', 'Market Survey', 'Competition Analysis', 'Customer Feedback'];

        foreach ($promoters->take(2) as $promoter) {
            foreach ($activityTypes as $index => $activityType) {
                ActivityRecce::create([
                    'promoter_id' => $promoter->id,
                    'activity_type' => $activityType,
                    'location' => $promoter->address,
                    'scheduled_date' => now()->addDays($index + 1),
                    'description' => "Sample $activityType activity for field research",
                    'status' => $index < 2 ? 'completed' : 'pending',
                    'completion_notes' => $index < 2 ? 'Activity completed successfully with good response' : null,
                    'completed_at' => $index < 2 ? now()->subDays(rand(1, 5)) : null,
                ]);
            }
        }

        $this->command->info('Promoter system sample data created successfully!');
    }
}
